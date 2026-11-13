# D Zhou Ziyue Testing Tasks

Owner: **Zhou Ziyue (D)**. Peer reviewer: **E Wu Zhuoda**. Scope: Conversation list, unread state and older messages. The six original groups belong to the merged unread/history increment; use its PR evidence for actual results. The new delivery/retry extension below remains pending.

Suggested code location: src/test/java/com/example/thematicfriend/ConversationReadStateTests.java. Add browser tests where the scenario needs UI interaction. The existing files provide the regression base; identify new coverage explicitly.

| ID | Scenario | Test level | Acceptance assertion | Status |
|---|---|---|---|---|
| D-01 | Unread ownership | Integration | Incoming messages increase the recipient count; sent messages do not count as unread for the sender. | Not run |
| D-02 | Read acknowledgement | Integration | Opening/acknowledging clears only the current participant, and a later incoming message becomes unread. | Not run |
| D-03 | Older-message boundaries | Parameterized integration | 0, 1, 100 and more than 100 messages produce bounded, ordered pages without missing items. | Not run |
| D-04 | Polling and paging overlap | Integration/browser | Overlapping responses and equal timestamps do not duplicate or reorder messages. | Not run |
| D-05 | Access boundaries | Integration | Unrelated, blocked and ended participants cannot read/write history or read markers contrary to the agreed policy. | Not run |
| D-06 | List and conversation states | Browser | Unread/empty/error states, long messages and keyboard send remain usable at 390 px and desktop. | Not run |

## Additional assigned checks

The [reliability task](../week3/D_chat_reliability.md) adds D-REL-01 repeated/concurrent send identity, D-REL-02 failed-send retry and draft retention, and D-REL-03 two-account lost-response/reload verification. These are assigned checks, not completed results.

## Weekly delivery

- W1: explain the six scenarios, fixtures and expected outcomes in your research/handover.
- W2: implement the first three relevant scenarios with the first feature PR.
- W3: cover all six groups, submit source and output, and independently run at least two relevant checks from your assigned review partner.
- W4: retest changed areas and one cross-module flow; keep actual defect/retest pairs.
- W5: link the final version and summary in your personal reflection.

## Evidence and review

Keep a normal result, a meaningful boundary/error result and a test-run summary when the increment is ready. Record test ID, version, command, expected/actual result and limitations. Commit tests with the implementation; let the peer reviewer reproduce the relevant checks. Reuse existing baseline tests openly and identify your new coverage.

[UI reference map](../../12_ui_reference_map.md) · [Weekly evidence plan](../../13_testing_and_weekly_evidence.md) · [Roster](../../00_team_roster.md)
