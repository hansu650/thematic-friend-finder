# C account work — local draft

Date: 2026-11-09. Source base: remote main `d2ad598` fetched on 2026-11-09, plus uncommitted local changes in this extracted working copy. The dated task package claims PR #8; the fetched main head was PR #7, so reconcile the baseline with A before integration. This directory is not a Git checkout.

## Changes and provisional session policy

Added an authenticated change-password form, a current-password check, new-password and confirmation validation (including the bcrypt UTF-8 byte limit), and a BCrypt update using the configured encoder. Identity comes from the authenticated principal. Success invalidates the current session and redirects to login. Other sessions are not invalidated. Tao confirmed on 2026-11-09 that only the current device should be signed out. Communicate this decision to A/E before integration; team acknowledgement is not yet recorded. No shared entity fields or role contracts were added. AI-assisted draft; Tao must review and understand the code and verify the work personally.

## Verification

2026-11-09, macOS, OpenJDK 25.0.1, Spring Boot 4.1.2, in-memory H2. Command from `code/thematic-friend`:

```sh
bash mvnw -s /tmp/c-accounts-maven-settings.xml --batch-mode --no-transfer-progress test
```

The temporary settings file mirrored Maven repositories to `https://repo.maven.apache.org/maven2`; it is a local run aid, not a change to project build configuration. Exit code 0; 24 tests passed, zero failures/errors/skips, including five new tests in `ChangePasswordTests` and 19 existing tests. See [actual output](./evidence/C_maven_test_2026-11-09.log).

- C-01: new password matches stored hash, old password fails, new password signs in; actual current session becomes invalid.
- C-02: wrong current password returns a field error and stored hash remains identical.
- C-03: blank, short, 65-character, over-72-byte and mismatched new passwords are rejected without changing the hash.
- C-04/C-05: anonymous GET requires login, missing CSRF is rejected, submitted other-user ID does not change that account; an error response does not contain the submitted new password. Further tests and peer review are still needed.
- C-06: current-session invalidation tested, existing automated suite passes. A two-session integration test confirms that the second session remains signed in. Persistence after restart and browser verification remain pending.

Java 21, desktop/mobile UI captures, real PR and Trello status, B review and team integration have not been verified. The test output is not a substitute for screenshots or personal review. No meeting, agreement, PR or contribution by a person is asserted here.
