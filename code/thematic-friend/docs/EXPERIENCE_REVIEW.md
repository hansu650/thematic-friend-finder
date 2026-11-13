# Reference website UI review — 13 November 2026

The current interface replaces the Planet/sidebar revision. The existing Java 21, Spring Boot, Thymeleaf, security and H2 codebase remains in use.

| Surface | Reference |
|---|---|
| Public capsule navigation | [Bumble](https://bumble.com/) |
| Full-bleed video and stepped headline | [Feeld](https://feeld.com/) |
| Editorial serif heading, spacing and fountain photograph | [Hinge](https://hinge.co/) |
| Inner header, activity cards, two-column detail and fixed action bar | [Meetup event](https://www.meetup.com/townflame/events/317281576/) |

The sites were opened in a browser and their actual layouts, computed fonts, controls and assets inspected. The event detail uses the measured 1200 px content width, 620/508 px columns with a 72 px gap, 48/56 px title, 32 px photo/card corners and a bottom action bar. This is a component-level reference implementation, not a measured 99% pixel-equivalence result. The third-party sites' private backend implementations were not accessed or copied.

Current routes: `/` public homepage; `/explore` event/people feed; `/events` search and saved/going lists; `/events/{id}` detail and RSVP; `/events/new` creation; `/discover?member={id}` an eligible person's profile; `/connections` and `/conversations/{id}` real messaging. Events, attendance and saves persist in H2. Event actions use the authenticated account, CSRF protection, idempotent mutations and a locked capacity check. All event fixtures are local and do not RSVP to external reference sites.

The old automatic guide and theme sidebar are no longer loaded. Sound is off initially. Profile settings provide message sound and reduced-motion controls; the video also has an explicit pause button and respects the operating system setting. Text, emoji and the existing six SVG stickers remain available. Message send/poll/history behavior is preserved; no automatic responder was added.

## Integrated publication checks

After integrating current main, including E's staff review and F's runtime changes, the final application passed **66 Java tests, 7 reference-browser groups and 10 conversation-browser groups**. The runtime fixture checks also passed with their Maven step skipped. See the [release record](releases/2026-11-13-reference-ui.md) for the portable evidence and its limits. The records below describe the earlier local preview and small polish; they are retained with their original counts.

## Earlier preview verification

- Java package: **64 tests passed, 0 failures/errors**, `.local/small-polish-build-20261113.log`. The added regression verifies that expanding fixtures preserves existing dates, capacities, attendance and saves across repeat startup.
- Core-flow browser acceptance before this small polish: **7 groups passed**, `.local/reference-browser-verification/review-VYFXQC/results.json`. It uses a fresh database and two independent browser contexts. It checks mutual likes, two-way text/emoji/stickers, persisted history, native forms without JavaScript, event search/create/RSVP/cancel/save, account-local state, Chinese strings and layouts at 320/390/768/1440 px. No browser exceptions, failed assets or HTTP 5xx were observed.
- Live preview at `http://127.0.0.1:8082/` was checked with the existing account. The event detail, profile, inbox and safety page returned HTTP 200. Its original database is retained at `.local/desktop-preview-20261113-101802/database`, with the pre-upgrade copy under `.local/small-polish-preview-20261113-143746/database-before-upgrade`. No existing decisions, blocks or ended connections were reset.

Run the current acceptance script with the existing Playwright module and browser selected through `MINGLE_PLAYWRIGHT_MODULE` and `MINGLE_BROWSER_PATH`:

```powershell
node scripts/reference-browser/run-reference-check.mjs
```

`MINGLE_CAPTURE_MODULE` selects the user's installed screenshot helper. Generated test passwords stay in memory. Screenshots and test databases are retained locally. Older Planet/theme/guide screenshots and the old UI/experience visual runners describe the superseded design and are not acceptance evidence for this revision. Functional discovery/conversation runners remain available with selectors updated for the new page structure.

Asset and font provenance is recorded in [THIRD_PARTY.md](THIRD_PARTY.md) and the [source manifest](../src/main/resources/static/images/reference-sites/sources.json). The release record covers the integrated publication candidate. These earlier preview notes do not establish a remote merge or independent review.

Final static review also checked 1366x768, 1440x900, 1440x1000, 1920x1080, 320x568 and 390x844 windows: the headline and action buttons do not overlap, and the conversation search field preserves its icon spacing. In this preserved preview database, demo_lin and demo_su can open their existing shared conversation. After the content expansion, demo_zhou has 18 newly available profiles; prior decisions remain in place. Fresh test databases are independent of those prior user choices.

The discovery regression after the small polish passed all 16 groups: .local/browser-verification/discovery-gXcR7E/results.json. It verifies mouse/touch/keyboard decisions, duplicate-input protection, history recovery, JavaScript-free forms, hidden-profile rejection and ended-connection boundaries on the packaged small-polish UI before the final main integration.

## Small polish requested after the screenshot review

The approved layout is retained. The sticky detail sidebar is now constrained to its own first-row wrapper, so it cannot cover the recommended cards below. The bottom action bar reserves space based on its measured height. The same correction also applies to person detail pages. The Explore page’s Meet people entry uses a 19 px label, 26 px icon and 58 px desktop hit area; its mobile size remains proportional.

The local library now contains 18 activity covers and 28 portrait photographs. Demo mode adds 18 activity fixtures individually; the optional conversation/profile seed supplies 28 fictional profiles in total. Existing activity records are not rewritten, existing skips/likes are not reset, and ended connections are not reopened. Old event cover names are mapped to the new topic library at rendering time.

Motion is limited to card entrances and hover/press feedback, photograph transitions into detail pages, short detail entrances and photo/profile dialog opening. The early navigation listener avoids two simultaneous transforms on the same photograph and opts out for an outgoing swipe. Normal navigation is retained when JavaScript is disabled; system and profile reduced-motion preferences disable the enhanced transitions. There is no additional animation library or automatic audio.

Latest isolated review: **7 groups passed**, `.local/small-polish-verification/review-1794551606544/results.json`. It verifies all 18 distinct activity images and 28 portraits, the enlarged entry, non-overlapping detail layouts at 320/390/768/1440/1920 px, eight consecutive decisions, photo/profile dialogs, native card-to-detail transitions, two independent new accounts exchanging text and emoji, reduced-motion and JavaScript-free behavior, and persistence after restarting the test database. No browser exceptions, missing assets or server errors were observed in the completed run. Earlier incomplete test runs are retained separately.

Live verification: `.local/small-polish-live-after-1794551901478/results.json`, compared with `.local/small-polish-live-before-1794551775564/results.json`. The same 8082 database went from 6 to 18 activities and from 0 to 18 eligible profiles for demo_zhou. Existing event IDs, titles, dates and venues were preserved; saved/going lists remained unchanged. The original shared conversation at `/conversations/1` still contains its two messages. The scrolled event detail has no sidebar/recommendation overlap. Current runtime: `.local/small-polish-preview-20261113-143746/`; original data remains at `.local/desktop-preview-20261113-101802/database`.
