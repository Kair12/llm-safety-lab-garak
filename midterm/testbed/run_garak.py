"""Run two official garak probes against the live prototype."""

import argparse

from . import settings


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("baseline", "filtered"))
    args = parser.parse_args()
    from garak.cli import main as garak_main
    output = settings.ROOT / "evidence" / "garak"
    output.mkdir(parents=True, exist_ok=True)
    prefix = output / args.mode
    if prefix.with_suffix(".report.jsonl").exists():
        raise FileExistsError("Preserve the existing garak report before starting a fresh run")
    garak_main([
        "--config", str(settings.ROOT / "configs" / f"{args.mode}.yaml"),
        "--target_type", "function.Single",
        "--target_name", "testbed.garak_adapter#generate",
        "--spec", "probes.promptinject.HijackLongPrompt,probes.dan.Dan_11_0",
        "--report_prefix", str(prefix),
    ])


if __name__ == "__main__":
    main()
