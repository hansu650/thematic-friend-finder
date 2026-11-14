# Mingle Discussion and Capture Session

Prepared 14 November 2026. Use one real working session to collect several useful kinds of evidence efficiently. The proposed duration is about two hours. Confirm the actual date, place and participants when arranging it.

## Before the session

- A prepares the latest integrated version, two separate browser profiles/accounts, the Trello board, Markdown record templates and an isolated fictional test dataset.
- C brings the requirements and acceptance checklist. D prepares the chat scenarios. B prepares the observation tasks. E opens the defect/test record. F prepares a clean reproduction and safe backup/restore target.
- Ask attendees and volunteers whether they agree to photos and to the intended coursework use. Leave anyone out of the image if they do not agree.
- Hide passwords, private conversations and unrelated tabs. Retain clear screen captures separately from photographs of people working.
- Choose a recorder and a photographer. Confirm attendees from the actual session, not the planned roster.

## Agenda and useful shots

| Minutes | Actual activity | Useful photo or screen capture | Record to complete |
|---|---|---|---|
| 0–20 | Review current requirements, priorities and remaining capacity | One wide photo of the discussion and one clear board capture after actual updates | Attendance, options, scope decision, reason and next owners |
| 20–50 | Run two-account chat, unread/history, retry and permission scenarios | One photo of the two testers; direct screenshots or a short continuous capture showing sending and receiving | Version, commands, expected/actual results, defect and retest links |
| 50–80 | Let volunteers attempt discovery, matching/chat and a safety task without coaching | A consented photo of observation, plus relevant product result captures | Anonymous participant code, task, outcome, difficulty and remarks |
| 80–105 | Review findings and agree the fixes or documented limits | A photo of the team comparing results; one clear decision/defect-board screenshot | Alternatives, selected priority, reason, owner and due date |
| 105–120 | Rehearse a short explanation of the lifecycle and handover | One rehearsal photo if useful | Timing, unclear parts and the next action |

About **four to six distinct photographs** can cover this session if those activities happen. This is not a quota. Preserve one best clear image per useful moment. A photograph of a screen alone usually adds less than a direct screen capture.

## What can be collected together

The same real session can document planning, integration testing, feedback discussion and rehearsal. Label every image with its real date and activity. The session can also review earlier work, but the record should say “retrospective review held on [actual date]” and cite the earlier evidence.

Earlier PRs, commits, logs and original photos can still support earlier work. New photos do not establish that a meeting happened in a previous week. Keep final-release, actual deployment and submission-receipt captures for when those results exist.

## Technical captures

| Capture | What must be visible | Keep alongside it |
|---|---|---|
| PR and diff | Correct PR, author, relevant change and actual merged/review state | Permanent PR URL and commit SHA |
| GitHub Actions | Correct run, revision and completed conclusion | Run URL and relevant log |
| Local tests | Command/run identifier, readable result and exit status | Full text log, environment and tested revision |
| Two-account chat | Separate accounts, an identifiable fictional message and receiving state | Test ID, session setup, persistence/reload result |
| Boundary or defect | The actual input/state and response | Expected vs actual, defect ID and later retest |
| Trello | Real owners and current states after an actual update | Meeting/decision link and remaining actions |
| Recovery/handover | Known fixture records after the real restore/restart | Backup hash, safe destination and verified records |

Computer Use can operate the actual windows and capture these states when the final version is ready. Do not treat a polished animation, a recreated terminal, or an old passing image as a new test run.

## Captions and file handling

Use names such as `2026-11-16_MTG-01_chat-test_01.jpg` only if that is the actual date. A caption should identify date/time, activity ID, participants or tester, what is shown and the resulting decision or evidence link. Keep original files and record any cropped copy separately.

Add the actual images to the existing category archive and link them from the relevant record. For report Markdown, put its image copies in a neighbouring `images` folder and use relative paths. A's full archive remains `photo/A_progress.md`; this session does not replace earlier evidence.

## After the session

The recorder completes the [meeting template](./meetings/session_record_template.md). Participants check the factual attendance and decisions. C updates priorities, owners update Trello, E links defects/retests, and A checks that every selected image has a purpose and an accurate caption. Unfinished tests and unresolved issues stay open.
