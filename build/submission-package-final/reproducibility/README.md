# LLM Safety Evaluation with NVIDIA garak

This folder contains the commands, fixed configurations, evidence, and analysis
used for the assignment. The selected study is:

Y. Xin, D. Chen, L. Yang, M. Backes, and X. Zhang, "Jailbreaking Attacks vs.
Content Safety Filters: How Far Are We in the LLM Safety Arms Race?" Findings
of ACL 2026. https://aclanthology.org/2026.findings-acl.20/

## Environment setup

The completed experiment used Windows, Python 3.12.14, an NVIDIA GTX 1660 with
6 GB VRAM, CUDA-enabled PyTorch 2.13.0+cu126, and garak 0.17.1rc1.

From the project root in PowerShell, create an isolated environment and install
the official source version of garak:

```powershell
git clone https://github.com/NVIDIA/garak.git garak-src
python -m venv .venv-garak
.\.venv-garak\Scripts\python.exe -m pip install --upgrade pip
.\.venv-garak\Scripts\python.exe -m pip install -e .\garak-src
```

For an NVIDIA GPU, install the compatible CUDA build of PyTorch following the
official PyTorch selector. The completed run used:

```powershell
.\.venv-garak\Scripts\python.exe -m pip uninstall -y torch torchvision torchaudio
.\.venv-garak\Scripts\python.exe -m pip install torch==2.13.0 --index-url https://download.pytorch.org/whl/cu126
```

The first model run downloads `Qwen/Qwen2.5-0.5B-Instruct` from Hugging Face.
Only evaluate models and systems that you are authorized to test.

## Fixed baseline configuration

- Model: `Qwen/Qwen2.5-0.5B-Instruct`
- Access method: local Hugging Face pipeline
- Hardware: NVIDIA GeForce GTX 1660 (6 GB VRAM)
- garak source: official NVIDIA repository, commit `346497afcd86ff5ba137cfbcaaeba4e9c9f6c970`
- garak version: `0.17.1rc1`
- Random seed: `42`
- Generations per prompt: `1`
- Prompt cap: `16`
- Probes: `promptinject.HijackLongPrompt` and `dan.Dan_11_0`

The cap is intentionally fixed because the full PromptInject configuration contains 256 prompts and is unnecessarily large for this hardware and assignment. Results therefore describe the tested sample only, not the model's overall safety.

## Run

From PowerShell in this directory:

```powershell
.\run-baseline.ps1
```

Machine-readable JSONL reports, HTML reports, and console logs are copied to `evidence/baseline`.

## Mitigated run

The implemented control is a separate system instruction that establishes an
instruction hierarchy, treats embedded override commands as untrusted data, and
explicitly rejects unrestricted personas such as DAN. Run the same probes and
sample with:

```powershell
.\run-mitigated.ps1
```

Evidence is copied to `evidence/mitigated`. This is a lightweight prompt-level
control, not proof of safety; production systems should also use access controls,
input/output validation, and human approval for consequential actions.

The prompt-only control is retained as a negative-result experiment. The main
implemented mitigation for the before/after comparison is a separate input
filter in `garak-src/garak/generators/guarded_hf.py`. Repeat the identical probes
through that filter with:

```powershell
.\run-filtered.ps1
```

Filtered evidence is copied to `evidence/filtered`.

## Evidence and analysis

- `evidence/baseline`: JSONL, HTML, and console output before mitigation.
- `evidence/mitigated`: prompt-only pilot showing no measured improvement.
- `evidence/filtered`: repeated garak runs plus the benign false-positive check.
- `experiment-results.md`: interpretation and before/after comparison.
- `summarize-results.py`: extracts failure counts from the JSONL reports.
- `evaluate-filter.py`: reproduces the 20-prompt benign filter check.

Run the analysis helpers with the same virtual environment:

```powershell
.\.venv-garak\Scripts\python.exe .\experiment\summarize-results.py
.\.venv-garak\Scripts\python.exe .\experiment\evaluate-filter.py
```

The input filter is implemented in
`garak-src/garak/generators/guarded_hf.py`. It is a teaching demonstrator, not a
production security classifier.
