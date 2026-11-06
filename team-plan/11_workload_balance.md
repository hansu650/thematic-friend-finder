# Workload Balance and Shared Responsibilities

User decision, 6 November 2026: A may take more work, but B–F should have comparable workloads and meaningful responsibility. The initial five-week allocation is **A: 42 hours; B, C, D, E and F: 28 hours each**. These are estimates to confirm, not records of actual contributions or a claim that all features are equally difficult.

| Member | Independent implementation | Additional responsibility that counts as work | Estimated total |
|---|---|---|---|
| A Qin Tian | Existing AI-assisted baseline, discovery, contracts and integration | Product Owner, shared contracts, five-module integration, final acceptance, team coordination and demonstration organisation | 42 h |
| B Wang Yikai | Live profile preview, interest counter and accessible interaction | Lead usability observation and help coordinate the demonstration | 28 h |
| C Tao Jiacheng | Password change, account/session policy and data contracts | Review B and support D's read-state data contract | 28 h |
| D Zhou Ziyue | Unread indicators and older-message history | Review C and support communication/safety boundaries | 28 h |
| E Wu Zhuoda | Restricted report review and permission tests | Scrum Master, blockers, retrospective and review of D | 28 h |
| F Song Peitong | Backup/restore tools and clean-copy reproduction | Runtime handover, review of E and reproduction coordination | 28 h |

All five have a real code increment, self-tests, peer review, integration work, a short progress record, demonstration participation and their own reflection. B has a somewhat smaller main code package and more observation/demonstration work. C/D have more implementation time. E's facilitation and F's reproduction work reduce the room for unrelated extras. Coordination is included in the estimates, not added invisibly afterwards.

## Review and adjustment

1. At Sprint Planning, each member confirms available time and explains the task's dependencies and difficult parts.
2. Split work into 1–3 hour cards. Check actual progress and blockers together; do not judge contribution by line counts or the number of commits.
3. If a package is materially harder than expected, transfer a small, bounded task or reduce optional scope. Record the reason, new owner and estimates on the board and update the workbook.
4. Keep the 28-hour figures as a comparable starting budget, not a quota that forces invented hours or extra work. Actual evidence remains individual.

The [workbook](./project-management/six-person-gantt.xlsx) contains the task-by-member estimates and capacity inputs. The current capacity figures are provisional. Named responsibilities do not create extra Scrum accountabilities: A is Product Owner plus Developer; E is Scrum Master plus Developer; B/C/D/F are Developers with specific coordination focuses.

Use the confirmed [team roster](./00_team_roster.md) on every task publication. Follow the [UI map](./12_ui_reference_map.md) and [test/evidence plan](./13_testing_and_weekly_evidence.md).
