/**
 * killerTimes.js — how much longer a killer takes than a classic puzzle of the
 * same level, and every killer time the app derives from it.
 *
 * Measured 2026-10-07 without player times (none to measure): 200 puzzles per
 * level and kind solved one deduction at a time, each move priced by the thought
 * it takes; the ratio is the killer's median price over the classic one
 * (scripts/analysis/killer_time_model.mjs, Diary 110). Other prices move it by
 * about ±10% at Lv.1-4 and ±15% at Lv.5. Real times would replace it (BACKLOG KP-8).
 *
 * One table, so the speedrun grade, the Logic Score's speed metric, the Survival
 * limits and the AI opponent's pace (aiBotService.js botProfile, KP-11) cannot
 * drift apart.
 */
export const KILLER_TIME_RATIO = Object.freeze({ 1: 1.77, 2: 2.12, 3: 2.37, 4: 3.17, 5: 3.19 });

/** A classic time at `level`, as the same effort in a killer — to 10 s. */
export function killerSeconds(classicSeconds, level) {
  const ratio = KILLER_TIME_RATIO[level] ?? KILLER_TIME_RATIO[3];
  return Math.max(10, Math.round((classicSeconds * ratio) / 10) * 10);
}

/**
 * A killer's Survival limit: the classic limit at `level` as the same effort, to
 * whole minutes — 7, 13, 19, 38 and 57 against classic 4, 6, 8, 12 and 18
 * (KP-2, user 2026-10-14: "추천대로 해"). It moves with the ratio, as the grade
 * does; gate 2-28 holds the minutes agreed, so a new ratio is noticed, not
 * slipped past the player.
 */
export function killerSurvivalLimit(classicLimitSeconds, level) {
  const ratio = KILLER_TIME_RATIO[level] ?? KILLER_TIME_RATIO[3];
  return Math.max(60, Math.round((classicLimitSeconds * ratio) / 60) * 60);
}

/**
 * Seconds a right cell adds to a killer's Survival clock, once a cell (D17) —
 * classic adds 7.
 *
 * As tight as classic. A classic game can earn 7 s × its open cells on top of
 * its limit; a killer has a longer limit and more open cells (45, 50, 55, 71, 81
 * against 31, 39, 47, 53, 57), so the same share is 7 × ratio × classic open ÷
 * killer open: 8.5, 11.6, 14.2, 16.6, 15.7 — rounded, and Lv.5 kept from paying
 * less than Lv.4. Recommended and agreed on 2026-10-14 (user: "추천대로 가고");
 * one line to change.
 */
export const KILLER_SURVIVAL_CELL_BONUS = Object.freeze({ 1: 9, 2: 12, 3: 14, 4: 16, 5: 16 });
