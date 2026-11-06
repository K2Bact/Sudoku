import { useEffect, useRef, useState } from 'react';
import { findSingleCell, findNoteCell, findCageLastCell, findRule45Cell } from '../utils/guidedTargets.js';

/**
 * The first-game walkthrough's steps and when each is done (KP-18, 2026-11-06).
 *
 * Standard: enter a number in a cell where only one fits · write a note · use Fast
 * Entry · done. Killer: the last cell of a cage · the rule of 45 · done. Each step
 * picks its cell once, when it starts, from the board as it is then
 * (utils/guidedTargets.js), and moves on by itself when the player has done it:
 * the right digit in the cell, a note in the cell, a cell filled with Fast Entry on.
 * A step with no cell to point at (2 of 60 killer boards have no rule-45 cell) says
 * what the step is and shows Next instead.
 *
 * The target is kept with the step it belongs to. Without that, for one render after
 * a step ends the next step still sees the last one's cell — already filled — and
 * the killer walkthrough went straight past the rule of 45.
 */
export const GUIDED_STEPS = Object.freeze({
  classic: ['single', 'notes', 'fast', 'done'],
  killer: ['cageLast', 'rule45', 'done'],
});

function solvedCount(board, solution) {
  let n = 0;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (board?.[r]?.[c] && board[r][c] === solution?.[r]?.[c]) n++;
  return n;
}

export function useGuidedTutorial({ active, kind, step, onNext, board, solution, notes, cages, isFastEntryMode }) {
  const steps = GUIDED_STEPS[kind === 'killer' ? 'killer' : 'classic'];
  const id = steps[Math.min(Math.max(step || 0, 0), steps.length - 1)];
  const [picked, setPicked] = useState({ id: null, target: null });
  const startSolved = useRef(0);

  // Once per step, from the board as it stands when the step begins — not on every move.
  useEffect(() => {
    if (!active || !board || !solution) return;
    startSolved.current = solvedCount(board, solution);
    let target = null;
    if (id === 'single') target = findSingleCell(board, solution);
    else if (id === 'notes') target = findNoteCell(board, solution);
    else if (id === 'cageLast') target = findCageLastCell(board, solution, cages);
    else if (id === 'rule45') target = findRule45Cell(board, solution, cages);
    setPicked({ id, target });
    // A new puzzle (its solution) picks again: the walkthrough may switch on a render before the
    // new board is in, and a cell picked from the last board would point at the wrong game.
    // Not board, notes or cages: those change with every move, and the cell is picked once per step.
  }, [active, id, solution]);

  const target = picked.id === id ? picked.target : null;

  useEffect(() => {
    if (!active || id === 'done' || picked.id !== id) return;
    let done = false;
    if (id === 'notes') done = Boolean(target && notes?.[target.r]?.[target.c]?.length);
    else if (id === 'fast') done = Boolean(isFastEntryMode) && solvedCount(board, solution) > startSolved.current;
    else done = Boolean(target && board?.[target.r]?.[target.c] === target.num);
    if (done) onNext();
  }, [active, id, picked, target, board, notes, isFastEntryMode, solution, onNext]);

  return { id, steps, index: steps.indexOf(id), target, ready: picked.id === id };
}
