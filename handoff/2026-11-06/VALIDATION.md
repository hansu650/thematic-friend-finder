# Mingle Handoff Validation

## Instruction and screenshot update on 6 November

The six named task packages now contain CAPTURE.md, SUBMIT.md, FINISH_LINE.md and a combined README.html. Instructions use the already-merged baseline, the correct member branch, real test output and personal PR/Trello evidence. Code screenshots are optional for B–F. A's six original screenshots are published separately in the canonical progress record; members do not need an example ZIP.

All 60 application/test/script/build-input files in each package matched their pre-update hashes. No new feature implementation or new application-test run is claimed by this documentation pass. All six ZIPs reopened with byte-for-byte matches to their manifests, 296 local Markdown links resolved, all 17 supplied reference-image occurrences loaded across the six Edge previews, and all six A screenshot occurrences loaded in A's progress preview. Exact package hashes and counts are in [INSTRUCTION_UPDATE.json](./INSTRUCTION_UPDATE.json).

## Original baseline verification

Validated locally on 6 November 2026. This is A's AI-assisted baseline handoff, not a claim that B–F have completed their increments or independently reproduced the result.

| Check | Result and scope |
|---|---|
| Clean source build | A's ZIP was extracted into a separate folder and built with JDK 21 and Maven Wrapper. 19 tests passed; zero failures, errors or skipped tests; build exit 0. The existing Maven cache was reused offline. |
| Browser flow | Eight groups passed on the extracted JAR using isolated headless Edge/Playwright: language switching, mouse drag return/commit, two-session matching, saved chat and polling, emulated touch, 390 px layout and absence of browser/server errors. The Mingle title/header was also checked. |
| Member implementation boundary | Live profile preview, password change, unread/history UI, staff report review and backup/restore remain B–F's assigned additions. |
| Package integrity | Each package includes a SHA-256 manifest. The six packages use the same code baseline; only owner task/progress text and selected reference images differ. Runtime databases, credentials, caches, IDE files and build output are excluded. |
| Docs and images | Local link targets and actual browser rendering of the six task pages and first-day photo index are checked in the final delivery verification. |

The failed first branding assertion expected the old Chinese product name. After correcting that expected wording to the selected Mingle name, the complete suite passed. Original failed and successful logs are retained locally.

The ZIP contains source rather than a preinstalled runtime. Each member needs JDK 21 and network access for their first Maven dependency resolution. Each person's `127.0.0.1:8080` is their own computer and database. For fictional accounts, run `scripts/run-demo.ps1` inside the Java project and choose a local password. The six usernames are `demo_zhou`, `demo_lin`, `demo_xu`, `demo_chen`, `demo_he` and `demo_su`.

The baseline's earlier restart/data-retention and English-only checks are documented in the included `code/thematic-friend/docs/VERIFICATION.md`. No shared public deployment, physical-phone test, production readiness or independent teammate reproduction is claimed.
