# Mingle candidate package

This is a review candidate with fictional demo data. Teammate acceptance, material-use decisions and final sign-off are recorded separately; this package does not claim them.

## Run on Windows with Java 21

Extract the entire package to a writable folder. No Maven, Node.js or IDE is needed to run its JAR. In PowerShell from that folder:

```powershell
.\Start-Mingle.ps1 -Check
.\Start-Mingle.ps1 -NewData
```

If PowerShell's policy blocks a locally trusted script, use a process-only invocation such as `powershell -NoProfile -ExecutionPolicy Bypass -File .\Start-Mingle.ps1 -Check`; do not change machine-wide policy. Set `JAVA_HOME` if your JDK 21 is not found.

The launcher verifies the JAR/source archive against `candidate.json`, binds to `127.0.0.1:8080`, forces English and asks for a local demo password. Open [Mingle](http://127.0.0.1:8080/login) and use `demo_zhou` or `demo_lin` in separate browser sessions. Passwords are not included in the package or printed. A port conflict is reported without stopping another application; use `-Port 8081` if needed.

Data defaults to `data` beside this script, regardless of the current terminal directory. `-NewData` rejects an existing directory. To restart the same database, omit `-NewData` and use the same password:

```powershell
.\Start-Mingle.ps1
```

An explicit `-DataDirectory 'D:\path\to\chosen-data'` overrides that package-local path. Relative data paths resolve beside this script. Do not select the team's old database for a fresh run. Existing account passwords and text are preserved; English mode does not translate old content. Stop the process with Ctrl+C before backing up or copying its H2 files.

## Record what you tested

Record `sourceCommit` from `candidate.json`, your actual JAR SHA-256, date, operator, environment, launch/data settings, steps and actual results. A rebuild from `source.zip` may produce different JAR bytes; identify it as a local rebuild. The distributed JAR must match the supplied checksum. `SHA256SUMS.txt` covers the package files.

`source.zip` contains the committed application under `code/thematic-friend/`, including source, tests, Maven Wrapper and instructions. It excludes ignored runtime data and caches. To rebuild, extract it, open that application directory and run `scripts/build.ps1` with Java 21; dependency resolution may need network access. `build.log` records the package build. The manifest explicitly states whether tests ran in that build or were referenced from an earlier verified run.

The app uses local fictional data and has no automatic chat replies. It has no production moderation service, account recovery, self-service deletion or end-to-end message encryption. Current assets and fonts still require the team's itemised review before the final demonstration. Send no passwords, raw databases, personal reports or student IDs to the public repository.
