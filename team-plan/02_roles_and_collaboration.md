# Roles and Collaboration

Current revision: 14 November 2026. Qin Tian is the Scrum Master and Lead Developer. Tao Jiacheng is the Product Owner. Wang Yikai, Zhou Ziyue, Wu Zhuoda and Song Peitong are Developers with the focuses below. The [six-week plan](./16_six_week_evidence_plan.md) defines current remaining responsibilities and evidence.

| Member | Role | Ownership | Initial reviewer |
|---|---|---|---|
| A Qin Tian | Scrum Master and Lead Developer | Core code, shared UI, discovery/activities, architecture, integration and release verification | B, with C/F for account and runtime contracts |
| B Wang Yikai | Developer | Profile interaction, accessible controls and usability checks | C Tao Jiacheng |
| C Tao Jiacheng | Product Owner | Product goal, backlog ordering, acceptance criteria and scope; retained account/data contribution | D Zhou Ziyue |
| D Zhou Ziyue | Developer | Chat, unread/history behavior, delivery/retry reliability and two-account regression | E Wu Zhuoda |
| E Wu Zhuoda | Developer | Safety, restricted report review and cross-module regression coordination | F Song Peitong |
| F Song Peitong | Developer | Backup/restore, startup tools and independent reproduction | A Qin Tian |

## Product, process and technical decisions

- C owns product priorities, clarifies acceptance criteria, records scope decisions and presents product outcomes at Sprint Reviews.
- A facilitates Scrum events, follows up impediments and supports process improvements. A also leads the core implementation, technical integration and release checks.
- Developers estimate and organise their work, maintain their own tests and record actual progress. E coordinates regression evidence; F coordinates reproducibility.
- Product acceptance and technical review are separate records. A integrates changes; C assesses the agreed product outcomes. Neither an assignment nor a merge proves that an independent review took place.

Qin Tian is the primary developer and technical lead. Project selection and initial direction were shared with Tao Jiacheng. A's baseline and current UI work are explicitly AI-assisted; ownership is not a claim of unaided authorship.

## Shared changes

- A coordinates shared configuration, security integration, navigation and application contracts. C clarifies account and product requirements with the relevant developer.
- D owns the chat follow-up in [D's reliability task](./tasks/week3/D_chat_reliability.md). Agree any message identity/schema change with A/C before implementation.
- B coordinates accessibility checks with A's shared UI work. E preserves staff-only report permissions. F's runtime tools must keep existing databases and reject unsafe destinations.
- Each task identifies affected classes, routes and tests. Keep PRs focused and retain other members' changes during integration.

Review rotation: A to B, B to C, C to D, D to E, E to F, F to A. Meeting notes rotate: W1 B, W2 C, W3 D, W4 F, W5 E. C leads product discussion; A facilitates the process; D presents the messaging walkthrough and its reliability evidence.

## Branches and review

Use lowercase task branches named w<week>/<member-letter>-<task>. Start from current main and preserve the W1 research branches. Complete implementation and relevant checks before marking a PR Ready for review. Record actual review separately from automated verification.

| Member | Current or next task branch |
|---|---|
| A | w2/a-reference-polish |
| B | w2/b-interface |
| C | w2/c-accounts; product decisions belong in the current backlog |
| D | w3/d-chat-reliability after the merged w2/d-connections increment |
| E | w2/e-safety; use a fresh task branch for follow-up work |
| F | w2/f-runtime; use a fresh task branch for follow-up work |

The user authorised A's current UI/role revision to merge after verification. This does not manufacture a peer approval or change the team's ordinary review responsibilities.

Proposed effort: A 50 h, C 40 h, D 34 h and B/E/F 28 h each, including development, coordination and evidence. Confirm real capacity; actual hours are not supplied. See [workload](./11_workload_balance.md), [roster](./00_team_roster.md) and [contributions](./15_contribution_and_ownership.md).
