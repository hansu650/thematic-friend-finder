# Prototype and Six-Person Handover

The shared baseline is a Java 21 / Spring Boot website with Thymeleaf and file-based H2. A coordinates structure and integration; B–F take module ownership. The old Django prototype remains a reference.

M0 (8 Nov internal target) is a startable, clickable site. M1 (15 Nov) is a real two-user flow: profile → filter → like → mutual connection → persisted text messages. A third user must not access a conversation by guessing its ID. Ending or blocking stops subsequent reads and sends. Samples are fictional.

The user assigns the existing AI-assisted baseline to A for ownership, explanation and handover. B–F have explicit new increments in [the task map](./10_baseline_and_member_increments.md); these have not been implemented by the assistant. Contribution records must identify assistance and actual work.

| Material | Application location | Owner |
|---|---|---|
| Build, run, configuration | README.md | F, reviewed by A |
| Origin, capabilities and limits | docs/BASELINE.md | A |
| References and licences | docs/THIRD_PARTY.md | A, updated by contributors |
| Modules, routes and fields | docs/CONTRACTS.md | A/C/D |
| Version-specific verification | docs/VERIFICATION.md | Contributors; E/F coordinate |

The website defaults to English and offers a temporary EN/Chinese switch. `TONGPIN_CHINESE_ENABLED=false` disables the Chinese UI for final delivery; removing the Chinese bundle and reference files is a later release step. User-written profile/message content is not automatically translated.

Publish the verified local baseline through `w2/a-baseline` and a PR. After peer review and merge, all six branch from that Java-containing main using the [agreed branch convention](./02_roles_and_collaboration.md). Preserve all W1 research branches. Do not bulk-add the old local directory, caches, databases, IDE settings or credentials. Publishing a branch or opening a PR is not a recorded merge. The [six named packages](../handoff/2026-11-06/README.md) can be used for local development while review is pending.
