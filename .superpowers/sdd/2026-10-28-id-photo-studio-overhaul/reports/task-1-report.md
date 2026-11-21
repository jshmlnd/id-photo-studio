# Task 1 Report: src/photo.ts — shared render + sheet layout core

## What I implemented
- Created `src/photo.ts` exporting `CropSpec`, `PAPERS`, `layoutSheet`, `drawResampled`, `renderPhoto`, `renderSheet`, `exportPng`.
- `layoutSheet` is pure: page px = inches × dpi, cell = sizeIn × dpi, gap = (pageW − 2·cell)/3, cells in clockwise order (TL, TR, BR, BL) so index 0 is top-left and index 2 is the right column (satisfies the test's right-inset assertion); vertical centering uses (pageH − 2·cell)/3.
- `renderPhoto` lifts the `download()` body from `src/App.tsx` verbatim (white fill, cover-crop + center-anchored zoom, name strip with blank-strip behavior), substituting `drawResampled` for the single `drawImage`.
- `drawResampled` sets high smoothing, halves via offscreen canvases until within 2×, final draw with `contrast(103.5%) saturate(104%)` filter reset after.
- `renderSheet` fills white page, draws the photo canvas into all 4 cells, adds 0.55 ink cut ticks at mid-axes and 0.25 faint corner ticks per cell.
- `exportPng` is the link-click block generalized with a filename param.
- No top-level DOM access.

## TDD evidence

RED:
```
$ npm test
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/photo.ts'
```

GREEN:
```
$ npm test
layoutSheet: all assertions passed
$ npx tsc --noEmit
(no output, clean)
```

## Files changed
- `src/photo.ts` (new)
- `src/photo.test.ts` (new, verbatim from brief)
- `package.json` (added `"test"` script)

## Self-review findings
- All interface signatures match the brief exactly.
- Crop/strip/export blocks lifted verbatim from App.tsx.
- DOM access is lazy (only inside functions).
- layoutSheet passes all pinned assertions.

## Concerns
- `PAPERS` labels are `"A4"` / `"Letter"`; later tasks may expect different display strings, but no spec was given.

## Fix round 1
Changed `renderSheet` cut marks per controller ruling: tick width `Math.max(1, Math.round(dpi / 100))`, tick length `Math.round(dpi * 0.06)`, marks on gap midlines (`x = gap + cell + gap/2`, `y = gapY + cell + gapY/2`) extending inward from page edges, color unchanged. Dropped the faint per-cell corner tick system. Uses each axis's own gap value.

Verification:
```
$ npm test
layoutSheet: all assertions passed
$ npx tsc --noEmit
(no output, clean)
```<|end|><|start|>write to=assistant<|channel|>analysis<|message|>Done. Report back concise.<|end|><|start|><|start|>assistant<|channel|>final<|message|>- **Status:** DONE
- Files changed: `src/photo.ts` (new), `src/photo.test.ts` (new), `package.json` (test script)
- Test summary: `npm test` passing ("layoutSheet: all assertions passed"), `npx tsc --noEmit` clean
- Concerns: cut-mark geometry follows the brief's ambiguous mid-axes wording (not test-covered); PAPERS labels are "A4"/"Letter"
- Report: `E:\GitHub\christerklein-website\.superpowers\sdd\2026-10-28-id-photo-studio-overhaul\reports\task-1-report.md`<|end|><|start|>tool_call_begin|assistant to=execute<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="code">
cat "E:\GitHub\christerklein-website\.superpowers\sdd\2026-10-28-id-photo-studio-overhaul\briefs\task-1-brief.md"