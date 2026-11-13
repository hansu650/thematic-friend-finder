# Schedule Verification

The final English schedule has 16 work packages and 20 finish-to-start dependencies. Its initial CPM duration is **29 calendar days**, ending on **4 December 2026**, with two days before the internal 6 December target. Two equal critical paths pass through T03 and T04 respectively, then join at T07.

The workbook contains **825 formulas**. Its exported cached values were read back from the XLSX: duration 29 days; person-hours **A 42, B 28, C 28, D 28, E 28, F 28**. No cached formula-error cells or Chinese visible strings were found. The authoring calculation was also checked against an independent JavaScript forward/backward pass. Temporarily increasing T03 by one day increased the project duration to 30 days and gave the tied T04 branch one day of float; restoring the input restored the baseline result.

The spreadsheet authoring runtime produced the XLSX and all previews, then returned process exit code 1 without an error message. Therefore its exit status is not recorded as a passing process check. The exported workbook was separately checked for its formulas, cached values, language and visual layout as described above.

The product rename changed only `Gantt!A2` to Mingle. All four sheets' other cell values and formulas were compared before/after and matched. The final formula scan returned zero errors, and the changed title was rendered and visually checked. This edit again produced the output before the runtime returned exit 1; the process status is not described as passed.

Draw.io source is editable, uses Comic Sans MS for ordinary diagram text and enables MathJax. SVG and PNG exports completed with exit code 0. Labels, the mathematical formula and routed side branches were visually inspected. Draw.io remains a static estimate snapshot and must be updated after dependency or duration changes in Excel.

The Mingle title was patched in the existing Draw.io source without changing the routed layout. The Windows sandbox could not start the installed Draw.io exporter; the approved run outside that sandbox exported both SVG and PNG with exit code 0. The resulting title, Comic Sans MS labels and rendered mathematical formula were checked.

These are planning checks, not actual team progress or confirmed member capacity. See [workload balance](../11_workload_balance.md).

## Role and effort update — 9 November 2026

The Team effort sheet now identifies A as Product Owner, Scrum Master and Developer, and E as Developer and Test Coordinator. T11 allocation changed from A 2 h / E 2 h to A 3 h / E 1 h; T13 changed from A 2 h / E 2 h to A 1 h / E 3 h. Only these four numeric inputs and the role note changed inside the workbook.

The edited workbook was reopened and its XML/cell data checked. All existing formula expressions and cached formula values were retained. Recomputed member totals remain 42/28/28/28/28/28 hours and all task totals are unchanged. Scheduling inputs and dependencies remain unchanged. This update checked workbook structure and data; no new spreadsheet visual-rendering check or application test run was performed.
