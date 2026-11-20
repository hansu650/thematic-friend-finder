# D | Defect and retest record

## D-W4-DEF-01 · Confirmed message could later be labelled failed

| Field | Actual record |
|---|---|
| Defect ID / reporter / date | D-W4-DEF-01 / Codex during local browser review / 20 November 2026 |
| Source revision / environment | Working tree based on `f9de8e1`; OpenJDK 21.0.2, H2 2.4.240, Chrome 157.0.8103.80 |
| Steps | Commit a message on the server but hold its response. While the request remains unresolved, allow the three-second poll to fetch the new row and remove the pending bubble. Then abort the original request as a network failure. |
| Expected | The message remains confirmed because a persisted row with the same logical identity is already visible. |
| Actual before fix | The poll removed the pending bubble and showed confirmation. The late failed fetch then set the global status to `Could not confirm delivery`, contradicting the persisted message. No duplicate row was created, but the UI was misleading. |
| Impact / severity | Low-to-moderate UI truthfulness defect. Data persistence remained correct. |
| Action | Track identities already confirmed by polling or a successful response. A late network failure checks that set before changing the send state. |
| Fix location | `src/main/resources/static/js/chat.js` and the dedicated retry browser scenario |
| Retest | Browser B7 passed: polling confirmed the row, the original request was aborted, and the status remained confirmed. The full Maven build also passed 77 tests. |
| Status | Fixed and locally retested. Independent review is pending. |

## Boundary

This defect was introduced in the new pending-message UI rather than inherited from `main`. The previous baseline had no local pending bubble or identity state to contradict. No invented baseline defect is recorded.
