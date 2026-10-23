# LLM Safety Lab with NVIDIA garak

Research experiments, a working local LLM application, a Telegram demonstration,
raw evaluation evidence, screenshots, reports and presentations for an AI safety
course project.

The application compares the same **Qwen2.5-0.5B-Instruct** model with and without
a lexical input filter. It displays the model response, filter decision, matched
rule, generation tokens and elapsed time. The repository also retains an earlier
garak-only experiment and a prompt-only mitigation pilot.

## Repository contents

| Directory | Contents |
| --- | --- |
| `midterm/` | Main web application, paired evaluation, tests and instructions |
| `midterm/telegram-bot/` | Telegram interface using the same model and filter |
| `midterm/evidence/` | Raw garak reports, paired responses, metrics and review worksheet |
| `midterm/deliverables/` | Research report, presentation and submission archives |
| `screenshots/` | Eight demonstration screenshots and an annotated Russian presentation |
| `experiment/` | Earlier baseline, prompt-only and input-filter experiments |
| `experiment/garak-overrides/` | The project-specific `guarded_hf.py` generator |
| `deliverables/` | Earlier assignment report, presentation and submission archive |
| `references/` | Original study and assignment PDF supplied for this project |
| `assets/` and `midterm/assets/` | Illustration assets used in the presentations |
| `build/` and `midterm/build/` | Presentation/report sources, previews and validation outputs |
| `experiment-with-openAI/` | Reserved space for a possible API adaptation |
| `garak-src/` | Official NVIDIA garak source, pinned as a Git submodule |
| `tools/` | Upstream setup and publication-audit helpers |

## Clone with the pinned garak source

```powershell
git clone --recurse-submodules https://github.com/OWNER/llm-safety-lab-garak.git
cd llm-safety-lab-garak
.\tools\Prepare-Garak.ps1
```

Replace `OWNER` with the owner shown in this repository's URL.
`Prepare-Garak.ps1` restores the pinned upstream source if needed and installs
the retained project generator into that local checkout. It does not start any
experiments or install Python packages.

## Run the main application

The recorded environment used Windows, Python 3.12.14, NVIDIA GTX 1660 (6 GB),
PyTorch 2.13.0+cu126 and Transformers 5.19.0. Other environments may require a
compatible PyTorch build. The first model launch downloads the pinned weights.

```powershell
cd midterm
.\Setup.ps1 -PythonPath 'C:\path\to\python.exe' -Cuda
.\Start-Demo.ps1
```

Without `-Cuda`, inference can run on CPU. Open
<http://127.0.0.1:8765/> after the model reports ready. The server binds to the
local loopback interface. See [midterm/README.md](midterm/README.md) for the
configuration, full protocol and reproduction commands.

In a second terminal, run the offline checks from `midterm/`:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m testbed.check_api
```

The API checks require the demonstration server to be running. On the original
computer, the scripts may use the parent `.venv-garak` environment instead.

## Telegram interface

Copy `midterm/telegram-bot/.env.example` to `.env`, set your own bot token
locally, and follow [the bot instructions](midterm/telegram-bot/README.md).
The token file and chat-state/audit files are excluded from Git. The web server
and Telegram bot each load their own model, so run only one at a time on the
recorded 6 GB GPU.

## Evidence and interpretation

The saved midterm evaluation uses 32 PromptInject inputs and one DAN input in
each mode, plus 24 custom attacks and 24 benign inputs in each mode. Its exact
PromptInject marker detections are 12/32 before filtering and 0/32 after it.
On the separate custom dataset, the filter blocks 8/24 attack inputs and
incorrectly blocks 8/24 benign inputs. Both modes have 0/24 exact custom attack
markers. These are different datasets and measurements.

The eight demonstration screenshots document four individual input pairs.
The paraphrased injection produces an unsupported exam announcement instead of
the requested library summary in both modes. An absent exact marker therefore
does not establish successful task execution or general safety.

The worksheet `midterm/evidence/paired/student-review.csv` retains the supplied
automatic measurements and blank human-review fields. A screenshot contribution
does not imply that all records have received independent human review.

Scripts refuse to overwrite the existing midterm experiment evidence. Repeat
the full experiment in a separate working copy and preserve the original logs.
The early `experiment/` scripts are historical and can overwrite their output
locations, so use a fresh copy for those runs as well.

## Research basis and attribution

Y. Xin, D. Chen, L. Yang, M. Backes, and X. Zhang, "Jailbreaking Attacks vs.
Content Safety Filters: How Far Are We in the LLM Safety Arms Race?," Findings of
ACL 2026, pp. 421–445. <https://aclanthology.org/2026.findings-acl.20/>

- NVIDIA garak: <https://github.com/NVIDIA/garak>, pinned commit
  `346497afcd86ff5ba137cfbcaaeba4e9c9f6c970`.
- Model: <https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct>, pinned revision
  `7ae557604adf67be50417f59c2c2f167def9a775`.
- Earlier PromptInject work: <https://arxiv.org/abs/2211.09527>.

NVIDIA garak retains its upstream Apache-2.0 license. Third-party study and
assignment documents retain their original authorship and notices. No license
grant for those documents is implied by their inclusion here.

## AI use declaration

ChatGPT Codex assisted with the prototype, filter implementation, test cases,
scripts, automated experimental execution, initial analysis, reports,
presentations and repository preparation. The user selected the paper and
provided the eight demonstration screenshots. Independent review and conclusions
must describe work actually completed by the student. Earlier submission files
are retained as historical outputs and may contain wording superseded by this
declaration and the midterm review instructions.

## Files kept locally

The repository includes the project source and research materials. It excludes
credentials, Telegram conversations, virtual environments, downloaded model
weights, package directories and tool scratch caches. Setup scripts, pinned
revisions and `.env.example` make those local dependencies reproducible.

