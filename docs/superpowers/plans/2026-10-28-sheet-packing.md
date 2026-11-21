# Sheet Packing Implementation Plan (tight 2×2, top-left)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (chosen: inline) to implement this plan. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Pack the 4-up sheet as a tight 2×2 grid anchored at the top-left (5 mm margin, ~2 mm cut gap) with gap-midline hairline cut guides.

**Architecture:** `layoutSheet` cell math + `renderSheet` cut-mark drawing change; test assertions flip; DESIGN.md updated. No interface changes.

**Tech Stack:** TypeScript + canvas; Node assert test via `npm test`.

**Spec:** `docs/superpowers/specs/2026-10-28-sheet-packing-design.md`

## Global Constraints

- No new dependencies; no git repo (no commits).
- Return shape of `layoutSheet` unchanged (`{ pageW, pageH, cell, cells, gap }`); App.tsx needs no edits.
- Gaps clamped non-negative (`Math.max(0, …)`).
- Design tokens/voice unchanged.

---

### Task 1: top-left packing + hairline cut guides

**Files:**
- Modify: `src/photo.test.ts` (RED first), `src/photo.ts`, `DESIGN.md`

**Interfaces:**
- Consumes: existing `layoutSheet(paperIn, sizeIn, dpi)` signature (unchanged).
- Produces: same shape; cells now top-left-packed.

- [ ] **Step 1 (RED): rewrite `src/photo.test.ts` assertions** — Letter 2×2@300: `cells[0] = {x: 60, y: 60}`, `cells[1] = {x: 684, y: 60}`, `cells[2] = {x: 684, y: 684}`, `gap === 24`, `pageW === 2550`; A4 2×2@600: `cells[0] = {x: 120, y: 120}`, `cells[3].x === 120`, block width `120+1200+48+1200+120 = 2688 ≤ pageW`; A4 1×1@300: `cell === 300`, block `744 ≤ pageW`; keep a positive-gap assertion for every combo.

- [ ] **Step 2: Run `npm test` — expect FAIL** (current centered layout fails the top-left assertions).

- [ ] **Step 3 (GREEN): implement in `src/photo.ts`** — `layoutSheet`: `margin = Math.round(0.2 * dpi)`, `cutGap = Math.max(0, Math.round(0.08 * dpi))`, cells per spec; `renderSheet`: replace edge ticks with hairlines along column/row gap midlines spanning the block (`strokeStyle rgba(23,21,15,0.55)`, width `max(1, round(dpi/100))`).

- [ ] **Step 4: Run `npm test` — expect PASS**; `npx tsc --noEmit` clean; `npm run build` clean.

- [ ] **Step 5: Update `DESIGN.md` print-sheet section** — packed 2×2, 5 mm margin, ~2 mm cut gap, hairline gap-midline guides.

- [ ] **Step 6: Live verification (controller)** — preview shows the packed top-left block with hairline guides; download produces the new layout.
