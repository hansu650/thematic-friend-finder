[CmdletBinding()]
param(
    [ValidateRange(1, 65535)][int]$Port = 8080,
    [string]$DataDirectory,
    [switch]$NewData,
    [switch]$Check
)
$ErrorActionPreference = 'Stop'
$manifestPath = Join-Path $PSScriptRoot 'candidate.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw 'candidate.json is missing; extract the whole candidate package.' }
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.schemaVersion -ne 1 -or $manifest.sourceCommit -notmatch '^[a-f0-9]{40}$') { throw 'Invalid candidate manifest.' }
foreach ($item in @(@('mingle.jar', $manifest.jarSha256), @('source.zip', $manifest.sourceArchiveSha256))) {
    $file = Join-Path $PSScriptRoot $item[0]
    if ($item[1] -notmatch '^[a-f0-9]{64}$' -or -not (Test-Path -LiteralPath $file -PathType Leaf)) { throw ('Missing artifact or checksum: ' + $item[0]) }
    if ((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item[1]) { throw ('Checksum mismatch: ' + $item[0]) }
}
if ($PSBoundParameters.ContainsKey('DataDirectory') -and [string]::IsNullOrWhiteSpace($DataDirectory)) { throw 'DataDirectory must not be empty.' }
if (-not $DataDirectory) { $DataDirectory = Join-Path $PSScriptRoot 'data' }
elseif (-not [IO.Path]::IsPathRooted($DataDirectory)) { $DataDirectory = Join-Path $PSScriptRoot $DataDirectory }
$DataDirectory = [IO.Path]::GetFullPath($DataDirectory)
if (Test-Path -LiteralPath $DataDirectory -PathType Leaf) { throw 'DataDirectory must be a directory.' }
if ($NewData -and (Test-Path -LiteralPath $DataDirectory)) { throw '-NewData requires a new directory; existing data was preserved.' }
$javaCommand = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin\java.exe' }
    elseif (Test-Path -LiteralPath 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot\bin\java.exe') { 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot\bin\java.exe' }
    else { 'java' }
if (-not (Get-Command $javaCommand -ErrorAction SilentlyContinue)) { throw 'Java was not found. Set JAVA_HOME to JDK 21.' }
$javaVersion = (& $javaCommand --version 2>&1 | Select-Object -First 1).ToString()
if ($LASTEXITCODE -ne 0 -or $javaVersion -notmatch '\b21(?:[.\s]|$)') { throw 'Java 21 is required.' }
$probe = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
try { $probe.Server.ExclusiveAddressUse = $true; $probe.Start() }
catch [Net.Sockets.SocketException] { throw ('Port ' + $Port + ' is unavailable. Choose -Port or use the existing application.') }
finally { $probe.Stop() }
Write-Output ('Source commit: ' + $manifest.sourceCommit)
Write-Output ('JAR SHA-256: ' + $manifest.jarSha256)
Write-Output ('Data directory: ' + $DataDirectory)
if ($Check) { Write-Output 'Candidate checks passed. No server or database was started.'; return }
$saved = @{}
foreach ($name in @('TONGPIN_DEMO_PASSWORD', 'TONGPIN_CHINESE_ENABLED', 'APP_DATA_DIR', 'APP_BIND_ADDRESS')) {
    $saved[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}
try {
    if (-not $env:TONGPIN_DEMO_PASSWORD) {
        $secret = Read-Host 'Enter the local demo password (new accounts use it; existing accounts keep theirs)' -AsSecureString
        $env:TONGPIN_DEMO_PASSWORD = [Net.NetworkCredential]::new('', $secret).Password
    }
    if ($env:TONGPIN_DEMO_PASSWORD.Length -lt 10 -or $env:TONGPIN_DEMO_PASSWORD.Length -gt 64 -or [Text.Encoding]::UTF8.GetByteCount($env:TONGPIN_DEMO_PASSWORD) -gt 72) {
        throw 'Use 10-64 characters and no more than 72 UTF-8 bytes.'
    }
    $env:APP_DATA_DIR = $DataDirectory
    $env:TONGPIN_CHINESE_ENABLED = 'false'
    $env:APP_BIND_ADDRESS = '127.0.0.1'
    Write-Output ('Open http://127.0.0.1:' + $Port + '/login (demo_zhou or demo_lin). English mode is enforced.')
    & $javaCommand -jar (Join-Path $PSScriptRoot 'mingle.jar') --spring.profiles.active=demo --app.chinese-enabled=false --server.address=127.0.0.1 ('--server.port=' + $Port)
    if ($LASTEXITCODE -ne 0) { throw ('Application exited with code ' + $LASTEXITCODE) }
} finally {
    foreach ($name in $saved.Keys) { [Environment]::SetEnvironmentVariable($name, $saved[$name], 'Process') }
}
