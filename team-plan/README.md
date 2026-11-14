# Mingle Six-Person Project Plan

Updated 14 November 2026. This is the English working pack for a browser-based friendship website using **Java 21, Spring Boot, Thymeleaf, HTML/CSS/JavaScript and file-based H2**. A owns the AI-assisted baseline, discovery/UI and integration. B–F have merged their initial increments, including B's PR #16. D's reliability follow-up, final acceptance, real user observation and assessment evidence remain to be completed. See the [current six-week plan](./16_six_week_evidence_plan.md).

**Current roles:** Qin Tian (A) is Scrum Master and Lead Developer; Tao Jiacheng (C) is Product Owner; B, D, E and F are Developers. Qin Tian is the primary technical contributor, and Qin Tian and Tao Jiacheng shared project-selection work. See the [contribution record](./15_contribution_and_ownership.md). See the [current roles](./02_roles_and_collaboration.md) and [revised effort allocation](./11_workload_balance.md). Earlier Week 1 briefs and dated handoff packages retain their original history; use this plan for current responsibilities.

## Start here

- [Six-week delivery, assessment requirements, evidence gaps and current responsibilities](./16_six_week_evidence_plan.md).
- [Mingle Team Kanban](https://trello.com/b/j4LiifAK/mingle-team-kanban): daily tasks, owners, internal targets and acceptance checklists. See the [verified board update](./03_trello_kanban.md).
- [Current ten-page Draw.io design pack and browser gallery](../code/thematic-friend/docs/design/README.md), [six-week Gantt workbook](project-management/six-week-gantt.xlsx) and [14 November verification and fixes](../code/thematic-friend/docs/releases/2026-11-14-main-verification.md).
- [One-session photo and capture guide](./17_photo_and_capture_session.md), [A's reflection blueprint](./18_A_reflection_blueprint.md) and [meeting record template](./meetings/session_record_template.md).

- [Six named development packages: task MDs and runnable source ZIPs](../handoff/2026-11-06/README.md). Begin with your package's `START_HERE.md`.
- [Named team roster](./00_team_roster.md), [UI references and page ownership](./12_ui_reference_map.md), and [testing and weekly evidence](./13_testing_and_weekly_evidence.md).
- [Core flow, completion gates and highest-band evidence](./14_final_acceptance_and_assessment.md).
- [Optional Scrum and evidence workbook](project-management/scrum-and-evidence.xlsx): retained as a template, not the daily management entry point.

- [Current calendar and retained five-week baseline](./01_five_week_plan.md), [roles and collaboration](./02_roles_and_collaboration.md) and [prototype handover](./07_prototype_handover.md).
- [Trello and Kanban](./03_trello_kanban.md), [Product Backlog](./04_product_backlog.md) and [course sources](./05_course_sources.md).
- [Historical Gantt baseline](./project-management/six-person-gantt.xlsx), [editable Draw.io critical paths](./project-management/critical-paths.drawio) and [current versus historical records](./project-management/README.md).
- [Spring Boot contracts](./09_spring_boot_contracts.md) and the [application README](../code/thematic-friend/README.md).

## Individual task files

A's earlier research is available as an [English translation with its original provenance](./research/week1/A_discovery_research.md).

| Member | Code responsibility | Week 1 | Week 2 |
|---|---|---|---|
| A Qin Tian | Baseline, discovery and integration | [Research](./tasks/week1/A_discovery_research.md) | [Development](./tasks/week2/A_discovery.md) |
| B Wang Yikai | Live preview and accessibility | [Research](./tasks/week1/B_interface_research.md) | [Development](./tasks/week2/B_interface.md) |
| C Tao Jiacheng | Product Owner; account/data contribution | [Research](./tasks/week1/C_accounts_research.md) | [Development](./tasks/week2/C_accounts.md) |
| D Zhou Ziyue | Chat, unread/history and [reliability follow-up](./tasks/week3/D_chat_reliability.md) | [Research](./tasks/week1/D_connections_research.md) | [Development](./tasks/week2/D_connections.md) |
| E Wu Zhuoda | Restricted report review | [Research](./tasks/week1/E_safety_research.md) | [Development](./tasks/week2/E_safety.md) |
| F Song Peitong | Backup/restore and reproduction | [Research](./tasks/week1/F_runtime_research.md) | [Development](./tasks/week2/F_runtime.md) |

## Six teaching weeks

| Window | Purpose | Working file |
|---|---|---|
| 26 Oct–1 Nov | Week 1: selection and research | Existing original records |
| 2–8 Nov | Week 2: scope and Java baseline | Dated handoff, PR and photo records |
| 9–15 Nov | Week 3: member increments and integration | Merged PRs and current evidence register |
| 16–22 Nov | Week 4: acceptance, observation and review | Trello cards, GitHub evidence and actual session notes |
| 23–29 Nov | Week 5: selected fixes, freeze and reproduction | Actual retest and delivery evidence |
| 30 Nov–6 Dec | Week 6: reflective writing, demonstration and handover | Individual reflections and team video |

The Week 1 anchor is inferred from the dated local note and Week 2 teaching schedule. Original W1–W5 delivery filenames retain their November numbering. The internal finish is 4 December. The supplied Moodle screenshot shows 18 December 2026 at 13:00, with no visible timezone. Capacity and commitments still need confirmation. Templates are not records of work already performed.

The [GitHub repository](https://github.com/hansu650/thematic-friend-finder) is public. The Java baseline was merged through PR #8. Start a new development branch from current `main`, or preserve and continue an existing task branch. The named ZIPs retain that baseline with revised task/capture/submission instructions; Current work and merged increments are recorded in the contribution map; the old ZIPs remain dated snapshots. Existing research branches and historical planning remain as evidence. The website has a temporary EN/Chinese switch and defaults to English.

Current proposed workload: A 50 h, C 40 h, D 34 h and B/E/F 28 h each, including coordination and evidence; total 208 h. See [workload balance](./11_workload_balance.md). The older Gantt workbook retains the 188-hour baseline for provenance.
