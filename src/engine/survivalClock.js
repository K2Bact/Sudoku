/**
 * survivalClock.js — Survival's two numbers, for either kind of puzzle: the time
 * a game starts with and the seconds a right cell adds.
 *
 * Classic: the limit per level in DIFFICULTY_CONFIG, 7 s a cell. Killer: its own,
 * from killerTimes.js (KP-2, 2026-10-14). The clock at the start, the bonus and a
 * saved game's time played all read them here, so a killer cannot start on one
 * limit and be worked back on another.
 */
import { DIFFICULTY_CONFIG } from './SudokuEngine.js';
import { killerSurvivalLimit, KILLER_SURVIVAL_CELL_BONUS } from './killer/killerTimes.js';

export const CLASSIC_SURVIVAL_CELL_BONUS = 7;

const classicLimit = (level) => (DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG[3]).timeLimitSeconds;

/** The seconds a Survival game of this kind and level starts with. */
export function survivalLimitSeconds(variant, level) {
  return variant === 'killer' ? killerSurvivalLimit(classicLimit(level), level) : classicLimit(level);
}

/** The seconds a right cell adds, the first time it is right (playFacts.js, D17). */
export function survivalCellBonusSeconds(variant, level) {
  if (variant !== 'killer') return CLASSIC_SURVIVAL_CELL_BONUS;
  return KILLER_SURVIVAL_CELL_BONUS[level] ?? KILLER_SURVIVAL_CELL_BONUS[3];
}
