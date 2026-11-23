# C | Week 4 defect and retest record

## C-W4-DEF-01 · Profile keyboard runner assumed one native selection gesture

| Field | Actual record |
|---|---|
| Reporter/date | Codex, 23 November 2026 |
| Baseline/environment | `ac9c61c1726fb31a70e7a28be70e1306ebbda926`; macOS 27.0.1, headless Chrome 157 and Playwright 1.62.1 |
| Steps | Run B's profile script on a clean fictional database. In B-04, Tab through the form to the native `#goal` select and press ArrowDown once. |
| Expected/actual | The original test expected a new value. Chrome retained `New friends`; B-04 timed out after B-01–03 passed. A plain native select reproduced the unchanged value with ArrowDown. Typing letters committed matching options in that independent probe. |
| Classification and action | Browser-test portability issue. Use native type-ahead on the focused control and check that the preview follows the draft. The first retest using `w` selected `Workout buddy` because two options begin with W. The final test uses the unambiguous `s` for `Study buddy`. |
| Changed file | [B profile runner](../../../scripts/profile-browser/run-profile-check.mjs) |
| Retest | Same integrated JAR, same Chrome and a new isolated database. All seven B groups passed, including B-04 focus, native keyboard selection and live preview. [Evidence](evidence/C_acceptance_results.txt) |
| Follow-up | B can confirm physical keyboard and assistive-technology interaction during consented observation. |

## C-W4-OBS-02 · Concurrent motion run missed the overshoot sample

The first motion run, started alongside conversation and retry browser runs, failed at `MAGNET` after `STAGGER` passed. The runner expected at least one sampled transform past the resting point. The unchanged suite passed all nine groups in a standalone rerun on the same JAR. Concurrent execution was a test condition and the cause of the sampling miss remains unconfirmed. Discovery separately passed the short-drag/no-decision and reduced-motion behaviors. Track recurrence as a test-reliability issue if it reproduces in a standalone run. [First failure and isolated retest](evidence/C_acceptance_results.txt)

## E-W4-DEF-01 · Inherited receipt wording fix

E's original record captures “Recorded, pending review” after staff resolution. E corrected the English and Chinese receipt and retained reviewer-only fields. The integrated Java run passed the original regression and the other permission tests. [E's observed failure and original retest](E_defects_and_retests.md) · [Current JUnit results](evidence/C_acceptance_results.txt)
