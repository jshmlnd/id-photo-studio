# Task 4: Larger editor + design-system pass + docs

## Global Constraints (bind this task)

- No new dependencies. No git repo — no commits; verification is the gate.
- Design system fixed: ink `#17150f`, active `#d64533`, structure `#2b5aa7`, alert `#f0b429`, Jost, all-lowercase UI copy. Rebalance without adding new tokens or colors.
- `src/photo.ts` is read-only for this task.
- Mobile must not regress: at a 390px viewport, `document.documentElement.scrollWidth` must be 390 (columns stack below the `lg:` breakpoint).
- Line references are pre-change pointers — locate by content.

## Files

- Modify: `src/App.tsx`, `DESIGN.md`

## Steps

- [ ] **Step 1: Grow the editor** — the editor frame wrapper is currently `max-w-[520px]`; raise it to fill the column (`max-w-[640px]`). Bump the layout grid's right rail minimum from `minmax(340px,0.8fr)` to `minmax(380px,0.9fr)` so the new canvas preview breathes. Verify the 390px viewport still stacks without overflow (the grid switches at `lg:`; smaller screens stack vertically).

- [ ] **Step 2: DESIGN.md** — append a short "print sheet" section documenting:
  - sheet format rule: 4 copies of the photo, 2×2, even 3-way gaps on both axes, gap-midline cross cut marks (width `max(1, dpi/100)` px, length `0.06 in`, color ink at 55%), no other marks
  - `PREVIEW_DPI = 150` rule: preview renders the same render functions at capped dpi; export uses the chosen dpi
  - resolution choices: 300/600 dpi export; quality path = stepped halving downscale + high smoothing + slight contrast sharpen
  - the sharpening shortcut note: no true unsharp mask; upgrade if print samples look soft
  - Match the document's existing section style (it has token frontmatter + canonical sections; add the section where it fits the existing order).

- [ ] **Step 3: Final verification** — the controller runs these; your checks are `npx tsc --noEmit` clean and `npm run build` clean.
