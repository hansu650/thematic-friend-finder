# D Zhou Ziyue: Chat Reliability Follow-up

Owner: **Zhou Ziyue (D), Developer**. Reviewer: **E Wu Zhuoda**, with A for shared implementation and C for product/account contracts. Start from current main on **w3/d-chat-reliability**. Initial estimate: **6 additional hours** across T12 implementation and T13 retesting. Status: **Assigned; not yet implemented**.

## Starting point

PR #10 already supplies per-participant unread state and bounded history. The integrated interface also supports text, emoji, stickers, draft preservation and normal send/poll flows. Reuse those capabilities openly; they are not new deliverables for this task.

## Work cards

| ID | Work | Estimate | Acceptance |
|---|---|---|---|
| D-REL-01 | Agree and implement an identity for a logical send, with server-side duplicate protection | 3 h | Repeating the same authenticated send after a lost response returns the same stored message; a reused identity with different content is rejected; existing message history remains readable |
| D-REL-02 | Add a clear failed-send/retry flow without losing or double-sending a draft | 2 h | A recoverable failure keeps the draft; retry uses the same logical-send identity; a confirmed send is displayed once; retry cannot bypass ended/blocked/participant permissions |
| D-REL-03 | Add two-account failure/recovery checks and explain the result | 1 h | Two independent browser contexts demonstrate a lost response, retry, reload and a single recipient message; text, emoji and stickers retain correct ordering and unread ownership |

Coordinate any schema change with A/C before implementation. Keep the current UI and native form fallback. Test duplicate requests at the persistence boundary, including concurrent requests where feasible; a disabled button alone is not duplicate protection.

## Review and explanation

- Supply the Java and browser regression cases, commands, actual results and any remaining limitation.
- Show the unread/history behavior and the new retry failure/recovery sequence in the Sprint Review. Own the messaging walkthrough and explain why unrelated or ended participants remain denied.
- Keep a short normal/boundary/test-output evidence set and update D's own progress record. A may integrate the result; D retains responsibility for implementing and explaining this new increment.
- C records whether the product acceptance criteria are met. E records any independent review actually performed. A verifies integration with the shared release.

This adds six planned hours to D's previous 28-hour allocation, giving 34 hours. The earlier provisional capacity is 32 hours; resolve the two-hour difference through availability or lower-priority scope at planning. Do not record these new tasks as completed until their implementation and checks exist.
