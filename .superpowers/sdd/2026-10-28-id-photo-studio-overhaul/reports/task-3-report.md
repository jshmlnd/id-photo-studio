# Task 3 Report: True-to-output preview (larger)

## What I implemented
- Added `PREVIEW_DPI = 150` constant near `ACCEPTED_TYPES` with the required comment.
- Added `useEffect` and a `previewRef` canvas; effect keyed on `[image, imageUrl, zoom, position, size, hasName, name, format, paper, dpi]` renders at `PREVIEW_DPI` via `renderPhoto`/`renderSheet`, then scales into a fixed-size canvas (single 360×360; sheet height 420 with page aspect from `PAPERS[paper]`).
- Replaced the CSS mockup preview card with a `role="img"` canvas (aria-label `preview of single photo` / `preview of 4-up sheet`), preserving the `bg-ink/[0.04]` panel; empty state reuses `CompositionMark`.
- Rewrote meta text to use chosen dpi: single `{size} × {size} inch png — {size * dpi} × {size * dpi} pixels`; sheet `4-up on {label lowercase} — {pageW} × {pageH} pixels` from `layoutSheet`.

## Tests run
- `npx tsc --noEmit` → clean
- `npm run build` → success (17 modules)
- `npm test` → `layoutSheet: all assertions passed`

## Files changed
- `src/App.tsx`

## Self-review findings
- `src/photo.ts` untouched.
- No `size * 300` hard-code remains.
- Existing drag/keyboard/zoom interactions untouched.
- Blank-name strip still renders white via `renderPhoto`.

## Issues or concerns
- None.