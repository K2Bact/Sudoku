/**
 * replayRecord.js — what a 1v1 replay is, and how a board is rebuilt from it.
 *
 * ── Why this shape (I-1, 2026-09-30) ───────────────────────────────────────
 * A replay stores WHAT HAPPENED, not what the screen looked like: the puzzle and
 * solution as they were, and a list of timed changes to the cells. Every view —
 * the board at a moment, a player's pace, where the mistakes were — is computed
 * from that list when it is shown. So a later screen, a new statistic or a
 * technique analysis needs no new data, and records made today stay readable.
 *
 * The puzzle is stored whole (81 digits), never as a seed: a generator that
 * changes would turn an old seed into a different board.
 *
 * ── The record, version 1 ─────────────────────────────────────────────────
 *   { v: 1, id, savedAt, pinned, level, puzzle, solution, winner, reason,
 *     me:  { name, elapsedMs, mistakes, events },
 *     opp: { name, elapsedMs, mistakes, progress, events | null, shareState } }
 *
 *   event    [t, kind, cell, value, cause?]
 *            t      ms since the match started
 *            kind   'v' the cell's value became `value` (0 = erased)
 *                   'n' candidate `value` was toggled in the cell
 *            cell   0..80, row-major
 *            cause  'i' input (default) · 'u' undo · 'a' automatic (notes cleared
 *                   by a placement) · 'h' hint. A reader ignores causes it does
 *                   not know — the change itself is what rebuilds the board.
 *   progress [t, pct, mistakes] — what the opponent reported during the match,
 *            kept even when their moves are shared, because it is what the
 *            player saw at the time.
 *
 * A reader skips event kinds it does not know rather than failing, so a record
 * written by a later version still shows everything this version understands.
 */

export const REPLAY_VERSION = 1;
export const MAX_EVENTS = 3000;
/**
 *   pending   no answer yet to "shall we exchange moves?"
 *   agreed    they said yes; their moves have not arrived yet
 *   shared    their moves arrived and hold together
 *   declined · off · invalid · unsupported — no moves, and why
 *   missed    the connection ended before their moves could come: this player
 *             left the result (or a rematch began), or they did
 */
export const SHARE_STATES = ['shared', 'declined', 'unsupported', 'off', 'pending', 'agreed', 'missed', 'invalid'];
/** How long an answer to "shall we exchange moves?" may take before the other app is taken not to know the question. */
export const SHARE_ANSWER_MS = 20000;

/**
 * The share state to show. 'pending' and 'agreed' are only true for a moment.
 * Silence after SHARE_ANSWER_MS means an app that does not know the question;
 * a yes whose moves never came means the moves were missed, not unsupported.
 */
export function shownShareState(record, now = Date.now()) {
  const s = record?.opp?.shareState;
  const late = now - (record?.savedAt || 0) > SHARE_ANSWER_MS;
  if (s === 'pending' && late) return 'unsupported';
  if (s === 'agreed' && late) return 'missed';
  return s || 'unsupported';
}
const KINDS = new Set(['v', 'n']);
const CAUSES = new Set(['i', 'u', 'a', 'h']);
const DIGITS81 = /^[0-9]{81}$/;

const isObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const isInt = (v) => Number.isInteger(v);

/** A 9×9 grid of numbers as the 81-digit string a record keeps. */
export function gridToString(grid) {
  return grid.map((row) => row.map((v) => (isInt(v) && v >= 0 && v <= 9 ? v : 0)).join('')).join('');
}

/** 81 values, row-major, from the stored string. */
export function stringToValues(s) {
  return Array.from(s, (ch) => ch.charCodeAt(0) - 48);
}

/**
 * The events that can be trusted, in order. An event that is not well formed, or
 * that changes a given cell, or that goes back in time, makes the whole list
 * invalid — a list with a hole in it would rebuild a board that never existed.
 * Unknown kinds are dropped, not rejected (a newer version may add some).
 * Returns null when the list cannot be used.
 */
