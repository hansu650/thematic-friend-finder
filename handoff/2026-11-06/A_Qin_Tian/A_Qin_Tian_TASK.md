# A Qin Tian: Discovery Cards, Match Feedback and Integration

Owner: **Qin Tian (A)** · Reviewer: **B Wang Yikai** · First feature target: **11 November 2026**. Internal dates are estimates. Start from the included source now; confirm shared contracts before integration.

[Run the project](./RUN.md) · [Six test scenarios](./TESTS.md) · [Team map](./TEAM.md) · [Photo and evidence plan](./EVIDENCE.md)

## What is already there

Filtering, drag/button decisions, mutual matching and basic chat already work. The included code is A's AI-assisted baseline. Your contribution is the increment below.

## Build this

1. Refine the large discovery card, visible filter summary and useful empty-result actions.
2. Add or improve mutual-match feedback with a clear action opening the correct conversation. Show only genuine shared interests.
3. Preserve the same validated action for mouse, emulated touch, keyboard and buttons; keep reduced motion usable.
4. Agree shared contracts with the other members, review their PRs and integrate the accepted increments.

**First small change:** Improve one filter/empty state, then add its focused regression check.

A owns the existing AI-assisted baseline and the extra coordination/integration work. B reviews A. Do not implement the reserved B–F increments on their behalf.

## Start in these files

All paths below are inside the included project.

- [src/main/resources/templates/discover.html](./code/thematic-friend/src/main/resources/templates/discover.html)
- [src/main/resources/static/js/app.js](./code/thematic-friend/src/main/resources/static/js/app.js)
- [src/main/resources/static/css/app.css](./code/thematic-friend/src/main/resources/static/css/app.css)
- [src/main/java/com/example/thematicfriend/discovery/DiscoveryController.java](./code/thematic-friend/src/main/java/com/example/thematicfriend/discovery/DiscoveryController.java)
- [src/main/java/com/example/thematicfriend/discovery/DiscoveryService.java](./code/thematic-friend/src/main/java/com/example/thematicfriend/discovery/DiscoveryService.java)
- [src/main/java/com/example/thematicfriend/connection/ConnectionService.java](./code/thematic-friend/src/main/java/com/example/thematicfriend/connection/ConnectionService.java)

## Tests and screenshots to submit

Implement the six distinct behavior groups in [TESTS.md](./TESTS.md). Include the first three relevant scenarios with your first feature PR; complete the six groups and independently reproduce two peer checks by **22 November**. Reuse existing checks openly and identify your new assertions.

| Capture | What to show | Example filename |
|---|---|---|
| Normal result | Discovery card and genuine match-success result | A_normal.png |
| Boundary/error | No eligible candidates or a short drag returning without submission | A_boundary.png |
| Executable test result | Readable test names/results, command and source version | A_tests.png |

Use fictional data. Capture desktop and 390 px where a UI assertion requires it. Record expected/actual results and any remaining limitation in your own progress MD.

## Hand in

Submit changed source, test source, test output, three purposeful captures and **A_progress.md**. A reviews and merges; A's own work receives peer review. After A publishes the Java baseline, use branch **w2/a-discovery** from the current main, not the historical research branch. Until then, develop in this extracted copy and retain an exact list of changed files for A to apply to that baseline. Do not include caches, target output or a runtime database in your submission.

## Your supplied UI references

These are the user's supplied reference screenshots, not screenshots of the implemented project. Some show Soul branding. Use layout/interaction ideas with the project's warm-white/coral style, English default and temporary language switch. Keep initials/gradients; profile photos remain deferred.

### Reference 3

Mutual-match feedback and primary conversation action.

![Reference 3: Mutual-match feedback and primary conversation action.](./images/momo-03.jpg)

### Reference 4

Large discovery card, visible filters and decision buttons.

![Reference 4: Large discovery card, visible filters and decision buttons.](./images/momo-04.jpg)

### Reference 5

Shared-interest explanation; derive it from real stored interests.

![Reference 5: Shared-interest explanation; derive it from real stored interests.](./images/momo-05.jpg)
