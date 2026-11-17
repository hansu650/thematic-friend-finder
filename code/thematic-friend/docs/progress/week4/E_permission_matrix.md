# E | Permission and confidentiality matrix

Checks run on 17 November 2026. The results below are from the local Week 4 revision documented in [E_test_record.md](./E_test_record.md).

The Spring Boot fixture created four fictional H2 members. The first persisted member’s ID was asserted to be `1` and matched `app.review.staff-member-id=1`. STAFF, reporter, reported member and unrelated member each authenticated through `POST /login` with a BCrypt-backed account. MockMvc exercised the real authentication provider and session, with its CSRF helper supplying valid tokens. The browser check used the application's rendered login and forms. The inherited contact tests inject USER principals. The application defaults to no configured staff ID.

| Route or operation | Expected | Observed |
|---|---|---|
| `GET /staff/reports` and `GET /staff/reports/{id}` | Anonymous sessions must sign in. Only STAFF can open the queue and detail. | Anonymous → 302 to `/login`. Reporter, reported member and unrelated member → 403. Configured STAFF → 200 on both. |
| `POST /staff/reports/{id}` with valid CSRF | Only STAFF can resolve a pending report. | Anonymous → 302 to `/login`. All three non-staff accounts → 403. Persisted report remained unchanged across the denials. STAFF → 302 to detail; resolution was then visible there. |
| Same POST without CSRF | Deny the write regardless of role. | Anonymous, each non-staff account and configured STAFF → 403. Pending report stayed unchanged. |
| `GET /safety` | Login required. A member sees only their own receipts and blocks. | Anonymous → 302 to `/login`. All signed-in accounts → 200. Only the reporter saw the fixture receipt and its details. STAFF's member view did not show the other account’s receipt. Browser check verified the reporter’s own block list. |
| Receipt and staff review content | A receipt confirms recording and shows the reporter’s submitted reason/details. Internal review fields belong to staff views. | The same reporter receipt displayed `Recorded` before and after review. The staff queue showed the status but omitted details and the internal note. The staff detail displayed the report text and the saved note. The note was absent from all four members’ `/safety` views. |
| Invalid input or unknown IDs | Return controlled errors without altering state. | STAFF review with `PENDING`, an unknown status or 1,001-character note → 400. Valid review request for an unknown ID → 404. Invalid report reason or 1,001-character details → 400, unknown target → 404. The rejected operations changed no rows. |
| Simultaneous and repeated resolution | Persist one terminal result and reject later resolution. | Two concurrent sessions of the configured account received 302 and 409. Status and note matched the winning request. Handler ID and timestamp were set. A subsequent 409 left the complete row unchanged. |
| Discovery after either direction of block | A blocked pair cannot select the old discovery card or save a decision. | From the same member's perspective with each direction of block, direct discovery → 404 and stale decision → 404. No decision row was written. |
| Match or chat after end, block, and unblock | Both participants lose access. Unblocking leaves the connection closed. | Both USER fixtures received 403 on match, HTML chat, polling, native and async send, history and read acknowledgement. The original message remained and no read marker was written. An unrelated USER received 404 for conversation reads. No separate STAFF conversation session was exercised. |

For case IDs and the distinction between inherited assertions and Week 4 additions, see [E_test_record.md](./E_test_record.md).
