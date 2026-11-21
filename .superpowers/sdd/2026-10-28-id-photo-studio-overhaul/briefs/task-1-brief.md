# Task 1: `src/photo.ts` — shared render + sheet layout core

## Global Constraints (bind this task)

- No new dependencies (spec: "No PDF export, no print stylesheet — downloads stay PNG").
- No git repo here — there are no commit steps; verification steps are the gate.
- Crop semantics must not change (the "match the editor" block at `src/App.tsx:188-206` is the contract): cover crop from `object-position`, then center-anchored zoom.
- Blank name on an enabled strip prints an empty white strip (established behavior — do not "fix" it).
- Design tokens fixed: ink `#17150f`, active `#d64533`, structure `#2b5aa7`, alert `#f0b429`.

## Files

- Create: `src/photo.ts`
- Test: `src/photo.test.ts`
- Modify: `package.json` (add `"test": "node --experimental-strip-types src/photo.test.ts"`)

## Interfaces (later tasks rely on these exact signatures)

- `type CropSpec = { zoom: number; position: { x: number; y: number } }`
- `renderPhoto(image: HTMLImageElement, sizeIn: 1 | 2, dpi: number, hasName: boolean, name: string, crop: CropSpec): HTMLCanvasElement` — square canvas `sizeIn * dpi` px; photo area top, optional name strip bottom (16% of height, existing rule).
- `layoutSheet(paperIn: { wIn: number; hIn: number }, sizeIn: 1 | 2, dpi: number): { pageW: number; pageH: number; cell: number; cells: { x: number; y: number }[]; gap: number }` — pure, no DOM; cells are the 4 top-left corners of a 2×2 grid, equal 3-way gaps horizontally and vertically.
- `PAPERS: { a4: { wIn: number; hIn: number; label: string }; letter: { wIn: number; hIn: number; label: string } }` — A4 = 8.27 × 11.69, Letter = 8.5 × 11.
- `renderSheet(image, sizeIn: 1 | 2, paperKey: "a4" | "letter", dpi: number, hasName: boolean, name: string, crop: CropSpec): HTMLCanvasElement`
- `exportPng(canvas: HTMLCanvasElement, filename: string): void`

## Steps

- [ ] **Step 1: Write the failing test** — `src/photo.test.ts`, `node:assert` style, no test runner:

```ts
import assert from "node:assert"
import { PAPERS, layoutSheet } from "./photo.ts"

// 2×2 on Letter at 300 dpi: 4 cells of 600 + 3 gaps must fit 5100/6600
const letter2 = layoutSheet(PAPERS.letter, 2, 300)
assert.equal(letter2.pageW, 2550)
assert.equal(letter2.pageH, 3300)
assert.equal(letter2.cell, 600)
assert.equal(letter2.cells.length, 4)
assert.ok(letter2.gap > 0, "gap must be positive on Letter at 2×2")
// corners symmetric: first cell's gap == page right inset
assert.equal(letter2.cells[0].x, letter2.gap)
assert.equal(letter2.pageW - (letter2.cells[2].x + letter2.cell), letter2.gap)
// A4 at 600 dpi, 2×2: page 4962×7014, cells 1200
const a4 = layoutSheet(PAPERS.a4, 2, 600)
assert.equal(a4.pageW, Math.round(8.27 * 600))
assert.equal(a4.cell, 1200)
assert.ok(a4.gap > 0)
// 1×1 on A4 at 300 dpi
const a4small = layoutSheet(PAPERS.a4, 1, 300)
assert.equal(a4small.cell, 300)
assert.ok(a4small.gap > 0)
console.log("layoutSheet: all assertions passed")
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find module `./photo.ts`

- [ ] **Step 3: Implement** `src/photo.ts`

- `layoutSheet`: page px = inches × dpi; `cell = sizeIn * dpi`; `gap = (pageW - 2*cell) / 3`; cells at `(gap, gap)`, `(gap+cell+gap, gap)`, etc. Center vertically with the same 3-way gap formula applied to height (`(pageH - 2*cell) / 3`), keeping rows/columns symmetric.
- `renderPhoto`: move the body of the current `download()` (`src/App.tsx:165-240`) here — the white fill, the "match the editor" crop block verbatim, the name strip block verbatim. Replace the single `context.drawImage` with `drawResampled`.
- `drawResampled(ctx, image, x, y, w, h)`: set `imageSmoothingQuality = "high"`; when `w < image.naturalWidth / 2`, halve repeatedly through offscreen canvases until within 2×, then final draw; final draw uses `ctx.filter = "contrast(103.5%) saturate(104%)"` (the light sharpening; reset filter after). `shortcut: no true unsharp mask — stepped halving + high smoothing + slight contrast; upgrade if print samples look soft.`
- `renderSheet`: `layoutSheet` → render the photo canvas once via `renderPhoto`, then `drawImage` it into each of the 4 cells; white page fill; cut marks: 1px ink ticks (`rgba(23,21,15,0.55)`) extending 12px inward from the page edge at each cell boundary line (horizontal and vertical mid-lines), plus faint corner ticks around each cell at `rgba(23,21,15,0.25)`.
- `exportPng`: the link-click block from `src/App.tsx:233-239` verbatim.
- `src/photo.ts` must not touch DOM APIs at module top level (the Node test imports `layoutSheet` and `PAPERS` only, but the module must import cleanly).

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — "layoutSheet: all assertions passed"
