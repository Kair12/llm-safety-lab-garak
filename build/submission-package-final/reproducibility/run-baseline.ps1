$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Python = Join-Path $ProjectRoot ".venv-garak\Scripts\python.exe"
$Config = Join-Path $PSScriptRoot "garak-baseline.yaml"
$GarakHome = Join-Path $ProjectRoot ".garak-home"
$Evidence = Join-Path $PSScriptRoot "evidence\baseline"

$env:XDG_CONFIG_HOME = Join-Path $GarakHome "config"
$env:XDG_DATA_HOME = Join-Path $GarakHome "data"
$env:XDG_CACHE_HOME = Join-Path $GarakHome "cache"
$env:HF_HOME = Join-Path $ProjectRoot ".model-cache\huggingface"

New-Item -ItemType Directory -Force -Path $Evidence | Out-Null

$Model = "Qwen/Qwen2.5-0.5B-Instruct"
$GeneratorOptions = '{"max_tokens":64}'

& $Python -m garak `
  --config $Config `
  --target_type huggingface.Pipeline `
  --target_name $Model `
  --spec probes.promptinject.HijackLongPrompt `
  --generator_options $GeneratorOptions `
  --report_prefix baseline-promptinject `
  2>&1 | Tee-Object -FilePath (Join-Path $Evidence "baseline-promptinject-console.txt")

& $Python -m garak `
  --config $Config `
  --target_type huggingface.Pipeline `
  --target_name $Model `
  --spec probes.dan.Dan_11_0 `
  --generator_options $GeneratorOptions `
  --report_prefix baseline-dan `
  2>&1 | Tee-Object -FilePath (Join-Path $Evidence "baseline-dan-console.txt")

$ReportDir = Join-Path $env:XDG_DATA_HOME "garak\garak_runs"
Copy-Item (Join-Path $ReportDir "baseline-promptinject*") $Evidence -Force
Copy-Item (Join-Path $ReportDir "baseline-dan*") $Evidence -Force

Write-Host "Baseline evidence saved to $Evidence"
