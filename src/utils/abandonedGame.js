/**
 * abandonedGame.js — quitting a game counts as losing it.
 *
 * A loss used to be recorded only at game over (3 mistakes) or when Survival ran out
 * of time. Starting a new game or restarting simply dropped the game in progress, so
 * a player about to lose could walk away and keep a perfect win rate — and the win
 * rate is part of the Logic Score that goes to the Play Games leaderboard
 * (user decision 2026-09-19, SudokuDiary ㉘).
 *
 * Counted: a saved game in progress that is thrown away by a new game or a restart,
 * once the player has placed a number or made a mistake. Not counted:
 *   - a game that crashed or was closed — reopening the app resumes it, nothing is lost
 *   - an untouched board (tapping "new game" twice by mistake)
 *   - 1v1 and AI battles, which end through their own result screen
 */
import { loadGameState, recordGameLoss } from './storage.js';
import { isResumableGame } from './savedGame.js';

const NOT_COUNTED_MODES = new Set(['battle', 'aiBattle']);

/** The saved game that would count as a loss if thrown away now, or null. */
export function gameInProgress() {
  const saved = loadGameState();
  if (!isResumableGame(saved)) return null;   // the same test as Home's Resume button
  if (NOT_COUNTED_MODES.has(saved.gameMode)) return null;
  const moved = saved.board.some((row, r) => row.some((v, c) => v !== saved.initialBoard[r][c]));
  if (!moved && !(saved.mistakes > 0)) return null;
  return saved;
}

/** Record the game in progress as a loss before it is thrown away. Returns true if one was. */
export function recordAbandonedGame() {
  if (!gameInProgress()) return false;
  recordGameLoss();
  return true;
}
