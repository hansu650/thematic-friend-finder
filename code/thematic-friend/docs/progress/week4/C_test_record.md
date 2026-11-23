# C | Week 4 test record

Codex executed these checks on 23 November 2026 (UTC+08:00). The source was a clean checkout of `ac9c61c1726fb31a70e7a28be70e1306ebbda926`. Local changes after the build cover the keyboard test, the account acceptance runner and these records. Runtime, dependencies and build configuration matched the commit throughout.

| Item | Observed value |
|---|---|
| Host | macOS 27.0.1, arm64 |
| Runtime | Azul Zulu OpenJDK 21.0.8+9-LTS, Maven Wrapper, Spring Boot 4.1.2 |
| Browser | Google Chrome 157.0.8103.79, headless, Node 24.12.0 and Playwright 1.62.1; narrow widths are emulated |
| Data | Isolated fictional H2 fixtures; the account runner starts from an empty file-backed database and restarts with seeding disabled |
| JAR SHA-256 | `d962a4d204b4170465164f3adbf7b268d91e6bf0ed4e4cf5d783c66f02b66dff` |

## Scenario results

| Case | Expected | Observed | Status |
|---|---|---|---|
| C-W4-T1 · Account and profile | Fictional signup/login; valid profile saves; user data survives process restart. | Signup and form login succeeded. Reload showed the saved bio, and a new seed-disabled Java process on the same H2 path retained the saved name, bio, selected interest and replacement credential. `PrototypeFlowTests` covered duplicate/underage rejection. B's profile runner checked draft isolation, interest limits and validation. | Pass |
| C-W4-T2 · Discovery to chat | One-sided like cannot open chat; reciprocal like creates one connection and takes both parties to that conversation. | `PrototypeFlowTests` and `DiscoveryRegressionTests` checked one-sided denial and unique reciprocal connection. Discovery reported 16 passing groups, including the real mutual match, correct conversation and stale/closed visibility. | Pass |
| C-W4-T3 · Password and sessions | Wrong current password preserves the old credential. Valid replacement signs out the submitting session, another existing session remains signed in, future login accepts only the new password. | Two existing browser sessions plus a fresh login probe reproduced the complete rule, including English rejection and old/new credentials before and after change. All five `ChangePasswordTests` passed, including invalid input and access/CSRF checks. | Pass |
| C-W4-T4 · Activities | Search returns matching future events, Save and RSVP are account-specific, cancellation works, and capacity rejection leaves attendance intact. | All seven `EventFlowTests` passed. Search combined title/city/category and excluded past listings. At capacity the third account got 409 and count remained two. Save/unsave and RSVP/cancel were verified. The isolated motion retest also confirmed visible Save/RSVP feedback, no success replay after refresh/cancel, and reduced-motion operation. | Pass via capacity boundary; direct past-event POST unexercised |
| C-W4-T5 · English delivery | English labels and messages, switch hidden, user-entered text retained even with Chinese browser preference and `?lang=zh`. | The JAR run with `TONGPIN_CHINESE_ENABLED=false` returned `lang=en`, English headings and an English wrong-password message. Language links were absent. The Chinese display name and bio survived restart unchanged. | Pass for this launch configuration |
| C-W4-T6 · Safety, retry, recovery | Privacy boundaries and no duplicate retry; reference actual recovery evidence and identify pending independent work. | Four `ReportPermissionRegressionTests` plus core contact/safety checks passed. Ten conversation groups and eight retry groups passed, including readable 390 px states, unread ownership, history, explicit same-identity retry and late polling confirmation. F's Windows evidence records successful checksummed restore with seeding disabled, and its JAR digest equals this run's. Current macOS work repeated clean build and restart. | Safety/retry pass; named independent human restore pending |

[Sanitised command output and counts](evidence/C_acceptance_results.txt) · [Failures and separate retests](C_defect_and_retest.md) · [F's recovery record](F_recovery_record.md) · [CI for the tested main](https://github.com/hansu650/thematic-friend-finder/actions/runs/44889287286)

### Browser captures

- [English wrong-password feedback at an emulated 390 px](images/C_wrong_password_390.png), C-W4-T3/T5. The form cleared credential inputs and an independent login confirmed the old credential still worked.
- [Saved profile after a full restart](images/C_profile_after_restart.png), C-W4-T1/T5. The English interface shows the unchanged fictional Chinese display name and biography.

## Reproduction

Run from `code/thematic-friend` with `JAVA_HOME` set to JDK 21 and `MINGLE_BROWSER_PATH` set to a local Chromium executable. The account runner forces English mode and uses a fresh database on loopback. The shared browser suites exercise the standard development mode.

```bash
export MAVEN_USER_HOME="$PWD/.cache/maven"
sh ./mvnw --batch-mode --no-transfer-progress clean package
shasum -a 256 target/thematic-friend-0.0.1-SNAPSHOT.jar
npm ci --prefix scripts/profile-browser
export MINGLE_PLAYWRIGHT_MODULE="$(node -p "require('node:url').pathToFileURL(require('node:path').resolve('scripts/profile-browser/node_modules/playwright/index.mjs')).href")"
node scripts/profile-browser/run-account-acceptance.mjs
node scripts/profile-browser/run-profile-check.mjs
node scripts/browser/run-discovery-check.mjs
node scripts/conversation-browser/run-conversation-check.mjs
MINGLE_CHECK_SCRIPT=retry-check.mjs node scripts/conversation-browser/run-conversation-check.mjs
node scripts/motion-browser/run-motion-check.mjs
```

The Maven suite reused 77 existing tests. C's additional account runner validates actual browser sessions on a running file-backed JAR and a complete process restart. The B-04 adjustment uses native keyboard type-ahead and verifies the live preview update. Full raw logs and disposable databases are under `.local/w4-c` in the local checkout. Shared excerpts omit local paths and private server output. All tests used fictional accounts. Human usability, physical mobile, real screen-reader and team sign-off evidence remain pending.
