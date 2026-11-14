# Mingle Six Week Delivery and Evidence Plan

Updated 14 November 2026. This is the current plan for finishing Mingle and preparing the assessment evidence. It follows five teaching weeks of group work and a sixth week of reflective writing. The target is the assessment's highest band, 86–100%; the quality of the submitted work and reflection determines the mark.

## Dates and scope

The Moodle screenshot supplied by Qin Tian shows **Friday 18 December 2026 at 13:00** for the Thematic Project report. The screenshot does not show a timezone. Preserve the displayed time and check it in the same Moodle account before submission. The old dates in the assessment PDF are superseded by this current course-system evidence.

Use **26 October–6 December** as the six-week teaching calendar, based on the dated Week 1 note and Week 2 teaching schedule. The first Monday is a planning anchor inferred from those records, rather than a newly obtained official timetable. Set **4 December** as the internal completion target. The remaining time is for checking, upload and contingency, rather than another development sprint.

| Teaching week | Dates in 2026 | Work and evidence |
|---|---|---|
| 1 | 26 Oct–1 Nov | Topic preferences, project allocation, research and initial objectives. Locate genuine existing records; leave unsupported details unclaimed. |
| 2 | 2–8 Nov | Scope and role decisions, Java baseline, member packages and initial implementation. Retain the original dated records and photos. |
| 3 | 9–15 Nov | Member increments and integrated UI. Record actual PRs, checks, unresolved work and role changes. |
| 4 | 16–22 Nov | Sync current main, complete integration acceptance, review D's reliability work, conduct observed tasks and choose fixes. |
| 5 | 23–29 Nov | Fix selected findings, freeze scope by 26 Nov, verify deployment or reproducible local delivery, and complete handover. |
| 6 | 30 Nov–6 Dec | Reflective writing, evidence review, final evaluation and demonstration. Aim to finish by 4 Dec; use 5–6 Dec for corrections. |

The earlier files labelled W1–W5 cover a **five-week delivery window beginning in November**. Their original filenames and branch names remain unchanged as historical identifiers. They are not the same numbering as the six teaching weeks. The existing Sprint 1 window, 9–22 November, can be retained. The 23 November–6 December delivery window includes a feature freeze followed by handover and reflection; do not invent Scrum events that did not occur.

## What the assessment actually requires

| Requirement | Source | Delivery check |
|---|---|---|
| Interpret the brief, plan using a project-management method, produce an MVP, and critically reflect on methodology and teamwork | Assessment p. 1, LO1–LO3 | Connect requirements, decisions, implementation and evaluation with evidence. |
| One group demonstration, worth 25%, no longer than 15 minutes | Assessment pp. 4–5 | Upload once to MMUTube; every member puts the same accessible URL in their reflection. |
| Requirements, design, working product, responsibilities and continuation/handover | Assessment p. 5 | Explain the lifecycle and show the product in use, including who did what. |
| Individual reflection, worth 75%, using the supplied template | Assessment pp. 5–6 and template | Complete all five sections, personal details and demonstration URL. |
| DOCX or PDF uploaded to Moodle with the required surname, initials and MMU-ID filename | Assessment pp. 1 and 6 | Open the final file, upload, download/check it and retain the receipt. |
| Backup and accessible submitted work | Assessment p. 2 | Keep a final source/evidence copy and verify the video/file after upload. |
| Detailed lifecycle and insightful evaluation for the highest demonstration band | Assessment pp. 7–8 | Explain outcomes against objectives, strengths, limits, changes and their effects. |
| Thorough professional-development actions and significant contribution with critical teamwork reflection | Assessment p. 9 | Use specific personal incidents, evidence, different perspectives and measurable next actions. |

Trello, XLSX, Draw.io, GitHub screenshots and team photos are **supporting evidence choices**. The supplied assessment does not prescribe those tools, a photograph quota, a commit count, a database size, a public deployment, or a separate mark for video production quality. The supplied specification and reflection template do not state a word limit; check any additional Moodle guidance before final writing.

