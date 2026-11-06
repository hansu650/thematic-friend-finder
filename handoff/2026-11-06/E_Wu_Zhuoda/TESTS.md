# E Wu Zhuoda: Executable Test Tasks

Owner: **Wu Zhuoda**. Reviewer: **F Song Peitong**. All six groups start **Not run**. Implement these with your increment; the baseline's existing 19 Java tests are not your new work.

| ID | Scenario | Test level | Assertion | State |
|---|---|---|---|---|
| E-01 | Role gate | Integration | Staff can open report review; anonymous and ordinary members cannot access the page or underlying actions. | Not run |
| E-02 | Report confidentiality | Integration | A reporter sees their own receipt; another member cannot enumerate report details by changing IDs. | Not run |
| E-03 | Allowed status transition | Integration | Valid review actions persist the selected status and review metadata; invalid transitions are rejected. | Not run |
| E-04 | CSRF and validation | Parameterized integration | Missing CSRF, blank/overlong reason and malformed identifiers produce a controlled rejection. | Not run |
| E-05 | Block and end boundaries | Integration | Either-direction blocks/end decisions stop the relevant discovery and chat operations consistently. | Not run |
| E-06 | Accessible safety flow | Browser | Report/block controls are reachable from a small screen and keyboard; confirmation, cancellation and result feedback are clear. | Not run |

Use JUnit/Spring integration tests for server rules, browser automation for UI and isolated PowerShell/process tests for backup/restore. Agree a browser-test dependency/command with A/F before introducing it; the baseline includes Maven tests but no shared browser-test runner yet. Parameterise useful boundaries; do not duplicate tests just to reach a count.

Deliver test source and fixtures with the feature, exact commands, exit code, version and readable output. Keep a real failing/retest pair when a defect occurs. Link the relevant screenshots from your own progress MD with relative paths.

First checkpoint: three relevant scenarios with the feature. By 22 Nov: all six groups and two independently run checks from the member whose work you review. During W4, retest changed areas and one cross-module flow. See [your task](./E_Wu_Zhuoda_TASK.md).
