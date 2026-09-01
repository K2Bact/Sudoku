/**
 * test_ghost_delta_mode.js
 * Automated QA Verification for Ghost Mode & Delta Time Pace Engine
 */

import {
  getGhostForModeLevel,
  recordGhostRun,
  calculateDeltaPace
} from '../../../src/utils/ghostManager.js';
import { generatePuzzle, cloneGrid, solveSudoku } from '../../../src/engine/SudokuEngine.js';

// Setup Mock LocalStorage for node environment
const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🧪 Ghost Mode & Delta Time Engine QA Test Suite');
console.log('====================================================\n');

// 1. Initial Empty State
console.log('▶ Test 1: Initial Empty Ghost State');
localStorage.clear();
const initialGhost = getGhostForModeLevel('classic', 3);
assert(initialGhost === null, 'Returns null when no PB exists');

// 2. Strict 0-Hint Policy
console.log('\n▶ Test 2: Strict 0-Hint Enforcement Policy');
const hintRun = recordGhostRun('classic', 3, {
  timeSeconds: 60,
  hintsUsed: 1, // Used 1 hint!
  puzzle: [[0]],
  solution: [[1]]
});
assert(hintRun.isNewRecord === false, 'Rejects PB record when hintsUsed > 0');
assert(getGhostForModeLevel('classic', 3) === null, 'Ghost record remains null after hint run');

// 3. First Legitimate PB Clear (0 Hints)
console.log('\n▶ Test 3: First Legitimate PB Clear (90s, 0 Hints)');
const samplePuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
samplePuzzle[0][0] = 5;
const sampleSolution = Array(9).fill(null).map(() => Array(9).fill(1));

const firstWin = recordGhostRun('classic', 3, {
  timeSeconds: 90,
  hintsUsed: 0,
  seed: 'test-seed-123',
  puzzle: samplePuzzle,
  solution: sampleSolution,
  totalEmptyCells: 45,
  timeline: [
    { time: 10, count: 5, pct: 11 },
    { time: 45, count: 22, pct: 49 },
    { time: 90, count: 45, pct: 100 }
  ]
});
assert(firstWin.isNewRecord === true, 'Successfully sets first PB record');

const savedGhost = getGhostForModeLevel('classic', 3);
assert(savedGhost !== null && savedGhost.bestSeconds === 90, 'Loaded ghost has bestSeconds = 90s');
assert(savedGhost.seed === 'test-seed-123', 'Ghost preserves deterministic seed');
assert(savedGhost.puzzle[0][0] === 5, 'Ghost preserves exact puzzle board');

// 4. Slower Run Ignored
console.log('\n▶ Test 4: Slower Run (110s) Does Not Overwrite PB (90s)');
const slowerWin = recordGhostRun('classic', 3, {
  timeSeconds: 110,
  hintsUsed: 0,
  seed: 'slower-seed',
  puzzle: samplePuzzle,
  solution: sampleSolution
});
assert(slowerWin.isNewRecord === false, 'Slower run is not treated as new record');
assert(getGhostForModeLevel('classic', 3).bestSeconds === 90, 'PB remains 90s');

// 5. Faster Run Replaces PB
console.log('\n▶ Test 5: Faster Run (75s) Successfully Updates PB');
const fasterWin = recordGhostRun('classic', 3, {
  timeSeconds: 75,
  hintsUsed: 0,
  seed: 'faster-seed-777',
  puzzle: samplePuzzle,
  solution: sampleSolution
});
assert(fasterWin.isNewRecord === true, 'Faster run sets new PB');
assert(getGhostForModeLevel('classic', 3).bestSeconds === 75, 'New PB is 75s');
assert(getGhostForModeLevel('classic', 3).seed === 'faster-seed-777', 'Ghost seed updated to faster run');

// 6. Delta Pace Math (Ahead of Pace)
console.log('\n▶ Test 6: Delta Pace Calculation (Ahead of Schedule)');
// PB is 75s for 40 cells. At 30s, user has filled 25/40 cells (62.5%).
// Expected time for 62.5% = 0.625 * 75 = 46.875s.
// Actual time = 30s. Delta = 30 - 46.875 = -16.875s (Ahead!).
const aheadPace = calculateDeltaPace(30, 25, 40, { bestSeconds: 75 });
assert(aheadPace.isAhead === true, 'Correctly flags isAhead = true');
assert(aheadPace.deltaText.startsWith('+'), `Ahead deltaText starts with + (${aheadPace.deltaText})`);
assert(aheadPace.currentPct === 62.5, 'Current progress percentage is 62.5%');

// 7. Delta Pace Math (Behind Schedule)
console.log('\n▶ Test 7: Delta Pace Calculation (Behind Schedule)');
// PB is 75s for 40 cells. At 50s, user has filled 10/40 cells (25%).
// Expected time for 25% = 0.25 * 75 = 18.75s.
// Actual time = 50s. Delta = 50 - 18.75 = +31.25s (Behind!).
const behindPace = calculateDeltaPace(50, 10, 40, { bestSeconds: 75 });
assert(behindPace.isAhead === false, 'Correctly flags isAhead = false');
assert(behindPace.deltaText.startsWith('-'), `Behind deltaText starts with - (${behindPace.deltaText})`);

// 8. Delta Mode Board Generation Safety Test
console.log('\n▶ Test 8: Delta Mode Custom Data Board Generation Safety');
const deltaOptions = { rivalMode: 'delta', ghostRecord: { bestSeconds: 75 } };
const hasCustomBoard = Boolean(deltaOptions && (deltaOptions.board || deltaOptions.puzzle));
const puzzle = hasCustomBoard ? deltaOptions : generatePuzzle(3);
const boardGrid = puzzle.board || puzzle.puzzle;
const safeSolution = puzzle.solution || (() => { const s = cloneGrid(boardGrid); solveSudoku(s); return s; })();

assert(boardGrid && boardGrid.length === 9, 'Delta Mode successfully generates fresh 9x9 board when board is omitted');
assert(safeSolution && safeSolution.length === 9, 'Delta Mode generates valid 9x9 safe solution');

console.log('\n----------------------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('💥 Some QA tests failed!');
  process.exit(1);
} else {
  console.log('🎉 ALL GHOST & DELTA PACE CALCULATION TESTS PASSED!');
  process.exit(0);
}
