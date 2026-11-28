# A's integration and assessment handover

Updated **28 November 2026**. Qin Tian has now authorised Codex to merge verified PRs and perform technical integration. PRs #26–#29 are merged. A versioned candidate has been built and checked through its actual launcher; human acceptance, personal reflection and final sign-off still require the actual participants. This document does not record a completed freeze or submission.

## Available evidence and next operations

| Item | Available result | Status |
| --- | --- | --- |
| [Recovery PR #26](https://github.com/hansu650/thematic-friend-finder/pull/26) | Actionable Retry, event-full recovery, friendship copy, tablet development language access; B #25 and D #21 retained | Merged on 28 November after its two CI jobs passed |
| [Automated verification](https://github.com/hansu650/thematic-friend-finder/blob/d182b089658d674487ce0a70b008cb35b907ef07/code/thematic-friend/docs/releases/2026-11-28-a-recovery.md) | 79 Java tests and 21 browser checks passed; exact source/JAR identity and images recorded | Engineering evidence of that branch, not a frozen team candidate |
| [A's dated evidence register](./evidence/A_2026-11-28.md) | PR chronology, W2/W3 calendar correction, source-supported decisions and five-section reflection mapping | Personal action/learning statements still require A's input |
| [Actual candidate record](./evidence/2026-11-28-candidate/README.md) | Source `85a03f9`, JAR/source/distribution hashes, CI, actual English startup and restart screenshots | Prepared for B–F acceptance; not a frozen final release |
| [A’s English speaking outline](./evidence/A_W6_demo_outline.md) | Five sourced facts, suggested 60–90 second segment and screen sequence | Prepared; factual understanding and final recording remain with A |

The two original increments were based on `081597d5e2012ef078b2f42369446c7480e4b8f0` and are now integrated. Their merge records technical integration, not final team acceptance. The [candidate packaging tool](../code/thematic-friend/README.md#build-a-versioned-review-candidate) turns a clean recorded revision into one runnable bundle and checksum record.

## Use the prepared candidate first

The [candidate record](./evidence/2026-11-28-candidate/README.md) is the current technical handover. Extract the whole bundle and use its `Start-Mingle.ps1`; that launcher validates JAR/source checksums and enforces English. The first run uses `-NewData`; restarts retain the same path without that switch. Read the [standalone guide](../code/thematic-friend/docs/CANDIDATE_README.md). Distribute the one candidate identity and collect actual returned evidence before final freeze. A later code/configuration change requires a newly identified candidate and the affected checks.

The procedure below remains available for rebuilding or choosing a later revision. It is not an instruction to discard the current candidate or repeat unchanged, passed checks.

## When building a later revision

1. Preserve any uncommitted local work and the existing demonstration database. Review each PR's changed files, CI and remaining limits. Do not overwrite a working directory with the older local source tree.
2. After merging, obtain the chosen main revision in a clean working copy. Record the full commit and confirm that the tree has no uncommitted application changes. A different combined revision is a different candidate.
3. In `code/thematic-friend`, run the existing build and record its exit code, then calculate the actual JAR hash:

```powershell
.\scripts\build.ps1
if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
git rev-parse HEAD
Get-FileHash -Algorithm SHA256 -LiteralPath '.\target\thematic-friend-0.0.1-SNAPSHOT.jar'
```

Copy these actual results into the candidate record. A locally rebuilt JAR can differ byte-for-byte from the earlier PR verification JAR. The same distributed JAR must match A's published checksum.

4. Decide whether to use a fresh English demonstration database or undertake a separate, verified migration. The current `DemoEvents` seeds are English; their `legacyTitles` recognise existing records and must remain. Selecting English UI does not translate existing database text. Preserve the original database and use the existing [backup/restore tools](../code/thematic-friend/README.md) only under their stopped-database rules.

For the fresh-database option, run from the application directory. Replace the example directory with a new, clearly named local path. This command deliberately rejects an existing path:

```powershell
$demoData = Join-Path (Get-Location) '.local\final-demo-20261204'
if (Test-Path -LiteralPath $demoData) { throw 'Choose a new directory; preserve existing data.' }
$previousLanguageSetting = $env:TONGPIN_CHINESE_ENABLED
try {
    $env:TONGPIN_CHINESE_ENABLED = 'false'
    .\scripts\run-demo.ps1 -Port 8080 -DataDirectory $demoData
} finally {
    $env:TONGPIN_CHINESE_ENABLED = $previousLanguageSetting
}
```

The existing script asks for the local demo password if none is supplied. Communicate credentials separately; do not put them in the candidate record, GitHub or a recording. New directories receive fictional seed accounts. The app binds locally; this command does not deploy a public service. An occupied port is reported rather than terminating the other process.

For later restarts, pass the **same** selected data directory to `run-demo.ps1` with `TONGPIN_CHINESE_ENABLED=false`; do not repeat the fresh-directory guard. Check the actual event title, description and location text and the intended demo flows on this selected database.

5. Publish one candidate record to the team after A chooses the version. Include source commit, JAR filename/checksum, Java version, English setting, port, data-directory rule and known limits. B–F record what they actually used. The candidate record is a handover specification, not a request for Codex to send messages.
6. Collect returned evidence by scope. If A changes a relevant input, record the changed revision and repeat affected checks. Unchanged, already-passed scope may be referenced with its version relationship rather than rerunning everything.

## Inputs that must wait

| Input | Owner / dependency | A's later action |
| --- | --- | --- |
| Real task observation, keyboard/mobile scope and review of A | B | Evaluate observed problems and any gap; do not substitute CI for a person |
| Product rules, scope decisions and acceptance judgement | C | Resolve product priorities against actual candidate evidence |
| Candidate chat delivery/retry evidence | D | Confirm revision and handle any reproducible issue |
| Permissions, defect coordination and itemised material provenance/use evidence | E, with C on product use | Make a per-item keep/replace/omit/obtain-evidence decision and implement it; no blanket rights clearance |
| Independent build, restart/recovery and handover | F | A reviews the actual returned scope; record operator, date, version and finding |
| Own past actions, judgement and PDP baseline | A | Complete reflection from genuine experience and cite sources |

Earlier merged module evidence remains historical evidence. It does not automatically accept the later combined candidate. No new peer reviews, user observations or material decisions are asserted in this handover.

## W6 preparation and completion

Use the [dated evidence register](./evidence/A_2026-11-28.md) to choose one or two incidents for the five official reflection sections. Explain situation, personal choice, result, limitation, alternative and next action. Keep AI assistance explicit. A's combined technical and Scrum responsibilities can be evaluated, but claims about bottlenecks, conflict or leadership effects need real incidents.

The existing [reflection blueprint](./18_A_reflection_blueprint.md) and [assessment mapping](./14_final_acceptance_and_assessment.md) are the writing structure. The five sections, professional development plan and real evaluation matter more than PR count. The highest band is 86–100%; it is an aspiration assessed by the marker.

For the group video, plan a sequence under 15 minutes showing the objective, lifecycle/design, working product, one sourced improvement, product/project evaluation, supported contributions and reproducible handover. The recovery case is ready as a storyboard source. The final recording waits for the selected version and returned conclusions. A may narrate the combined video; each member still supplies their own factual contribution and individual reflection.

After the video is uploaded to MMUTube, verify playback with the relevant course permissions and use the same URL in all six individual reports. Each student checks their own identity/filename and uploads their own report to Moodle, then reopens the uploaded file and retains the receipt privately. The internal target is 4 December; the supplied Moodle screenshot shows 18 December at 13:00 without a visible timezone, so the live course page remains the authority for the final deadline.

Final freeze, video, individual reports and submission remain **PENDING** until actually completed.
