# UI Reference and Ownership Map

Use the nine supplied images to guide the browser website. Keep the warm-white/coral direction, readable cards, English default and temporary Chinese switch. The reference folder contains screenshots from more than one app; the visible Soul branding in images 5–9 is not a Momo screen. These are supplied visual references, not independent product testing.

| Reference | Observed pattern | Mingle adaptation | Owner |
|---|---|---|---|
| [1](../momo/1.jpg) | Matches above a conversation list; unread filter | List hierarchy, empty matches and unread state | D Zhou Ziyue |
| [2](../momo/2.jpg) | Conversation header, profile context and composer | Clear back navigation, context and text chat | D Zhou Ziyue; E Wu Zhuoda for safety entry |
| [3](../momo/3.jpg) | Matched pair and primary message action | Mutual-match feedback with initials and a conversation action | A Qin Tian |
| [4](../momo/4.jpg) | Large discover card, filters and circular decisions | Dominant swipe card, visible filters, Skip/Like and keyboard alternatives | A Qin Tian; B Wang Yikai for shared styling |
| [5](../momo/5.jpg) | Shared-interest explanation in a result card | Show the real intersection of interests | A Qin Tian |
| [6](../momo/6.jpg) | Star-field discovery and category shortcuts | Keep as an optional exploration idea after core delivery | Product Backlog, no current owner commitment |
| [7](../momo/7.jpg) | Compact profile context over chat | Profile summary and readable shared-interest chips | B Wang Yikai and D Zhou Ziyue |
| [8](../momo/8.jpg) | Simple message rows with preview, time and unread dot | Stable conversation list and meaningful unread labels | D Zhou Ziyue |
| [9](../momo/9.jpg) | Consistent grid of feature tiles | Reuse spacing and card hierarchy for existing destinations | B Wang Yikai |

Use original initials/gradients in the prototype. Do not copy the supplied people's photos, chat text, logos or branded art into app seed data. Profile photos remain deferred. Paid memberships, gifts, voice/video rooms, precise location, fake online counts and unvalidated match percentages are outside the current scope. A shared-interest label must come from stored data.

## Delivery boundaries

- **A Qin Tian:** Discovery, matching feedback and integration. References: 3, 4, 5.
- **B Wang Yikai:** Shared UI, live profile preview and accessibility. References: 4, 7, 9 (layout only).
- **C Tao Jiacheng:** Account settings, password change and data contracts. References: Cross-page consistency; no account screen was supplied.
- **D Zhou Ziyue:** Conversation list, unread state and older messages. References: 1, 2, 7, 8.
- **E Wu Zhuoda:** Safety actions, restricted report review and permission tests. References: 2, 7 (entry placement); review screen is a project design.
- **F Song Peitong:** Backup and restore, clean-copy setup and reproduction. References: All implemented screens as reproduction targets.

C's account/settings and E's review page need project-specific designs because the screenshots do not show those pages. Each member implements their assigned increment and its tests. A owns the existing AI-assisted baseline; this reference update does not reassign B–F's work to A.

## UI acceptance

- Desktop and 390 px layouts expose their essential controls without horizontal overflow.
- Swipe has button and keyboard alternatives; reduced motion is respected.
- Loading, empty, success, validation and permission-denied states use actual backend state.
- Names, long text and interest chips remain readable. EN/Chinese switching does not lose the current screen's purpose.
- Capture the implemented screen beside its acceptance result. A reference screenshot is not a test of Mingle.
