# B Wang Yikai: Week 4 progress

**Status: technical work complete; Trello evidence uploaded and GitHub submission authorised; human observation and peer acceptance pending.** Date: 23 November 2026 (Asia/Shanghai). The original internal target was 22 November at 18:00; work is recorded on the actual date.

- Task owner: Wang Yikai (B). Operator for this record, code correction and browser execution: Codex at the user's request.
- Starting/current-main commit: `cbe4089ed94c71638ecef9b8300d397d529a9c43`.
- Supplied snapshot: `90d6b6d9bdee2644f0a9aae3675932df8d46a980`. Latest main was fetched before development; existing W2 branch was preserved.
- Submission branch: `codex/b-w4-usability-20261123`. Tested revision is the base plus the recorded implementation changes; publication-only documentation updates do not change the tested source or runner.
- Actual student hours: not supplied. The package's 6 h is an estimate, not time spent. Command start/end times are recorded in evidence.
- Final JAR SHA-256: `7d98ac6227fe6b857c27fdc627e51fd203c48e8b77ba91178115444f6c038e9e`.
- [Trello delivery record](https://trello.com/c/8MZHEL1I): W4 increment ZIP and dated technical summary uploaded on 23 November before GitHub publication. The card records the resulting commit/PR links. The ZIP preserves the earlier preparation snapshot; this repository version updates publication wording only.

## Inherited work

PR #16 already supplied the live preview, five-interest limit feedback and profile checks. PR #19 supplied five motion effects. Latest main additionally contains D's reliable-send work, A's RSVP/sticker effects and C/E/F records. Their code and historical results are not this contribution.

## New contribution

A populated message inbox can hide wide grid content while the whole page reports no horizontal overflow. At 390 px the visible workspace was 350 px wide, but its pane was 620.34 px and search/contact rows were 580.34 px. At 320 px the keyboard focus border and right-hand content were clipped.

Added `min-width:0` to the existing `.inbox-list-pane` rule in `reference-ui.css`. This is the only application-source change. Added `scripts/usability-browser/run-usability-check.mjs` and its README for inner containment, complete narrow keyboard flows, history replay and independent motion settings. The change is a proposed correction for A/C review; shared-layout agreement and integration have not occurred.

## Results

The baseline build passed **77 Java tests**. Existing profile checks passed **7 groups** and the current motion runner passed **9 groups**. After the CSS change, packaging succeeded with Java tests explicitly skipped, because Java source was unchanged; the **7 profile groups** and **5 new W4 groups** passed against the fixed JAR. These are group counts, not participant counts or newly invented coverage quotas.

[Actual test record](B_test_record.md) · [Defect and retest](B_defect_and_retest.md) · [Post-merge motion review](B_motion_review.md) · [Provenance and hashes](evidence/B_W4_20261123/manifest.json).

## Review and critical incident

No C/A review is claimed. The user confirmed that real observation/review materials are unavailable and asked that they remain pending. The technical motion review is dated 23 November, not backdated approval.

A useful critical incident was the difference between document overflow and clipped inner content. The existing empty-inbox check passed while seeded rows exposed the defect. Early harness measurements also sampled before scrolling/navigation settled; a later count included permitted 0.01 ms focus transitions. Those failures were retained and diagnosed rather than reported as product defects or hidden. The correction checks observable containment and keyboard access.

Proposed PDP action for Wang to adopt: before the 26 November scope freeze, reproduce the inbox correction once without automation, run the four consented tasks with available volunteers, and explain one original failure versus one confirmed product defect to C. This is a proposed learning action, not a claim of completed personal reflection.

## Remaining work and assistance

[B_usability_observation.md](B_usability_observation.md) records zero observed participants and supplies neutral task prompts. C prioritises real findings and reviews the outcome; A agrees shared CSS and integrates. Real screen-reader announcements, physical phones, actual Windows preference interaction and contrast compliance were not tested. No full accessibility certification is claimed.

AI assistance: Codex inspected the archive/source/PR diff, authored the scoped CSS correction and runner, executed local tests, selected evidence and drafted these records. Wang must review and explain the contribution. The course reflection template remains a separate personal task; no first-person experiences were fabricated.
