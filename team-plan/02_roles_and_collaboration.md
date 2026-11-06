# Six-Person Roles and Collaboration

A is the user and team leader. B–F are the other five members. These are proposed responsibilities; each person confirms their name, availability and final commitment.

| Member | Role | Code ownership | Initial reviewer |
|---|---|---|---|
| A Qin Tian | Team Leader, Product Owner and Developer | config/, discovery/, shared contracts and integration | B, with C/F for backend and runtime changes |
| B Wang Yikai | Developer and Usability Lead | live profile preview, interest counter and accessible interaction | C Tao Jiacheng |
| C Tao Jiacheng | Developer and Data Lead | password change, account/session contracts and validation | D Zhou Ziyue |
| D Zhou Ziyue | Developer and Integration Lead for Communication | unread tracking and older-message paging | E Wu Zhuoda |
| E Wu Zhuoda | Scrum Master, Developer and Test Coordinator | staff-only report review and permission tests | F Song Peitong |
| F Song Peitong | Developer and Runtime Lead | backup/restore tools, clean-copy reproduction and handover | A Qin Tian |

A reviews and merges all PRs, with technical review distributed across the team. A owns the existing AI-assisted baseline as well as discovery and integration. B–F implement the new features in [the agreed increment map](./10_baseline_and_member_increments.md). Planned hours are estimates, not contribution records.

Team Leader is a local coordination title. Scrum uses Product Owner, Scrum Master and Developers; coordination time counts towards capacity when roles are combined. See the [Scrum Guide](https://scrumguides.org/scrum-guide.html).

## Shared changes

- A coordinates `pom.xml`, security configuration and shared contracts. C owns account fields; D and E coordinate data changes with C.
- B coordinates common CSS and navigation. Other developers maintain their feature behaviour and avoid formatting entire shared files in unrelated PRs.
- F coordinates runtime scripts and fictional seed data. Seed code must respect password hashing and business rules.
- Each card names affected classes, pages and interfaces before work starts. Split overlapping work into small PRs and integrate early.

Review rotation: A → B, B → C, C → D, D → E, E → F, F → A. Add a relevant specialist when the change crosses boundaries. Meeting notes rotate: W1 B, W2 C, W3 D, W4 F, W5 E. A facilitates product reviews; E facilitates process retrospectives.

Start development branches from the latest `main` after the Java baseline has been merged. Keep the old `w1/a-research` branch; it is not the Java development starting point. Completed, verified PRs become Ready for review. Unfinished work may remain Draft with a clear explanation.

## Branch convention

Continue the W1 example (`w1/a-research` through `w1/f-research`) in later weeks: **`w<week>/<member-letter>-<task>`**, all lowercase. Use a separate branch for a coherent task; submit a PR with the actual test results and evidence. Preserve the W1 research branches and their history.

| Owner | W2 development branch |
|---|---|
| A Qin Tian | `w2/a-discovery` |
| B Wang Yikai | `w2/b-interface` |
| C Tao Jiacheng | `w2/c-accounts` |
| D Zhou Ziyue | `w2/d-connections` |
| E Wu Zhuoda | `w2/e-safety` |
| F Song Peitong | `w2/f-runtime` |

The shared Java baseline uses `w2/a-baseline`. Wait for its peer review and merge before branching new integrated work from `main`; members can use their runnable ZIP in the meantime. Do not overwrite a teammate's branch or force-push shared history. A's own PR also needs peer review.

Keep the branch/PR view, updated Kanban, actual test results and useful discussion photos as dated evidence. Save images beside their Markdown under `images/`; the first-day archive is `photo/2026-11-06/` in the local coursework workspace.

Workload target: A 42 hours; B–F 28 hours each, including coordination and evidence. See [workload balance](./11_workload_balance.md) for the allocation and adjustment rule.

Use the confirmed [team roster](./00_team_roster.md) on every task publication. Follow the [UI map](./12_ui_reference_map.md) and [test/evidence plan](./13_testing_and_weekly_evidence.md).
