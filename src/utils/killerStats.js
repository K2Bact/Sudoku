/**
 * killerStats.js — Killer Sudoku keeps its own record.
 *
 * The classic record feeds the Logic Score, the Play Games leaderboard, the
 * daily mission and the achievements. A killer is a different puzzle — a Lv.3
 * killer does not take the time a Lv.3 classic does — so its games and best
 * times are kept apart (user decision 2026-10-01) and none of those read them.
 *
 * It lives inside the same stats object, as stats.killer = { gamesPlayed,
 * gamesWon, bestTimes: { 1..5 } }, so the cloud backup carries it without a new
 * field; progressMerge merges it by the rules the classic record uses.
 */
import { loadStats, recordGameLoss, USER_STATS_KEY } from './storage.js';

function save(stats) {
  try {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to update killer stats:', e);
  }
}

export function loadKillerRecord(stats = loadStats()) {
  const k = stats?.killer || {};
  return {
    gamesPlayed: k.gamesPlayed || 0,
    gamesWon: k.gamesWon || 0,
    bestTimes: { ...(k.bestTimes || {}) },
  };
}

/** A killer won. The best time moves only when the win counts as a record (recordEligibility.js). */
export function recordKillerWin(level, timeInSeconds, { countsAsRecord = true } = {}) {
  const stats = loadStats();
  const killer = loadKillerRecord(stats);
  killer.gamesPlayed += 1;
  killer.gamesWon += 1;
  let isNewRecord = false;
  if (countsAsRecord) {
    const best = killer.bestTimes[level];
    if (!best || timeInSeconds < best) {
      killer.bestTimes[level] = timeInSeconds;
      isNewRecord = true;
    }
  }
  stats.killer = killer;
  save(stats);
  return { stats, isNewRecord };
}

/**
 * A game lost — on mistakes, or thrown away by a new game. It counts against
 * the record of the kind of puzzle that was lost, and only that one.
 */
export function recordLoss(variant, mode) {
  if (variant !== 'killer') return recordGameLoss(mode);
  const stats = loadStats();
  const killer = loadKillerRecord(stats);
  killer.gamesPlayed += 1;
  stats.killer = killer;
  save(stats);
  return stats;
}
