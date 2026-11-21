# Final Review Fix Wave

## Changes

1. Gap guard — `src/photo.ts` `layoutSheet`: clamped `gap` and `gapY` with `Math.max(0, ...)`.
2. Sheet meta label — `src/App.tsx`: mapped `paper === "a4" ? "a4" : "us letter"` in preview meta text.
3. DESIGN.md wording — reworded to "carrying four identical photos and gap-midline cut marks".
4. DESIGN.md tick formula — changed to `max(1, round(dpi/100))`.
5. package.json — split `},  "dependencies": {` onto two lines.
6. Preview downscale smoothing — `src/App.tsx`: set `imageSmoothingEnabled = true` and `imageSmoothingQuality = "high"` before final `drawImage`.

## Verification

- `npm test`: passed (layoutSheet assertions).
- `npx tsc --noEmit`: clean.
- `npm run build`: clean.