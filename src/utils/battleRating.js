/**
 * battleRating.js
 * Local battle rating, persisted across sessions.
 *
 * `suidoku_battle_profile_v1` was read by leaderboardService but written by
 * nothing, so the rating sat at the hard-coded 1200 fallback forever and the
 * result screen showed literal "+25 MMR" / "-12 MMR" strings that were never
 * computed. This module is the missing writer.
 *
 * The rating covers AI battles, which are the ones that actually run. Harder
 * opponents move it further; a loss costs less than a win earns, so a player who
 * keeps playing drifts upward rather than grinding to zero.
 */

export const BATTLE_PROFILE_KEY = 'suidoku_battle_profile_v1';

const BASE_RATING = 1200;
const FLOOR = 800;

const DEFAULT_PROFILE = {
  mmr: BASE_RATING,
  wins: 0,
  losses: 0,
  updatedAt: null
};

export function loadBattleProfile() {
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_PROFILE };
    const raw = localStorage.getItem(BATTLE_PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const p = JSON.parse(raw);
    return {
      mmr: typeof p.mmr === 'number' ? p.mmr : BASE_RATING,
      wins: typeof p.wins === 'number' ? p.wins : 0,
      losses: typeof p.losses === 'number' ? p.losses : 0,
      updatedAt: p.updatedAt || null
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveBattleProfile(profile) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(BATTLE_PROFILE_KEY, JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Failed to save battle profile:', e);
  }
}

/** Points a result is worth at this difficulty. Level 1 is worth little. */
export function ratingDeltaFor(didWin, level = 3) {
  const lv = Math.max(1, Math.min(5, Number(level) || 3));
  return didWin ? 10 + lv * 5 : -(4 + lv * 2);
}

/**
 * Apply one finished battle. Returns { delta, mmr, wins, losses } so the result
 * screen can show the number that was actually recorded.
 */
export function applyBattleResult(didWin, level = 3) {
  const profile = loadBattleProfile();
  const delta = ratingDeltaFor(didWin, level);
  const next = {
    mmr: Math.max(FLOOR, profile.mmr + delta),
    wins: profile.wins + (didWin ? 1 : 0),
    losses: profile.losses + (didWin ? 0 : 1),
    updatedAt: Date.now()
  };
  saveBattleProfile(next);
  // Report the change that actually landed, which differs from `delta` when the
  // rating was clamped at the floor.
  return { ...next, delta: next.mmr - profile.mmr };
}
