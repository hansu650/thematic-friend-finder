param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$jarPath = Join-Path $projectDir 'target\thematic-friend-0.0.1-SNAPSHOT.jar'
if (-not (Test-Path -LiteralPath $jarPath)) { & "$PSScriptRoot\build.ps1" }
$javaCommand = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin\java.exe' }
    elseif (Test-Path -LiteralPath 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot\bin\java.exe') { 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot\bin\java.exe' }
    else { 'java' }
$previousPassword = $env:TONGPIN_DEMO_PASSWORD
if (-not $env:TONGPIN_DEMO_PASSWORD) {
    $enteredPassword = Read-Host 'Choose a local demo password (10–64 characters)' -AsSecureString
    $env:TONGPIN_DEMO_PASSWORD = [System.Net.NetworkCredential]::new('', $enteredPassword).Password
}
if ($env:TONGPIN_DEMO_PASSWORD.Length -lt 10 -or $env:TONGPIN_DEMO_PASSWORD.Length -gt 64 -or [Text.Encoding]::UTF8.GetByteCount($env:TONGPIN_DEMO_PASSWORD) -gt 72) {
    $env:TONGPIN_DEMO_PASSWORD = $previousPassword
    throw 'Use 10–64 characters and no more than 72 UTF-8 bytes.'
}
Push-Location $projectDir
try {
    Write-Host "Open http://127.0.0.1:$Port/ and sign in as demo_zhou or demo_lin."
    Write-Host 'Existing demo accounts keep the password used when first created.'
    & $javaCommand '-jar' $jarPath '--spring.profiles.active=demo' "--server.port=$Port"
    if ($LASTEXITCODE -ne 0) { throw "Application exited with code $LASTEXITCODE." }
} finally { $env:TONGPIN_DEMO_PASSWORD = $previousPassword; Pop-Location }