## Verified position on 14 November

- GitHub main is `7764f0eb3ecd3465f264fdf80b0fe92e13aaa751`, including B's [PR #16](https://github.com/hansu650/thematic-friend-finder/pull/16). [CI run 43396274700](https://github.com/hansu650/thematic-friend-finder/actions/runs/43396274700) succeeded for that commit.
- A's [PR #15](https://github.com/hansu650/thematic-friend-finder/pull/15) is merged. The retained 13 November release report records 66 Java tests, seven reference-browser groups and ten conversation groups. Those are the checks for that recorded revision, not a new test count for PR #16.
- C's password change, D's unread/history, E's restricted report review and F's backup/restore tooling are merged. D's additional delivery/retry task remains assigned work, without completion evidence located in this audit.
- The local `code/thematic-friend` now includes PR #16's live preview. Synchronization checked 224 tracked inputs and retained replaced-file backups. Codex then passed 66 Java tests, 40 browser groups, four real-H2 recovery groups and six backup-tool groups. One duplicate Maven invocation was skipped. The [14 November record](../code/thematic-friend/docs/releases/2026-11-14-main-verification.md) preserves the first failures, fixes, successful retests and open acceptance work.
- The retained content library contains 18 activity covers and 28 fictional profiles with portrait photos. Their existence is not evidence of real users, real events or user research.
- The historical XLSX has Gantt, effort, critical-path and testing/evidence sheets. The newer optional workbook also provides blank meeting, test and PDP templates. Neither establishes a completed discussion. The local kickoff file is explicitly an agenda, not meeting minutes.
- The supplied reflection copy is still the blank template. A completed personal PDP, real observed-user results and independent teammate reproduction have not been located in the inspected current records.
- PR #15 has no submitted GitHub reviews at this check. A merge and successful CI do not establish B's independent review. A later review can be recorded with its real date.
- Trello retains seven member/team cards and now includes six weekly indexes. W1/W2 are in Review for historical-source checking, W3 and A are in Doing, and W4–W6 remain planned in To do. A's completed source-sync item is checked; 29 acceptance/evidence items remain open. See the [verified board record](./03_trello_kanban.md).
- The [ten-page design pack](../code/thematic-friend/docs/design/README.md) and [six-week XLSX Gantt](project-management/six-week-gantt.xlsx) explain the current implementation/calendar. They were prepared on 14 November and do not establish earlier design meetings or actual daily effort.

