# A Qin Tian: Executable Test Tasks

Owner: **Qin Tian**. Reviewer: **B Wang Yikai**. All six groups start **Not run**. Implement these with your increment; the baseline's existing 19 Java tests are not your new work.

| ID | Scenario | Test level | Assertion | State |
|---|---|---|---|---|
| A-01 | Filtering and explanations | Service or integration | An interest/goal filter returns only eligible profiles; the displayed shared interests equal the intersection. | Not run |
| A-02 | Exclusions | Service or integration | Self, hidden profiles and blocks in either direction never enter the candidate list. | Not run |
| A-03 | Mutual matching | Integration | One like does not open chat; reciprocal likes create exactly one connection, including repeated submissions. | Not run |
| A-04 | Swipe and buttons | Browser | Short drags return; committed mouse/touch gestures and keyboard/button decisions each submit once. | Not run |
| A-05 | Result and recovery | Browser | Matching feedback opens the correct conversation; an empty result offers working clear/revisit actions. | Not run |
| A-06 | Small screens and language | Browser | At 390 px and desktop widths, controls remain usable; EN/Chinese and reduced motion preserve the same action. | Not run |

Use JUnit/Spring integration tests for server rules, browser automation for UI and isolated PowerShell/process tests for backup/restore. Agree a browser-test dependency/command with A/F before introducing it; the baseline includes Maven tests but no shared browser-test runner yet. Parameterise useful boundaries; do not duplicate tests just to reach a count.

Deliver test source and fixtures with the feature, exact commands, exit code, version and readable output. Keep a real failing/retest pair when a defect occurs. Link the relevant screenshots from your own progress MD with relative paths.

First checkpoint: three relevant scenarios with the feature. By 22 Nov: all six groups and two independently run checks from the member whose work you review. During W4, retest changed areas and one cross-module flow. See [your task](./A_Qin_Tian_TASK.md).
