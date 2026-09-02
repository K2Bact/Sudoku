import { useState } from 'react';
import { cloneGrid } from '../engine/SudokuEngine';
import { soundHaptic } from '../utils/soundHaptic';

/**
 * useGameHistory.js
 * Manages action history, snapshots (board, notes, active selection), and undo stack.
 */
export function useGameHistory({
  board,
  notes,
  activeNumber,
  lockedNumber,
  selectedCell,
  setBoard,
  setNotes,
  setActiveNumber,
  setLockedNumber,
  setSelectedCell,
  setConflictInfo,
  isPaused,
  isGameOver,
  isVictory
}) {
  const [history, setHistory] = useState([]);

  // Push current board, notes & active state snapshot to history stack
  const pushHistory = () => {
    setHistory(prev => [
      ...prev.slice(-49),
      {
        board: cloneGrid(board),
        notes: notes.map(row => row.map(col => [...col])),
        activeNumber,
        lockedNumber,
        selectedCell: selectedCell ? [...selectedCell] : null
      }
    ]);
  };

  // Undo last player action
  const handleUndo = () => {
    if (history.length === 0 || isPaused || isGameOver || isVictory) return;
    soundHaptic.playUndoSound();

    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setBoard(cloneGrid(lastState.board));
    setNotes(lastState.notes.map(row => row.map(col => [...col])));
    setActiveNumber(lastState.activeNumber);
    setLockedNumber(lastState.lockedNumber);
    if (lastState.selectedCell) {
      setSelectedCell([...lastState.selectedCell]);
    }
    setConflictInfo(null);
  };

  // Reset history on new game or restart
  const resetHistory = () => {
    setHistory([]);
  };

  return {
    history,
    pushHistory,
    handleUndo,
    resetHistory
  };
}
