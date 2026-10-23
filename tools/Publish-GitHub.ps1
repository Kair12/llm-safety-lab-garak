param(
    [string]$RepositoryName = 'llm-safety-lab-garak',
    [string]$PythonPath = 'python',
    [switch]$Private
)
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$GitArguments = @('-c', "safe.directory=$($ProjectRoot.Replace('\', '/'))", '-C', $ProjectRoot)

function Invoke-ProjectGit {
    param([string[]]$GitCommand)
    & git @GitArguments @GitCommand
    if ($LASTEXITCODE -ne 0) { throw "Git operation failed: $($GitCommand[0])" }
}

if ($RepositoryName -notmatch '^[A-Za-z0-9_.-]+$') { throw 'Invalid repository name.' }
if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot '.git'))) {
    throw 'Initialize and review the local Git repository before publishing.'
}

# Retrieve the existing credential in memory. Never print it or put it in a URL.
$CredentialRequest = "protocol=https`nhost=github.com`n`n"
$CredentialLines = $CredentialRequest | & git -c credential.interactive=never credential fill 2>$null
if ($LASTEXITCODE -ne 0) { throw 'Sign in first with: git credential-manager github login --device' }
$CredentialFields = @{}
foreach ($CredentialLine in $CredentialLines) {
    $Parts = $CredentialLine -split '=', 2
    if ($Parts.Count -eq 2) { $CredentialFields[$Parts[0]] = $Parts[1] }
}
if (-not $CredentialFields.password) { throw 'No GitHub credential is available.' }
$Headers = @{
    Authorization = "Bearer $($CredentialFields.password)"
    Accept = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
    'User-Agent' = 'llm-safety-lab-publication'
}
$GitHubUser = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $Headers -TimeoutSec 30
$RepositoryUrl = "https://github.com/$($GitHubUser.login)/$RepositoryName"
$CloneUrl = "$RepositoryUrl.git"
$ApiUrl = "https://api.github.com/repos/$($GitHubUser.login)/$RepositoryName"

# Audit the exact staged blobs, including files nested in submission archives.
& $PythonPath (Join-Path $PSScriptRoot 'repository_audit.py') --root $ProjectRoot
if ($LASTEXITCODE -ne 0) { throw 'Publication audit failed. No repository was created or pushed.' }

$ExistingOrigin = & git @GitArguments remote get-url origin 2>$null
$RemoteExists = $false
try {
    $ExistingRepository = Invoke-RestMethod -Uri $ApiUrl -Headers $Headers -TimeoutSec 30
    $RemoteExists = $true
} catch {
    if ([int]$_.Exception.Response.StatusCode -ne 404) { throw 'Unable to check the target GitHub repository.' }
}
if ($RemoteExists -and $ExistingOrigin -ne $CloneUrl) {
    throw "A repository with that name already exists and is not this checkout's origin: $RepositoryUrl"
}
if ($RemoteExists -and [bool]$ExistingRepository.private -ne [bool]$Private) {
    throw 'The existing repository has different visibility. No permissions were changed.'
}
if ($ExistingOrigin -and $ExistingOrigin -ne $CloneUrl) {
    throw 'The local origin points somewhere else. No remote was changed.'
}

Invoke-ProjectGit -GitCommand @('config', '--local', 'user.name', $GitHubUser.login)
Invoke-ProjectGit -GitCommand @('config', '--local', 'user.email', "$($GitHubUser.id)+$($GitHubUser.login)@users.noreply.github.com")
& git @GitArguments diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    Invoke-ProjectGit -GitCommand @('commit', '-m', 'Add complete LLM safety research project and demonstration materials')
} elseif ($LASTEXITCODE -ne 0) {
    throw 'Unable to inspect staged changes.'
}

if (-not $ExistingOrigin) {
    Invoke-ProjectGit -GitCommand @('remote', 'add', 'origin', $CloneUrl)
}
if (-not $RemoteExists) {
    $Body = @{ name = $RepositoryName; private = [bool]$Private; auto_init = $false;
        description = 'LLM safety experiments with NVIDIA garak, local Qwen application, Telegram demo, evidence and presentations.' } | ConvertTo-Json
    $Created = Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Headers $Headers -Method Post -Body $Body -ContentType 'application/json' -TimeoutSec 30
    if ($Created.html_url -ne $RepositoryUrl) { throw 'Unexpected repository creation result.' }
}
Invoke-ProjectGit -GitCommand @('push', '-u', 'origin', 'main')
$LocalCommit = & git @GitArguments rev-parse HEAD
$RemoteHead = & git @GitArguments ls-remote origin refs/heads/main
if ($LASTEXITCODE -ne 0 -or -not $RemoteHead.StartsWith("$LocalCommit`t")) {
    throw 'The remote branch could not be confirmed at the local commit.'
}
[PSCustomObject]@{ Repository = $RepositoryUrl; Visibility = $(if ($Private) { 'private' } else { 'public' }); Commit = $LocalCommit } | Format-List
