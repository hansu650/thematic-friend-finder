# Run the Mingle Source

Use JDK 21 and a complete extracted source tree or Git checkout. The first Maven build needs network access. The website runs with Java, Thymeleaf, CSS and JavaScript together; Node.js is not needed to start it.

1. Open code/thematic-friend as a Maven project in IntelliJ IDEA. Select your JDK 21.
2. Run com.example.thematicfriend.ThematicFriendApplication with that project directory as the working directory.
3. Open http://127.0.0.1:8080/, or the actual console address. Create fictional accounts.

## Windows command line

Open PowerShell in code/thematic-friend. In IntelliJ IDEA, Project Structure shows the selected JDK home (the folder containing bin/java.exe). If JAVA_HOME is not configured, set it for this terminal using your own installed JDK path. The path below is an example to replace:

~~~powershell
$env:JAVA_HOME = 'D:\Tools\jdk-21'
~~~

Verify the selected Java version before building:

~~~powershell
& "$env:JAVA_HOME\bin\java.exe" --version
$env:MAVEN_USER_HOME = Join-Path $PWD '.cache/maven'
$mavenRepo = Join-Path $env:MAVEN_USER_HOME 'repository'
.\mvnw.cmd --batch-mode --no-transfer-progress "-Dmaven.repo.local=$mavenRepo" package
~~~

Continue only when Maven exits 0. The package goal includes tests. Start the built application:

~~~powershell
& "$env:JAVA_HOME\bin\java.exe" -jar .\target\thematic-friend-0.0.1-SNAPSHOT.jar
~~~

Keep the terminal open; Ctrl+C stops that application. A second process needs a different port and data directory. Stop the application before rebuilding its JAR on Windows. Default data is .local/data; use the same working directory to retain it. Each person's localhost address and H2 data are separate.

The included scripts/run-demo.ps1 prompts for a local fictional-account password. Existing demo accounts retain their initial password. Avoid including passwords in screenshots or commits. Use demo_zhou and demo_lin in separate sessions for matching/chat checks.

English is the default; the development switch is temporary. At final freeze, English-only operation is selected with TONGPIN_CHINESE_ENABLED=false and verified.

This ZIP's Java source is the merged 19-test baseline. A's later 31-test discovery increment and optional Playwright checks are on PR #9; use the canonical Git checkout after accepted changes reach main. Reusing A's smoke checks does not replace your new feature tests. See [CAPTURE.md](./CAPTURE.md), [baseline README](./code/thematic-friend/README.md) and [contracts](./code/thematic-friend/docs/CONTRACTS.md).
