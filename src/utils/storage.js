/**
 * storage.js
 * LocalStorage manager for auto-saving game progress, user settings, and stats.
 */

import { isResumableGame } from './savedGame.js';

const GAME_STATE_KEY = 'suidoku_game_state_v1';
export const USER_STATS_KEY = 'suidoku_user_stats_v1';
const SETTINGS_KEY = 'suidoku_settings_v1';

// Save current active game state
export function saveGameState(state) {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to auto-save game state:', e);
  }
}

// Check if active game state exists
export function hasSavedGameState() {
  try {
    const data = localStorage.getItem(GAME_STATE_KEY);
    if (!data) return false;
    return isResumableGame(JSON.parse(data));
  } catch (e) {
    return false;
  }
}

// Load saved active game state
export function loadGameState() {
  try {
    const data = localStorage.getItem(GAME_STATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load saved game state:', e);
    return null;
  }
}

// Clear saved active game state
export function clearGameState() {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (e) {
    console.error('Failed to clear saved game state:', e);
  }
}

// Load user settings
export function loadSettings() {
  const defaultSettings = {
    theme: 'matte-dark',
    language: 'auto',
    soundEnabled: true,
    hapticEnabled: true,
    autoRemoveNotes: true,
    // 1v1: exchange moves with the opponent after a match, for the replay. Mutual —
    // off means neither side's moves are shown to the other (I-1, 2026-09-30).
    shareMatchReplay: true,
    fastEntryMode: false,
    limitMistakes: true,
    autoCheckMistakes: true
  };

  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}

// Save user settings
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Load overall statistics
export function loadStats() {
  try {
    const data = localStorage.getItem(USER_STATS_KEY);
    return data ? JSON.parse(data) : {
      gamesPlayed: 0,
      gamesWon: 0,
      bestTimes: { 1: null, 2: null, 3: null, 4: null, 5: null },
    };
  } catch (e) {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      bestTimes: { 1: null, 2: null, 3: null, 4: null, 5: null },
    };
  }
}

// Record completed game stats
// Modes played against an opponent. Their times never reach a best-time table, and
// their results are counted in the duel record (battleRating.js), not in these counts.
const BATTLE_MODES = new Set(['battle', 'aiBattle']);
export const isDuelMode = (mode) => BATTLE_MODES.has(mode);

/**
 * The record a kind of puzzle writes to. Classic is the stats object itself (it
 * came first); killer is stats.killer, made on first use. Both are kept by the
 * same code below, so whatever a classic game records, a killer records too —
 * the two kinds differ in the puzzle only (user, 2026-10-07). Until then a
 * killer had its own short record (games, wins, best times) and missed the rest.
 */
export function recordOf(stats, variant = 'classic') {
  if (variant !== 'killer') return stats;
  if (!stats.killer || typeof stats.killer !== 'object' || Array.isArray(stats.killer)) stats.killer = {};
  return stats.killer;
}

