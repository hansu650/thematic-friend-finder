# B Wang Yikai: Executable Test Tasks

Owner: **Wang Yikai**. Reviewer: **C Tao Jiacheng**. All six groups start **Not run**. Implement these with your increment; the baseline's existing 19 Java tests are not your new work.

| ID | Scenario | Test level | Assertion | State |
|---|---|---|---|---|
| B-01 | Unsaved preview | Browser | Editing name, bio, goal and interests updates the preview; refresh restores persisted values. | Not run |
| B-02 | Interest limit | Browser | Select/deselect works with mouse and keyboard; a sixth selection gives clear feedback and no silent data loss. | Not run |
| B-03 | Safe text | Browser | HTML-like and long input renders as text, never executable markup, and fits at 390 px. | Not run |
| B-04 | Keyboard flow | Browser | Tab order, visible focus, Enter/Space and announced preview/limit feedback work without a pointer. | Not run |
| B-05 | Responsive navigation | Browser | 390 px and desktop layouts have no horizontal overflow; the active destination and content are reachable. | Not run |
| B-06 | Language and motion | Browser | Both temporary languages keep labels associated with controls; reduced motion avoids unnecessary animation. | Not run |

Use JUnit/Spring integration tests for server rules, browser automation for UI and isolated PowerShell/process tests for backup/restore. Agree a browser-test dependency/command with A/F before introducing it; the baseline includes Maven tests but no shared browser-test runner yet. Parameterise useful boundaries; do not duplicate tests just to reach a count.

Deliver test source and fixtures with the feature, exact commands, exit code, version and readable output. Keep a real failing/retest pair when a defect occurs. Link the relevant screenshots from your own progress MD with relative paths.

First checkpoint: three relevant scenarios with the feature. By 22 Nov: all six groups and two independently run checks from the member whose work you review. During W4, retest changed areas and one cross-module flow. See [your task](./B_Wang_Yikai_TASK.md).
