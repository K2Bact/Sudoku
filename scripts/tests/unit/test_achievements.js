/**
 * Gate 2-30 — every achievement can be earned, and only by doing what it says.
 *
 * Written 2026-10-08 with the forty achievements that go to Play Games (D11). A
 * Play Games achievement cannot be deleted once published, so one that nobody can
 * earn, or that everybody gets for nothing, stays broken in public for good.
 * Going through the thirty the app already had found nine that were:
 *
 *   unreachable  iq_150 (asked for 150; the score tops out at 137, and nothing
 *                passed the score anyway) · battle_first_win (nothing passed a
 *                duel win) · note_master and fast_entry_fan (the win never said
 *                how many notes, or whether Fast Entry was used) · survival_clutch
 *                (the time left was never passed, and 0 read as 99)
 *   for nothing  no_notes (a missing notes count read as zero: every Lv.3 win) ·
 *                speed_runner_3m/2m and rank_s_plus in Survival (the clock there
 *                is time LEFT, and gains 7 s a cell). Survival was left out of
 *                those three that day, and is back since the win reports the
 *                seconds actually played (BACKLOG D15, section 7)
 *
 *   1. the list and the rules match — every achievement has a rule and texts in
 *      all thirteen languages, every rule an achievement
 *   2. each one is earned through the path the app really takes: a win through
 *      handleGameWinLogic, a day through claimDailyAttendance, a lesson through
 *      markPracticeSolved — then the check the app runs there
 *   3. and is not earned by the near miss next to it (49 notes, 6 seconds left,
 *      a killer Lv.2, a score of 134 …) — the control that shows 2 measures the
 *      rule, not a check that passes everything
 *   4. the Logic Master number is the top tier's own, and every language says it
 *   5. the hooks call what 2 calls: the duel, the academy, app start, the notes
 *   6. what the achievements count survives a phone change (the cloud merge)
 *   7. Survival is graded on the seconds played, not the time left; Classic and
 *      Speedrun grade exactly as before
 *   8. Play Games would take them: the import builder's rules (no commas in the
 *      unquoted CSV, names unique per language, points in fives within 2,000)
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] ?? null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};
global.window = { localStorage: global.localStorage, navigator: { onLine: true }, dispatchEvent: () => true };
if (typeof globalThis.CustomEvent !== 'function') globalThis.CustomEvent = class { constructor(t, i) { this.type = t; this.detail = i?.detail; } };

const { ACHIEVEMENTS_LIST } = await import('../../../src/data/achievementsData.js');
const { checkAndUnlockAchievements, ACHIEVEMENTS_STORAGE_KEY, LOGIC_MASTER_SCORE } = await import('../../../src/utils/achievementManager.js');
const { handleGameWinLogic } = await import('../../../src/utils/gameCompletion.js');
const { USER_STATS_KEY } = await import('../../../src/utils/storage.js');
const { WALLET_STORAGE_KEY, claimDailyAttendance, loadWallet } = await import('../../../src/utils/wallet.js');
const { getTodayDateKey } = await import('../../../src/utils/dateKey.js');
const { markPracticeSolved, academyCounts, ACADEMY_PROGRESS_KEY } = await import('../../../src/utils/academyProgress.js');
const { ACADEMY_STAGES } = await import('../../../src/data/academyStrategies.js');
const { getPracticeMissions } = await import('../../../src/data/academy/practice/index.js');
const { newPlayFacts, restorePlayFacts, notePlaced, digitPlaced, winFacts } = await import('../../../src/utils/playFacts.js');
const { iqStatsService } = await import('../../../src/services/iqStatsService.js');
const { mergeProgress } = await import('../../../src/services/progressMerge.js');
const { cloudSyncService } = await import('../../../src/services/cloudSyncService.js');
const { playGamesService } = await import('../../../src/services/playGamesService.js');
const { LOCALES } = await import('../../lib/locales.js');
const { speedrunRankFor, timeTakenFor } = await import('../../../src/utils/speedrunRank.js');
const { DIFFICULTY_CONFIG } = await import('../../../src/engine/SudokuEngine.js');
cloudSyncService.saveToCloud = async () => ({ success: true });
playGamesService.submitScore = () => {};
playGamesService.submitBrainIQ = () => {};

console.log('\n🏅 [2-30] Every achievement can be earned, and only by doing what it says');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const unlocked = () => JSON.parse(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY) || '{}');
const setStats = (s) => localStorage.setItem(USER_STATS_KEY, JSON.stringify(s));
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return getTodayDateKey(d); };
const setWallet = (w) => localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
  hints: 3, lastDailyClaimDate: null, streakDays: 0, totalVisitDays: 0, totalAdsWatched: 0, history: [], ...w
}));
const win = (o = {}) => handleGameWinLogic({
  level: 3, timerSeconds: 900, gameMode: 'classic', mistakes: 1, activeDailyDateKey: null,
  clearGameState() {}, setIsVictory() {}, setHintsRemaining() {}, ...o
});
/** App start, as useAppModals does it: attendance, then every achievement once. */
const appStart = () => { claimDailyAttendance(); checkAndUnlockAchievements(); };
const practise = (ids) => { for (const id of ids) if (markPracticeSolved(id)) checkAndUnlockAchievements(); };
const stageIds = (id) => ACADEMY_STAGES.find((s) => s.id === id).strategies.map((x) => x.id);
const allTechniques = ACADEMY_STAGES.flatMap((s) => s.strategies.map((x) => x.id));
const factsWith = (notes, fast = false) => {
  const f = newPlayFacts();
  for (let i = 0; i < notes; i++) notePlaced(f);
  digitPlaced(f, fast);
  return winFacts(f);
};

