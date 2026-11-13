# Routes and Data Contracts

Current revision: 13 November 2026. Base package: `com.example.thematicfriend`. Controllers render Thymeleaf pages; services enforce business rules; repositories persist H2 entities. Business mutations use POST with CSRF protection. Actor identity comes from the authenticated session, never a submitted actor ID.

| Method and route | Behaviour |
|---|---|
| GET `/`, `/privacy`, `/login`, `/signup` | Public pages |
| POST `/signup` | Validate and create an account; redirect to login |
| POST `/login`, `/logout` | Spring Security form authentication/logout; successful login respects a saved request, otherwise opens Explore |
| GET/POST `/profile` | Read/update the current user's profile |
| GET/POST `/change-password` | Verify the current password, validate the replacement, then sign out the current session |
| GET `/explore` | Authenticated event and people feed |
| GET `/discover?interest=&goal=&member=` | Filter eligible people or open an eligible profile; hidden, blocked and already-decided people remain excluded |
| POST `/decisions/{target}` | `choice=LIKE` or `SKIP`; preserve valid filter values |
| POST `/decisions/reset` | Clear the current user's skips; preserve likes and boundaries |
| GET `/matches/{id}?interest=&goal=` | Active participant-only match feedback with a link to the same conversation |
| GET `/events?q=&city=&category=&view=` | Upcoming activity search; `view=saved` or `going` uses the current account |
| GET `/events/{id}`, `/events/new` | Activity detail or creation form |
| POST `/events` | Validate and persist a future activity with the authenticated host |
| POST `/events/{id}/attendance` | Set `attending=true/false` idempotently; enforce capacity under an event lock |
| POST `/events/{id}/save` | Set the current account's `saved=true/false` idempotently |
| GET `/connections` | Active, unblocked mutual connections with recipient-owned unread counts |
| GET `/conversations/{id}` | Participant-only conversation and latest 100 messages |
| POST `/conversations/{id}/messages` | Native form send with redirect; non-blank body of at most 1,000 characters |
| GET `/api/conversations/{id}/messages?after=0` | Up to 100 later messages in ID order |
| POST `/api/conversations/{id}/messages` | Form-encoded `body`; save and return one message as JSON |
| GET `/api/conversations/{id}/history?before=<messageId>` | Up to 100 older messages in ascending ID order, with `hasOlder` and `nextBefore` |
| POST `/api/conversations/{id}/read` | Monotonic acknowledgement for the current participant through `throughMessageId` |
| POST `/connections/{id}/end` | End the connection |
| GET `/safety` | Own block list and own report receipts |
| POST `/blocks/{target}`, `/blocks/{target}/remove` | Block/unblock; unblock does not restore a closed connection |
| GET/POST `/reports/{target}` | Report form and private receipt creation |
| GET `/staff/reports`, `/staff/reports/{id}` | STAFF-only queue and report detail |
| POST `/staff/reports/{id}` | STAFF-only resolution of a pending report; concurrent or repeated resolution returns conflict |

## Persisted data and boundaries

- `Member`: unique lowercase username, password hash, display name (30 characters), bio (300), up to five validated interests, activity and discoverability.
- `Decision`: unique directional actor/target pair with LIKE/SKIP. `Connection`: canonical lower/higher member pair, active/ended status and creation time; only mutual likes create one.
- `Message`: connection, sender, body and timestamp. Every read/write checks membership, active state and both directions of blocking. Text and emoji use the body directly; the six controlled stickers use `[[sticker:<id>]]`. Unknown text remains escaped text.
- `ConversationReadState`: one participant marker per connection, with monotonically increasing `lastReadMessageId`. Only incoming messages above that marker count as unread.
- `CommunityEvent`: host, title, description, category, venue/city, start time, capacity and local image. `EventAction` records attendance or save state per event/account/kind. Repeated state-setting requests preserve a single action; enabling an action on a past event returns conflict.
- `Block`: directional actor/target pair, checked in both directions. `Report`: private reporter/target/reason/details plus review status, handler, time and note. Ordinary accounts see their own receipts; the explicitly configured STAFF member can review reports.

Templates escape user text; polling appends text with `textContent`. CSRF-protected native forms remain usable without JavaScript. Pair locks, event locks and unique constraints guard the relevant mutations; this is not a high-load concurrency certification. Current chat sends have no persistent logical-send idempotency key; that is the assigned [D reliability task](../../../team-plan/tasks/week3/D_chat_reliability.md).

## Password and staff contracts

C's password change was merged in PR #11. As confirmed on 9 November, successful password change invalidates **only the current session**. Other existing sessions remain signed in; future logins use the new password. Preserve this rule until an explicit account-contract change is agreed.

E's report review was merged in PR #14. `app.review.staff-member-id` grants STAFF only to that existing member ID; its default of zero grants nobody that authority. Both staff page and mutation routes require STAFF, and mutations retain CSRF protection. Pending reports can be resolved once with a non-pending status and a note of at most 1,000 characters.

## Language, fixtures and integration

`WebConfig` uses an English-default session locale with `lang=en` or `lang=zh`. `messages.properties` is English; the temporary Chinese bundle remains separate. Disabling `app.chinese-enabled` forces English. User free text is preserved.

Demo data is opt-in. Missing fixtures are added without rewriting existing profiles, decisions, messages, activity dates or personal event actions. New activity fixtures use English text. Legacy activity titles are recognized only to avoid duplicating records in an existing preview database.

D's unread/history contract is implemented and merged in PR #10; [CONTRACT_D.md](CONTRACT_D.md) retains its original proposal history. F's merged backup/restore tools require a stopped database and preserve the configured data directory. The older [integration plan](INTEGRATION_PLAN.md) contains historical proposals, not an additional set of implemented routes. Coordinate future shared schema/account changes with A and C, and retain B's validation boundaries and E's permission regressions.
