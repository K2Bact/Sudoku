/**
 * Gate 2-27 — a Killer Sudoku puzzle is sound.
 *
 * A killer has no other source of truth than its generator: the cages, their
 * sums and the givens all come from one random grid, and nothing a player does
 * can reveal that a cage was cut wrong until they are stuck on a puzzle with
 * two answers or none. So this gate checks every generated puzzle against the
 * rules themselves, not against the engine:
 *
 *   1. the solver knows the rules — an obviously open puzzle is not called
 *      unique, an impossible one is not called solvable, the 45 rule adds up
 *   2. every puzzle (5 levels × 4 seeds) is well formed — cages cover the grid
 *      once, are connected, repeat no digit, add up to their sums; the givens
 *      and the solution agree, and the solution is a sudoku
 *   3. every puzzle has exactly one solution, counted by a brute force written
 *      here that shares no code with the engine — the engine's own counter
 *      would let the generator mark its own work (the lesson of gate 2-1)
 *   4. the levels look like their levels — Lv.1-3 give digits, Lv.4-5 give
 *      none, no puzzle has decayed into a grid of one-cell cages, and none
 *      needed more wrong turns than its level allows. That last number is the
 *      generator's own report; nothing outside it can grade difficulty yet
 *      (BACKLOG I-9), so it catches the cap being dropped, not a wrong cap.
 *   5. the same seed gives the same puzzle, another seed another one
 */
import assert from 'assert';
import { generateKillerPuzzle, KILLER_CONFIG } from '../../../src/engine/killer/killerGenerator.js';
import { solveKiller, innies } from '../../../src/engine/killer/killerSolver.js';

console.log('\n🔪 [2-27] Killer Sudoku puzzles are sound');

const SEEDS_PER_LEVEL = 4;
// A Lv.4-5 puzzle repaired with this many one-cell cages is a classic puzzle
// drawn as cages. Measured 2026-10-01: 100 puzzles per level averaged 3.8-4.9.
const MAX_ONE_CELL_CAGES = 12;
// Measured 2026-10-01: the plain count settles 19 of these puzzles in under
// 120,000 steps (3 s) and the Lv.5 one with 159 wrong turns in 1,430,000 (38 s).
// A puzzle it cannot settle in this many steps is harder than the levels allow.
const BRUTE_STEPS = 3000000;

const at = (grid, cell) => grid[Math.floor(cell / 9)][cell % 9];
const neighbours = (cell) => {
  const r = Math.floor(cell / 9);
  const c = cell % 9;
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
    .filter(([y, x]) => y >= 0 && y < 9 && x >= 0 && x < 9)
    .map(([y, x]) => y * 9 + x);
};

/**
 * Count solutions the plain way: fill the cell with the fewest legal digits,
 * where legal means the row, column and box do not have it, its cage does not
 * have it, and the cage can still reach its sum. No combination tables, no 45
 * rule, no candidate narrowing — only the rules as a player reads them.
 */
function bruteCount(cages, givens, limit = 2) {
  const g = givens.map((row) => [...row]);
  const cageOf = new Array(81);
  cages.forEach((cage, k) => cage.cells.forEach((cell) => { cageOf[cell] = k; }));
  const legal = (cell, d) => {
    const r = Math.floor(cell / 9);
    const c = cell % 9;
    for (let i = 0; i < 9; i++) {
      if (g[r][i] === d || g[i][c] === d) return false;
      if (g[3 * Math.floor(r / 3) + Math.floor(i / 3)][3 * Math.floor(c / 3) + (i % 3)] === d) return false;
    }
    const cage = cages[cageOf[cell]];
    let sum = d;
    let empty = 0;
    for (const other of cage.cells) {
      if (other === cell) continue;
      const v = at(g, other);
      if (v === d) return false;
      if (v) sum += v; else empty++;
    }
    let lowest = 0;
    let highest = 0;
    for (let i = 0; i < empty; i++) { lowest += i + 1; highest += 9 - i; }
    return sum + lowest <= cage.sum && sum + highest >= cage.sum;
  };
  const found = [];
  let steps = 0;
  const fill = () => {
    if (found.length >= limit) return;
    if (++steps > BRUTE_STEPS) throw new Error(`a plain search could not settle the puzzle in ${BRUTE_STEPS} steps — it is harder than any level should be`);
    let best = -1;
    let bestDigits = null;
    for (let cell = 0; cell < 81; cell++) {
      if (at(g, cell)) continue;
      const digits = [];
      for (let d = 1; d <= 9; d++) if (legal(cell, d)) digits.push(d);
      if (!digits.length) return;
      if (!bestDigits || digits.length < bestDigits.length) { best = cell; bestDigits = digits; }
      if (digits.length === 1) break;
    }
    if (best < 0) { found.push(g.map((row) => [...row])); return; }
    for (const d of bestDigits) {
      g[Math.floor(best / 9)][best % 9] = d;
      fill();
      g[Math.floor(best / 9)][best % 9] = 0;
      if (found.length >= limit) return;
    }
  };
  fill();
  return found;
}

