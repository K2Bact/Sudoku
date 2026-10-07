/**
 * variants.js
 * The kinds of puzzle the app plays, in one place.
 *
 * A game is a puzzle kind × a mode × a level. Classic is the sudoku the app has
 * always played; Killer adds cages — groups of cells whose digits add up to the
 * number in the corner and do not repeat. The home switch, the game header, the
 * stats screen and the saved game all read this list, so a new kind is one entry
 * here plus its generator, not a hunt through the screens.
 *
 * modes: the modes a kind can be played in. Killer started with Classic only
 * (user decision 2026-10-01) and gained Speedrun on 2026-10-07 (user: "킬러 스도쿠에
 * 일단은 스피드런 적용해봐"): its rules — +10 s a mistake, no limit on
 * mistakes, no hints, combos — need no killer numbers. Its grade does (the S+
 * times are classic times, KP-8), so a killer speedrun shows none yet. Survival
 * needs a killer time limit for each level.
 */
import { generatePuzzle } from './SudokuEngine.js';
import { generateKillerPuzzle } from './killer/killerGenerator.js';
import { solveKiller } from './killer/killerSolver.js';

export const VARIANTS = [
  { id: 'classic', modes: ['classic', 'timeAttack', 'timeLimit'] },
  { id: 'killer', modes: ['classic', 'timeAttack'] },
];

export const isKnownVariant = (id) => VARIANTS.some((v) => v.id === id);
/** The kind of a saved game or a puzzle; anything from before kinds existed is classic. */
export const variantOf = (thing) => (isKnownVariant(thing?.variant) ? thing.variant : 'classic');
export const modesOf = (variant) => (VARIANTS.find((v) => v.id === variant) || VARIANTS[0]).modes;

/** A new puzzle of the given kind and level, with its solution (and cages, for killer). */
export function createPuzzle(variant, level, seed = null) {
  if (variant === 'killer') return generateKillerPuzzle(level, seed);
  return { ...generatePuzzle(level, seed), variant: 'classic' };
}

/**
 * Cages as a saved game must hold them to be played: every cell in exactly one
 * cage, each sum a whole number. A killer without them cannot be shown, and its
 * givens alone do not make a classic puzzle.
 */
export function isValidCageSet(cages) {
  if (!Array.isArray(cages) || cages.length === 0) return false;
  const seen = new Set();
  for (const cage of cages) {
    if (!cage || !Array.isArray(cage.cells) || cage.cells.length === 0) return false;
    if (!Number.isInteger(cage.sum) || cage.sum < 1 || cage.sum > 45) return false;
    for (const cell of cage.cells) {
      if (!Number.isInteger(cell) || cell < 0 || cell > 80 || seen.has(cell)) return false;
      seen.add(cell);
    }
  }
  return seen.size === 81;
}

/**
 * The solution of a killer, worked out again from its cages and givens — for a
 * saved game that lost its stored solution. The classic fallback solves from the
 * givens alone, and a killer's givens (often none) fit thousands of grids, so
 * using it would mark right answers wrong.
 */
export function solveKillerFromGivens(cages, givens) {
  const result = solveKiller(cages, givens, { limit: 1, nodeLimit: 200000 });
  return result.count === 1 ? result.solutions[0] : null;
}
