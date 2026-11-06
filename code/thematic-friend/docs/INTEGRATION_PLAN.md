# A's Integration Contract Proposals and Review Gate

Prepared by Qin Tian (A), with Codex assistance, on 6 November 2026. These are reviewable proposals for the named owners. No team discussion, agreement, peer approval or B–F implementation is claimed. Record the actual decision before overlapping changes are merged.

## Implemented boundaries to retain

- Identity comes from the authenticated session. Submitted member IDs never select the acting account. Every mutation uses POST and CSRF protection.
- Only reciprocal likes create a connection. The same connection ID is used by `/matches/{id}`, `/conversations/{id}` and the message API. Ended connections stay closed after unblocking or repeated decisions.
- An unrelated user receives 404 for a connection they do not own. A participant receives 403 for a closed connection. API failures remain JSON with an `error` field; page failures offer a safe GET recovery link. A's recovery change retains only valid `interest` and `goal` values and preserves the rejection status.
- Hiding a profile removes it from new discovery and rejects stale-card decisions. It does not end existing connections. Blocking and ending contact have their own explicit effects.
- Native forms remain usable without JavaScript. The discovery form IDs, CSRF fields, filter values and match/conversation destinations are shared integration surfaces.

## Proposals for owner confirmation

| ID and owners | Concrete proposal | Evidence required from the owner | State |
|---|---|---|---|
| CONTRACT-B — A / B Wang Yikai | Keep GET/POST `/profile` and existing validation limits. Preview reads local form controls, renders text safely and does not write to the database. Keep script selectors scoped to the profile page; do not replace discovery's form handlers. | Unsaved edits disappear on reload; saved values persist; 0/5/6 interest boundaries; keyboard and 390 px behaviour. | Proposed; B confirmation pending |
| CONTRACT-C — A / C Tao Jiacheng | Add authenticated GET/POST `/account/password` with current password, new password and confirmation. Use the existing encoder and limits. Recommended policy: a successful change invalidates all existing sessions, including the current one, then redirects to login with a confirmation message. No plaintext credential is logged or returned. | Wrong current password and validation errors leave the hash unchanged; missing CSRF/anonymous requests fail; two already-open sessions lose access; old login fails and new login succeeds. Document how session invalidation is enforced. | Proposed; C confirmation pending |
| CONTRACT-D — A / C / D Zhou Ziyue | Preserve the existing after-ID polling response. Add a separate bounded history route `GET /api/conversations/{id}/history?before=<messageId>` returning `messages` in ascending ID order, `hasOlder` and `nextBefore`. Keep page size at most 100. Add POST `/api/conversations/{id}/read` with `throughMessageId`; store a separate, monotonic read marker per participant. Validate that the acknowledged message belongs to that connection. Never mark the other participant as having read. | More than 100 messages; no gaps/duplicates between pages and polling; a new message arriving during reading stays unread until acknowledged; outsider/closed/blocked requests fail. | Proposed; D/C confirmation pending |
| CONTRACT-E — A / C / E Wu Zhuoda | Restrict GET `/staff/reports` and POST `/staff/reports/{id}/review` to a server-assigned STAFF authority. Suggested review fields: OPEN / REVIEWED / RESOLVED status, handler ID, handled time and private staff note. Ordinary signup cannot grant roles. Use controlled staff setup and record the method without publishing credentials. | Ordinary/anonymous/forged-role denial; reporter receipts and staff notes remain separate; valid transitions persist; handler/time come from the server; all mutations require CSRF. | Proposed; E/C confirmation pending |
| CONTRACT-F — A / F Song Peitong | Resolve `APP_DATA_DIR` to an absolute directory. Back up only a stopped database. Include file size, SHA-256 and source version in a manifest. Restore only to a fresh, unoccupied destination, with checksum validation before opening the restored database. Keep any pre-existing data untouched. | Stop/lock refusal, corrupted archive refusal, path traversal/occupied target refusal, restored known records and a second person's clean-copy run. | Proposed; F confirmation pending |

C owns account/role storage and session policy; D owns read-state/history fields; E owns report review fields; F owns backup/restore tooling. A reviews the shared consequences and integrates their work. These proposed route/field names may change after owner review; update this document and the affected tests together. Do not describe a proposed route as available in the product.

## Integration sequence

1. Each owner records the accepted contract or a concrete alternative, with their name, date and PR. Resolve C/E role storage and C/D session/read identity before merging overlapping entity/config changes. B's isolated profile work can proceed separately.
2. A reviews each focused PR against its own acceptance cases, checks the actual commit and runs the retained Java regressions. The owner supplies implementation, tests, real output and an honest progress record.
3. Integrate accepted work in a working branch; check schema changes against a disposable copy of the fixture data. Never overwrite the demonstration database to resolve a migration problem.
4. Run the browser checks after changes to shared controllers, templates, CSS/JS or identity. Use F's reproduction and backup/restore evidence when that module exists.
5. Record the integrated revision and run all CORE-01–08 from the [final acceptance plan](../../../team-plan/14_final_acceptance_and_assessment.md). No final acceptance is marked complete while its member increment or independent check is missing.

## Executable gate available now

`AIntegrationTests` exercises the existing shared HTTP routes: stale hidden/blocked cards, safe filter recovery, mutual choice → message → end, private reporting after blocking, unblocking without reopening contact, missing-CSRF rejection and temporary Chinese recovery. It supplements the original baseline and discovery tests; it does not certify password change, unread/history, staff handling, live preview or backup/restore.

Run the full Java suite through `scripts/build.ps1`, or the isolated Java/browser workflow through `scripts/test-evidence.ps1 -SkipScreenshots`. The latter pauses for the person taking terminal captures; `-NoPause` is only for unattended verification. Every run saves its source manifest and actual exit codes. [Capture instructions](A_NEXT_CAPTURE.md) describe the current increment.

## Actual decision and integration log

No owner confirmation or incoming feature PR has been recorded for these proposals. Add real entries as work arrives:

| Contract | Confirming participants and date | Accepted decision / PR | Integrated revision | Gate result / remaining issue |
|---|---|---|---|---|
| B–F | Pending | Pending | Pending | Pending owner work |

A's independent reviewer remains B Wang Yikai. Passing automated checks or an A-authored self-check is not B's review.
