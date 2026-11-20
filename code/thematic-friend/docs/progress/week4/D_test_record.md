# D | Actual test record

Run by Codex on 20 November 2026 (UTC+08:00) on macOS with OpenJDK 21.0.2, Maven 3.10.0, H2 2.4.240, Node 24.20.0 and Chrome 157.0.8103.80. All data was fictional and isolated from the shared preview database. The commands ran on the equivalent working tree before commit `112591c`; the committed source and test content are unchanged.

| Run | Source and command from `code/thematic-friend` | Result |
|---|---|---|
| Focused idempotency tests | Commit `112591c` (equivalent pre-commit working tree) · `sh ./mvnw --batch-mode --no-transfer-progress -Dtest=ChatSendIdempotencyTests test` | 7 tests passed, exit 0. |
| Full build | Same working tree · `JAVA_HOME=.../jdk-21.0.2 sh ./mvnw --batch-mode --no-transfer-progress clean package` | 77 tests passed, 0 failures, 0 errors, exit 0. JAR SHA-256 `6ef4dbf838f683d981e6f4f371974f4daf49f15c0dc1820577ae98359c31407e`. |
| Retry browser flow | `MINGLE_CHECK_SCRIPT=retry-check.mjs node scripts/conversation-browser/run-conversation-check.mjs` | B1-B7 and runtime checks passed, exit 0. See [results](./evidence/D_retry_browser_results.json). |
| Inherited conversation flow | `node scripts/conversation-browser/run-conversation-check.mjs` | All D-01 to D-06 browser checks passed, including 390 px, exit 0. See [results](./evidence/D_conversation_regression_results.json). |
| Schema upgrade and restart | Previous jar created H2; new jar upgraded the same file; service restarted and replayed one identity. | Added `CLIENT_MESSAGE_ID` and `UK_CHAT_MESSAGES_SENDER_CLIENT`. First and replay responses both returned ID `1`; one row existed for the key. See [runtime checks](./evidence/D_runtime_checks.txt). |

## Acceptance mapping

| Test ID | Expected | Actual result | Evidence | Status |
|---|---|---|---|---|
| D-W4-T1 | Both successful receipts identify one stored message and database count increases once. | Sequential service and API replay returned the same ID; count stayed one. | `ChatSendIdempotencyTests`; browser B3 | Pass |
| D-W4-T2 | Persistent uniqueness and replay survive reload/restart. | Eight simultaneous requests returned one ID. Existing H2 gained the column/unique constraint. A process restart replayed the same key and returned the original ID with one row. | Concurrent test; [runtime checks](./evidence/D_runtime_checks.txt) | Pass |
| D-W4-T3 | Changed content is rejected; identities remain scoped to sender and conversation. | Same key plus changed body returned 409 and left one row. Same key from another sender/conversation created separate rows as designed. | `ChatSendIdempotencyTests` | Pass |
| D-W4-T4 | Browser retains the identity/draft and both accounts ultimately show one confirmed retry. | The first response was dropped after server commit. The unchanged draft reused the same UUID; retry resolved to one row. Editing the failed draft generated a different UUID. Recipient unread counts and final rows matched the confirmed sends. | Browser B1-B6 | Pass |
| D-W4-T5 | Authentication, CSRF and conversation membership still deny replay. | Anonymous replay 401, missing CSRF 403, outsider 404; message count stayed one. | `ChatSendIdempotencyTests` | Pass |
| D-W4-T6 | Intentional separate messages remain possible; UI dedupes by message ID; old history/native form remain usable. | Edited retry used a new identity. Native form replay was idempotent. Inherited history, polling overlap, text/emoji/sticker, keyboard, closed state and 390 px checks passed. | Focused and inherited browser results | Pass |
| D-W4-T7 | A later network failure must not overwrite a message already confirmed by polling. | Polling confirmed the row while the original request was held. After the request was aborted, the UI remained confirmed rather than changing to failed. | Browser B7 | Pass |

## Scope notes

- The seven new tests are in `ChatSendIdempotencyTests`; inherited suites were reproduced unchanged.
- The concurrency check covers eight service calls against one in-process application and one H2 database. It is not a high-load or multi-database certification.
- `clientMessageId` is returned only on the sender's `MessageView`. Recipient polling receives `null` for the identity.
- Browser screenshots are automated emulation, not a manual usability session or physical-device test.
