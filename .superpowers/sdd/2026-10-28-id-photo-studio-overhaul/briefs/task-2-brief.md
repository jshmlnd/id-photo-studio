# Task 2: Rail controls + download wiring

## Global Constraints (bind this task)

- No new dependencies. No git repo — no commits; verification steps are the gate.
- Design system fixed: `--color-ink #17150f`, `--color-active #d64533`, `--color-structure #2b5aa7`, `--color-alert #f0b429`, Jost, all-lowercase UI copy. New buttons reuse the existing `aria-pressed` selected/idle button pattern (`src/App.tsx:445-458`).
- Crop semantics must not change: the crop block now lives in `src/photo.ts` `renderPhoto` and must not be edited.
- Blank name on an enabled strip prints an empty white strip (established behavior).
- Blob-URL revocation stays inside the `setImageUrl` updater (`src/App.tsx:118-124`); never move it to an effect cleanup (StrictMode).
- Line references in this brief are pre-change pointers from the original file — locate sections by their content, not line numbers.

## Files

- Modify: `src/App.tsx` (only)

## Interfaces (Task 1 produced these in `src/photo.ts` — use exactly)

```ts
import { PAPERS, renderPhoto, renderSheet, exportPng, type CropSpec } from "./photo"
// renderPhoto(image: HTMLImageElement, sizeIn: 1 | 2, dpi: number, hasName: boolean, name: string, crop: CropSpec): HTMLCanvasElement
// renderSheet(image: HTMLImageElement, sizeIn: 1 | 2, paperKey: "a4" | "letter", dpi: number, hasName: boolean, name: string, crop: CropSpec): HTMLCanvasElement
// exportPng(canvas: HTMLCanvasElement, filename: string): void
// PAPERS: { a4: { wIn: 8.27, hIn: 11.69, label: "A4" }, letter: { wIn: 8.5, hIn: 11, label: "Letter" } }
```

## Steps

- [ ] **Step 1: Add state** after `size` (currently `const [size, setSize] = useState<1 | 2>(2)` at ~line 79): `format: "single" | "sheet"` (default `"single"`), `paper: "a4" | "letter"` (default `"a4"`), `dpi: 300 | 600` (default `300`).

- [ ] **Step 2: Rebuild `download()`** — one line choosing the canvas: `format === "single" ? renderPhoto(image, size, dpi, hasName, name, { zoom, position }) : renderSheet(image, size, paper, dpi, hasName, name, { zoom, position })`, then `exportPng(canvas, filename)`. Filename: single → `${size}x${size}-id-photo${hasName ? "-with-name" : ""}.png`; sheet → `4up-${size}x${size}-${paper === "a4" ? "a4" : "letter"}-sheet.png`. The old inline canvas code is deleted — `download()` becomes a thin dispatcher.

- [ ] **Step 3: Rail UI** — below "photo size": a "print format" pair of buttons (`single photo` / `4-up sheet`, same selected style as the size buttons); when `sheet`: a "paper size" pair (`a4` / `us letter`). Below the name-strip section: a "resolution" pair (`300 dpi` / `600 dpi`). Spec rail order: photo size → format → paper (sheet only) → name strip → resolution → preview → download. All pairs reuse the existing `aria-pressed` button pattern.

- [ ] **Step 4: Download button label** mirrors reality: `download 4-up sheet` vs `download photo` (button at the bottom of the aside).

- [ ] **Step 5: Hero copy** (the paragraph under the h1) drops the hard-coded "300 dpi" claim: "…download a crisp 1×1 or 2×2 print — single or a 4-up sheet — with an optional name strip." Keep the single-case voice and `&mdash;` JSX-entity style used there.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` → clean; `npm run build` → clean.
(The controller performs the live-tab browser verification separately — you do not need browser tools.)
