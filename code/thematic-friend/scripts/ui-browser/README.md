# UI acceptance checks

These checks exercise the packaged Mingle application in a separate database with random fictional-account credentials. They never use the shared demo database. They cover real filters, 320/375/390/768 px layouts, bilingual discovery, mutual matching, messages, unread counts, the saved profile, mobile logout and the public pages.

Build the project with `scripts/build.ps1`, then use the existing Node.js installation:

```powershell
cd scripts/ui-browser
npm install
npx playwright install chromium
npm run test:ui
```

On a machine with an existing test setup, set `JAVA_HOME`, `MINGLE_PLAYWRIGHT_MODULE` (a file URL) and `MINGLE_BROWSER_PATH` instead of installing a second copy. `MINGLE_CAPTURE_MODULE` optionally selects the existing screenshot helper; the application needs none of these Node.js tools at runtime.

`MINGLE_TEST_JAR` can select an already-built JAR and `MINGLE_TEST_OUTPUT` can select the output parent directory. Otherwise, results and genuine PNG screenshots go into a unique `.local/ui-browser-verification/review-*` directory. `results.json` records the tested JAR hash, assertions and process outcome. The runner stops its own server on completion. Run the existing discovery and conversation suites separately for dragging, duplicate suppression, permissions and history paging.

The browser widths simulate small screens. This is automated verification, not an independent peer review or a physical-device test.
