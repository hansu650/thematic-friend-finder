# Mingle: An Interest-Based Friendship Website

A six-person Thematic Project built as one **Java 21 / Spring Boot / Thymeleaf** browser website. The current code is **A Qin Tian's AI-assisted baseline**. B–F have separate, unimplemented increments; assigning a module does not claim that its owner has already completed it.

## Run the website

Open [code/thematic-friend](./code/thematic-friend/) as a Maven project in IntelliJ IDEA, select JDK 21 and run `ThematicFriendApplication`. The console prints the address; the default is **http://127.0.0.1:8080/**. Java, HTML, CSS and JavaScript are in the same project. No Node.js build is needed.

For six fictional test accounts, run `scripts/run-demo.ps1` from the Java project and choose a local password. Usernames: `demo_zhou`, `demo_lin`, `demo_xu`, `demo_chen`, `demo_he`, `demo_su`. Each person's localhost address and database are separate. This repository is source delivery, not a shared deployed website.

[Full build/run instructions](./code/thematic-friend/README.md) · [Baseline and ownership](./code/thematic-friend/docs/BASELINE.md) · [Local verification](./code/thematic-friend/docs/VERIFICATION.md)

![Mingle discovery page](./code/thematic-friend/docs/images/discover-en.png)

## Named development handoffs

Download your ZIP, fully extract it and begin with `START_HERE.md`. Each package contains the same clean source baseline, a named task, six test scenario groups, CAPTURE/SUBMIT/FINISH_LINE instructions, a progress template and selected supplied UI references. Code screenshots are optional for B–F. The ZIPs are dated handoff snapshots. Ongoing development belongs in the canonical `code/thematic-friend/` directory on your task branch.

| Member | New work | Task | Source ZIP |
|---|---|---|---|
| A Qin Tian | Discovery, match feedback and integration | [MD](./handoff/2026-11-06/A_Qin_Tian/A_Qin_Tian_TASK.md) | [ZIP](./handoff/2026-11-06/A_Qin_Tian.zip) |
| B Wang Yikai | Live profile preview and accessibility | [MD](./handoff/2026-11-06/B_Wang_Yikai/B_Wang_Yikai_TASK.md) | [ZIP](./handoff/2026-11-06/B_Wang_Yikai.zip) |
| C Tao Jiacheng | Password change and account/session contracts | [MD](./handoff/2026-11-06/C_Tao_Jiacheng/C_Tao_Jiacheng_TASK.md) | [ZIP](./handoff/2026-11-06/C_Tao_Jiacheng.zip) |
| D Zhou Ziyue | Unread indicators and older-message paging | [MD](./handoff/2026-11-06/D_Zhou_Ziyue/D_Zhou_Ziyue_TASK.md) | [ZIP](./handoff/2026-11-06/D_Zhou_Ziyue.zip) |
| E Wu Zhuoda | Restricted report review and permission tests | [MD](./handoff/2026-11-06/E_Wu_Zhuoda/E_Wu_Zhuoda_TASK.md) | [ZIP](./handoff/2026-11-06/E_Wu_Zhuoda.zip) |
| F Song Peitong | Backup/restore and independent reproduction | [MD](./handoff/2026-11-06/F_Song_Peitong/F_Song_Peitong_TASK.md) | [ZIP](./handoff/2026-11-06/F_Song_Peitong.zip) |

[Handoff index and validation](./handoff/2026-11-06/README.md) · [Six-person plan](./team-plan/README.md) · [Test and evidence plan](./team-plan/13_testing_and_weekly_evidence.md)

[A's actual terminal and code screenshots](./code/thematic-friend/docs/progress/week2/A_progress.md) · [Core-flow acceptance and highest-band assessment evidence](./team-plan/14_final_acceptance_and_assessment.md)

## Collaboration and schedule

Use `w<week>/<member-letter>-<task>`, such as `w2/a-discovery` and `w2/b-interface`. The shared Java baseline was merged in PR #8. Start a new member development branch from current `main`, or preserve and continue an existing task branch. The ZIPs can be used immediately for local work. Keep the six W1 research branches as history. Members open PRs for A to review and integrate; A's work also needs peer review.

[Compact Trello board](https://trello.com/b/j4LiifAK) · [Excel Gantt](./team-plan/project-management/six-person-gantt.xlsx) · [Editable critical paths](./team-plan/project-management/critical-paths.drawio) · [Diagram preview](./team-plan/project-management/critical-paths.png)

A has the largest individual scope: baseline/discovery, shared contracts, five-module integration, final acceptance and demonstration organisation. The proposed workload is A 42 hours and B–F 28 hours each. These are estimates pending capacity confirmation. The 4 December planned finish and 5–6 December buffer are internal dates; confirm the university deadline in Moodle. Keep about three useful team photos and one updated board screenshot each week, with real dates and decisions. Trello provides process evidence; the MD/ZIP packages are the implementation handoff.

## Verification and historical work

The extracted Mingle source passed **19 Java tests** and **eight browser-flow groups**, including matching, chat polling, dragging, emulated touch and 390 px layouts. All six local demo accounts were checked. See [validation scope and limitations](./handoff/2026-11-06/VALIDATION.md). A's later discovery increment on w2/a-discovery has 31 passing Java tests and 11 passing browser groups; the named starting ZIPs retain the merged baseline. The Java CI workflow runs the canonical Maven project when its PR changes.

The [W1 research submissions](./docs/research/week1/README.md) and [historical planning](./docs/team-plan/README.md) are retained. Use the current English six-person plan for development. English is the default UI; the temporary Chinese switch remains during development. Real member contributions, meetings and independent reproductions must be evidenced when they occur.
