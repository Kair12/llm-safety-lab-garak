$ErrorActionPreference = 'Stop'
$MidtermRoot = Split-Path -Parent $PSScriptRoot
$ProjectPython = Join-Path (Split-Path -Parent $MidtermRoot) '.venv-garak\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $ProjectPython)) {
    $ProjectPython = Join-Path $MidtermRoot '.venv\Scripts\python.exe'
}
if (-not (Test-Path -LiteralPath $ProjectPython)) {
    throw 'Python environment was not found. Run midterm\Setup.ps1 first.'
}
if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot '.env'))) {
    throw 'telegram-bot\.env is missing. Copy .env.example and add the bot token.'
}
Set-Location -LiteralPath $MidtermRoot
$env:PYTHONIOENCODING = 'utf-8'
& $ProjectPython -u (Join-Path $PSScriptRoot 'app.py')
if ($LASTEXITCODE -ne 0) { throw 'Telegram bot stopped with an error.' }
