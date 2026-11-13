[CmdletBinding()]
param(
    [string]$DataDirectory = (Join-Path (Split-Path $PSScriptRoot -Parent) '.local\data'),
    [string]$BackupRoot = (Join-Path (Split-Path $PSScriptRoot -Parent) '.local\backups')
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
    $relative = $Path.Substring($Root.Length).TrimStart('\', '/')
    return $relative.Replace('\', '/')
}

$source = Get-FullPath $DataDirectory -MustExist
if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    throw "Database data path is not a directory: $source"
}

$backupRootFull = Get-FullPath $BackupRoot
$sourcePrefix = $source + [IO.Path]::DirectorySeparatorChar
if ($backupRootFull.StartsWith($sourcePrefix, [StringComparison]::OrdinalIgnoreCase) -or
    $backupRootFull.Equals($source, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Backup destination must not be inside the source data directory: $backupRootFull"
}

$lockFiles = @(Get-ChildItem -LiteralPath $source -Filter '*.lock.db' -File -Recurse -ErrorAction SilentlyContinue)
if ($lockFiles.Count -gt 0) {
    $names = ($lockFiles | ForEach-Object { $_.FullName }) -join ', '
    throw "The database appears to be running. Stop the application and remove no files; lock file(s): $names"
}

$files = @(Get-ChildItem -LiteralPath $source -File -Recurse)
if ($files.Count -eq 0) { throw "No database files found in: $source" }

New-Item -ItemType Directory -Path $backupRootFull -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmssfff'
$backupDirectory = Join-Path $backupRootFull ("backup-$stamp")
if (Test-Path -LiteralPath $backupDirectory) {
    $backupDirectory = Join-Path $backupRootFull ("backup-$stamp-" + ([guid]::NewGuid().ToString('N').Substring(0, 8)))
}
$staging = Join-Path $backupRootFull ('.backup-' + [guid]::NewGuid().ToString('N'))

try {
    New-Item -ItemType Directory -Path $staging -Force | Out-Null
    $manifestFiles = [Collections.Generic.List[object]]::new()
    foreach ($file in $files) {
        $relative = Get-RelativePath $source $file.FullName
        $target = Join-Path $staging ($relative.Replace('/', [IO.Path]::DirectorySeparatorChar))
        $targetParent = Split-Path -Parent $target
        New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
        Copy-Item -LiteralPath $file.FullName -Destination $target
        $hash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
        $manifestFiles.Add([ordered]@{
            path = $relative
            bytes = [int64]$file.Length
            sha256 = $hash
        })
    }

    $manifest = [ordered]@{
        format = 'mingle-h2-backup-v1'
        createdUtc = [DateTime]::UtcNow.ToString('o')
        sourceDataDirectory = $source
        files = @($manifestFiles)
    }
    $manifestPath = Join-Path $staging 'manifest.json'
    $json = $manifest | ConvertTo-Json -Depth 8
    [IO.File]::WriteAllText($manifestPath, $json, [Text.UTF8Encoding]::new($false))
    $manifestHash = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
    [IO.File]::WriteAllText((Join-Path $staging 'manifest.sha256'), "$manifestHash  manifest.json`n", [Text.UTF8Encoding]::new($false))

    Move-Item -LiteralPath $staging -Destination $backupDirectory
    Write-Output "Backup created: $backupDirectory"
    Write-Output "Files: $($manifestFiles.Count); manifest SHA-256: $manifestHash"
}
catch {
    if (Test-Path -LiteralPath $staging) { Remove-Item -LiteralPath $staging -Recurse -Force -ErrorAction SilentlyContinue }
    throw "Backup failed: $($_.Exception.Message)"
}
