# C Tao Jiacheng Week 2 Task: Password Change and Account Data Contracts

Named owner: **Tao Jiacheng (C)**. Reviewer: **D Zhou Ziyue**.

Window: **9–15 November 2026**, Sprint 1 week one. Proposed effort: **7–9 hours**, to be confirmed by the member. Role: **Developer; account and data lead**. Reviewer: **D**. A reviews and merges PRs.

## Starting point

The baseline provides registration, login, profile editing and validation. It has no password-change workflow. Do not re-submit registration as your new feature.

## Your actual work

1. Add a change-password page for the signed-in user, requiring the current password and a confirmed new password.
2. Reuse the configured password encoder; validate length and the bcrypt UTF-8 byte limit before hashing.
3. Agree with A how a successful change invalidates existing sessions; implement and verify the agreed session policy explicitly.
4. Document the account/role fields and migration implications required by D read markers and E staff-only access.

Code area: account/, security integration, change-password template and account tests. Coordinate shared fields, interfaces and migrations before editing.

## Acceptance

- [ ] An unauthenticated user cannot change a password; a submitted user ID cannot target another account.
- [ ] An incorrect current password, mismatched confirmation or invalid new password leaves the stored hash unchanged.
- [ ] After a valid change, the old password fails and the new one works; session invalidation follows the documented policy.
- [ ] CSRF protection remains enabled and the change survives a restart of the same database.
- [ ] Explain your own change and link the relevant tests, version and evidence.

## Deliverable and submission

Password-change feature, permission and credential tests, and updated field/session contracts.

After the Java baseline is merged, create branch w2/c-accounts from the latest main in [hansu650/thematic-friend-finder](https://github.com/hansu650/thematic-friend-finder). Do not develop from the preserved historical research branch. Split work into 1–3 hour cards; aim for a small initial PR around 10 Nov and integration/review on 13–15 Nov.

Include your source, meaningful checks and docs/progress/week2/C_progress.md. Images belong beside the MD in an images folder with relative links. Identify the existing baseline, your actual increment, references, AI assistance, validation and limits. Mark completed and verified PRs Ready for review; A merges after review.

The baseline is assigned to A for ownership and handover. This does not turn AI-generated code into unaided authorship or establish another member's contribution. Each member's evidence must describe work they actually performed.

Five-week planning budget: 28 hours, including implementation, testing, review, coordination, demonstration and personal reflection. This is a comparable estimate, not an actual-hours record. See [workload balance](../../11_workload_balance.md).

## UI and test handover

Use [the UI reference map](../../12_ui_reference_map.md), especially references Cross-page consistency; no account screen was supplied. Your scope is account settings, password change and data contracts. Complete [your six test scenario groups](../testing/C_tests.md) with executable checks and evidence. Follow [the weekly photo and screenshot plan](../../13_testing_and_weekly_evidence.md).
