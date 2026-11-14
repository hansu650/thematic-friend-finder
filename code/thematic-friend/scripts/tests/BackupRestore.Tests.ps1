[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$KeepArtifacts
)

$ErrorActionPreference = 'Stop'
$scriptRoot = Split-Path $PSScriptRoot -Parent
$projectRoot = Split-Path $scriptRoot -Parent
$backupScript = Join-Path $scriptRoot 'backup.ps1'
$restoreScript = Join-Path $scriptRoot 'restore.ps1'
$runId = [guid]::NewGuid().ToString('N')
$testRoot = Join-Path ([IO.Path]::GetTempPath()) "mingle-f-runtime-$runId"
$temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$testRoot = [IO.Path]::GetFullPath($testRoot)
if (-not $testRoot.StartsWith($temporaryRoot, [StringComparison]::OrdinalIgnoreCase) -or
    [IO.Path]::GetFileName($testRoot) -ne "mingle-f-runtime-$runId") {
    throw 'Runtime fixture path is outside the intended temporary directory.'
}
$fixture = Join-Path $testRoot ('data-' + [char]0x8BFE + [char]0x7A0B)
$backupRoot = Join-Path $testRoot 'backups'
$restored = Join-Path $testRoot 'restored'
$occupied = Join-Path $testRoot 'occupied'
$results = [Collections.Generic.List[object]]::new()

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

function Assert-Throws([scriptblock]$Action, [string]$ExpectedText) {
    try { & $Action } catch {
        Assert-True ($_.Exception.Message -match [regex]::Escape($ExpectedText)) "Expected error containing '$ExpectedText', got '$($_.Exception.Message)'"
        return
    }
    throw "Expected an error containing '$ExpectedText'."
}

function Invoke-Case([string]$Id, [string]$Name, [scriptblock]$Action) {
    $started = Get-Date
    try {
        & $Action
        $results.Add([pscustomobject]@{ id = $Id; name = $Name; result = 'PASS'; seconds = [math]::Round(((Get-Date) - $started).TotalSeconds, 2) })
    }
    catch {
        $results.Add([pscustomobject]@{ id = $Id; name = $Name; result = 'FAIL'; seconds = [math]::Round(((Get-Date) - $started).TotalSeconds, 2); error = $_.Exception.Message })
    }
}

