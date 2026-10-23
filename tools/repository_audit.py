"""Check staged publication files without printing credential values.

Uses the Git index as its input. It does not modify project source or credentials.
ZIP, PPTX and DOCX entries are checked recursively for accidentally packaged
credentials. Downloaded packages and model weights must be excluded by Git.
"""

import argparse
import io
import json
import re
import subprocess
import zipfile
from pathlib import Path, PurePosixPath


LIMIT = 100 * 1024 * 1024
PATTERNS = (
    ("Telegram bot token", re.compile(rb"(?<![A-Za-z0-9])\d{8,12}:[A-Za-z0-9_-]{30,50}(?![A-Za-z0-9_-])")),
    ("OpenAI-style API credential", re.compile(rb"\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}")),
    ("GitHub credential", re.compile(rb"\bgh[pousr]_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{30,}")),
    ("private key", re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
)


def local_secret_values(root):
    values = []
    token_file = root / "midterm" / "telegram-bot" / ".env"
    if token_file.is_file():
        for line in token_file.read_text(encoding="utf-8-sig").splitlines():
            if "=" not in line or line.lstrip().startswith("#"):
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip("\"'")
            if ("TOKEN" in key or "SECRET" in key or "KEY" in key) and len(value) >= 20:
                values.extend((value.encode("utf-8"), value.encode("utf-16-le")))
    return values


def scan_blob(label, blob, known_values, findings, depth=0):
    for kind, pattern in PATTERNS:
        if pattern.search(blob):
            findings.append({"path": label, "reason": kind})
    if any(value in blob for value in known_values):
        findings.append({"path": label, "reason": "exact match to a local credential"})
    if depth > 3 or not zipfile.is_zipfile(io.BytesIO(blob)):
        return
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        for member in archive.infolist():
            if member.is_dir():
                continue
            inner = PurePosixPath(member.filename)
            entry_label = f"{label}!{member.filename}"
            if inner.name == ".env" or any(p in (".git", "node_modules", ".venv", ".venv-garak") for p in inner.parts):
                findings.append({"path": entry_label, "reason": "private or dependency file inside an archive"})
            if member.file_size > LIMIT:
                findings.append({"path": entry_label, "reason": "oversized archive member"})
                continue
            scan_blob(entry_label, archive.read(member), known_values, findings, depth + 1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    git = ["git", "-c", f"safe.directory={root.as_posix()}", "-C", str(root)]
    raw = subprocess.check_output([*git, "ls-files", "--stage", "-z"])
    known_values = local_secret_values(root)
    findings = []
    files = []
    submodules = []
    staged = []
    for record in raw.split(b"\0"):
        if not record:
            continue
        metadata, raw_path = record.split(b"\t", 1)
        mode, object_id, stage = metadata.split(b" ")
        relative = raw_path.decode("utf-8")
        if mode == b"160000":
            submodules.append(relative)
            continue
        if stage != b"0":
            findings.append({"path": relative, "reason": "unresolved merge stage"})
            continue
        staged.append((relative, object_id))
    batch = subprocess.check_output(
        [*git, "cat-file", "--batch"],
        input=b"\n".join(object_id for _, object_id in staged) + b"\n",
    ) if staged else b""
    reader = io.BytesIO(batch)
    for relative, object_id in staged:
        header = reader.readline().split()
        if len(header) != 3 or header[0] != object_id or header[1] != b"blob":
            raise RuntimeError("Unable to inspect a staged Git object")
        size = int(header[2])
        blob = reader.read(size)
        if len(blob) != size or reader.read(1) != b"\n":
            raise RuntimeError("Truncated staged Git object")
        files.append({"path": relative, "bytes": size})
        if PurePosixPath(relative).name == ".env":
            findings.append({"path": relative, "reason": "local credentials staged"})
        if size > LIMIT:
            findings.append({"path": relative, "reason": "exceeds GitHub's 100 MiB file limit"})
            continue
        scan_blob(relative, blob, known_values, findings)
    report = {"file_count": len(files), "total_bytes": sum(f["bytes"] for f in files),
              "submodules": submodules, "findings": findings,
              "largest_files": sorted(files, key=lambda f: f["bytes"], reverse=True)[:12]}
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    raise SystemExit(1 if findings else 0)


if __name__ == "__main__":
    main()
