[CmdletBinding()]
param(
    [string]$OutputRoot,
    [switch]$SkipTests,
    [string]$ValidationReference
)
$ErrorActionPreference = 'Stop'
$projectDir = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$repoRoot = (& git -C $projectDir rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Run this script inside a Git checkout.' }
$repoRoot = [IO.Path]::GetFullPath($repoRoot)
$relativeProject = 'code/thematic-friend'
if ($projectDir -ne [IO.Path]::GetFullPath((Join-Path $repoRoot $relativeProject))) {
    throw 'Expected the application at code/thematic-friend in its repository.'
}
$sourceCommit = (& git -C $repoRoot rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceCommit -notmatch '^[a-f0-9]{40}$') { throw 'Cannot identify the source commit.' }
$dirty = @(& git -C $repoRoot status --porcelain --untracked-files=all -- $relativeProject)
if ($LASTEXITCODE -ne 0 -or $dirty.Count -ne 0) { throw 'Commit or preserve application changes before packaging; the application tree must be clean.' }
if ($SkipTests -and [string]::IsNullOrWhiteSpace($ValidationReference)) {
    throw '-SkipTests requires -ValidationReference identifying already-passed checks for this source.'
}
$applicationTree = (& git -C $repoRoot rev-parse ($sourceCommit + ':' + $relativeProject)).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Cannot identify the application tree.' }
$jdk = $env:JAVA_HOME
if (-not $jdk) {
    $knownJdk = 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot'
    if (Test-Path -LiteralPath (Join-Path $knownJdk 'bin\java.exe')) { $jdk = $knownJdk }
    else {
        $javaOnPath = Get-Command java -ErrorAction SilentlyContinue
        if ($javaOnPath) { $jdk = Split-Path (Split-Path $javaOnPath.Source -Parent) -Parent }
    }
}
if (-not $jdk -or -not (Test-Path -LiteralPath (Join-Path $jdk 'bin\java.exe'))) { throw 'Set JAVA_HOME to JDK 21.' }
$javaOutput = & (Join-Path $jdk 'bin\java.exe') --version 2>&1
$javaExitCode = $LASTEXITCODE
$javaVersion = ($javaOutput | Select-Object -First 1).ToString()
if ($javaExitCode -ne 0 -or $javaVersion -notmatch '\b21(?:[.\s]|$)') { throw 'Java 21 is required.' }
if ([string]::IsNullOrWhiteSpace($OutputRoot)) { $OutputRoot = Join-Path $projectDir '.local\candidates' }
$OutputRoot = [IO.Path]::GetFullPath($OutputRoot)
if (Test-Path -LiteralPath $OutputRoot -PathType Leaf) { throw 'OutputRoot must be a directory.' }
New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
$workName = '.candidate-build-' + [guid]::NewGuid().ToString('N')
$work = [IO.Path]::GetFullPath((Join-Path $OutputRoot $workName))
$candidateName = 'Mingle-RC-' + $sourceCommit.Substring(0, 12) + '-' + (Get-Date -Format 'yyyyMMdd-HHmmssfff')
$destination = [IO.Path]::GetFullPath((Join-Path $OutputRoot $candidateName))
$rootPrefix = $OutputRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
if (-not $work.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -or
    -not $destination.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Output path escaped its parent.' }
if (Test-Path -LiteralPath $destination) { throw 'Preserve the existing candidate directory.' }
$bundle = Join-Path $work 'bundle'
New-Item -ItemType Directory -Path $bundle -Force | Out-Null
$previousJava = $env:JAVA_HOME
$previousMaven = $env:MAVEN_USER_HOME
$published = $false
try {
    $archive = Join-Path $bundle 'source.zip'
    & git -C $repoRoot archive --format=zip ('--output=' + $archive) $sourceCommit -- $relativeProject
    if ($LASTEXITCODE -ne 0) { throw 'Source archive failed.' }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [IO.Compression.ZipFile]::OpenRead($archive)
    try {
        foreach ($entry in $zip.Entries) {
            if ($entry.FullName -match '(^|/)(\.local|\.cache|\.git|node_modules|target)/|\.(mv|trace)\.db$|(^|/)\.env$') {
                throw ('Source archive contains a local/runtime artifact: ' + $entry.FullName)
            }
        }
    } finally { $zip.Dispose() }
    $sourceRoot = Join-Path $work 'source'
    [IO.Compression.ZipFile]::ExtractToDirectory($archive, $sourceRoot)
    $buildDir = Join-Path $sourceRoot $relativeProject
    # Build the immutable archive, never a possibly stale target/ or ignored local source file.
    $env:JAVA_HOME = $jdk
    $env:MAVEN_USER_HOME = Join-Path $projectDir '.cache\maven'
    $repositoryCache = Join-Path $env:MAVEN_USER_HOME 'repository'
    $mavenArgs = @('--batch-mode', '--no-transfer-progress', 'package', ('-Dmaven.repo.local=' + $repositoryCache))
    if ($SkipTests) { $mavenArgs += '-DskipTests' }
    $buildLog = Join-Path $bundle 'build.log'
    Push-Location $buildDir
    try {
        & '.\mvnw.cmd' @mavenArgs *> $buildLog
        if ($LASTEXITCODE -ne 0) { throw ('Candidate build failed. Inspect ' + $buildLog) }
    } finally { Pop-Location }
    Copy-Item -LiteralPath (Join-Path $buildDir 'target\thematic-friend-0.0.1-SNAPSHOT.jar') -Destination (Join-Path $bundle 'mingle.jar')
    Copy-Item -LiteralPath (Join-Path $buildDir 'scripts\start-candidate.ps1') -Destination (Join-Path $bundle 'Start-Mingle.ps1')
    Copy-Item -LiteralPath (Join-Path $buildDir 'docs\CANDIDATE_README.md') -Destination (Join-Path $bundle 'README.md')
    $jarHash = (Get-FileHash -LiteralPath (Join-Path $bundle 'mingle.jar') -Algorithm SHA256).Hash.ToLowerInvariant()
    $sourceHash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
    $manifest = [ordered]@{
        schemaVersion = 1
        status = 'candidate-awaiting-human-acceptance'
        createdAt = [DateTimeOffset]::Now.ToString('o')
        sourceCommit = $sourceCommit
        applicationTree = $applicationTree
        sourcePath = $relativeProject
        jarSha256 = $jarHash
        sourceArchiveSha256 = $sourceHash
        java = $javaVersion
        build = [ordered]@{ command = 'mvnw.cmd'; arguments = $mavenArgs; exitCode = 0; testsRunInThisBuild = (-not $SkipTests); validationReference = $ValidationReference }
        launch = [ordered]@{ profile = 'demo'; chineseEnabled = $false; bindAddress = '127.0.0.1'; defaultPort = 8080; defaultDataDirectory = './data' }
        acceptance = 'B-F results and final sign-off remain pending. This package contains no credentials or database.'
    }
    [IO.File]::WriteAllText((Join-Path $bundle 'candidate.json'), ($manifest | ConvertTo-Json -Depth 6) + "`n", [Text.UTF8Encoding]::new($false))
    $checksums = foreach ($name in @('mingle.jar', 'source.zip', 'Start-Mingle.ps1', 'README.md', 'candidate.json', 'build.log')) {
        (Get-FileHash -LiteralPath (Join-Path $bundle $name) -Algorithm SHA256).Hash.ToLowerInvariant() + '  ' + $name
    }
    [IO.File]::WriteAllText((Join-Path $bundle 'SHA256SUMS.txt'), ($checksums -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $bundle -Destination $destination
    $published = $true
    Write-Output ('Candidate: ' + $destination)
    Write-Output ('Source commit: ' + $sourceCommit)
    Write-Output ('JAR SHA-256: ' + $jarHash)
} finally {
    $env:JAVA_HOME = $previousJava
    $env:MAVEN_USER_HOME = $previousMaven
    # Keep a failed build/log for diagnosis. Only remove this invocation's validated staging path on success.
    if ($published -and (Test-Path -LiteralPath $work) -and
        $work.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -and
        [IO.Path]::GetFileName($work) -eq $workName) { Remove-Item -LiteralPath $work -Recurse -Force }
}
