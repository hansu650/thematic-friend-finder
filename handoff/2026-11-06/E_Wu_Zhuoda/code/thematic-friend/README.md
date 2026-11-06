# Mingle Spring Boot Web Prototype

Mingle is a browser-based friendship prototype for a six-person thematic project. It uses **Java 21, Spring Boot 4.1.2, Thymeleaf, Spring Security, JPA and a file-based H2 database**. Java, HTML, CSS and JavaScript live in this one project; IntelliJ IDEA runs the application and a browser displays it.

The existing implementation is **A's AI-assisted baseline**. B–F own distinct new increments in the [team plan](../../E_Wu_Zhuoda_TASK.md) and [workload allocation](../../TEAM.md). This project is not an Alovoa fork. See [baseline and contribution boundaries](docs/BASELINE.md).

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

## Optional fictional demo accounts

```powershell
.\scripts\run-demo.ps1
```

The helper asks for a local demo password unless `TONGPIN_DEMO_PASSWORD` is already set. Use 10–64 characters, no more than 72 UTF-8 bytes. With the `demo` profile, six fictional accounts are added: `demo_zhou`, `demo_lin`, `demo_xu`, `demo_chen`, `demo_he` and `demo_su`. Try `demo_zhou` and `demo_lin` in separate browser sessions to explore mutual likes and messaging.

Seeding is idempotent: existing accounts and edited profiles are not overwritten. Existing demo accounts keep the password used when first created; setting another startup password does not reset them. Do not commit passwords or runtime databases. Use a separate `APP_DATA_DIR` for disposable experiments instead of deleting a database that contains work you want to keep.

## English and temporary Chinese interface

English is the default, including when the browser prefers Chinese. The **EN / 中文** control changes the interface language and keeps the choice in the current session. User-entered names, bios and messages are not automatically translated. Interest and activity values are stored in English; only their interface labels change.

For an English-only final run, set `TONGPIN_CHINESE_ENABLED=false`. This hides the switch and forces English, even when a request includes `?lang=zh`. The Chinese message bundle and reference planning files are retained during development and can be removed during the final release cleanup.

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

Run tests from the project directory with `mvnw.cmd test` using JDK 21. The build helper is the simplest way to keep the task's Maven cache settings consistent. See [verification](docs/VERIFICATION.md), [routes and data contracts](docs/CONTRACTS.md), [reference/licence record](docs/THIRD_PARTY.md) and [A's baseline](docs/BASELINE.md).

Backup/restore tools, password change, unread/history UI, staff report review and live profile preview are reserved for B–F. They are not implemented in this baseline. The current application has no live moderation, account recovery, self-service deletion, real profile photos or end-to-end message encryption.
