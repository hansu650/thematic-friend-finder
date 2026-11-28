# Recovery browser verification

These are automated engineering checks using fictional local accounts, not observed-user or peer acceptance.
Build the JAR with Java 21 and `./scripts/build.ps1` (or `bash ./mvnw package`). Use an installed Node.js and Playwright runtime; set `MINGLE_PLAYWRIGHT_MODULE` to its ESM file URL if it is outside this project, and `MINGLE_BROWSER_PATH` to an installed compatible browser.

Run from the application directory in PowerShell:

```powershell
$env:MINGLE_CHECK_SCRIPT = 'retry-check.mjs'
$env:TONGPIN_CHINESE_ENABLED = 'false'
node scripts/conversation-browser/run-conversation-check.mjs

$env:MINGLE_CHECK_SCRIPT = '../recovery-browser/recovery-check.mjs'
node scripts/conversation-browser/run-conversation-check.mjs

$env:TONGPIN_CHINESE_ENABLED = 'true'
node scripts/conversation-browser/run-conversation-check.mjs
```

Every invocation reserves a separate local port, creates a fresh database under `.local/browser-verification`, generates an ephemeral demo password and stops its own server afterward. It never selects the ordinary demo database. `MINGLE_TEST_OUTPUT` can change the evidence parent directory. `MINGLE_CAPTURE_MODULE` may point to a compatible `captureScreenshot` helper; otherwise the script saves native PNGs.

The retry suite controls acknowledgement loss after server commit and temporarily withholds polling results to keep the failure observable. It then restores real polling for the late-failure check. Validation rejection and permission loss are injected HTTP responses; the Java suite separately exercises server validation and permissions. These deliberate network conditions are not reports of a real outage.

The recovery suite checks friendship copy, language controls, all 18 fresh event fixtures, a three-account capacity race, cancellation/replacement and the retained inbox minimum width. Final-English and development modes use separate server runs. Existing database migration, human usability and physical-device acceptance are outside this check.
