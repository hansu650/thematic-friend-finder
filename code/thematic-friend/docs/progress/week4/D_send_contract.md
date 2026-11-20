# D: Logical-send contract

Owner: **D Zhou Ziyue**. Reviewer: **E Wu Zhuoda**. Shared-contract owners: **A Qin Tian** and **C Tao Jiacheng**.

Status on 20 November 2026: **implemented and locally verified; A/C agreement and E's independent review remain pending.** This file records the implementation proposal; it is not a claim that the team has accepted it.

## Identity and scope

- The browser generates a `clientMessageId` with `crypto.randomUUID()` and sends it with the message body. The native form receives a server-generated UUID in a hidden field; after a successful page reload the next form receives a new value.
- The identity is scoped to `(connectionId, authenticated senderId, clientMessageId)`. Submitting the same value from another conversation or another authenticated sender creates that actor's own logical send.
- The actor is always derived from the authenticated session, never from the submitted identity. Every retry repeats the existing connection, active-state and block checks.
- The database stores at most 64 characters in `client_message_id`. Existing rows may have `NULL`; the unique constraint is `(connection_id, sender_id, client_message_id)`.

## Replay rules

| Request | Result |
|---|---|
| Same identity, same normalised body | Return the existing stored message after current authorization. No second row or unread increment is created. |
| Same identity, different normalised body | Return `409 Conflict` with `ui.this_send_was_already_used_for_a_different_message`; do not mutate the stored row. |
| Same identity sent concurrently | The pair lock serialises the send and the database unique constraint provides persistent protection. All successful receipts identify the same stored message. |
| Missing identity | Generate a new server-side UUID for compatibility with an older caller. Current HTML and JavaScript always send an explicit identity. |

The JSON response retains `id`, `body`, `time` and `mine`, and adds `clientMessageId`. The identity is returned only to the sender (`mine=true`); a recipient receives `null` for this field.

## Browser lifecycle

- A pending local bubble is visible while the request is unresolved.
- A failed request retains the original draft and the same identity. Clicking Send again retries the unchanged logical send rather than creating a new one.
- Polling can confirm the message before the original request reports a network failure. Once a row with the same identity is observed, the message is treated as confirmed and is not changed back to failed.
- Editing a failed draft abandons that identity. The next submission receives a new identity and is a deliberately separate message.
- Polling and history continue to deduplicate confirmed messages by numeric message ID.

## Compatibility and migration

- `spring.jpa.hibernate.ddl-auto=update` adds the nullable column and unique constraint to an existing H2 database. The upgrade was checked against a database created by the previous jar; old message rows remained valid.
- A browser reload does not restore an unsent pending bubble. The server-side identity is durable, but the browser draft and pending state are currently session-local UI state.
- This is single-database exactly-once storage behaviour for one logical send. It is not a claim of end-to-end exactly-once delivery or a high-load distributed transaction guarantee.

## Evidence

- Browser identity, pending, failed, retry and edited-message evidence: [D_retry_browser_results.json](./evidence/D_retry_browser_results.json).
- Existing H2 upgrade and process-restart replay: [D_runtime_checks.txt](./evidence/D_runtime_checks.txt).
- Automated test detail: [D_test_record.md](./D_test_record.md).
