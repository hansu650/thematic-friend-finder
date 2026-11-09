# E Wu Zhuoda Week 2 Task: Restricted Report Review and Permission Tests

Named owner: **Wu Zhuoda (E)**. Reviewer: **F Song Peitong**.

Window: **9–15 November 2026**, Sprint 1 week one. Proposed effort: **7–9 hours**, to be confirmed by the member. Role: **Scrum Master + Developer; test coordinator**. Reviewer: **F, with A for security configuration**. A reviews and merges PRs.

## Starting point

The baseline stores reports and displays private receipts. It does not include staff roles, a review queue or handling actions. Do not claim the existing block/report form as your new implementation.

## Your actual work

1. Add a local staff-only report queue and detail page with a minimal status update workflow.
2. Store handling status, authorised handler and time; keep internal notes private from ordinary accounts.
3. Agree a controlled staff-account setup with A/C; ordinary sign-up must not be able to grant a staff role.
4. Test unauthenticated, ordinary-user and staff access; facilitate the board, blockers and Sprint retrospective alongside development.

Code area: safety/, staff-only templates, role checks and permission tests. Coordinate shared fields, interfaces and migrations before editing.

## Acceptance

- [ ] Only authorised staff can list or handle reports; hiding a link is not the access control.
- [ ] Ordinary users see only their own receipt and permitted public status, never internal notes or other reports.
- [ ] Status updates use POST and CSRF protection, record handler/time and reject invalid state values.
- [ ] The page remains labelled as a local course workflow, not a promise of live moderation.
- [ ] Explain your own change and link the relevant tests, version and evidence.

## Deliverable and submission

Restricted review workflow, negative permission tests, and actual process/retrospective records.

The Java baseline is merged. Create branch w2/e-safety from the latest main in [hansu650/thematic-friend-finder](https://github.com/hansu650/thematic-friend-finder). Do not develop from the preserved historical research branch. Split work into 1–3 hour cards; aim for a small initial PR around 10 Nov and integration/review on 13–15 Nov.

Include your source, meaningful checks and docs/progress/week2/E_progress.md. Images belong beside the MD in an images folder with relative links. Identify the existing baseline, your actual increment, references, AI assistance, validation and limits. Mark completed and verified PRs Ready for review; A merges after review.

The baseline is assigned to A for ownership and handover. This does not turn AI-generated code into unaided authorship or establish another member's contribution. Each member's evidence must describe work they actually performed.

Five-week planning budget: 28 hours, including implementation, testing, review, coordination, demonstration and personal reflection. This is a comparable estimate, not an actual-hours record. See [workload balance](../../11_workload_balance.md).

## UI and test handover

Use [the UI reference map](../../12_ui_reference_map.md), especially references 2, 7 (entry placement); review screen is a project design. Your scope is safety actions, restricted report review and permission tests. Complete [your six test scenario groups](../testing/E_tests.md) with executable checks and evidence. Follow [the weekly photo and screenshot plan](../../13_testing_and_weekly_evidence.md).

## Revised handoff

Use [your named package](../../../handoff/2026-11-06/E_Wu_Zhuoda/START_HERE.md) for current commands and PR steps, and [the final acceptance plan](../../14_final_acceptance_and_assessment.md) for CORE-01–08. Code screenshots are optional for B–F; source/test files, real test output and feature/process evidence are required.
