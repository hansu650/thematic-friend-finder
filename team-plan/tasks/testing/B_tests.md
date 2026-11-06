# B Wang Yikai Testing Tasks

Owner: **Wang Yikai (B)**. Peer reviewer: **C Tao Jiacheng**. Scope: Shared UI, live profile preview and accessibility. Six behavior groups are planned below; they are not completed results.

Suggested code location: tests/browser/profile-preview.spec.mjs. Add browser tests where the scenario needs UI interaction. These paths are planned additions, not claims that the files already exist.

| ID | Scenario | Test level | Acceptance assertion | Status |
|---|---|---|---|---|
| B-01 | Unsaved preview | Browser | Editing name, bio, goal and interests updates the preview; refresh restores persisted values. | Not run |
| B-02 | Interest limit | Browser | Select/deselect works with mouse and keyboard; a sixth selection gives clear feedback and no silent data loss. | Not run |
| B-03 | Safe text | Browser | HTML-like and long input renders as text, never executable markup, and fits at 390 px. | Not run |
| B-04 | Keyboard flow | Browser | Tab order, visible focus, Enter/Space and announced preview/limit feedback work without a pointer. | Not run |
| B-05 | Responsive navigation | Browser | 390 px and desktop layouts have no horizontal overflow; the active destination and content are reachable. | Not run |
| B-06 | Language and motion | Browser | Both temporary languages keep labels associated with controls; reduced motion avoids unnecessary animation. | Not run |

## Weekly delivery

- W1: explain the six scenarios, fixtures and expected outcomes in your research/handover.
- W2: implement the first three relevant scenarios with the first feature PR.
- W3: cover all six groups, submit source and output, and independently run at least two relevant checks from your assigned review partner.
- W4: retest changed areas and one cross-module flow; keep actual defect/retest pairs.
- W5: link the final version and summary in your personal reflection.

## Evidence and review

Keep a normal result, a meaningful boundary/error result and a test-run summary when the increment is ready. Record test ID, version, command, expected/actual result and limitations. Commit tests with the implementation; let the peer reviewer reproduce the relevant checks. Reuse existing baseline tests openly and identify your new coverage.

[UI reference map](../../12_ui_reference_map.md) · [Weekly evidence plan](../../13_testing_and_weekly_evidence.md) · [Roster](../../00_team_roster.md)