// ── 1. The list and the rules match ─────────────────────────────────────────
{
  const ids = ACHIEVEMENTS_LIST.map((a) => a.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'an achievement id appears twice — the saved map and Play Games key on it');
  const managerSrc = read('src/utils/achievementManager.js');
  const ruled = [...managerSrc.matchAll(/case '([a-z0-9_]+)':/g)].map((m) => m[1]);
  assert.deepStrictEqual(ids.filter((id) => !ruled.includes(id)), [],
    'these achievements have no rule — they are shown and can never be earned');
  assert.deepStrictEqual(ruled.filter((id) => !ids.includes(id)), [],
    'these rules judge an achievement that is not in the list');

  const missing = [];
  for (const loc of LOCALES) {
    const mod = await import(pathToFileURL(path.join(ROOT, 'src/i18n/locales', loc, 'achievements.js')).href);
    const texts = mod.achievements.achievements;
    for (const id of ids) {
      for (const part of ['title', 'desc']) {
        if (typeof texts[id]?.[part] !== 'string' || !texts[id][part].trim()) missing.push(`${loc} ${id}.${part}`);
      }
    }
  }
  assert.deepStrictEqual(missing, [], 'an achievement without its text in a language shows a key there');
  console.log(`  ✅ 1. ${ids.length} achievements, each with a rule and its texts in ${LOCALES.length} languages`);
}

