/**
 * Gate 2-28 — a killer game plays and counts as a killer.
 *
 * Gate 2-27 proves the puzzles are sound. This one follows a killer through the
 * game's own paths, where it meets code written for classic sudoku:
 *
 *   1. notes — a digit placed clears itself from its cage's notes as well
 *   2. mistakes — a digit already in the cage, or a cage past its sum, is said
 *      so; a classic board with the same digits is not told about cages
 *   3. the win, through handleGameWinLogic — the killer record moves, the
 *      classic record, the leaderboard and the daily mission do not (a classic
 *      win alongside is the control that shows the measurement can move)
 *   4. losses — on mistakes and thrown away — count against the killer record only
 *   5. which puzzle a game starts on — "next game" after a killer is a killer,
 *      a puzzle handed in (daily, 1v1) is classic; a killer save that lost its
 *      solution gets it back from its cages, not from a classic solve
 *   6. the cloud merge carries the killer record from both phones
 *
 * Decision behind 3 and 4: killer records are kept apart (user, 2026-10-01).
 */
import assert from 'assert';

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] ?? null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};
global.window = { localStorage: global.localStorage, navigator: { onLine: true }, dispatchEvent: () => true };
if (typeof globalThis.CustomEvent !== 'function') globalThis.CustomEvent = class { constructor(t, i) { this.type = t; this.detail = i?.detail; } };

const { autoRemoveNotes, createEmptyGrid } = await import('../../../src/engine/SudokuEngine.js');
const { detectSudokuConflict } = await import('../../../src/engine/conflictDetector.js');
const { handleGameWinLogic } = await import('../../../src/utils/gameCompletion.js');
const { handleMistakeLogic } = await import('../../../src/utils/gameMistakeHandler.js');
const { recordAbandonedGame } = await import('../../../src/utils/abandonedGame.js');
const { loadStats } = await import('../../../src/utils/storage.js');
const { loadDailyRecords, getTodayDateKey } = await import('../../../src/utils/dailyChallenge.js');
const { startingPuzzle, savedPuzzle } = await import('../../../src/engine/puzzleSetup.js');
const { generateKillerPuzzle } = await import('../../../src/engine/killer/killerGenerator.js');
const { mergeStats } = await import('../../../src/services/progressMerge.js');
const { cloudSyncService } = await import('../../../src/services/cloudSyncService.js');
const { playGamesService } = await import('../../../src/services/playGamesService.js');
cloudSyncService.saveToCloud = async () => ({ success: true });
let submissions = 0;
playGamesService.submitScore = () => { submissions++; };
playGamesService.submitBrainIQ = () => { submissions++; };

console.log('\n🔪 [2-28] A killer game plays and counts as a killer');

const at = (cell) => [Math.floor(cell / 9), cell % 9];
// An L-shaped cage across two boxes: r2c2 (20), r3c2 (29), r3c3 (30). r2c2 and
// r3c3 share no row, column or box — only the cage ties them.
const L_CAGE = { cells: [20, 29, 30], sum: 6 };

// ── 1. Notes ────────────────────────────────────────────────────────────────
{
  const notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [5, 7]));
  const killer = autoRemoveNotes(notes, 2, 2, 5, [L_CAGE]);
  assert.deepStrictEqual(killer[3][3], [7], 'placing 5 in r3c3\'s cage must clear the 5 from r3c3\'s notes — the cage forbids it there');
  const classic = autoRemoveNotes(notes, 2, 2, 5);
  assert.deepStrictEqual(classic[3][3], [5, 7], 'a classic board has no cages; r3c3 shares no row, column or box with r2c2');
  console.log('  ✅ 1. a placed digit leaves the notes of its whole cage, and only in a killer');
}

