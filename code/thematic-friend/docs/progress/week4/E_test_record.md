# E | Test record

Run by Codex on 17 November 2026 (UTC+08:00) on Windows 11, Eclipse OpenJDK 21.0.9, Maven Wrapper 3.10.0 and H2 2.4.240. Tests used fictional data in isolated in-memory fixtures. The browser used fresh local H2 databases with the locally built JARs on loopback.

| Run | Source and command from `code/thematic-friend` | Result |
|---|---|---|
| Inherited checks | `90d6b6d9bdee2644f0a9aae3675932df8d46a980` · `.\mvnw.cmd --batch-mode --no-transfer-progress "-Dtest=PrototypeFlowTests,AIntegrationTests,ConversationReadStateTests,DiscoveryRegressionTests" package` | 47 tests passed, exit 0. |
| Baseline defect probe | The same revision, with only the new test temporarily copied in · `.\mvnw.cmd --batch-mode --no-transfer-progress "-Dtest=ReportPermissionRegressionTests#formLoginGatesStaffActionsAndRestrictsReceiptContents" test` | One assertion failed as expected after staff resolution. The receipt still said `Recorded, pending review`. Exit 1. |
| Full retest and build | Source and tests recorded in `6a2132d45cbb2c1772c4fa48549d1dbb0fd7e488` · `.\mvnw.cmd --batch-mode --no-transfer-progress clean package` | 70 tests passed, including all four `ReportPermissionRegressionTests`. Exit 0. |
| Browser comparison | Local Playwright 1.62.1 runner, Node v24.20.0, Edge 157.0.4341.60, 320 × 800 CSS px | Baseline recorded the stale label and exited 1. The fixed build passed and exited 0. JSON records link each result to its specific JAR. |

Maven runs used `-Dmaven.repo.local` to reuse a pre-existing local dependency cache. For all other options, use the commands above. [Maven console excerpts](./evidence/E_maven_results.txt) contain the outcome lines and exit codes. Full logs stay local. The browser runner was executed with `node .\runner\safety-check.mjs <jar> 'Recorded'` for the English baseline and with an additional `'已记录'` argument for the retest. The local evidence directory retains the runner and lockfile.

| JAR | SHA-256 |
|---|---|
| Baseline | `0A6FEA9F5A02D7F966082379F21A47C1AF62C0C5F2C64B0BB814FD4B1E368C30` |
| Week 4 retest | `8B90B745EC27B56B76153624DA6A4F35E666185751830F27A27C924BB43BA119` |

## Cases

| Test ID | Inherited coverage reused | Week 4 observed result | Status |
|---|---|---|---|
| E-W4-T1 | `PrototypeFlowTests.reportReviewRequiresStaffForListDetailAndUpdate` injected USER and STAFF principals. | All four signed-in accounts obtained real sessions through the form login. Anonymous requests redirected to login where CSRF was valid, and ordinary members received 403 at staff routes. Only the configured account opened the queue/detail and resolved the report. Denials left the row unchanged. | Pass |
| E-W4-T2 | `PrototypeFlowTests.staffCanResolveOnceAndInternalNotesStayPrivate`, `reportsArePrivateAndStillPossibleAfterBlocking`, and A-INT-05 covered receipt visibility and notes. | Reporter alone saw the receipt text through `/safety`. The staff detail displayed the saved note. The staff queue omitted the note and details. After the fix, the same receipt’s label remained `Recorded` before and after resolution. | Pass |
| E-W4-T3 | `PrototypeFlowTests` covered STAFF CSRF and rejection of `PENDING`; A-INT-06 covered shared contact writes. | Invalid review status, overlong note and invalid report reason/details returned 400. Unknown IDs returned 404. Missing CSRF returned 403. All rejected review writes left the original pending row intact; all rejected report submissions left the table empty. | Pass |
| E-W4-T4 | `PrototypeFlowTests.staffCanResolveOnceAndInternalNotesStayPrivate` covered a sequential duplicate. | Two simultaneous sessions of the configured staff account attempted different outcomes. Responses were 302 and 409, and all saved fields reflected one resolution. A further 409 preserved the entire saved row, including handler and timestamp. | Pass |
| E-W4-T5 | `PrototypeFlowTests` covered discovery and block/end. A-INT-02/04/05 covered stale decisions, ended chat and unblocking. `DiscoveryRegressionTests` covered match denial. `ConversationReadStateTests` D05 covered history and async boundaries. | Extended A-INT-02 to test direct discovery under both block directions. Extended A-INT-04/05 to assert match, read, send, history and acknowledgement from both participants after closure and after unblock, with no extra messages or read markers. | Pass |
| E-W4-T6 | The inherited Week 2 evidence identified the stale receipt wording. | Tab/Enter reached the report, staff review and block/unblock controls. All four measured English pages fit the 320 px viewport. STAFF resolution reached `REVIEWED` while the reporter's internal-note check remained negative. The corrected receipt showed `Recorded` and `已记录`. [Baseline browser JSON](./evidence/E_browser_baseline.json) · [Retest browser JSON](./evidence/E_browser_retest.json) · [Keyboard capture](./images/E_keyboard_report.png) | Baseline defect reproduced; retest passed |

See the [permission matrix](./E_permission_matrix.md) for detailed role/route results and the [defect record](./E_defects_and_retests.md) for reproduction and ownership. Browser results are automated emulation of one viewport, with no physical mobile device, screen-reader evaluation or human usability session. The H2 concurrency case covers two simultaneous sessions of one configured staff account.