export function cleanEvents(events, puzzle, { maxEvents = MAX_EVENTS } = {}) {
  if (!Array.isArray(events) || events.length > maxEvents || !DIGITS81.test(puzzle || '')) return null;
  const out = [];
  let last = 0;
  for (const e of events) {
    if (!Array.isArray(e) || e.length < 4) return null;
    const [t, kind, cell, value, cause] = e;
    if (!isInt(t) || t < 0 || t < last) return null;
    last = t;
    if (!KINDS.has(kind)) continue;
    if (!isInt(cell) || cell < 0 || cell > 80 || puzzle[cell] !== '0') return null;
    if (!isInt(value) || value < (kind === 'v' ? 0 : 1) || value > 9) return null;
    out.push(CAUSES.has(cause) && cause !== 'i' ? [t, kind, cell, value, cause] : [t, kind, cell, value]);
  }
  return out;
}

/**
 * The board after every event up to and including time `t` (all of them when t
 * is omitted): { values: number[81], notes: number[81] (bit d = candidate d),
 * last: the last event applied or null }.
 */
export function stateAt(puzzle, events, t = Infinity) {
  const values = stringToValues(puzzle);
  const notes = new Array(81).fill(0);
  let last = null;
  for (const e of events || []) {
    if (e[0] > t) break;
    const [, kind, cell, value] = e;
    if (kind === 'v') values[cell] = value;
    else if (kind === 'n') notes[cell] ^= (1 << value);
    last = e;
  }
  return { values, notes, last };
}

/** The same state as 9×9 grids, the shape SudokuBoard draws. */
export function gridsAt(puzzle, events, t) {
  const { values, notes, last } = stateAt(puzzle, events, t);
  const board = [];
  const noteGrid = [];
  for (let r = 0; r < 9; r++) {
    board.push(values.slice(r * 9, r * 9 + 9));
    noteGrid.push(notes.slice(r * 9, r * 9 + 9).map((mask) => {
      const list = [];
      for (let d = 1; d <= 9; d++) if (mask & (1 << d)) list.push(d);
      return list;
    }));
  }
  return { board, notes: noteGrid, last };
}

/**
 * What a player's moves say about their game. Mistakes are values that are not
 * the solution; a correction that follows one is still counted as a move.
 * Notes are the ones the player wrote — not those a placement cleared ('a') or an
 * undo put back ('u'). Undos are presses: one undo can change a value and a note
 * at the same moment, and that is one undo, not two (Flip5, 2026-10-01).
 */
export function summarize(record, side) {
  const events = record?.[side]?.events;
  if (!Array.isArray(events)) return null;
  const solution = record.solution;
  let moves = 0;
  let wrong = 0;
  let noteToggles = 0;
  const undoTimes = new Set();
  let longest = 0;
  let prev = 0;
  for (const [t, kind, cell, value, cause] of events) {
    if (cause === 'u') { undoTimes.add(t); continue; }
    if (kind === 'n') { if (!cause) noteToggles++; continue; }
    if (value === 0) continue;
    moves++;
    if (String(value) !== solution[cell]) wrong++;
    longest = Math.max(longest, t - prev);
    prev = t;
  }
  const elapsed = Number.isFinite(record[side].elapsedMs) ? record[side].elapsedMs : prev;
  return {
    moves,
    wrong,
    noteToggles,
    undos: undoTimes.size,
    longestPauseMs: longest,
    movesPerMinute: elapsed > 0 ? Math.round((moves / (elapsed / 60000)) * 10) / 10 : 0,
  };
}

/** Share of the initially empty cells correct at time t — the progress bar. */
export function progressAt(record, side, t) {
  const events = record?.[side]?.events;
  if (!Array.isArray(events)) return null;
  const { values } = stateAt(record.puzzle, events, t);
  let empty = 0;
  let right = 0;
  for (let i = 0; i < 81; i++) {
    if (record.puzzle[i] !== '0') continue;
    empty++;
    if (String(values[i]) === record.solution[i]) right++;
  }
  return empty ? Math.round((right / empty) * 100) : 100;
}

