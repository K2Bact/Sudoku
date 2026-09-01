import { useEffect } from 'react';
import { saveGameState } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';

/**
 * useGameLifecycle.js
 * Handles auto-saving, page visibility changes, app suspend/resume audio, and auto-pause.
 */
export function useGameLifecycle({
  board,
  initialBoard,
  solutionBoard,
  notes,
  mistakes,
  timerSeconds,
  level,
  gameMode,
  isFastEntryMode,
  lockedNumber,
  adHintsUsedThisGame = 0,
  activeScreen,
  isGameOver,
  isVictory,
  activeBattleRoom,
  setIsPaused
}) {
  // Continuous Auto-Save on Board Modifications
  useEffect(() => {
    if (activeScreen === 'game' && !isGameOver && !isVictory && !activeBattleRoom) {
      saveGameState({
        board,
        initialBoard,
        solutionBoard,
        notes,
        mistakes,
        timerSeconds,
        level,
        gameMode,
        isFastEntryMode,
        lockedNumber,
        adHintsUsedThisGame
      });
    }
  }, [
    board,
    initialBoard,
    solutionBoard,
    notes,
    mistakes,
    timerSeconds,
    level,
    gameMode,
    isFastEntryMode,
    lockedNumber,
    adHintsUsedThisGame,
    activeScreen,
    isGameOver,
    isVictory,
    activeBattleRoom
  ]);

  // Mobile Lifecycle (Visibility Change & Pagehide): Auto-Pause, Save Flush & Audio Sleep
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        soundHaptic.suspend();
        if (activeScreen === 'game' && !isGameOver && !isVictory && !activeBattleRoom) {
          setIsPaused(true);
          if (board.some(r => r.some(c => c !== 0))) {
            saveGameState({
              board,
              initialBoard,
              solutionBoard,
              notes,
              mistakes,
              timerSeconds,
              level,
              gameMode,
              isFastEntryMode,
              lockedNumber
            });
          }
        }
      } else if (document.visibilityState === 'visible') {
        soundHaptic.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
    };
  }, [
    activeScreen,
    isGameOver,
    isVictory,
    activeBattleRoom,
    board,
    initialBoard,
    solutionBoard,
    notes,
    mistakes,
    timerSeconds,
    level,
    gameMode,
    isFastEntryMode,
    lockedNumber,
    setIsPaused
  ]);
}
