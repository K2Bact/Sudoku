/**
 * Gate 2-28 — a killer game plays and counts as a killer.
 *
 * Gate 2-27 proves the puzzles are sound. This one follows a killer through the
 * game's own paths, where it meets code written for classic sudoku:
 *
 *   1. notes — a digit placed clears itself from its cage's notes as well
 *   2. mistakes — a digit already in the cage, or a cage past its sum, is said
 *      so; a classic board with the same digits is not told about cages
 *   3. the win, through handleGameWinLogic — the killer record moves with
 *      everything a classic win records (games, wins, flawless wins, the
 *      longest combo, the levels cleared, best times); the classic record and
 *      the leaderboard do not (a classic win alongside is the control that shows
 *      the measurement can move); 3d. today's daily mission counts a killer win
 *   4. losses — on mistakes and thrown away — count against the killer record only
 *   5. which puzzle a game starts on — "next game" after a killer is a killer,
 *      a puzzle handed in (daily, 1v1) is classic; a killer save that lost its
 *      solution gets it back from its cages, not from a classic solve
 *   6. the cloud merge carries the killer record from both phones, every field
 *   7. the Logic Score counts both kinds (user, 2026-10-08) — and a classic-only
 *      player's score is exactly what it was before: 3000 random classic records
 *      against the formula as it stood (copied below), the leaderboard holds it
 *
 * Decisions behind 3 and 4: killer records are kept apart (user, 2026-10-01),
 * and hold what a classic record holds (user, 2026-10-07: the two kinds differ
 * in the puzzle only — one win path, the kind choosing the record).
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
const { loadDailyRecords, getTodayDateKey, getDailyMission } = await import('../../../src/utils/dailyChallenge.js');
const { startingPuzzle, savedPuzzle } = await import('../../../src/engine/puzzleSetup.js');
const { generateKillerPuzzle } = await import('../../../src/engine/killer/killerGenerator.js');
const { speedrunRankFor } = await import('../../../src/utils/speedrunRank.js');
const { iqStatsService, combinedRecord } = await import('../../../src/services/iqStatsService.js');
const { LOCALES } = await import('../../lib/locales.js');
const { mergeStats } = await import('../../../src/services/progressMerge.js');
const { cloudSyncService } = await import('../../../src/services/cloudSyncService.js');
const { playGamesService } = await import('../../../src/services/playGamesService.js');
cloudSyncService.saveToCloud = async () => ({ success: true });
let submissions = 0;
let scoreSubmissions = 0;
playGamesService.submitScore = () => { submissions++; };
playGamesService.submitBrainIQ = () => { scoreSubmissions++; };

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
const win = (variant, { level = 3, time = 200, hints = 0, mode = 'classic', mistakes = 0, combo = 0 } = {}) => {
  localStorage.setItem('suidoku_settings_v1', JSON.stringify({ limitMistakes: true }));
  handleGameWinLogic({
    level, timerSeconds: time, gameMode: mode, variant, mistakes, hintsUsed: hints, comboCount: combo,
    activeDailyDateKey: null, clearGameState: () => {}, setIsVictory: () => {}, setHintsRemaining: () => {}
  });
  return loadStats();
};
{
  localStorage.clear();
  submissions = 0;
  scoreSubmissions = 0;
  let s = win('killer', { level: 3, time: 200, combo: 4 });
  assert.strictEqual(s.killer?.gamesWon, 1, 'a killer win must count in the killer record');
  assert.strictEqual(s.killer?.bestTimes?.[3], 200, 'and set its Lv.3 best time');
  assert.strictEqual(s.killer?.flawlessWins, 1, `a killer won with no mistakes counted ${s.killer?.flawlessWins} flawless wins — a classic win counts 1`);
  assert.strictEqual(s.killer?.maxCombo, 4, `a killer won with a 4-combo kept a longest combo of ${s.killer?.maxCombo}`);
  assert.strictEqual(s.killer?.clearedLevels?.[3], true, 'a killer won without a hint did not mark Lv.3 cleared in the killer record');
  assert.ok(!s.flawlessWins && !s.maxCombo, 'a killer win moved the classic flawless or combo count');
  assert.ok(!s.gamesWon, `a killer win moved the classic wins to ${s.gamesWon} — and with them the Logic Score's win rate`);
  assert.ok(!s.bestTimes?.[3], 'a killer win set a classic best time');
  assert.ok(!s.clearedLevels?.[3], 'a killer win marked a classic level cleared for the Logic Score');
  assert.strictEqual(submissions, 0, `a killer win sent ${submissions} time(s) to a per-level board — those rank classic times`);
  assert.strictEqual(scoreSubmissions, 1, `a killer win sent the Logic Score ${scoreSubmissions} time(s) — it counts both kinds, so once`);

  s = win('killer', { level: 3, time: 150, hints: 1 });
  assert.strictEqual(s.killer.bestTimes[3], 200, 'a killer won with a hint is a win, not a best time (recordEligibility.js)');
  assert.strictEqual(s.killer.gamesWon, 2);

  // Control: the same measurement does move for a classic win.
  s = win('classic', { level: 3, time: 300 });
  assert.strictEqual(s.gamesWon, 1, 'control: a classic win counts in the classic record');
  assert.ok(submissions > 0, 'control: a classic win is submitted — without this, "0 submissions" above proves nothing');
  assert.strictEqual(s.killer.gamesWon, 2, 'a classic win must not touch the killer record');
  console.log('  ✅ 3. a killer win records what a classic win does, in the killer record — nothing in the classic one, nothing to the leaderboard');
}

// ── 3d. The daily mission counts a killer win (2026-10-07) ──────────────────
{
  localStorage.clear();
  const mission = getDailyMission(getTodayDateKey());
  const level = mission.type === 'expert_clear' ? 5 : Math.max(3, mission.minLevel || 1);
  const mode = mission.type === 'speedrun' ? 'timeAttack' : 'classic';
  const before = JSON.parse(localStorage.getItem('suidoku_user_wallet_v1') || '{}').hints || 0;
  win('killer', { level, mode });
  assert.ok(loadDailyRecords()[getTodayDateKey()]?.completed, `a killer win (Lv.${level} ${mode}) left today's ${mission.type} mission undone — the mission counts wins of either kind`);
  const after = JSON.parse(localStorage.getItem('suidoku_user_wallet_v1') || '{}').hints || 0;
  assert.ok(after > before, 'the mission a killer completed gave no hint');
  console.log(`  ✅ 3d. today's mission (${mission.type}) is completed by a killer win, with its hint`);
}

// ── 3b. A killer speedrun (2026-10-07) ──────────────────────────────────────
// Its clock carries +10 s penalties, so its best time has its own table, as the
// classic speedrun does — beside the killer's plain one, never in the classic one.
{
  localStorage.clear();
  submissions = 0;
  let s = win('killer', { level: 2, time: 140, mode: 'timeAttack' });
  assert.strictEqual(s.killer?.timeAttackBestTimes?.[2], 140, 'a killer speedrun must set the killer speedrun Lv.2 best time');
  assert.ok(!s.killer?.bestTimes?.[2], `a killer speedrun set the plain killer best time to ${s.killer?.bestTimes?.[2]} — speedrun times are kept apart`);
  assert.ok(!s.timeAttackBestTimes?.[2], 'a killer speedrun set the classic speedrun best time');
  assert.strictEqual(s.killer.gamesWon, 1, 'a killer speedrun win counts in the killer record');
  assert.strictEqual(submissions, 0, 'a killer speedrun was sent to the Play Games leaderboard');
  s = win('killer', { level: 2, time: 180 });
  assert.strictEqual(s.killer.bestTimes[2], 180, 'control: a plain killer win sets the plain best time');
  assert.strictEqual(s.killer.timeAttackBestTimes[2], 140, 'a plain killer win must not touch the speedrun table');
  console.log('  ✅ 3b. a killer speedrun keeps its own best time — not the plain killer one, not the classic speedrun');
}

// ── 3c. The grade (2026-10-07) ──────────────────────────────────────────────
// A killer is graded on its own times (scripts/analysis/killer_time_model.mjs):
// on the classic ones it would always come out C.
{
  assert.strictEqual(speedrunRankFor(1, 'classic', 105, 'killer').rank, 'S+', '105 s at Lv.1 must be S+ for a killer — graded on classic times instead');
  assert.strictEqual(speedrunRankFor(1, 'classic', 105).rank, 'A', 'control: 105 s at Lv.1 is A on the classic times');
  assert.strictEqual(speedrunRankFor(5, 'timeAttack', 1200, 'killer').rank, 'S', 'a 20-minute killer Lv.5 speedrun is S');
  const cut = (variant, level) => ['S+', 'S', 'A', 'B'].map((r) => {
    for (let s = 1; s < 5000; s++) if (speedrunRankFor(level, 'classic', s + 1, variant).rank !== speedrunRankFor(level, 'classic', s, variant).rank) {
      if (speedrunRankFor(level, 'classic', s, variant).rank === r) return s;
    }
    return null;
  });
  for (let level = 1; level <= 5; level++) {
    const k = cut('killer', level), c = cut('classic', level);
    k.forEach((t, i) => assert.ok(t > c[i], `Lv.${level} killer ${['S+', 'S', 'A', 'B'][i]} ends at ${t}s, classic at ${c[i]}s — a killer takes longer, never less`));
    if (level > 1) cut('killer', level - 1).forEach((t, i) => assert.ok(k[i] > t, `killer ${['S+', 'S', 'A', 'B'][i]}: Lv.${level} ends at ${k[i]}s, Lv.${level - 1} at ${t}s — a harder level must allow more time`));
  }
  // The grade goes into the shared line too, in every language (user, 2026-10-07).
  for (const loc of LOCALES) {
    const { killer } = await import(`../../../src/i18n/locales/${loc}/killer.js`);
    assert.ok(killer.killer.shareText.includes('{rank}'), `${loc}: the killer share line has no {rank} — a shared killer win leaves its grade out`);
  }
  console.log('  ✅ 3c. a killer is graded on killer times — longer than classic at every grade and level, growing with the level, and shared with the grade in every language');
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
  const speed = mergeStats({ killer: { timeAttackBestTimes: { 2: 140 } } }, { killer: { timeAttackBestTimes: { 2: 160, 5: 900 } } }).killer;
  const rest = mergeStats({ killer: { flawlessWins: 4, maxCombo: 9, clearedLevels: { 4: true } } }, { killer: { gamesWon: 1, clearedLevels: { 2: true } } }).killer;
  assert.strictEqual(rest.flawlessWins, 4, 'a killer flawless count only in the cloud comes back, as the classic one does');
  assert.strictEqual(rest.maxCombo, 9, 'a killer longest combo only in the cloud comes back');
  assert.deepStrictEqual(rest.clearedLevels, { 2: true, 4: true }, 'killer levels cleared on either phone stay cleared');
  assert.deepStrictEqual(speed.timeAttackBestTimes, { 2: 140, 5: 900 }, 'killer speedrun best times: the faster per level, from either phone');
  console.log('  ✅ 6. the cloud merge keeps both phones\' killer records by the classic rules');
}

// ── 7. One Logic Score for both kinds (2026-10-08) ──────────────────────────
// The formula as it stood before killers counted, for classic records only. A
// classic-only player's score — on the leaderboard already — must not move.
const BEFORE = {
  score(stats) {
    const played = Number(stats.gamesPlayed) || 0;
    const won = Number(stats.gamesWon) || 0;
    if (won <= 0) return 100;
    const winRate = played > 0 ? (won / played) : 0;
    const bestTimes = stats.bestTimes || {};
    let iq = 100 + Math.min(6, Math.log2(won + 1) * 1.5);
    const clearedLevels = stats.clearedLevels || {};
    let maxLevelCleared = 1;
    for (let lv = 5; lv >= 1; lv--) if (clearedLevels[lv] || (bestTimes[lv] && bestTimes[lv] > 0)) { maxLevelCleared = lv; break; }
    iq += ({ 1: 1, 2: 3, 3: 8, 4: 16, 5: 26 })[maxLevelCleared] || 1;
    iq += (winRate * 5) * Math.min(1, played / 5);
    return Math.min(150, Math.max(95, Math.round(iq)));
  },
  profile(stats) {
    const clamp = (n) => Math.max(15, Math.min(99, Math.round(n)));
    const played = Number(stats.gamesPlayed) || 0, won = Number(stats.gamesWon) || 0;
    const bestTimes = stats.bestTimes || {}, flawless = Number(stats.flawlessWins) || 0;
    const survival = Number(stats.timeLimitSurvivalWins) || 0, maxCombo = Number(stats.maxCombo) || 0;
    const PAR = { 1: 240, 2: 360, 3: 480, 4: 720, 5: 1080 };
    const ratios = [];
    for (let lv = 1; lv <= 5; lv++) if (bestTimes[lv] > 0) ratios.push(bestTimes[lv] / PAR[lv]);
    const avg = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
    const clearedLevels = stats.clearedLevels || {};
    let maxLevel = 0, levelsCleared = 0;
    for (let lv = 1; lv <= 5; lv++) if (clearedLevels[lv] || bestTimes[lv] > 0) { levelsCleared++; maxLevel = lv; }
    return {
      speed: avg === null ? 15 : clamp(100 - avg * 55),
      logic: maxLevel === 0 ? 15 : clamp(28 + maxLevel * 10 + levelsCleared * 4),
      accuracy: played === 0 ? 15 : clamp((won / played) * 100),
      endurance: played === 0 ? 15 : clamp(25 + survival * 8 + Math.min(28, played * 0.6)),
      focus: won === 0 ? 15 : clamp(35 + (flawless / won) * 50 + Math.min(14, maxCombo * 1.4)),
    };
  },
};
{
  let seed = 11;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  let moved = 0;
  for (let i = 0; i < 3000; i++) {
    const s = {};
    if (rnd() < 0.9) s.gamesPlayed = Math.floor(rnd() * 300);
    if (rnd() < 0.9) s.gamesWon = Math.floor(rnd() * (s.gamesPlayed || 50));
    if (rnd() < 0.6) s.flawlessWins = Math.floor(rnd() * 40);
    if (rnd() < 0.6) s.maxCombo = Math.floor(rnd() * 30);
    if (rnd() < 0.4) s.timeLimitSurvivalWins = Math.floor(rnd() * 20);
    if (rnd() < 0.8) { s.bestTimes = {}; for (let lv = 1; lv <= 5; lv++) if (rnd() < 0.5) s.bestTimes[lv] = rnd() < 0.1 ? null : 30 + Math.floor(rnd() * 2000); }
    if (rnd() < 0.6) { s.clearedLevels = {}; for (let lv = 1; lv <= 5; lv++) if (rnd() < 0.4) s.clearedLevels[lv] = true; }
    if (iqStatsService.calculateBrainIQ(s) !== BEFORE.score(s)
      || JSON.stringify(iqStatsService.calculateCognitiveProfile(s)) !== JSON.stringify(BEFORE.profile(s))) moved++;
  }
  assert.strictEqual(moved, 0, `${moved} of 3000 classic-only records got a different Logic Score or profile — a classic player's score on the leaderboard would change for no play of theirs`);

  // The same play counts the same in either kind.
  const play = { gamesPlayed: 12, gamesWon: 9, flawlessWins: 3, maxCombo: 5, clearedLevels: { 1: true, 4: true } };
  assert.strictEqual(iqStatsService.calculateBrainIQ({ killer: play }), iqStatsService.calculateBrainIQ(play), 'a killer-only player scores differently from a classic player with the same record');
  // A killer Lv.5 lifts the hardest level; killer losses lower the win rate.
  const classic = { gamesPlayed: 10, gamesWon: 10, clearedLevels: { 2: true } };
  assert.ok(iqStatsService.calculateBrainIQ({ ...classic, killer: { gamesPlayed: 1, gamesWon: 1, clearedLevels: { 5: true } } }) > iqStatsService.calculateBrainIQ(classic), 'a killer Lv.5 cleared did not raise the Logic Score');
  assert.ok(iqStatsService.calculateCognitiveProfile({ ...classic, killer: { gamesPlayed: 10, gamesWon: 0 } }).accuracy < iqStatsService.calculateCognitiveProfile(classic).accuracy, 'ten killer games lost left the win rate untouched');
  // Speed: a killer time against killer par — Lv.3 par 480 s classic is 1140 s killer.
  const fast = iqStatsService.calculateCognitiveProfile({ gamesPlayed: 1, gamesWon: 1, bestTimes: { 3: 480 } }).speed;
  assert.strictEqual(iqStatsService.calculateCognitiveProfile({ killer: { gamesPlayed: 1, gamesWon: 1, bestTimes: { 3: 1140 } } }).speed, fast, 'a killer at killer par is not as fast as a classic at classic par — killer times are measured against classic par');
  // Home's "puzzles cleared" counts both.
  assert.strictEqual(combinedRecord({ gamesWon: 4, killer: { gamesWon: 3 } }).gamesWon, 7, 'the cleared count beside the Logic Score leaves killer wins out');
  console.log('  ✅ 7. one Logic Score for both kinds — 3000 classic-only records score exactly as before; a killer counts as a classic with the same record, at killer par');
}

console.log('\n✅ [2-28] PASSED — a killer game plays and counts as a killer');
