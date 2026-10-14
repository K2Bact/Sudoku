/**
 * killerStats.js — reading the killer's record.
 *
 * A killer is a different puzzle — a Lv.3 killer does not take the time a Lv.3
 * classic does — so its record is kept apart, as stats.killer inside the same
 * stats object (the cloud backup carries it without a new field). It is written
 * by the same code as the classic record (storage.js recordGameWin /
 * recordGameLoss with the kind), so it holds everything the classic one holds:
 * games, wins, flawless wins, the longest combo, the levels cleared, best
 * times per mode and Survival clears (user, 2026-10-07: the two kinds differ in
 * the puzzle only).
 * progressMerge merges it by the classic rules.
 */
import { loadStats, recordGameLoss } from './storage.js';

/** The killer record with every field present, for the screens that show it. */
export function loadKillerRecord(stats = loadStats()) {
  const k = stats?.killer && typeof stats.killer === 'object' ? stats.killer : {};
  return {
    ...k,
    gamesPlayed: k.gamesPlayed || 0,
    gamesWon: k.gamesWon || 0,
    flawlessWins: k.flawlessWins || 0,
    maxCombo: k.maxCombo || 0,
    clearedLevels: { ...(k.clearedLevels || {}) },
    bestTimes: { ...(k.bestTimes || {}) },
    timeAttackBestTimes: { ...(k.timeAttackBestTimes || {}) },
    // Survival (KP-2, 2026-10-14): the fastest clear per level in seconds played
    // (D16), and the clears — as the classic record keeps them.
    survivalBestTimes: { ...(k.survivalBestTimes || {}) },
    timeLimitSurvivalWins: k.timeLimitSurvivalWins || 0,
  };
}

/**
 * A game lost — on mistakes, or thrown away by a new game. It counts against
 * the record of the kind of puzzle that was lost, and only that one.
 */
export function recordLoss(variant, mode) {
  return recordGameLoss(mode, variant === 'killer' ? 'killer' : 'classic');
}
