param(
    [switch]$NoPause,
    [string]$Repository = 'hansu650/thematic-friend-finder',
    [int]$PullRequest = 9
)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$stamp = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,6)
$output = Join-Path $projectDir ('.local/terminal-evidence/github-' + $stamp)
New-Item -ItemType Directory -Path $output -Force | Out-Null
$exitCode = 1
$transcriptStarted = $false
try {
    $gh = (Get-Command gh -ErrorAction Stop).Source
    Start-Transcript -LiteralPath (Join-Path $output 'github-transcript.txt') | Out-Host
    $transcriptStarted = $true
    Write-Host 'Mingle: LIVE GitHub pull request and CI state' -ForegroundColor Cyan
    Write-Host ('Observed: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))
    Write-Host ('Command: gh pr view ' + $PullRequest + ' --repo ' + $Repository + ' --json url,state,isDraft,headRefName,headRefOid')
    & $gh pr view $PullRequest --repo $Repository --json url,state,isDraft,headRefName,headRefOid
    if ($LASTEXITCODE -ne 0) { throw 'GitHub read failed. Existing CLI authentication may need attention; no login changes were attempted.' }
    Write-Host ('Command: gh pr checks ' + $PullRequest + ' --repo ' + $Repository)
    & $gh pr checks $PullRequest --repo $Repository
    $exitCode = $LASTEXITCODE
    Write-Host ('GitHub checks exit code: ' + $exitCode)
    Write-Host '0 = passed; 8 = pending; other nonzero values indicate failure/error. Read the actual status above.'
    Write-Host 'SCREENSHOT 03: include PR identity, head commit, check status and observation time.' -ForegroundColor Cyan
    if (-not $NoPause) { [void](Read-Host 'Take the screenshot now, then press Enter to finish') }
} catch {
    Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
    if (-not $NoPause) { [void](Read-Host 'Capture the actual error if needed, then press Enter') }
} finally {
    if ($transcriptStarted) { Stop-Transcript | Out-Host }
    Write-Host ('Saved output: ' + $output)
}
exit $exitCode
