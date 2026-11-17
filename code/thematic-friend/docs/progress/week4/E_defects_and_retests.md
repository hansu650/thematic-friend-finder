# E | Defect and retest record

## E-W4-DEF-01 · Receipt continues to announce pending review

| Field | Actual record |
|---|---|
| Origin / first W4 verification | The [Week 2 progress record](../week2/E_progress.md#notes-and-known-gaps) already documented the stale label. Codex verified it on 17 November 2026, UTC+08:00. |
| Tested baseline | `90d6b6d9bdee2644f0a9aae3675932df8d46a980`, Windows 11, Java 21.0.9, fictional H2 data. |
| Steps | File a report from a fictional member about a second member. Sign in with the locally configured staff account and resolve that report. Reopen the original reporter’s receipt in `/safety`. |
| Expected | The receipt confirms recording. Review status and the internal note remain in staff views. |
| Actual on baseline | The staff detail showed `REVIEWED`; the corresponding reporter receipt still displayed `Recorded, pending review`. The staff note remained private. The focused Maven assertion failed at the stale label (exit 1). |
| Impact and action | Low severity wording defect. A completed report appeared to be waiting. Replaced the fixed queue claim with the receipt label `Recorded` / `已记录` in both message bundles and the template. The fix does not expose the review outcome. |
| Fix / retest revision | `6a2132d45cbb2c1772c4fa48549d1dbb0fd7e488`. Retest automated by Codex on 17 November 2026. |
| Retest | `formLoginGatesStaffActionsAndRestrictsReceiptContents` passed in the full suite (70 tests, exit 0). The 320 × 800 Edge run passed in English and verified the Chinese label. The staff detail still rendered the saved note and the reporter receipt omitted it. Compare the automated captures [before the change](./images/E_receipt_baseline.png) and [after the change](./images/E_receipt_retest.png). |
| Status | Fixed and retested locally. Independent review and product acceptance are pending. |

## Integration and handover

| Dependency | Owner | Status on 17 November 2026 |
|---|---|---|
| Consolidate defect record and confirm wording for the demonstration | C / A | Pending team coordination. |
| Review the logical-send reliability boundary | E reviews D | No Week 4 D branch visible in the fetched remote refs. D’s unpublished work and review remain pending. |
| Independent review of the safety increment | F Song Peitong | Pending. Reviewer, date, findings and follow-up remain unrecorded until the review takes place. |
| Integrate and record acceptance | A / C | Pending remote PR, review and product acceptance. |
