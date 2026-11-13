# F Song Peitong Progress

Task: Backup/restore, independent reproduction and runtime handover  
Date: 2026-11-13 (Asia/Shanghai)  
Tested source / PR: `w2/f-runtime` after synchronizing the F increment onto current `main`  
Status: Implementation complete locally; peer reproduction and A's review remain pending.

## Actual change

The baseline uses a file-based H2 database under `.local/data`. I added:

- [`scripts/backup.ps1`](../../../scripts/backup.ps1), which requires the application to be stopped, rejects H2 lock files, copies all database files to a timestamped directory, and writes `manifest.json` plus `manifest.sha256`.
- [`scripts/restore.ps1`](../../../scripts/restore.ps1), which validates the manifest checksum, format, safe relative paths, file sizes, per-file SHA-256 values and unexpected payload files before assembling a fresh sibling directory and moving it into place. Existing destinations and destinations inside the backup are refused.
- [`scripts/tests/BackupRestore.Tests.ps1`](../../../scripts/tests/BackupRestore.Tests.ps1), an executable six-scenario fixture runner using fictional profiles, a connection and a message.
- Java 21 validation and clearer missing-Java errors in [`scripts/build.ps1`](../../../scripts/build.ps1) and [`scripts/run-demo.ps1`](../../../scripts/run-demo.ps1).
- Exact backup/restore commands and failure behaviour in [`README.md`](../../../README.md).

The fixture runner deliberately keeps source hashes and verifies that restoring does not mutate the source. It also tests missing input, tampering, unsafe manifest paths and occupied destinations.

## Verification

Environment: Windows PowerShell 5.1, Java 21.0.4 LTS (`C:\Program Files\Java\jdk-21`), Maven Wrapper, current `main` baseline synchronized before testing. Evidence: [`runtime-output.txt`](./evidence/F-20261113-1158/runtime-output.txt).

Command:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\scripts\tests\BackupRestore.Tests.ps1
```

Exit code: **0**. The command first built a clean package (`BUILD SUCCESS`) and then ran the six checks:

| Test ID | Expected and actual result |
|---|---|
| F-01 | A clean PowerShell process invoked the backup script and `build.ps1 -SkipTests`; PASS |
| F-02 | Timestamped backup contained `manifest.json`, `manifest.sha256`, and matching source hashes; PASS |
| F-03 | Fresh restore recovered `demo_zhou`, `demo_lin`, the fictional connection and `hello` message; PASS |
| F-04 | Missing, corrupt, unsafe and occupied inputs failed with actionable errors and preserved `keep.txt`; PASS |
| F-05 | Maven integrated suite: 47 tests, 0 failures/errors; PASS |
| F-06 | README contains the clean-copy Maven and backup/restore handover commands; PASS |

The first local run exposed and fixed two test-harness issues (corruption can fail at size validation before checksum validation; the test runner's project-root calculation was wrong). The successful run was repeated after both fixes.

## Screenshots and process

No desktop screenshots were fabricated. The real terminal output is preserved in [`runtime-output.txt`](./evidence/F-20261113-1158/runtime-output.txt), including Java version, Maven `BUILD SUCCESS`, 47 integrated tests, all six result rows and exit code 0. A normal browser capture is not applicable to this command-line/runtime increment. A real boundary result is included in the F-04 output and preserves an occupied destination file.

## Review and integration

Reviewer: A Qin Tian, pending. The shared contract used here is the existing `APP_DATA_DIR` path; the restored directory is intended to be supplied through that variable after the application is stopped. The next owner is A for review/integration and a second person's clean-copy reproduction. No GitHub PR or Trello transition was performed from this extracted ZIP.

## Reflection notes and next action

The first test attempt treated every tampered payload as a checksum error, but the implementation correctly rejected it earlier on the manifest's recorded size. I changed the assertion to accept either validation stage while retaining the safety guarantee, then reran the complete suite. This keeps the test coupled to the contract (reject corruption) rather than an incidental error ordering. My next PDP action is to have a teammate run the same script from a clean source copy and record their Java/Maven versions and any path differences.

## References and assistance

I used the supplied `F_Song_Peitong_TASK.md`, `TESTS.md`, `RUN.md`, `CAPTURE.md` and the existing H2 configuration as the requirements and source references. AI assistance was used to draft and review the PowerShell scripts and documentation; I personally inspected the paths, ran the commands, checked the real output and fixed the failing assertions before recording the passing run.
