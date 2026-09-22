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
 */

const isGrid = (g, min, max) =>
  Array.isArray(g) && g.length === 9 &&
  g.every((row) => Array.isArray(row) && row.length === 9 &&
    row.every((v) => Number.isInteger(v) && v >= min && v <= max));

export function isResumableGame(saved) {
  if (!saved || typeof saved !== 'object') return false;
  if (saved.isGameOver || saved.isVictory) return false;
  if (!isGrid(saved.board, 0, 9) || !isGrid(saved.initialBoard, 0, 9)) return false;
  if (saved.solutionBoard != null && !isGrid(saved.solutionBoard, 1, 9)) return false;
  if (saved.notes != null && !(Array.isArray(saved.notes) && saved.notes.length === 9 &&
    saved.notes.every((row) => Array.isArray(row) && row.length === 9 && row.every(Array.isArray)))) return false;
  if (saved.mistakes != null && !(Number.isFinite(saved.mistakes) && saved.mistakes >= 0)) return false;
  return true;
}
