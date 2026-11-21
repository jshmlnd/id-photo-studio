# Task 4 Report: Larger editor + design-system pass + docs

## What I implemented
- Step 1: Raised editor frame wrapper from `max-w-[520px]` to `max-w-[640px]` in `src/App.tsx`; bumped layout grid right rail from `minmax(340px,0.8fr)` to `minmax(380px,0.9fr)`.
- Updated DESIGN.md Layout section to reflect new rail minimum (380px) and editor cap (640px).
- Step 2: Appended a "Print Sheet" section to DESIGN.md documenting sheet format (4 copies 2×2, 3-way gaps, gap-midline cross cut marks with specified widths/length/color, no other marks), `PREVIEW_DPI = 150` rule, 300/600 dpi resolution choices with quality path, and the sharpening shortcut note.

## What I tested and results
- `npx tsc --noEmit`: clean (no output/errors).
- `npm run build`: clean (built in 198ms).
- `npm test`: passing ("layoutSheet: all assertions passed").

## Files changed
- `src/App.tsx`
- `DESIGN.md`

## Self-review findings
- Exact class values applied and verified via Select-String.
- `src/photo.ts` untouched.
- No new tokens or colors added.
- Mobile stacking preserved (grid switches at `lg:`).

## Issues or concerns
- None.