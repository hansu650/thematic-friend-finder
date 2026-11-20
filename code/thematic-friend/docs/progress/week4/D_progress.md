# D Zhou Ziyue | Week 4 progress

Role: Developer for chat reliability. Task: one logical send, safe retry and failure recovery.

Status on 20 November 2026: implementation and local verification are complete. [PR #21](https://github.com/hansu650/thematic-friend-finder/pull/21) is open and ready for review. A/C contract agreement, E's independent review and product acceptance are pending.

| Item | Record |
|---|---|
| Starting revision | `f9de8e1` from `origin/main` |
| Working branch | `w4/d-chat-reliability` |
| Tested source | Commit `112591c` contains the tested source and test changes. The build and browser checks ran on the equivalent working tree before that commit. |
| Tested artifact | `thematic-friend-0.0.1-SNAPSHOT.jar`, SHA-256 `6ef4dbf838f683d981e6f4f371974f4daf49f15c0dc1820577ae98359c31407e` |
| Environment | macOS, OpenJDK 21.0.2, Maven 3.10.0, H2 2.4.240, Node 24.20.0, Chrome 157.0.8103.80 |
| Records | [Send contract](./D_send_contract.md), [test record](./D_test_record.md), [defect and retest](./D_defect_and_retest.md) |
| Review / tracking | [PR #21](https://github.com/hansu650/thematic-friend-finder/pull/21); E review and A/C contract agreement pending; [D Trello card](https://trello.com/c/03lTfNYQ) |

## Inherited behaviour

The starting revision already provided participant-only text, emoji and sticker messages, three-second polling, drafts retained by the existing JavaScript, unread markers and older-history paging. It also required CSRF protection and checked active/blocked connection state on every send. Those behaviours were reused rather than redesigned.

## New work

- Added a nullable persisted `client_message_id` and a database uniqueness constraint scoped to connection, sender and identity.
- Added replay lookup before insertion. Same identity and body return the original row; changed body returns `409` without mutation.
- Added a hidden native-form identity and browser-generated identities that rotate only after a logical send is resolved.
- Added explicit pending and failed message bubbles, draft retention, same-identity retry, and a clear confirmation state.
- Added focused service, API, native-form, concurrent, permission and persistence tests.
- Added an automated browser check that commits a message on the server, drops the response, retries it, and compares both accounts.

## Verification

- Full Maven build: 77 tests, 0 failures, 0 errors, exit 0. See [D_maven_results.txt](./evidence/D_maven_results.txt).
- Retry browser flow: B1, B2, B3, B4, B7, B5, B6 and runtime check all passed. See [retry results](./evidence/D_retry_browser_results.json) and [pending](./images/D_retry_pending.png), [failed](./images/D_retry_failed.png), [confirmed](./images/D_retry_confirmed.png) captures.
- Inherited conversation browser flow: all unread, history, keyboard, 390 px and closed-conversation checks passed. See [regression results](./evidence/D_conversation_regression_results.json).
- Existing H2 schema upgrade added the column and unique constraint. A process restart replayed the same key and returned message ID `1`; the database contained one row for the key. See [runtime checks](./evidence/D_runtime_checks.txt).

## Critical incident and PDP change

During browser review, polling could confirm a committed message while the original fetch later reported a network failure. The first implementation removed the pending row and then allowed that late failure to overwrite the status as failed. The new confirmed-identity set prevents that stale failure from contradicting persisted evidence. The dedicated B7 browser case now waits for polling to confirm before dropping the response and verifies that the confirmed state remains. The learning action is to test asynchronous states in both arrival orders rather than only the happy-path request/response order.

## Remaining work

1. A and C confirm the identity scope, `409` rule and response-field change.
2. E independently reviews duplicate, authorization and retry boundaries.
3. F checks whether the added column affects stopped-database backup/restore documentation.
4. Record the actual review outcome and update the Trello card after review.

Personal time spent and the individual reflection must still be recorded by Zhou Ziyue from actual experience. Codex assisted with source inspection, implementation, tests, browser captures and these records. That assistance is not an independent peer review.
