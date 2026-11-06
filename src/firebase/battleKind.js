/**
 * battleKind.js — which kind of puzzle a 1v1 match is, and the board it deals (KP-10, 2026-11-06).
 *
 * A killer match goes everywhere a standard one does, with its cages beside the
 * board: in match_created, in the room, in a rematch, into the replay. Old apps
 * (up to 33) never see one: a killer search waits in its own queue
 * (transport useQueue), and a ticket or a board that says nothing is standard —
 * exactly what an old app sends.
 */
import { createPuzzle } from '../engine/variants.js';

/** The kind a ticket, a match_created or a room is for. Anything unmarked is standard. */
export const ticketKind = (data) => (data?.kind === 'killer' || data?.variant === 'killer' ? 'killer' : 'classic');

/** What a ticket broadcast adds for its kind — nothing for standard, so old apps see what they always saw. */
export const kindField = (kind) => (kind === 'killer' ? { kind: 'killer' } : {});

/** The board a match (or a rematch) deals, with its kind and cages when it is a killer. */
export function dealMatchBoard(level, kind = 'classic') {
  const p = createPuzzle(kind === 'killer' ? 'killer' : 'classic', level);
  const board = { puzzle: p.puzzle, solution: p.solution, initialEmptyCount: p.puzzle.flat().filter((v) => v === 0).length };
  if (kind === 'killer') Object.assign(board, { variant: 'killer', cages: p.cages });
  return board;
}

/** The room's board as setupRoom keeps it: kind and cages along with the rest. */
export function roomBoard(data) {
  const killer = ticketKind(data) === 'killer';
  return { variant: killer ? 'killer' : 'classic', cages: killer ? data.cages : null };
}
