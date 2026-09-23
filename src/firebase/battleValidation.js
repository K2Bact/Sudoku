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

import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine.js';

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

// A grid with fewer than 17 clues cannot have a unique solution — proved by
// exhaustive search (McGuire, Tugemann & Civario, 2012). Below this the board is
// not a hard puzzle, it is an unsolvable one.
const MIN_CLUES = 17;
// And a board that is nearly filled in is not a match either.
const MIN_BLANKS = 10;
// Measured, not guessed: generatePuzzle stops at the level's clue count and can
// only end ABOVE it when uniqueness blocks a removal. Over 40 puzzles per level
// (2026-09-23) levels 1-4 came out exactly on target and level 5 up to three
// clues above, so eight is slack for a generator that changes, not a hole.
const CLUE_SLACK = 8;

/**
 * A puzzle/solution pair is only usable if the solution is a real Sudoku
 * solution, the puzzle is consistent with it, and the puzzle is a puzzle.
 *
 * The consistency check alone let two useless boards through (RT-8 / F09):
 * an empty grid passes, because every "given" trivially agrees with the
 * solution, and so does a completely solved one. Handed an empty grid both
 * players get 81 blanks instead of the level they chose; handed a solved one the
 * match is over before it starts. initialEmptyCount is checked against the board
 * too — progress is reported as a share of it, so a peer claiming a board with
 * one empty cell would appear to leap to 100%.
 *
 * `expectedLevel` is the level the receiver believes it is playing. Without it
 * the level named inside the payload is used, which still catches a board that
 * does not match its own claim.
 */
export function isValidBoardPayload(payload, expectedLevel) {
  if (!payload) return false;
  if (!puzzleMatchesSolution(payload.puzzle, payload.solution)) return false;

  const clues = payload.puzzle.reduce((n, row) => n + row.filter((v) => v !== 0).length, 0);
  const blanks = 81 - clues;
  if (clues < MIN_CLUES || blanks < MIN_BLANKS) return false;

  if (payload.initialEmptyCount !== undefined && payload.initialEmptyCount !== null
      && payload.initialEmptyCount !== blanks) return false;

  const level = expectedLevel === undefined || expectedLevel === null ? payload.level : expectedLevel;
  const config = DIFFICULTY_CONFIG[level];
  if (config && (clues < config.clues || clues > config.clues + CLUE_SLACK)) return false;

  return true;
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

/**
 * The message must belong to the match being played, not the one before it.
 *
 * A rematch keeps the room and its code, so roomId alone cannot tell two matches
 * apart: a `player_progress` carrying status 'finished' from the match that just
 * ended arrives a moment into the new one and ends it before a digit is entered
 * (RT-3 / F06). Every in-match message therefore carries the room's match number.
 *
 * A message with no number at all is accepted. During a rollout the opponent may
 * still be running a build that does not stamp one, and refusing those would
 * leave the two players unable to see each other's progress at all — a worse
 * failure than the one being fixed, and this check still holds between two
 * updated apps.
 */
export function isForThisMatch(data, room) {
  if (!room || !data) return false;
  if (data.seq === undefined || data.seq === null) return true;
  return data.seq === (room.matchSeq || 0);
}

/** Shape check for a matchmaking ticket before it is trusted as a peer. */
export function isValidTicket(t, level) {
  if (!t || typeof t.playerId !== 'string' || !t.playerId) return false;
  if (typeof t.timestamp !== 'number') return false;
  if (level !== undefined && t.level !== level) return false;
  return true;
}
