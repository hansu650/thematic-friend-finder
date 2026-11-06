# C Tao Jiacheng Testing Tasks

Owner: **Tao Jiacheng (C)**. Peer reviewer: **D Zhou Ziyue**. Scope: Account settings, password change and data contracts. Six behavior groups are planned below; they are not completed results.

Suggested code location: src/test/java/com/example/thematicfriend/AccountChangeTests.java. Add browser tests where the scenario needs UI interaction. These paths are planned additions, not claims that the files already exist.

| ID | Scenario | Test level | Acceptance assertion | Status |
|---|---|---|---|---|
| C-01 | Valid password change | Integration | A signed-in member supplies the current password, changes it, and can use the new credential under the agreed session policy. | Not run |
| C-02 | Wrong current password | Integration | A wrong current password rejects the change and leaves the original credential working. | Not run |
| C-03 | Validation boundaries | Parameterized unit/integration | Blank, mismatched and invalid-length new passwords return field errors without partial writes. | Not run |
| C-04 | Ownership and authentication | Integration | Anonymous users and another member cannot change the target account by substituting an ID. | Not run |
| C-05 | CSRF and safe handling | Integration | A state-changing request without valid CSRF is rejected; responses do not expose password values. | Not run |
| C-06 | Session and contract regression | Integration/browser | Refresh, logout and session behavior match the documented decision; existing login/profile flows still work. | Not run |

## Weekly delivery

- W1: explain the six scenarios, fixtures and expected outcomes in your research/handover.
- W2: implement the first three relevant scenarios with the first feature PR.
- W3: cover all six groups, submit source and output, and independently run at least two relevant checks from your assigned review partner.
- W4: retest changed areas and one cross-module flow; keep actual defect/retest pairs.
- W5: link the final version and summary in your personal reflection.

## Evidence and review

Keep a normal result, a meaningful boundary/error result and a test-run summary when the increment is ready. Record test ID, version, command, expected/actual result and limitations. Commit tests with the implementation; let the peer reviewer reproduce the relevant checks. Reuse existing baseline tests openly and identify your new coverage.

[UI reference map](../../12_ui_reference_map.md) · [Weekly evidence plan](../../13_testing_and_weekly_evidence.md) · [Roster](../../00_team_roster.md)
