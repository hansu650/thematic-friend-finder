# B: Post-merge technical review of PR #19

Review date: **23 November 2026, Asia/Shanghai**. Operator: **Codex, at the user's request for B's W4 task**. This is a source review and local automated reproduction, not Wang Yikai's personal execution, a GitHub approval or C/A acceptance.

[PR #19](https://github.com/hansu650/thematic-friend-finder/pull/19) was merged on 14 November 2026 as `90d6b6d9bdee2644f0a9aae3675932df8d46a980`. Its actual GitHub diff and metadata were retrieved. Read scope: `reference-motion.js`, `reference-motion.css`, motion changes in `app.js` and `chat.js`, `match.html`, the shared reference fragment, runner and release description. Historical captures were treated as inherited evidence.

Runtime reproduction used current main **cbe4089ed94c71638ecef9b8300d397d529a9c43**, not a checkout of the original PR merge. Later chat reliability and RSVP/sticker changes are already integrated. This distinction matters when interpreting the nine current motion groups.

| Effect / boundary | Source inspection | Actual current-main evidence |
|---|---|---|
| Magnetic card | Pointer tilt and short-drag spring are input driven. Committed decisions keep a guard against duplicate submission; preference/visibility changes stop hover/spring effects. | MAGNET passed; short drag returned without a decision POST. |
| Match convergence | Decorative pair is hidden from the accessibility tree; text and conversation action remain separate. Small-screen travel and static styles retain content. | MATCH passed during and after animation at 390/320 px. |
| Message arrival | Only newly inserted confirmed rows animate. Known IDs and history bypass replay; pending UI is not a confirmed arrival. | CHAT-MOTION passed; added W4 history check covers old-page loading and two subsequent polls. |
| Save particles | Pending intent is consumed once; destination path, age and confirmed pressed state gate the burst. Particle layers are decorative and removed after completion. | SAVE-MOTION passed for confirmed save, reload, unsave and an intercepted denied request. Denial is browser fault injection, not a real access-control test. |
| Staggered entry | Visible cards enter once; offscreen/hidden/reduced contexts suppress the optional effect. | STAGGER passed. |
| Reduced motion | Existing system and app preferences gate JavaScript effects, CSS transitions and navigation behavior. | Current REDUCED group passed. W4 independently checks the manual and emulated system settings; see the final test record. |
| Later additions | RSVP check and sticker staggering came after PR #19. | Current RSVP/STICKERS groups passed; these are inherited work, not B's new implementation. |

No reproducible defect was identified in the five PR #19 effects within this checked scope. A separate populated-inbox clipping defect was found during the W4 keyboard/layout review; there is no evidence that PR #19 introduced it. Its focused CSS correction and retest are in [B_defect_and_retest.md](B_defect_and_retest.md).

## Design and accessibility tradeoff

Motion adds confirmation and direction but should not carry the only evidence of success. Retain server-confirmed pressed/saved state, readable chat rows and explicit controls when effects are suppressed. For the inbox, allowing the grid item to shrink preserves the existing layout and intended text ellipsis; simply hiding page overflow leaves controls clipped, while wrapping every preview changes the established dense list.

Limits: one Windows/Edge environment, emulated widths and system media preference, semantic live-region checks only. No real screen reader, physical phone or human participant was used. Review discussion with C/A, product acceptance and integration remain pending.

