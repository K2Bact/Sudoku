/**
 * Gate 2-31 — a win pays the day's mission the player was shown.
 *
 * ChatGPT's review of 2026-10-21 (CH21-01, BACKLOG D25). The mission's tier
 * follows the wins: under 15 an intermediate player is shown "clear Lv.3" or
 * "a Speedrun", at 15 with Lv.4 cleared an advanced one is shown Lv.4+. The
 * win path counted the win first and read the mission after — so the 15th win,
 * a Lv.3 clear of exactly the mission on the card, was judged against the
 * Lv.4 mission it had just unlocked: no calendar mark, no hint. Only a plain
 * game; a daily started from the calendar or the mission button carries its
 * own day and was right all along.
 *
 * Driven through the real handleGameWinLogic with the clock fixed to a day of
 * each mission type, both kinds, three ways each:
 *   13 -> 14 wins     the control: the tier does not move
 *   14 -> 15 wins     the boundary: the tier moves with this win
 *   the mission's own game (activeDailyDateKey) — the control that was right
 * Every case first checks that its day really is the boundary it claims —
 * that the mission seen before the win would NOT pass after it — so a case
 * that stops testing anything says so instead of passing.
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

// The day, fixed: every "today" in the app is new Date() (dateKey.js).
const RealDate = Date;
let fixedNow = null;
globalThis.Date = class extends RealDate {
  constructor(...a) { if (a.length === 0 && fixedNow !== null) super(fixedNow); else super(...a); }
  static now() { return fixedNow ?? RealDate.now(); }
};

const { handleGameWinLogic } = await import('../../../src/utils/gameCompletion.js');
const { getDailyMission, loadDailyRecords } = await import('../../../src/utils/dailyChallenge.js');
const { USER_STATS_KEY } = await import('../../../src/utils/storage.js');
const { WALLET_STORAGE_KEY, loadWallet } = await import('../../../src/utils/wallet.js');
const { cloudSyncService } = await import('../../../src/services/cloudSyncService.js');
const { playGamesService } = await import('../../../src/services/playGamesService.js');
cloudSyncService.saveToCloud = async () => ({ success: true });
playGamesService.submitScore = () => {};
playGamesService.submitBrainIQ = () => {};

console.log('\n📅 [2-31] A win pays the day\'s mission the player was shown');

const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// A player with Lv.4 cleared: 14 wins is intermediate, 15 advanced. Either kind's
// record counts (getUserSkillTier), so the killer cases keep it in stats.killer.
const statsWith = (wins, variant) => {
  const own = { gamesPlayed: wins, gamesWon: wins, bestTimes: { 3: 300, 4: 500 } };
  return variant === 'killer' ? { killer: own } : own;
};
const passes = (m, level, gameMode) => (m.type === 'level_clear' && level >= m.minLevel)
  || (m.type === 'speedrun' && gameMode === 'timeAttack')
  || (m.type === 'expert_clear' && level >= 5);

// The next days, from a fixed start, whose intermediate mission is each type.
const start = new RealDate('2026-10-22T12:00:00');
const dayOf = (type) => {
  for (let n = 0; n < 9; n++) {
    const d = new RealDate(start.getTime() + n * 86400000);
    if (getDailyMission(key(d), statsWith(14, 'classic')).type === type) return d;
  }
  throw new Error(`no ${type} day for an intermediate player within 9 days — getDailyMission changed`);
};

let cases = 0;
for (const [type, gameMode] of [['level_clear', 'classic'], ['speedrun', 'timeAttack']]) {
  const day = dayOf(type);
  const dateKey = key(day);
  fixedNow = day.getTime();
  for (const variant of ['classic', 'killer']) {
    for (const [wins, how] of [[13, 'plain game'], [14, 'plain game'], [14, 'the mission\'s own game']]) {
      const tag = `${dateKey} ${type} · ${variant} · ${wins}->${wins + 1} wins · ${how}`;
      localStorage.clear();
      localStorage.setItem(USER_STATS_KEY, JSON.stringify(statsWith(wins, variant)));
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ hints: 3, lastDailyClaimDate: dateKey, streakDays: 1, totalVisitDays: 1, totalAdsWatched: 0, history: [] }));
      const shown = getDailyMission(dateKey);
      assert(passes(shown, 3, gameMode), `${tag}: the case is wrong — a Lv.3 ${gameMode} does not pass the mission on the card (${shown.type} Lv.${shown.minLevel})`);
      if (wins === 14 && how === 'plain game') {
        const after = getDailyMission(dateKey, statsWith(15, variant));
        assert(!passes(after, 3, gameMode),
          `${tag}: not a boundary any more — the mission after the 15th win (${after.tier} ${after.type}) still passes, so this case tests nothing`);
      }
      handleGameWinLogic({
        level: 3, timerSeconds: 400, gameMode, variant, mistakes: 0,
        activeDailyDateKey: how === 'plain game' ? null : dateKey,
        clearGameState() {}, setIsVictory() {}, setHintsRemaining() {},
      });
      const day1 = loadDailyRecords()[dateKey];
      const hints = loadWallet().hints;
      assert(day1?.completed,
        `${tag}: the mission on the card (${shown.tier} ${shown.type} Lv.${shown.minLevel}) was cleared and today is not marked — ` +
        'the win was judged against the mission its own count unlocked (D25)');
      assert.strictEqual(hints, 4, `${tag}: hints ${hints} after the mission (want 3 + 1)`);
      assert.strictEqual(day1.variant, variant, `${tag}: the day's record says ${day1.variant}`);
      // D36: the calendar says why a day's puzzle stays closed — it needs to know a mission closed it.
      const via = how === 'plain game' ? 'mission' : 'puzzle';
      assert.strictEqual(day1.via, via, `${tag}: the day's record says via=${day1.via}, not ${via} — the calendar would explain the wrong thing (D36)`);
      cases++;
    }
  }
}
fixedNow = null;
// The other mission that writes the day: a 1v1 or AI battle, from its result window.
{
  const fs = await import('fs');
  const modal = fs.readFileSync(new URL('../../../src/components/BattleResultModal.jsx', import.meta.url), 'utf8');
  assert(/recordDailyCompletion\(todayKey, 0, 0, variantOf\(room\), 'mission'\)/.test(modal),
    'the battle mission must record its day as via=mission, or the calendar calls it a solved puzzle (D36)');
}
console.log(`  ✅ ${cases} cases: level and Speedrun missions, standard and killer, 13->14 and 14->15 wins and the mission's own game — each pays the mission on its card`);
console.log('\n✅ [2-31] PASSED — a win pays the day\'s mission the player was shown');
