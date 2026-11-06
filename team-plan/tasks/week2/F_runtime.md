# F Song Peitong Week 2 Task: Backup, Restore and Independent Reproduction

Named owner: **Song Peitong (F)**. Reviewer: **A Qin Tian**.

Window: **9–15 November 2026**, Sprint 1 week one. Proposed effort: **7–9 hours**, to be confirmed by the member. Role: **Developer; runtime and handover lead**. Reviewer: **A**. A reviews and merges PRs.

## Starting point

The baseline already has Maven build/run scripts, file-based H2 and demo-only seeding. It has no backup/restore tools or independent clean-copy reproduction. These are your actual increments.

## Your actual work

1. Create a backup command that checks the application is stopped and copies the intended H2 database into a timestamped destination without overwriting existing backups.
2. Create a restore workflow that validates source/target paths and requires a clear confirmation before replacing a database; first test it on a disposable copy.
3. Reproduce build and startup from a clean source copy using the documented JDK and Maven Wrapper, and improve actionable error messages.
4. Verify repeated demo startup, persistence and backup/restore; record exact commands, outcomes and limitations.

Code area: scripts/, runtime configuration, README and reproduction evidence. Coordinate shared fields, interfaces and migrations before editing.

## Acceptance

- [ ] The tool refuses an unsafe/outside-project target, a running/locked database or an existing backup destination.
- [ ] Backup and restore are verified on disposable data with known profiles, connections and messages.
- [ ] Repeated seeding does not duplicate users or overwrite their edited profiles.
- [ ] A second person can follow the instructions; cached dependencies and generated data are not committed.
- [ ] Explain your own change and link the relevant tests, version and evidence.

## Deliverable and submission

Backup/restore tools, clean-copy reproduction evidence and corrected handover instructions.

After the Java baseline is merged, create branch w2/f-runtime from the latest main in [hansu650/thematic-friend-finder](https://github.com/hansu650/thematic-friend-finder). Do not develop from the preserved historical research branch. Split work into 1–3 hour cards; aim for a small initial PR around 10 Nov and integration/review on 13–15 Nov.

Include your source, meaningful checks and docs/progress/week2/F_progress.md. Images belong beside the MD in an images folder with relative links. Identify the existing baseline, your actual increment, references, AI assistance, validation and limits. Mark completed and verified PRs Ready for review; A merges after review.

The baseline is assigned to A for ownership and handover. This does not turn AI-generated code into unaided authorship or establish another member's contribution. Each member's evidence must describe work they actually performed.

Five-week planning budget: 28 hours, including implementation, testing, review, coordination, demonstration and personal reflection. This is a comparable estimate, not an actual-hours record. See [workload balance](../../11_workload_balance.md).

## UI and test handover

Use [the UI reference map](../../12_ui_reference_map.md), especially references All implemented screens as reproduction targets. Your scope is backup and restore, clean-copy setup and reproduction. Complete [your six test scenario groups](../testing/F_tests.md) with executable checks and evidence. Follow [the weekly photo and screenshot plan](../../13_testing_and_weekly_evidence.md).
