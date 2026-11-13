# B: Profile browser checks

These checks cover B's live preview increment. They are separate from the existing Java and A discovery suites. The website still runs on Java 21 without Node.js; Node.js 20+ and the pinned Playwright test package are only development test dependencies.

## Reproduce

From `code/thematic-friend`, build the real packaged application:

```powershell
$env:JAVA_HOME = 'PATH_TO_YOUR_JDK_21'
$env:MAVEN_USER_HOME = Join-Path $PWD '.cache/maven'
.\mvnw.cmd --batch-mode --no-transfer-progress package
cd scripts/profile-browser
npm ci
npx playwright install chromium
npm run test:profile
```

Alternatively, set `MINGLE_BROWSER_PATH` to an existing Edge/Chromium executable before running. The recorded Windows run uses installed Edge. The clean Chromium installation route remains for a peer to reproduce.

The runner starts its own loopback-only server on an available port, uses a new database and random fictional-account password, and stops the server in a finally block. It never edits the shared demo database or prints the password.

Optional environment variables:

- `MINGLE_TEST_JAR`: built JAR path (default: the project's target JAR).
- `MINGLE_TEST_OUTPUT`: output parent (default: `.local/profile-checks`).
- `MINGLE_BROWSER_PATH`: existing browser executable.
- `JAVA_HOME`: Java 21 installation.

Dependencies are pinned in package-lock.json. No project-specific Node global installation is required. Keep npm caches, temporary files and test databases on your selected development drive.

## Assertions

| Group | Actual checks |
|---|---|
| B-01 | Name, bio, goal, interests and initial update; no profile POST while editing; another page and reload see saved values; explicit Save persists all fields. |
| B-02 | Mouse and Space selection/deselection; sixth selection rejected with named feedback; first five choices and keyboard focus preserved; reset restores initial choices. |
| B-03 | HTML-like input remains text; no injected element or dialog; 30/300-character unbroken text does not overflow at 390 px. |
| B-04 | Keyboard-only form traversal, visible focus styles, Space/Enter actions and polite status-region updates. |
| B-05 | Profile, Discover, Messages and Safety at 1440 and 390 px; active navigation, no horizontal overflow and an actionable Save button. |
| B-06 | English and temporary Chinese labels/status; all form controls labelled; reduced-motion styles and narrow layout. |
| B-FALLBACK | Without JavaScript, server rejects six interests and retains attempted input without changing saved data; native valid save still persists. |

The live-region assertions verify semantic markup and content changes. They do **not** certify announcements in a real screen reader. Mobile checks are emulated browser widths, not physical phone observations. The run is not a substitute for consented usability observation or C's review.

## Evidence

Each run retains results.json, browser-output.txt, a private server.log/database, screenshots and the exact source hashes. The base Git revision and working-tree changes are recorded explicitly if the run precedes a commit. The JAR hash identifies the actual application tested.

B_tests.png is a browser-rendered viewer of the real output log, explicitly labelled as such; it is not a staged terminal or a GitHub CI screenshot. A failure exits 1 and retains its actual failure screenshot and output. A passing run exits 0. Only selected evidence files should be committed; databases and server logs stay local.

## Shared contracts

The optional script and stylesheet are loaded only when the profile form is present. All new CSS is scoped to `.profile-page`. The shared reference template also exposes the Meet destination and marks the active destination in account/mobile navigation. No route, database field, session policy or backend limit changes. The existing five-interest server validator remains authoritative. These implementation details are provided for A/F and C to review; no prior team agreement is claimed.
