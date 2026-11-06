# Baseline Ownership and New Member Increments

Decision confirmed by the user on 6 November 2026: **keep the implemented prototype as A's starting version, and give B–F distinct work that remains to be implemented**. A owns and explains the AI-assisted baseline, discovery refinement, integration and PR review. AI assistance must remain explicit in contribution evidence.

| Member | Scrum accountability | Development or collaboration focus | New deliverable |
|---|---|---|---|
| A Qin Tian | Product Owner + Developer | Baseline Ownership, Discovery and Integration | [Individual task](./tasks/week2/A_discovery.md) |
| B Wang Yikai | Developer | Live Profile Preview and Accessible Interaction | [Individual task](./tasks/week2/B_interface.md) |
| C Tao Jiacheng | Developer | Password Change and Account Data Contracts | [Individual task](./tasks/week2/C_accounts.md) |
| D Zhou Ziyue | Developer | Unread Indicators and Conversation History | [Individual task](./tasks/week2/D_connections.md) |
| E Wu Zhuoda | Scrum Master + Developer | Restricted Report Review and Permission Tests | [Individual task](./tasks/week2/E_safety.md) |
| F Song Peitong | Developer | Backup, Restore and Independent Reproduction | [Individual task](./tasks/week2/F_runtime.md) |

Scrum has three accountabilities: Product Owner, Scrum Master and Developers. UI, data, communication, testing and runtime leads are practical team responsibilities layered on top, not five additional Scrum roles. Coordination time counts towards capacity. A leads the product review; E facilitates process retrospectives; all six contribute development and verification.

## Existing A-owned baseline

Registration/login, editable profiles, discovery filters, real shared interests, swipe/button decisions, mutual connections, basic persisted chat and polling, end/block/report receipts, English-first interface with temporary Chinese switching, demo seed data and build/run scripts. These are existing starting capabilities, not new tasks to assign repeatedly.

## Explicitly reserved for B–F

Live editing preview and interest counter (B); password changes and account/session contracts (C); unread markers and older-message paging (D); restricted staff report review (E); backup/restore tools and independent clean-copy reproduction (F). The assistant has not implemented these increments.

The Gantt packages T03–T08 now refer to these increments. T07 depends on the agreed account/read-state and discovery contracts; T08 depends on the account/role contract. Final integration waits for all module acceptance results. The 29-day network estimate is retained because the initial duration estimates are unchanged; members must confirm their capacity before committing.

Workload target: A 42 hours; B–F 28 hours each, including coordination and evidence. See [workload balance](./11_workload_balance.md) for the allocation and adjustment rule.

Use the confirmed [team roster](./00_team_roster.md) on every task publication. Follow the [UI map](./12_ui_reference_map.md) and [test/evidence plan](./13_testing_and_weekly_evidence.md).
