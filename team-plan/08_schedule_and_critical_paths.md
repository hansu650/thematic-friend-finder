# Gantt Chart and Critical Paths

[Excel workbook](./project-management/six-person-gantt.xlsx) · [Editable Draw.io source](./project-management/critical-paths.drawio) · [SVG preview](./project-management/critical-paths.svg)

The model starts with remaining work on **6 November 2026** and uses calendar days, including weekends. Finish dates include the final task day. Duration and person-hours are separate estimates. The two-week Sprint boundaries do not reset whenever cards move.

## Workbook

- **Gantt:** coral bars are zero-float tasks, blue bars have float, grey marks the 5–6 December buffer. Bars show plans, not completion.
- **Critical paths:** yellow start/target/duration inputs are editable. Dates, early/late boundaries, total float and Gantt bars recalculate. Dependencies are encoded in the formulas: changing only the predecessor text does not change the network. Update forward and backward formulas together.
- **Team effort:** editable person-hour estimates and capacity. Totals, A's share and remaining capacity recalculate. A's allocation is larger than any other member's. Confirm real availability before commitment.

No hours or completion state are presented as actual contributions. Use PRs and the board for real execution evidence.

## Initial result

Two equal critical paths:

1. T01 → T02 → T03 → T07 → T09 → T10 → T11 → T12 → T13 → T15 → T16.
2. T01 → T02 → T04 → T07 → T09 → T10 → T11 → T12 → T13 → T15 → T16.

Each takes **29 calendar days**, giving an earliest finish of **4 December**, with **2 days** before the internal 6 December target. T03 and T04 both constrain T07; shortening only one tied branch does not shorten the project. Other tasks can become critical if their delays exceed their float.

Boundaries start at day 0. A task's earliest start is the maximum earliest finish among its predecessors. Earliest finish equals start plus duration. Work backward from the project finish: latest finish is the minimum latest start of the successors. Total float equals latest start minus earliest start.

CPM assumes the proposed parallel work is feasible. It does not automatically resolve resource conflicts. A's principal architecture, discovery and integration packages are sequential, but supporting hours and absences must still be checked against capacity. Update scope, durations and dependencies when circumstances change.

Draw.io is an editable snapshot of the current estimate, not a live Excel link. Update its durations, dates, float and highlighted edges after changing the workbook. The source uses Comic Sans MS for ordinary diagram text and MathJax for formulas.

## Role and effort revision — 9 November 2026

A now combines Product Owner, Scrum Master and Developer; E is Developer and Test Coordinator. Within the existing estimates, T11 review/triage changes from A 2 h / E 2 h to A 3 h / E 1 h, and T13 reproduction/retesting changes from A 2 h / E 2 h to A 1 h / E 3 h. This transfers facilitation effort to A and more regression coordination to E.

Totals remain A 42 h and B–F 28 h each (182 h overall). Task owners, durations and dependencies are unchanged, so the critical-path diagram remains the same calendar estimate. Capacity still needs confirmation; these are planned hours.
