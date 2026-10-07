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
 * One table, so the speedrun grade, the Logic Score's speed metric and the times
 * still to come (Survival limits, the AI opponent's pace) cannot drift apart.
 */
export const KILLER_TIME_RATIO = Object.freeze({ 1: 1.77, 2: 2.12, 3: 2.37, 4: 3.17, 5: 3.19 });

/** A classic time at `level`, as the same effort in a killer — to 10 s. */
export function killerSeconds(classicSeconds, level) {
  const ratio = KILLER_TIME_RATIO[level] ?? KILLER_TIME_RATIO[3];
  return Math.max(10, Math.round((classicSeconds * ratio) / 10) * 10);
}
