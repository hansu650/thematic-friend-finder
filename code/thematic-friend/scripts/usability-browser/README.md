# B: Week 4 usability regression checks

This runner adds coverage for a populated inbox whose inner content can be clipped without document overflow, complete keyboard navigation at 390/320 px, older-history animation replay, and independent motion preferences. It uses the existing pinned Playwright installation from `scripts/profile-browser`; no new dependency is introduced.

From the application directory, build the current source with Java 21, then run:

```powershell
.\scripts\build.ps1
$env:npm_config_cache = Join-Path $PWD '.cache/npm'
npm ci --prefix scripts/profile-browser
$env:MINGLE_BROWSER_PATH = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node scripts/usability-browser/run-usability-check.mjs
```

Alternatively install Chromium using the profile runner's documented setup and omit the executable override. On Windows set `JAVA_HOME` to the installed JDK 21. Keep `TEMP`, `TMP` and `MINGLE_TEST_OUTPUT` on the selected development drive when needed.

| Group | Actual scope |
|---|---|
| B-W4-INBOX | Seeded conversations at 1440/390/320 px. Both the document and the inbox's inner controls must fit; a clipped grid item cannot pass solely because the parent hides overflow. |
| B-W4-KEYBOARD-390 / -320 | Keyboard login, profile navigation/edit/reset/save, reachable Meet action, event save, conversation navigation and message send. Uses Tab/Enter/Space and typing; no programmatic focus or mouse click for these task actions. Checks 30/300-character drafts and final English mode. |
| B-W4-HISTORY | Adds 105 fictional messages through the authenticated API as explicit fixture setup. Loads older messages by keyboard, checks unique ordered IDs, then observes two real polls without replayed arrival effects. |
| B-W4-REDUCED-PREFERENCES | Separate browser contexts: manual reduce with OS no-preference, then OS reduce with manual unchecked. Profile saves and message sends remain usable at 320 px. Records preference states and observed chat animations. Allows only CSS focus transitions of at most 0.01 ms, matching the existing reduced-motion stylesheet; JavaScript bubble animations and longer transitions fail. |

Optional settings: `MINGLE_TEST_JAR`, `MINGLE_TEST_OUTPUT`, `MINGLE_PLAYWRIGHT_MODULE`, `MINGLE_BROWSER_PATH`, `JAVA_HOME`. To isolate a group set `MINGLE_CHECK_GROUP` to its exact ID; unset it for the full suite.

The runner starts a new loopback-only server, seeds fictional conversations, generates a random password, and closes its own browser/server. It records source/JAR/runner hashes, runtime, focus geometry, results and captures. Server logs and H2 files remain private; share only selected results and captures. Exit 1 preserves failures.

Focus assertions wait for native smooth scrolling and navigation animations to settle, without scrolling or moving focus from the test. Hidden interest inputs are inspected through their visible chip; ordinary checkboxes retain their own outline.

These are automated browser checks with emulated viewport widths and an emulated OS preference. They do not establish physical-phone usability, actual Windows setting interaction, screen-reader announcements, participant consent or human review.

