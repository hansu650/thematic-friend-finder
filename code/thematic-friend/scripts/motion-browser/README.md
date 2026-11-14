# Motion browser verification

This runner observes the five motion effects while exercising real save, match and chat requests. It uses a fresh local H2 database, a random loopback port and generated fictional-account credentials. It does not connect to an existing preview or production database.

From the application directory, use Java 21 and an existing Node.js installation:

    ./mvnw --batch-mode --no-transfer-progress package
    npm ci --prefix scripts/profile-browser
    npx --prefix scripts/profile-browser playwright install chromium
    node scripts/motion-browser/run-motion-check.mjs

On Windows, use mvnw.cmd or scripts/build.ps1 for packaging. The existing profile-browser package pins the shared Playwright dependency; no separate package installation is needed if it is already available.

Optional environment overrides:

- JAVA_HOME: Java 21 installation.
- MINGLE_PLAYWRIGHT_MODULE: module specifier or absolute file URL of an installed Playwright module.
- MINGLE_BROWSER_PATH: existing Chromium/Edge executable.
- MINGLE_TEST_JAR: an already packaged application JAR.
- MINGLE_TEST_OUTPUT: parent directory for a newly created, isolated run folder.
- MINGLE_CAPTURE_MODULE: optional screenshot helper exporting captureScreenshot.

The seven groups cover staggered entry, physical drag return, real mutual-match animation at 390/320 px, sender/receiver message arrival without poll replay, save success versus denied/unsave/reload cases, both reduced-motion settings, and browser/server errors. The result records the tested JAR hash, runtime, checks and captures. The runner stops its own server and browser and retains the evidence and test database in its run folder.

Automated browser evidence is not independent teammate review or user acceptance.
