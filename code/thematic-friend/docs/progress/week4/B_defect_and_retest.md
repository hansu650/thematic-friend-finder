# B: Defect and retest record

| Field | Actual record |
|---|---|
| ID / reporter / date | B-W4-D01 · Codex automated inspection for B · 23 November 2026 |
| Source / environment | Main `cbe4089ed94c71638ecef9b8300d397d529a9c43`; Windows 11 / Edge 158.0.4370.33; 390/320 px emulation, with fictional seeded conversations |
| Starting data | Clean demo with `--app.demo-conversations=true`; sign in as demo_zhou. No real accounts/messages. |
| Reproduction | Open Messages; inspect search and contact rows at 390 px; at 320 px use Tab to reach a conversation. The right side of the pane and focus border are clipped. |
| Expected | Search, unread badges, preview ellipsis and focus boundary remain within the visible message pane. |
| Actual before fix | At 390 px: workspace 350 px; pane 620.34375 px; controls 580.34375 px. At 320 px, the contact row's center fell outside the visible clipped pane. Document scroll width alone did not expose the problem. |
| Severity | Proposed P2: affects readable controls and keyboard focus on a core narrow-screen route; C has not assigned a product priority. |
| Root cause | Grid item's automatic minimum width retained intrinsic content width, while the workspace hid overflow. |
| Selected correction | Add `min-width:0` to `.inbox-list-pane` in `src/main/resources/static/css/reference-ui.css`. Existing ellipsis/layout/styles and chat logic remain in use. |
| Change revision | Base plus the single CSS edit; working-tree/source hashes in final results. No final commit or integration claimed. |
| Retester / date | Codex automated browser execution · 23 November 2026 |
| Retest | New B-W4-INBOX passed at 1440/390/320 px, complete narrow keyboard flows passed, profile regression 7/7 passed. |
| Status | Fixed locally and automatically retested. A/C shared-CSS review, integration and human usability acceptance pending. |

[Original measured failure](evidence/B_W4_20261123/inbox-before-results.json) · [Original keyboard failure](evidence/B_W4_20261123/keyboard-before-results.json) · [Final measured retest](evidence/B_W4_20261123/usability-retest-results.json).

Before, 390 px:

![Before: clipped inbox search and conversation content](./images/B_W4_before_inbox_390.png)

Before, 320 px keyboard focus:

![Before: right-hand focus boundary clipped](./images/B_W4_before_focus_320.png)

After, 320 px:

![After: fitted inbox, readable rows, ellipsis and badges](./images/B_W4_after_inbox_320.png)

The early scroll/transition sampling failures and the 0.01 ms reduced-motion focus count were test-harness findings, not additional product defects. Their original outputs and diagnosis remain in [B_test_record.md](B_test_record.md). No defect is manufactured to satisfy a quota.