// ── 2 and 3. Earned through the real path — and not by the near miss ───────
//
// Each case: `earn` must unlock the achievement from empty storage; `miss`, the
// nearest thing that is not it, must not. A rule that passed everything would
// pass 2 and fail 3; a rule that nothing reaches fails 2.
const CASES = {
  first_win: { earn: () => win() },
  win_5: { earn: () => { setStats({ gamesPlayed: 4, gamesWon: 4 }); win(); }, miss: () => { setStats({ gamesPlayed: 3, gamesWon: 3 }); win(); } },
  win_10: { earn: () => { setStats({ gamesPlayed: 9, gamesWon: 9 }); win(); } },
  win_25: { earn: () => { setStats({ gamesPlayed: 4, gamesWon: 4, killer: { gamesPlayed: 20, gamesWon: 20 } }); win(); },
    why: 'wins of both kinds together' },
  win_50: { earn: () => { setStats({ gamesPlayed: 49, gamesWon: 49 }); win(); } },
  win_100: { earn: () => { setStats({ gamesPlayed: 99, gamesWon: 99 }); win(); } },
  win_250: { earn: () => { setStats({ gamesPlayed: 249, gamesWon: 249 }); win(); } },
  visit_30: { earn: () => { setWallet({ totalVisitDays: 29, lastDailyClaimDate: daysAgo(5), streakDays: 3 }); appStart(); },
    miss: () => { setWallet({ totalVisitDays: 29, lastDailyClaimDate: getTodayDateKey(), streakDays: 3 }); appStart(); },
    why: 'a missed day does not matter; a second start on the same day is not a second day' },
  visit_100: { earn: () => { setWallet({ totalVisitDays: 99, lastDailyClaimDate: daysAgo(1), streakDays: 1 }); appStart(); } },
  visit_365: { earn: () => { setWallet({ totalVisitDays: 364, lastDailyClaimDate: daysAgo(1), streakDays: 1 }); appStart(); },
    miss: () => { setWallet({ totalVisitDays: 363, lastDailyClaimDate: daysAgo(1), streakDays: 1 }); appStart(); } },

  flawless_1: { earn: () => win({ mistakes: 0 }), miss: () => win({ mistakes: 1 }) },
  flawless_5: { earn: () => { setStats({ gamesPlayed: 4, gamesWon: 4, flawlessWins: 2, killer: { gamesPlayed: 2, gamesWon: 2, flawlessWins: 2 } }); win({ mistakes: 0 }); } },
  pure_logic_expert: { earn: () => win({ level: 4, hintsUsed: 0 }), miss: () => win({ level: 4, hintsUsed: 1 }) },
  pure_logic_master: { earn: () => win({ level: 5, hintsUsed: 0, mistakes: 0 }), miss: () => win({ level: 5, hintsUsed: 0, mistakes: 1 }) },
  note_master: { earn: () => { win({ ...factsWith(30) }); win({ variant: 'killer', ...factsWith(20) }); },
    miss: () => { win({ ...factsWith(30) }); win({ ...factsWith(19) }); },
    why: 'notes placed over the games won, both kinds' },
  no_notes: { earn: () => win({ level: 3, ...factsWith(0) }), miss: () => win({ level: 3, ...factsWith(1) }) },
  fast_entry_fan: { earn: () => win({ ...factsWith(0, true) }), miss: () => win({ ...factsWith(0, false) }) },

  rank_s_plus: { earn: () => win({ level: 1, timerSeconds: 45 }),
    miss: () => { win({ level: 1, timerSeconds: 75 }); win({ level: 1, gameMode: 'timeLimit', timerSeconds: 217, playedSeconds: 240 }); },
    why: 'a Survival Lv.1 played in 240 s ends with 217 s left — B, not the S+ that "240 − 217" made of it (D15)' },
  speed_runner_3m: { earn: () => win({ timerSeconds: 170 }), miss: () => win({ gameMode: 'timeLimit', timerSeconds: 170, playedSeconds: 300 }),
    why: 'in Survival the clock is the time left: 2:50 left after five minutes played is not under three' },
  speed_runner_2m: { earn: () => win({ variant: 'killer', level: 1, gameMode: 'timeAttack', timerSeconds: 115 }), miss: () => win({ timerSeconds: 125 }),
    why: 'a killer counts with the same two minutes (user, 2026-10-08)' },
  combo_streak_5: { earn: () => win({ gameMode: 'timeAttack', comboCount: 5 }), miss: () => win({ gameMode: 'timeAttack', comboCount: 4 }) },
  combo_streak_10: { earn: () => win({ variant: 'killer', gameMode: 'timeAttack', comboCount: 10 }) },

  clear_lv1: { earn: () => win({ level: 1 }), miss: () => win({ level: 2 }) },
  clear_lv2: { earn: () => win({ level: 2 }) },
  clear_lv3: { earn: () => win({ level: 3 }) },
  clear_lv4: { earn: () => win({ level: 4 }) },
  clear_lv5: { earn: () => win({ variant: 'killer', level: 5 }), why: 'a killer Lv.5 is a Lv.5 cleared' },
  survival_hero: { earn: () => win({ gameMode: 'timeLimit', timerSeconds: 200 }) },
  survival_clutch: { earn: () => win({ gameMode: 'timeLimit', timerSeconds: 4 }), miss: () => win({ gameMode: 'timeLimit', timerSeconds: 6 }) },
  killer_first: { earn: () => win({ variant: 'killer' }), miss: () => win() },
  killer_lv3: { earn: () => win({ variant: 'killer', level: 3 }), miss: () => { win({ variant: 'killer', level: 2 }); win({ level: 3 }); } },
  killer_win_25: { earn: () => { setStats({ killer: { gamesPlayed: 24, gamesWon: 24 } }); win({ variant: 'killer' }); },
    miss: () => { setStats({ gamesPlayed: 30, gamesWon: 30, killer: { gamesPlayed: 23, gamesWon: 23 } }); win({ variant: 'killer' }); } },
  killer_lv5: { earn: () => win({ variant: 'killer', level: 5 }), miss: () => { win({ variant: 'killer', level: 4 }); win({ level: 5 }); } },

  daily_first: { earn: () => win({ activeDailyDateKey: getTodayDateKey() }) },
  daily_streak_7: { earn: () => { setWallet({ streakDays: 6, lastDailyClaimDate: daysAgo(1) }); appStart(); },
    miss: () => { setWallet({ streakDays: 6, lastDailyClaimDate: daysAgo(2) }); appStart(); } },
  battle_first_win: { earn: () => checkAndUnlockAchievements({ isBattleWin: true }), miss: () => checkAndUnlockAchievements({}) },
  iq_150: { earn: () => { setStats({ gamesPlayed: 14, gamesWon: 14, clearedLevels: { 5: true } }); win({ level: 5, hintsUsed: 0 }); },
    miss: () => { setStats({ gamesPlayed: 14, gamesWon: 14, clearedLevels: { 4: true } }); win({ level: 4, hintsUsed: 0 }); },
    why: '15 wins, all of them, Lv.5 without a hint: 137; the same with Lv.4: 127' },
  academy_first_lesson: { earn: () => practise(['naked-single']) },
  academy_stage3: { earn: () => practise(stageIds('stage3')), miss: () => practise([...stageIds('stage2'), ...stageIds('stage3').slice(1)]) },
  academy_all: { earn: () => practise(allTechniques), miss: () => practise(allTechniques.slice(1)) },
};
{
  assert.deepStrictEqual(ACHIEVEMENTS_LIST.map((a) => a.id).filter((id) => !CASES[id]), [],
    'an achievement this gate does not try to earn — add its case');
  localStorage.clear();
  checkAndUnlockAchievements();
  assert.deepStrictEqual(Object.keys(unlocked()), [], 'a new player must have no achievement — the check itself hands one out');

  const notEarned = [];
  const earnedByMiss = [];
  let misses = 0;
  for (const [id, c] of Object.entries(CASES)) {
    localStorage.clear();
    c.earn();
    if (!unlocked()[id]) notEarned.push(`${id}${c.why ? ` (${c.why})` : ''}`);
    if (c.miss) {
      misses++;
      localStorage.clear();
      c.miss();
      if (unlocked()[id]) earnedByMiss.push(`${id}${c.why ? ` (${c.why})` : ''}`);
    }
  }
  assert.deepStrictEqual(notEarned, [], 'these achievements cannot be earned by doing what they say');
  assert.deepStrictEqual(earnedByMiss, [], 'these achievements are given for something that is not what they say');
  console.log(`  ✅ 2. all ${Object.keys(CASES).length} are earned through the app's own paths (wins, days, lessons, duels)`);
  console.log(`  ✅ 3. ${misses} near misses earn nothing (49 notes, 6 s left, killer Lv.2, a score of 127, a second start the same day …)`);
}

