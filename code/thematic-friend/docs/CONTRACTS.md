# Baseline Routes and Data Contracts

Base package: `com.example.thematicfriend`. Controllers render Thymeleaf pages; services enforce business rules; repositories persist H2 entities. All business mutations use POST with CSRF protection. Actor identity comes from the authenticated session, not a submitted user ID.

| Method and route | Behaviour |
|---|---|
| GET `/`, `/privacy`, `/login`, `/signup` | Public pages |
| POST `/signup` | Validate and create an account; redirect to login |
| POST `/login`, `/logout` | Spring Security form authentication and logout |
| GET/POST `/profile` | Read/update the current user's profile |
| GET `/discover?interest=&goal=` | Filter and order eligible profiles by shared interests and activity |
| POST `/decisions/{target}` | `choice=LIKE` or `SKIP`; preserve valid filter values |
| POST `/decisions/reset` | Clear the current user's skips |
| GET `/matches/{id}?interest=&goal=` | Active participant-only match feedback, real shared interests and a link to the same conversation; preserve valid discovery filters |
| GET `/connections` | Active, unblocked mutual connections |
| GET `/conversations/{id}` | Participant-only conversation and latest 100 messages |
| POST `/conversations/{id}/messages` | Save a non-blank message up to 1,000 characters |
| GET `/api/conversations/{id}/messages?after=0` | Up to 100 later messages in ID order |
| POST `/connections/{id}/end` | End the connection |
| GET `/safety` | Own block list and own report receipts |
| POST `/blocks/{target}`, `/blocks/{target}/remove` | Block/unblock; unblock does not restore a closed connection |
| GET/POST `/reports/{target}` | Report form and private receipt creation |

## Data

- `Member`: unique lowercase username, password hash, display name (30 characters), bio (300), up to five interests, activity and discoverability. English option values are validated against the defined lists.
- `Decision`: directional actor/target pair and LIKE/SKIP choice; unique per direction.
- `Connection`: one canonical lower/higher member-ID pair, active/ended status and creation time. Only mutual likes create a connection.
- `Message`: connection, sender, text and timestamp. Every read/write checks membership, active state and both directions of blocking. Displayed times use Asia/Shanghai in this baseline.
- `Block`: directional actor/target pair. Discovery and communication check both directions.
- `Report`: reporter, target, reason, details and timestamp. An ordinary account sees only its own receipts. Staff roles and handling fields belong to E's future increment, coordinated with C/A.

Templates escape user text; polling appends text with `textContent`. The card script submits server-generated CSRF forms. A database pair lock and unique constraints guard core pairing changes; this does not constitute a high-load production concurrency certification.

## Language

`WebConfig` uses a session locale with English default, accepting `lang=en` or `lang=zh`. `messages.properties` is the English bundle; `messages_zh.properties` is temporary. `I18n` resolves controlled option labels and server status/error messages. User free text is preserved. Disabling `app.chinese-enabled` forces English and removes the switch.

This follows [Spring's locale-resolver model](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/localeresolver.html) and [Thymeleaf message expressions](https://www.thymeleaf.org/doc/tutorials/3.1/usingthymeleaf.html#messages).

## Changes to coordinate

A's discovery increment adds no database fields. A reciprocal like now redirects to `/matches/{id}` before the user chooses to open `/conversations/{id}`. Existing conversation IDs, message APIs, authorization checks and CSRF-protected decision forms remain the integration surfaces. Empty discovery results count only skipped profiles eligible under the current filters; reset still clears the current user's skips globally, as the UI explains, without clearing likes or boundaries.

C's password/session rules, D's per-participant read markers and history cursor, E's controlled staff role and report handling, and F's data-path/backup rules must be agreed with A before changing shared contracts. B's live preview must not persist unsaved edits or bypass backend validation. Existing tests are a regression baseline, not a substitute for each member's new acceptance checks.

## Password change decision (C local draft)

On 2026-11-09 Tao confirmed that a successful password change invalidates the current session only; other existing sessions stay signed in. New logins use the new password. Notify A/E before integration; team acknowledgement is pending.

Concrete owner-review proposals, integration order and the pending decision log are in [A's integration plan](INTEGRATION_PLAN.md). Proposed routes there are not implemented API contracts yet.

The second A increment preserves error HTTP status and the JSON error shape. HTML recovery returns to a local GET `/discover`, retaining only valid interest/activity filters. Restored discovery pages refresh current eligibility; pending decisions announce saving and suppress duplicate inputs. Native CSRF forms remain the fallback when JavaScript is disabled. No database fields were added.
