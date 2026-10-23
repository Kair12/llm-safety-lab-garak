$ErrorActionPreference = 'Stop'
$ProjectPython = Join-Path (Split-Path -Parent $PSScriptRoot) '.venv-garak\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $ProjectPython)) { $ProjectPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe' }
if (-not (Test-Path -LiteralPath $ProjectPython)) { throw 'Create .venv and install requirements first. See README.' }
Set-Location -LiteralPath $PSScriptRoot
$env:PYTHONIOENCODING = 'utf-8'
& $ProjectPython -u -m testbed.server
if ($LASTEXITCODE -ne 0) { throw 'Prototype server failed. See console output.' }
