/**
 * playFacts.js — what the player did during one game that the rules need to remember.
 *
 * Three achievements were judged on facts nothing collected (found 2026-10-08):
 * the win was reported without a notes count or a Fast Entry flag, so "use notes
 * 50 times" and "clear a puzzle using Fast Entry" could never be earned, and "clear
 * Lv.3 or harder without notes" was given for every Lv.3 win — a missing count
 * read as zero.
 *
 * And which cells have already been rewarded (2026-10-09, BACKLOG D17). A right
 * digit gives Survival +7 s and Speedrun a combo, which takes 1–2 s off its clock.
 * Erasing the digit and placing it again gave both again, every time: Survival
 * could not be lost, and the Speedrun clock could be run down towards zero. A
 * cell now earns its reward once a game (user: "맞힌 칸에 대한 시간 추가는 없는걸로").
 *
 * And the longest Speedrun combo of the game (2026-10-18). The streak on screen
 * resets after 3.5 s, and the win used to see only the one still running at the
 * last cell; then the best was kept beside the clock, which a resume resets — a
 * 5-combo before a trip home was saved as 1 and "combo 5" was missed (ChatGPT
 * CH18-R01). Here it is saved with the game. An old save knows none: 0.
 *
 * The facts live in a ref beside the game and are saved with it, so a game
 * resumed after the app closed still knows them. A game saved before they were
 * kept has fromStart false: notes it had then are unknown, so it cannot earn the
 * no-notes badge, but what is done after the resume still counts. Its rewarded
 * cells are the ones it shows right — each of those was placed, and paid, once.
 */

export function newPlayFacts() {
  return { notesPlaced: 0, fastEntryUsed: false, fromStart: true, rewardedCells: [], bestCombo: 0 };
}

const isCellList = (v) => Array.isArray(v) && v.every((c) => Number.isInteger(c) && c >= 0 && c <= 80);
const isGrid = (g) => Array.isArray(g) && g.length === 9 && g.every((row) => Array.isArray(row) && row.length === 9);

/** The cells a saved board shows right — what an old save had already been paid for. */
function rightCells(saved) {
  const { board, initialBoard, solutionBoard } = saved || {};
  if (!isGrid(board) || !isGrid(initialBoard) || !isGrid(solutionBoard)) return [];
  const cells = [];
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9); const c = i % 9;
    if (initialBoard[r][c] === 0 && board[r][c] !== 0 && board[r][c] === solutionBoard[r][c]) cells.push(i);
  }
  return cells;
}

/** The facts of a saved game, or unknown-history facts for a save that predates them. */
export function restorePlayFacts(saved) {
  const f = saved?.playFacts;
  const rewardedCells = isCellList(f?.rewardedCells) ? [...new Set(f.rewardedCells)] : rightCells(saved);
  const bestCombo = Number.isInteger(f?.bestCombo) && f.bestCombo >= 0 ? f.bestCombo : 0;
  if (f && typeof f === 'object'
    && Number.isInteger(f.notesPlaced) && f.notesPlaced >= 0
    && typeof f.fastEntryUsed === 'boolean' && typeof f.fromStart === 'boolean') {
    return { notesPlaced: f.notesPlaced, fastEntryUsed: f.fastEntryUsed, fromStart: f.fromStart, rewardedCells, bestCombo };
  }
  return { notesPlaced: 0, fastEntryUsed: false, fromStart: false, rewardedCells, bestCombo };
}

/** A note was added to a cell (taking one away is not using notes). */
export function notePlaced(facts) {
  if (facts) facts.notesPlaced += 1;
}

/** A digit went on the board; in Fast Entry mode that is using Fast Entry. */
export function digitPlaced(facts, isFastEntryMode) {
  if (facts && isFastEntryMode) facts.fastEntryUsed = true;
}

/**
 * A right digit went into `cell` (0–80). True the first time in the game — the
 * one time it earns Survival's seconds or a Speedrun combo — false after that.
 */
export function firstRightAnswer(facts, cell) {
  if (!facts) return true;
  if (!Array.isArray(facts.rewardedCells)) facts.rewardedCells = [];
  if (facts.rewardedCells.includes(cell)) return false;
  facts.rewardedCells.push(cell);
  return true;
}

/** A Speedrun combo reached `combo`; the game keeps its longest. */
export function comboReached(facts, combo) {
  if (facts && Number.isInteger(combo)) facts.bestCombo = Math.max(facts.bestCombo || 0, combo);
}

/** What the win reports. notesUsedCount is null when the game's notes are not all known. */
export function winFacts(facts) {
  const f = facts || { notesPlaced: 0, fastEntryUsed: false, fromStart: false };
  return {
    notesPlaced: f.notesPlaced,
    notesUsedCount: f.fromStart ? f.notesPlaced : null,
    usedFastEntryThisGame: f.fastEntryUsed,
  };
}
