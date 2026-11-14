# Mingle Spring Boot Web Prototype

Mingle is a browser-based friendship prototype for a six-person thematic project. It uses **Java 21, Spring Boot 4.1.2, Thymeleaf, Spring Security, JPA and a file-based H2 database**. Java, HTML, CSS and JavaScript live in this one project; IntelliJ IDEA runs the application and a browser displays it.

Qin Tian (A) is the **Scrum Master and Lead Developer**; Tao Jiacheng (C) is the **Product Owner**. Wang Yikai, Zhou Ziyue, Wu Zhuoda and Song Peitong are Developers. Qin Tian is the primary technical contributor; he and Tao Jiacheng both participated in topic selection. The starting implementation and current shared interface are **A's AI-assisted work**. Team members retain their documented increments in the [team plan](../../team-plan/README.md) and [workload allocation](../../team-plan/11_workload_balance.md). This project is not an Alovoa fork. See [baseline and contribution boundaries](docs/BASELINE.md).

## Run in IntelliJ IDEA

1. Open this directory as a Maven project and select JDK 21.
2. Let Maven resolve the existing dependencies.
3. Run `com.example.thematicfriend.ThematicFriendApplication`.
4. Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/). Create fictional accounts to try the flow.

The startup console now prints **Open in your browser: ...** with the actual port. Each teammate can use the same address on their own computer: `127.0.0.1` means this computer, so accounts, messages and the H2 database are separate. To run a second copy on the same computer, use another port, such as `--server.port=8081`, and a separate working/data directory. Sharing source code does not create one shared hosted website.

The default run creates no demo users. The database is stored under `.local/data/` relative to the working directory. Keep the working directory set to this project so that restarting uses the same database.

## Build and run a JAR

On this Windows machine, the supplied helper can use the existing JDK at `D:\kaifagongju\Java\jdk-21.0.12.1-hotspot`. On another machine, set `JAVA_HOME` to an installed JDK 21.

```powershell
.\scripts\build.ps1
java -jar target\thematic-friend-0.0.1-SNAPSHOT.jar
```

If `java` is not on PATH, use `& "$env:JAVA_HOME\bin\java.exe" -jar ...`. The build script runs tests and packages the application. Its `-SkipTests` option is for rebuilding a version whose tests have already passed. Stop a running JAR before rebuilding on Windows, because the file may be locked.

Maven Wrapper is included. Dependencies stay in `.cache/maven/repository`; the helper also keeps the wrapper distribution cache under `.cache/maven`. An initial build needs access to the configured Maven repositories. No Node.js build is required for the website.

## Fictional demo on port 8080

```powershell
.\scripts\run-demo.ps1
```

