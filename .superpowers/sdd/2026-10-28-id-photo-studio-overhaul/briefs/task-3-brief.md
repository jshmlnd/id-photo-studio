# Task 3: True-to-output preview (larger)

## Global Constraints (bind this task)

- No new dependencies. No git repo — no commits; verification is the gate.
- Design system fixed: ink `#17150f`, active `#d64533`, structure `#2b5aa7`, alert `#f0b429`, Jost, all-lowercase UI copy. The preview is not a place for new colors; reuse tokens.
- Crop semantics must not change: `src/photo.ts` is read-only for this task.
- Blank name on an enabled strip prints an empty white strip (established behavior — the preview must match: blank strip shows as white).
- Blob-URL revocation stays inside the `setImageUrl` updater; never move it to an effect cleanup (StrictMode). Effects are fine, but that revocation never moves.
- Line references are pre-change pointers from before Tasks 1-2 — locate sections by content, not line numbers.

## Files

- Modify: `src/App.tsx` (only)

## Interfaces (Task 1 produced these in `src/photo.ts` — use exactly)

```ts
import { PAPERS, renderPhoto, renderSheet, type CropSpec } from "./photo"
// renderPhoto(image, sizeIn: 1 | 2, dpi: number, hasName: boolean, name: string, crop: CropSpec): HTMLCanvasElement
// renderSheet(image, sizeIn: 1 | 2, paperKey: "a4" | "letter", dpi: number, hasName: boolean, name: string, crop: CropSpec): HTMLCanvasElement
// PAPERS.a4 = { wIn: 8.27, hIn: 11.69, label: "A4" }, PAPERS.letter = { wIn: 8.5, hIn: 11, label: "Letter" }
```

## Carried findings this task resolves

- Task 1 parked: cut-mark geometry unverified — your browser verification must visually confirm the sheet preview shows 4 copies and cut ticks at page proportions.
- Task 2 parked: the preview's meta text hard-codes `size * 300` — Step 3 rewrites that block entirely.

## Steps

- [ ] **Step 1: Add `PREVIEW_DPI = 150`** near `ACCEPTED_TYPES` with a one-line comment: `preview renders at capped dpi so a 600 dpi A4 sheet never re-renders per keystroke`.

- [ ] **Step 2: Replace the CSS mockup card** (the "preview" section of the aside — a small photo card with aspect-ratio boxes and an `img` clone) with a canvas preview:
  - Add `useEffect` to the React import.
  - Effect keyed on `[image, imageUrl, zoom, position, size, hasName, name, format, paper, dpi]`.
  - When `image` is loaded: render at `PREVIEW_DPI` into an offscreen canvas via `renderPhoto`/`renderSheet` (single vs `format`), then `drawImage` it scaled into the visible preview canvas at fixed display size — single: square, ~360px wide; sheet: page aspect from `PAPERS[paper]` (wIn/hIn), height ~420px.
  - When no photo: show the existing empty composition outline instead of a blank canvas (reuse `CompositionMark` small, same as the editor's empty state — a static JSX block, not canvas).
  - Give the canvas `role="img"` and an `aria-label` like `preview of single photo` / `preview of 4-up sheet`.
  - Keep the `bg-ink/[0.04]` panel treatment of the old preview card.

- [ ] **Step 3: Meta text** beside the preview names the real output:
  - single → `{size} × {size} inch png — {size * dpi} × {size * dpi} pixels`
  - sheet → `4-up on {PAPERS[paper].label lowercase} — {pageW} × {pageH} pixels` (page dims from the layout math at the chosen dpi — either call `layoutSheet` or compute `Math.round(wIn * dpi)`; match what renderSheet produces)

- [ ] **Step 4: Verify** — the controller performs browser verification; your checks are `npx tsc --noEmit` clean, `npm run build` clean, `npm test` passing.
