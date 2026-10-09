/**
 * savedGame.js — can this saved game be resumed?
 *
 * One answer for Home's Resume button, the resume itself and the quit-as-loss rule
 * (abandonedGame.js). They used to be three copies of the same condition, all with
 * `mistakes < 3` — but three mistakes only end a game with the mistake limit on
 * outside Speedrun, and such a game is marked over and its save cleared
 * (gameMistakeHandler.js). With the limit off, or in Speedrun, a game with 3+
 * mistakes is still being played, and its Resume button disappeared (RT-1, F12).
 *
 * The board is also checked for shape: a save whose board was not a 9x9 grid of
 * digits made Resume throw and blank the whole screen (RT-6, F13). Such a save is
 * not offered, rather than half-loaded.
 *
 * A killer must also bring its cages: without them the board is a near-empty grid
 * that no rule pins down, so a killer save that lost them is not offered either.
 * A save from before puzzle kinds existed has no `variant` and is classic.
 *
 * It also says how long a saved game had been played (playedSecondsOf).
 */
import { isValidCageSet } from '../engine/variants.js';
import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine.js';

// Survival's clock gains this much for each correct cell (useGameInput's
// addSurvivalBonusTime). Here it only works back an old save's time played;
// gate 2-30 holds the two to the same number.
export const SURVIVAL_CELL_BONUS_SECONDS = 7;

const isGrid = (g, min, max) =>
  Array.isArray(g) && g.length === 9 &&
  g.every((row) => Array.isArray(row) && row.length === 9 &&
    row.every((v) => Number.isInteger(v) && v >= min && v <= max));

/** Cells the player has filled with the right digit. */
const correctCells = (board, initial, solution) =>
  (isGrid(board, 0, 9) && isGrid(initial, 0, 9) && isGrid(solution, 1, 9))
    ? board.reduce((n, row, r) => n + row.filter((v, c) => initial[r][c] === 0 && v === solution[r][c]).length, 0)
    : 0;

/**
 * The seconds a saved game had been played — useGameTimer's playedSeconds, which
 * the grade reads in Survival (BACKLOG D15).
 *
 * A save from before it was kept (1.4.0 and earlier) has only the clock. Outside
 * Survival the clock ran with the time played, so it stands in. In Survival the
 * clock is the time LEFT, which gained 7 s for each correct cell: the time played
 * is the limit, less the time left, plus 7 s for every correct cell on the board.
 * That is a floor, not the exact time — a cell erased and placed again, or a
 * revive, gave time the board no longer shows — and it is only ever read for a
 * game saved before the update and finished after it.
 */
export function playedSecondsOf(saved) {
  const kept = saved?.playedSeconds;
  if (Number.isInteger(kept) && kept >= 0) return kept;
  const clock = Number.isFinite(saved?.timerSeconds) ? Math.max(0, Math.floor(saved.timerSeconds)) : 0;
  if (saved?.gameMode !== 'timeLimit') return clock;
  const limit = DIFFICULTY_CONFIG[saved.level]?.timeLimitSeconds || 480;
  const solved = correctCells(saved.board, saved.initialBoard, saved.solutionBoard);
  return Math.max(0, limit - clock + SURVIVAL_CELL_BONUS_SECONDS * solved);
}

export function isResumableGame(saved) {
  if (!saved || typeof saved !== 'object') return false;
  if (saved.isGameOver || saved.isVictory) return false;
  if (!isGrid(saved.board, 0, 9) || !isGrid(saved.initialBoard, 0, 9)) return false;
  if (saved.solutionBoard != null && !isGrid(saved.solutionBoard, 1, 9)) return false;
  if (saved.notes != null && !(Array.isArray(saved.notes) && saved.notes.length === 9 &&
    saved.notes.every((row) => Array.isArray(row) && row.length === 9 && row.every(Array.isArray)))) return false;
  if (saved.mistakes != null && !(Number.isFinite(saved.mistakes) && saved.mistakes >= 0)) return false;
  if (saved.variant === 'killer' && !isValidCageSet(saved.cages)) return false;
  return true;
}
