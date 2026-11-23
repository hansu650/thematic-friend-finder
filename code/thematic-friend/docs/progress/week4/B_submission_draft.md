# B: Submission text and publication record

The user authorised Trello upload followed by GitHub submission on 23 November 2026. The W4 increment ZIP and technical summary were uploaded to the [existing Trello card](https://trello.com/c/8MZHEL1I) first. The GitHub submission branch is `codex/b-w4-usability-20261123`; actual commit/PR links are recorded on that card. Human observation/review remain pending as requested by the user.

The text below preserves the preparation-stage wording for traceability. It is not a claim that publication is still pending. The Trello ZIP is the original preparation snapshot; repository documentation was updated for this publication, with no source/test changes.

## Proposed PR title

Fix clipped mobile inbox and add W4 keyboard usability evidence

## Proposed PR body

With populated conversations, the mobile inbox could render a 620 px grid pane inside a 350 px visible workspace. Search, unread indicators and the keyboard focus outline were clipped even when document overflow checks passed.

Allow the inbox grid item to shrink with `min-width:0`. Add a browser regression that checks inner containment at 1440/390/320 px, keyboard profile-to-chat flows, history replay, and independent reduced-motion settings. Include B's dated PR #19 technical review, original failure and retest, and an explicit pending observation record.

Validation: baseline `cbe4089ed94c71638ecef9b8300d397d529a9c43` passed 77 Java tests, 7 existing profile groups and 9 current motion groups. The CSS-only correction was repackaged with Java tests explicitly skipped; the fixed JAR passed 7 profile groups and 5 new W4 groups. Source/JAR/runner hashes and original failures are in `docs/progress/week4/evidence/B_W4_20261123`.

Limits: automated Edge viewport/media-preference emulation; no participant or real screen-reader result. Codex authored the correction, checks and draft records at the user's request. C's real review and A's shared-CSS agreement/integration are pending.

## Prepared Trello update

23 November — B W4 technical increment prepared locally. Reproduced populated-inbox clipping at narrow widths; added one scoped CSS correction and automated failure/retest evidence. Profile and new W4 checks pass. PR link to be added after publication. Consented observations and C/A acceptance are pending. Keep the card in review/testing according to actual team state; do not mark Done from these automated results alone.

Existing destination: https://trello.com/c/8MZHEL1I

## Remaining team actions

Wang checks and explains the files, supplies real task observations and submits the focused increment. C reviews/prioritises the outcome. A agrees the shared CSS and integrates. Add real publication/review links only when those events occur.
