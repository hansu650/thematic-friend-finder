# Local UI styles

The interface uses the free Preline UI Card, Buttons, Input and Conversation
primitives with Mingle's own mobile page composition. The latest visual reference
is the user's `momo/1.jpg`–`4.jpg`: inbox, conversation, match and discovery.

The generated `src/main/resources/static/css/preline.css` is checked in so Java
users do not need Node.js to run or build the application. Rebuild it only when
changing component classes or `preline.css` in this directory:

```powershell
cd scripts/ui-build
npm ci --ignore-scripts
npm run build
```

Versions are pinned in `package-lock.json`. Node.js is a development dependency,
not an application server. No browser CDN or paid Preline Pro source is used.
`mingle-ui.css` contains the reference-specific layout and visual adjustments.
See `docs/THIRD_PARTY.md` and the retained licences in `docs/licenses/`.

Reference portraits are local review assets supplied by the user. Only the
seeded `demo_lin`, `demo_zhou` and `demo_xu` accounts receive their photo classes,
and only in demo mode. Other accounts display their initial. These images are
sample visuals, not identity verification or a photo-upload feature.
