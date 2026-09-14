import assert from 'assert';
import {
  generatePuzzle,
  solveSudoku,
  autoRemoveNotes,
  generateFullSolution,
  calculateRemainingCounts,
  findNextIncompleteNumber,
  cloneGrid
} from '../../../src/engine/SudokuEngine.js';
import { detectSudokuConflict } from '../../../src/engine/conflictDetector.js';
import { ensureValidSolution } from '../../../src/hooks/useGameInput.js';

console.log('======================================================');
console.log('🧪 Testing Sudoku Mathematical Integrity & Puzzle Solvability');
console.log('======================================================\n');

function isValidSudokuGrid(grid) {
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set();
    const colSet = new Set();
    for (let j = 0; j < 9; j++) {
      const rVal = grid[i][j];
      const cVal = grid[j][i];
      if (rVal < 1 || rVal > 9 || rowSet.has(rVal)) return false;
      if (cVal < 1 || cVal > 9 || colSet.has(cVal)) return false;
      rowSet.add(rVal);
      colSet.add(cVal);
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxSet = new Set();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const val = grid[boxRow * 3 + r][boxCol * 3 + c];
          if (val < 1 || val > 9 || boxSet.has(val)) return false;
          boxSet.add(val);
        }
      }
    }
  }
  return true;
}

/**
 * Count solutions without touching the engine.
 *
 * This gate used to say "unique canonical solutions" while never counting one.
 * It asserted the puzzle was solvable and that the solver's answer equalled the
 * solution shipped beside it — both of which an 81-blank board satisfies, since
 * the solver returns *a* grid and the generator can hand over that same grid.
 * Feeding the real gate fifteen empty boards produced "100% solvable unique
 * solutions" and exit 0.
 *
 * Counting with the engine's own countSolutions would not fix that: the
 * generator decides which clues to remove by calling countSolutions, so it
 * would be marking its own work. This is a plain brute force — no MRV, no
 * shared helpers — and it validates the givens first, because a grid that
 * already breaks the rules has no solutions rather than any.
 */
function countSolutionsIndependently(grid, limit = 2) {
  const g = grid.map((row) => [...row]);
  const legal = (r, c, v) => {
    for (let i = 0; i < 9; i++) {
      if (i !== c && g[r][i] === v) return false;
      if (i !== r && g[i][c] === v) return false;
    }
    const br = r - (r % 3), bc = c - (c % 3);
    for (let i = br; i < br + 3; i++) {
      for (let j = bc; j < bc + 3; j++) {
        if ((i !== r || j !== c) && g[i][j] === v) return false;
      }
    }
    return true;
  };
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) if (g[r][c] !== 0 && !legal(r, c, g[r][c])) return 0;
  }

  let found = 0;
  const recurse = () => {
    let r = -1, c = -1;
    outer: for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) if (g[i][j] === 0) { r = i; c = j; break outer; }
    }
    if (r === -1) { found++; return; }
    for (let v = 1; v <= 9 && found < limit; v++) {
      if (!legal(r, c, v)) continue;
      g[r][c] = v;
      recurse();
      g[r][c] = 0;
    }
  };
  recurse();
  return found;
}

// 0. The counter is the instrument for everything below it, so it is checked
//    against grids whose answer is known before it is trusted on generated ones.
console.log('▶ 0. Calibrating the independent solution counter...');
{
  const full = generateFullSolution();
  assert(isValidSudokuGrid(full), 'generateFullSolution must produce a valid grid');

  const oneBlank = cloneGrid(full);
  oneBlank[4][4] = 0;
  assert.strictEqual(countSolutionsIndependently(oneBlank, 3), 1,
    'a full grid with one cell blanked has exactly one solution');

  const empty = Array(9).fill(null).map(() => Array(9).fill(0));
  assert.strictEqual(countSolutionsIndependently(empty, 2), 2,
    'an empty board must reach the limit of 2 — this is the bait the old gate swallowed');

  const contradictory = cloneGrid(full);
  contradictory[0][1] = contradictory[0][0];
  assert.strictEqual(countSolutionsIndependently(contradictory, 2), 0,
    'a grid with a duplicate in a row has no solutions');
}
console.log('  ✅ Counter returns 1 / 2 / 0 on known unique, ambiguous and contradictory grids');

// 1. Generate and test 15 puzzles across all 5 difficulty levels
console.log('\n▶ 1. Validating 15 multi-level puzzles for unique canonical solutions...');
for (let lvl = 1; lvl <= 5; lvl++) {
  for (let pIdx = 0; pIdx < 3; pIdx++) {
    const puzzle = generatePuzzle(lvl);
    assert(puzzle && puzzle.board && puzzle.solution, `Lv.${lvl} puzzle must return board & solution`);
    assert(isValidSudokuGrid(puzzle.solution), `Lv.${lvl} solution must be a 100% valid mathematical Sudoku`);

    // A puzzle whose clues disagree with its own solution is unsolvable as
    // shipped even when both halves are individually valid.
    let clues = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.board[r][c] === 0) continue;
        clues++;
        assert.strictEqual(puzzle.board[r][c], puzzle.solution[r][c],
          `Lv.${lvl} clue at [${r},${c}] must match the shipped solution`);
      }
    }
    assert(clues >= 17 && clues < 81,
      `Lv.${lvl} puzzle must have between 17 and 80 clues, got ${clues}`);

    // The claim in this section's title, actually checked — and checked BEFORE
    // the solver assertions below. An ambiguous puzzle usually trips
    // deepStrictEqual first, because the solver is free to return whichever
    // valid grid it reaches and that need not be the one shipped alongside. The
    // mutation audit reported WRONG_REASON for exactly that: the gate went red
    // on a mutation that removed the uniqueness guarantee, but for the wrong
    // assertion, which leaves the uniqueness check itself unproven.
    assert.strictEqual(countSolutionsIndependently(puzzle.board, 2), 1,
      `Lv.${lvl} puzzle must have exactly one solution, counted without the engine`);

    const boardToSolve = cloneGrid(puzzle.board);
    const isSolvable = solveSudoku(boardToSolve);
    assert(isSolvable === true, `Lv.${lvl} puzzle must be solvable`);
    assert(isValidSudokuGrid(boardToSolve), `Lv.${lvl} solved puzzle must be a valid Sudoku grid`);
    assert.deepStrictEqual(boardToSolve, puzzle.solution, `Lv.${lvl} solved puzzle must match the canonical solution`);
  }
}
console.log('  ✅ 15 multi-level puzzles: exactly one solution each (independently counted), clues consistent with the shipped solution');

