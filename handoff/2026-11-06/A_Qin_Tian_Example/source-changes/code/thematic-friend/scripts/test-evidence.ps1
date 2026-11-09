param(
    [switch]$NoPause,
    [switch]$Online
)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$runName = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,6)
$runDir = Join-Path $projectDir ('.local/terminal-evidence/' + $runName)
$buildDir = Join-Path $runDir 'build'
$transcriptStarted = $false
$overallExit = 1
$javaExit = $null
$browserExit = $null
$startedAt = [DateTime]::UtcNow.ToString('o')
$environmentKeys = @('JAVA_HOME','MAVEN_USER_HOME','MINGLE_TEST_JAR','MINGLE_TEST_OUTPUT','MINGLE_PLAYWRIGHT_MODULE','MINGLE_BROWSER_PATH','MINGLE_CAPTURE_MODULE','MINGLE_MOTION_MODULE')
$previousEnvironment = @{}
foreach ($name in $environmentKeys) { $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name,'Process') }

function Pause-ForScreenshot([string]$Prompt) {
    Write-Host ''
    Write-Host $Prompt -ForegroundColor Cyan
    if (-not $NoPause) { [void](Read-Host 'Take the screenshot now, then press Enter to continue') }
}

function Invoke-LoggedCommand([string]$Executable,[string[]]$Arguments,[string]$LogFile) {
    Write-Host ('Command: & "' + $Executable + '" ' + (($Arguments | ForEach-Object { '"' + $_ + '"' }) -join ' '))
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & $Executable @Arguments 2>&1 | Tee-Object -FilePath $LogFile | Out-Host
        $commandExit = $LASTEXITCODE
    } finally { $ErrorActionPreference = $oldPreference }
    return [int]$commandExit
}