function cleanProgress(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  let last = 0;
  for (const p of list.slice(0, MAX_EVENTS)) {
    if (!Array.isArray(p)) continue;
    const [t, pct, mistakes] = p;
    if (!isInt(t) || t < last || !Number.isFinite(pct) || pct < 0 || pct > 100) continue;
    last = t;
    out.push([t, Math.round(pct), isInt(mistakes) && mistakes >= 0 ? mistakes : 0]);
  }
  return out;
}

function cleanSide(side, puzzle, { eventsRequired }) {
  if (!isObject(side)) return null;
  const events = side.events == null ? null : cleanEvents(side.events, puzzle);
  if (eventsRequired && !events) return null;
  if (side.events != null && !events) return null;
  return {
    name: typeof side.name === 'string' ? side.name.slice(0, 64) : '',
    elapsedMs: Number.isFinite(side.elapsedMs) && side.elapsedMs >= 0 ? side.elapsedMs : null,
    mistakes: isInt(side.mistakes) && side.mistakes >= 0 ? side.mistakes : 0,
    events,
    // The recording stopped at MAX_EVENTS; the moves are the first part of the game.
    truncated: side.truncated === true,
  };
}

/**
 * Older record versions, brought up to the current one. Empty today; when v2
 * exists, `1: (r) => ({ ...r, v: 2, … })` goes here and every stored record keeps
 * working.
 */
const MIGRATIONS = {};

/**
 * A stored or received record in the current shape, or null when it cannot be
 * shown. Anything that is not what its field holds is dropped or defaulted — the
 * same rule progressMerge uses: a damaged record can fail to show, never break.
 */
export function normalizeRecord(raw) {
  if (!isObject(raw) || !isInt(raw.v) || raw.v < 1) return null;
  let r = raw;
  while (r.v < REPLAY_VERSION) {
    const up = MIGRATIONS[r.v];
    if (!up) return null;
    r = up(r);
  }
  if (r.v > REPLAY_VERSION) {
    // Written by a newer app. Fields this version knows are read the same way.
    r = { ...r, v: REPLAY_VERSION };
  }
  if (typeof r.id !== 'string' || !r.id || r.id.length > 160) return null;
  if (!DIGITS81.test(r.puzzle || '') || !DIGITS81.test(r.solution || '')) return null;
  const me = cleanSide(r.me, r.puzzle, { eventsRequired: true });
  const oppSide = cleanSide(r.opp, r.puzzle, { eventsRequired: false });
  if (!me || !oppSide) return null;
  return {
    v: REPLAY_VERSION,
    id: r.id,
    savedAt: Number.isFinite(r.savedAt) ? r.savedAt : 0,
    pinned: r.pinned === true,
    level: isInt(r.level) && r.level >= 1 && r.level <= 5 ? r.level : 3,
    puzzle: r.puzzle,
    solution: r.solution,
    winner: r.winner === 'me' || r.winner === 'opponent' ? r.winner : null,
    reason: typeof r.reason === 'string' ? r.reason.slice(0, 32) : '',
    me,
    opp: {
      ...oppSide,
      progress: cleanProgress(r.opp.progress),
      shareState: SHARE_STATES.includes(r.opp.shareState) ? r.opp.shareState : 'unsupported',
    },
  };
}

/**
 * Whether an opponent's moves hold together on this puzzle. Structure first
 * (cleanEvents), then the claim: an opponent who won by finishing must end on the
 * solution. A log that fails is dropped and the replay falls back to the progress
 * the opponent reported during the match — never shown as if it were true.
 */
export function isPlausibleOpponentLog(events, record, { truncated = false } = {}) {
  const clean = cleanEvents(events, record?.puzzle);
  if (!clean) return null;
  // The opponent finished the board: they won by completion, or both finished
  // and the tiebreak went to this player (battleService.handlePlayerProgress).
  // A log cut at MAX_EVENTS is only the start of their game, so it cannot end
  // on the solution; it still has to be a full MAX_EVENTS long to say so.
  const opponentFinished = /^opponent_completion/.test(record.reason) || record.reason === 'my_completion_tiebreak';
  if (truncated && clean.length < MAX_EVENTS) return null;
  if (opponentFinished && !truncated) {
    const { values } = stateAt(record.puzzle, clean);
    if (values.join('') !== record.solution) return null;
  }
  return clean;
}
