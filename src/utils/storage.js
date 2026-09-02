/**
 * storage.js
 * LocalStorage manager for auto-saving game progress, user settings, and stats.
 */

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
    const parsed = JSON.parse(data);
    return parsed && parsed.board && !parsed.isGameOver && (parsed.mistakes || 0) < 3;
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
export function recordGameWin(level, timeInSeconds, mode = 'classic', extra = {}) {
  const stats = loadStats();
  stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
  stats.gamesWon = (stats.gamesWon || 0) + 1;

  // Cumulative counters the achievement engine reads. Without these written here
  // it fell back to single-game context and could never exceed 1, so every
  // "N flawless wins" / "combo N" badge above the first was unreachable.
  if (extra.isFlawless) stats.flawlessWins = (stats.flawlessWins || 0) + 1;
  if (typeof extra.comboCount === 'number') {
    stats.maxCombo = Math.max(stats.maxCombo || 0, extra.comboCount);
  }

  let isNewRecord = false;

  if (mode === 'timeAttack') {
    if (!stats.timeAttackBestTimes) stats.timeAttackBestTimes = {};
    const currentBest = stats.timeAttackBestTimes[level];
    if (!currentBest || timeInSeconds < currentBest) {
      stats.timeAttackBestTimes[level] = timeInSeconds;
      isNewRecord = true;
    }
  } else if (mode === 'timeLimit') {
    stats.timeLimitSurvivalWins = (stats.timeLimitSurvivalWins || 0) + 1;
    if (!stats.timeLimitBestTimes) stats.timeLimitBestTimes = {};
    const currentBest = stats.timeLimitBestTimes[level];
    if (!currentBest || timeInSeconds < currentBest) {
      stats.timeLimitBestTimes[level] = timeInSeconds;
      isNewRecord = true;
    }
  } else {
    if (!stats.bestTimes) stats.bestTimes = {};
    const currentBest = stats.bestTimes[level];
    if (!currentBest || timeInSeconds < currentBest) {
      stats.bestTimes[level] = timeInSeconds;
      isNewRecord = true;
    }
  }
  
  try {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to update stats:', e);
  }
  return { stats, isNewRecord };
}

// Record lost / game over stats
export function recordGameLoss() {
  const stats = loadStats();
  stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;

  try {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to update stats on loss:', e);
  }
  return stats;
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


