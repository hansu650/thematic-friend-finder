# E Wu Zhuoda | Week 4 progress

Role: Developer and Test Coordinator for safety and regression. Task: permission boundaries, confidential reports and defect retests.

Status on 17 November 2026: the local implementation and automated verification are complete. Peer review, product acceptance and remote handover are pending. Personal time spent and personal reflection remain for Wu Zhuoda to record from actual work.

| Item | Record |
|---|---|
| Starting revision | Remote `main` was `90d6b6d9bdee2644f0a9aae3675932df8d46a980`, matching the handoff. |
| Local branch | `w4/e-safety-regression` |
| Tested code revision | `6a2132d45cbb2c1772c4fa48549d1dbb0fd7e488` contains the tested source and test changes. The build preceded the Git commit; the new test file's final line ending was normalized before committing. |
| Evidence | [Permission matrix](./E_permission_matrix.md), [test record](./E_test_record.md), [defect and retest](./E_defects_and_retests.md) |
| Review / tracking | Assigned reviewer F Song Peitong. A integrates and C records product acceptance. The PR and review are pending. [Existing E Trello card](https://trello.com/c/x3d0dlGM) |

## Inherited behavior

[PR #14](https://github.com/hansu650/thematic-friend-finder/pull/14) introduced the restricted queue and detail, resolution metadata and a single allowed transition from pending. Earlier team tests covered role gates with injected principals, report privacy, contact restrictions and history. The inherited tests were run again against the unchanged baseline. The Week 2 record already identified the misleading receipt label.

## Week 4 contribution

The new regression tests log in as fictional members, compare persisted H2 rows after rejected requests and submit two competing resolution requests. They verify the private receipt before and after the real staff action. The integration tests now challenge the discovery and conversation routes from both sides of a closed connection, including history and read acknowledgement. The receipt now states that the report was recorded. The staff detail remains the place to see the internal outcome.

## Demonstration wording

The demonstration uses fictional profiles, messages and reports. Participants can end a connection, block contact and submit a private report. Unblocking leaves an ended connection closed. The reporter sees a receipt, and a locally configured STAFF account can review a report in the prototype. There is no staffed moderation service or end-to-end encryption. Messages and reports are stored in the application database. Use fictional information for the demonstration.

## Reflection and next checkpoint

Evidence to discuss in the personal reflection: checking only the staff detail would miss the stale claim in the member’s receipt. Displaying the terminal status to the reporter would extend the information the receipt communicates. A neutral confirmation addresses the incorrect wording with less change to the member-facing contract. At the 19 November checkpoint, the owner can use the two-session run to demonstrate the difference and ask C whether any fuller reporter status is wanted.

Codex assisted with source inspection, implementation, automated testing, browser captures and these records. The records do not represent an independent peer review or personal observations.
