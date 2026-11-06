# B Wang Yikai Week 2 Task: Live Profile Preview and Accessible Interaction

Named owner: **Wang Yikai (B)**. Reviewer: **C Tao Jiacheng**.

Window: **9–15 November 2026**, Sprint 1 week one. Proposed effort: **7–9 hours**, to be confirmed by the member. Role: **Developer; UI and usability lead**. Reviewer: **C**. A reviews and merges PRs.

## Starting point

The baseline has responsive pages and a static preview of saved data. It does not have a live editing preview or a selected-interest counter.

## Your actual work

1. Add a live profile preview that updates the display name, bio, activity and interests while the form is edited, without saving to the database.
2. Show a selected-interest counter and clear feedback at the maximum of five; keep the server validation authoritative.
3. Improve keyboard and screen-reader feedback for card decisions and profile editing, and check both temporary interface languages.
4. Run a small task observation when participants are arranged and document an actual usability improvement.

Code area: profile.html, shared templates, static/css/ and a dedicated profile-preview script. Coordinate shared fields, interfaces and migrations before editing.

## Acceptance

- [ ] Unsaved edits update the preview, while a refresh restores the saved profile.
- [ ] The counter handles selecting, deselecting and the five-interest limit without blocking keyboard users.
- [ ] User text is inserted safely with textContent; long text fits at 390 px and desktop widths.
- [ ] Focus and status messages are understandable; reduced-motion settings are respected.
- [ ] Explain your own change and link the relevant tests, version and evidence.

## Deliverable and submission

Live preview and selection-feedback code, focused UI checks, before/after screenshots and observation notes.

The Java baseline is merged. Create branch w2/b-interface from the latest main in [hansu650/thematic-friend-finder](https://github.com/hansu650/thematic-friend-finder). Do not develop from the preserved historical research branch. Split work into 1–3 hour cards; aim for a small initial PR around 10 Nov and integration/review on 13–15 Nov.

Include your source, meaningful checks and docs/progress/week2/B_progress.md. Images belong beside the MD in an images folder with relative links. Identify the existing baseline, your actual increment, references, AI assistance, validation and limits. Mark completed and verified PRs Ready for review; A merges after review.

The baseline is assigned to A for ownership and handover. This does not turn AI-generated code into unaided authorship or establish another member's contribution. Each member's evidence must describe work they actually performed.

Five-week planning budget: 28 hours, including implementation, testing, review, coordination, demonstration and personal reflection. This is a comparable estimate, not an actual-hours record. See [workload balance](../../11_workload_balance.md).

## UI and test handover

Use [the UI reference map](../../12_ui_reference_map.md), especially references 4, 7, 9 (layout only). Your scope is shared ui, live profile preview and accessibility. Complete [your six test scenario groups](../testing/B_tests.md) with executable checks and evidence. Follow [the weekly photo and screenshot plan](../../13_testing_and_weekly_evidence.md).

## Revised handoff

Use [your named package](../../../handoff/2026-11-06/B_Wang_Yikai/START_HERE.md) for current commands and PR steps, and [the final acceptance plan](../../14_final_acceptance_and_assessment.md) for CORE-01–08. Code screenshots are optional for B–F; source/test files, real test output and feature/process evidence are required.
