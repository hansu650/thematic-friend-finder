# F | Week 4 progress

Date of automated run is 20 November 2026 (China Standard Time). Codex performed the clean build, browser automation, recovery checks and evidence review on the available Windows 11 machine. Song Peitong's personally performed reproduction, time spent and practical handover are pending confirmation.

## Inherited implementation

The tested `main` revision was `05532a19db852e516629303f770afa141b672cb0`. F's backup and restore tooling came from PR #13. PR #17 supplied the Windows UTF-8 manifest fix and recovery checks. The Week 4 run reused the checked-in build and backup scripts, PowerShell fixture suite and browser flow from the repository's real H2 check.

## Week 4 work

- Verified the release source against GitHub Git objects and built it from an empty project Maven cache. Maven passed all 77 tests and packaged the verified JAR.
- Automated a stopped-database recovery with two fictional users. The exercise added a seed-disabled restart of the original database, pre-start hash comparison and before/after checks for the original database and backup. It also exercised four distinct refusal cases and covered Chinese source, backup and destination paths.
- Documented startup, recovery and rollback for A. Reviewed the evidence from E's merged PR #20 and recorded the implications for the operational handover.

[Tests and commands](F_test_record.md) · [Recovery details](F_recovery_record.md) · [Defect and retest](F_defect_and_retest.md) · [E evidence review](F_review_E.md) · [Operations handover](../../OPERATIONS_HANDOVER.md)

## Critical incident and follow-up

The full Git clone stalled. A filtered Git checkout supplied the authoritative revision, and the build copy was checked against all 232 relevant upstream Git blobs. This let verification continue with a fresh Maven cache and a reproducible source identity. For the next run, capture the revision, JAR hash and one seed-disabled restore result on a second machine before reporting a completed human handover.

A Qin Tian owns the review and integration decision. After the release freeze, compare A's selected release with the tested revision and rerun the operational checks affected by any changes. The Trello work item tracks the handover. [Existing card](https://trello.com/c/ZwaQh6f0)
