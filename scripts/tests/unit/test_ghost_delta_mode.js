/**
 * test_ghost_delta_mode.js
 * Automated QA Verification for Ghost Mode & Delta Time Pace Engine
 */

import {
  getGhostForModeLevel,
  recordGhostRun,
  calculateDeltaPace,
  ghostPuzzle,
  GHOST_STORAGE_KEY
} from '../../../src/utils/ghostManager.js';
import { recordGameWin } from '../../../src/utils/storage.js';
import { generatePuzzle, cloneGrid, solveSudoku } from '../../../src/engine/SudokuEngine.js';
import { generateKillerPuzzle } from '../../../src/engine/killer/killerGenerator.js';
import { startingPuzzle } from '../../../src/engine/puzzleSetup.js';

// Setup Mock LocalStorage for node environment
const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

// A Classic win as the win path makes it (gameCompletion.js): the best time
// first, then the ghost, from one time by one rule. A Classic ghost with no best
// time behind it is read as another mode's (D19), so the ghost alone is not a
// Classic win any more.
const classicRun = (level, runData) => {
  recordGameWin(level, runData.timeSeconds, 'classic', { hintsUsed: runData.hintsUsed, countsAsRecord: !(runData.hintsUsed > 0) });
  return recordGhostRun('classic', level, runData);
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
const hintRun = classicRun(3, {
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

const firstWin = classicRun(3, {
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
assert(savedGhost?.seed === 'test-seed-123', 'Ghost preserves deterministic seed');
assert(savedGhost?.puzzle?.[0]?.[0] === 5, 'Ghost preserves exact puzzle board');

// 4. Slower Run Ignored
console.log('\n▶ Test 4: Slower Run (110s) Does Not Overwrite PB (90s)');
const slowerWin = classicRun(3, {
  timeSeconds: 110,
  hintsUsed: 0,
  seed: 'slower-seed',
  puzzle: samplePuzzle,
  solution: sampleSolution
});
assert(slowerWin.isNewRecord === false, 'Slower run is not treated as new record');
assert(getGhostForModeLevel('classic', 3)?.bestSeconds === 90, 'PB remains 90s');

// 5. Faster Run Replaces PB
console.log('\n▶ Test 5: Faster Run (75s) Successfully Updates PB');
const fasterWin = classicRun(3, {
  timeSeconds: 75,
  hintsUsed: 0,
  seed: 'faster-seed-777',
  puzzle: samplePuzzle,
  solution: sampleSolution
});
assert(fasterWin.isNewRecord === true, 'Faster run sets new PB');
assert(getGhostForModeLevel('classic', 3)?.bestSeconds === 75, 'New PB is 75s');
assert(getGhostForModeLevel('classic', 3)?.seed === 'faster-seed-777', 'Ghost seed updated to faster run');

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

// ── Killer (2026-10-14, BACKLOG KP-3 — killer order ④) ─────────────────────
// The two kinds differ in the puzzle only (user, 2026-10-07): a killer races its
// own ghost by the same rules. Its own slot, because a Lv.3 killer takes several
// times what a Lv.3 classic does — in one table the killer could never set a
// record and a classic player would race a killer's time — and because a ghost
// race deals the record's board, which on the killer switch must be a killer.

// 9. Killer runs go to the killer slot
console.log('\n▶ Test 9: Killer Ghosts Live In Their Own Slot');
localStorage.clear();
const killer = generateKillerPuzzle(3, 'gate-2-3-killer-ghost');
const killerEmpty = killer.board.flat().filter((v) => v === 0).length;
classicRun(3, { timeSeconds: 75, hintsUsed: 0, puzzle: samplePuzzle, solution: sampleSolution });
const killerRun = recordGhostRun('classic', 3, {
  timeSeconds: 600,
  hintsUsed: 0,
  puzzle: killer.board,
  solution: killer.solution,
  cages: killer.cages,
  totalEmptyCells: killerEmpty,
  timeline: [{ time: 200, count: 10 }, { time: 600, count: killerEmpty }]
}, 'killer');
assert(killerRun.isNewRecord === true, 'A first killer win sets the killer PB although the classic PB (75s) is faster — the kinds are not one table');
assert(getGhostForModeLevel('classic', 3)?.bestSeconds === 75, `The classic ghost stays 75s after a killer run (got ${getGhostForModeLevel('classic', 3)?.bestSeconds}s) — a killer run landed in the classic slot`);
const killerGhost = getGhostForModeLevel('classic', 3, 'killer');
assert(killerGhost?.bestSeconds === 600, `The killer ghost reads back as 600s (got ${killerGhost?.bestSeconds}) — killer ghost not read back from its slot`);
assert(JSON.stringify(killerGhost?.cages) === JSON.stringify(killer.cages), 'The killer ghost keeps its cages — without them its givens are not a puzzle');
assert(killerGhost?.timeline?.length === 2, 'The killer ghost keeps its pace timeline');
assert(getGhostForModeLevel('timeAttack', 3, 'killer') === null, 'A killer Classic run is not the killer Speedrun ghost');
const stored = JSON.parse(localStorage.getItem(GHOST_STORAGE_KEY)) || {};
assert(stored.classic?.[3]?.bestSeconds === 75 && !('cages' in stored.classic[3]) && !('variant' in stored.classic[3]),
  'The classic ghost keeps its old place and shape (classic[3], no kind, no cages) — where every earlier version reads it');
assert(stored.killer?.classic?.[3]?.bestSeconds === 600, 'The killer ghost is stored under killer.classic[3]');
assert(recordGhostRun('classic', 3, { timeSeconds: 700, hintsUsed: 0, cages: killer.cages }, 'killer').isNewRecord === false, 'A slower killer run is not a new killer PB');
assert(recordGhostRun('classic', 3, { timeSeconds: 550, hintsUsed: 1, cages: killer.cages }, 'killer').isNewRecord === false, 'A killer run with a hint is not a killer PB — the 0-hint rule holds for killer');

// 10. A table saved before killer slots existed
console.log('\n▶ Test 10: A Ghost Table From Before Killer Ghosts');
localStorage.clear();
localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify({ classic: { 2: { bestSeconds: 140, puzzle: samplePuzzle } }, timeAttack: {} }));
localStorage.setItem('suidoku_user_stats_v1', JSON.stringify({ bestTimes: { 2: 140 } }));
assert(getGhostForModeLevel('classic', 2)?.bestSeconds === 140, 'A classic ghost saved before killer slots existed is still found');
assert(getGhostForModeLevel('classic', 2, 'killer') === null, 'and is not offered as a killer ghost');
recordGhostRun('classic', 2, { timeSeconds: 400, hintsUsed: 0, puzzle: killer.board, cages: killer.cages }, 'killer');
assert(getGhostForModeLevel('classic', 2)?.bestSeconds === 140, 'The first killer ghost written into an old table leaves its classic ghost alone');
assert(getGhostForModeLevel('classic', 2, 'killer')?.bestSeconds === 400, 'The first killer ghost written into an old table is read back');

// 11. No ghost yet: each kind falls back to its own best time
console.log('\n▶ Test 11: Without A Ghost, Each Kind Falls Back To Its Own Best Time');
localStorage.clear();
localStorage.setItem('suidoku_user_stats_v1', JSON.stringify({ bestTimes: { 4: 300 }, killer: { bestTimes: { 4: 900 }, timeAttackBestTimes: { 4: 950 } } }));
assert(getGhostForModeLevel('classic', 4)?.bestSeconds === 300, 'Classic falls back to the classic best time');
const killerFallback = getGhostForModeLevel('classic', 4, 'killer');
assert(killerFallback?.bestSeconds === 900, `Killer falls back to the killer best time (got ${killerFallback?.bestSeconds}) — a killer raced the classic best time`);
assert(getGhostForModeLevel('timeAttack', 4, 'killer')?.bestSeconds === 950, 'Killer Speedrun falls back to the killer speedrun best time');
assert(killerFallback?.puzzle === null, 'A best time alone has no board');

// 12. A Ghost race deals the record's board — a killer with its cages
console.log('\n▶ Test 12: A Ghost Race Deals The Board The Record Was Set On');
const classicDeal = ghostPuzzle({ bestSeconds: 75, puzzle: samplePuzzle, solution: sampleSolution });
assert(classicDeal?.board === samplePuzzle && !classicDeal.variant && !classicDeal.cages, 'A classic ghost deals its board as a classic puzzle');
const killerDeal = ghostPuzzle(killerGhost, 'killer');
// Started right after a classic game: the kind handed in must win over the kind last played.
const dealt = killerDeal ? startingPuzzle(3, { ...killerDeal, rivalMode: 'ghost', ghostRecord: killerGhost }, 'classic') : null;
assert(dealt?.variant === 'killer', `A killer Ghost race starts as "${dealt?.variant}" — it deals a classic board of ${killer.board.flat().filter(Boolean).length} givens and no cages`);
assert(JSON.stringify(dealt?.cages) === JSON.stringify(killer.cages), 'The killer Ghost race has the cages the record was set on');
assert(JSON.stringify(dealt?.board) === JSON.stringify(killer.board), 'and the same givens');
assert(JSON.stringify(dealt?.solution) === JSON.stringify(killer.solution), 'and the same solution');
assert(ghostPuzzle({ ...killerGhost, cages: killerGhost?.cages?.slice(1) }, 'killer') === null,
  'A killer ghost with damaged cages (cells left out) deals nothing to replay — a new killer is dealt and only the time is raced');
assert(ghostPuzzle(killerFallback, 'killer') === null, 'A best time without a board deals nothing to replay');

// 13. The pace on a killer with no givens: 81 cells, the ghost's own timeline
console.log('\n▶ Test 13: Delta Pace On A Killer With No Givens');
const killerPace = calculateDeltaPace(300, 40, 81, {
  bestSeconds: 1200,
  timeline: [{ time: 100, count: 12 }, { time: 290, count: 35 }, { time: 1200, count: 81 }]
});
assert(killerPace.ghostFilledCount === 35, `At 300s the killer ghost had filled 35 of 81 by its timeline (got ${killerPace.ghostFilledCount})`);
assert(Math.abs(killerPace.currentPct - (40 / 81) * 100) < 1e-9, 'Progress is counted out of 81 cells');
assert(killerPace.isAhead === true, '40 of 81 at 300s against a 1200s ghost is ahead (that share took it 593s)');

// ── Survival and duels (BACKLOG D19, 2026-10-14) ─────────────────────────────
// Every mode that was not Speedrun used to land in Classic's slot: a Survival win
// wrote the clock at the win — the time LEFT — over the Classic ghost, with its
// own board, and a 1v1 or AI match its duel time. Neither keeps a ghost of its
// own: Survival's rival chips are off, and a duel keeps no best time (BT-1).

// 14. A Survival or duel win writes no ghost, of either kind
// Read from storage, not through getGhostForModeLevel: Test 15's reader drops a
// Classic ghost faster than the best time, so a duel's 90 s written there would
// read back as the 500 s best time and hide the write this test is about.
console.log('\n▶ Test 14: Survival And Duels Keep No Ghost, Of Either Kind');
localStorage.clear();
const otherBoard = Array(9).fill(null).map(() => Array(9).fill(7));
const storedTable = () => JSON.parse(localStorage.getItem(GHOST_STORAGE_KEY) || '{}');
const storedClassic3 = () => storedTable().classic?.[3];
classicRun(3, { timeSeconds: 500, hintsUsed: 0, puzzle: samplePuzzle, solution: sampleSolution, timeline: [{ time: 10, count: 1 }, { time: 500, count: 45 }] });
assert(storedClassic3()?.bestSeconds === 500, 'Control: a Classic win sets the classic ghost (500 s)');
const tableBefore = localStorage.getItem(GHOST_STORAGE_KEY);
const classicBefore = JSON.stringify(storedClassic3());
const survivalRun = recordGhostRun('timeLimit', 3, { timeSeconds: 420, hintsUsed: 0, puzzle: otherBoard, solution: otherBoard, timeline: [{ time: 470, count: 1 }, { time: 420, count: 45 }] });
assert(survivalRun.isNewRecord === false && JSON.stringify(storedClassic3()) === classicBefore,
  `A Survival win (420 s left) leaves the classic ghost at 500 s (stored: ${storedClassic3()?.bestSeconds} s)`);
assert(getGhostForModeLevel('timeLimit', 3) === null, 'Survival has no ghost to race — not the classic one either');
for (const [duel, name] of [['battle', 'A 1v1'], ['aiBattle', 'An AI match']]) {
  recordGhostRun(duel, 3, { timeSeconds: 90, hintsUsed: 0, puzzle: otherBoard, solution: otherBoard });
  assert(JSON.stringify(storedClassic3()) === classicBefore, `${name} win (90 s) leaves the classic ghost at 500 s (stored: ${storedClassic3()?.bestSeconds} s)`);
}
recordGhostRun('timeLimit', 3, { timeSeconds: 420, hintsUsed: 0, puzzle: killer.board, solution: killer.solution, cages: killer.cages }, 'killer');
const storedKiller = storedTable().killer || {};
assert(!storedKiller.classic?.[3] && !storedKiller.timeAttack?.[3],
  'A killer Survival win (BACKLOG KP-2) writes no killer ghost — the rule is the mode\'s, not the kind\'s');
assert(localStorage.getItem(GHOST_STORAGE_KEY) === tableBefore, 'After all four, the ghost table is as the Classic win left it');

// 15. Ghosts already written there are read as none (user, 2026-10-14: drop on load)
console.log('\n▶ Test 15: A Classic Ghost No Classic Win Wrote Is Read As None');
localStorage.clear();
localStorage.setItem('suidoku_user_stats_v1', JSON.stringify({ bestTimes: { 1: 100, 2: 200, 3: 300, 4: 150 } }));
localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify({
  classic: {
    1: { bestSeconds: 100, puzzle: samplePuzzle, timeline: [{ time: 20, count: 5 }, { time: 100, count: 31 }] },
    2: { bestSeconds: 90, puzzle: otherBoard, timeline: [{ time: 5, count: 1 }, { time: 90, count: 42 }] },
    3: { bestSeconds: 320, puzzle: otherBoard, timeline: [{ time: 470, count: 1 }, { time: 455, count: 2 }, { time: 320, count: 47 }] },
    4: { bestSeconds: 180, puzzle: samplePuzzle, timeline: [{ time: 40, count: 9 }, { time: 180, count: 53 }] },
    5: { bestSeconds: 1092, puzzle: otherBoard, timeline: [{ time: 1076, count: 1 }, { time: 1079, count: 2 }, { time: 1092, count: 57 }] }
  },
  timeAttack: { 3: { bestSeconds: 250, timeline: [{ time: 30, count: 10 }, { time: 28, count: 11 }, { time: 250, count: 47 }] } },
  killer: { classic: { 3: { bestSeconds: 900, variant: 'killer', cages: killer.cages } }, timeAttack: {} }
}));
const equalGhost = getGhostForModeLevel('classic', 1);
// The board too: dropped, the ghost would read back as the same 100 s from the best time, with no board.
assert(equalGhost?.bestSeconds === 100 && Array.isArray(equalGhost.puzzle),
  'A classic ghost equal to its best time is kept (100 s, with its board) — a Classic win writes both from one time');
assert(getGhostForModeLevel('classic', 4)?.bestSeconds === 180, 'A classic ghost slower than its best time is kept (180 s over 150 s) — the best can come from another phone');
const strayDuel = getGhostForModeLevel('classic', 2);
assert(strayDuel?.bestSeconds === 200 && strayDuel.puzzle === null,
  `A classic ghost faster than the classic best time (a duel's 90 s, best 200 s) is read as none — Time Gap races the best time instead (got ${strayDuel?.bestSeconds} s)`);
const straySurvival = getGhostForModeLevel('classic', 3);
assert(straySurvival?.bestSeconds === 300 && straySurvival.puzzle === null,
  `A classic ghost whose pace goes back in time (Survival's clock, 320 s) is read as none — Time Gap races the best time (got ${straySurvival?.bestSeconds} s)`);
assert(getGhostForModeLevel('classic', 5) === null,
  'A classic ghost at a level with no classic best time is read as none — a fast Survival (every cell inside its 7 s bonus) never sees its clock go down');
assert(getGhostForModeLevel('timeAttack', 3)?.bestSeconds === 250, 'A Speedrun ghost whose clock went down (a combo) is kept — only Classic\'s slot was ever written wrongly');
assert(getGhostForModeLevel('classic', 3, 'killer')?.bestSeconds === 900, 'A killer ghost with no killer best time is kept — only Classic\'s slot was ever written wrongly');
const overStray = classicRun(2, { timeSeconds: 250, hintsUsed: 0, puzzle: samplePuzzle, solution: sampleSolution });
assert(overStray.isNewRecord === true && getGhostForModeLevel('classic', 2)?.bestSeconds === 250,
  `The next Classic win at that level is a new record over the stray ghost (250 s over a duel's 90 s; got ${getGhostForModeLevel('classic', 2)?.bestSeconds} s)`);

console.log('\n----------------------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('💥 Some QA tests failed!');
  process.exit(1);
} else {
  console.log('🎉 ALL GHOST & DELTA PACE CALCULATION TESTS PASSED!');
  process.exit(0);
}
