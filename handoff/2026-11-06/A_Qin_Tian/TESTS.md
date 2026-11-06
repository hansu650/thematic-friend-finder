# A Qin Tian: Executable Test Tasks

Owner: **Qin Tian**. Reviewer: **B Wang Yikai**. The included ZIP is the earlier 19-test baseline. A's first discovery increment has separate local evidence (31 Java tests and 11 browser groups); independent review and later integrated acceptance are pending. Do not infer current implementation status from this starting snapshot.

| ID | Scenario | Test level | Assertion | State |
|---|---|---|---|---|
| A-01 | Filtering and explanations | Service or integration | An interest/goal filter returns only eligible profiles; the displayed shared interests equal the intersection. | Not run |
| A-02 | Exclusions | Service or integration | Self, hidden profiles and blocks in either direction never enter the candidate list. | Not run |
| A-03 | Mutual matching | Integration | One like does not open chat; reciprocal likes create exactly one connection, including repeated submissions. | Not run |
| A-04 | Swipe and buttons | Browser | Short drags return; committed mouse/touch gestures and keyboard/button decisions each submit once. | Not run |
| A-05 | Result and recovery | Browser | Matching feedback opens the correct conversation; an empty result offers working clear/revisit actions. | Not run |
| A-06 | Small screens and language | Browser | At 390 px and desktop widths, controls remain usable; EN/Chinese and reduced motion preserve the same action. | Not run |

Use JUnit/Spring integration tests for server rules, browser automation for UI and isolated PowerShell/process tests for backup/restore. This ZIP retains the merged Maven baseline. A has an optional discovery browser runner on PR #9; reuse it as a regression after integration and add checks for your own feature. Agree and document any new browser/process test command with A/F. Parameterise useful boundaries; do not duplicate tests just to reach a count.

Deliver test source and fixtures with the feature, exact commands, exit code, version and readable output. Keep a real failing/retest pair when a defect occurs. Link the relevant screenshots from your own progress MD with relative paths.

First checkpoint: three relevant scenarios with the feature. By 22 Nov: all six groups and two independently run checks from the member whose work you review. During W4, retest changed areas and one cross-module flow. See [your task](./A_Qin_Tian_TASK.md).

## Capture and submission

Use [CAPTURE.md](./CAPTURE.md) for live output and [SUBMIT.md](./SUBMIT.md) for branch/PR steps. Submit executable source, not a picture of test code. Code screenshots are optional for B–F.
