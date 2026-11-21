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
