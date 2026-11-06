param([switch]$SkipTests)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
if (-not $env:JAVA_HOME) {
    $knownJdk = 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot'
    if (Test-Path -LiteralPath "$knownJdk\bin\java.exe") { $env:JAVA_HOME = $knownJdk }
    else { throw 'Set JAVA_HOME to a JDK 21 installation before building.' }
}
$env:MAVEN_USER_HOME = Join-Path $projectDir '.cache\maven'
Push-Location $projectDir
try {
    $mavenArgs = @('--batch-mode','--no-transfer-progress','package')
    if ($SkipTests) { $mavenArgs += '-DskipTests' }
    & '.\mvnw.cmd' @mavenArgs
    if ($LASTEXITCODE -ne 0) { throw "Maven failed with exit code $LASTEXITCODE." }
} finally { Pop-Location }
