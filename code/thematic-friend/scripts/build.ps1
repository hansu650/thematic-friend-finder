param([switch]$SkipTests)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
if (-not $env:JAVA_HOME) {
    $knownJdk = 'D:\kaifagongju\Java\jdk-21.0.12.1-hotspot'
    if (Test-Path -LiteralPath "$knownJdk\bin\java.exe") { $env:JAVA_HOME = $knownJdk }
    else {
        $javaOnPath = Get-Command java -ErrorAction SilentlyContinue
        if ($javaOnPath -and $javaOnPath.Source) {
            $env:JAVA_HOME = Split-Path (Split-Path $javaOnPath.Source -Parent) -Parent
        } else { throw 'Set JAVA_HOME to a JDK 21 installation before building.' }
    }
}
$javaPath = Join-Path $env:JAVA_HOME 'bin\java.exe'
if (-not (Test-Path -LiteralPath $javaPath -PathType Leaf)) {
    throw "JAVA_HOME does not point to a JDK with bin\java.exe: $env:JAVA_HOME"
}
$javaVersion = (& $javaPath --version 2>&1 | Select-Object -First 1).ToString()
if ($javaVersion -notmatch '\b21(?:[.\s]|$)') {
    throw "Java 21 is required. Detected: $javaVersion"
}
$env:MAVEN_USER_HOME = Join-Path $projectDir '.cache\maven'
Push-Location $projectDir
try {
    $mavenArgs = @('--batch-mode','--no-transfer-progress','package')
    if ($SkipTests) { $mavenArgs += '-DskipTests' }
    & '.\mvnw.cmd' @mavenArgs
    if ($LASTEXITCODE -ne 0) { throw "Maven failed with exit code $LASTEXITCODE." }
} finally { Pop-Location }
