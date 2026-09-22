/**
 * recordEligibility.js — does this win count as a best-time record?
 *
 * One rule for every place that keeps a "best": the stats best times (which feed
 * the Logic Score speed metric and the Play Games leaderboard), and the ghost PB.
 * They used to disagree — the ghost already required zero hints while the stats
 * took any win, so hints and unlimited guessing could lift the leaderboard score.
 *
 *  - A hint fills a cell for you: no record, in any mode.
 *  - Classic and Survival need the 3-mistake limit. With it off and auto-check on,
 *    a wrong digit turns red at once, so a player can guess cell by cell.
 *  - Speedrun counts regardless of the limit: each mistake already costs +10s.
 *
 * The limit is judged from the mistakes as well as the setting. With the limit on,
 * a game ends at 3 and a revive puts the count back to 2, so a win with more than
 * 2 means the limit was off for part of the game — switching it back on just
 * before the last cell does not make the game count.
 *
 * The win itself always counts (games won, flawless wins, achievements); only the
 * best time is held back.
 */

export const MAX_MISTAKES_WITH_LIMIT = 2;

export function recordEligibility({ gameMode = 'classic', hintsUsed = 0, limitMistakes = true, mistakes = 0 } = {}) {
  if (hintsUsed > 0) return { counts: false, reason: 'hint_used' };
  if (gameMode !== 'timeAttack' && (!limitMistakes || mistakes > MAX_MISTAKES_WITH_LIMIT)) {
    return { counts: false, reason: 'no_mistake_limit' };
  }
  return { counts: true, reason: null };
}
