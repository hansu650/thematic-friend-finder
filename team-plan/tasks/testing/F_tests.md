# F Song Peitong Testing Tasks

Owner: **Song Peitong (F)**. Peer reviewer: **A Qin Tian**. Scope: Backup and restore, clean-copy setup and reproduction. Six behavior groups are planned below; they are not completed results.

Suggested code location: scripts/tests/BackupRestore.Tests.ps1 and a clean-copy smoke runner. Add browser tests where the scenario needs UI interaction. These paths are planned additions, not claims that the files already exist.

| ID | Scenario | Test level | Acceptance assertion | Status |
|---|---|---|---|---|
| F-01 | Clean-copy startup | PowerShell/process smoke | A source-only copy builds and starts using documented Java 21 and Maven commands without IDE state. | Not run |
| F-02 | Backup correctness | PowerShell/process test | A stopped test database is backed up with a manifest/checksum; the source remains unchanged. | Not run |
| F-03 | Restore correctness | PowerShell/process test | Restore to a fresh isolated test directory recovers known fictional profiles, a connection and a message. | Not run |
| F-04 | Failure handling | PowerShell/process test | Missing input, corrupt backup and an occupied destination fail clearly without overwriting existing data. | Not run |
| F-05 | Restart persistence | Process/browser | Stop/restart against the same test database preserves the expected fixture records. | Not run |
| F-06 | Independent reproduction | Process/browser | Another member follows the README, runs selected A–E checks and records environment, commands, output and limitations. | Not run |

## Weekly delivery

- W1: explain the six scenarios, fixtures and expected outcomes in your research/handover.
- W2: implement the first three relevant scenarios with the first feature PR.
- W3: cover all six groups, submit source and output, and independently run at least two relevant checks from your assigned review partner.
- W4: retest changed areas and one cross-module flow; keep actual defect/retest pairs.
- W5: link the final version and summary in your personal reflection.

## Evidence and review

Keep a normal result, a meaningful boundary/error result and a test-run summary when the increment is ready. Record test ID, version, command, expected/actual result and limitations. Commit tests with the implementation; let the peer reviewer reproduce the relevant checks. Reuse existing baseline tests openly and identify your new coverage.

[UI reference map](../../12_ui_reference_map.md) · [Weekly evidence plan](../../13_testing_and_weekly_evidence.md) · [Roster](../../00_team_roster.md)
