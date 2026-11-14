# Motion verification evidence

These are normalized copies of actual local run outputs. Machine paths and generated framework test passwords, if present, are replaced with placeholders. Assertions, failures, exit status and source hashes are retained. [manifest.json](./manifest.json) records original and published SHA-256 values; original bytes and all captures remain in the local evidence archive.

The first overflow failure and the subsequent transition cancellation failure are retained with the successful final and portable-runner retests. The final result contains seven groups. The portable runner validates the same packaged application and adds its JAR hash/runtime to the result; it does not count as seven additional distinct feature groups.

The reference suite ran before the final pointer-release and denied-POST transition corrections. Discovery was rerun after the pointer correction. The final motion inspection and portable runner include all corrections. Java tests were explicitly skipped for local packaging; the pull request CI separately executes the Java and Windows recovery jobs. CI results belong to their actual GitHub run.

Capture lists describe the original run folders; only the two selected, unmodified PNGs linked in the release report are included here. No local database, cookie, credentials or server log is published. These are Codex automated checks, not independent teammate acceptance.
