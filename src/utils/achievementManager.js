import { ACHIEVEMENTS_LIST } from '../data/achievementsData.js';
import { loadStats } from './storage.js';
import { loadWallet } from './wallet.js';
import { academyCounts } from './academyProgress.js';
import { playGamesService } from '../services/playGamesService.js';
import { combinedRecord, iqStatsService } from '../services/iqStatsService.js';

// Exported so code that has to put this key back after a failed write (the
// restore rollback in cloudSyncService) names it the way every other owned key
// is named, instead of re-typing the string — gate 2-7 section 6.
export const ACHIEVEMENTS_STORAGE_KEY = 'sudoku_achievements_v1';
const STORAGE_KEY = ACHIEVEMENTS_STORAGE_KEY;

export function loadUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to load achievements:', e);
    return {};
  }
}

export function saveUnlockedAchievements(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save achievements:', e);
  }
}

// The "Logic Master" badge (id iq_150) is the top tier of the Logic Score:
// 135 and up, the top 1% of the curve the tiers are read from. It asked for 150
// until 2026-10-08, which no record can reach — the score tops out at 137
// (100 + 6 volume + 26 for Lv.5 + 5 win rate) — and nothing passed the score in
// either, so the badge could never be earned. The id stays: it is the key in
// every saved achievement map and, once registered, the Play Games achievement.
export const LOGIC_MASTER_SCORE = 135;

/** A killer win at this level, now or before (best times kept by older saves too). */
function killerClearedAt(killer, level, ctx) {
  if (ctx.variant === 'killer' && ctx.level === level) return true;
  if ((killer.clearedLevels || {})[level]) return true;
  return [killer.bestTimes, killer.timeAttackBestTimes, killer.timeLimitBestTimes, killer.survivalBestTimes]
    .some((times) => (times || {})[level] > 0);
}

/**
 * Tell Play Games about every achievement already unlocked here (D11 ④).
 *
 * An unlock reaches Play Games only while signed in: one earned before the
 * player signed in, offline, before the achievement existed in the console, or
 * on a phone whose records came back from the cloud would otherwise stay in
 * this app alone. Play Games ignores an unlock it already has, so this runs on
 * every sign-in (playGamesBridge.js) and sends them all.
 * @returns {Promise<number>} how many Play Games accepted
 */
export async function syncAchievementsToPlayGames() {
  const unlocked = Object.keys(loadUnlockedAchievements());
  const known = new Set(ACHIEVEMENTS_LIST.map((a) => a.id));
  let sent = 0;
  for (const id of unlocked.filter((k) => known.has(k))) {
    const res = await playGamesService.unlockAchievement(id);
    if (res?.success) sent++;
  }
  return sent;
}

/**
 * Check and evaluate every achievement on a win, an academy lesson or app start.
 *
 * A win of either kind counts (user, 2026-10-07: killer and classic differ in the
 * puzzle only), so the counts are classic and killer together — the same
 * combined record the Logic Score reads. The killer badges read the killer
 * record alone. With an empty ctx nothing that needs the game just played can
 * unlock; the record-based ones can, which is how a badge earned before it
 * existed (or before a fix) is handed out on the next check.
 * @param {Object} ctx Gameplay context parameters
 * @returns {Array} newly unlocked achievements
 */
