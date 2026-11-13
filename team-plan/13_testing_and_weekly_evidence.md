# Testing and Weekly Evidence

Every member owns implementation, executable tests, screenshots and an independent peer check. The revised allocation is A 42 hours, D 34 hours and B/C/E/F 28 hours each. Reserve about 8–10 hours of each B–F budget for test code, debugging, peer reproduction and evidence; this time is included in the total. Confirm capacity and reduce optional scope if needed.

## Executable tests

- [A Qin Tian test tasks](./tasks/testing/A_tests.md): six distinct scenario groups for discovery, matching feedback and integration.
- [B Wang Yikai test tasks](./tasks/testing/B_tests.md): six distinct scenario groups for shared ui, live profile preview and accessibility.
- [C Tao Jiacheng test tasks](./tasks/testing/C_tests.md): six distinct scenario groups for account settings, password change and data contracts.
- [D Zhou Ziyue test tasks](./tasks/testing/D_tests.md): six distinct scenario groups for conversation list, unread state and older messages.
- [E Wu Zhuoda test tasks](./tasks/testing/E_tests.md): six distinct scenario groups for safety actions, restricted report review and permission tests.
- [F Song Peitong test tasks](./tasks/testing/F_tests.md): six distinct scenario groups for backup and restore, clean-copy setup and reproduction.

There are 36 planned scenario groups, not 36 completed tests or a code-volume target. Split or parameterise tests where it improves diagnosis. Reuse existing baseline checks where they already cover a behavior, and identify the new assertions/fixtures contributed by the member. Do not copy one test six times or claim A's 19 baseline Java tests as a teammate's work.

Use JUnit/Spring integration tests for server rules, browser automation for observable interaction, and isolated PowerShell/process tests for backup/reproduction. Qin Tian has retained two editor screenshots. Code screenshots are optional for B–F; changed source and executable tests must be in Git. The implementation and tests should be committed together; reviewers rerun relevant checks.

The merged starting ZIPs provide 19 Maven tests and documented local run scripts. A's PR #9 adds 12 discovery regressions and an optional isolated browser runner. Member branches reuse accepted regressions after integration and add meaningful assertions for their own increment. Each named package now contains CAPTURE.md and SUBMIT.md with real output and PR instructions.

## Five-week evidence rhythm

| Week | Dates | Main discussion | Meetings | Three useful team photos | Individual technical evidence | Recorder |
|---|---|---|---|---|---|---|
| W1 | 2–8 Nov | Confirm scope, references, names and capacity | Kick-off plus UI/contract review | Team discussion, reference comparison, agreed task map | Each: one source comparison and six test scenarios; do not backfill earlier events. | B Wang Yikai |
| W2 | 9–15 Nov | Build small increments and test them | Sprint Planning plus code/test checkpoint | Planning, pair implementation/testing, decision or defect discussion | Each: first 3 relevant automated scenarios; 2 UI/result captures and 1 test-output capture. | C Tao Jiacheng |
| W3 | 16–22 Nov | Integrate and evaluate Sprint 1 | Integration check plus Review/Retrospective | Integration discussion, observed task test, review decisions | Each: complete 6 relevant scenario groups; independently run 2 peer checks; keep real defect/retest pairs. | D Zhou Ziyue |
| W4 | 23–29 Nov | Fix feedback and reproduce | Sprint Planning plus reproduction checkpoint | Prioritisation, restore/retest activity, freeze decision | Each: retest changed areas and one cross-module flow; F coordinates clean-copy reproduction. | F Song Peitong |
| W5 | 30 Nov–6 Dec | Demonstrate, reflect and hand over | Rehearsal plus final Review/Retrospective | Rehearsal, evidence review, final decision discussion | Each: final version/test summary and individual reflection; team demo stays within the course 15-minute limit. | E Wu Zhuoda |

Aim for **three useful photos per team per week**, around 15 over five weeks, plus minutes for the two planned meetings. This is a practical evidence plan, not an assessment quota. If only two useful moments occur, keep two and explain what happened. Do not stage a discussion or recreate an earlier date. W1 records may only be labelled with the date they actually occurred.

## How to take the photos

1. **Discussion context:** one landscape photo showing the group working with the current agenda or task board. Capture a normal discussion, not just a posed group portrait. Ask participants before photographing them.
2. **Work in progress:** one closer photo of a pair investigating code, running a test or comparing a design. Frame the work and people together where useful. Avoid passwords, private messages and unrelated browser tabs.
3. **Decision or review:** one photo of a review, whiteboard or jointly discussed result. Also save a clear screen capture of the actual board/test result, because photographed screens can be unreadable.

Use a stable, well-lit view and a readable screen; do not photograph the same moment repeatedly to inflate the count. A remote meeting can use a consented meeting screenshot and real meeting notes. Participation and contribution should be supported by minutes, PRs and test evidence, not inferred from faces in a photo.

## Screenshots and filenames

For a completed feature, usually keep **three purposeful captures**: the normal result, a meaningful boundary/error state, and the test-run summary. Add a before/after pair only when there is a real defect or visual improvement. Keep the original failure and the retest evidence. A passing screenshot should show a run identifier or version and readable assertions/results; record the command and exit code in Markdown.

Store each Markdown record beside its own images folder, for example docs/progress/week2/images/2026-11-13_B_B-02_limit.png. In Markdown use a relative link such as `![Interest limit](./images/2026-11-13_B_B-02_limit.png)`. Check the actual preview when publishing.

Caption template: Date and time; participants or tester; activity/test ID; version; expected result; observed result; decision or defect; next owner. Record only actual attendees. Use [the evidence template](./templates/evidence_record.md) and [meeting template](./meetings/meeting_template.md).

## Board and completion

Keep blocked work in its current list with a reason and next action. A task reaches Done after its increment, relevant executable checks, evidence and peer review are complete. The board created on 6 November starts from planned work; no meeting, member contribution or future test is marked complete by this document.
