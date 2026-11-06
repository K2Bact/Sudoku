/**
 * Gate 2-35 — The Walkthrough Points At Cells Whose Answer It Knows (KP-18).
 *
 * The first-game walkthrough (2026-11-06) asks the player to put a named digit in
 * a glowing cell and moves on only when they do. If it ever named a wrong digit the
 * player could not go on, or would learn something false. The old walkthrough named
 * fixed cells ("row 1, col 3 — enter 9") on a puzzle that is new every time.
 *
 * On many generated boards, standard and killer, at Lv.1 (what the walkthrough
 * plays) and at other levels:
 *   1. a single: the cell has exactly one candidate and it is the solution
 *   2. a note cell: 2-4 candidates, the solution among them, not the single's cell
 *   3. the last cell of a cage: the cage sum minus the rest is the solution
 *   4. the rule of 45: 45 minus the cages wholly inside the house minus the rest is
 *      the solution; the cell is not just the last open cell of its own cage
 *   5. a wrong entry left on the board narrows nothing — a cell counts only when it
 *      holds its solution — and the finders still answer right
 *   6. how often each is found at Lv.1: the walkthrough relies on them being there
 *   7. useGuidedTutorial keeps the target with its step (the killer walkthrough once
 *      skipped the rule of 45 because the next step saw the last step's cell)
 */
import assert from 'node:assert/strict';
import fs from 'fs';
import { generatePuzzle } from '../../../src/engine/SudokuEngine.js';
import { generateKillerPuzzle } from '../../../src/engine/killer/killerGenerator.js';
import { candidatesAt, findSingleCell, findNoteCell, findCageLastCell, findRule45Cell } from '../../../src/utils/guidedTargets.js';

console.log('======================================================');
console.log('🧭 Gate 2-35: The walkthrough points at cells whose answer it knows');
console.log('======================================================');

const N = 40;
const found = { single: 0, note: 0, cage: 0, rule45: 0 };
const clone = (g) => g.map((row) => [...row]);

for (let i = 0; i < N; i++) {
  for (const level of [1, 3]) {
    const p = generatePuzzle(level);
    const one = findSingleCell(p.puzzle, p.solution);
    if (one) {
      if (level === 1) found.single++;
      assert.deepEqual(candidatesAt(p.puzzle, p.solution, one.r, one.c), [one.num], `single at r${one.r + 1}c${one.c + 1} must have exactly one candidate`);
      assert.equal(one.num, p.solution[one.r][one.c], 'and it must be the solution');
      assert.equal(p.puzzle[one.r][one.c], 0, 'and the cell must be empty');
    }
    const note = findNoteCell(p.puzzle, p.solution, one);
    if (note) {
      if (level === 1) found.note++;
      assert(note.cands.length >= 2 && note.cands.length <= 4, 'a note cell has 2 to 4 candidates');
      assert(note.cands.includes(p.solution[note.r][note.c]), 'the note candidates include the solution');
      assert(!(one && one.r === note.r && one.c === note.c), 'the note cell is not the single\'s cell');
    }
  }
  for (const level of [1, 2]) {
    const k = generateKillerPuzzle(level);
    const cage = findCageLastCell(k.puzzle, k.solution, k.cages);
    if (cage) {
      if (level === 1) found.cage++;
      assert.equal(cage.num, k.solution[cage.r][cage.c], 'the last cell of a cage: its sum minus the rest is the solution');
      assert.equal(k.puzzle[cage.r][cage.c], 0, 'and the cell is empty');
      const own = k.cages.find((cg) => cg.cells.includes(cage.r * 9 + cage.c));
      assert.equal(own.sum, cage.sum, 'and the sum named is the cell\'s own cage\'s');
    }
    const r45 = findRule45Cell(k.puzzle, k.solution, k.cages);
    if (r45) {
      if (level === 1) found.rule45++;
      assert.equal(r45.num, k.solution[r45.r][r45.c], 'the rule of 45: the difference is the solution');
      assert(r45.house.some((p) => p.r === r45.r && p.c === r45.c), 'the cell lies in the house shown');
      const own = k.cages.find((cg) => cg.cells.includes(r45.r * 9 + r45.c));
      const ownOpen = own.cells.filter((i) => !k.puzzle[Math.floor(i / 9)][i % 9]).length;
      assert(ownOpen > 1, 'the rule-of-45 cell is not just the last open cell of its own cage — that is the step before');
    }
  }
}
console.log(`  ✅ 1-4. answers checked against the solution on ${N * 2} standard and ${N * 2} killer boards`);

// 5. A wrong digit on the board is not a fact.
{
  const p = generatePuzzle(1);
  const one = findSingleCell(p.puzzle, p.solution);
  const board = clone(p.puzzle);
  // The single's own answer, wrongly, in every other empty cell of its row. Taken as facts, those
  // digits would rule the answer out of the single's cell; ignored, the same cell is found again.
  for (let c = 0; c < 9; c++) {
    if (c === one.c || board[one.r][c]) continue;
    board[one.r][c] = one.num;
  }
  assert.deepEqual(findSingleCell(board, p.solution), one, 'wrong digits on the board moved or changed the single — a wrong entry was taken as a fact');
  const k = generateKillerPuzzle(1);
  const kb = clone(k.puzzle);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!kb[r][c] && (r + c) % 4 === 0) kb[r][c] = k.solution[r][c] === 9 ? 1 : k.solution[r][c] + 1;
  const kc = findCageLastCell(kb, k.solution, k.cages);
  if (kc) assert.equal(kc.num, k.solution[kc.r][kc.c], 'with wrong digits in cages the last-cell answer is still the solution');
  const k45 = findRule45Cell(kb, k.solution, k.cages);
  if (k45) assert.equal(k45.num, k.solution[k45.r][k45.c], 'with wrong digits the rule-of-45 answer is still the solution');
}
console.log('  ✅ 5. a wrong digit on the board narrows nothing');

// 6. Found often enough at Lv.1 that the walkthrough nearly always has a cell to point at.
assert.equal(found.single, N, `a single on every standard Lv.1 board (${found.single}/${N})`);
assert.equal(found.note, N, `a note cell on every standard Lv.1 board (${found.note}/${N})`);
assert.equal(found.cage, N, `a last cell of a cage on every killer Lv.1 board (${found.cage}/${N})`);
assert(found.rule45 >= N * 0.8, `a rule-of-45 cell on at least 80% of killer Lv.1 boards (${found.rule45}/${N}); the rest show the step's text and Next`);
console.log(`  ✅ 6. at Lv.1: single ${found.single}/${N} · note ${found.note}/${N} · cage ${found.cage}/${N} · rule of 45 ${found.rule45}/${N}`);

// 7. The step's cell is kept with the step.
const hook = fs.readFileSync(new URL('../../../src/hooks/useGuidedTutorial.js', import.meta.url), 'utf8');
assert(/const target = picked\.id === id \? picked\.target : null;/.test(hook),
  'useGuidedTutorial: the target belongs to the step that picked it — otherwise a new step sees the last step\'s cell, already filled, and moves on at once');
assert(/if \(!active \|\| id === 'done' \|\| picked\.id !== id\) return;/.test(hook), 'and nothing moves on before the step has picked its own cell');
console.log('  ✅ 7. each step\'s cell is kept with the step');

console.log('\n[2-35] PASSED — the walkthrough points at cells whose answer it knows');