// ── 2. Mistakes ─────────────────────────────────────────────────────────────
{
  const board = createEmptyGrid();
  board[3][3] = 5;           // already in the cage
  board[2][2] = 5;           // the wrong digit just placed
  const dup = detectSudokuConflict(board, 2, 2, 5, 1, false, null, [L_CAGE]);
  assert.strictEqual(dup.type, 'cage', `a 5 placed where its cage already has a 5 is reported as "${dup.type}", not as a cage repeat`);
  assert.ok(dup.message.includes('already in this cage'), `the message says "${dup.message}"`);
  assert.deepStrictEqual(dup.conflictingCells, [[3, 3]], 'the 5 already in the cage is the cell to point at');

  const over = createEmptyGrid();
  over[2][2] = 4;            // cage of 6: 4 here and 3 below make 7
  over[3][2] = 3;
  const sum = detectSudokuConflict(over, 3, 2, 3, 1, false, null, [L_CAGE]);
  assert.strictEqual(sum.type, 'cageSum', `a cage of 6 holding 4 and 3 is reported as "${sum.type}", not as past its sum`);
  assert.ok(sum.message.includes('6'), `the message names the sum: "${sum.message}"`);

  const classic = detectSudokuConflict(board, 2, 2, 5, 1, false, null, null);
  assert.strictEqual(classic.type, 'logic', 'with no cages the same board is only "not the solution"');
  console.log('  ✅ 2. a repeat in the cage and a cage past its sum are named; classic boards are not told about cages');
}

// ── 3. The win ──────────────────────────────────────────────────────────────
const win = (variant, { level = 3, time = 200, hints = 0 } = {}) => {
  localStorage.setItem('suidoku_settings_v1', JSON.stringify({ limitMistakes: true }));
  handleGameWinLogic({
    level, timerSeconds: time, gameMode: 'classic', variant, mistakes: 0, hintsUsed: hints,
    activeDailyDateKey: null, clearGameState: () => {}, setIsVictory: () => {}, setHintsRemaining: () => {}
  });
  return loadStats();
};
{
  localStorage.clear();
  submissions = 0;
  let s = win('killer', { level: 3, time: 200 });
  assert.strictEqual(s.killer?.gamesWon, 1, 'a killer win must count in the killer record');
  assert.strictEqual(s.killer?.bestTimes?.[3], 200, 'and set its Lv.3 best time');
  assert.ok(!s.gamesWon, `a killer win moved the classic wins to ${s.gamesWon} — and with them the Logic Score's win rate`);
  assert.ok(!s.bestTimes?.[3], 'a killer win set a classic best time');
  assert.ok(!s.clearedLevels?.[3], 'a killer win marked a classic level cleared for the Logic Score');
  assert.strictEqual(submissions, 0, `a killer win sent ${submissions} score(s) to the Play Games leaderboard`);
  assert.ok(!loadDailyRecords()[getTodayDateKey()]?.completed, 'a killer win completed the classic daily mission');

  s = win('killer', { level: 3, time: 150, hints: 1 });
  assert.strictEqual(s.killer.bestTimes[3], 200, 'a killer won with a hint is a win, not a best time (recordEligibility.js)');
  assert.strictEqual(s.killer.gamesWon, 2);

  // Control: the same measurement does move for a classic win.
  s = win('classic', { level: 3, time: 300 });
  assert.strictEqual(s.gamesWon, 1, 'control: a classic win counts in the classic record');
  assert.ok(submissions > 0, 'control: a classic win is submitted — without this, "0 submissions" above proves nothing');
  assert.strictEqual(s.killer.gamesWon, 2, 'a classic win must not touch the killer record');
  console.log('  ✅ 3. a killer win moves the killer record only — no classic count, best time, leaderboard or mission');
}