Use [Trello](https://trello.com/b/j4LiifAK/mingle-team-kanban) for daily work and GitHub for implementation evidence. The [workbook](project-management/scrum-and-evidence.xlsx) is retained as an optional template; its blank records are not completed evidence.

## Current responsibility plan

Qin Tian is Scrum Master, Lead Developer and technical lead. Tao Jiacheng is Product Owner. The proposed whole-project effort estimates below replace the previous 188-hour estimate for current planning; they are not hours already worked. They retain substantial responsibilities for every member.

| Member | Proposed total | Remaining responsibility and observable deliverable |
|---|---:|---|
| A Qin Tian | 50 h | Sync and integrate the final source, resolve shared UI defects, coordinate acceptance, facilitate real review/retrospective sessions, assemble the release and demonstration, and explain the major technical decisions. B reviews A's relevant work. |
| C Tao Jiacheng | 40 h | Maintain product priorities and acceptance criteria; lead brief-to-feature traceability, analyse observed feedback, agree final acceptance, document scope tradeoffs, and present requirements/product evaluation. Retain the actual password/account contribution. |
| D Zhou Ziyue | 34 h | Complete or precisely limit retry/delivery behavior; verify duplicate handling, two-account unread state and long history; support integration diagnosis and demonstrate messaging with actual logs. |
| B Wang Yikai | 28 h | Retest the merged live preview and interest accessibility; organise consented usability observation, keyboard/mobile checks and A's independent review. Record findings and outcomes. |
| E Wu Zhuoda | 28 h | Verify ordinary/staff/anonymous permissions and report confidentiality; maintain defects and retests; prepare the ethics, privacy and moderation evaluation with C. |
| F Song Peitong | 28 h | Reproduce the release on a separate clean setup; perform a real stopped-H2 backup/restore exercise; prepare persistent deployment or local handover and recovery instructions. |

Total: **208 planned hours**. A gains eight estimated hours for final integration, evidence synthesis and release/rehearsal work. C gains twelve for requirements, acceptance, feedback and product evaluation. D retains the already assigned six-hour extension. These adjustments put A first, C second and D third in planned responsibility. They do not establish a ranking of actual contribution or determine individual marks.

The prior capacity figures were provisional, including only 32 h for C and D. The new plan therefore needs real availability confirmation, especially C's 40 h and D's 34 h. Leave actual availability and actual effort blank until confirmed; reduce optional work if capacity is insufficient. All members retain their own reflection and evidence of what they personally did.

## Evidence that deserves priority

| Priority | Evidence | What makes it useful | Owner |
|---|---|---|---|
| 1 | One acceptance record on the final integrated commit | Requirement, scenario, expected/actual result, tester, date, environment, revision and raw log. Include both normal and meaningful rejection/recovery cases. | A and E with module owners |
| 1 | Actual meeting and decision records | Alternatives considered, different views, selected option and reason, owner/due date, and later outcome. Add consented photos as context. | A facilitates; rotate the recorder |
| 1 | Independent review and reproduction | The named person actually reads or runs the stated scope and records a finding/result. Keep a real date and link. | B and F |
| 1 | Real task observation and an improvement cycle | A volunteer attempts a task without coaching; record completion, confusion and remarks accurately. Choose a fix, then retest. | B coordinates; C prioritises |
| 1 | Personal PDP and critical incidents | Baseline ability, what changed, evidence, limitation and a measurable next action. Each member writes their own experience. | All, individually |
| 2 | Requirements and design rationale | Brief-to-feature map, source comparison and reasons for mutual choice, interests, safety and activities. Distinguish inspiration from original design decisions. | C with A |
| 2 | GitHub and CI evidence | A few readable PR/diff/check screenshots plus permanent URLs and exact commit/run IDs. Include meaningful review comments when they exist. | Each member |
| 2 | Final dataset and operational evidence | Scenario inventory, persistence after restart, real-H2 restore, deployment/local startup and limitations. | F with D/E |
| 2 | Ethics, legal research and sustainability | Record the sources actually consulted and resulting design/data decisions. Address fictional profiles, photo sources, privacy, contact control, moderation limitations, accessibility and resource use. | E/C; A verifies implementation |
| 3 | Short final demonstration and submission checks | A timed rehearsal, clear lifecycle explanation, working flow, evaluation, handover and accessible MMUTube URL. | A coordinates; all supply their part |

Volunteer counts and image counts are planning choices. A small set of well-observed tasks is more useful than unsupported statistics. Do not describe a few convenience participants as a representative study.

## How the evidence fits together

Use stable identifiers such as `REQ-CHAT-01`, `TASK-D-01`, `TEST-CHAT-02`, `DEF-01` and `DEC-01`. A useful chain is a requirement, a Trello task, a commit/PR, a test or observed finding, a decision/fix, and a retest. Retain only identifiers actually used; a blank template is not evidence.

Trello is the current work tracker. Link PRs, CI and versioned logs from each card; keep fuller meeting, test/observation and PDP records in Markdown or the supplied reflection template. The optional workbook retains planning and record templates for anyone who finds them useful. Avoid maintaining contradictory copies of detailed results.

For a test, retain the command, complete log, exit code, timestamp, version and environment. A screenshot makes the result readable but does not replace the log. A local `127.0.0.1` URL works only on the running computer. Give reviewers repository links to non-secret logs/reports and a GitHub Actions run URL. At capture time, Computer Use can show the real terminal and two independent browser sessions; executable tests can run through the normal project commands first.

Keep A's original image archive at `photo/A_progress.md`. New report Markdown uses an `images` folder beside the Markdown file and relative image paths. Preserve original photos and captions with dates, activity, participants/tester and evidence ID. Publish only suitable material after checking private screen content and participant permission.

## Final product work

1. **Version alignment:** sync the newest main without overwriting uncommitted local work, record the chosen revision and run relevant integrated checks. Do this before new evidence capture.
2. **Small fixes:** focus on observed usability problems, mobile/keyboard behavior, chat failure/retry states and the final English-only setting. Avoid another broad visual redesign.
3. **Useful data:** keep the existing 28 profiles and 18 activity covers. Add deterministic fictional scenarios only where testing needs them: unmatched/one-sided/matched, unread and read messages, history beyond 100, ended/blocked contact, report roles/statuses, empty filters and activity membership states. Record the actual counts after seeding. Protect the existing demo database.
4. **Data persistence:** the app already uses file-based H2. More scenarios do not require another database engine. For hosting, decide explicitly between a single instance with persistent storage and a tested external-database migration. Verify restart, restore and data retention for the chosen approach.
5. **Delivery:** prepare configuration, startup, credentials handling, health/access checks, logs and rollback. Public hosting is useful if it improves access; the brief does not require it. Record actual costs and limits when a provider is selected. Keep a reproducible local fallback for the demonstration.
6. **Freeze:** stop optional features by 26 November. Complete independent reproduction and the final version/evidence inventory by 29 November.

## Demonstration and reflection

Aim for a **13–14 minute** rehearsal, leaving margin under the 15-minute maximum. A practical allocation is: problem and requirements 1:30; design and planning 2:00; working product 5:00; tests, observed feedback and improvements 2:00; project/team evaluation 1:30; continuation and limitations 1:00. This totals 13 minutes. Speaking time does not determine contribution or marks.

A should explain the technical architecture, integration and key problem solving; C should explain requirements, priorities and product acceptance; D should demonstrate two-account chat and reliability. B, E and F supply their usability, safety and operational evidence. The assessment allows one or several presenters, so use whichever delivery is clearest.

The [A reflection blueprint](./18_A_reflection_blueprint.md) maps the template to real candidate incidents and missing personal input. It is an outline, not a fabricated completed reflection. The strongest writing explains what happened, why the decision was made, its effect, an alternative and a specific next action. “I did the most” is not a substitute for that analysis.

## Next working session

Conduct the [capture and discussion session](./17_photo_and_capture_session.md). Complete actual meeting fields while the work happens. A/C agree the final backlog and scope, D/B run the dual-account and usability tasks, E records defects and safety results, and F demonstrates reproduction/recovery. Review the evidence before participants leave.

## Source register

- Assessment Specification, unit 6G5Z0046_2627_9FHU, pp. 1–9: original PDF in the coursework root.
- Official reflection template: original DOCX in the coursework root; five sections and PDP prompts checked.
- Week 2 lecture, p. 4: weeks 1–5 Group Work and week 6 Reflective Writing.
- Week 1 local note `w1/10-26.md`: date anchor for the proposed six-week calendar.
- Project List, topic 2: Friend Finding App and its ethical/legal investigation requirement.
- [Moodle deadline screenshot](./images/moodle-deadline-20261114.png): supplied by Qin Tian on 14 November; date/time retained as displayed.
- [Release report](../code/thematic-friend/docs/releases/2026-11-13-reference-ui.md), [contribution map](./15_contribution_and_ownership.md), [repository](https://github.com/hansu650/thematic-friend-finder) and linked PR/CI records.

Evidence practices, proposed effort, internal dates, observation tasks and the rehearsal allocation are planning recommendations. Attendance, participant feedback, actual hours, sign-off and independent review remain unfilled until they happen.