// A few rules in 3 rest on helpers whose own behaviour is the point.
{
  // A game saved before the facts were kept: what came before is unknown, so it
  // cannot be a game "without notes" — but what is done after still counts.
  const old = restorePlayFacts({ board: [] });
  assert.strictEqual(winFacts(old).notesUsedCount, null, 'an old save\'s notes are unknown, not zero');
  notePlaced(old);
  assert.strictEqual(winFacts(old).notesPlaced, 1, 'notes placed after the resume still count');
  assert.deepStrictEqual(restorePlayFacts({ playFacts: { notesPlaced: 4, fastEntryUsed: true, fromStart: true, rewardedCells: [3, 9] } }),
    { notesPlaced: 4, fastEntryUsed: true, fromStart: true, rewardedCells: [3, 9] }, 'a saved game\'s facts come back as they were');
  localStorage.clear();
  win({ level: 3 });
  assert(!unlocked().no_notes, 'a win that says nothing about notes must not count as one without them');

  localStorage.clear();
  assert.strictEqual(markPracticeSolved('x-wing'), true, 'the first solve of a technique counts');
  assert.strictEqual(markPracticeSolved('x-wing'), false, 'the second does not count again');
  assert.strictEqual(academyCounts().solved, 1);
  const noPractice = allTechniques.filter((id) => !(getPracticeMissions(id) || []).some((m) => m && m.correctVal != null));
  assert.deepStrictEqual(noPractice, [], 'a technique with no practice board makes "every technique" unreachable');

  setWallet({ totalVisitDays: 10, streakDays: 5, lastDailyClaimDate: daysAgo(3) });
  claimDailyAttendance();
  assert.deepStrictEqual([loadWallet().streakDays, loadWallet().totalVisitDays], [1, 11],
    'a missed day starts the streak again but not the days in all');
  console.log('  ✅ 3b. an old save cannot earn "no notes", a technique counts once, a missed day keeps the day count');
}

