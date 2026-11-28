# A's video contribution — sourced working outline

Prepared 28 November 2026 with Codex assistance. This is a technical speaking outline for Qin Tian, not a record that he has already presented it or a completed personal reflection. Use the chosen candidate's actual screens; replace pending conclusions only after the evidence returns.

## Five facts available now

1. **Objective and scope:** Mingle is a browser-based friendship prototype organised around shared interests, mutual choice, conversation and activities. See the [application README](../../code/thematic-friend/README.md) and [scope/acceptance map](../14_final_acceptance_and_assessment.md).
2. **Architecture choice:** Java, Thymeleaf, CSS and JavaScript are kept in one Spring Boot application with local H2 storage. The [dated reference-choice record](../06_source_and_reference_choices.md) distinguishes the earlier prototype and reference research from the AI-assisted Java implementation. Do not call it an Alovoa fork.
3. **A concrete improvement:** a lost message acknowledgement is displayed as unconfirmed, with a native Retry button that reuses the logical send ID. The [28 November recovery checks](../../code/thematic-friend/docs/releases/2026-11-28-a-recovery.md) deliberately controlled the failure and verified one stored row, correct unread state and preserved draft text.
4. **Integration preserves others' work:** the recovery increment retains D's [idempotent sending #21](https://github.com/hansu650/thematic-friend-finder/pull/21) and B's [narrow-screen inbox fix #25](https://github.com/hansu650/thematic-friend-finder/pull/25). A's contribution includes reconciling local and shared source, with Codex assistance; a merge does not establish independent human review.
5. **Reproducible handover:** the candidate tool builds an archived Git revision and records the source commit/tree, JAR/source hashes and actual test policy. Its English launcher protects new/existing data and rejects tampered artifacts. This prepares a consistent input for team acceptance.

## Suggested 60–90 second technical segment

> Mingle is a browser-based prototype for finding friends through shared interests. It combines profiles, discovery, mutual likes, conversations, events and safety controls in one Java application. We chose a single Spring Boot project so that the application and its browser interface could be developed and handed over together.
>
> One improvement concerns uncertain message delivery. If the server stores a message but its response is lost, saying “not sent” is misleading. Mingle now shows “Delivery unconfirmed” and offers a real Retry button. Retry reuses the original message identity. In a controlled automated check, we dropped the response and verified that retry produced one stored message, with the correct unread count.
>
> This integration preserves Zhou Ziyue's idempotency work and Wang Yikai's mobile inbox fix. The implementation and checks were prepared with Codex assistance; individual understanding and peer review are recorded separately.
>
> For handover, the candidate package records the exact source revision and file checksums, starts in English and uses a separate fictional database. It gives everyone a consistent version to evaluate. The final evaluation must also include the team's actual usability, reproduction and material-review findings.

Read this naturally, check the timing and adjust the wording to what Qin Tian can explain. This segment is only one part of the team video; it is not a claim that the full lifecycle, evaluation or all six contributions have been covered.

## Screen and evidence sequence

| Moment | Show | What the narration establishes |
| --- | --- | --- |
| Objective | Candidate homepage and interest-based discovery | The implemented friendship goal; avoid unsupported claims about user demand or reducing loneliness |
| Architecture | [Existing editable design pack](../../code/thematic-friend/docs/design/README.md) and project structure | How the components relate; source choices and limitations |
| Recovery | Actual unconfirmed state, keyboard Retry and confirmed row; cite the controlled test record | Why the failure label and idempotency matter; a deliberately injected failure is not a real production outage |
| Handover | Candidate commit/hash and English startup | Reproducible version/configuration; no passwords or raw database displayed |

Re-record against the selected final candidate if relevant code/data changes. The engineering screenshots already available can illustrate a dated test; they do not prove a later candidate passed.

## Conclusions that remain dependent on people

- B's actual observations and review, C's product judgement, D/E's candidate findings and F's independent reproduction.
- E/C's itemised material evidence and the resulting decisions on what appears in the final video.
- Qin Tian's actual learning, coordination, feelings and PDP baseline. These belong in his individual reflection, supported by the [dated evidence register](./A_2026-11-28.md).
- Final version/freeze, shared MMUTube access and each student's Moodle receipt.

The whole team video must remain within 15 minutes and cover product plus project evaluation. Treat the 86–100% band as the quality target; explain evidence, limits and alternatives rather than inflating the number of PRs or tests.
