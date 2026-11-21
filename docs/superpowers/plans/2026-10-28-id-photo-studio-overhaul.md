# ID Photo Studio Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 4-up print-sheet export (A4/Letter), a 300/600 dpi quality choice, and a true-to-output larger preview to the ID Photo Studio.

**Architecture:** Extract the export math from `App.tsx` into a pure-ish `src/photo.ts` (one `renderPhoto` used by both single and sheet outputs, one `layoutSheet` for page math), then build the rail controls, canvas-based true preview, and layout growth on top. The preview renders the same functions at a lower preview dpi, so preview and download can never drift.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind v4. No new dependencies. Test via `node --experimental-strip-types` with `node:assert` (Node from `.mise.toml` supports it; no test framework exists in this project).

**Spec:** `docs/superpowers/specs/2026-10-28-id-photo-studio-overhaul-design.md`

## Global Constraints

- No new dependencies (spec: "No PDF export, no print stylesheet — downloads stay PNG").
- No git repo here — there are no commit steps; verification steps are the gate.
- Design system is fixed: `--color-ink #17150f`, `--color-active #d64533`, `--color-structure #2b5aa7`, `--color-alert #f0b429`, Jost, all-lowercase UI copy. Document tokens in `DESIGN.md` when they change.
- Crop semantics must not change (the "match the editor" block at `src/App.tsx:188-206` is the contract): cover crop from `object-position`, then center-anchored zoom.
- Blank name on an enabled strip prints an empty white strip (established behavior — do not "fix" it).
- Blob-URL revocation stays inside the `setImageUrl` updater (`src/App.tsx:118-124`); never move it to an effect cleanup (StrictMode).

## Review Focus

- 2×2-inch photos on Letter (8.5×11 in) portrait: margin math gets tight — expect 4 cells plus 3 equal gaps to fit with a gap ≥ 0.05 in at both dpi; the layout function must never return negative gaps. Pinned in Task 1's test.
- Zoom > 1 with off-center position: preview and every sheet cell must match the editor. Pinned in Task 3's verification (drag to 30/70, zoom 1.8, compare preview cell vs downloaded single).
- A4 at 600 dpi is a 4963×7014 px canvas (~35 MP): the sheet render must not run per keystroke in preview — preview renders at capped `PREVIEW_DPI = 150`. Pinned in Task 3.
- Very large uploads (e.g. 6000 px portrait): single-step `drawImage` downscale to 600 dpi aliases badly — the stepped halving in `drawResampled` must engage whenever target < source / 2. Pinned by Task 3's download-matches-preview check on a large upload (DOM canvases can't run in the Node test).
- Toggle to sheet format with no photo uploaded: preview shows the empty-state sheet outline and download stays disabled. Pinned in Task 2's verification.

---

### Task 1: `src/photo.ts` — shared render + sheet layout core

**Files:**
- Create: `src/photo.ts`
- Test: `src/photo.test.ts`
- Modify: `package.json` (add `"test": "node --experimental-strip-types src/photo.test.ts"`)

**Interfaces:**
- Consumes: nothing (standalone module; DOM APIs used lazily inside functions only).
- Produces (later tasks rely on these exact signatures):
  - `type CropSpec = { zoom: number; position: { x: number; y: number } }`
  - `renderPhoto(image: HTMLImageElement, sizeIn: 1 | 2, dpi: number, hasName: boolean, name: string, crop: CropSpec): HTMLCanvasElement` — square canvas `sizeIn * dpi` px; photo area top, optional name strip bottom (16% of height, existing rule).
  - `layoutSheet(paperIn: { wIn: number; hIn: number }, sizeIn: 1 | 2, dpi: number): { pageW: number; pageH: number; cell: number; cells: { x: number; y: number }[]; gap: number }` — pure, no DOM; cells are the 4 top-left corners of a 2×2 grid, equal 3-way gaps horizontally and vertically.
  - `PAPERS: { a4: { wIn: number; hIn: number; label: string }; letter: { wIn: number; hIn: number; label: string } }` — A4 = 8.27 × 11.69, Letter = 8.5 × 11.
  - `renderSheet(image, sizeIn: 1 | 2, paperKey: "a4" | "letter", dpi: number, hasName: boolean, name: string, crop: CropSpec): HTMLCanvasElement`
  - `exportPng(canvas: HTMLCanvasElement, filename: string): void`

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

- `layoutSheet`: page px = inches × dpi; `cell = sizeIn * dpi`; `gap = (pageW - 2*cell) / 3` (same formula vertically — pageH and cell aspect make vertical gap equal only when `(pageH - 2*cell)/3 ≥ gap`; center vertically with `(pageH - 2*cell) / 3` too, asserting ≥ the horizontal gap is not required — just center both axes); cells at `(gap, gap)`, `(gap+cell+gap, gap)`, etc.
- `renderPhoto`: move the body of the current `download()` (`src/App.tsx:165-240`) here — the white fill, the "match the editor" crop block verbatim, the name strip block verbatim. Replace the single `context.drawImage` with `drawResampled`.
- `drawResampled(ctx, image, x, y, w, h)`: set `imageSmoothingQuality = "high"`; when `w < image.naturalWidth / 2`, halve repeatedly through offscreen canvases until within 2×, then final draw; final draw uses `ctx.filter = "contrast(103.5%) saturate(104%)"` (the light sharpening; reset filter after). `shortcut: no true unsharp mask — stepped halving + high smoothing + slight contrast; upgrade if print samples look soft.`
- `renderSheet`: `layoutSheet` → `renderPhoto` once per unique photo? No — render the photo canvas once, then `drawImage` it into each of the 4 cells; white page fill; cut marks: 1px ink ticks (`rgba(23,21,15,0.55)`) extending 12px inward from the page edge at each cell boundary line (horizontal and vertical mid-lines: at `gap + cell` and `gap + cell + gap + cell`? — ticks at the two mid-axes: x = cell midpoints between columns, y likewise), plus faint corner ticks around each cell at `rgba(23,21,15,0.25)`.
- `exportPng`: the link-click block from `src/App.tsx:233-239` verbatim.

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — "layoutSheet: all assertions passed"