try {
    New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
    Start-Transcript -LiteralPath (Join-Path $runDir 'terminal-transcript.txt') | Out-Host
    $transcriptStarted = $true
    $knownJdk = 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot'
    if (Test-Path -LiteralPath (Join-Path $knownJdk 'bin/java.exe')) { $env:JAVA_HOME = $knownJdk }
    if (-not $env:JAVA_HOME -or -not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin/java.exe'))) { throw 'Set JAVA_HOME to an existing JDK 21 installation.' }
    Write-Host 'Mingle: LIVE Java and browser verification' -ForegroundColor Cyan
    Write-Host ('Started: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))
    Write-Host ('Source:  ' + $projectDir)
    Write-Host ('Evidence: ' + $runDir)
    & (Join-Path $env:JAVA_HOME 'bin/java.exe') --version
    if ($LASTEXITCODE -ne 0) { throw 'Java could not start.' }

    # Freeze the inputs and build separately, so an open demo JAR is untouched.
    foreach ($item in @('src','.mvn','pom.xml','mvnw','mvnw.cmd')) {
        Copy-Item -LiteralPath (Join-Path $projectDir $item) -Destination $buildDir -Recurse
    }
    $browserSource = Join-Path $projectDir 'scripts/browser'
    $browserCopy = Join-Path $buildDir 'scripts/browser'
    New-Item -ItemType Directory -Path $browserCopy -Force | Out-Null
    Get-ChildItem -LiteralPath $browserSource -File | Where-Object { $_.Extension -in '.mjs','.json','.md' } | Copy-Item -Destination $browserCopy
    $manifest = @(Get-ChildItem -LiteralPath $buildDir -File -Recurse | Sort-Object FullName | ForEach-Object {
        [ordered]@{ path=$_.FullName.Substring($buildDir.Length+1).Replace('\','/'); sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
    })
    $manifestPath = Join-Path $runDir 'source-manifest.json'
    $manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
    $sourceFingerprint = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
    Write-Host ('Source manifest SHA256: ' + $sourceFingerprint)

    $env:MAVEN_USER_HOME = Join-Path $projectDir '.cache/maven'
    $mavenRepo = Join-Path $env:MAVEN_USER_HOME 'repository'
    $mavenArgs = @('--batch-mode','--no-transfer-progress','-Dstyle.color=never',('-Dmaven.repo.local=' + $mavenRepo))
    if (-not $Online) { $mavenArgs += '--offline' }
    $mavenArgs += 'package'
    Write-Host ''
    Write-Host '01 - Maven: actual build and test output' -ForegroundColor Cyan
    Push-Location $buildDir
    try { $javaExit = Invoke-LoggedCommand (Join-Path $buildDir 'mvnw.cmd') $mavenArgs (Join-Path $runDir 'java-output.txt') }
    finally { Pop-Location }
    Write-Host ('Java process exit code: ' + $javaExit)
    Write-Host ('Finished: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))
    Pause-ForScreenshot 'SCREENSHOT 01: include Maven Tests run, BUILD SUCCESS/FAILURE and the exit code.'
    if ($javaExit -ne 0) { throw 'Maven failed. Preserve this real result; browser verification was not run.' }

    $nodeCandidates = @('D:\kaifagongju\NodeJS\node.exe',(Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'))
    $node = $nodeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (-not $node) { $nodeCommand = Get-Command node -ErrorAction SilentlyContinue; if ($nodeCommand) { $node = $nodeCommand.Source } }
    if (-not $node) { throw 'No existing Node.js executable found. Install/choose it separately before browser verification.' }
    $moduleCandidates = @((Join-Path $browserSource 'node_modules/playwright/index.mjs'),(Join-Path $projectDir 'node_modules/playwright/index.mjs'),'D:\daima\codex\hallcycle-recording-skills\node_modules\playwright\index.mjs')
    $playwright = $moduleCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (-not $playwright) { throw 'Playwright is not installed. See scripts/browser/README.md; this script does not install dependencies.' }
    $env:MINGLE_PLAYWRIGHT_MODULE = ([Uri]$playwright).AbsoluteUri
    $edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    if (Test-Path -LiteralPath $edge) { $env:MINGLE_BROWSER_PATH = $edge }
    $capture = 'D:\daima\codex\hallcycle-recording-skills\capture.mjs'
    $motion = 'D:\daima\codex\hallcycle-recording-skills\natural-motion.mjs'
    if (Test-Path -LiteralPath $capture) { $env:MINGLE_CAPTURE_MODULE = ([Uri]$capture).AbsoluteUri }
    if (Test-Path -LiteralPath $motion) { $env:MINGLE_MOTION_MODULE = ([Uri]$motion).AbsoluteUri }
    $env:MINGLE_TEST_JAR = Join-Path $buildDir 'target/thematic-friend-0.0.1-SNAPSHOT.jar'
    $env:MINGLE_TEST_OUTPUT = Join-Path $runDir 'browser'
    $jarHash = (Get-FileHash -LiteralPath $env:MINGLE_TEST_JAR -Algorithm SHA256).Hash.ToLowerInvariant()
    Write-Host ''
    Write-Host '02 - Browser: actual isolated UI assertions' -ForegroundColor Cyan
    Write-Host ('Started: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))
    & $node --version
    Write-Host ('Tested JAR SHA256: ' + $jarHash)
    $browserExit = Invoke-LoggedCommand $node @((Join-Path $browserCopy 'run-discovery-check.mjs')) (Join-Path $runDir 'browser-output.txt')
    Write-Host ('Browser process exit code: ' + $browserExit)
    Write-Host ('Finished: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))
    Pause-ForScreenshot 'SCREENSHOT 02: include the actual PASS lines, BrowserExit and process exit code.'
    if ($browserExit -ne 0) { throw 'Browser assertions failed. Preserve this real result and inspect the output.' }
    $overallExit = 0
    Write-Host ('Raw logs and source manifest: ' + $runDir)
    Write-Host 'No terminal screenshot has been created by this script. Save your captures from the visible terminal.'
} catch {
    Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
    Pause-ForScreenshot 'Keep this error visible if you are documenting a failed run.'
} finally {
    if (Test-Path -LiteralPath $runDir) {
        [ordered]@{startedAt=$startedAt;finishedAt=[DateTime]::UtcNow.ToString('o');source=$projectDir;javaExit=$javaExit;browserExit=$browserExit;overallExit=$overallExit;terminalScreenshot='User capture pending'} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runDir 'run.json') -Encoding UTF8
    }
    if ($transcriptStarted) { Stop-Transcript | Out-Host }
    foreach ($name in $environmentKeys) { [Environment]::SetEnvironmentVariable($name,$previousEnvironment[$name],'Process') }
}
exit $overallExit
