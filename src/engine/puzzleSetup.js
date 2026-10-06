/**
 * puzzleSetup.js
 * Which puzzle a game starts on, and the solution it is checked against.
 *
 * Split out of useSudokuGame.js when puzzle kinds arrived (2026-10-01): the hook
 * holds the game's state, and the choice of puzzle — new or handed in, classic
 * or killer, with what cages — is a decision about puzzles, not about state.
 */
import { cloneGrid, solveSudoku } from './SudokuEngine.js';
import { createPuzzle, variantOf, solveKillerFromGivens } from './variants.js';

export function ensureValidSolution(initialGrid, existingSolution, cages = null) {
  if (
    existingSolution &&
    existingSolution.length === 9 &&
    existingSolution.every(row => row && row.length === 9 && row.every(val => val >= 1 && val <= 9))
  ) {
    return existingSolution;
  }
  // A killer's givens (often none) fit thousands of classic grids; only its cages
  // pin down the one answer.
  if (cages) return solveKillerFromGivens(cages, initialGrid) || existingSolution;
  // solveSudoku fills the grid in place and returns a boolean, so solve a copy
  // and hand back that copy — never the boolean, and never the caller's grid.
  const candidate = cloneGrid(initialGrid);
  return solveSudoku(candidate) ? candidate : existingSolution;
}

/**
 * The puzzle a new game starts on. One handed in (daily, 1v1, ghost) is played
 * as it is, and is classic. Otherwise a new one is made, of the kind asked for —
 * or, when none is asked, the kind being played, so "next game" after a killer
 * is another killer.
 *
 * @returns {{ variant: string, cages: object[]|null, board: number[][], solution: number[][] }}
 */
export function startingPuzzle(level, customData, currentVariant = 'classic') {
  const handedIn = customData && (customData.board || customData.puzzle);
  const kind = customData?.variant ?? (handedIn ? 'classic' : currentVariant);
  const puzzle = handedIn ? customData : createPuzzle(kind, level);
  const board = puzzle.board || puzzle.puzzle;
  const variant = variantOf(puzzle);
  const cages = variant === 'killer' ? puzzle.cages : null;
  return { variant, cages, board, solution: ensureValidSolution(board, puzzle.solution, cages) };
}

/** The kind, cages and solution of a saved game, read the same way a new game is set up. */
export function savedPuzzle(saved) {
  const variant = variantOf(saved);
  const cages = variant === 'killer' ? saved.cages : null;
  const solution = ensureValidSolution(saved.initialBoard || saved.board, saved.solutionBoard, cages);
  return { variant, cages, solution };
}
