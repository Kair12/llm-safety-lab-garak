$ErrorActionPreference = 'Stop'
$ProjectPython = Join-Path (Split-Path -Parent $PSScriptRoot) '.venv-garak\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $ProjectPython)) { $ProjectPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe' }
Set-Location -LiteralPath $PSScriptRoot
$env:PYTHONIOENCODING = 'utf-8'
Invoke-RestMethod 'http://127.0.0.1:8765/health' | Out-Null
foreach ($Arguments in @(
    @('-m','unittest','discover','-s','tests','-v'),
    @('-u','-m','testbed.evaluate'),
    @('-u','-m','testbed.run_garak','baseline'),
    @('-u','-m','testbed.run_garak','filtered'),
    @('-m','testbed.summarize')
)) {
    & $ProjectPython @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $Arguments" }
}
