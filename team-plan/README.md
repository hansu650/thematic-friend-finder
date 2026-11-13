# Mingle Six-Person Project Plan

Updated 9 November 2026. This is the English working pack for a browser-based friendship website using **Java 21, Spring Boot, Thymeleaf, HTML/CSS/JavaScript and file-based H2**. A owns the existing AI-assisted baseline, discovery and integration. B–F each own a new increment that is not yet implemented. See [baseline ownership and new increments](./10_baseline_and_member_increments.md).

**Role revision, 9 November:** Qin Tian (A) combines Product Owner, Scrum Master and Developer; Wu Zhuoda (E) is Developer and Test Coordinator. See the [current roles](./02_roles_and_collaboration.md) and [revised effort allocation](./11_workload_balance.md). Earlier Week 1 briefs and dated handoff packages retain their original history; use this plan for current responsibilities.

## Start here

- [Six named development packages: task MDs and runnable source ZIPs](../handoff/2026-11-06/README.md). Begin with your package's `START_HERE.md`.
- [Named team roster](./00_team_roster.md), [UI references and page ownership](./12_ui_reference_map.md), and [testing and weekly evidence](./13_testing_and_weekly_evidence.md).
- [Core flow, completion gates and highest-band evidence](./14_final_acceptance_and_assessment.md).
- [Live Trello board](https://trello.com/b/j4LiifAK).

- [Five-week plan](./01_five_week_plan.md), [roles and collaboration](./02_roles_and_collaboration.md) and [prototype handover](./07_prototype_handover.md).
- [Trello and Kanban](./03_trello_kanban.md), [Product Backlog](./04_product_backlog.md) and [course sources](./05_course_sources.md).
- [Excel Gantt chart](./project-management/six-person-gantt.xlsx), [editable Draw.io critical paths](./project-management/critical-paths.drawio) and [how to read the schedule](./08_schedule_and_critical_paths.md).
- [Spring Boot contracts](./09_spring_boot_contracts.md) and the [application README](../code/thematic-friend/README.md).

## Individual task files

A's earlier research is available as an [English translation with its original provenance](./research/week1/A_discovery_research.md).

| Member | Code responsibility | Week 1 | Week 2 |
|---|---|---|---|
| A Qin Tian | Baseline, discovery and integration | [Research](./tasks/week1/A_discovery_research.md) | [Development](./tasks/week2/A_discovery.md) |
| B Wang Yikai | Live preview and accessibility | [Research](./tasks/week1/B_interface_research.md) | [Development](./tasks/week2/B_interface.md) |
| C Tao Jiacheng | Password change and data contracts | [Research](./tasks/week1/C_accounts_research.md) | [Development](./tasks/week2/C_accounts.md) |
| D Zhou Ziyue | Unread indicators and chat history | [Research](./tasks/week1/D_connections_research.md) | [Development](./tasks/week2/D_connections.md) |
| E Wu Zhuoda | Restricted report review | [Research](./tasks/week1/E_safety_research.md) | [Development](./tasks/week2/E_safety.md) |
| F Song Peitong | Backup/restore and reproduction | [Research](./tasks/week1/F_runtime_research.md) | [Development](./tasks/week2/F_runtime.md) |

## Iteration rhythm

| Window | Purpose | Working file |
|---|---|---|
| 2–8 Nov | Preparation; remaining schedule starts 6 Nov | [Kick-off agenda](./meetings/week1_kickoff.md) |
| 9–15 Nov | Sprint 1, core flow | [Week 2](./weeks/week2.md) |
| 16–22 Nov | Sprint 1, integration and review | [Week 3](./weeks/week3.md) |
| 23–29 Nov | Sprint 2, improvements and reproduction | [Week 4](./weeks/week4.md) |
| 30 Nov–6 Dec | Sprint 2, demonstration and reflection | [Week 5](./weeks/week5.md) |

These are proposed internal dates, not the university deadline. Both Sprints last two weeks. Names and A–F mapping are confirmed in the roster. Capacity and final commitments still need confirmation by the members. Meeting and contribution templates are not records of work already performed.

The [GitHub repository](https://github.com/hansu650/thematic-friend-finder) is public. The Java baseline was merged through PR #8. Start a new development branch from current `main`, or preserve and continue an existing task branch. The named ZIPs retain that baseline with revised task/capture/submission instructions; A's discovery increment remains a separate reviewable PR. Existing research branches and historical planning remain as evidence. The website has a temporary EN/Chinese switch and defaults to English.

Workload target: A 42 hours; B–F 28 hours each, including coordination and evidence. See [workload balance](./11_workload_balance.md) for the allocation and adjustment rule.
