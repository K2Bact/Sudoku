/**
 * boardProgress.js — what the board says about how far a game has come.
 *
 * Moved out of useSudokuGame (2026-10-08) when the hook passed its code-line
 * budget: these are read from the board alone and need no React.
 */
import { calculateRemainingCounts } from '../engine/SudokuEngine.js';

/** Digits still to place, cells the player has filled, and cells the puzzle left empty. */
export function boardProgress(board, initialBoard) {
  const userFilledCount = board.reduce((acc, row, r) =>
    acc + row.filter((val, c) => val !== 0 && initialBoard[r][c] === 0).length, 0
  );
  const totalEmptyCount = initialBoard.reduce((acc, row) =>
    acc + row.filter(val => val === 0).length, 0
  );
  return { remainingCounts: calculateRemainingCounts(board), userFilledCount, totalEmptyCount };
}