export function recordGameWin(level, timeInSeconds, mode = 'classic', extra = {}, variant = 'classic') {
  const all = loadStats();
  const stats = recordOf(all, variant);

  /*
   * A duel does not enter the games played / won counts (BT-1, user 2026-09-28).
   *
   * Those two make the win rate, and the win rate is part of the Logic Score that
   * goes to the Play Games leaderboard. A duel only reached one side of it: winning
   * came through here, but losing because the opponent finished first ends on the
   * result screen and never called recordGameLoss. Every duel could raise the rate
   * and none could lower it. A duel already has its own record — wins, losses and
   * a rating — so it is taken out of these counts rather than half put in.
   *
   * Flawless wins go with them: Focus is flawless ÷ won, and a numerator that counts
   * duels over a denominator that does not can pass 100%. Peaks that are not ratios —
   * the hardest level cleared, the longest combo — still take a duel; the board was
   * solved either way.
   */
  if (!isDuelMode(mode)) {
    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
    stats.gamesWon = (stats.gamesWon || 0) + 1;
    // Cumulative counter the achievement engine reads. Without it written here it
    // fell back to single-game context and could never exceed 1, so every
    // "N flawless wins" badge above the first was unreachable.
    if (extra.isFlawless) stats.flawlessWins = (stats.flawlessWins || 0) + 1;
  }
  if (typeof extra.comboCount === 'number') {
    stats.maxCombo = Math.max(stats.maxCombo || 0, extra.comboCount);
  }
  // Notes placed in games won — the "use notes 50 times" achievement (2026-10-08).
  if (Number.isInteger(extra.notesPlaced) && extra.notesPlaced > 0) {
    stats.notesPlaced = (stats.notesPlaced || 0) + extra.notesPlaced;
  }

  // Levels cleared without a hint — the Logic Score difficulty metric. Kept apart
  // from the best times so a player who plays without the mistake limit still gets
  // credit for the levels they can solve (recordEligibility.js).
  if (extra.hintsUsed === 0 || extra.hintsUsed === undefined) {
    stats.clearedLevels = { ...(stats.clearedLevels || {}), [level]: true };
  }

  let isNewRecord = false;
  // Best times move only when the win counts as a record (recordEligibility.js).
  const countsAsRecord = extra.countsAsRecord !== false;

  if (!countsAsRecord) {
    if (mode === 'timeLimit') stats.timeLimitSurvivalWins = (stats.timeLimitSurvivalWins || 0) + 1;
  } else if (mode === 'timeAttack') {
    if (!stats.timeAttackBestTimes) stats.timeAttackBestTimes = {};
    const currentBest = stats.timeAttackBestTimes[level];
    if (!currentBest || timeInSeconds < currentBest) {
      stats.timeAttackBestTimes[level] = timeInSeconds;
      isNewRecord = true;
    }
  } else if (mode === 'timeLimit') {
    stats.timeLimitSurvivalWins = (stats.timeLimitSurvivalWins || 0) + 1;
    /*
     * Survival's best is the fastest clear: the seconds played (D16, user
     * 2026-10-09: "3분 남기고 이기던 10분을 남기던. 깨는데 걸린 시간을 적어야지").
     *
     * It used to keep the clock at the win in timeLimitBestTimes — in Survival the
     * time LEFT — and called the smallest the best, so the narrowest escape was
     * the record, shown as if it were a time to clear. Those values cannot be
     * turned into seconds played, and phones on 1.4.0 keep writing them, so the
     * fastest clear has its own table and the old one is no longer read or written.
     * A Survival win whose seconds played are unknown sets no best.
     */
    if (Number.isFinite(timeInSeconds) && timeInSeconds > 0) {
      if (!stats.survivalBestTimes) stats.survivalBestTimes = {};
      const currentBest = stats.survivalBestTimes[level];
      if (!currentBest || timeInSeconds < currentBest) {
        stats.survivalBestTimes[level] = timeInSeconds;
        isNewRecord = true;
      }
    }
  } else if (BATTLE_MODES.has(mode)) {
    /*
     * A duel is not a time trial, so it leaves no time behind.
     *
     * Everything that is not Speedrun or Survival used to fall into the Classic
     * best-time table, and 1v1 and the AI match came through here too (BT-1).
     * A duel is played against someone you can watch: you rush when they are
     * ahead, you stop mattering when they finish, and the board can end under
     * you. Those seconds are not comparable with a Classic run, and they were
     * landing in the same table the player reads as their personal record.
     *
     * Only the clock is dropped here; the counts above already left the duel out.
     */
  } else {
    if (!stats.bestTimes) stats.bestTimes = {};
    const currentBest = stats.bestTimes[level];
    if (!currentBest || timeInSeconds < currentBest) {
      stats.bestTimes[level] = timeInSeconds;
      isNewRecord = true;
    }
  }
  
  try {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to update stats:', e);
  }
  return { stats: all, isNewRecord };
}

// Record lost / game over stats, in the record of the kind that was lost. A duel
// lost on mistakes is the duel record's to count, like a duel won (see
// recordGameWin, BT-1).
export function recordGameLoss(mode, variant = 'classic') {
  const all = loadStats();
  if (isDuelMode(mode)) return all;
  const stats = recordOf(all, variant);
  stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;

  try {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to update stats on loss:', e);
  }
  return all;
}

const PLAY_GAMES_USER_KEY = 'suidoku_play_games_user_v1';

export function savePlayGamesUser(user) {
  try {
    localStorage.setItem(PLAY_GAMES_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save Play Games user:', e);
  }
}

export function getPlayGamesUser() {
  try {
    const data = localStorage.getItem(PLAY_GAMES_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}


