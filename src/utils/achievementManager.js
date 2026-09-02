import { ACHIEVEMENTS_LIST } from '../data/achievementsData.js';
import { loadStats } from './storage.js';
import { loadWallet } from './wallet.js';
import { playGamesService } from '../services/playGamesService.js';

const STORAGE_KEY = 'sudoku_achievements_v1';

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

/**
 * Check and evaluate all 30 achievements on game win, action or session updates.
 * @param {Object} ctx Gameplay context parameters
 * @returns {Array} newly unlocked achievements
 */
export function checkAndUnlockAchievements(ctx = {}) {
  const unlockedMap = loadUnlockedAchievements();
  const stats = loadStats();
  const newlyUnlocked = [];

  const won = stats.gamesWon || 0;
  const flawlessCount = stats.flawlessWins || (ctx.isFlawless ? 1 : 0);
  const survivalWins = stats.timeLimitSurvivalWins || 0;
  // The attendance streak lives in the wallet, which is where claimDailyAttendance
  // maintains it. Reading stats.dailyStreak — a field nothing has ever written —
  // pinned this at 0 and made the 7-day badge permanently unreachable.
  const dailyStreak = loadWallet().streakDays || 0;
  const maxCombo = Math.max(stats.maxCombo || 0, ctx.comboCount || 0);

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

      // Logic & Perfection
      case 'flawless_1': isEarned = ctx.mistakes === 0 || flawlessCount >= 1; break;
      case 'flawless_5': isEarned = flawlessCount >= 5; break;
      case 'pure_logic_expert': isEarned = ctx.level >= 4 && ctx.hintsUsed === 0; break;
      case 'pure_logic_master': isEarned = ctx.level >= 5 && ctx.hintsUsed === 0 && ctx.mistakes === 0; break;
      case 'note_master': isEarned = (ctx.notesUsedCount || 0) >= 50; break;
      case 'no_notes': isEarned = ctx.level >= 3 && ctx.notesUsedCount === 0; break;
      case 'fast_entry_fan': isEarned = Boolean(ctx.usedFastEntryThisGame); break;

      // Speed & Ranks
      case 'rank_s_plus': isEarned = ctx.rank === 'S+'; break;
      case 'speed_runner_3m': isEarned = ctx.timerSeconds > 0 && ctx.timerSeconds <= 180; break;
      case 'speed_runner_2m': isEarned = ctx.timerSeconds > 0 && ctx.timerSeconds <= 120; break;
      case 'combo_streak_5': isEarned = maxCombo >= 5; break;
      case 'combo_streak_10': isEarned = maxCombo >= 10; break;

      // Difficulty & Survival
      case 'clear_lv1': isEarned = ctx.level === 1 && won >= 1; break;
      case 'clear_lv2': isEarned = ctx.level === 2 && won >= 1; break;
      case 'clear_lv3': isEarned = ctx.level === 3 && won >= 1; break;
      case 'clear_lv4': isEarned = ctx.level === 4 && won >= 1; break;
      case 'clear_lv5': isEarned = ctx.level === 5 && won >= 1; break;
      case 'survival_hero': isEarned = ctx.gameMode === 'timeLimit' || survivalWins >= 1; break;
      case 'survival_clutch': isEarned = ctx.gameMode === 'timeLimit' && (ctx.survivalRemainingSeconds || 99) <= 5; break;

      // Special
      case 'daily_first': isEarned = Boolean(ctx.isDaily); break;
      case 'daily_streak_7': isEarned = dailyStreak >= 7; break;
      case 'battle_first_win': isEarned = Boolean(ctx.isBattleWin); break;
      case 'iq_150': isEarned = (ctx.iq || 0) >= 150; break;

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
