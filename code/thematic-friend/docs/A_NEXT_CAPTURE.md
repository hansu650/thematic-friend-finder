# A Qin Tian — Capture the Recovery and Integration Increment

This is the second A increment on `w2/a-discovery`, following the earlier 31-test / 11-browser-group captures. Keep those originals as earlier evidence. New terminal/editor/product captures are pending Qin Tian's actual run. Do not relabel old screenshots as proof of this revision.

## 1. Capture the real Java and browser results

Open PowerShell in the full project `code/thematic-friend`, maximize the terminal, then run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-evidence.ps1 -SkipScreenshots
```

The command freezes a source copy, builds it and executes real tests. It pauses after Java and again after browser checks. Capture the actual result, test count, source/run identity and process exit code; press Enter after each capture. The script does not fabricate output or terminal images. `-SkipScreenshots` disables automatic browser images so the new captures remain yours.

The expected current suite is 39 Java tests and 16 browser groups. Use the numbers and status actually printed by your run; a difference or failure needs investigation rather than an edited screenshot. If the result is longer than one screen, take two readable captures.

| Suggested final filename | Capture |
|---|---|
| A_06_integration_java_terminal.png | Actual Maven result and exit code, with command/source context |
| A_07_integration_browser_terminal.png | New A-INT-UI groups and BrowserExit, with any additional screen needed for the full result |
| A_08_integration_github_checks.png | Current PR/head commit and actual CI state from the command below |

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\show-github-checks.ps1
```

CI is an automated check, not the pending independent review. Send the original captures as-is; final naming, relative Markdown links and checksums can be added after receipt. Save them under `docs/progress/week2/images/` if saving directly into the project.

## 2. Capture a real recovery screen

Use two browser sessions and fictional accounts on the local demo at `http://127.0.0.1:8081/`. Use a normal window for the viewer and an InPrivate window for the target. If those addresses stop responding, start the current application before following the steps.

1. Create fresh fictional accounts, for example `a_view_1106` and `a_card_1106`, using passwords you choose locally. Do not include credentials in captures or progress files. Use distinct names such as **Recovery Viewer** and **Recovery Target**.
2. Save both profiles with the **Gaming** interest, **Weekend plans** activity and discovery enabled. In the viewer window, apply Gaming + Weekend plans. The target card should be visible. If another fictional profile shares those filters, skip it until the named target is shown.
3. Leave that card open. In the target window, clear **Show my profile in Discover** and save the profile.
4. Return to the viewer's old card and choose **Like to meet**. Capture the real 404 recovery page with **Your filters are kept when you return to Discover.** Suggested name: `A_09_stale_card_recovery.png`.
5. Select **Back to Discover**. Gaming and Weekend plans should remain selected; the hidden target must be absent. Capture the retained filter chips and result. Suggested name: `A_10_filters_after_recovery.png`.

These steps change only the fictional accounts you created. The first rejected request must not save a like or create a connection; the automated integration tests verify that database invariant. A screenshot of the error page alone does not prove it.

For browser Back behaviour, show a visible fictional card, skip it, then go Back. Discovery should refresh from the server and offer the next eligible card with usable buttons. Browser cache choices vary; the automated suite additionally exercises the persisted-pageshow event explicitly. A still image cannot establish timing or exactly-once submission.

## 3. Optional editor explanation

The earlier two editor captures remain valid for the first increment. For this increment, open the full project in IDEA, enable line numbers and soft wraps, and use Ctrl+G:

| File | Method / block to show | Explanation |
|---|---|---|
| `src/main/java/com/example/thematicfriend/config/PageAdvice.java` | Recovery URL construction inside `responseError` | Keep the 403/404/409 status; retain allowlisted filters; return through a local GET |
| `src/main/resources/static/js/app.js` | `pageshow` listener and `commit` | Refresh restored discovery pages; show pending state; suppress duplicate submissions |
| `src/test/java/com/example/thematicfriend/AIntegrationTests.java` | `completeMatchChatEndFlowEnforcesTheBoundary` | Exercise real controller routes and prove a closed connection rejects both participants |

Use the linked source and method names as the durable reference; exact current line ranges are recorded with the progress evidence. B–F still do not need code screenshots. Their named task packages and assigned modules remain unchanged by this increment.
