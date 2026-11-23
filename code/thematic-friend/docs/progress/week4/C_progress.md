# C Tao Jiacheng | Week 4 progress

- **Role:** Product Owner for requirements, priorities and acceptance.
- **Status on 23 November 2026:** technical acceptance evidence prepared. Human review, team decisions and release sign-off pending. Personal hours unconfirmed.
- **Baseline:** clean checkout of integrated main `ac9c61c1726fb31a70e7a28be70e1306ebbda926`. The handoff snapshot was `90d6b6d9bdee2644f0a9aae3675932df8d46a980`. The newer source includes A's RSVP feedback plus the D/E/F Week 4 updates.
- **Built JAR SHA-256:** `d962a4d204b4170465164f3adbf7b268d91e6bf0ed4e4cf5d783c66f02b66dff`.
- **Submission tracking:** the Week 4 acceptance PR records the submitted revision and review. [C's Trello card](https://trello.com/c/G5E6r3x0) tracks team follow-up.

| Task | Evidence supplied |
|---|---|
| C-W4-01 · Trace requirements | [Acceptance matrix](C_acceptance_matrix.md) links the brief and team decisions to routes, owners and expected/actual outcomes. |
| C-W4-02 · Run acceptance | [Test record](C_test_record.md) gives launch settings, commands, environment, revision and real results. The new account runner exercises signup, file-backed restart, two existing sessions during password change and English release mode. |
| C-W4-03 · Prioritise findings | [Scope decisions](C_scope_decisions.md) orders release settings, D's retry contract, E's receipt correction, B's user observation and F's reproduction. [Defect record](C_defect_and_retest.md) preserves the B-04 keyboard-runner failure and distinguishes the result from a product defect. |
| C-W4-04 · Review and prepare demonstration | [B post-merge technical review](C_scope_decisions.md#b-post-merge-review) and [demonstration draft](C_demonstration_notes.md). A/C confirmation and D Zhou Ziyue's review require the teammates' actual input. |

## Attribution

C's password settings are inherited from [PR #11](https://github.com/hansu650/thematic-friend-finder/pull/11). B's [preview](https://github.com/hansu650/thematic-friend-finder/pull/16), D's [retry](https://github.com/hansu650/thematic-friend-finder/pull/21), E's [permissions retest](https://github.com/hansu650/thematic-friend-finder/pull/20) and F's [handover](https://github.com/hansu650/thematic-friend-finder/pull/23) retain their original ownership. Codex ran the checks, diagnosed and adjusted the keyboard harness, and drafted these records. They do not record a student-led session or a completed review meeting.

## Candidate for personal reflection

B-04 failed even on a minimal native select in Chrome on macOS. The runner had coupled the acceptance criterion of keyboard selection to an OS-specific arrow key assumption. Reproducing the failure without the application enabled a focused test change while preserving the keyboard interaction and testing whether preview followed selection. This incident supports a candidate PDP action for Tao to confirm personally: run one future keyboard acceptance scenario on two browser/OS combinations, record the exact input sequence, then compare with a physical keyboard or assistive-technology session. Use only observations Tao can substantiate in the final reflection.
