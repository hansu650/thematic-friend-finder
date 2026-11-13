# Five-Week Spring Boot Web Plan

## Product and scope

Mingle helps people find friends through shared interests and activities, chat after mutual likes and control further contact through ending, blocking and reporting. It is a responsive website, not a native mobile application. Profiles use initial-based avatars; personal photos remain out of scope.

On 6 November 2026 the team changed to six people and selected a single Spring Boot web project. The user created the engineering starting point in IntelliJ IDEA at `code/thematic-friend/`. The older Django prototype remains a reference; its tests do not verify the Java implementation. The Java business code is an AI-assisted implementation, not a copy or fork of Alovoa.

## Milestones

| Milestone | Internal target | Observable result |
|---|---|---|
| M0 | 8 Nov | Startable website with navigable home, account, profile, discovery, conversation and safety pages |
| M1 | 15 Nov | Two fictional users can save profiles, filter, mutually like and exchange persisted messages |
| Integration | 18 Nov | Modules pass the shared core flow and permission regression |
| Sprint 1 review | 22 Nov | Demonstrated increment, observed issues and ordered follow-up work |
| Feature freeze | 26 Nov | Selected feedback fixes complete; optional expansion stops |
| Reproduction | 29 Nov | Another member can build and run the documented version |
| Draft handover | 4 Dec | Team demonstration draft, six individual reflection drafts and handover checks |
| Buffer | 5–6 Dec | Corrections and submission preparation |

The schedule is a baseline estimate. The implemented prototype is assigned to A as an AI-assisted baseline. B adds live preview/accessibility; C password change and data contracts; D unread indicators/history; E restricted report review; F backup/restore and independent reproduction. See [the agreed increment map](./10_baseline_and_member_increments.md).

## Scrum and evidence

Use one preparation week, followed by Sprint 1 (9–22 Nov) and Sprint 2 (23 Nov–6 Dec). In Sprint Planning, agree one goal, the selected stories and realistic capacity. Use a brief daily update when working: what changed, what is next and what is blocked. At the Sprint Review, demonstrate software and discuss product feedback. At the Retrospective, discuss how the team worked and select a process improvement.

From 13 November, C is Product Owner and orders the Product Backlog. A is Scrum Master and Lead Developer, leading core implementation and integration, facilitating Sprint events and following up impediments. E coordinates regression checks and defect evidence. All six develop, test and record their own contributions. B coordinates usability observation, C maintains field contracts, D coordinates communication integration and F checks reproducible startup.

Every week retain real PRs, test outcomes, decisions, obstacles and follow-up actions. The current assessment allocates 25% to the team demonstration and 75% to individual reflection; the video limit is 15 minutes. See [course sources](./05_course_sources.md). Product functionality alone cannot replace personal reflective evidence.

## Completion standard

A change is Done when its agreed acceptance conditions pass, relevant tests and actual operation evidence exist, review comments are handled, the change is merged or the artifact delivered, and its documentation identifies remaining limits and sources. Each person must be able to explain their contribution. The university submission date still needs checking against the current official course system.
