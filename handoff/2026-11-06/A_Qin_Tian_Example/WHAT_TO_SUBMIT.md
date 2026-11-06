# What Each Member Does Next

Use A's example to copy the **submission structure and evidence quality**. Implement your own assigned increment and run your own checks. The baseline has already been merged through PR #8; create your task branch from the latest main. Do not start development on the preserved W1 research branches.

| Member | Branch | First concrete change | Evidence to show |
|---|---|---|---|
| **B Wang Yikai** | w2/b-interface | Live unsaved profile preview and a selected-interest counter | Preview before/after typing; five-interest boundary; keyboard and 390 px checks |
| **C Tao Jiacheng** | w2/c-accounts | Change-password form requiring the current password | Wrong-current-password rejection; valid change; old login fails/new login succeeds; agreed session policy |
| **D Zhou Ziyue** | w2/d-connections | Per-participant unread state and older-message loading | Two sessions with unread changes; more than 100 messages; no gaps/duplicates; outsider denial |
| **E Wu Zhuoda** | w2/e-safety | Staff-only report queue and handling status | Staff workflow; ordinary-user/anonymous denial; private notes and valid status handling |
| **F Song Peitong** | w2/f-runtime | Safe backup/restore on disposable H2 data | Known data before/after restore; refused unsafe or running target; clean-copy reproduction |

The detailed task and six scenario groups remain in each member's named MD/ZIP package. Check shared changes with A before editing common fields/routes. The proposed boundaries are listed in [CONTRACTS_TO_CONFIRM.md](./CONTRACTS_TO_CONFIRM.md); discussion and agreement are still required.

## A small submission that someone can review

1. Implement a focused 1–3 hour slice on your W2 branch. Describe the baseline behavior and what changed.
2. Commit the feature and meaningful executable tests together. Include at least three relevant scenarios in the first feature PR; complete the six planned groups by the internal 22 November checkpoint. Reused tests must be identified as reused.
3. Save exact commands, source commit/hash, exit code and readable output. Keep a real failure and retest when one occurs. Do not manufacture a failed run.
4. Capture at least three purposeful images: a normal outcome, a boundary/error outcome and executable test results. Add 390 px or two-session images when the assertion needs them. A screenshot of the interface does not replace an executable test.
5. Complete your own progress MD: actual change, expected/actual checks, defect/fix, remaining limits, references/AI assistance and reviewer status. Put images in the same folder's images/ subfolder and link them relatively.
6. Open a PR to main and link it from your Trello card. Move the card to Review when the implementation/checks are ready. Record peer review and fixes; move to Done only after acceptance/merge.

Suggested evidence layout:

~~~text
docs/progress/week2/
  B_progress.md
  images/B_normal.png
  images/B_boundary.png
  images/B_tests.png
  evidence/B_test-output.txt
~~~

Use your own member letter. Include test source in the project, not just in a screenshot. Do not commit target/, caches, node_modules/, passwords or runtime databases.

## Review and weekly process evidence

B reviews A; C reviews B; D reviews C; E reviews D; F reviews E; A reviews F. A integrates accepted work. Review means running the agreed checks and recording what was actually examined, not marking a box because a PR exists.

Each week, retain roughly three useful genuine discussion/work/review photos and a board capture after updating actual status. Record date, topic, participants confirmed by the team, decision and next owner. Do not stage a retrospective record as if it happened earlier. Classroom/team photographs remain in the local photo archive; this worked example contains product/test/process screenshots.

Send A the PR link, progress MD, test outputs and screenshots together. A's [A_progress.md](./A_progress.md), [TEST_RESULTS.md](./TEST_RESULTS.md) and [REVIEW_CHECKLIST.md](./REVIEW_CHECKLIST.md) demonstrate the format.
