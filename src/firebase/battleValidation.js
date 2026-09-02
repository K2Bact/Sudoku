/**
 * battleValidation.js
 * Treats every incoming battle message as untrusted.
 *
 * battleService used to act on whatever arrived: `player_progress` updated the
 * room without checking which room it referred to, and `rematch_accepted`
 * adopted the sender's puzzle and solution outright. On the same-device
 * transport that only risked crosstalk between tabs, but the moment a real
 * network transport is plugged in, every one of those becomes an opening for a
 * peer to rewrite your board or declare your result. Validate first, then act.
 */

const isGrid = (g) =>
  Array.isArray(g) &&
  g.length === 9 &&
  g.every((row) => Array.isArray(row) && row.length === 9 &&
    row.every((v) => Number.isInteger(v) && v >= 0 && v <= 9));

const isSolvedGrid = (g) =>
  isGrid(g) && g.every((row) => row.every((v) => v >= 1 && v <= 9));

/** Rows, columns and 3x3 boxes each hold 1..9 exactly once. */
function isValidSolution(solution) {
  if (!isSolvedGrid(solution)) return false;
  const complete = (values) => new Set(values).size === 9;
  for (let i = 0; i < 9; i++) {
    if (!complete(solution[i])) return false;
    if (!complete(solution.map((row) => row[i]))) return false;
  }
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const box = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) box.push(solution[br + r][bc + c]);
      if (!complete(box)) return false;
    }
  }
  return true;
}

/** Every given in the puzzle must match the solution it claims to belong to. */
function puzzleMatchesSolution(puzzle, solution) {
  if (!isGrid(puzzle) || !isValidSolution(solution)) return false;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const given = puzzle[r][c];
      if (given !== 0 && given !== solution[r][c]) return false;
    }
  }
  return true;
}

/**
 * A puzzle/solution pair is only usable if the solution is a real Sudoku
 * solution and the puzzle is consistent with it. Rejects a peer that sends a
 * board whose "solution" would mark correct entries as mistakes.
 */
export function isValidBoardPayload(payload) {
  if (!payload) return false;
  return puzzleMatchesSolution(payload.puzzle, payload.solution);
}

/** Progress reports must be in range; a peer cannot claim 900% or -5 mistakes. */
export function isValidProgress(data) {
  if (!data) return false;
  const pct = Number(data.progressPct);
  const mistakes = Number(data.mistakes);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return false;
  if (!Number.isFinite(mistakes) || mistakes < 0 || mistakes > 3) return false;
  return true;
}

/**
 * The message must name the room the player is actually in. Without this a
 * stale or foreign message drives the live match.
 */
export function isForRoom(data, room) {
  if (!room) return false;
  if (!data || !data.roomId) return false;
  return data.roomId === room.code;
}

/**
 * The message must come from the opponent in this room — not from the player
 * themselves, and not from a third party.
 */
export function isFromOpponent(data, room) {
  if (!room || !data) return false;
  if (!data.senderId) return false;
  return data.senderId === room.opponentId;
}

/** Shape check for a matchmaking ticket before it is trusted as a peer. */
export function isValidTicket(t, level) {
  if (!t || typeof t.playerId !== 'string' || !t.playerId) return false;
  if (typeof t.timestamp !== 'number') return false;
  if (level !== undefined && t.level !== level) return false;
  return true;
}
