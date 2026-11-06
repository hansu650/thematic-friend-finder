# C Tao Jiacheng: Executable Test Tasks

Owner: **Tao Jiacheng**. Reviewer: **D Zhou Ziyue**. All six groups start **Not run**. Implement these with your increment; the baseline's existing 19 Java tests are not your new work.

| ID | Scenario | Test level | Assertion | State |
|---|---|---|---|---|
| C-01 | Valid password change | Integration | A signed-in member supplies the current password, changes it, and can use the new credential under the agreed session policy. | Not run |
| C-02 | Wrong current password | Integration | A wrong current password rejects the change and leaves the original credential working. | Not run |
| C-03 | Validation boundaries | Parameterized unit/integration | Blank, mismatched and invalid-length new passwords return field errors without partial writes. | Not run |
| C-04 | Ownership and authentication | Integration | Anonymous users and another member cannot change the target account by substituting an ID. | Not run |
| C-05 | CSRF and safe handling | Integration | A state-changing request without valid CSRF is rejected; responses do not expose password values. | Not run |
| C-06 | Session and contract regression | Integration/browser | Refresh, logout and session behavior match the documented decision; existing login/profile flows still work. | Not run |

Use JUnit/Spring integration tests for server rules, browser automation for UI and isolated PowerShell/process tests for backup/restore. This ZIP retains the merged Maven baseline. A has an optional discovery browser runner on PR #9; reuse it as a regression after integration and add checks for your own feature. Agree and document any new browser/process test command with A/F. Parameterise useful boundaries; do not duplicate tests just to reach a count.

Deliver test source and fixtures with the feature, exact commands, exit code, version and readable output. Keep a real failing/retest pair when a defect occurs. Link the relevant screenshots from your own progress MD with relative paths.

First checkpoint: three relevant scenarios with the feature. By 22 Nov: all six groups and two independently run checks from the member whose work you review. During W4, retest changed areas and one cross-module flow. See [your task](./C_Tao_Jiacheng_TASK.md).

## Capture and submission

Use [CAPTURE.md](./CAPTURE.md) for live output and [SUBMIT.md](./SUBMIT.md) for branch/PR steps. Submit executable source, not a picture of test code. Code screenshots are optional for B–F.