try {
    New-Item -ItemType Directory -Path $fixture -Force | Out-Null
    [IO.File]::WriteAllText((Join-Path $fixture 'tongpin.mv.db'), 'fictional-profile:demo_zhou`nfictional-profile:demo_lin`nconnection:demo_zhou-demo_lin`nmessage:hello')
    [IO.File]::WriteAllText((Join-Path $fixture 'tongpin.trace.db'), 'stopped-fixture')
    $sourceHashesBefore = @{}
    Get-ChildItem -LiteralPath $fixture -File -Recurse | ForEach-Object { $sourceHashesBefore[$_.Name] = (Get-FileHash $_.FullName -Algorithm SHA256).Hash }

    Invoke-Case 'F-01' 'Clean-copy startup and script syntax' {
        $powershellCommand = Get-Command pwsh,powershell -ErrorAction SilentlyContinue | Select-Object -First 1
        $powershell = if ($powershellCommand) { $powershellCommand.Source } else { Join-Path $PSHOME 'powershell.exe' }
        Assert-True (Test-Path -LiteralPath $powershell) 'Windows PowerShell executable is unavailable.'
        & $powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "& '$backupScript' -DataDirectory '$fixture' -BackupRoot '$backupRoot' | Out-Null"
        Assert-True ($LASTEXITCODE -eq 0) 'Backup script did not start from a clean PowerShell process.'
        if (-not $SkipBuild) {
            Push-Location $projectRoot
            try {
                & .\scripts\build.ps1 -SkipTests
                Assert-True ($LASTEXITCODE -eq 0) 'Clean-copy Maven package failed.'
            } finally { Pop-Location }
        }
    }

    $backup = Get-ChildItem -LiteralPath $backupRoot -Directory | Select-Object -First 1
    Invoke-Case 'F-02' 'Stopped database backup has manifest and checksums' {
        Assert-True ($null -ne $backup) 'No backup directory was created.'
        $manifestPath = Join-Path $backup.FullName 'manifest.json'
        $manifestHashPath = Join-Path $backup.FullName 'manifest.sha256'
        Assert-True (Test-Path -LiteralPath $manifestPath) 'manifest.json is missing.'
        Assert-True (Test-Path -LiteralPath $manifestHashPath) 'manifest.sha256 is missing.'
        $expectedManifestHash = ((Get-Content -LiteralPath $manifestHashPath -Raw).Trim() -split '\s+')[0]
        $actualManifestHash = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
        Assert-True ($expectedManifestHash -eq $actualManifestHash) 'manifest.sha256 does not match manifest.json.'
        $manifest = Get-Content -LiteralPath $manifestPath -Encoding UTF8 -Raw | ConvertFrom-Json
        Assert-True (@($manifest.files).Count -eq $sourceHashesBefore.Count) 'Manifest file count is incorrect.'
        foreach ($file in Get-ChildItem -LiteralPath $fixture -File -Recurse) {
            Assert-True ($sourceHashesBefore[$file.Name] -eq (Get-FileHash $file.FullName -Algorithm SHA256).Hash) "Source changed: $($file.Name)"
        }
    }

    Invoke-Case 'F-03' 'Restore reproduces the fixture bytes and checksums' {
        & $restoreScript -BackupDirectory $backup.FullName -Destination $restored
        $content = Get-Content -LiteralPath (Join-Path $restored 'tongpin.mv.db') -Raw
        foreach ($record in @('demo_zhou', 'demo_lin', 'connection:demo_zhou-demo_lin', 'message:hello')) {
            Assert-True ($content.Contains($record)) "Recovered fixture is missing $record"
        }
    }

    Invoke-Case 'F-04' 'Corrupt, missing, unsafe and occupied inputs are rejected' {
        Assert-Throws { & $restoreScript -BackupDirectory (Join-Path $testRoot 'missing') -Destination (Join-Path $testRoot 'missing-destination') } 'Path does not exist'
        $runningFixture = Join-Path $testRoot 'running-data'
        Copy-Item -LiteralPath $fixture -Destination $runningFixture -Recurse
        [IO.File]::WriteAllText((Join-Path $runningFixture 'tongpin.lock.db'), 'running')
        Assert-Throws { & $backupScript -DataDirectory $runningFixture -BackupRoot (Join-Path $testRoot 'running-backups') } 'database appears to be running'
        $corrupt = Join-Path $testRoot 'corrupt'
        Copy-Item -LiteralPath $backup.FullName -Destination $corrupt -Recurse
        Add-Content -LiteralPath (Join-Path $corrupt 'tongpin.mv.db') -Value 'tampered'
        Assert-Throws { & $restoreScript -BackupDirectory $corrupt -Destination (Join-Path $testRoot 'corrupt-destination') } 'Size mismatch'
        New-Item -ItemType Directory -Path $occupied -Force | Out-Null
        [IO.File]::WriteAllText((Join-Path $occupied 'keep.txt'), 'do not overwrite')
        Assert-Throws { & $restoreScript -BackupDirectory $backup.FullName -Destination $occupied } 'already exists'
        $unsafe = Join-Path $testRoot 'unsafe-manifest'
        Copy-Item -LiteralPath $backup.FullName -Destination $unsafe -Recurse
        $unsafeManifest = Get-Content -LiteralPath (Join-Path $unsafe 'manifest.json') -Encoding UTF8 -Raw | ConvertFrom-Json
        $unsafeManifest.files[0].path = '../escape.mv.db'
        $unsafeJson = $unsafeManifest | ConvertTo-Json -Depth 8
        [IO.File]::WriteAllText((Join-Path $unsafe 'manifest.json'), $unsafeJson, [Text.UTF8Encoding]::new($false))
        $unsafeHash = (Get-FileHash -LiteralPath (Join-Path $unsafe 'manifest.json') -Algorithm SHA256).Hash.ToLowerInvariant()
        [IO.File]::WriteAllText((Join-Path $unsafe 'manifest.sha256'), "$unsafeHash  manifest.json`n", [Text.UTF8Encoding]::new($false))
        Assert-Throws { & $restoreScript -BackupDirectory $unsafe -Destination (Join-Path $testRoot 'unsafe-destination') } 'Unsafe manifest path'
        Assert-True ((Get-Content -LiteralPath (Join-Path $occupied 'keep.txt') -Raw) -eq 'do not overwrite') 'Occupied destination was modified.'
    }

    if ($SkipBuild) {
        $results.Add([pscustomobject]@{ id = 'F-05'; name = 'Maven suite (not run with -SkipBuild)'; result = 'SKIP'; seconds = 0 })
    } else {
        Invoke-Case 'F-05' 'Maven integration suite' {
            Push-Location $projectRoot
            try {
                & .\mvnw.cmd --batch-mode --no-transfer-progress test
                Assert-True ($LASTEXITCODE -eq 0) 'Maven integration tests failed.'
            } finally { Pop-Location }
        }
    }

    Invoke-Case 'F-06' 'Reproduction commands are documented' {
        $readme = Get-Content -LiteralPath (Join-Path $projectRoot 'README.md') -Encoding UTF8 -Raw
        foreach ($command in @('scripts\backup.ps1', 'scripts\restore.ps1', 'mvnw.cmd')) {
            Assert-True ($readme.Contains($command)) "README is missing handover command: $command"
        }
    }

    Invoke-Case 'F-07' 'Windows PowerShell restores a UTF-8 manifest with a non-ASCII source path' {
        $windowsPowerShell = Join-Path $env:SystemRoot 'System32/WindowsPowerShell/v1.0/powershell.exe'
        $compatibilityDestination = Join-Path $testRoot 'restored-windows-powershell'
        $previousModulePath = $env:PSModulePath
        try {
            $env:PSModulePath = $null
            & $windowsPowerShell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $restoreScript -BackupDirectory $backup.FullName -Destination $compatibilityDestination
            Assert-True ($LASTEXITCODE -eq 0) 'Windows PowerShell could not read the UTF-8 manifest.'
            $recoveredHash = (Get-FileHash -LiteralPath (Join-Path $compatibilityDestination 'tongpin.mv.db') -Algorithm SHA256).Hash
            Assert-True ($recoveredHash -eq $sourceHashesBefore['tongpin.mv.db']) 'Restored bytes differ in the compatibility check.'
        } finally {
            $env:PSModulePath = $previousModulePath
        }
    }
}
finally {
    $results | Format-Table -AutoSize | Out-String | Write-Output
    $failed = @($results | Where-Object result -eq 'FAIL')
    if ($KeepArtifacts) { Write-Output "Runtime check artifacts: $testRoot" }
    elseif (Test-Path -LiteralPath $testRoot) { Remove-Item -LiteralPath $testRoot -Recurse -Force -ErrorAction SilentlyContinue }
    if ($failed.Count -gt 0) {
        $failed | ForEach-Object { Write-Error "$($_.id) $($_.name): $($_.error)" }
        exit 1
    }
    $passedCount = @($results | Where-Object result -eq 'PASS').Count
    $skippedCount = @($results | Where-Object result -eq 'SKIP').Count
    Write-Output "F runtime checks: $passedCount passed, $skippedCount skipped."
}
