# D Zhou Ziyue Week 2 Task: Unread Indicators and Conversation History

Named owner: **Zhou Ziyue (D)**. Reviewer: **E Wu Zhuoda**.

Window: **9–15 November 2026**, Sprint 1 week one. Proposed effort: **7–9 hours**, to be confirmed by the member. Role: **Developer; communication and integration lead**. Reviewer: **E**. A reviews and merges PRs.

## Starting point

The baseline has persisted messages, participant checks and polling for new messages, with only the latest 100 shown initially. It has no unread tracking or older-history UI.

## Your actual work

1. Add per-participant read markers and an unread indicator in the connections list.
2. Provide a bounded way to load messages older than the initial recent-message window.
3. Keep ordering stable and prevent duplicates when older messages and new polling results meet.
4. Agree read-state ownership and persistence with C/A; use CSRF-protected POST for explicit state changes.

Code area: chat/, connection read-state data, conversation.html, connections.html and chat.js. Coordinate shared fields, interfaces and migrations before editing.

## Acceptance

- [ ] Messages sent by the other participant increase unread state; your own messages do not.
- [ ] Opening/acknowledging the conversation clears only your unread state, under the agreed rule.
- [ ] A conversation with more than 100 messages can load earlier history in bounded pages without gaps or duplicates.
- [ ] All history, polling and read-state endpoints reject unrelated, ended or blocked users as appropriate.
- [ ] Explain your own change and link the relevant tests, version and evidence.

## Deliverable and submission

Unread/history code, multi-session and paging tests, and updated routes/data contracts.

The Java baseline is merged. Create branch w2/d-connections from the latest main in [hansu650/thematic-friend-finder](https://github.com/hansu650/thematic-friend-finder). Do not develop from the preserved historical research branch. Split work into 1–3 hour cards; aim for a small initial PR around 10 Nov and integration/review on 13–15 Nov.

Include your source, meaningful checks and docs/progress/week2/D_progress.md. Images belong beside the MD in an images folder with relative links. Identify the existing baseline, your actual increment, references, AI assistance, validation and limits. Mark completed and verified PRs Ready for review; A merges after review.

The baseline is assigned to A for ownership and handover. This does not turn AI-generated code into unaided authorship or establish another member's contribution. Each member's evidence must describe work they actually performed.

Five-week planning budget: 28 hours, including implementation, testing, review, coordination, demonstration and personal reflection. This is a comparable estimate, not an actual-hours record. See [workload balance](../../11_workload_balance.md).

## UI and test handover

Use [the UI reference map](../../12_ui_reference_map.md), especially references 1, 2, 7, 8. Your scope is conversation list, unread state and older messages. Complete [your six test scenario groups](../testing/D_tests.md) with executable checks and evidence. Follow [the weekly photo and screenshot plan](../../13_testing_and_weekly_evidence.md).

## Revised handoff

Use [your named package](../../../handoff/2026-11-06/D_Zhou_Ziyue/START_HERE.md) for current commands and PR steps, and [the final acceptance plan](../../14_final_acceptance_and_assessment.md) for CORE-01–08. Code screenshots are optional for B–F; source/test files, real test output and feature/process evidence are required.
