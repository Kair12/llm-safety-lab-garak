param()
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$GarakRoot = Join-Path $ProjectRoot 'garak-src'
$PinnedCommit = '346497afcd86ff5ba137cfbcaaeba4e9c9f6c970'
$Overlay = Join-Path $ProjectRoot 'experiment\garak-overrides\guarded_hf.py'
$Destination = Join-Path $GarakRoot 'garak\generators\guarded_hf.py'

if (-not (Test-Path -LiteralPath (Join-Path $GarakRoot 'garak\__init__.py'))) {
    & git -C $ProjectRoot submodule update --init --recursive -- garak-src
    if ($LASTEXITCODE -ne 0) { throw 'Unable to initialize the pinned garak submodule.' }
}
$ActualCommit = & git -c "safe.directory=$($GarakRoot.Replace('\', '/'))" -C $GarakRoot rev-parse HEAD
if ($LASTEXITCODE -ne 0 -or $ActualCommit.Trim() -ne $PinnedCommit) {
    throw 'The garak checkout does not match the recorded experiment revision.'
}
if (-not (Test-Path -LiteralPath $Overlay)) { throw 'The retained generator overlay is missing.' }
if (Test-Path -LiteralPath $Destination) {
    $SourceHash = (Get-FileHash -LiteralPath $Overlay -Algorithm SHA256).Hash
    $ExistingHash = (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash
    if ($SourceHash -ne $ExistingHash) {
        throw 'The local guarded_hf.py differs. Preserve or review it before applying the overlay.'
    }
} else {
    Copy-Item -LiteralPath $Overlay -Destination $Destination
}
Write-Host "Pinned garak source and project generator are ready: $GarakRoot"

