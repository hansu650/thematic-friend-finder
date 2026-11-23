# C | Demonstration draft for requirements and product evaluation

**Suggested length:** 75–90 seconds within the team's demonstration. Use the final agreed revision and fictional accounts. Update the wording after release and review results are recorded.

> The project brief asks us to help people make new social contacts. We chose an interest-based discovery flow. Show the shared interests on a candidate card, then use two accounts to demonstrate that a single like does not open a conversation. After the second account likes back, both people reach the same conversation. Mutual choice gives each person control before messaging starts.
>
> We mapped those goals to acceptance checks for the account, matching, chat and safety routes. Show a profile draft, save it, and reopen it. Show the password change in one of two sessions. The submitting session signs out, the other session stays signed in, and new sign-ins require the replacement password. Show an English validation message and a saved profile containing the user's own text.
>
> We kept release priorities on clear state and user control. D's retry support prevents one logical send from creating duplicate messages. E's receipt confirms that a report was recorded while staff-only details stay private. The recovery runbook shows how to verify saved records after a stopped-database restore. The acceptance record names the tested release and the checks it supports. Add the actual observed-user finding, resulting change and retest if the team completes that cycle before recording.

| Screen cue | Evidence to cite | Teammate |
|---|---|---|
| Shared interests, two likes, same conversation | REQ-MATCH-01 and C-W4-T2 | A / D |
| Save and reload profile, wrong and valid password change | REQ-PROFILE-01, REQ-ACCOUNT-02 and C-W4-T1/T3 | B / C |
| Failed send and retry, private receipt and staff view | REQ-RETRY-01, REQ-SAFETY-01 and C-W4-T6 | D / E |
| Recorded source, JAR and recovery instructions | REQ-RECOVERY-01 | F / A |

[Acceptance matrix](C_acceptance_matrix.md) · [Decisions](C_scope_decisions.md) · [Course demonstration mapping](../../../../../team-plan/16_six_week_evidence_plan.md#what-the-assessment-actually-requires)
