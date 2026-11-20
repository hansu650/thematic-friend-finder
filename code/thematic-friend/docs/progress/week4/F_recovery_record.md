# F | Independent Windows reproduction and H2 recovery

The available Windows 11 machine ran an isolated Codex-assisted exercise on 20 November 2026 from 13:05:33 to 13:06:31 UTC+08:00. The [test record](F_test_record.md) identifies the JDK, shells, source and JAR. Song Peitong's own repeat is pending.

## Project and process

A separate Git partial checkout identified `main` at `05532a19db852e516629303f770afa141b672cb0`. The full clone stalled. A separate build directory used the attached application snapshot plus the 19 changed application, test and script files downloaded from GitHub at the tested revision. All 232 build, source, script and local-runbook blobs matched the upstream tree before the fresh-cache build. See the [build evidence](evidence/F_build_and_fixture_results.txt).

| Phase | Loopback URL | Data directory within test run | Spring profile |
| --- | --- | --- | --- |
| Create fixture | `http://127.0.0.1:57066/login` | `原始数据库` | `demo` |
| Restart original | `http://127.0.0.1:49951/login` | `原始数据库` | `default` |
| Verify restored database | `http://127.0.0.1:56251/login` | `恢复数据库` | `default` |

The automation tracked its own spawned Java process. It requested normal Spring shutdown through the local JVM's management interface and waited for exit 0 and Hikari's shutdown completion before running backup. The seed password was temporary. It was cleared from the environment of both seed-disabled processes. All three endpoints returned HTTP 200 during their respective runs.

## Verified data

Both `demo_zhou` and `demo_lin` authenticated in separate browser contexts before restart, after restarting the original database and after restoring. Each run showed the following values.

| Item | Verified value |
| --- | --- |
| Edited nickname | `Recovery a4bef08c66` |
| Shared conversation | `/conversations/1` opened for both accounts |
| Sent message | `W4 H2 recovery a4bef08c66` appeared exactly once for each account |
| Personal save | `/events/1` appeared once for `demo_zhou` and zero times for `demo_lin` |
| English mode | `/profile?lang=zh` rendered `lang=en` and the Chinese switch was hidden |

## Backup and restore integrity

Windows PowerShell 5.1 backed up the stopped `原始数据库` to a timestamped child of `备份数据`. `restore.ps1` populated the new `恢复数据库` directory. The manifest's UTF-8 source path, payload lengths and recorded hashes matched. Both scripts exited 0.

- `manifest.json` SHA-256 matched `manifest.sha256` at `8cb49d5aa402012a68d64a03ac21e7affc165c12e5da76022721edcdc6b15337`.
- The original `tongpin.mv.db`, backup payload and restored payload before first startup shared SHA-256 `a60f1658b2a383345a566b318b82c7669ca510aa1fa9942b1dd98563c41c95de`. The original database and the complete valid backup had identical before/after hashes.
- The rejection probes used separate corrupt copies or a distinct occupied fixture. [Observed results and digests](evidence/F_h2_results.json)
