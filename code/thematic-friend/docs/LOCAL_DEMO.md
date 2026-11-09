# Local demo, accounts and tests

Run these commands from `code/thematic-friend` in PowerShell with JDK 21.

## Open the website

```powershell
.\scripts\run-demo.ps1
```

Open [http://127.0.0.1:8080/login](http://127.0.0.1:8080/login). If the website is already running, open the address directly. The launcher reports an occupied port and leaves the existing application running.

After pulling updated source, stop your running demo and rebuild before starting it:

```powershell
.\scripts\run-demo.ps1 -Rebuild
```

The rebuild runs the existing Java tests and packages the current source. Leave the terminal open while using the website; Ctrl+C stops a demo started in that terminal.

## Keep the same accounts

The launcher chooses the H2 data directory in this order:

1. An explicit `-DataDirectory` argument.
2. `APP_DATA_DIR` in the current environment.
3. The `data` path recorded in the optional local `.local/mingle-demo-runtime/server-state.json`.
4. `.local/data` in this Java project.

Relative paths are resolved from this Java project, regardless of the shell's starting directory. A missing database in a saved runtime record causes a clear error instead of silently creating an empty replacement. The runtime record is local and is not shipped in Git.

To select a separate demo database explicitly:

```powershell
.\scripts\run-demo.ps1 -DataDirectory '.local\demo-data'
```

`demo_zhou`, `demo_lin`, `demo_xu`, `demo_chen`, `demo_he` and `demo_su` are fictional seed accounts defined in `DemoData.java`. The first startup of a new database creates them using the password you choose. Later startups preserve their passwords, profiles, likes and messages. Entering a different startup password does not reset an existing account. Passwords and database files stay outside Git.

Changing only the port does not move or replace a database. To move an existing local demo from 8081 to 8080, stop its previous process and start the demo on 8080 with the same data directory. Keep a database backup before changing the application version. Localhost accounts on another teammate's computer or a separately deployed database are independent records.

## Try the shared flow

Use a normal browser window for `demo_zhou` and a private window for `demo_lin`. Both windows can use port 8080. Check profile editing, filters and likes, a mutual match, messages, recipient-only unread indicators, opening a conversation to clear unread state, and ending a connection. Existing likes and messages remain between sessions.

## Run automated checks

```powershell
.\scripts\build.ps1
node scripts/browser/run-discovery-check.mjs
node scripts/conversation-browser/run-conversation-check.mjs
```

The browser commands require the optional setup described in the [discovery checks](../scripts/browser/README.md) and [conversation checks](../scripts/conversation-browser/README.md). They use temporary ports, fresh fictional accounts and separate databases. Java tests use an in-memory database. Keep these destructive test flows separate from the persistent demo on 8080.

Before merging a feature PR, check Java CI, run the browser suite for the affected feature and obtain the assigned peer review. After the merge, pull `main` and use `-Rebuild` for the local demo. Automated results do not establish independent peer review.