// ── 4. The Logic Master number ──────────────────────────────────────────────
{
  const tierOf = (s) => iqStatsService.getPercentileReport(s).tierKey;
  assert.strictEqual(tierOf(LOGIC_MASTER_SCORE), 'grandMaster', `${LOGIC_MASTER_SCORE} must be in the top tier`);
  assert.notStrictEqual(tierOf(LOGIC_MASTER_SCORE - 1), 'grandMaster', `${LOGIC_MASTER_SCORE} must be where the top tier starts`);
  const best = iqStatsService.calculateBrainIQ({ gamesPlayed: 1000, gamesWon: 1000, clearedLevels: { 5: true } });
  assert(best >= LOGIC_MASTER_SCORE, `the best record scores ${best}, below the ${LOGIC_MASTER_SCORE} Logic Master asks for`);

  const wrong = [];
  for (const loc of LOCALES) {
    const mod = await import(pathToFileURL(path.join(ROOT, 'src/i18n/locales', loc, 'achievements.js')).href);
    const desc = mod.achievements.achievements.iq_150.desc;
    if (!desc.includes(String(LOGIC_MASTER_SCORE)) || desc.includes('150')) wrong.push(`${loc}: ${desc}`);
  }
  assert.deepStrictEqual(wrong, [], `every language must ask for ${LOGIC_MASTER_SCORE}, the number the rule checks`);
  console.log(`  ✅ 4. Logic Master is ${LOGIC_MASTER_SCORE} — where the top tier starts, below the best score (${best}), in all ${LOCALES.length} languages`);
}

// ── 5. The hooks call what 2 calls ──────────────────────────────────────────
//
// The hooks need React and a device to run; what they must contain is short, so
// it is read. Each line here is a path from 2 that only a hook takes.
{
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const battle = strip(read('src/hooks/useBattleMultiplayer.js'));
  assert(/if \(room\.winner === 'me'\) checkAndUnlockAchievements\(\{ isBattleWin: true \}\)/.test(battle),
    'a duel won must check the achievements with isBattleWin — nothing else passes it');

  const practice = strip(read('src/hooks/useInteractivePractice.js'));
  assert(/setIsSolved\(true\);[\s\S]{0,80}if \(markPracticeSolved\(strategyId\)\) checkAndUnlockAchievements\(\)/.test(practice),
    'a practice board solved must be recorded and the achievements checked');

  const modals = strip(read('src/hooks/useAppModals.js'));
  const listener = modals.indexOf("addEventListener('sudoku_achievement_unlocked'");
  const claim = modals.indexOf('claimDailyAttendance()');
  const check = modals.indexOf('checkAndUnlockAchievements()');
  assert(listener > 0 && claim > listener && check > claim,
    'app start must claim the day, then check the achievements — after the toast listener is attached, or the unlock is silent');

  const input = strip(read('src/hooks/useGameInput.js'));
  assert(/notePlaced\(playFactsRef\?\.current\)/.test(input), 'adding a note must be counted');
  assert(/digitPlaced\(playFactsRef\?\.current, isFastEntryMode\)/.test(input), 'a digit placed in Fast Entry must be noted');
  assert(/\.\.\.winFacts\(playFactsRef\?\.current\)/.test(input), 'the win must report the facts');

  const game = strip(read('src/hooks/useSudokuGame.js'));
  assert(/playFactsRef\.current = newPlayFacts\(\)/.test(game), 'a new game must start with no notes and no Fast Entry');
  assert(/playFactsRef\.current = restorePlayFacts\(saved\)/.test(game), 'a resumed game must get its facts back');
  assert(/playFacts: s\.playFactsRef/.test(strip(read('src/hooks/useGameLifecycle.js'))), 'the saved game must carry the facts');
  console.log('  ✅ 5. the duel, the academy, app start and the board all call what 2 calls');
}

