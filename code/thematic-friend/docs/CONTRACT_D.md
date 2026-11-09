# CONTRACT-D: Unread State and Conversation History

Owner: **D Zhou Ziyue**. Contributors: **A Qin Tian**, **C Tao Jiacheng**.
Recorded: **9 November 2026**.

Status: **D accepts A's 6 November proposal; C/A confirmation pending.** This file is a development contract, not evidence that the routes already exist or that the feature has passed acceptance.

## Data ownership

- Store one read marker per `(connectionId, participantId)` pair in `conversation_read_states`.
- Both columns are required and unique together. The marker is `lastReadMessageId`, initially `0` for a participant with no saved state.
- Only the authenticated participant's row may change. A request must never update the other participant's marker.
- Updates are monotonic: a lower or equal `throughMessageId` leaves the saved marker unchanged.
- A marker is valid only when the acknowledged message belongs to the same connection. The current user's own or the other participant's message may be acknowledged because it is part of the visible conversation transcript.
- Unread count for a participant is the number of messages in the connection whose `senderId` is not that participant and whose `id` is greater than their saved marker.

## Routes

### Existing polling route (unchanged)

`GET /api/conversations/{id}/messages?after=<messageId>`

- Returns a JSON array of up to 100 later messages in ascending ID order.
- Existing response fields and behaviour remain unchanged for compatibility with `chat.js`.

### Older-history route (new)

`GET /api/conversations/{id}/history?before=<messageId>`

- `before` is required and must be a positive message ID.
- Returns at most 100 messages with IDs lower than `before`, in ascending ID order.
- Response shape:

```json
{
  "messages": [
    {"id": 51, "body": "Example", "time": "11-09 10:00", "mine": false}
  ],
  "hasOlder": true,
  "nextBefore": 51
}
```

- `hasOlder` is true only when at least one message older than the returned page exists.
- `nextBefore` is the lowest returned message ID when `hasOlder` is true; otherwise it is `null`.
- An empty valid page returns `messages: []`, `hasOlder: false`, and `nextBefore: null`.

### Read acknowledgement route (new)

`POST /api/conversations/{id}/read` with form field `throughMessageId=<messageId>`

- The route is CSRF-protected and derives the actor from the authenticated session.
- `throughMessageId` is required and must identify a message in the same connection.
- Response shape:

```json
{"lastReadMessageId": 150, "unreadCount": 0}
```

- The returned `lastReadMessageId` is the stored monotonic marker, which may be higher than the submitted value.
- The returned `unreadCount` is calculated after the update for the current participant only.

## Access and errors

Every history, polling and read-state request applies the existing `ConnectionService.require` rules:

- Unrelated or missing connection: `404`.
- Ended connection or either-direction block: `403`.
- Missing, non-numeric or non-positive cursor: `400`.
- Message ID outside the connection: `400`.
- Anonymous API request: `401`.
- Missing CSRF token on read acknowledgement: `403`.
- API errors use the existing JSON error shape with an `error` field; user-facing text remains localisable and must not expose another participant's data.

## Browser integration

- `GET /conversations/{id}` continues to render the latest 100 messages initially.
- A visible `Load older messages` control calls the history route with the current oldest message ID.
- Older pages are prepended and polling results are appended, but the DOM is the final authority: messages are deduplicated by `data-message-id` and ordered by numeric message ID.
- Equal timestamps do not determine order.
- After the conversation is opened and rendered, a CSRF-protected acknowledgement is sent for the latest visible message. When new polling results arrive while the page is visible, they remain unread until the browser sends a later acknowledgement.
- If the page is hidden or inactive, no acknowledgement may be generated merely because polling received a message.

## Acceptance mapping

| Test | Contract consequence |
|---|---|
| D-01 | Sender messages do not increase the sender's unread count; recipient counts increase. |
| D-02 | Acknowledgement changes only the current participant's marker; later incoming messages remain unread until acknowledged. |
| D-03 | 0, 1, 100 and more than 100 messages produce bounded ascending pages with no gaps. |
| D-04 | History and polling merge by ID without duplicates or reordering, including equal timestamps. |
| D-05 | Outsider, ended and blocked requests receive the specified rejection. |
| D-06 | Unread, empty, error and long-message states remain usable on desktop and at 390 px. |

## Confirmation required

- **A:** confirm the route names, response fields, page size and JSON error shape.
- **C:** confirm actor identity remains session-derived and the new read-state rows do not conflict with account/session policy.
- **D:** implement and test the accepted version; record any alternative and update affected contracts/tests together.
