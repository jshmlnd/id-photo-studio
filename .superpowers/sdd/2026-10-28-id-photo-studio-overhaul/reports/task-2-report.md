# Task 2 Report: Rail controls + download wiring

## What I implemented
- Added `format`, `paper`, `dpi` state in `src/App.tsx` after `size`.
- Rebuilt `download()` as a thin dispatcher over `renderPhoto`/`renderSheet` + `exportPng`, with exact filenames per brief.
- Added rail UI: "print format" (single photo / 4-up sheet), conditional "paper size" (a4 / us letter), and "resolution" (300 dpi / 600 dpi), reusing the aria-pressed button pattern. Rail order: photo size → format → paper (sheet only) → name strip → resolution → preview → download.
- Download button label now mirrors format: `download 4-up sheet` vs `download photo`.
- Updated hero copy to drop the hard-coded "300 dpi" claim.

## Tests run
- `npx tsc --noEmit` → clean (no output)
- `npm run build` → success (vite build, 17 modules)
- `npm test` → `layoutSheet: all assertions passed`

## Files changed
- `src/App.tsx`

## Self-review findings
- All three state vars present with correct defaults.
- download() is a thin dispatcher; old inline canvas code removed.
- Filenames match brief exactly.
- No new dependencies; no design-token changes.

## Issues or concerns
- None.