// ── 6. A phone change keeps what the achievements count ────────────────────
{
  const merged = mergeProgress(
    { stats: { gamesPlayed: 3, gamesWon: 3, notesPlaced: 40 }, wallet: { hints: 1, totalVisitDays: 80 },
      academy: { solved: { 'x-wing': true, 'bug': true } } },
    { stats: { gamesPlayed: 3, gamesWon: 3, notesPlaced: 12 }, wallet: { hints: 2, totalVisitDays: 5 },
      academy: { solved: { 'naked-single': true } } });
  assert.strictEqual(merged.wallet.totalVisitDays, 80, 'the days in all must merge as the larger, like the streak');
  assert.deepStrictEqual(Object.keys(merged.academy.solved).sort(), ['bug', 'naked-single', 'x-wing'],
    'a technique practised on either phone stays practised');
  assert.strictEqual(merged.stats.notesPlaced, 12, 'notes placed merge like the other counts: this phone\'s');

  localStorage.clear();
  markPracticeSolved('y-wing');
  assert.deepStrictEqual(cloudSyncService.compileBackupPayload().academy, { solved: { 'y-wing': true } },
    'the backup must carry the academy');
  assert(read('src/services/cloudSyncService.js').includes('localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(merged.academy))'),
    'and a restore must write it back');
  assert.strictEqual(ACADEMY_PROGRESS_KEY, 'suidoku_academy_progress_v1');
  console.log('  ✅ 6. days, techniques and notes survive a phone change');
}

