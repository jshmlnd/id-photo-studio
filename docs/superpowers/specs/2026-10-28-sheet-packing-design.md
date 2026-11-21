# Sheet packing: tight 2×2 at top-left

Date: 2026-10-28
Status: approved (user picked "Tight 2×2, top-left" + "5mm margin" in conversation)

## Change

The 4-up sheet currently centers the 2×2 grid with large gaps. The user wants
the classic print-shop packing: the grid tight together, anchored near the
page's top-left corner.

- `layoutSheet`: margin = `round(0.2 * dpi)` (5 mm), cutGap = `round(0.08 * dpi)`
  (~2 mm). Cells packed: TL `(m, m)`, TR `(m+cell+g, m)`, BR `(m+cell+g, m+cell+g)`,
  BL `(m, m+cell+g)`. Return shape unchanged.
- `renderSheet`: cut guides become thin hairlines along the two gap midlines,
  spanning the block (they run inside the white gap channels only). Width
  `max(1, round(dpi/100))`, ink at 0.55.
- Test: assertions flip from centered-symmetric to top-left packing + fit.
- `DESIGN.md`: layout rule updated.

## Approaches

- Packed grid with small cut gap (chosen — standard print-shop form, scissors
  have a channel to follow).
- One row of 4 — rejected: user chose tight 2×2.
- Zero margin — rejected by user in favor of a 5 mm printer-safe margin.

## Non-goals

No changes to photo sizes, dpi choices, preview behavior, or single-photo export.
