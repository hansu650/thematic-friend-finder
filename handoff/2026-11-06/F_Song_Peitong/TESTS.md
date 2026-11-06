# F Song Peitong: Executable Test Tasks

Owner: **Song Peitong**. Reviewer: **A Qin Tian**. All six groups start **Not run**. Implement these with your increment; the baseline's existing 19 Java tests are not your new work.

| ID | Scenario | Test level | Assertion | State |
|---|---|---|---|---|
| F-01 | Clean-copy startup | PowerShell/process smoke | A source-only copy builds and starts using documented Java 21 and Maven commands without IDE state. | Not run |
| F-02 | Backup correctness | PowerShell/process test | A stopped test database is backed up with a manifest/checksum; the source remains unchanged. | Not run |
| F-03 | Restore correctness | PowerShell/process test | Restore to a fresh isolated test directory recovers known fictional profiles, a connection and a message. | Not run |
| F-04 | Failure handling | PowerShell/process test | Missing input, corrupt backup and an occupied destination fail clearly without overwriting existing data. | Not run |
| F-05 | Restart persistence | Process/browser | Stop/restart against the same test database preserves the expected fixture records. | Not run |
| F-06 | Independent reproduction | Process/browser | Another member follows the README, runs selected A–E checks and records environment, commands, output and limitations. | Not run |

Use JUnit/Spring integration tests for server rules, browser automation for UI and isolated PowerShell/process tests for backup/restore. Agree a browser-test dependency/command with A/F before introducing it; the baseline includes Maven tests but no shared browser-test runner yet. Parameterise useful boundaries; do not duplicate tests just to reach a count.

Deliver test source and fixtures with the feature, exact commands, exit code, version and readable output. Keep a real failing/retest pair when a defect occurs. Link the relevant screenshots from your own progress MD with relative paths.

First checkpoint: three relevant scenarios with the feature. By 22 Nov: all six groups and two independently run checks from the member whose work you review. During W4, retest changed areas and one cross-module flow. See [your task](./F_Song_Peitong_TASK.md).
