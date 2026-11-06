# D Zhou Ziyue: Executable Test Tasks

Owner: **Zhou Ziyue**. Reviewer: **E Wu Zhuoda**. All six groups start **Not run**. Implement these with your increment; the baseline's existing 19 Java tests are not your new work.

| ID | Scenario | Test level | Assertion | State |
|---|---|---|---|---|
| D-01 | Unread ownership | Integration | Incoming messages increase the recipient count; sent messages do not count as unread for the sender. | Not run |
| D-02 | Read acknowledgement | Integration | Opening/acknowledging clears only the current participant, and a later incoming message becomes unread. | Not run |
| D-03 | Older-message boundaries | Parameterized integration | 0, 1, 100 and more than 100 messages produce bounded, ordered pages without missing items. | Not run |
| D-04 | Polling and paging overlap | Integration/browser | Overlapping responses and equal timestamps do not duplicate or reorder messages. | Not run |
| D-05 | Access boundaries | Integration | Unrelated, blocked and ended participants cannot read/write history or read markers contrary to the agreed policy. | Not run |
| D-06 | List and conversation states | Browser | Unread/empty/error states, long messages and keyboard send remain usable at 390 px and desktop. | Not run |

Use JUnit/Spring integration tests for server rules, browser automation for UI and isolated PowerShell/process tests for backup/restore. Agree a browser-test dependency/command with A/F before introducing it; the baseline includes Maven tests but no shared browser-test runner yet. Parameterise useful boundaries; do not duplicate tests just to reach a count.

Deliver test source and fixtures with the feature, exact commands, exit code, version and readable output. Keep a real failing/retest pair when a defect occurs. Link the relevant screenshots from your own progress MD with relative paths.

First checkpoint: three relevant scenarios with the feature. By 22 Nov: all six groups and two independently run checks from the member whose work you review. During W4, retest changed areas and one cross-module flow. See [your task](./D_Zhou_Ziyue_TASK.md).
