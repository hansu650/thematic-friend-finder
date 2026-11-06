# A Qin Tian — Verification Record

Verified on **6 November 2026**, Windows, JDK 21.0.12.1, Maven Wrapper. Tested source is identified by [SHA-256 build inputs](./evidence/source-manifest.json), not by a screenshot filename alone. JAR SHA-256: f60233a20b77ba0f9cbe951cb7b5b5e488ffdcbdfd89d1ee80fcfbb03b29c230.

| Run | Result | Exit | Evidence |
|---|---|---|---|
| First Java package | 31 tests; 0 assertion failures; 2 template-rendering errors | 1 | [Original output](./evidence/java-first-failure.txt), [stack trace](./evidence/first-failure-report.txt) |
| Same Java command after template fix | 31 tests; 0 failures/errors/skips | 0 | [Retest output](./evidence/java-retest.txt), [JUnit reports](./evidence/junit/) |
| Isolated Edge browser run | 11 assertion groups passed; no page exceptions/HTTP 5xx | 0 | [Output](./evidence/browser-output.txt), [assertions](./evidence/browser-results.json), [run metadata](./evidence/browser-run.json) |
| GitHub Actions on implementation commit e8cd17e | Mingle Java CI completed successfully | Success | [Run 42164383872](https://github.com/hansu650/thematic-friend-finder/actions/runs/42164383872) |

## Java command and coverage

The source was copied to a clean verification directory and built using the existing task Maven cache:

~~~powershell
.mvnw.cmd --batch-mode --no-transfer-progress --offline "-Dmaven.repo.local=<existing task cache>" package
~~~

The actual command sets JAVA_HOME to the installed JDK 21 and MAVEN_USER_HOME to the task's cache. This proves a clean source copy builds against available dependencies; it does not prove a fresh network download on a teammate's machine.

The total consists of **19 retained baseline tests plus 12 new DiscoveryRegressionTests**. New tests cover normalized filters, eligible counts and skip recovery, reciprocal/repeated likes, actual shared interests, correct match routes, outsider/anonymous/blocked access, escaped user text and Chinese feedback. Read the [test source](./source-changes/code/thematic-friend/src/test/java/com/example/thematicfriend/DiscoveryRegressionTests.java).

## Browser command and coverage

~~~powershell
node scripts/browser/run-discovery-check.mjs
~~~

This run selected the already-built verification JAR with MINGLE_TEST_JAR and the existing Edge executable with MINGLE_BROWSER_PATH. It used Node v24.22.1, Playwright 1.62.1 and Edge 156.0.4314.58. Optional local capture/motion modules produced the ordinary arrow. [Portable runner instructions](./source-changes/code/thematic-friend/scripts/browser/README.md).

The runner creates a fresh database and random fictional-account password, starts a loopback-only server, executes the UI assertions and stops the server. It does not use the shared demo. Exact per-group outcomes are retained in the JSON and text outputs.

The eleven groups cover filters/shared interests, short mouse return, empty-result recovery, committed mouse like, reciprocal match/correct chat/message arrival, repeated arrow keys, short/committed emulated touch, 390 px discovery/empty/Chinese controls, mobile match/Chinese/reduced-motion navigation, reduced-motion button submission and absence of runtime errors in those flows.

## Real defect

Two tests initially errored because a bean call nested inside an aria-label message parameter triggered Thymeleaf's restricted expression context. Precomputing translated filter labels with th:with resolved the error. The first log and successful retest are both retained unchanged. The fix is in discover.html; the test assertions were not removed or weakened.

## Limits and review

This is one Windows/Edge verification run with Chromium touch emulation. It is not a physical-device check, production/security certification, load test, independent reviewer run or user interview. B Wang Yikai's review is **pending**. B–F's feature increments are still theirs to implement. Later CI and PR status are recorded separately when available; local passing results do not imply peer approval.