// ── 7. Survival is graded on the seconds played (BACKLOG D15) ───────────────
//
// Survival's clock is the time LEFT, and gains 7 s for each correct cell. The
// grade took "limit − left" for the time taken, which those bonuses shrink: a
// solve at the classic B pace graded S+ on Lv.1–2 and S on Lv.3, and the S+ and
// 3-/2-minute badges had to leave Survival out. The timer now also counts the
// seconds played (useGameTimer), the save keeps them (2-22), and the grade, the
// shared time and the badges read them.
{
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const RANKS = ['S+', 'S', 'A', 'B'];
  const rank = (...a) => speedrunRankFor(...a).rank;
  // Where each grade ends on the classic times — the table as it was set on
  // 2026-09-01 and as it stays. Read off the grade, not copied from the module.
  const cuts = (level) => RANKS.map((r) => {
    for (let s = 1; s < 5000; s++) if (rank(level, 'classic', s) === r && rank(level, 'classic', s + 1) !== r) return s;
    return null;
  });
  const CLASSIC_CUTS = { 1: [60, 90, 150, 240], 2: [90, 150, 240, 360], 3: [120, 210, 330, 480], 4: [180, 300, 480, 660], 5: [240, 420, 660, 900] };
  for (let level = 1; level <= 5; level++) {
    assert.deepStrictEqual(cuts(level), CLASSIC_CUTS[level], `Lv.${level}: the classic grade moved — D15 changes Survival only`);
  }

  // Classic and Speedrun, both kinds, every second to 50 minutes: the clock is the
  // time taken, and the seconds played change nothing.
  const leaks = [];
  for (const variant of ['classic', 'killer']) for (const mode of ['classic', 'timeAttack']) for (let level = 1; level <= 5; level++) {
    for (let t = 0; t <= 3000 && leaks.length < 5; t++) {
      const expected = rank(level, 'classic', t, variant);
      for (const played of [null, 1, t + 333]) {
        const g = speedrunRankFor(level, mode, t, variant, played);
        if (g.rank !== expected || g.timeTaken !== t) { leaks.push(`${variant} ${mode} Lv.${level} ${t}s (played ${played}): ${g.rank}/${g.timeTaken}`); break; }
      }
    }
  }
  assert.deepStrictEqual(leaks, [], 'outside Survival the grade must be the clock\'s, whatever the seconds played say');

  // A Survival game played at the classic B pace, cell after cell: the clock ends
  // at limit − played + 7 s a cell. It must grade B, as Classic does — and the
  // old reading of the same game must be the inflated one D15 found, or this
  // check would pass for a scenario where the two never differed.
  const wrong = [];
  const old = [];
  for (let level = 1; level <= 5; level++) {
    const played = CLASSIC_CUTS[level][3];
    const blanks = 81 - DIFFICULTY_CONFIG[level].clues;
    const limit = DIFFICULTY_CONFIG[level].timeLimitSeconds;
    const left = limit - played + 7 * blanks;
    assert(left > 0, `Lv.${level}: the B pace would run out of time — not a Survival win`);
    const g = rank(level, 'timeLimit', left, 'classic', played);
    if (g !== 'B') wrong.push(`Lv.${level} played ${played}s, ${left}s left: ${g}`);
    old.push(rank(level, 'classic', Math.max(1, limit - left)));
  }
  assert.deepStrictEqual(wrong, [], 'a Survival game played at the classic B pace must grade B — the time left is not the time taken');
  assert.deepStrictEqual(old.slice(0, 3), ['S+', 'S+', 'S'], 'the B-pace scenario no longer reproduces what D15 found — check the times before trusting the line above');

  // The time left does not move the grade at all.
  for (let level = 1; level <= 5; level++) for (let played = 1; played <= 1500; played += 7) {
    for (const left of [1, 59, 217, 999]) {
      assert.strictEqual(rank(level, 'timeLimit', left, 'classic', played), rank(level, 'classic', played),
        `Survival Lv.${level}: ${played}s played with ${left}s left must grade as ${played}s in Classic`);
    }
  }
  // A Survival time nobody passed is unknown: slow, never fast.
  assert.strictEqual(rank(1, 'timeLimit', 230), 'C', 'a Survival win without its seconds played must not grade S+ — "limit − left" is back');
  assert.strictEqual(timeTakenFor('timeLimit', 230, 50), 50);

  // The badges, through the win: fast Survival earns all three, B pace none.
  localStorage.clear();
  win({ level: 1, gameMode: 'timeLimit', timerSeconds: 240 - 50 + 7 * 31, playedSeconds: 50 });
  const fast = ['rank_s_plus', 'speed_runner_3m', 'speed_runner_2m'].filter((id) => !unlocked()[id]);
  assert.deepStrictEqual(fast, [], 'a Survival Lv.1 solved in 50 s must earn S+ and both speed badges');
  localStorage.clear();
  win({ level: 1, gameMode: 'timeLimit', timerSeconds: 217, playedSeconds: 240 });
  win({ level: 1, gameMode: 'timeLimit', timerSeconds: 230 });
  const slow = ['rank_s_plus', 'speed_runner_3m', 'speed_runner_2m'].filter((id) => unlocked()[id]);
  assert.deepStrictEqual(slow, [], 'a Survival win at the B pace, or one whose seconds played are unknown, earns none of the speed badges');

  // The hooks: the timer counts, the win reports, the victory screen reads.
  const timer = strip(read('src/hooks/useGameTimer.js'));
  const tick = timer.slice(timer.indexOf('setInterval('), timer.indexOf('}, 1000)'));
  assert(/^\s*setPlayedSeconds\(prev => prev \+ 1\);/m.test(tick),
    'the timer\'s tick must count a second played — outside the clock\'s updater, which has to stay pure');
  const reset = timer.slice(timer.indexOf('const resetTimer = '), timer.indexOf('setComboCount(0)', timer.indexOf('const resetTimer = ')));
  assert(/setPlayedSeconds\(0\)/.test(reset), 'a new game must start with no seconds played');
  const input = strip(read('src/hooks/useGameInput.js'));
  const winCall = input.slice(input.indexOf('handleGameWinLogic({'), input.indexOf('});', input.indexOf('handleGameWinLogic({')));
  assert(/^\s*playedSeconds,$/m.test(winCall), 'the win must report the seconds played');
  const modal = strip(read('src/components/VictoryModal.jsx'));
  assert(/speedrunRankFor\(level, gameMode, actualSeconds, variant, playedSeconds\)/.test(modal),
    'the victory screen must grade Survival on the seconds played, as the win did');
  assert(/time: formatTime\(rankInfo\.timeTaken\)/.test(modal),
    'the shared line says "cleared in [time]" — in Survival that is the time taken, not the time left');
  const container = strip(read('src/components/modals/GameModalsContainer.jsx'));
  const victoryTag = container.slice(container.indexOf('<VictoryModal'), container.indexOf('/>', container.indexOf('<VictoryModal')));
  assert(/playedSeconds=\{playedSeconds\}/.test(victoryTag), 'the victory screen must be handed the seconds played');
  const app = strip(read('src/App.jsx'));
  const modalsTag = app.slice(app.indexOf('<GameModalsContainer'), app.indexOf('/>', app.indexOf('<GameModalsContainer')));
  assert(/playedSeconds=\{playedSeconds\}/.test(modalsTag), 'App must hand the seconds played to the game modals');
  console.log('  ✅ 7. Survival is graded on the seconds played (B pace = B on every level, not S+); Classic and Speedrun grade as before to 50 min; fast Survival earns S+ and the speed badges, B pace none');
}

