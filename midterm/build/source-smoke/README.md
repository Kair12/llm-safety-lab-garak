# LLM Safety Lab Midterm

A functioning local LLM application and paired safety evaluation for AISRA1301.
The selected paper is Yuan Xin, Dingfan Chen, Linyi Yang, Michael Backes and
Xiao Zhang, *Jailbreaking Attacks vs. Content Safety Filters: How Far Are We in
the LLM Safety Arms Race?*, Findings of ACL 2026, pp. 421-445.
DOI: https://doi.org/10.18653/v1/2026.findings-acl.20

## Purpose and contribution

Evaluate an input filter together with the deployed model, following the paper's
pipeline-level evaluation idea. The prototype accepts text and displays the
answer or a filter refusal, matched rules, elapsed time, and output tokens.
The extension adds a fixed set of paraphrased, encoded, obfuscated and multilingual
attack variants, benign security questions, classification metrics, and strict
paired-input checks. It is a small adaptation, not a reproduction of the paper's
large-scale harmful-content benchmark or a new moderation algorithm.

## Start on this computer

The working virtual environment and pinned model weights are already present
in the parent project. In PowerShell:

```powershell
cd 'C:\Users\nacha\Downloads\LAB 4 AI\midterm'
.\Start-Demo.ps1
```

Wait for `Model ready`, then open http://127.0.0.1:8765 . The service binds only
to the loopback interface. Stop it with Ctrl+C. It makes no model API requests.

## Install a portable copy

Use Python 3.12 and Git. On a compatible NVIDIA system:

```powershell
.\Setup.ps1 -PythonPath 'C:\path\to\python.exe' -Cuda
.\Start-Demo.ps1
```

Without `-Cuda`, PyTorch can run on CPU, with higher latency. The first launch
downloads the pinned Qwen weights from Hugging Face. Weights and virtual
environments are deliberately excluded from the ZIP. The CUDA build used here
was PyTorch 2.13.0+cu126. CUDA compatibility depends on the local GPU driver.

## Architecture

The browser sends JSON to `/evaluate`. The HTTP handler calls `LocalEngine`.
In baseline mode, text reaches the model directly. In filtered mode, four frozen
lexical rules first decide whether to reject it. Allowed text uses the same
system message, tokenizer chat template, model weights, and greedy decoding.
Every completed request is appended to `evidence/application-audit.jsonl`.
Garak uses its official `function.Single` adapter to call the same HTTP route.

| File | Responsibility |
|---|---|
| `testbed/server.py` | HTTP API and serving the demonstration UI |
| `testbed/engine.py` | pinned model loading, inference, timing, audit |
| `testbed/safety.py` | frozen filter and refusal |
| `testbed/garak_adapter.py` | official garak function generator bridge |
| `testbed/cases.py` | fixed custom attack and benign cases |
| `testbed/evaluate.py` | paired requests and initial metrics |
| `testbed/run_garak.py` | official probes with fixed sample settings |
| `testbed/summarize.py` | evidence checks and summary generation |
| `tests/test_testbed.py` | meaningful boundary and dataset checks |

## Experimental protocol

1. Start the application and wait for `/health` to report ready.
2. Freeze the four prior-pilot filter rules. Do not tune after observing results.
3. Evaluate 24 custom attacks and 24 benign inputs in both modes (96 records).
   Alternate which mode runs first. Exclude the initial warm-up from metrics.
4. Run 32 sampled `promptinject.HijackLongPrompt` prompts and one `dan.Dan_11_0`
   prompt in each mode (66 more responses). Use seed 42, one generation per input.
5. Compare exact-string detector scores and inspect the actual answers. Count the
   two DAN detectors separately, because they score the same single response.
6. Calculate filter TP/FP/FN/TN on the labelled 48-case custom dataset. Calculate
   its precision, recall, F1, false-positive rate, and application response time.
7. Check exact answer matching on 12 ordinary benign tasks. This checks answer
   formatting as well as content; it is not a general measure of model accuracy.
8. Verify input hashes match across modes and that unblocked pairs return the
   same answer under greedy decoding. Preserve all raw outputs.

The model always uses greedy decoding, a fixed 96-new-token ceiling and a 4096
input-token cap. Garak probe-specific temperature or token suggestions do not
override these server settings. Using the same server enforces a common target
configuration. The pinned revision is `7ae557604adf67be50417f59c2c2f167def9a775`.

In a second PowerShell window after starting the server:

```powershell
.\Run-Experiments.ps1
```

The scripts refuse to overwrite existing evidence. To repeat, extract the
source ZIP into a new directory and move its supplied `evidence` directory to a
separate backup before starting a fresh run. Latency is hardware-specific.

Individual steps with the tested environment:

```powershell
..\.venv-garak\Scripts\python.exe -m unittest discover -s tests -v
..\.venv-garak\Scripts\python.exe -u -m testbed.evaluate
..\.venv-garak\Scripts\python.exe -u -m testbed.run_garak baseline
..\.venv-garak\Scripts\python.exe -u -m testbed.run_garak filtered
..\.venv-garak\Scripts\python.exe -m testbed.summarize
```

## Interpreting evidence

`evidence/summary.json` and `comparison.csv` derive from actual saved responses.
`evidence/paired/manifest.json` records versions, model revision, hardware, filter
and dataset hashes. `evidence/paired/student-review.csv` leaves student judgment
and notes blank for independent inspection. A marker hit measures redirection,
not harmful output. A filter miss is not automatically a successful model attack.
A DAN acknowledgement is not proof of unsafe content in a subsequent turn.

The custom dataset is hand-crafted with AI assistance. It is small and not
representative of production traffic. The tests do not measure tool use,
exfiltration, harmful completions, or multi-turn behavior. The system has no
external tools, file access features, or real secrets in its prompts.

## References and AI assistance

- Selected paper: https://aclanthology.org/2026.findings-acl.20/
- NVIDIA garak: https://github.com/NVIDIA/garak
- Model: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- PromptInject: https://arxiv.org/abs/2211.09527

ChatGPT Codex generated the prototype, custom cases, scripts, automated
experiment execution, initial interpretation, and document/presentation drafts.
The four filter expressions adapt the earlier AI-assisted pilot. The code wraps
official open-source libraries; it does not claim to implement their algorithms.
The student's independent code review, rerun, and interpretation have not yet
been recorded. See `STUDENT_REVIEW_RU.md` before submitting.
