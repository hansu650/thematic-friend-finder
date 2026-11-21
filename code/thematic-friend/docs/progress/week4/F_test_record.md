# F | Week 4 test record

Codex ran the checks on 20 November 2026 (UTC+08:00). Environment was Windows 11 Pro build 26200, JDK 21.0.4, PowerShell 7.6.9, Windows PowerShell 5.1.26100.9818, Maven Wrapper distribution 3.10.0, Node.js 24.15.0, Edge 157.0.4341.60 and H2 2.4.240.

Tested `main` revision was `05532a19db852e516629303f770afa141b672cb0`. JAR SHA-256 was `d962a4d204b4170465164f3adbf7b268d91e6bf0ed4e4cf5d783c66f02b66dff`.

| Test | Expected | Observed | Status |
| --- | --- | --- | --- |
| F-W4-T1 | Clean-cache packaging succeeds and the isolated site starts. | 77 Java tests passed. The build exited 0. The seeded JAR answered `/login` with HTTP 200 on port 57066. | Pass |
| F-W4-T2 | The original file-backed database retains the fixture changes through a seed-disabled restart. | Both accounts authenticated. The changed nickname, shared conversation, one marked message per viewer and saved event remained available. | Pass |
| F-W4-T3 | A stopped H2 backup restores to a fresh location and the unchanged records are readable without seeding. | Restore exited 0. The pre-start database hash matched the backup. Both users retrieved the exact same observations on port 56251. The source and backup hashes stayed constant. | Pass |
| F-W4-T4 | Corruption, missing backup and an occupied destination are rejected. | All four runs exited 1. Fresh targets remained absent and the occupied directory's sentinel retained its hash. | Pass |
| F-W4-T5 | Chinese paths work in Windows PowerShell. | Windows PowerShell 5.1 created and restored the real H2 backup with Chinese source, backup and destination directory names. The manifest retained the source path. | Pass |
| F-W4-T6 | Another person follows the runbook and records the result. | Automated English-only check passed with `?lang=zh`. Independent human runbook execution and review remain pending. | Pending |

## Commands and evidence

Run the project scripts from `code/thematic-friend`.

```powershell
.\scripts\build.ps1
Get-FileHash -LiteralPath '.\target\thematic-friend-0.0.1-SNAPSHOT.jar' -Algorithm SHA256
npm.cmd ci --prefix scripts/profile-browser
pwsh -NoProfile -File .\scripts\tests\BackupRestore.Tests.ps1 -SkipBuild -KeepArtifacts
```

The PowerShell fixture suite exited 0 with six passing checks and one skipped duplicate Maven invocation. [Build and fixture output excerpts](evidence/F_build_and_fixture_results.txt)

The supplementary local browser harness ran with `node <task-root>/verify-h2.mjs <build-project-path> 05532a19db852e516629303f770afa141b672cb0` and exited 0. It followed the checked-in H2 runner's browser flow, invoked the checked-in backup and restore helpers in Windows PowerShell 5.1, and compared the observations from three isolated JVM starts. For a manual reproduction, follow the operations handover using the same two fictional accounts. [H2 results](evidence/F_h2_results.json) · [Operations handover](../../OPERATIONS_HANDOVER.md)
