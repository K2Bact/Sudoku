/**
 * speedrunRank.js
 * The clear grade (S+ / S / A / B / C) for a finished game.
 *
 * It used to be computed inside VictoryModal, and the S+ achievement was unlocked
 * from that modal's mount effect — so the achievement depended on the modal
 * appearing. With the post-game interstitial moved in front of the victory screen
 * (AdMob recommends ads before a break page, not after its Next button), a player
 * who closed the app during the ad would have lost that unlock. The grade is now
 * computed where the win is recorded, and the modal reads the same function.
 */

import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine.js';
import { killerSeconds } from '../engine/killer/killerTimes.js';

// Classic: in the first commit (2026-09-01), set by hand; nothing records how.
const THRESHOLDS = {
  1: [60, 90, 150, 240],
  2: [90, 150, 240, 360],
  3: [120, 210, 330, 480],
  4: [180, 300, 480, 660],
  5: [240, 420, 660, 900],
};

// Killer (2026-10-07): the classic times × how much more thought a killer of the
// same level takes (killerTimes.js, ×1.77 … ×3.19). Lv.1 comes to 110/160/270/420,
// Lv.5 to 770/1340/2110/2870.
const KILLER_THRESHOLDS = Object.fromEntries(Object.entries(THRESHOLDS)
  .map(([level, times]) => [level, times.map((t) => killerSeconds(t, Number(level)))]));

/**
 * @param level        1..5
 * @param gameMode     'timeLimit' counts time taken from the limit; everything else uses the clock
 * @param timerSeconds the game clock at the win (remaining time in timeLimit)
 * @param variant      'killer' is graded on its own times
 */
export function speedrunRankFor(level, gameMode, timerSeconds = 0, variant = 'classic') {
  const totalLimit = DIFFICULTY_CONFIG[level]?.timeLimitSeconds || 480;
  const timeTaken = gameMode === 'timeLimit' ? Math.max(1, totalLimit - timerSeconds) : timerSeconds;
  const table = variant === 'killer' ? KILLER_THRESHOLDS : THRESHOLDS;
  const t = table[level] || table[3];
  if (timeTaken <= t[0]) return { rank: 'S+', color: '#f59e0b', bg: '#fef3c7', timeTaken };
  if (timeTaken <= t[1]) return { rank: 'S', color: '#3b82f6', bg: '#dbeafe', timeTaken };
  if (timeTaken <= t[2]) return { rank: 'A', color: '#10b981', bg: '#d1fae5', timeTaken };
  if (timeTaken <= t[3]) return { rank: 'B', color: '#8b5cf6', bg: '#ede9fe', timeTaken };
  return { rank: 'C', color: '#6b7280', bg: '#f3f4f6', timeTaken };
}
