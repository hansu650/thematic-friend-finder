[CmdletBinding()]
param([switch]$KeepArtifacts)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$testParent = [IO.Path]::GetFullPath((Join-Path $projectRoot '..\..\.local\ct'))
$testName = 'test-' + [guid]::NewGuid().ToString('N').Substring(0, 16)
$testRoot = [IO.Path]::GetFullPath((Join-Path $testParent $testName))
if (-not $testRoot.StartsWith($testParent + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid test path.' }
New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
$results = [Collections.Generic.List[object]]::new()
function Assert-True($condition, $message) { if (-not $condition) { throw $message } }
function Assert-Throws([scriptblock]$action, [string]$expected) {
    $caught = $null
    try { & $action | Out-Null } catch { $caught = $_ }
    if (-not $caught -or -not $caught.Exception.Message.Contains($expected)) { throw ('Expected rejection: ' + $expected + '; actual: ' + $caught) }
}
function Invoke-Case([string]$id, [string]$name, [scriptblock]$action) {
    & $action
    $results.Add([pscustomobject]@{ id = $id; name = $name; result = 'PASS' })
    Write-Output ('PASS ' + $id + ' ' + $name)
}
function Free-Port {
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $listener.Start()
    try { return $listener.LocalEndpoint.Port } finally { $listener.Stop() }
}
function Write-Utf8([string]$file, [string]$content) { [IO.File]::WriteAllText($file, $content, [Text.UTF8Encoding]::new($false)) }
try {
    $jdk = $env:JAVA_HOME
    if (-not $jdk -and (Test-Path -LiteralPath 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot\bin\javac.exe')) { $jdk = 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot' }
    if (-not $jdk) { throw 'Set JAVA_HOME to JDK 21 for the executable fixture.' }
    $fixtureBuild = Join-Path $testRoot 'java fixture'
    New-Item -ItemType Directory -Path $fixtureBuild -Force | Out-Null
    $javaSource = @'
import java.nio.file.*;
public class CandidateFixture {
    public static void main(String[] args) throws Exception {
        Path data = Path.of(System.getenv("APP_DATA_DIR"));
        Files.createDirectories(data);
        Files.writeString(data.resolve("started.txt"), String.join("\n", args)
            + "\nchinese=" + System.getenv("TONGPIN_CHINESE_ENABLED")
            + "\nbind=" + System.getenv("APP_BIND_ADDRESS"));
    }
}
'@
    Write-Utf8 (Join-Path $fixtureBuild 'CandidateFixture.java') $javaSource
    & (Join-Path $jdk 'bin\javac.exe') (Join-Path $fixtureBuild 'CandidateFixture.java')
    if ($LASTEXITCODE -ne 0) { throw 'Fixture compilation failed.' }
    $fixtureJar = Join-Path $fixtureBuild 'fixture.jar'
    & (Join-Path $jdk 'bin\jar.exe') --create --file $fixtureJar --main-class CandidateFixture -C $fixtureBuild CandidateFixture.class
    if ($LASTEXITCODE -ne 0) { throw 'Fixture JAR failed.' }
    $fixtureRepo = Join-Path $testRoot 'source repo'
    $fixtureProject = Join-Path $fixtureRepo 'code\thematic-friend'
    foreach ($dir in @('scripts', 'docs', '.cache', '.local\data', 'target')) { New-Item -ItemType Directory -Path (Join-Path $fixtureProject $dir) -Force | Out-Null }
    Copy-Item -LiteralPath (Join-Path $projectRoot 'scripts\package-candidate.ps1') -Destination (Join-Path $fixtureProject 'scripts')
    Copy-Item -LiteralPath (Join-Path $projectRoot 'scripts\start-candidate.ps1') -Destination (Join-Path $fixtureProject 'scripts')
    Copy-Item -LiteralPath (Join-Path $projectRoot 'docs\CANDIDATE_README.md') -Destination (Join-Path $fixtureProject 'docs')
    Copy-Item -LiteralPath $fixtureJar -Destination (Join-Path $fixtureProject 'fixture.jar')
    Write-Utf8 (Join-Path $fixtureRepo '.gitignore') "target/`n.local/`n.cache/`n"
    Write-Utf8 (Join-Path $fixtureProject '.cache\cache-only.txt') 'not for distribution'
    Write-Utf8 (Join-Path $fixtureProject '.local\data\tongpin.mv.db') 'preserve this fictional original'
    Write-Utf8 (Join-Path $fixtureProject 'target\thematic-friend-0.0.1-SNAPSHOT.jar') 'stale target must not be packaged'
    $wrapper = @'
@echo off
if not exist "%~dp0target" mkdir "%~dp0target"
copy /b "%~dp0fixture.jar" "%~dp0target\thematic-friend-0.0.1-SNAPSHOT.jar" >nul
exit /b %errorlevel%
'@
    Write-Utf8 (Join-Path $fixtureProject 'mvnw.cmd') $wrapper
    & git -C $fixtureRepo init --quiet
    & git -C $fixtureRepo config user.name 'Candidate test fixture'
    & git -C $fixtureRepo config user.email 'candidate-test@example.invalid'
    & git -C $fixtureRepo add .
    & git -C $fixtureRepo commit --quiet -m 'Record fictional packaging fixture'
    if ($LASTEXITCODE -ne 0) { throw 'Fixture repository failed.' }
    $packageScript = Join-Path $fixtureProject 'scripts\package-candidate.ps1'
    $packages = Join-Path $testRoot 'out space'
    Invoke-Case 'CAND-01' 'An immutable source archive builds a fresh JAR and excludes cache/database/stale target' {
        & $packageScript -OutputRoot $packages -SkipTests -ValidationReference 'Synthetic fixture; no application acceptance claimed' | Out-Null
        $script:bundle = (Get-ChildItem -LiteralPath $packages -Directory -Filter 'Mingle-RC-*' | Select-Object -First 1).FullName
        Assert-True ([bool]$script:bundle) 'Candidate not created.'
        $script:manifest = Get-Content -LiteralPath (Join-Path $script:bundle 'candidate.json') -Raw -Encoding UTF8 | ConvertFrom-Json
        Assert-True ($script:manifest.jarSha256 -eq (Get-FileHash -LiteralPath $fixtureJar -Algorithm SHA256).Hash.ToLowerInvariant()) 'Stale JAR was packaged.'
        Assert-True ($script:manifest.sourceCommit -eq (& git -C $fixtureRepo rev-parse HEAD).Trim()) 'Wrong source commit.'
        Assert-True (-not $script:manifest.build.testsRunInThisBuild) 'Skipped tests were claimed as run.'
        Assert-True ($script:manifest.build.arguments -contains '-DskipTests') 'Manifest omitted the actual test-skip argument.'
        $zip = [IO.Compression.ZipFile]::OpenRead((Join-Path $script:bundle 'source.zip'))
        try { Assert-True (@($zip.Entries | Where-Object FullName -Match '/(\.cache|\.local|target)/').Count -eq 0) 'Local data leaked into source archive.' } finally { $zip.Dispose() }
        foreach ($line in Get-Content -LiteralPath (Join-Path $script:bundle 'SHA256SUMS.txt')) {
            $parts = $line -split '  ', 2
            Assert-True ((Get-FileHash -LiteralPath (Join-Path $script:bundle $parts[1]) -Algorithm SHA256).Hash.ToLowerInvariant() -eq $parts[0]) 'Package checksum does not match.'
        }
    }
    $launcher = Join-Path $script:bundle 'Start-Mingle.ps1'
    Invoke-Case 'CAND-02' 'Check validates the package without creating a database or starting a server' {
        & $launcher -Check -Port (Free-Port) | Out-Null
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $script:bundle 'data'))) 'Check created runtime data.'
    }
    Invoke-Case 'CAND-03' 'Real Java launch forces English/loopback, resolves data beside the package and restores the environment' {
        $names = @('TONGPIN_DEMO_PASSWORD', 'TONGPIN_CHINESE_ENABLED', 'APP_DATA_DIR', 'APP_BIND_ADDRESS')
        $saved = @{}
        foreach ($name in $names) { $saved[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
        try {
            $env:TONGPIN_DEMO_PASSWORD = 'CandidateFixtureOnly123'
            $env:TONGPIN_CHINESE_ENABLED = 'true'
            $env:APP_DATA_DIR = 'unselected-original'
            $env:APP_BIND_ADDRESS = '0.0.0.0'
            & $launcher -NewData -DataDirectory 'fixture data' -Port (Free-Port) | Out-Null
            $started = Get-Content -LiteralPath (Join-Path $script:bundle 'fixture data\started.txt') -Raw
            foreach ($flag in @('--app.chinese-enabled=false', '--server.address=127.0.0.1', 'chinese=false', 'bind=127.0.0.1')) { Assert-True ($started.Contains($flag)) ('Missing setting: ' + $flag) }
            Assert-True ($env:TONGPIN_CHINESE_ENABLED -eq 'true' -and $env:APP_DATA_DIR -eq 'unselected-original' -and $env:APP_BIND_ADDRESS -eq '0.0.0.0') 'Launcher leaked process settings.'
            Assert-True ($env:TONGPIN_DEMO_PASSWORD -eq 'CandidateFixtureOnly123') 'Caller credential state was changed.'
        } finally { foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $saved[$name], 'Process') } }
    }
    Invoke-Case 'CAND-04' 'NewData rejects existing data without modifying it' {
        $marker = Join-Path $script:bundle 'fixture data\started.txt'
        $before = (Get-FileHash -LiteralPath $marker).Hash
        Assert-Throws { & $launcher -Check -NewData -DataDirectory 'fixture data' -Port (Free-Port) } 'requires a new directory'
        Assert-True ((Get-FileHash -LiteralPath $marker).Hash -eq $before) 'Existing data changed.'
    }
    Invoke-Case 'CAND-05' 'Modified JAR or source archive fails before launch' {
        foreach ($name in @('mingle.jar', 'source.zip')) {
            $file = Join-Path $script:bundle $name
            $bytes = [IO.File]::ReadAllBytes($file)
            try { [IO.File]::AppendAllText($file, 'tampered'); Assert-Throws { & $launcher -Check -Port (Free-Port) } ('Checksum mismatch: ' + $name) }
            finally { [IO.File]::WriteAllBytes($file, $bytes) }
        }
    }
    Invoke-Case 'CAND-06' 'An occupied port is rejected without stopping the owner' {
        $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
        $listener.Server.ExclusiveAddressUse = $true
        $listener.Start()
        try { Assert-Throws { & $launcher -Check -Port $listener.LocalEndpoint.Port } 'is unavailable'; Assert-True $listener.Server.IsBound 'Port owner was stopped.' }
        finally { $listener.Stop() }
    }
    Invoke-Case 'CAND-07' 'Dirty/untracked application changes and an unexplained test skip are rejected' {
        Assert-Throws { & $packageScript -OutputRoot $packages -SkipTests } 'requires -ValidationReference'
        $doc = Join-Path $fixtureProject 'docs\CANDIDATE_README.md'
        $bytes = [IO.File]::ReadAllBytes($doc)
        try { [IO.File]::AppendAllText($doc, 'uncommitted'); Assert-Throws { & $packageScript -OutputRoot $packages } 'must be clean' }
        finally { [IO.File]::WriteAllBytes($doc, $bytes) }
        $untracked = Join-Path $fixtureProject 'new-source.txt'
        try { Write-Utf8 $untracked 'uncommitted source'; Assert-Throws { & $packageScript -OutputRoot $packages } 'must be clean' }
        finally { Remove-Item -LiteralPath $untracked }
    }
    Invoke-Case 'CAND-08' 'Windows PowerShell reads the UTF-8 manifest and paths with spaces' {
        $windowsPowerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
        $previousModulePath = $env:PSModulePath
        try {
            $env:PSModulePath = $null
            & $windowsPowerShell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $launcher -Check -Port (Free-Port) | Out-Null
            Assert-True ($LASTEXITCODE -eq 0) 'Windows PowerShell package check failed.'
        } finally { $env:PSModulePath = $previousModulePath }
    }
    Invoke-Case 'CAND-10' 'A fresh current PowerShell process validates Java without inheriting a native exit code' {
        $currentPowerShell = (Get-Process -Id $PID).Path
        & $currentPowerShell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $launcher -Check -Port (Free-Port) | Out-Null
        Assert-True ($LASTEXITCODE -eq 0) 'Fresh PowerShell candidate check failed.'
    }
    Invoke-Case 'CAND-09' 'A failed build publishes no candidate and preserves diagnostic logs' {
        Write-Utf8 (Join-Path $fixtureProject 'mvnw.cmd') "@echo off`r`necho controlled fixture failure`r`nexit /b 7`r`n"
        & git -C $fixtureRepo add code/thematic-friend/mvnw.cmd
        & git -C $fixtureRepo commit --quiet -m 'Inject a controlled fixture build failure'
        $before = @(Get-ChildItem -LiteralPath $packages -Directory -Filter 'Mingle-RC-*').Count
        Assert-Throws { & $packageScript -OutputRoot $packages -SkipTests -ValidationReference 'Synthetic failure fixture' } 'Candidate build failed'
        Assert-True (@(Get-ChildItem -LiteralPath $packages -Directory -Filter 'Mingle-RC-*').Count -eq $before) 'Failed candidate was published.'
        Assert-True (@(Get-ChildItem -LiteralPath $packages -Directory -Filter '.candidate-build-*').Count -eq 1) 'Failed build diagnostics were lost.'
    }
    Write-Output ('Candidate checks: ' + $results.Count + ' passed.')
} finally {
    if ($KeepArtifacts) { Write-Output ('Candidate test artifacts: ' + $testRoot) }
    elseif ((Test-Path -LiteralPath $testRoot) -and $testRoot.StartsWith($testParent + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -and [IO.Path]::GetFileName($testRoot) -eq $testName) {
        Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
}
exit 0
