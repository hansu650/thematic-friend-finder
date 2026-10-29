param([int]$Port = 8765)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$friendPython = Join-Path $PSScriptRoot '.conda\python.exe'
if (-not (Test-Path -LiteralPath $friendPython)) { throw 'Create the project Conda environment first; see README.md.' }
& $friendPython manage.py migrate --noinput
if ($LASTEXITCODE -ne 0) { throw 'Migration failed' }
& $friendPython manage.py seed_demo
if ($LASTEXITCODE -ne 0) { throw 'Demo setup failed' }
& $friendPython manage.py runserver "127.0.0.1:$Port" --noreload
