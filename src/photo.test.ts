import assert from "node:assert"
import { PAPERS, layoutSheet } from "./photo.ts"

// tight 2×2 packing, 5mm margin (0.2 in), ~2mm cut gap (0.08 in), top-left anchored

// Letter 2×2 @ 300 dpi: cell 600, margin 60, gap 24, page 2550×3300
const letter2 = layoutSheet(PAPERS.letter, 2, 300)
assert.equal(letter2.pageW, 2550)
assert.equal(letter2.pageH, 3300)
assert.equal(letter2.cell, 600)
assert.equal(letter2.gap, 24)
assert.equal(letter2.cells.length, 4)
assert.deepEqual(letter2.cells[0], { x: 60, y: 60 })
assert.deepEqual(letter2.cells[1], { x: 684, y: 60 })
assert.deepEqual(letter2.cells[2], { x: 684, y: 684 })
assert.deepEqual(letter2.cells[3], { x: 60, y: 684 })
// block fits the page
assert.ok(684 + 600 + 60 <= letter2.pageW, "block fits Letter width")
assert.ok(684 + 600 + 60 <= letter2.pageH, "block fits Letter height")

// A4 2×2 @ 600 dpi: cell 1200, margin 120, gap 48, page 4962×7014
const a4 = layoutSheet(PAPERS.a4, 2, 600)
assert.equal(a4.pageW, Math.round(8.27 * 600))
assert.equal(a4.cell, 1200)
assert.equal(a4.gap, 48)
assert.deepEqual(a4.cells[0], { x: 120, y: 120 })
assert.deepEqual(a4.cells[3], { x: 120, y: 1368 })
assert.ok(120 + 1200 + 48 + 1200 + 120 <= a4.pageW, "block fits A4 width")
assert.ok(a4.gap > 0)

// A4 1×1 @ 300 dpi: cell 300, margin 60, gap 24
const a4small = layoutSheet(PAPERS.a4, 1, 300)
assert.equal(a4small.cell, 300)
assert.equal(a4small.gap, 24)
assert.deepEqual(a4small.cells[0], { x: 60, y: 60 })
assert.ok(60 + 300 + 24 + 300 + 60 <= a4small.pageW, "block fits A4 at 1×1")

console.log("layoutSheet: all assertions passed")
