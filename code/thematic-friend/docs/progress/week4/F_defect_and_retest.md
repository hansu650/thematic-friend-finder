# F | Defect and retest record

The real H2 exercise and PowerShell fixture suite passed the recovery and refusal checks on the tested release. The four expected refusal cases were recorded as passing tests. [H2 evidence](evidence/F_h2_results.json)

## F-W4-BUILD-01 · Java options banner interrupts the build helper

- **Observed by Codex on 20 November 2026.** The initial shell set `JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8`. The helper exited 1 because it treated the JVM banner `Picked up JAVA_TOOL_OPTIONS` as the Java version. The JDK was 21.0.4.
- **Action.** Remove the optional override in the build shell and document the workaround in the handover. The task build uses the standard environment.
- **Retest.** `./scripts/build.ps1` on the same revision built and packaged the JAR with 77 tests passing and exit 0. Record the workaround when reproducing from a shell that supplies JVM options. [Build output](evidence/F_build_and_fixture_results.txt) · [Operations handover](../../OPERATIONS_HANDOVER.md)