export function checkAndUnlockAchievements(ctx = {}) {
  const unlockedMap = loadUnlockedAchievements();
  const stats = loadStats();
  const newlyUnlocked = [];

  const rec = combinedRecord(stats);
  const killer = stats.killer && typeof stats.killer === 'object' ? stats.killer : {};
  const killerWon = Number(killer.gamesWon) || 0;
  const won = rec.gamesWon;
  const flawlessCount = rec.flawlessWins || (ctx.isFlawless ? 1 : 0);
  const survivalWins = rec.timeLimitSurvivalWins;
  // The attendance streak lives in the wallet, which is where claimDailyAttendance
  // maintains it. Reading stats.dailyStreak — a field nothing has ever written —
  // pinned this at 0 and made the 7-day badge permanently unreachable.
  const wallet = loadWallet();
  const dailyStreak = wallet.streakDays || 0;
  const visitDays = wallet.totalVisitDays || 0;
  const maxCombo = Math.max(rec.maxCombo, ctx.comboCount || 0);
  const logicScore = ctx.iq ?? iqStatsService.calculateBrainIQ(stats);
  const academy = academyCounts();
  const stage3 = academy.byStage.stage3 || { solved: 0, total: 1 };

  ACHIEVEMENTS_LIST.forEach((ach) => {
    if (unlockedMap[ach.id]) return; // already unlocked

    let isEarned = false;

    switch (ach.id) {
      // Progression
      case 'first_win': isEarned = won >= 1; break;
      case 'win_5': isEarned = won >= 5; break;
      case 'win_10': isEarned = won >= 10; break;
      case 'win_25': isEarned = won >= 25; break;
      case 'win_50': isEarned = won >= 50; break;
      case 'win_100': isEarned = won >= 100; break;
      case 'win_250': isEarned = won >= 250; break;
      case 'visit_30': isEarned = visitDays >= 30; break;
      case 'visit_100': isEarned = visitDays >= 100; break;
      case 'visit_365': isEarned = visitDays >= 365; break;

      // Logic & Perfection
      case 'flawless_1': isEarned = ctx.mistakes === 0 || flawlessCount >= 1; break;
      case 'flawless_5': isEarned = flawlessCount >= 5; break;
      case 'pure_logic_expert': isEarned = ctx.level >= 4 && ctx.hintsUsed === 0; break;
      case 'pure_logic_master': isEarned = ctx.level >= 5 && ctx.hintsUsed === 0 && ctx.mistakes === 0; break;
      // Notes placed over the games won, both kinds (playFacts.js → the record).
      case 'note_master': isEarned = rec.notesPlaced >= 50; break;
      case 'no_notes': isEarned = ctx.level >= 3 && ctx.notesUsedCount === 0; break;
      case 'fast_entry_fan': isEarned = Boolean(ctx.usedFastEntryThisGame); break;

      // Speed & Ranks
      // Every mode, Survival included, on the time the puzzle took. Survival was
      // left out on 2026-10-08: its clock is the time left and gains 7 s a cell,
      // and the grade read from it was S+ for a B-speed solve on Lv.1–2. The win
      // now reports the seconds actually played, and the grade and these read
      // that (speedrunRank.js timeTakenFor, BACKLOG D15).
      case 'rank_s_plus': isEarned = ctx.rank === 'S+'; break;
      case 'speed_runner_3m': isEarned = ctx.timeTakenSeconds > 0 && ctx.timeTakenSeconds <= 180; break;
      case 'speed_runner_2m': isEarned = ctx.timeTakenSeconds > 0 && ctx.timeTakenSeconds <= 120; break;
      case 'combo_streak_5': isEarned = maxCombo >= 5; break;
      case 'combo_streak_10': isEarned = maxCombo >= 10; break;

      // Difficulty & Survival
      case 'clear_lv1': isEarned = ctx.level === 1 && won >= 1; break;
      case 'clear_lv2': isEarned = ctx.level === 2 && won >= 1; break;
      case 'clear_lv3': isEarned = ctx.level === 3 && won >= 1; break;
      case 'clear_lv4': isEarned = ctx.level === 4 && won >= 1; break;
      case 'clear_lv5': isEarned = ctx.level === 5 && won >= 1; break;
      case 'survival_hero': isEarned = ctx.gameMode === 'timeLimit' || survivalWins >= 1; break;
      case 'survival_clutch': isEarned = ctx.gameMode === 'timeLimit' && ctx.survivalRemainingSeconds > 0 && ctx.survivalRemainingSeconds <= 5; break;
      case 'killer_first': isEarned = killerWon >= 1; break;
      case 'killer_lv3': isEarned = killerClearedAt(killer, 3, ctx); break;
      case 'killer_win_25': isEarned = killerWon >= 25; break;
      case 'killer_lv5': isEarned = killerClearedAt(killer, 5, ctx); break;

      // Special
      case 'daily_first': isEarned = Boolean(ctx.isDaily); break;
      case 'daily_streak_7': isEarned = dailyStreak >= 7; break;
      case 'battle_first_win': isEarned = Boolean(ctx.isBattleWin); break;
      case 'iq_150': isEarned = logicScore >= LOGIC_MASTER_SCORE; break;
      case 'academy_first_lesson': isEarned = academy.solved >= 1; break;
      case 'academy_stage3': isEarned = stage3.solved >= stage3.total; break;
      case 'academy_all': isEarned = academy.total > 0 && academy.solved >= academy.total; break;

      default: break;
    }

    if (isEarned) {
      unlockedMap[ach.id] = {
        unlockedAt: new Date().toISOString(),
        tier: ach.tier,
        category: ach.category
      };
      newlyUnlocked.push(ach);
      // Auto-bridge to Google Play Games & Apple Game Center
      playGamesService.unlockAchievement(ach.id);
    }
  });

  if (newlyUnlocked.length > 0) {
    saveUnlockedAchievements(unlockedMap);
    if (typeof window !== 'undefined') {
      newlyUnlocked.forEach((ach) => {
        window.dispatchEvent(new CustomEvent('sudoku_achievement_unlocked', { detail: ach }));
      });
    }
  }

  return newlyUnlocked;
}
