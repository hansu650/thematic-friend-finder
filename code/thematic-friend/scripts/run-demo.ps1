param(
    [ValidateRange(1, 65535)][int]$Port = 8080,
    [string]$DataDirectory,
    [switch]$Rebuild
)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$jarPath = Join-Path $projectDir 'target\thematic-friend-0.0.1-SNAPSHOT.jar'
$savedData = $false
if ($PSBoundParameters.ContainsKey('DataDirectory')) {
    if ([string]::IsNullOrWhiteSpace($DataDirectory)) { throw 'DataDirectory must not be empty.' }
} elseif (-not [string]::IsNullOrWhiteSpace($env:APP_DATA_DIR)) {
    $DataDirectory = $env:APP_DATA_DIR
} else {
    $statePath = Join-Path $projectDir '.local\mingle-demo-runtime\server-state.json'
    if (Test-Path -LiteralPath $statePath -PathType Leaf) {
        $state = Get-Content -LiteralPath $statePath -Encoding UTF8 -Raw | ConvertFrom-Json
        if ($state.data -isnot [string] -or [string]::IsNullOrWhiteSpace($state.data)) {
            throw 'The saved demo state has no data directory. Pass -DataDirectory explicitly.'
        }
        $DataDirectory = $state.data
        $savedData = $true
    } else {
        $DataDirectory = '.local\data'
    }
}
if (-not [IO.Path]::IsPathRooted($DataDirectory)) { $DataDirectory = Join-Path $projectDir $DataDirectory }
$DataDirectory = [IO.Path]::GetFullPath($DataDirectory)
if ($savedData -and -not (Test-Path -LiteralPath (Join-Path $DataDirectory 'tongpin.mv.db') -PathType Leaf)) {
    throw 'The saved demo database is missing. Pass -DataDirectory explicitly to choose another database.'
}
if (Test-Path -LiteralPath $DataDirectory -PathType Leaf) { throw 'DataDirectory must be a directory.' }

$portProbe = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
try {
    $portProbe.Server.ExclusiveAddressUse = $true
    $portProbe.Start()
} catch [Net.Sockets.SocketException] {
    throw "Port $Port is unavailable. If Mingle is already running, open http://127.0.0.1:$Port/login; otherwise stop the application using that port or choose -Port."
} finally { $portProbe.Stop() }

if ($Rebuild -or -not (Test-Path -LiteralPath $jarPath)) { & "$PSScriptRoot\build.ps1" }
$javaCommand = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin\java.exe' }
    elseif (Test-Path -LiteralPath 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot\bin\java.exe') { 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot\bin\java.exe' }
    else { 'java' }
if (-not (Get-Command $javaCommand -ErrorAction SilentlyContinue) -and -not (Test-Path -LiteralPath $javaCommand -PathType Leaf)) {
    throw "Java executable was not found. Set JAVA_HOME to a JDK 21 installation; attempted: $javaCommand"
}
$previousPassword = $env:TONGPIN_DEMO_PASSWORD
$previousDataDirectory = $env:APP_DATA_DIR
try {
    if (-not $env:TONGPIN_DEMO_PASSWORD) {
        $enteredPassword = Read-Host 'Enter the local demo password (choose one only for new accounts)' -AsSecureString
        $env:TONGPIN_DEMO_PASSWORD = [System.Net.NetworkCredential]::new('', $enteredPassword).Password
    }
    if ($env:TONGPIN_DEMO_PASSWORD.Length -lt 10 -or $env:TONGPIN_DEMO_PASSWORD.Length -gt 64 -or [Text.Encoding]::UTF8.GetByteCount($env:TONGPIN_DEMO_PASSWORD) -gt 72) {
        throw 'Use 10-64 characters and no more than 72 UTF-8 bytes.'
    }
    $env:APP_DATA_DIR = $DataDirectory
    Push-Location $projectDir
    try {
        Write-Host "Open http://127.0.0.1:$Port/login and sign in as demo_zhou or demo_lin."
        Write-Host "Data directory: $DataDirectory"
        Write-Host 'Existing demo accounts keep their original passwords and profiles.'
        & $javaCommand '-jar' $jarPath '--spring.profiles.active=demo' "--server.port=$Port"
        if ($LASTEXITCODE -ne 0) { throw "Application exited with code $LASTEXITCODE." }
    } finally { Pop-Location }
} finally {
    $env:TONGPIN_DEMO_PASSWORD = $previousPassword
    $env:APP_DATA_DIR = $previousDataDirectory
}