// ── 8. Play Games would take them as they are (D11) ─────────────────────────
//
// The forty go to Play Games by one import zip (scripts/store/build_pgs_achievements.mjs).
// Its CSV has no quoting, so a comma inside a name or description splits the row;
// names must differ within a language; points come in fives, 5 to 200, 2,000 in
// all. A text edited here later would break the import silently, on the day it is
// next needed — so the builder's own rules run with this gate.
{
  const pgs = await import('../../store/build_pgs_achievements.mjs');
  const found = pgs.problems(await pgs.loadAchievements());
  assert.deepStrictEqual(found, [], 'Play Games would refuse the achievements as they stand');
  assert.deepStrictEqual(Object.keys(pgs.PLAY_LOCALE).sort(), [...LOCALES].sort(), 'every language of the app needs a Play locale code in the import');
  console.log("  ✅ 8. all 40 pass Play Games' import rules (no commas, names unique per language, points in fives within 2,000)");
}

// ── 9. Each unlock reaches its own Play Games achievement (D11 ④) ───────────
//
// The ids were typed into no file by hand: the console's "Get resources" file is
// kept as games-ids.xml, and the map is held to it by English name. One wrong id
// is an achievement that unlocks here and never in Play Games, silently — or,
// worse, unlocks a different one. An unlock made while signed out goes up at the
// next sign-in, or it would stay on the phone for good.
{
  const { ACHIEVEMENT_IDS, LEADERBOARD_IDS } = await import('../../../src/services/playGamesService.js');
  const xml = read('store_assets/common/pgs_achievements/games-ids.xml');
  const consoleIds = new Map([...xml.matchAll(/<!--achievement (.+?)-->\s*<string name="[^"]+" translatable="false">([^<]+)<\/string>/g)]
    .map((m) => [m[1], m[2]]));
  const en = (await import(pathToFileURL(path.join(ROOT, 'src/i18n/locales/en/achievements.js')).href)).achievements.achievements;
  const wrong = ACHIEVEMENTS_LIST
    .filter((a) => ACHIEVEMENT_IDS[a.id] !== consoleIds.get(en[a.id].title))
    .map((a) => `${a.id} ("${en[a.id].title}"): app ${ACHIEVEMENT_IDS[a.id]} / console ${consoleIds.get(en[a.id].title)}`);
  assert.deepStrictEqual(wrong, [], 'an achievement would unlock a different Play Games achievement, or none');
  assert.strictEqual(new Set(Object.values(ACHIEVEMENT_IDS)).size, ACHIEVEMENTS_LIST.length, 'two achievements share one Play Games id');
  assert.strictEqual(Object.keys(ACHIEVEMENT_IDS).length, ACHIEVEMENTS_LIST.length, 'the map has ids for achievements the app does not have');
  const board = xml.match(/<!--leaderboard Logic Score-->\s*<string name="[^"]+" translatable="false">([^<]+)<\/string>/)?.[1];
  assert.strictEqual(LEADERBOARD_IDS.BRAIN_IQ, board, 'the Logic Score leaderboard id must be the console\'s');

  // An unlock made while signed out goes up at sign-in — each known one, once.
  const { syncAchievementsToPlayGames } = await import('../../../src/utils/achievementManager.js');
  const sent = [];
  const realUnlock = playGamesService.unlockAchievement;
  playGamesService.unlockAchievement = async (key) => { sent.push(key); return { success: true }; };
  try {
    localStorage.clear();
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify({
      first_win: { unlockedAt: '2026-10-01' }, killer_first: { unlockedAt: '2026-10-02' }, streak_7: { unlockedAt: '2026-09-01' },
    }));
    const n = await syncAchievementsToPlayGames();
    assert.deepStrictEqual(sent.sort(), ['first_win', 'killer_first'], 'every unlocked achievement goes up, and only ones that exist');
    assert.strictEqual(n, 2);
  } finally {
    playGamesService.unlockAchievement = realUnlock;
    localStorage.clear();
  }
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const bridge = strip(read('src/utils/playGamesBridge.js'));
  const handler = bridge.slice(bridge.indexOf("addEventListener('playGamesSignedIn'"), bridge.indexOf('listeners.forEach', bridge.indexOf("addEventListener('playGamesSignedIn'")));
  assert(/syncAchievementsToPlayGames\(\)/.test(handler), 'a sign-in must send the achievements unlocked while signed out');
  const view = strip(read('src/components/AchievementsView.jsx'));
  assert(/playGamesService\.showAchievements\(\)/.test(view) && /t\('achievements\.openPlayGames'\)/.test(view),
    'the achievements screen must open Google\'s own achievements screen');
  console.log(`  ✅ 9. all 40 unlock their own Play Games achievement (held to the console's file); a sign-in sends what was earned signed out`);
}

localStorage.clear();
console.log('\n✅ [2-30] PASSED — every achievement can be earned, and only by doing what it says');
