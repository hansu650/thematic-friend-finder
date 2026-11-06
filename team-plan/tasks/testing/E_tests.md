# E Wu Zhuoda Testing Tasks

Owner: **Wu Zhuoda (E)**. Peer reviewer: **F Song Peitong**. Scope: Safety actions, restricted report review and permission tests. Six behavior groups are planned below; they are not completed results.

Suggested code location: src/test/java/com/example/thematicfriend/ReportPermissionTests.java. Add browser tests where the scenario needs UI interaction. These paths are planned additions, not claims that the files already exist.

| ID | Scenario | Test level | Acceptance assertion | Status |
|---|---|---|---|---|
| E-01 | Role gate | Integration | Staff can open report review; anonymous and ordinary members cannot access the page or underlying actions. | Not run |
| E-02 | Report confidentiality | Integration | A reporter sees their own receipt; another member cannot enumerate report details by changing IDs. | Not run |
| E-03 | Allowed status transition | Integration | Valid review actions persist the selected status and review metadata; invalid transitions are rejected. | Not run |
| E-04 | CSRF and validation | Parameterized integration | Missing CSRF, blank/overlong reason and malformed identifiers produce a controlled rejection. | Not run |
| E-05 | Block and end boundaries | Integration | Either-direction blocks/end decisions stop the relevant discovery and chat operations consistently. | Not run |
| E-06 | Accessible safety flow | Browser | Report/block controls are reachable from a small screen and keyboard; confirmation, cancellation and result feedback are clear. | Not run |

## Weekly delivery

- W1: explain the six scenarios, fixtures and expected outcomes in your research/handover.
- W2: implement the first three relevant scenarios with the first feature PR.
- W3: cover all six groups, submit source and output, and independently run at least two relevant checks from your assigned review partner.
- W4: retest changed areas and one cross-module flow; keep actual defect/retest pairs.
- W5: link the final version and summary in your personal reflection.

## Evidence and review

Keep a normal result, a meaningful boundary/error result and a test-run summary when the increment is ready. Record test ID, version, command, expected/actual result and limitations. Commit tests with the implementation; let the peer reviewer reproduce the relevant checks. Reuse existing baseline tests openly and identify your new coverage.

[UI reference map](../../12_ui_reference_map.md) · [Weekly evidence plan](../../13_testing_and_weekly_evidence.md) · [Roster](../../00_team_roster.md)