// 2. Auto-Remove Notes Algorithm Precision
console.log('\n▶ 2. Testing Smart Auto-Remove Notes Precision...');
const testNotes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => [1, 2, 3, 4, 5, 6, 7, 8, 9]));

// Place '5' at row 4, col 4 (Center box, 5th row, 5th col)
const cleanedNotes = autoRemoveNotes(testNotes, 4, 4, 5);

// Row 4 should have NO 5 in any col
for (let c = 0; c < 9; c++) {
  assert(!cleanedNotes[4][c].includes(5), `Row 4, Col ${c} must NOT have note 5`);
}
// Col 4 should have NO 5 in any row
for (let r = 0; r < 9; r++) {
  assert(!cleanedNotes[r][4].includes(5), `Row ${r}, Col 4 must NOT have note 5`);
}
// Center Box (rows 3..5, cols 3..5) should have NO 5
for (let r = 3; r <= 5; r++) {
  for (let c = 3; c <= 5; c++) {
    assert(!cleanedNotes[r][c].includes(5), `Center box Cell (${r}, ${c}) must NOT have note 5`);
  }
}
// Top-Left Cell (0, 0) should STILL have note 5 (outside peer zone)
assert(cleanedNotes[0][0].includes(5), 'Cell (0, 0) outside peer zone must retain note 5');
console.log('  ✅ Auto-Remove Notes peer-zone isolation mathematically verified');

// 3. ensureValidSolution Immutability & Array Return Integrity
console.log('\n▶ 3. Testing ensureValidSolution Immutability & Valid Array Return...');

const freshEmptyGrid = Array(9).fill(null).map(() => Array(9).fill(0));
const solvedGrid = ensureValidSolution(freshEmptyGrid, null);

// Must return an Array (NOT a boolean true/false)
assert(Array.isArray(solvedGrid), 'ensureValidSolution must return a 2D Array, NEVER a boolean');
assert.strictEqual(solvedGrid.length, 9, 'Solved grid must have 9 rows');
assert(isValidSudokuGrid(solvedGrid), 'ensureValidSolution must return a 100% valid solved Sudoku grid');

// Input grid MUST NOT be mutated in place
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    assert.strictEqual(freshEmptyGrid[r][c], 0, `freshEmptyGrid[${r}][${c}] must remain 0 (Zero Mutation)`);
  }
}
console.log('  ✅ ensureValidSolution returns valid 9x9 solution array with zero state mutation');

// 4. Conflict diagnostics and fast-entry advance
//
// These two came from scripts/tests/run_e2e_tests.js, which `npm run test:e2e`
// pointed at. That file had not run since its imports were rewritten to
// ../src/ — a path that resolves to scripts/src/ and has never existed — so it
// died at load with ERR_MODULE_NOT_FOUND while still being listed as a test
// command. Most of what it contained proved nothing (`typeof 'home' ===
// 'string'`, thirteen times over, under the banner "ALL 43+ USER PATHWAYS
// PROVEN FLAWLESS"). These are the assertions that were actually doing work and
// had no cover anywhere in the pipeline, so they moved here and the file went.
console.log('\n▶ 4. Testing conflict diagnostics and fast-entry advance...');
{
  const conflictBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];
  const at = (r, c, v) => detectSudokuConflict(conflictBoard, r, c, v, 1, false, (k) => k);

  assert.strictEqual(at(0, 6, 5)?.type, 'row', 'duplicate across boxes in one row is a row conflict');
  assert.strictEqual(at(3, 0, 5)?.type, 'col', 'duplicate across boxes in one column is a col conflict');
  assert.strictEqual(at(2, 2, 3)?.type, 'box', 'duplicate inside one 3x3 block is a box conflict');
  assert.strictEqual(at(0, 2, 5)?.type, 'multiple', 'a placement breaking row and box at once is multiple');
  // The control the original file never had. This helper is only called on an
  // entry already known to be wrong, so it always returns something; a digit
  // that duplicates nothing must come back as 'logic' (not the answer) rather
  // than as a rule violation. Without this, a detector that called everything
  // 'multiple' would still pass the four assertions above.
  assert.strictEqual(at(0, 2, 4)?.type, 'logic',
    'a placement that duplicates nothing is a logic miss, not a rule violation');

  const allOnes = Array(9).fill(null).map(() => Array(9).fill(1));
  const counts = calculateRemainingCounts(allOnes);
  assert.strictEqual(Object.keys(counts).length, 9, 'remaining counts cover digits 1..9');
  const next = findNextIncompleteNumber(1, counts);
  assert(next !== 1 && next >= 2 && next <= 9, `fast entry must advance off a finished digit, got ${next}`);
}
console.log('  ✅ Row, column, box and combined conflicts classified; a non-duplicate reads as a logic miss; fast entry advances');

console.log('\n🎉 [PASS] Sudoku Mathematical Integrity, Immutability & Solver Engine 100% Verified!\n');
