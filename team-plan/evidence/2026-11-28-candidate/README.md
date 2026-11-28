# 28 November 2026 — integrated review candidate

Status: **prepared for team acceptance; not a frozen final release**. Qin Tian authorised Codex to merge verified increments and perform technical integration. The checks and screenshots below were produced by Codex; they do not record B–F's observation, review or acceptance.

## Exact candidate identity

| Field | Recorded value |
| --- | --- |
| Source commit | `85a03f96e7c13937663762473070c5bcc7b0c6a9` |
| Application tree (`code/thematic-friend`) | `72fd3fcef18b27dffe599b228f5f6e6a471364cc` |
| Candidate folder | `Mingle-RC-85a03f96e7c1-20261128-205517670` |
| JAR | `mingle.jar` |
| JAR SHA-256 | `fbfac88545abf1b56b44f9249d8ef2e45d0e0cb50b3ccd19dbbc355ddc365273` |
| Archived application source SHA-256 | `c659422d5e7a94d09e4dee7c19c8ae4e9c2fa4cd5065d6bbc46771505eeb77ad` |
| Distribution ZIP SHA-256 | `126167de65212edd8dc53d6d410a0839acf37cf9536aedec804bf92f485caa2f` |
| Distribution ZIP size | 94,065,697 bytes |
| Build Java | OpenJDK 21.0.12.1, Windows |
| Runtime policy | `demo` profile; English forced; loopback `127.0.0.1`; default port 8080; selected local data directory |

The [generated manifest](./candidate.json) records the actual build command, identity and configuration. The [bundle checksums](./bundle-SHA256SUMS.txt) apply to files inside the extracted distribution bundle, not this evidence directory. The ZIP was created locally for Qin Tian to distribute; no team message or binary GitHub release is claimed. The source and launcher are available at the [recorded Git revision](https://github.com/hansu650/thematic-friend-finder/tree/85a03f96e7c13937663762473070c5bcc7b0c6a9). A later documentation-only commit does not require changing this candidate identity.

## Integration and checks

- [#26](https://github.com/hansu650/thematic-friend-finder/pull/26) merged the recovery/UI increment while preserving B's #25 and D's #21. Its [dated record](../../../code/thematic-friend/docs/releases/2026-11-28-a-recovery.md) contains 79 Java tests and 21 targeted browser checks at that submitted revision.
- [#27](https://github.com/hansu650/thematic-friend-finder/pull/27) merged A's dated evidence and integration instructions.
- [#28](https://github.com/hansu650/thematic-friend-finder/pull/28) added archive-based packaging, checksums, English startup and candidate CI.
- [#29](https://github.com/hansu650/thematic-friend-finder/pull/29) fixed Java version validation in a fresh PowerShell process. Its added regression failed before the fix and passed afterwards.

The first real package from `44e0645` was **rejected before distribution**: selecting the first Java output line inside the native pipeline could stop the pipeline before `LASTEXITCODE` was set. Capturing the complete process result before selecting the line fixed the check. This illustrates why a successful fixture check alone did not establish that a real package would launch.

The [merged-source CI run](https://github.com/hansu650/thematic-friend-finder/actions/runs/46146854821) completed successfully for the exact source above: `verify` ran **79 Java tests, zero failures/errors/skips**; `candidate-windows` passed **10 candidate groups**; `backup-windows` passed its existing checks. The local packaging command used `-SkipTests` with that explicit CI reference; tests were **not rerun during packaging**. A clean archived application was built, with build exit 0. The build log is included in the distribution ZIP.

The real packaged launcher was then exercised in local Edge, with a fresh fictional database, a random test password kept only in process memory and a free loopback test port. The browser locale was `zh-CN`; the query requested `lang=zh`; conflicting process settings requested Chinese and a different bind/data path. The launcher still selected English, loopback and the explicit test database.

| Check | Actual result |
| --- | --- |
| RC-START | The packaged JAR starts through `Start-Mingle.ps1`; a fictional account signs in; English is enforced and Chinese links are absent. |
| RC-DATA | All 18 seeded events have English title, description and location details in this new database. |
| RC-RESTART | After the owned launcher/Java process tree is stopped and restarted with the same selected data path, the same account and saved event remain; English is still enforced. |
| RC-ISOLATION | Only the selected test-data directory is created. The candidate contains no runtime database; the conflicting environment data path is not created. |

The final [machine-readable results](./smoke-results.json) record exit 0 and no page errors; [seeded event identities](./seeded-events.json) identify the checked records. This is a controlled forced-stop/restart check of one saved event, not a broad crash-recovery guarantee or F's independent reproduction. The in-app browser additionally displayed the English homepage at `?lang=zh` and followed Events to the English sign-in page. Its scope was navigation and appearance; authenticated checks used the separate local Edge test session.

## Actual candidate screenshots

The PNGs were captured in local Edge at 1440 × 1000 after fonts and finite entrance animations completed. They are automated engineering evidence on this candidate, not participant observations. Image paths are relative to this document.

![English events in the selected fresh candidate database](./images/candidate-events-english.png)

The event list uses the actual English records from the checked fresh database.

![The selected saved event after restarting the candidate](./images/candidate-saved-after-restart.png)

The selected saved event remains after restarting the same candidate with the same test database.

## Start and return evidence

Extract the whole candidate ZIP. From its folder, run `powershell -ExecutionPolicy Bypass -File .\Start-Mingle.ps1 -Check`. For the first real run, use `powershell -ExecutionPolicy Bypass -File .\Start-Mingle.ps1 -NewData`. The launcher requests a local demo password; keep it out of evidence, GitHub and recordings. Sign in as `demo_zhou` or `demo_lin`. For a restart, omit `-NewData` and retain the same data directory and account password.

Port 8080 is the default classroom entry point. If it is already occupied, choose an unused `-Port` and record it; the launcher does not stop the other service. A custom relative `-DataDirectory` resolves beside the extracted candidate, not against the terminal's working directory. An existing directory is rejected when `-NewData` is used. The [standalone guide](../../../code/thematic-friend/docs/CANDIDATE_README.md) contains the full procedure.

B–F must record the actual commit, JAR checksum, configuration, date, operator, scope and findings they used. A locally rebuilt JAR may have different bytes; identify it explicitly rather than copying the distributed JAR checksum. Original classroom data and the earlier working directory were preserved. No existing 8080 service was replaced by this test.

## Still pending

| Owner | Required real input / next action |
| --- | --- |
| B | User observation, actual keyboard/mobile scope, and scoped review of A. |
| C | Product decisions and acceptance of this combined candidate. |
| D | Candidate chat delivery/retry findings. |
| E with C | Permission/defect evidence and itemised material provenance/use conclusions; A then makes the actual keep/replace/omit/obtain-evidence decisions. |
| F, reviewed by A | Independent build, restart/recovery and handover evidence. |
| A | Personal action/understanding, genuine reflection and PDP baseline; integration of returned findings; final freeze and team video. |

The [English speaking outline](../A_W6_demo_outline.md) supplies sourced facts for A's contribution. The final video, MMUTube access check and six individual reports/submissions remain pending. See the [integration handover](../../19_A_integration_handover.md) for ownership and the [dated evidence register](../A_2026-11-28.md) for reflection sources. The 86–100% band remains a quality target; the marker determines the grade.
