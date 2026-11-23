# B: Actual test record

Date: **23 November 2026, Asia/Shanghai**. Tester: **Codex automated local execution**. Windows 11 Home Chinese 10.0.26200; Java 21.0.12.1; Node v24.21.0; Edge 158.0.4370.33; Playwright 1.62.1. Viewports: 1440 px desktop, 390 × 844 and 320 × 844 emulation. These are not physical phone observations.

Source: `cbe4089ed94c71638ecef9b8300d397d529a9c43`, followed by the single CSS correction plus the new test runner. Baseline JAR: `d962a4d204b4170465164f3adbf7b268d91e6bf0ed4e4cf5d783c66f02b66dff`. Fixed JAR: `7d98ac6227fe6b857c27fdc627e51fd203c48e8b77ba91178115444f6c038e9e`. Full source/runner hashes and actual start/end timestamps are in the linked JSON evidence.

## Commands and outcomes

All commands ran from `code/thematic-friend`. Browser executable and JDK paths were set to the installed Windows tools; TEMP/TMP and outputs were directed to D:. Demo servers used fresh loopback ports, random fictional credentials and isolated H2 files.

| Command / phase | Actual result | Exit | Evidence |
|---|---|---:|---|
| `.\scripts\build.ps1` on unmodified main | 77 tests, 0 failures/errors/skips; BUILD SUCCESS. A remote metadata handshake warning was nonfatal. | 0 | [Full shared build output](evidence/B_W4_20261123/baseline-build.txt), [metadata](evidence/B_W4_20261123/baseline-build.json) |
| `node scripts/profile-browser/run-profile-check.mjs` baseline | Existing 7 groups passed. | 0 | [Results](evidence/B_W4_20261123/baseline-profile-results.json), [output](evidence/B_W4_20261123/baseline-profile.txt) |
| `node scripts/motion-browser/run-motion-check.mjs` baseline | Current 9 groups passed, including later RSVP and stickers. | 0 | [Results](evidence/B_W4_20261123/baseline-motion-results.json), [output](evidence/B_W4_20261123/baseline-motion.txt) |
| `MINGLE_CHECK_GROUP=B-W4-INBOX`, then W4 runner before fix | Failed: 620.34 px pane inside 350 px visible workspace at 390 px. | 1 | [Failure](evidence/B_W4_20261123/inbox-before-results.json), [output](evidence/B_W4_20261123/inbox-before.txt) |
| Full W4 keyboard probe before fix | 390 px center hit-test passed; 320 px focus hit-test failed. Stronger containment check above captures the 390 px clipping too. | 1 | [Results](evidence/B_W4_20261123/keyboard-before-results.json) |
| `.\scripts\build.ps1 -SkipTests` after CSS correction | BUILD SUCCESS; Java tests explicitly skipped. Only CSS changed in application source. | 0 | [Output](evidence/B_W4_20261123/fixed-package.txt), [metadata](evidence/B_W4_20261123/fixed-package.json) |
| Profile runner on fixed JAR | 7/7 groups passed. | 0 | [Results](evidence/B_W4_20261123/profile-retest-results.json), [output](evidence/B_W4_20261123/profile-retest.txt) |
| `node scripts/usability-browser/run-usability-check.mjs` on fixed JAR; group filter unset | 5/5 groups passed; no browser exceptions. | 0 | [Results](evidence/B_W4_20261123/usability-retest-results.json), [output](evidence/B_W4_20261123/usability-retest.txt) |

## Task mapping

| ID | Expected | Actual and evidence | Status |
|---|---|---|---|
| B-W4-T1 | Focus, sixth-interest feedback and explicit Save; drafts must not silently persist. | Existing B-01/B-02/B-04/B-FALLBACK passed. New 390/320 keyboard flows edit/reset/save and reach chat using keyboard actions. Live regions were checked semantically. | Automated pass; real screen reader untested |
| B-W4-T2 | Discover, match, events and chat fit at 320/390 px with reachable actions. | Existing MATCH checks cover both widths; new flows cover Discover/Event/Chat and populated-inbox containment. Original clipping failed, fixed result passed. | Automated pass after fix |
| B-W4-T3 | Manual and system reduced motion independently suppress optional effects while forms work. | Existing REDUCED passed; new independent contexts verify manual reduce with system false, then system true with manual unchecked, at 320 px. Recorded focus transitions were at most 0.01 ms; JavaScript message arrival effects were absent. | Automated pass; OS preference emulated |
| B-W4-T4 | Save state is confirmed; reload/unsave/denial do not replay feedback; no history/poll duplication. | Existing SAVE-MOTION/CHAT-MOTION passed. New history run loaded 109 ordered unique messages and observed two subsequent polls without arrival replay. 105 messages were explicit API fixture setup, not a typing claim. | Automated pass |
| B-W4-T5 | Consented observation with actual actions and comments. | No participant records supplied; [prepared observation record](B_usability_observation.md). | Pending human work |
| B-W4-T6 | Dated post-merge review plus selected correction/retest. | [PR #19 review](B_motion_review.md) and [confirmed inbox defect](B_defect_and_retest.md). Technical review is Codex-assisted; C/A acceptance not supplied. | Technical work complete; peer acceptance pending |

## Harness failures retained

Initial focus measurements preceded smooth scrolling and inspected an ordinary checkbox's text instead of its visible input. A second iteration corrected those points but did not yet wait for navigation overlays. Corrected waits do not force scroll/focus or disable application motion. [Initial evidence](evidence/B_W4_20261123/harness-initial-results.json), [timing evidence](evidence/B_W4_20261123/harness-timing-results.json).

The first combined reduced-motion assertion counted six **0.01 ms CSSTransition** effects on the scrollable message container; manual/system state showed reduction active. These were focus transitions allowed by existing shared CSS, not bubble arrival animations. The final assertion permits only CSS transitions ≤0.01 ms and rejects JavaScript chat animations or longer transitions. [Diagnostic result](evidence/B_W4_20261123/harness-reduced-diagnosis-results.json). Product motion settings were not changed to make tests pass.

The selected screenshots are direct browser captures, not terminal simulations. Shared terminal copies are labelled and redact any generated security-password line; full originals stay under `D:\Codex\Work\b-w4-20261123`. H2 files, cookies and private server logs are excluded from submission.
