# ID Photo Studio — overhaul: 4-up sheet, larger preview, output quality

Date: 2026-10-28
Status: awaiting approval

## Intent

The studio produces a single cropped photo today. This overhaul makes its
output genuinely usable for real ID printing: a 4-up sheet on full-page
paper (the standard print-shop format you cut apart), sharper
higher-resolution exports, and a preview that shows the real product at a
usable size.

## Goals

- **4-up sheet output**: 4 copies of the chosen photo on one portrait page
  (A4 210×297 mm, or US Letter 8.5×11 in) at the chosen photo size
  (1×1 or 2×2 inch), with thin cut marks between copies. Exports as PNG.
- **Output quality**: resolution choice of 300 or 600 dpi. High-quality
  resampling on export (stepped downscale + light unsharp sharpening)
  instead of browser-default smoothing.
- **Larger preview**: the preview card becomes a true rendering of the
  exact output — single photo at generous size, or the full sheet at page
  proportions with cut marks. The editor frame also grows.
- **UX/design pass**: keep the Bauhaus workshop system (white grid ground,
  red = active, blue = structure, yellow = alert, Jost, single-case voice).
  Rebalance the setup rail for the new format/paper/resolution controls
  without adding noise.

## Non-goals

- No new photo sizes beyond 1×1 and 2×2.
- No PDF export, no print stylesheet — downloads stay PNG (print scaling
  breaks dpi accuracy; a PDF lib is a dependency for nothing).
- No face detection or auto-crop.
- No server, accounts, or storage — the app stays fully local.

## Approaches considered

- **Shared canvas renderer (chosen)** — one function draws the cropped
  photo + name strip at any size/dpi; single and sheet exports reuse it,
  so both match the editor's crop semantics exactly (the current
  export-vs-preview drift bug is the cautionary tale).
- Browser print stylesheet — rejected: "download a file" is the product
  promise; browser print scaling destroys exact dimensions.
- PDF via jsPDF — rejected: printers accept PNG; no new dependency.

## User-approved decisions

- Sheet = 4 copies of one photo (pharmacy/visa style). Not a mixed grid.
- Paper = A4/Letter, chosen at export time.
- Sheet lives in the setup rail as a **format choice** (single photo vs
  4-up sheet); the preview always shows exactly what downloads.

## Build notes (what's left to the builder)

- `renderPhoto(ctx, …)` extracted from the current `download()` logic,
  preserving its crop semantics (cover crop from object-position, then
  center-anchored zoom, name strip below, bottom 16% allowance).
- Sheet layout: page canvas at target dpi, 2×2 copies centered with even
  margins, 1px cut marks (tick marks at edges preferred over full
  cross-hair grid); sheet previews at page aspect ratio.
- Rail order: photo size → format (single / 4-up) → paper (A4/Letter,
  sheet only) → name strip → resolution (300/600 dpi) → preview → download
  (label names the actual output, e.g. "download 4-up sheet").
- Multi-step downscale (halving steps) + unsharp mask; imageSmoothingQuality
  "high" everywhere; document the chosen sharpening amount in DESIGN.md.
- Fits on one page: verify layout math so 4× 2×2 + margins fits A4 and
  Letter at both resolutions.
- Touch/keyboard interactions from the polish pass must keep working.
