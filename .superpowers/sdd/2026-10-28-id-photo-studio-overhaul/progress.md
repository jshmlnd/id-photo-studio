# SDD ledger — plan: docs/superpowers/plans/2026-10-28-id-photo-studio-overhaul.md

Environment ruling: **no git repo** at E:\GitHub\christerklein-website. Adaptation of this skill's git machinery: no worktree, no commits, no git-diff review packages. Before each task dispatch, a BASE snapshot (copies of the files the task may touch) is written to `snapshots/task-N-base/`; the reviewer gets BASE vs after snapshots as its diff. Ruling cost: if wrong (user expected git history), history can be initialized later and this ledger documents intent.

## Pre-flight scan

| Pair | Shares | One produces / other consumes | Finding | Ruling |
|---|---|---|---|---|
| T1→T2 | photo.ts signatures | T2 calls `renderPhoto(image, sizeIn, dpi, hasName, name, crop)`, `renderSheet(image, sizeIn, paperKey, dpi, hasName, name, crop)`, `exportPng(canvas, filename)`, `PAPERS` | Argument order matches in both briefs | none |
| T2→T3 | App.tsx preview card | T3 replaces the CSS mockup card T2 leaves in place | T3's line refs (510-548) go stale after T2's edits | Briefs' line refs are pre-change pointers; implementers locate by content |
| T3→T4 | App.tsx layout | T4 bumps frame/rail sizes after T3's preview swap | Same file, sequential | none |
| T1 self | test values | Letter@300: 2550×3300, cell 600; A4@600: pageW = Math.round(8.27×600) = 4962; cell 1200 | Plan test math self-consistent | none |
| T1 self | renderPhoto extraction | Moving download() body into photo.ts; drawResampled replaces the single drawImage | Extraction, not duplication — no rubric conflict | none |

Scan otherwise clean.

## Progress

- Task 1: complete (review clean: spec ✅, quality Approved; 4 Minor parked: missing shortcut comment on drawResampled, untested cut-mark geometry [visual check planned in Task 3], package.json formatting, PAPERS labels "A4"/"Letter")
  - Ruling: PAPERS labels left as "A4"/"Letter" — Task 2 owns display copy and may map them; cost if wrong: one-line label edit.
- Task 2: complete (review clean: spec ✅, quality Approved; 1 Minor parked: preview meta text hard-codes `size * 300` — superseded by Task 3 Step 3 which rewrites that block with `{size * dpi}`)
- Task 3: complete (review clean: spec ✅, quality Approved; 3 Minor deferred to final review: meta hint lines dropped, unused `dpi` in effect deps [plan-mandated], canvas lacks HiDPI backing scale)
- Task 1 fix round 1/5 (1 addressed, 0 open — tick visibility; re-review clean) → Task 1 closed
- Task 4: complete (review clean: spec ✅, quality Approved; 2 Minor deferred to final review: DESIGN.md tick-width wording unrounded vs code's round(), "nothing else" line overstates vs cut marks; ruling: mobile probe `scrollWidth 380 < 390` is acceptable — 390 minus iframe scrollbar, zero overflowing elements is the gate)
- All tasks complete → final whole-branch review
- Final review: Ready to merge — Yes (0 Critical, 0 Important; 10 Minors; fix wave dispatched)
- Final fix wave: 6/6 ADDRESSED, re-review clean, no new breakage. Live check after: "4-up on us letter — 2550 × 3300 pixels" ✓
- Ruling: workspace NOT deleted — no git repo exists, so this ledger is the only execution record; deleting it would orphan the history the skill assumes git provides.
- DONE.
