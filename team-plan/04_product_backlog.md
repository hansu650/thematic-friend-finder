# Product Backlog

Product goal: help people find friends through interests and activities, connect by mutual choice and control future contact. Acceptance conditions below are a baseline; implementation status belongs to the Java version, PR and verification record.

| ID | User story | Priority | Minimum acceptance | Owner |
|---|---|---|---|---|
| US01 | Register, sign in and edit my profile so people can understand me | Must | Hashed passwords; validation; own-profile edits only; login/logout | C |
| US02 | Filter and understand suggestions so I can choose suitable people | Must | Visible conditions; real common interests; exclude self/hidden/blocked; recover from empty results | A |
| US03 | Connect only after mutual likes so I retain choice | Must | No one-sided chat; one pair per match; duplicate requests do not duplicate it | D, with A for the card |
| US04 | Send messages to a connection so we can continue talking | Must | Persisted data; participant-only access; reject blank/oversized input; escape text | D |
| US05 | End, block and report unwanted contact | Must | No chat after closure; private report receipts; explicit roles for any future triage | E |
| US06 | Use the main flow on my phone | Must | Desktop and 390 px layout; accessible buttons and forms; English default | B |
| US07 | Build and start the shared version from its instructions | Must | Maven test/package; JAR startup; file persistence and restart evidence | F |
| US08 | Understand and recover from failure | Should | Choose filter, sending or retry improvements from observed feedback | A/D/B |
| US09 | Record how a report was handled | Should | Status, actor, time and internal notes restricted to authorised staff | E |

Sprint 1 targets the minimum US01–US07 flow. Sprint 2 selects the needed parts of US08/09 from actual feedback. The baseline already implements portions of these stories; individual work must identify a real increment.

Supporting work: six research notes, capacity confirmation, ethics/legal research for the intended context, task observation, retesting, handover, one team video and six personal reflections. Local fictional-account tests do not substitute for user research.

Deferred: payments, precise location, complex machine learning, a native app, large-scale hosting and profile photos. Account recovery and self-service deletion remain future candidates. The temporary Chinese interface is for development comparison; the final submission is intended to be English.

| Date | Change | Source | Effect |
|---|---|---|---|
| 6 Nov 2026 | Six members, Spring Boot website, greater A workload | User decision | Reassign modules and verify the Java baseline |
| 6 Nov 2026 | English artifacts and English default UI; temporary bilingual switch | User decision | Translate the working pack and verify both locales |

## New increments assigned after the baseline

The user assigned the implemented AI-assisted baseline to A on 6 November. US01–US07 describe baseline acceptance; B–F now own the following unimplemented increments.

| ID | Increment | Owner | Acceptance focus |
|---|---|---|---|
| US10 | Live profile preview and interest counter | B | Unsaved preview, five-interest feedback, safe DOM text, keyboard/mobile behaviour |
| US11 | Change password | C | Current-password check, valid confirmed password, explicit session policy, persisted result |
| US12 | Unread state and older-message history | D | Per-participant state, bounded pages, ordering, no duplicate messages, existing permissions |
| US13 | Restricted report review | E | Staff-only queue/actions, private notes, handler/time, negative access tests |
| US14 | Backup/restore and independent reproduction | F | Validated paths, stopped database, no silent overwrite, disposable restore evidence |

These are the selected Sprint 1 member increments, subject to capacity confirmation. US13 is the scoped local implementation of the earlier US09 candidate. A owns discovery refinement, contracts and integration; the assistant will not implement B–F's reserved work.
