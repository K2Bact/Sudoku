/**
 * Gate 2-21 — a best time is a record only when the game was played for one,
 * and a game walked away from is a game lost.
 *
 * Hints fill cells for you, and with the 3-mistake limit off (auto-check on) a
 * wrong digit turns red at once, so a player can guess cell by cell. Both used to
 * lift the best times — and through them the "hardest level cleared" part of the
 * Logic Score that goes to the Play Games leaderboard (BACKLOG R-1, SudokuDiary ㉕).
 *
 * Driven through the real win path (handleGameWinLogic), not the rule alone: the
 * rule existing proves nothing if the win path does not ask it.
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

const { recordEligibility } = await import('../../../src/utils/recordEligibility.js');
const { handleGameWinLogic } = await import('../../../src/utils/gameCompletion.js');
const { loadStats } = await import('../../../src/utils/storage.js');
const { iqStatsService } = await import('../../../src/services/iqStatsService.js');
const { mergeStats } = await import('../../../src/services/progressMerge.js');
const { cloudSyncService } = await import('../../../src/services/cloudSyncService.js');
cloudSyncService.saveToCloud = async () => ({ success: true });

console.log('\n🏁 [2-21] A best time is a record only when the game was played for one');

// 1. The rule
const R = (o) => recordEligibility(o);
assert.deepStrictEqual(R({ gameMode: 'classic', hintsUsed: 0, limitMistakes: true, mistakes: 2 }), { counts: true, reason: null });
assert.strictEqual(R({ gameMode: 'classic', hintsUsed: 1, limitMistakes: true, mistakes: 0 }).reason, 'hint_used');
assert.strictEqual(R({ gameMode: 'classic', hintsUsed: 0, limitMistakes: false, mistakes: 0 }).reason, 'no_mistake_limit');
assert.strictEqual(R({ gameMode: 'timeLimit', hintsUsed: 0, limitMistakes: false, mistakes: 0 }).reason, 'no_mistake_limit');
assert.strictEqual(R({ gameMode: 'classic', hintsUsed: 0, limitMistakes: true, mistakes: 3 }).reason, 'no_mistake_limit',
  'more than 2 mistakes at a win means the limit was off for part of the game');
assert.strictEqual(R({ gameMode: 'timeAttack', hintsUsed: 0, limitMistakes: false, mistakes: 9 }).counts, true,
  'Speedrun counts without the limit: each mistake already costs +10s');
assert.strictEqual(R({ gameMode: 'timeAttack', hintsUsed: 1, limitMistakes: true, mistakes: 0 }).counts, false);
console.log('  ✅ 1. rule: hints never, limit off never (except Speedrun), >2 mistakes means the limit was off');

// 2. Through the real win path
const win = ({ level = 5, time = 300, mode = 'classic', mistakes = 0, hints = 0, limit = true }) => {
  localStorage.setItem('suidoku_settings_v1', JSON.stringify({ limitMistakes: limit }));
  handleGameWinLogic({
    level, timerSeconds: time, gameMode: mode, mistakes, hintsUsed: hints, activeDailyDateKey: null,
    clearGameState: () => {}, setIsVictory: () => {}, setHintsRemaining: () => {}
  });
  return loadStats();
};

localStorage.clear();
let s = win({ limit: false, time: 200 });
assert.strictEqual(s.gamesWon, 1, 'the win itself still counts');
assert.ok(!s.bestTimes?.[5], `limit off must not set a best time (got ${s.bestTimes?.[5]})`);
assert.ok(s.clearedLevels?.[5], 'a hint-free clear still counts as the level cleared (difficulty metric)');
assert.ok(!JSON.parse(localStorage.getItem('suidoku_ghost_records_v1') || '{}').classic?.[5], 'no ghost PB either');

localStorage.clear();
s = win({ hints: 2, time: 200 });
assert.ok(!s.bestTimes?.[5], 'a hinted win must not set a best time');
assert.ok(!s.clearedLevels?.[5], 'a hinted win must not count as the level cleared');
assert.strictEqual(iqStatsService.calculateBrainIQ(s) < iqStatsService.calculateBrainIQ({ ...s, clearedLevels: { 5: true } }), true,
  'so the Logic Score does not get the Lv.5 bonus from a hinted clear');

localStorage.clear();
s = win({ limit: true, mistakes: 3, time: 200 });
assert.ok(!s.bestTimes?.[5], 'switching the limit back on before the last cell does not make the game count');

localStorage.clear();
s = win({ limit: true, mistakes: 2, time: 250 });
assert.strictEqual(s.bestTimes?.[5], 250, 'a clean game with the limit on sets the best time');
s = win({ limit: false, time: 100 });
assert.strictEqual(s.bestTimes?.[5], 250, 'a later faster game without the limit leaves it alone');
assert.strictEqual(s.gamesWon, 2);

localStorage.clear();
s = win({ mode: 'timeAttack', limit: false, mistakes: 5, time: 180 });
assert.strictEqual(s.timeAttackBestTimes?.[5], 180, 'Speedrun records without the limit');

localStorage.clear();
s = win({ mode: 'timeLimit', limit: false, time: 90 });
assert.ok(!s.timeLimitBestTimes?.[5], 'Survival follows Classic');
assert.strictEqual(s.timeLimitSurvivalWins, 1, 'but the survival win is still counted');
console.log('  ✅ 2. real win path: best times and ghost held back, wins and cleared levels kept');

// 3. Old saves and cloud restore
assert.ok(iqStatsService.calculateBrainIQ({ gamesPlayed: 1, gamesWon: 1, bestTimes: { 5: 400 } }) >
  iqStatsService.calculateBrainIQ({ gamesPlayed: 1, gamesWon: 1, bestTimes: { 1: 400 } }),
  'saves from before clearedLevels keep their level credit through best times');
const m = mergeStats({ clearedLevels: { 4: true } }, { clearedLevels: { 2: true } });
assert.ok(m.clearedLevels?.[4] && m.clearedLevels?.[2], 'a cloud restore keeps levels cleared on either device');
console.log('  ✅ 3. old saves keep their credit; cloud merge keeps cleared levels');

// 3b. A duel leaves no time in the Classic record table (BT-1)
//
// Everything that was not Speedrun or Survival fell into bestTimes, and 1v1 and
// the AI match came through the same win path. A duel is played against someone
// you can watch — you rush when they are ahead, the board can end under you —
// so those seconds are not comparable with a Classic run, and they were landing
// in the table the player reads as their personal record.
{
  const { recordGameWin } = await import('../../../src/utils/storage.js');
  localStorage.clear();
  recordGameWin(3, 200, 'classic', { hintsUsed: 0, countsAsRecord: true });
  const classic = loadStats().bestTimes[3];
  assert.strictEqual(classic, 200, 'a Classic win sets the Classic record');

  const duel = recordGameWin(3, 30, 'battle', { hintsUsed: 0, countsAsRecord: true });
  assert.strictEqual(loadStats().bestTimes[3], 200,
    'a 1v1 win must not become the Classic best time, however fast it was (BT-1)');
  assert.strictEqual(duel.isNewRecord, false, 'and it is not announced as a record');

  recordGameWin(3, 25, 'aiBattle', { hintsUsed: 0, countsAsRecord: true });
  assert.strictEqual(loadStats().bestTimes[3], 200, 'the AI match is a duel too');

  const after = loadStats();
  assert.strictEqual(after.gamesWon, 3, 'the duels are still wins — only the clock is dropped');
  assert.strictEqual(after.gamesPlayed, 3, 'and still games played');
  localStorage.clear();
  console.log('  ✅ 3b. duel times stay out of the Classic record table, but the wins still count');
}

// 4. Quitting counts as losing (abandonedGame.js)
{
  const { recordAbandonedGame, gameInProgress } = await import('../../../src/utils/abandonedGame.js');
  const { handleMistakeLogic } = await import('../../../src/utils/gameMistakeHandler.js');
  const init = Array.from({ length: 9 }, () => Array(9).fill(0));
  const moved = init.map((r) => r.slice()); moved[0][0] = 5;
  const save = (st) => localStorage.setItem('suidoku_game_state_v1', JSON.stringify({ board: moved, initialBoard: init, mistakes: 0, gameMode: 'classic', ...st }));
  const played = () => loadStats().gamesPlayed || 0;

  localStorage.clear(); save({});
  assert.strictEqual(recordAbandonedGame(), true, 'a started game thrown away is recorded');
  assert.strictEqual(played(), 1, 'as a game played that was not won');
  localStorage.clear(); save({ board: init });
  assert.strictEqual(recordAbandonedGame(), false, 'an untouched board is not a loss');
  localStorage.clear(); save({ board: init, mistakes: 1 });
  assert.strictEqual(recordAbandonedGame(), true, 'a mistake counts as having started');
  localStorage.clear(); save({ gameMode: 'battle' });
  assert.strictEqual(gameInProgress(), null, '1v1 battles end on their own result screen');
  localStorage.clear(); save({ gameMode: 'aiBattle' });
  assert.strictEqual(gameInProgress(), null, 'AI battles too');
  localStorage.clear(); save({ isGameOver: true });
  assert.strictEqual(gameInProgress(), null, 'a lost game is not lost again');

  // Game over: the loss is recorded once and the save is cleared, so it can be
  // neither resumed (a free revive) nor counted again when thrown away.
  localStorage.clear(); save({ mistakes: 2 });
  handleMistakeLogic({
    nextBoard: moved, r: 0, c: 1, num: 3, mistakes: 2, setMistakes: () => {}, gameMode: 'classic',
    handleTimePenalty: () => {}, setConflictInfo: () => {}, conflictTimeoutRef: { current: null },
    limitMistakes: true, setIsGameOver: () => {}, t: (k) => k,
  });
  assert.strictEqual(played(), 1, 'game over records one loss');
  assert.strictEqual(localStorage.getItem('suidoku_game_state_v1'), null, 'and clears the save');
  assert.strictEqual(recordAbandonedGame(), false, 'so nothing is left to count twice');
  assert.strictEqual(played(), 1);
  // The rule exists; now it must be asked. Every path that throws away a game in
  // progress goes through startNewGame or restartCurrentGame, and every way a player
  // starts one warns first (App.jsx confirmAbandon).
  const fs = await import('fs');
  const hook = fs.readFileSync(new URL('../../../src/hooks/useSudokuGame.js', import.meta.url), 'utf8');
  for (const fn of ['startNewGame', 'restartCurrentGame']) {
    const body = hook.slice(hook.indexOf(`const ${fn} = `), hook.indexOf('};', hook.indexOf(`const ${fn} = `)));
    assert(/recordAbandonedGame\(\)/.test(body), `${fn} must record the game it throws away as a loss`);
  }
  const app = fs.readFileSync(new URL('../../../src/hooks/useGameStarters.js', import.meta.url), 'utf8');
  for (const fn of ['handleStartSingleGame', 'handleStartDailyPuzzle', 'handleStartDailyMission', 'startLiveGuidedTutorial', 'navigateToScreen']) {
    const body = app.slice(app.indexOf(`const ${fn} = `), app.indexOf('};', app.indexOf(`const ${fn} = `)));
    assert(/confirmAbandon\(\)/.test(body), `${fn} must warn before a game in progress is counted as a loss (hooks/useGameStarters.js)`);
  }
  console.log('  ✅ 4. quitting a started game is a loss; untouched boards, battles and lost games are not counted again; every start path warns');
}

console.log('🎉 [2-21] PASSED');
