# A Qin Tian Week 2 Task: Baseline Ownership, Discovery and Integration

Named owner: **Qin Tian (A)**. Reviewer: **B Wang Yikai**.

**6 November update:** the first discovery/filter/match-feedback increment is implemented and locally verified: 31 Java tests (19 existing + 12 new) and 11 browser groups pass. See [A's actual evidence](../../../code/thematic-friend/docs/progress/week2/A_progress.md). B's independent review, member-contract agreements and later integration remain pending; this does not complete the full five-week role.

**Second increment, 6 November:** filter-preserving error recovery, cached-history refresh and pending-decision feedback are implemented. The full suite now passes 39 Java tests and 16 browser groups. Eight new Java integration cases protect the shared match/chat/safety routes. [Concrete contract proposals](../../../code/thematic-friend/docs/INTEGRATION_PLAN.md) are ready for owner confirmation. [New screenshots](../../../code/thematic-friend/docs/A_NEXT_CAPTURE.md), B's review and B–F integration remain pending.

Window: **9–15 November 2026**, Sprint 1 week one. Proposed effort: **10–14 hours**, to be confirmed by the member. Role: **Product Owner + Scrum Master + Developer; team leader** (revised 9 November). Reviewer: **B, with C/F for security and runtime**. A reviews and merges PRs.

## Starting point

The current baseline already includes accounts, profiles, discovery, matching, basic chat, block/report receipts, demo seeding and startup scripts. A owns this starting version; B–F are assigned new increments below.

## Your actual work

1. Take responsibility for the existing AI-assisted baseline and understand the account, connection, chat and safety flow before handing it over.
2. Refine visible filter summaries, empty results and the drag/card behaviour; keep the English-first interface consistent.
3. Agree the data/API boundaries needed by the other five members, including password changes, read markers and staff-only report handling.
4. Review and integrate the five incoming modules; resolve shared integration failures with their owners and preserve the working demo.
5. Lead CORE-01–08 acceptance, consistent recovery/permission behaviour and the final English interface check.
6. Coordinate product evaluation, the demonstration narrative and handover with B/E/F; write A's own individual reflection.
7. Maintain product priorities, facilitate Sprint Planning, Reviews and Retrospectives, and follow up impediments. Record actual product decisions and process improvements separately; Developers maintain their own estimates and task updates.

Code area: config/, discovery/, shared contracts and integration. Coordinate shared fields, interfaces and migrations before editing.

## Acceptance

- [ ] The baseline is labelled as A-owned and AI-assisted, with actual verification and limits.
- [ ] Discovery explains real common interests and preserves or clears chosen filters.
- [ ] Mouse, emulated touch, keyboard and buttons use the same validated like/skip actions.
- [ ] Shared changes are documented and each incoming module has its own owner and acceptance evidence.
- [ ] Explain your own change and link the relevant tests, version and evidence.

## Deliverable and submission

Baseline handover, discovery refinements, contracts and integration evidence, plus actual Product Owner and Scrum Master decisions/actions when performed.

Continue the existing branch w2/a-discovery; the Java baseline is already merged into main in [hansu650/thematic-friend-finder](https://github.com/hansu650/thematic-friend-finder). PR #9 already contains the first discovery increment. The next work is contract agreement, independent review and integration of the members' focused increments. Split remaining work into 1–3 hour cards using the team's confirmed capacity.

Include your source, meaningful checks and docs/progress/week2/A_progress.md. Images belong beside the MD in an images folder with relative links. Identify the existing baseline, your actual increment, references, AI assistance, validation and limits. Mark completed and verified PRs Ready for review; A merges after review.

The baseline is assigned to A for ownership and handover. This does not turn AI-generated code into unaided authorship or establish another member's contribution. Each member's evidence must describe work they actually performed.

Five-week planning budget: 42 hours, including implementation, testing, review, coordination, demonstration and personal reflection. This is a comparable estimate, not an actual-hours record. See [workload balance](../../11_workload_balance.md).

## UI and test handover

Use [the UI reference map](../../12_ui_reference_map.md), especially references 3, 4, 5. Your scope is discovery, matching feedback and integration. Complete [your six test scenario groups](../testing/A_tests.md) with executable checks and evidence. Follow [the weekly photo and screenshot plan](../../13_testing_and_weekly_evidence.md).

## Revised handoff

Use [your named package](../../../handoff/2026-11-06/A_Qin_Tian/START_HERE.md) for current commands and PR steps, and [the final acceptance plan](../../14_final_acceptance_and_assessment.md) for CORE-01–08. Code screenshots are optional for B–F; source/test files, real test output and feature/process evidence are required.
