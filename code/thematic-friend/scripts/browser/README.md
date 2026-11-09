# Discovery browser checks

These optional development checks cover A's discovery and match feedback. The website itself still runs with Java 21 and Maven only. The test runner starts a separate loopback-only server, creates a fresh database and random fictional-account password, runs the checks, and stops that server. It does not change the shared demo database.

## Run

Build the application first with the project's Maven Wrapper. Then, with an existing Node.js installation:

```powershell
cd scripts/browser
npm install
npx playwright install chromium
npm run test:discovery
```

On Linux, Playwright may additionally require its documented browser system dependencies. Node.js/Playwright are optional test dependencies, not frontend build requirements. Java is resolved from `JAVA_HOME`, falling back to `java` on `PATH`.

Results appear in a new `.local/browser-verification/discovery-*` directory. Keep `results.json`, `run.json` and screenshots when reporting a run. Runtime databases and server logs stay local. A passing process exits with code 0. A failed assertion exits with code 1 and retains the actual failure.

The tested dependency is pinned to Playwright 1.62.1. The supplied Windows run used the already-installed Edge executable and local Playwright installation. A newly installed Chromium run on another machine remains for the peer reviewer to reproduce.

## Optional environment variables

| Variable | Purpose |
|---|---|
| `MINGLE_TEST_JAR` | Absolute path to an already-built JAR; defaults to `target/thematic-friend-0.0.1-SNAPSHOT.jar`. |
| `MINGLE_TEST_OUTPUT` | Parent folder for a new run directory. |
| `MINGLE_BROWSER_PATH` | Existing Edge/Chromium executable; omit to use Playwright's installed Chromium. |
| `MINGLE_PLAYWRIGHT_MODULE` | File URL for an existing Playwright module; omit after `npm install`. |
| `MINGLE_CAPTURE_MODULE`, `MINGLE_MOTION_MODULE` | Optional local screenshot and arrow-motion helpers. Not required to execute assertions. |
| `MINGLE_SKIP_SCREENSHOTS` | Set to `1` to run all assertions without saving automatic browser images. The PowerShell evidence workflow exposes this as `-SkipScreenshots`. |

`run.json` records the tested JAR hash, browser-test command and process exit code. `results.json` records browser version and each assertion. Screenshot files are real page captures; a screenshot alone does not prove exactly-once submission or motion behavior. Those claims rely on the executable assertions and request counts.

## Scope

Sixteen reported groups cover visible filters/shared interests, short and committed mouse drags, clear/revisit recovery, reciprocal match feedback and the correct conversation, repeated arrow keys, emulated touch, 390 px layout, temporary Chinese controls, reduced motion, delayed-response feedback and duplicate suppression, browser Back recovery, native forms without JavaScript, a stale card hidden in another session, a closed match link and absence of browser/server errors during these flows. JUnit covers exclusions, participant-only match access, repeated server submissions and cross-route safety invariants.

The history check uses actual Back navigation and separately dispatches an explicit persisted-pageshow event, since the browser may choose a fresh navigation instead of BFCache. The delayed-response check intentionally holds a request in the test harness; it is not a measured network-performance claim. Disabling screenshots leaves the assertions and recorded outcomes intact.

Touch is Chromium CDP emulation, not a physical phone test. This run is not an accessibility audit, a load test, independent peer review, or implementation of B–F's features.
