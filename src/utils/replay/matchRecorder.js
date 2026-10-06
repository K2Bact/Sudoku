/**
 * matchRecorder.js — writes down what the player does in a live 1v1 match.
 *
 * It does not sit on the buttons. It compares the board and the notes with what
 * it saw last and records the difference, so every way of changing the board —
 * the keypad today, a hardware keyboard or voice later — is recorded without
 * touching this file (I-1, 2026-09-30). Only WHY a change happened needs a hint
 * from the caller: markCause('u') before an undo. Notes cleared in the same step
 * as a placement are marked automatic ('a'); everything else is input ('i').
 *
 * Two observers feed it:
 *   observe(room, board, notes)   after every render (useSudokuGame)
 *   observeValues(room, board)    from battleService.sendProgress, synchronously,
 *                                 so the move that ends the match is recorded
 *                                 before the match is declared over — a render
 *                                 comes after, and by then recording has stopped.
 *
 * Only a real 1v1 is recorded: not the AI (the user limited replays to 1v1), and
 * only while the match is being played. A board whose givens are not this match's
 * puzzle is a render from the match before, and is ignored rather than recorded
 * as a hundred bogus moves.
 */

import { MAX_EVENTS } from './replayRecord.js';

const recording = { key: null, startedAt: 0, puzzle: null, values: null, notes: null, events: [], lastT: 0, cause: null, lastPlacedAt: null, truncated: false };

export function replayKeyFor(room) {
  return room ? `${room.code}-${room.matchSeq || 0}` : null;
}

function isRecordable(room) {
  return Boolean(room && !room.isAiMatch && Array.isArray(room.puzzle) && room.status === 'playing');
}

function flat(grid) {
  const out = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) out.push(Number(grid?.[r]?.[c]) || 0);
  return out;
}

function noteMasks(notes) {
  const out = new Array(81).fill(0);
  if (!Array.isArray(notes)) return out;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      for (const d of notes[r]?.[c] || []) if (Number.isInteger(d) && d >= 1 && d <= 9) out[r * 9 + c] |= (1 << d);
    }
  }
  return out;
}

function begin(room) {
  const puzzle = flat(room.puzzle);
  Object.assign(recording, {
    key: replayKeyFor(room), startedAt: room.startedAt || Date.now(), puzzle,
    values: puzzle.slice(), notes: new Array(81).fill(0), events: [], lastT: 0, cause: null, lastPlacedAt: null, truncated: false,
  });
}

/**
 * Past MAX_EVENTS the recording stops and says so, instead of growing a record
 * the store would refuse whole: the first MAX_EVENTS actions are still a replay.
 * The board keeps being tracked so the next match starts clean.
 */
function keep(event) {
  if (recording.events.length >= MAX_EVENTS) { recording.truncated = true; return; }
  recording.events.push(event);
}

function now() {
  const t = Math.max(recording.lastT, Math.round(Date.now() - recording.startedAt));
  recording.lastT = t;
  return t;
}

/** The board belongs to this match: every given cell shows the given. */
function matchesPuzzle(values) {
  for (let i = 0; i < 81; i++) if (recording.puzzle[i] !== 0 && values[i] !== recording.puzzle[i]) return false;
  return true;
}

function record(room, board, notes) {
  try {
    if (!isRecordable(room)) return;
    if (recording.key !== replayKeyFor(room)) begin(room);
    const values = flat(board);
    if (!matchesPuzzle(values)) return;
    const t = now();
    const cause = recording.cause;
    let placed = false;
    for (let i = 0; i < 81; i++) {
      if (recording.puzzle[i] !== 0 || values[i] === recording.values[i]) continue;
      keep(cause ? [t, 'v', i, values[i], cause] : [t, 'v', i, values[i]]);
      recording.values[i] = values[i];
      if (values[i] !== 0) placed = true;
    }
    if (placed) recording.lastPlacedAt = t;
    if (notes !== undefined) {
      const masks = noteMasks(notes);
      // A placement clears that digit from its neighbours' notes in the same step.
      // The placement may have been recorded a moment earlier by observeValues, so
      // "the same step" is a removal within 250ms of a placement.
      const afterPlacement = placed || (recording.lastPlacedAt !== null && t - recording.lastPlacedAt < 250);
      for (let i = 0; i < 81; i++) {
        const changed = masks[i] ^ recording.notes[i];
        if (!changed || recording.puzzle[i] !== 0) continue;
        for (let d = 1; d <= 9; d++) {
          if (!(changed & (1 << d))) continue;
          const removed = Boolean(recording.notes[i] & (1 << d));
          const why = cause || (removed && afterPlacement ? 'a' : null);
          keep(why ? [t, 'n', i, d, why] : [t, 'n', i, d]);
        }
        recording.notes[i] = masks[i];
      }
      recording.cause = null;
    }
  } catch {
    // Recording is never allowed to disturb the game. A failure costs the replay.
  }
}

/** After a render: values and notes. */
export function observe(room, board, notes) {
  record(room, board, notes || []);
}

/** Before the match can end: the values that are about to be reported. */
export function observeValues(room, board) {
  record(room, board, undefined);
}

/** The next observed change happened because of this ('u' undo, 'h' hint). */
export function markCause(cause) {
  recording.cause = cause;
}

/** The moves recorded for this room's current match, or null for another match. */
export function snapshot(room) {
  if (!room || recording.key !== replayKeyFor(room)) return null;
  return { key: recording.key, events: recording.events.map((e) => e.slice()), truncated: recording.truncated };
}

/** For tests. */
export function resetRecorder() {
  Object.assign(recording, { key: null, startedAt: 0, puzzle: null, values: null, notes: null, events: [], lastT: 0, cause: null, lastPlacedAt: null, truncated: false });
}
