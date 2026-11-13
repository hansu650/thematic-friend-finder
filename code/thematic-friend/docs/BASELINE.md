# Baseline, Current Capabilities and Contribution Boundaries

On 6 November 2026, the existing prototype became A's starting implementation for the six-person project. **Qin Tian owns the AI-assisted baseline and leads technical integration.** Codex assistance is recorded; ownership does not imply unaided authorship or establish another member's contribution.

## Current integrated capabilities - 13 November 2026

- Registration, login/logout, password hashing, profile editing and current-password-verified password change.
- Interest/activity filtering, shared-interest labels, eligible profile details, like/skip controls and mutual-match feedback.
- Event and people feeds, activity search and creation, participant attendance and personal saved activities in H2.
- Participant-only text, emoji and sticker conversations with polling, recipient-owned unread markers and bounded older-history pages.
- Ending contact, two-direction block checks, private report receipts and explicitly authorized staff review.
- English-default pages with a temporary Chinese switch, responsive reference-based layouts and reduced-motion controls.
- Optional fictional profile/activity fixtures, local stock photographs, a file-based H2 database and stopped-database backup/restore tools.

The current UI and its small polish are described in the [release record](releases/2026-11-13-reference-ui.md). The website is not an Alovoa fork. Asset sources and dependencies are recorded in [THIRD_PARTY.md](THIRD_PARTY.md).

## Ownership and member increments

Qin Tian is **Scrum Master and Lead Developer**, and the project's primary technical contributor. Tao Jiacheng is **Product Owner**. They both participated in topic selection. Other members are Developers; see the [contribution record](../../../team-plan/15_contribution_and_ownership.md).

| Member | Integrated work or current assignment |
|---|---|
| A | Starting implementation, discovery/recovery, shared UI, events, integration and verification |
| B | Assigned profile preview, interest counter and accessibility increment; completion needs actual evidence |
| C | Password change and current-session contract merged in PR #11; product goal, backlog and acceptance ownership |
| D | Unread state and older-message paging merged in PR #10; new reliability follow-up is assigned, not implemented |
| E | Staff-only report review, handling records and permission tests merged in PR #14 |
| F | Backup/restore and runtime tooling merged in PR #13; independent reproduction needs its own record |

Preserve each member's changes, tests and explanations. The [workload estimates](../../../team-plan/11_workload_balance.md) are A 42, B 28, C 28, D 34, E 28 and F 28 hours, not completed-time claims.

## Limits

This remains a single-instance local course prototype. The age checkbox is self-declaration. A staff review route does not constitute a staffed moderation service. There are no profile photo uploads, account recovery, self-service deletion, end-to-end message encryption or production migration procedure. The new logical-send identity and retry guarantee are D's pending follow-up, not a current capability. Automated checks do not imply real-user research, team meetings or independent member reproduction.
