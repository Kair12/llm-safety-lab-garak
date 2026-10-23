param([string]$PythonPath = 'python', [switch]$Cuda)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
& $PythonPath -m venv .venv
if ($LASTEXITCODE -ne 0) { throw 'Python 3.12 is required; pass -PythonPath with a working Python executable.' }
$ProjectPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
& $ProjectPython -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { throw 'pip setup failed' }
if ($Cuda) {
    & $ProjectPython -m pip install torch==2.13.0 --index-url https://download.pytorch.org/whl/cu126
    if ($LASTEXITCODE -ne 0) { throw 'CUDA-enabled PyTorch installation failed' }
}
& $ProjectPython -m pip install -r requirements.txt 'git+https://github.com/NVIDIA/garak.git@346497afcd86ff5ba137cfbcaaeba4e9c9f6c970'
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