// ── 1. The solver knows the rules ───────────────────────────────────────────
{
  const rows = [...Array(9).keys()].map((r) => ({ cells: [...Array(9).keys()].map((c) => r * 9 + c), sum: 45 }));
  const open = solveKiller(rows, null, { limit: 2 });
  assert.strictEqual(open.count, 2, `nine cages of a whole row each fit every sudoku there is, but the solver counted ${open.count} solution(s) — ${open.count === 0 ? 'it throws away real answers' : 'it would call an open puzzle unique'}`);

  const givens = Array.from({ length: 9 }, () => Array(9).fill(0));
  givens[0][0] = 9;
  const impossible = solveKiller([{ cells: [0, 1], sum: 3 }], givens, { limit: 2 });
  assert.strictEqual(impossible.count, 0, 'a 9 in a two-cell cage that adds up to 3 cannot be solved, but the solver found a solution');

  // Row 0: cells 0-6 lie in cages inside the row (sums 6 and 22), cells 7 and 8 in
  // cages that reach into row 1. So cells 7 and 8 add up to 45 - 6 - 22 = 17.
  const cages = [
    { cells: [0, 1, 2], sum: 6 },
    { cells: [3, 4, 5, 6], sum: 22 },
    { cells: [7, 16], sum: 10 },
    { cells: [8, 17], sum: 12 },
  ];
  const rowZero = innies(cages).find((group) => group.cells.includes(7) && group.cells.includes(8) && group.cells.length === 2);
  assert.ok(rowZero, 'the 45 rule did not find the two cells of row 0 left over by its whole cages');
  assert.strictEqual(rowZero.sum, 17, `the 45 rule says row 0's leftover cells add up to ${rowZero.sum}; 45 - 6 - 22 is 17`);
  console.log('  ✓ the solver: an open puzzle has many solutions, an impossible one none, and the 45 rule adds up');
}

// ── 2-4. Every generated puzzle ─────────────────────────────────────────────
for (let level = 1; level <= 5; level++) {
  for (let i = 0; i < SEEDS_PER_LEVEL; i++) {
    const seed = `gate-2-27-${level}-${i}`;
    const name = `Lv.${level} (${seed})`;
    const p = generateKillerPuzzle(level, seed);

    const owner = new Array(81).fill(-1);
    p.cages.forEach((cage, k) => {
      for (const cell of cage.cells) {
        assert.strictEqual(owner[cell], -1, `${name}: cell ${cell} is in two cages`);
        owner[cell] = k;
      }
      const reached = new Set([cage.cells[0]]);
      for (const cell of reached) for (const n of neighbours(cell)) if (cage.cells.includes(n)) reached.add(n);
      assert.strictEqual(reached.size, cage.cells.length, `${name}: the cage ${JSON.stringify(cage.cells)} is in pieces — a cage is one connected shape`);
      const digits = cage.cells.map((cell) => at(p.solution, cell));
      assert.strictEqual(new Set(digits).size, digits.length, `${name}: the cage ${JSON.stringify(cage.cells)} holds ${digits.join(',')} — a digit twice`);
      const sum = digits.reduce((a, b) => a + b, 0);
      assert.strictEqual(cage.sum, sum, `${name}: the cage ${JSON.stringify(cage.cells)} says ${cage.sum}, its digits add up to ${sum}`);
    });
    const uncovered = owner.findIndex((k) => k < 0);
    assert.strictEqual(uncovered, -1, `${name}: cell ${uncovered} is in no cage`);

    for (let u = 0; u < 9; u++) {
      const row = new Set(p.solution[u]);
      const col = new Set(p.solution.map((r) => r[u]));
      const box = new Set([...Array(9).keys()].map((j) => p.solution[3 * Math.floor(u / 3) + Math.floor(j / 3)][3 * (u % 3) + (j % 3)]));
      assert.ok(row.size === 9 && col.size === 9 && box.size === 9, `${name}: the solution repeats a digit in row, column or box ${u + 1}`);
    }
    for (let cell = 0; cell < 81; cell++) {
      const given = at(p.board, cell);
      assert.ok(!given || given === at(p.solution, cell), `${name}: cell ${cell} is given as ${given}, the solution has ${at(p.solution, cell)}`);
    }

    const found = bruteCount(p.cages, p.board);
    assert.strictEqual(found.length, 1, `${name}: has ${found.length === 0 ? 'no solution' : 'more than one solution'} — a killer must have exactly one solution`);
    assert.deepStrictEqual(found[0], p.solution, `${name}: its only solution is not the solution it shipped with`);

    const givenCount = p.board.flat().filter(Boolean).length;
    if (level <= 3) {
      assert.ok(givenCount >= KILLER_CONFIG[level].givens, `${name}: gives ${givenCount} digits, the level gives at least ${KILLER_CONFIG[level].givens}`);
    } else {
      assert.strictEqual(givenCount, 0, `${name}: gives ${givenCount} digits — Lv.4 and Lv.5 are cages only`);
    }
    const oneCell = p.cages.filter((cage) => cage.cells.length === 1).length;
    assert.ok(oneCell <= MAX_ONE_CELL_CAGES, `${name}: ${oneCell} one-cell cages — the puzzle has decayed into givens drawn as cages`);
    assert.ok(p.guesses <= KILLER_CONFIG[level].guesses, `${name}: the solver took ${p.guesses} wrong turns, the level allows ${KILLER_CONFIG[level].guesses}`);
  }
  console.log(`  ✓ Lv.${level}: ${SEEDS_PER_LEVEL} puzzles well formed, each with exactly one solution (counted by brute force), shaped like the level`);
}

// ── 5. The same seed, the same puzzle ───────────────────────────────────────
{
  const a = JSON.stringify(generateKillerPuzzle(4, 'gate-2-27-same'));
  const b = JSON.stringify(generateKillerPuzzle(4, 'gate-2-27-same'));
  const c = JSON.stringify(generateKillerPuzzle(4, 'gate-2-27-other'));
  assert.strictEqual(a, b, 'the same seed gave two different puzzles — a daily killer would differ between players');
  assert.notStrictEqual(a, c, 'two seeds gave the same puzzle');
  console.log('  ✓ the same seed gives the same puzzle, another seed another one');
}

console.log('\n✅ [2-27] PASSED — Killer Sudoku puzzles are sound');
