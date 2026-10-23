"""Print a compact comparison from garak JSONL evidence files."""

import json
from pathlib import Path


EVIDENCE_ROOT = Path(__file__).resolve().parent / "evidence"


def evaluations(report_path: Path):
    for line in report_path.read_text(encoding="utf-8").splitlines():
        row = json.loads(line)
        if row.get("entry_type") == "eval":
            yield row


print("run,probe,detector,failures,total,attack_success_rate")
for run_name in ("baseline", "mitigated", "filtered"):
    for report_path in sorted((EVIDENCE_ROOT / run_name).glob("*.report.jsonl")):
        for row in evaluations(report_path):
            rate = row["fails"] / row["total_evaluated"]
            print(
                f'{run_name},{row["probe"]},{row["detector"]},'
                f'{row["fails"]},{row["total_evaluated"]},{rate:.2%}'
            )