// ── 4. Losses ───────────────────────────────────────────────────────────────
{
  localStorage.clear();
  const init = createEmptyGrid();
  const moved = init.map((r) => r.slice());
  moved[0][0] = 5;
  const killerSave = generateKillerPuzzle(1, 'gate-2-28-save');
  localStorage.setItem('suidoku_game_state_v1', JSON.stringify({
    board: moved, initialBoard: init, mistakes: 2, gameMode: 'classic', variant: 'killer', cages: killerSave.cages
  }));
  handleMistakeLogic({
    nextBoard: moved, r: 0, c: 1, num: 3, mistakes: 2, setMistakes: () => {}, gameMode: 'classic',
    handleTimePenalty: () => {}, setConflictInfo: () => {}, conflictTimeoutRef: { current: null },
    limitMistakes: true, setIsGameOver: () => {}, t: (k) => k, variant: 'killer', cages: killerSave.cages
  });
  let s = loadStats();
  assert.strictEqual(s.killer?.gamesPlayed, 1, 'a killer lost on mistakes must count as a killer played');
  assert.ok(!s.gamesPlayed, `a killer lost on mistakes moved the classic games played to ${s.gamesPlayed}`);

  localStorage.setItem('suidoku_game_state_v1', JSON.stringify({
    board: moved, initialBoard: init, mistakes: 0, gameMode: 'classic', variant: 'killer', cages: killerSave.cages
  }));
  assert.strictEqual(recordAbandonedGame(), true, 'a started killer thrown away is a loss');
  s = loadStats();
  assert.strictEqual(s.killer.gamesPlayed, 2, 'counted in the killer record');
  assert.ok(!s.gamesPlayed, 'and not in the classic one');
  console.log('  ✅ 4. a killer lost on mistakes or thrown away counts against the killer record only');
}

// ── 5. Which puzzle a game starts on ────────────────────────────────────────
{
  const next = startingPuzzle(2, null, 'killer');
  assert.strictEqual(next.variant, 'killer', '"next game" after a killer must be a killer');
  assert.ok(Array.isArray(next.cages) && next.cages.length > 0, 'with its cages');
  const asked = startingPuzzle(2, { variant: 'classic' }, 'killer');
  assert.strictEqual(asked.variant, 'classic', 'Home asking for a standard game right after a killer must get one');
  assert.strictEqual(asked.cages, null);
  const daily = startingPuzzle(2, { board: createEmptyGrid(), solution: null }, 'killer');
  assert.strictEqual(daily.variant, 'classic', 'a puzzle handed in (daily, 1v1) is classic whatever was played before');
  assert.strictEqual(daily.cages, null);

  const p = generateKillerPuzzle(4, 'gate-2-28-restore');
  const restored = savedPuzzle({ variant: 'killer', cages: p.cages, initialBoard: p.board, board: p.board });
  assert.deepStrictEqual(restored.solution, p.solution, 'a killer save without its solution must get it back from its cages — a classic solve of its (empty) givens is some other grid');
  assert.strictEqual(savedPuzzle({ initialBoard: p.board, board: p.board, solutionBoard: p.solution }).variant, 'classic', 'a save from before puzzle kinds is classic');
  console.log('  ✅ 5. next game keeps the kind, Home and handed-in puzzles set it, a lost killer solution comes back from its cages');
}

// ── 6. The cloud merge ──────────────────────────────────────────────────────
{
  const cloud = { killer: { gamesPlayed: 5, gamesWon: 3, bestTimes: { 3: 300 } } };
  const local = { killer: { gamesPlayed: 2, gamesWon: 2, bestTimes: { 3: 250, 4: 500 } } };
  const m = mergeStats(cloud, local).killer;
  assert.strictEqual(m?.gamesWon, 3, `merging two phones' killer records gave ${m?.gamesWon} wins — the other phone's 3 were lost`);
  assert.strictEqual(m.gamesPlayed, 5);
  assert.deepStrictEqual(m.bestTimes, { 3: 250, 4: 500 }, 'best killer times: the faster per level, from either phone');
  assert.deepStrictEqual(mergeStats(cloud, {}).killer.bestTimes, { 3: 300 }, 'a killer record only in the cloud comes back');
  assert.strictEqual(mergeStats({ killer: 'broken' }, local).killer.gamesWon, 2, 'a damaged cloud killer record takes nothing away');
  console.log('  ✅ 6. the cloud merge keeps both phones\' killer records by the classic rules');
}

console.log('\n✅ [2-28] PASSED — a killer game plays and counts as a killer');
