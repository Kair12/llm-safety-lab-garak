"""Package the prototype and measured evidence without model caches or builds."""

import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "deliverables"
SOURCE_DIRS = ("testbed", "tests", "web", "configs", "telegram-bot")
SOURCE_FILES = ("README.md", "requirements.txt", "Setup.ps1", "Start-Demo.ps1", "Run-Experiments.ps1", "STUDENT_REVIEW_RU.md")


def sources():
    result = [ROOT / name for name in SOURCE_FILES]
    for folder in SOURCE_DIRS:
        result.extend(
            p for p in (ROOT / folder).rglob("*")
            if p.is_file()
            and "__pycache__" not in p.parts
            and "runtime" not in p.parts
            and p.name != ".env"
        )
    return sorted(result)


def main():
    files = sources()
    evidence = sorted(p for p in (ROOT / "evidence").rglob("*") if p.is_file() and p.name != "file-checksums.json")
    checksums = {
        str(p.relative_to(ROOT)).replace("\\", "/"): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in files + evidence
    }
    checksum_path = ROOT / "evidence" / "file-checksums.json"
    checksum_path.write_text(json.dumps(checksums, indent=2), encoding="utf-8")
    source_zip = OUT / "Midterm_Source.zip"
    full_zip = OUT / "Midterm_Complete_Package.zip"
    for path in (source_zip, full_zip):
        if path.exists():
            raise FileExistsError(f"Preserve the existing package first: {path}")
    with zipfile.ZipFile(source_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for file in files:
            archive.write(file, str(file.relative_to(ROOT)))
    with zipfile.ZipFile(full_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for file in files:
            archive.write(file, "prototype/" + str(file.relative_to(ROOT)))
        for file in evidence + [checksum_path]:
            archive.write(file, str(file.relative_to(ROOT)))
        for file in (OUT / "Midterm_Research_Report.pdf", OUT / "Midterm_Presentation.pptx"):
            archive.write(file, "documents/" + file.name)
        for file in (ROOT / "authoring").glob("build_*"):
            archive.write(file, "document_sources/" + file.name)
        archive.write(ROOT / "assets" / "cover.png", "document_sources/cover.png")
    for path in (source_zip, full_zip):
        with zipfile.ZipFile(path) as archive:
            assert archive.testzip() is None
            assert not any("node_modules" in name or ".venv" in name or ".model-cache" in name for name in archive.namelist())
            assert not any(name.endswith("/.env") or name == ".env" for name in archive.namelist())
            print(f"{path.name}: {len(archive.namelist())} entries, {path.stat().st_size:,} bytes, archive integrity OK")


if __name__ == "__main__":
    main()
