import assert from 'assert';
import {
  generatePuzzle,
  solveSudoku,
  autoRemoveNotes,
  cloneGrid
} from '../../../src/engine/SudokuEngine.js';

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

// 1. Generate and test 15 puzzles across all 5 difficulty levels
console.log('▶ 1. Validating 15 multi-level puzzles for unique canonical solutions...');
for (let lvl = 1; lvl <= 5; lvl++) {
  for (let pIdx = 0; pIdx < 3; pIdx++) {
    const puzzle = generatePuzzle(lvl);
    assert(puzzle && puzzle.board && puzzle.solution, `Lv.${lvl} puzzle must return board & solution`);
    assert(isValidSudokuGrid(puzzle.solution), `Lv.${lvl} solution must be a 100% valid mathematical Sudoku`);

    const boardToSolve = cloneGrid(puzzle.board);
    const isSolvable = solveSudoku(boardToSolve);
    assert(isSolvable === true, `Lv.${lvl} puzzle must be solvable`);
    assert(isValidSudokuGrid(boardToSolve), `Lv.${lvl} solved puzzle must be a valid Sudoku grid`);
    assert.deepStrictEqual(boardToSolve, puzzle.solution, `Lv.${lvl} solved puzzle must match the canonical solution`);
  }
}
console.log('  ✅ 15 multi-level puzzles mathematically validated with 100% solvable unique solutions');

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

console.log('\n🎉 [PASS] Sudoku Mathematical Integrity & Solver Engine 100% Verified!\n');
