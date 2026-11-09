# D Conversation Browser Checks

These optional Playwright checks cover D's unread state, read acknowledgement and older-message loading. They run against a newly built JAR, a random loopback port and a disposable H2 database. They do not use the shared demo database.

## Run

Build the application first:

```bash
cd code/thematic-friend
bash mvnw --batch-mode --no-transfer-progress package
cd scripts/conversation-browser
npm install
npm test
```

The runner uses `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` when available. Set `MINGLE_BROWSER_PATH` to another Chromium executable if needed. `MINGLE_PLAYWRIGHT_MODULE` can point at an existing Playwright module.

Results are written under `code/thematic-friend/.local/browser-verification/conversation-*`. `results.json` records each assertion, `run.json` records the JAR hash, browser path and exit code, and `images/` contains the real page captures.

## Scope

The script creates a real mutual connection between isolated fictional accounts, verifies recipient-only unread counts, acknowledges messages through the CSRF-protected API, loads beyond 100 messages, merges a polling result with older history, sends a 1,000-character message, uses keyboard submit, checks an empty conversation, verifies the 390 px composer does not sit behind navigation, and checks the ended-connection 403 page.

JUnit remains the authoritative server-rule coverage. This browser run is not an accessibility audit, a load test or independent peer review.
