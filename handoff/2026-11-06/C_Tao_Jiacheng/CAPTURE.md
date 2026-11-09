# C Tao Jiacheng Capture Real Evidence

Keep the visible terminal/editor context and actual results. These instructions do not predeclare a passing result. Use fictional accounts and save your screenshots under code/thematic-friend/docs/progress/week2/images/. [EVIDENCE.md](./EVIDENCE.md) describes process evidence.

## Java tests

After following RUN.md, run this in code/thematic-friend in PowerShell. Use your own JDK 21. If working in Git, commit the feature/tests before the final run or record any uncommitted changes explicitly.

~~~powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$evidenceDir = Join-Path $PWD ("docs/progress/week2/evidence/C-" + $stamp)
New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
New-Item -ItemType Directory -Path 'docs/progress/week2/images' -Force | Out-Null
Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'
& "$env:JAVA_HOME\bin\java.exe" --version
$env:MAVEN_USER_HOME = Join-Path $PWD '.cache/maven'
$mavenRepo = Join-Path $env:MAVEN_USER_HOME 'repository'
.\mvnw.cmd --batch-mode --no-transfer-progress "-Dmaven.repo.local=$mavenRepo" package 2>&1 | Tee-Object -FilePath (Join-Path $evidenceDir 'java-output.txt')
$javaExit = $LASTEXITCODE
"Java exit code: $javaExit" | Tee-Object -FilePath (Join-Path $evidenceDir 'java-exit.txt')
Read-Host 'Capture the real result with Win+Shift+S, then press Enter'
~~~

Keep Tests run, BUILD SUCCESS/FAILURE and the exit code visible. Save as **C_java_terminal.png**. A second capture of the command/source is useful if they do not fit. In a Git checkout, record git rev-parse HEAD and git status --short in the progress report; in this ZIP, identify the package manifest instead.

The untouched ZIP has 19 existing Java tests. New checks may change that number. A's 31-test screenshot is an example of A's run, not an expected result to copy. Preserve an actual failure and successful retest if a defect occurs.

## Feature-specific checks

Run the tests you add for [your six scenario groups](./TESTS.md) and record their exact command, dependency versions and exit code. B/D need browser or two-session coverage; C/E need negative permission cases; F needs disposable backup/restore process checks. Add runnable test code with the feature. Existing A discovery checks cover discovery only. Agree an optional browser-test setup with A/F and document it before asking someone else to run it.

Capture the normal result and a meaningful boundary/error result as **C_normal.png** and **C_boundary.png**. Add browser/process output when the Java suite does not exercise the assertion. Use the current behaviour, not staged success text.

## Your PR and checks

After pushing, open your own PR in GitHub. Capture its branch, current revision and Checks state. If GitHub CLI is already installed and signed in, this optional command reads your PR:

~~~powershell
$prNumber = [int](Read-Host 'Enter YOUR feature PR number')
gh pr view $prNumber --repo hansu650/thematic-friend-finder --json url,headRefName,headRefOid,state,isDraft
gh pr checks $prNumber --repo hansu650/thematic-friend-finder
$checksExit = $LASTEXITCODE
"Checks command exit code: $checksExit"
Read-Host 'Capture the actual status, then press Enter'
~~~

Use **C_github_checks.png**. Read the displayed status: pending/failed checks stay pending/failed. Do not substitute A's PR number. A screenshot of passing CI is not independent review.

## Trello and code explanation

Capture your own card when work starts and when you submit for review, with its actual status and PR link. Team weekly photos and a full-board capture are shared process evidence.

Qin Tian has two editor screenshots for A's explanation. **B–F do not need code screenshots.** Link your changed files and explain the important behaviour in your progress MD. Code and executable tests must still be committed. Use relative image links, for example `![C test result](./images/C_java_terminal.png)`, only after the real file exists in your progress directory.