### Task 2: Rail controls + download wiring

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `renderPhoto`, `renderSheet`, `exportPng`, `PAPERS` from `src/photo.ts`.
- Produces: App state `format: "single" | "sheet"` (default `"single"`), `paper: "a4" | "letter"` (default `"a4"`), `dpi: 300 | 600` (default `300`); `download()` uses them.

- [ ] **Step 1: Add state** after `size` (line ~79): `format`, `paper`, `dpi` as above.

- [ ] **Step 2: Rebuild `download()`** — one line choosing the canvas: `format === "single" ? renderPhoto(image, size, dpi, hasName, name, { zoom, position }) : renderSheet(image, size, paper, dpi, hasName, name, { zoom, position })`, filename `${size}x${size}-id-photo${hasName ? "-with-name" : ""}.png` for single, `4up-${size}x${size}-${paper === "a4" ? "a4" : "letter"}-sheet.png` for sheet. Old inline canvas code deleted.

- [ ] **Step 3: Rail UI** — below "photo size": a "print format" pair of buttons (`single photo` / `4-up sheet`, same selected style as size buttons); when `sheet`: a "paper size" pair (`a4` / `us letter`). Below the name-strip section: a "resolution" pair (`300 dpi` / `600 dpi`). Spec rail order: size → format → paper → name strip → resolution. All pairs reuse the existing `aria-pressed` button pattern (`src/App.tsx:445-458`).

- [ ] **Step 4: Download button label** mirrors reality: `download 4-up sheet` vs `download photo` (`src/App.tsx:551-558`).

- [ ] **Step 5: Hero copy** (`src/App.tsx:269-273`) drops the hard-coded "300 dpi" claim: "…download a crisp 1×1 or 2×2 print — single or a 4-up sheet — with an optional name strip."

- [ ] **Step 6: Verify in the live tab** (browser tools, dev server already running)

- upload a portrait → select `4-up sheet` + `us letter` + `600 dpi` → download → PNG downloads at 5100×6600 px
- single + 300 dpi still downloads exactly as before (600×600 for 2×2)
- with no photo: format buttons work, download disabled
- `npx tsc --noEmit` clean

### Task 3: True-to-output preview (larger)

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `renderPhoto` / `renderSheet` with a capped preview dpi.
- Produces: `PREVIEW_DPI = 150` module constant; a `<canvas>` preview replacing the current CSS-mockup card (`src/App.tsx:510-548`).

- [ ] **Step 1: Add `PREVIEW_DPI = 150`** near `ACCEPTED_TYPES` with a one-line comment: `preview renders at capped dpi so a 600 dpi A4 sheet never re-renders per keystroke`.

- [ ] **Step 2: Replace the CSS mockup card** with a canvas preview: `useEffect` (add `useEffect` to the React import) keyed on `[image, imageUrl, zoom, position, size, hasName, name, format, paper, dpi]`; when `image` is loaded, render at `PREVIEW_DPI` into an offscreen canvas via the same render functions, then `drawImage` it scaled into the visible preview canvas at fixed display size — single: square, ~360px wide; sheet: page aspect (w/h from `PAPERS[paper]`), height ~420px. When no photo: show the existing empty composition outline (reuse `CompositionMark` small) instead of a blank canvas. Keep `aria-hidden` off; give the canvas `role="img"` and a label like `preview of {format}`.

- [ ] **Step 3: Meta text** beside the preview names the real output: single → "`{size} × {size} inch png — {size*dpi} × {size*dpi} pixels`"; sheet → "`4-up on {a4 | us letter} — {pageW} × {pageH} pixels`" (from the layout at chosen dpi).

- [ ] **Step 4: Verify in the live tab**

- drag to 30/70 + zoom 1.8: preview cell matches the editor crop; download single at 600 dpi matches preview
- type in the name field: preview strip updates, no lag spike (canvas stays at 150 dpi)
- toggle format single↔sheet: preview swaps photo↔page proportions smoothly
- sheet preview shows the 4 copies and cut ticks at page proportions

### Task 4: Larger editor + design-system pass + docs

**Files:**
- Modify: `src/App.tsx`, `DESIGN.md`

- [ ] **Step 1: Grow the editor** — raise the frame wrapper from `max-w-[520px]` (`src/App.tsx:302`) to fill the column (`max-w-[640px]`), and bump the layout grid right rail minimum from `340px` (`src/App.tsx:276`) so the preview card breathes (`minmax(380px,0.9fr)`). Check mobile: at 390px viewport nothing overflows (columns stack; `lg:` breakpoint unchanged).

- [ ] **Step 2: DESIGN.md** — append a short "print sheet" section: sheet format rule (4 copies, 2×2, even gaps, tick cut marks), `PREVIEW_DPI` rule, resolution choices, and the sharpening shortcut note.

- [ ] **Step 3: Final verification**

- `npx tsc --noEmit` clean
- `npm run build` clean
- `npm test` passes
- live tab: full flow upload → crop → sheet → download at each dpi; mobile 390px overflow probe (evaluate `document.documentElement.scrollWidth === 390`)
- visual check at desktop + 390px via browser screenshot; compare against the design system (red/blue/yellow rationing unchanged; new buttons reuse existing selected/idle patterns)
