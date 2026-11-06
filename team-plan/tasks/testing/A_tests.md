# A Qin Tian Testing Tasks

Owner: **Qin Tian (A)**. Peer reviewer: **B Wang Yikai**. Scope: Discovery, matching feedback and integration.

**6 November execution record:** all six groups below have local automated coverage in [A's worked example](../../../handoff/2026-11-06/A_Qin_Tian_Example/TEST_RESULTS.md), with 31 Java tests and 11 browser groups passing. Codex assisted these checks. B's independent reproduction and A's two peer checks remain pending.

Implemented test source: src/test/java/com/example/thematicfriend/DiscoveryRegressionTests.java and scripts/browser/. Existing baseline tests are retained and identified separately.

| ID | Scenario | Test level | Acceptance assertion | Status |
|---|---|---|---|---|
| A-01 | Filtering and explanations | Service or integration | An interest/goal filter returns only eligible profiles; the displayed shared interests equal the intersection. | Local pass; peer review pending |
| A-02 | Exclusions | Service or integration | Self, hidden profiles and blocks in either direction never enter the candidate list. | Local pass; peer review pending |
| A-03 | Mutual matching | Integration | One like does not open chat; reciprocal likes create exactly one connection, including repeated submissions. | Local pass; peer review pending |
| A-04 | Swipe and buttons | Browser | Short drags return; committed mouse/touch gestures and keyboard/button decisions each submit once. | Local pass; touch emulated |
| A-05 | Result and recovery | Browser | Matching feedback opens the correct conversation; an empty result offers working clear/revisit actions. | Local pass; peer review pending |
| A-06 | Small screens and language | Browser | At 390 px and desktop widths, controls remain usable; EN/Chinese and reduced motion preserve the same action. | Local pass; physical device pending |

## Weekly delivery

- W1: explain the six scenarios, fixtures and expected outcomes in your research/handover.
- W2: implement the first three relevant scenarios with the first feature PR.
- W3: cover all six groups, submit source and output, and independently run at least two relevant checks from your assigned review partner.
- W4: retest changed areas and one cross-module flow; keep actual defect/retest pairs.
- W5: link the final version and summary in your personal reflection.

## Evidence and review

Keep a normal result, a meaningful boundary/error result and a test-run summary when the increment is ready. Record test ID, version, command, expected/actual result and limitations. Commit tests with the implementation; let the peer reviewer reproduce the relevant checks. Reuse existing baseline tests openly and identify your new coverage.

[UI reference map](../../12_ui_reference_map.md) · [Weekly evidence plan](../../13_testing_and_weekly_evidence.md) · [Roster](../../00_team_roster.md)
