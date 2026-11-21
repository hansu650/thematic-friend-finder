# Mingle local operations handover

This runbook covers the Windows Java 21 release with one application process per file-backed H2 data directory. Run the commands from `code/thematic-friend`. Record the Git revision, JAR SHA-256, port, absolute data path, and the shell used before handing the release over.

## Build and start

```powershell
javac -version
java -version
.\scripts\build.ps1
$jar = (Resolve-Path -LiteralPath '.\target\thematic-friend-0.0.1-SNAPSHOT.jar').Path
Get-FileHash -LiteralPath $jar -Algorithm SHA256
```

`JAVA_HOME` must point to the JDK 21 installation. The first build downloads the Maven distribution and dependencies into `.cache/maven`. If Java prints a banner from `JAVA_TOOL_OPTIONS` before its version, run the build helper in a session with that variable unset and record the environment difference. Use a free loopback port. Leave any process already using the intended port running and select another port.

For a new fictional recovery exercise, start a disposable seed database with an explicit data path and port. Use two separate browser sessions to sign in as `demo_zhou` and `demo_lin`. Record unique profile, message and saved-event markers before stopping the app.

```powershell
.\scripts\run-demo.ps1 -DataDirectory '.local\w4-f\原始数据库' -Port 18080
```

To verify recovery, set the data path to the directory already populated by `restore.ps1` and launch the JAR directly with the `default` Spring profile. The demo launcher always selects the `demo` profile. Preserve the original database credentials if configured and supply them through the local environment.

```powershell
$port = 18081
$data = (Resolve-Path -LiteralPath '.local\w4-f\恢复数据库').Path
if (!(Test-Path -LiteralPath (Join-Path $data 'tongpin.mv.db') -PathType Leaf)) {
    throw 'Restored H2 file is missing.'
}
$env:APP_DATA_DIR = $data
Remove-Item Env:TONGPIN_DEMO_PASSWORD -ErrorAction SilentlyContinue
& "$env:JAVA_HOME\bin\java.exe" -jar $jar '--server.address=127.0.0.1' "--server.port=$port" '--spring.profiles.active=default' '--app.chinese-enabled=false'
```

In a second terminal, confirm HTTP 200 at `http://127.0.0.1:18081/login`. Sign in as the known accounts and check the expected profile values, shared conversation, message count, and account-specific saved event. For the English demonstration, verify that `/profile?lang=zh` still renders English and the Chinese switch is hidden.

## Stop and back up

1. Record the running release and its actual `APP_DATA_DIR`. Stop the specific foreground Java process with Ctrl+C. Wait for the process to exit and look for Hikari's `Shutdown completed` line. The backup helper checks for H2 lock files. Confirm the process is stopped even if the directory has no lock file.
2. Run the following against the stopped database. Resolve the original path from the startup record. Keep the backup root outside the database directory. Retain the newly printed backup path.

```powershell
$original = (Resolve-Path -LiteralPath '.local\w4-f\原始数据库').Path
$backupRoot = Join-Path (Get-Location).Path '.local\w4-f\备份数据'
.\scripts\backup.ps1 -DataDirectory $original -BackupRoot $backupRoot
```

## Restore and switch over

Use the exact timestamped directory printed by `backup.ps1` and a destination path that does not exist. The next block uses a prompt so the chosen backup is explicit when several copies are present.

```powershell
$backup = (Resolve-Path -LiteralPath (Read-Host 'Paste the backup directory')).Path
$destination = Join-Path (Get-Location).Path '.local\w4-f\恢复数据库'
.\scripts\restore.ps1 -BackupDirectory $backup -Destination $destination
Get-FileHash -LiteralPath (Join-Path $destination 'tongpin.mv.db') -Algorithm SHA256
```

The restore helper compares `manifest.json` to `manifest.sha256` and checks the size and SHA-256 of each listed payload before staging the destination. Keep the checksum files with the backup. SHA-256 detects corruption against the recorded manifest. Store the original backup where access and changes can be controlled. If restore rejects the backup or destination, keep the diagnostic, select an intact backup or a fresh destination, and retry. An occupied directory is protected from overwrite.

Use the start block with the verified restoration path and the same release JAR. Compare the checksum before H2 first opens the copy. A running H2 instance can legitimately update the restored file. If upgrading between revisions, confirm schema compatibility and repeat the functional checks on the copy before switching users to it.

## Roll back

1. If the restored run fails startup or record checks, stop that instance and retain its logs and data directory for diagnosis.
2. Set `APP_DATA_DIR` back to the recorded original path and start the previously working JAR with its original configuration. Use the same port only after the failed instance has exited.
3. Verify `/login` and the expected records. Record the selected revision, JAR hash, path, and result. If the original was changed by an upgrade, restore the matching pre-upgrade backup to a fresh directory and use the matching release JAR. Confirm rollback with the release owner before switching a shared system with new writes.

The Week 4 verification record lists the tested revision, exact commands, and outcomes. [F recovery record](progress/week4/F_recovery_record.md)
