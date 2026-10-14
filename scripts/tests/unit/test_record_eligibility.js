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
const win = ({ level = 5, time = 300, mode = 'classic', mistakes = 0, hints = 0, limit = true, played = null, variant = 'classic' }) => {
  localStorage.setItem('suidoku_settings_v1', JSON.stringify({ limitMistakes: limit }));
  handleGameWinLogic({
    level, timerSeconds: time, playedSeconds: played, gameMode: mode, variant, mistakes, hintsUsed: hints, activeDailyDateKey: null,
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
s = win({ mode: 'timeLimit', limit: false, time: 90, played: 400 });
assert.ok(!s.survivalBestTimes?.[5], 'Survival follows Classic');
assert.strictEqual(s.timeLimitSurvivalWins, 1, 'but the survival win is still counted');
console.log('  ✅ 2. real win path: best times and ghost held back, wins and cleared levels kept');

// 2b. Survival's best is the fastest clear — the seconds played, not the time left
//     (D16, user 2026-10-09: "깨는데 걸린 시간을 적어야지"). The clock at a Survival
//     win is the time LEFT, and the smallest used to be kept: a win with 5 s to
//     spare replaced one with 3 minutes, and the screen showed 00:05 as the best.
localStorage.clear();
s = win({ mode: 'timeLimit', time: 180, played: 500 });
assert.strictEqual(s.survivalBestTimes?.[5], 500, 'the seconds played are the Survival best');
s = win({ mode: 'timeLimit', time: 5, played: 650 });
assert.strictEqual(s.survivalBestTimes?.[5], 500, 'a slower clear with little time left is not a new best');
s = win({ mode: 'timeLimit', time: 600, played: 420 });
assert.strictEqual(s.survivalBestTimes?.[5], 420, 'a faster clear is, however much time was left');
s = win({ mode: 'timeLimit', time: 30 });
assert.strictEqual(s.survivalBestTimes?.[5], 420, 'a win whose seconds played are unknown sets no best');
assert.ok(!s.timeLimitBestTimes, 'the old time-left table is no longer written');
assert.strictEqual(s.timeLimitSurvivalWins, 4, 'every Survival win still counts');
const merged = mergeStats({ survivalBestTimes: { 5: 380 }, timeLimitBestTimes: { 5: 7 } }, { survivalBestTimes: { 5: 420 } });
assert.strictEqual(merged.survivalBestTimes[5], 380, 'a phone change keeps the faster clear');
{
  const fs = await import('fs');
  const screen = fs.readFileSync(new URL('../../../src/components/StatsScreen.jsx', import.meta.url), 'utf8');
  assert(/const timeLimitBests = stats\.survivalBestTimes \|\| \{\};/.test(screen),
    'the stats screen must show the Survival best from survivalBestTimes — the old table is the time left');
}
console.log('  ✅ 2b. Survival best = the fastest clear in seconds played, not the narrowest escape');

// 2c. Survival and duels race no ghost, and leave Classic's alone (D19, 2026-10-14).
//     Every mode that was not Speedrun used to land in the Classic ghost slot: a
//     Survival win wrote its clock — the time LEFT — over the Classic ghost, and a
//     1v1 or AI match its duel time. The best times above never took either, and
//     the ghost is the same record by the same rule, so it does not either.
{
  const ghostTable = () => JSON.parse(localStorage.getItem('suidoku_ghost_records_v1') || '{}');
  const classicGhost = () => ghostTable().classic?.[5];
  localStorage.clear();
  win({ time: 500 });
  assert.strictEqual(classicGhost()?.bestSeconds, 500, 'control: a Classic win did not set the Classic ghost');
  const before = JSON.stringify(classicGhost());
  win({ mode: 'timeLimit', time: 420, played: 300 });
  assert.strictEqual(JSON.stringify(classicGhost()), before,
    `a Survival win (420 s left) changed the Classic ghost to ${classicGhost()?.bestSeconds} s — the time left is not a time to clear`);
  for (const mode of ['battle', 'aiBattle']) {
    win({ mode, time: 90 });
    assert.strictEqual(JSON.stringify(classicGhost()), before, `a ${mode} win (90 s) changed the Classic ghost to ${classicGhost()?.bestSeconds} s`);
  }
  win({ mode: 'timeLimit', time: 420, played: 300, variant: 'killer' });
  const killerSlots = ghostTable().killer || {};
  assert.ok(!killerSlots.classic?.[5] && !killerSlots.timeAttack?.[5],
    'a killer Survival win (KP-2) wrote a killer ghost — the rule must hold for the mode, whatever the kind');
  win({ time: 450 });
  assert.strictEqual(classicGhost()?.bestSeconds, 450, 'control: a faster Classic win after them did not replace the Classic ghost');
  localStorage.clear();
  console.log('  ✅ 2c. Survival and duel wins write no ghost, of either kind; Classic wins still do');
}

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
  localStorage.clear();
  console.log('  ✅ 3b. duel times stay out of the Classic record table');
}

// 3c. A duel stays out of the win rate (BT-1, user 2026-09-28)
//
// Winning a duel came through the win path and counted; losing one because the
// opponent finished first never called recordGameLoss. Every duel could raise the
// win rate — part of the Logic Score — and none could lower it. Duels have their
// own record (battleRating.js), so they leave games played / won alone, and the
// flawless count with them (Focus = flawless ÷ won). Driven through the real win
// and game-over paths: the rule in storage.js proves nothing if they do not reach it.
{
  const { handleMistakeLogic } = await import('../../../src/utils/gameMistakeHandler.js');
  localStorage.clear();
  win({ level: 3, time: 200, mode: 'classic' });
  const base = loadStats();
  assert.strictEqual(base.gamesWon, 1, 'a Classic win counts');

  for (const mode of ['battle', 'aiBattle']) {
    const s = win({ level: 5, time: 90, mode });
    assert.strictEqual(s.gamesWon, 1, `a ${mode} win must not add to games won — it would lift the win rate on the leaderboard (BT-1)`);
    assert.strictEqual(s.gamesPlayed, 1, `a ${mode} win must not add to games played either`);
    assert.strictEqual(s.flawlessWins, base.flawlessWins, `a flawless ${mode} win must not add to flawless wins — Focus is flawless ÷ won`);
    assert.ok(s.clearedLevels?.[5], `a ${mode} board solved without a hint still clears its level`);
  }

  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  for (const mode of ['battle', 'aiBattle']) {
    handleMistakeLogic({
      nextBoard: board, r: 0, c: 1, num: 3, mistakes: 2, setMistakes: () => {}, gameMode: mode,
      handleTimePenalty: () => {}, setConflictInfo: () => {}, conflictTimeoutRef: { current: null },
      limitMistakes: true, setIsGameOver: () => {}, t: (k) => k,
    });
    assert.strictEqual(loadStats().gamesPlayed, 1, `a ${mode} lost on mistakes is the duel record's loss, not a game in the win rate (BT-1)`);
  }
  handleMistakeLogic({
    nextBoard: board, r: 0, c: 1, num: 3, mistakes: 2, setMistakes: () => {}, gameMode: 'classic',
    handleTimePenalty: () => {}, setConflictInfo: () => {}, conflictTimeoutRef: { current: null },
    limitMistakes: true, setIsGameOver: () => {}, t: (k) => k,
  });
  assert.strictEqual(loadStats().gamesPlayed, 2, 'a Classic game over still counts as a game played');
  localStorage.clear();
  console.log('  ✅ 3c. duels stay out of games played / won / flawless, won or lost; they still clear levels');
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
