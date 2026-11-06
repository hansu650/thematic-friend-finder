# Mingle Development Handoff

Prepared for the six-person team on 6 November 2026. **Use the named MD/ZIP packages to do the work.** Each ZIP includes the same clean Spring Boot baseline, its owner's task, six test scenarios, screenshots/photo requirements and the relevant supplied UI references. Fully extract the ZIP and begin with START_HERE.md.

**A's worked submission example is available:** [read the example](./A_Qin_Tian_Example/README.md), [what B–F submit next](./A_Qin_Tian_Example/WHAT_TO_SUBMIT.md), and [actual screenshots/tests](./A_Qin_Tian_Example/EVIDENCE_INDEX.md). A's discovery increment is on **w2/a-discovery**, pending independent peer review and merge. The original named ZIPs below remain baseline snapshots.

| Owner | Assignment | Task MD | Individual ZIP | Reference images |
|---|---|---|---|---|
| A Qin Tian | Discovery Cards, Match Feedback and Integration | [Open task](./A_Qin_Tian/A_Qin_Tian_TASK.md) | [Download package](./A_Qin_Tian.zip) | 3, 4, 5 |
| B Wang Yikai | Live Profile Preview and Accessible UI | [Open task](./B_Wang_Yikai/B_Wang_Yikai_TASK.md) | [Download package](./B_Wang_Yikai.zip) | 4, 7, 9 |
| C Tao Jiacheng | Password Change and Account Contracts | [Open task](./C_Tao_Jiacheng/C_Tao_Jiacheng_TASK.md) | [Download package](./C_Tao_Jiacheng.zip) | 4, 9 |
| D Zhou Ziyue | Unread Messages and Older Chat History | [Open task](./D_Zhou_Ziyue/D_Zhou_Ziyue_TASK.md) | [Download package](./D_Zhou_Ziyue.zip) | 1, 2, 7, 8 |
| E Wu Zhuoda | Restricted Report Review and Permission Tests | [Open task](./E_Wu_Zhuoda/E_Wu_Zhuoda_TASK.md) | [Download package](./E_Wu_Zhuoda.zip) | 2, 7 |
| F Song Peitong | Backup, Restore and Clean-Copy Reproduction | [Open task](./F_Song_Peitong/F_Song_Peitong_TASK.md) | [Download package](./F_Song_Peitong.zip) | 2, 4, 8 |

All packages contain source, not a preinstalled Java/Maven runtime. Use JDK 21; the first Maven build needs network access. No Node.js frontend build is required. Follow the included RUN.md. B–F's new increments remain for them to implement.

Each member delivers code, executable tests, normal/boundary/test-result screenshots and a progress MD. The team keeps about three useful discussion/work/review photos per week and one full-board screenshot after updating actual progress. Detailed instructions are included in every EVIDENCE.md.

[Trello](https://trello.com/b/j4LiifAK) is compact: five columns, six member cards and one weekly review card. [Gantt workbook](./project-management/six-person-gantt.xlsx) · [Editable critical paths](./project-management/critical-paths.drawio) · [Diagram preview](./project-management/critical-paths.png).

[Handoff validation](./VALIDATION.md). The Java baseline was merged through [PR #8](https://github.com/hansu650/thematic-friend-finder/pull/8). Create each W2 task branch from current **main** in the [GitHub repository](https://github.com/hansu650/thematic-friend-finder). The baseline merge does not establish that independent peer review occurred.