Open [http://127.0.0.1:8080/login](http://127.0.0.1:8080/login). The helper reuses a saved local demo database when available, so moving from port 8081 to 8080 keeps the same accounts and messages. An explicit `-DataDirectory` or `APP_DATA_DIR` takes priority; otherwise a fresh checkout uses `.local/data`. It reports an occupied port without stopping another application.

The helper asks for a local demo password unless `TONGPIN_DEMO_PASSWORD` is already set. Use 10-64 characters, no more than 72 UTF-8 bytes. The demo profile seeds six fictional accounts: `demo_zhou`, `demo_lin`, `demo_xu`, `demo_chen`, `demo_he` and `demo_su`. Use normal and private browser windows on the same port to try mutual likes and messages.

Existing demo accounts keep the password used when first created; setting another startup password does not reset them. Profiles, likes and messages remain in the chosen H2 database. Passwords and runtime databases stay outside Git.

For the current reference interface and two-account chat review, run `.\scripts\run-demo.ps1 -SeedConversations`. This opt-in adds 22 fictional profiles (28 in total) and three mutual connections with short sample histories. Sign in as `demo_zhou` in a normal window and `demo_lin` in a private window, open **Messages**, and reply to each other. Messages are saved to H2; there are no automatic replies. Existing profiles, decisions, blocked people and ended connections are preserved, so an already-reviewed database can differ from a fresh demo. Demo mode also supplies 18 local activity fixtures with topic-specific photographs. Missing fixtures are added individually; existing activities, dates, attendance and saves are preserved. The [experience review notes](docs/EXPERIENCE_REVIEW.md) cover the controls and checks.

After pulling updated source, stop the previous demo and run `.\scripts\run-demo.ps1 -Rebuild`. This runs the existing Java tests and packages the current code. See [local demo, account and test instructions](docs/LOCAL_DEMO.md) for the data-directory selection order and automated test environments.

## English and temporary Chinese interface

English is the default, including when the browser prefers Chinese. The **language switch** changes the interface language and keeps the choice in the current session. User-entered names, bios and messages are not automatically translated. Interest and activity values are stored in English; only their interface labels change.

For an English-only final run, set `TONGPIN_CHINESE_ENABLED=false`. This hides the switch and forces English, even when a request includes `?lang=zh`. The Chinese message bundle and reference planning files are retained during development.

## Main configuration

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | Local HTTP port |
| `APP_BIND_ADDRESS` | `127.0.0.1` | Bind address |
| `APP_DATA_DIR` | `./.local/data` | H2 data directory |
| `APP_DB_PASSWORD` | empty for the local prototype | H2 database password |
| `TONGPIN_DEMO_PASSWORD` | unset | Required only when the `demo` profile creates demo accounts |
| `TONGPIN_CHINESE_ENABLED` | `true` | Temporary Chinese interface availability |

Do not change database credentials for an existing database without planning the corresponding database change. Keep the H2 console disabled. The default is one local application instance; this is not a production hosting configuration.

## Checks and handover

The [14 November integrated verification](docs/releases/2026-11-14-main-verification.md) covers local main `7764f0e`, including B's merged PR #16: **66 Java tests, 40 browser groups, four real-H2 recovery groups and six backup-tool groups passed**. The backup suite explicitly skips its duplicate Maven invocation. Local fixes make UTF-8 manifests restorable in Windows PowerShell and correct three test-runner assumptions. The script fixes and evidence are included in this release change. See the [ten-page design and six-week Gantt pack](docs/design/README.md) or its [browser gallery](docs/design/index.html).

The [integrated release record](docs/releases/2026-11-13-reference-ui.md) reports 66 passing Java tests, seven reference-browser groups and ten conversation-browser groups, plus the runtime fixture checks. The current 13 November interface follows the user's Bumble, Feeld, Hinge and Meetup references. See [current UI and verification notes](docs/EXPERIENCE_REVIEW.md). The current acceptance command is `node scripts/reference-browser/run-reference-check.mjs`, using isolated data and two browser accounts. The earlier Momo/Planet review and UI runners describe superseded visual revisions.

For actual terminal screenshots, use [the live PowerShell evidence workflow](docs/TERMINAL_EVIDENCE.md). It executes Maven/browser checks and pauses for the person taking the screenshots. Formatted HTML reports are not terminal evidence.

A's 6 November discovery increment adds visible filter chips/counts, useful empty-result recovery and participant-only match feedback. See [A's progress and evidence](docs/progress/week2/A_progress.md). The optional [browser checks](scripts/browser/README.md) run against disposable data; they are separate from the Java-only website startup.

The second A increment retains valid filters on error recovery, refreshes discovery after a cached history return and announces pending decisions. Shared-route integration checks and [concrete owner-review proposals](docs/INTEGRATION_PLAN.md) prepare the next merge work. Use [A's next capture guide](docs/A_NEXT_CAPTURE.md) for fresh terminal and product evidence.

Run tests from the project directory with `mvnw.cmd test` using JDK 21. The build helper is the simplest way to keep the task's Maven cache settings consistent. See [verification](docs/VERIFICATION.md), [routes and data contracts](docs/CONTRACTS.md), [reference/licence record](docs/THIRD_PARTY.md) and [A's baseline](docs/BASELINE.md).

D's unread/history work (PR #10), C's password change (PR #11), F's backup/restore tools (PR #13) and E's staff report review (PR #14) are integrated. Staff routes require the STAFF authority; the staff member ID is configured explicitly through app.review.staff-member-id. This local revision also includes password change, the event/people discovery feed, event creation/search/RSVP/saves, optional demo conversations, local stock portraits, emoji and original stickers. It does not provide profile photo uploads, a staffed moderation service, account recovery, self-service deletion or end-to-end message encryption.

## Stopped-database backup and restore

Stop the application before copying its H2 files. The backup helper writes a timestamped directory under `.local/backups`, copies the database files, and records each file's size and SHA-256 checksum in `manifest.json` plus a checksum for that manifest in `manifest.sha256`:

```powershell
.\scripts\backup.ps1
```

Use explicit paths for a disposable fixture or a different data directory:

```powershell
.\scripts\backup.ps1 -DataDirectory .\fixture\data -BackupRoot .\fixture\backups
.\scripts\restore.ps1 -BackupDirectory .\fixture\backups\backup-20261113-120000000 -Destination .\fixture\restored
```

Restore validates the manifest and every payload checksum before writing. It refuses a missing or corrupt backup, unsafe relative paths, a destination inside the backup, and any destination that already exists. The destination is assembled in a temporary sibling directory and moved into place only after all files have been copied. Keep the restored directory separate and start the application with `APP_DATA_DIR` pointing at it.

Run the executable runtime checks from the project directory:

```powershell
.\scripts\tests\BackupRestore.Tests.ps1
```

The runner uses fictional fixture records for a profile pair, connection and message, exercises backup/restore failure paths, and runs the Maven integration suite for restart/persistence coverage. Add `-SkipBuild` when Maven has already been verified and only the PowerShell checks need to be repeated. Add `-KeepArtifacts` to retain the isolated test directory for review.
