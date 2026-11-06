# Run the Included Baseline

This is a source package, with Java, Thymeleaf, CSS and JavaScript together. Install/use JDK 21 and an IDE such as IntelliJ IDEA. The first Maven build needs network access; caches and databases are deliberately not bundled. No Node.js frontend build is needed.

1. Fully extract the ZIP. Open **code/thematic-friend** as a Maven project.
2. Select your installed JDK 21 and let Maven resolve the dependencies.
3. Run **com.example.thematicfriend.ThematicFriendApplication**, with the working directory set to **code/thematic-friend**.
4. Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/). Create fictional accounts.

## Windows command line

From **code/thematic-friend**, set JAVA_HOME to your own installed JDK 21 if it is not already set. Then run:

```powershell
.\mvnw.cmd --batch-mode --no-transfer-progress test
.\mvnw.cmd --batch-mode --no-transfer-progress package
& "$env:JAVA_HOME\bin\java.exe" -jar target\thematic-friend-0.0.1-SNAPSHOT.jar
```

The existing **scripts/build.ps1** helper combines tests and packaging. **scripts/run-demo.ps1** builds if needed, prompts for a local demo password and starts fictional demo users. Use demo_zhou and demo_lin in separate browser sessions; existing demo users retain their initial password.

To use another port, append **--server.port=8081** to the JAR command. Stop your running app before rebuilding its JAR on Windows. Data is created under **.local/data** in the project; restart from the same directory to keep it.

English is the default. The temporary EN/Chinese switch remains during development. Final English-only operation is available with **TONGPIN_CHINESE_ENABLED=false**.

See the included [baseline README](./code/thematic-friend/README.md), [contracts](./code/thematic-friend/docs/CONTRACTS.md) and [verification scope](./code/thematic-friend/docs/VERIFICATION.md). B–F features listed in the task are planned additions, so their screens/scripts will not exist until you implement them.

## Which address should I open?

Open **http://127.0.0.1:8080/** after startup. The last console lines print the actual browser address. The same address on six computers opens six separate local copies: accounts, messages and H2 files are not shared. On one computer, a second process needs a different port, such as **--server.port=8081**, plus its own working/data directory. Sharing source code is not a shared public deployment.
