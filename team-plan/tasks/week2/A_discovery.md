# A Qin Tian Week 2 Task: Baseline Ownership, Discovery and Integration

Named owner: **Qin Tian (A)**. Reviewer: **B Wang Yikai**.

Window: **9–15 November 2026**, Sprint 1 week one. Proposed effort: **10–14 hours**, to be confirmed by the member. Role: **Product Owner + Developer; team leader**. Reviewer: **B, with C/F for security and runtime**. A reviews and merges PRs.

## Starting point

The current baseline already includes accounts, profiles, discovery, matching, basic chat, block/report receipts, demo seeding and startup scripts. A owns this starting version; B–F are assigned new increments below.

## Your actual work

1. Take responsibility for the existing AI-assisted baseline and understand the account, connection, chat and safety flow before handing it over.
2. Refine visible filter summaries, empty results and the drag/card behaviour; keep the English-first interface consistent.
3. Agree the data/API boundaries needed by the other five members, including password changes, read markers and staff-only report handling.
4. Review and integrate small PRs; run the relevant regression and preserve the working demo.

Code area: config/, discovery/, shared contracts and integration. Coordinate shared fields, interfaces and migrations before editing.

## Acceptance

- [ ] The baseline is labelled as A-owned and AI-assisted, with actual verification and limits.
- [ ] Discovery explains real common interests and preserves or clears chosen filters.
- [ ] Mouse, emulated touch, keyboard and buttons use the same validated like/skip actions.
- [ ] Shared changes are documented and each incoming module has its own owner and acceptance evidence.
- [ ] Explain your own change and link the relevant tests, version and evidence.

## Deliverable and submission

Baseline handover, discovery refinements, contracts and integration evidence.

After the Java baseline is merged, create branch w2/a-discovery from the latest main in [hansu650/thematic-friend-finder](https://github.com/hansu650/thematic-friend-finder). Do not develop from the preserved historical research branch. Split work into 1–3 hour cards; aim for a small initial PR around 10 Nov and integration/review on 13–15 Nov.

Include your source, meaningful checks and docs/progress/week2/A_progress.md. Images belong beside the MD in an images folder with relative links. Identify the existing baseline, your actual increment, references, AI assistance, validation and limits. Mark completed and verified PRs Ready for review; A merges after review.

The baseline is assigned to A for ownership and handover. This does not turn AI-generated code into unaided authorship or establish another member's contribution. Each member's evidence must describe work they actually performed.

Five-week planning budget: 42 hours, including implementation, testing, review, coordination, demonstration and personal reflection. This is a comparable estimate, not an actual-hours record. See [workload balance](../../11_workload_balance.md).

## UI and test handover

Use [the UI reference map](../../12_ui_reference_map.md), especially references 3, 4, 5. Your scope is discovery, matching feedback and integration. Complete [your six test scenario groups](../testing/A_tests.md) with executable checks and evidence. Follow [the weekly photo and screenshot plan](../../13_testing_and_weekly_evidence.md).
