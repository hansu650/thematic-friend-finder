[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BackupDirectory,
    [Parameter(Mandatory = $true)]
    [string]$Destination
)

$ErrorActionPreference = 'Stop'

function Get-FullPath([string]$Path, [switch]$MustExist) {
    if ([string]::IsNullOrWhiteSpace($Path)) { throw 'A path is required.' }
    if ($MustExist) {
        if (-not (Test-Path -LiteralPath $Path)) { throw "Path does not exist: $Path" }
        return (Resolve-Path -LiteralPath $Path).Path.TrimEnd('\', '/')
    }
    return [IO.Path]::GetFullPath($Path).TrimEnd('\', '/')
}

function Get-RelativePath([string]$Root, [string]$Path) {
    return $Path.Substring($Root.Length).TrimStart('\', '/').Replace('\', '/')
}

function Assert-SafeRelativePath([string]$RelativePath) {
    if ([string]::IsNullOrWhiteSpace($RelativePath) -or [IO.Path]::IsPathRooted($RelativePath) -or $RelativePath.Contains(':')) {
        throw "Unsafe manifest path: '$RelativePath'"
    }
    $parts = $RelativePath.Replace('\', '/') -split '/'
    if ($parts.Count -eq 0 -or ($parts | Where-Object { $_ -eq '' -or $_ -eq '.' -or $_ -eq '..' }).Count -gt 0) {
        throw "Unsafe manifest path: '$RelativePath'"
    }
}

$backup = Get-FullPath $BackupDirectory -MustExist
if (-not (Test-Path -LiteralPath $backup -PathType Container)) { throw "Backup path is not a directory: $backup" }
$destinationFull = Get-FullPath $Destination
$backupPrefix = $backup + [IO.Path]::DirectorySeparatorChar
if ($destinationFull.StartsWith($backupPrefix, [StringComparison]::OrdinalIgnoreCase) -or
    $destinationFull.Equals($backup, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Restore destination must be outside the backup directory.'
}
if (Test-Path -LiteralPath $destinationFull) {
    throw "Restore destination already exists; refusing to overwrite: $destinationFull"
}

$manifestPath = Join-Path $backup 'manifest.json'
$manifestHashPath = Join-Path $backup 'manifest.sha256'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf) -or -not (Test-Path -LiteralPath $manifestHashPath -PathType Leaf)) {
    throw 'Backup is incomplete: manifest.json and manifest.sha256 are both required.'
}

$expectedManifestHash = ((Get-Content -LiteralPath $manifestHashPath -Encoding UTF8 -Raw).Trim() -split '\s+')[0].ToLowerInvariant()
$actualManifestHash = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($expectedManifestHash -notmatch '^[0-9a-f]{64}$' -or $expectedManifestHash -ne $actualManifestHash) {
    throw "Manifest checksum mismatch. Expected $expectedManifestHash, got $actualManifestHash."
}

try { $manifest = Get-Content -LiteralPath $manifestPath -Encoding UTF8 -Raw | ConvertFrom-Json } catch { throw "Invalid manifest JSON: $($_.Exception.Message)" }
if ($manifest.format -ne 'mingle-h2-backup-v1') { throw "Unsupported backup format: $($manifest.format)" }
$entries = @($manifest.files)
if ($entries.Count -eq 0) { throw 'Manifest contains no database files.' }

$seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($entry in $entries) {
    $relative = [string]$entry.path
    Assert-SafeRelativePath $relative
    if (-not $seen.Add($relative.Replace('\', '/'))) { throw "Manifest contains a duplicate path: $relative" }
    if ($entry.bytes -lt 0 -or [string]::IsNullOrWhiteSpace([string]$entry.sha256) -or [string]$entry.sha256 -notmatch '^[0-9a-fA-F]{64}$') {
        throw "Manifest entry is invalid: $relative"
    }
    $filePath = Join-Path $backup ($relative.Replace('/', [IO.Path]::DirectorySeparatorChar))
    $resolvedFile = [IO.Path]::GetFullPath($filePath)
    if (-not $resolvedFile.StartsWith($backupPrefix, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $resolvedFile -PathType Leaf)) {
        throw "Backup file is missing or outside the backup directory: $relative"
    }
    $fileInfo = Get-Item -LiteralPath $resolvedFile
    if ([int64]$fileInfo.Length -ne [int64]$entry.bytes) { throw "Size mismatch for backup file: $relative" }
    $actual = (Get-FileHash -LiteralPath $resolvedFile -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne ([string]$entry.sha256).ToLowerInvariant()) { throw "Checksum mismatch for backup file: $relative" }
}

$payloadFiles = @(Get-ChildItem -LiteralPath $backup -File -Recurse | Where-Object { $_.Name -notin @('manifest.json', 'manifest.sha256') })
foreach ($payload in $payloadFiles) {
    $relative = Get-RelativePath $backup $payload.FullName
    if (-not $seen.Contains($relative)) { throw "Unexpected file in backup: $relative" }
}

$parent = Split-Path -Parent $destinationFull
New-Item -ItemType Directory -Path $parent -Force | Out-Null
$staging = Join-Path $parent ('.restore-' + [guid]::NewGuid().ToString('N'))
try {
    New-Item -ItemType Directory -Path $staging -Force | Out-Null
    foreach ($entry in $entries) {
        $relative = ([string]$entry.path).Replace('/', [IO.Path]::DirectorySeparatorChar)
        $target = Join-Path $staging $relative
        New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $backup $relative) -Destination $target
    }
    Move-Item -LiteralPath $staging -Destination $destinationFull
}
catch {
    if (Test-Path -LiteralPath $staging) { Remove-Item -LiteralPath $staging -Recurse -Force -ErrorAction SilentlyContinue }
    throw "Restore failed: $($_.Exception.Message)"
}

Write-Output "Restore completed: $destinationFull"
Write-Output "Files restored: $($entries.Count); source backup: $backup"
