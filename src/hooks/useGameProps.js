import { battleService } from '../firebase/battleService';
import { aiBotService } from '../engine/aiBotService';
import { isAIRoom } from '../firebase/aiBattleSession';

/**
 * useGameProps
 * Flattens game state and UI control handlers into props for GameScreen.
 */
export function useGameProps(game, ui) {
  const {
    timerSeconds,
    level,
    gameMode,
    variant,
    cages,
    mistakes,
    comboCount,
    timeFloatingText,
    isPaused,
    setIsPaused,
    isVictory,
    isGameOver,
    restartCurrentGame,
    board,
    initialBoard,
    solutionBoard,
    notes,
    selectedCell,
    activeNumber,
    handleSelectCell,
    conflictInfo,
    flashCell,
    remainingCounts,
    handleKeypadNumberTap,
    handleErase,
    handleUndo,
    history,
    isNoteMode,
    setIsNoteMode,
    isFastEntryMode,
    handleToggleFastEntryMode,
    lockedNumber,
    handleGetHint,
    hintsRemaining,
    rivalMode,
    ghostRecord,
    userFilledCount,
    totalEmptyCount
  } = game;

  const {
    activeBattleRoom,
    setActiveBattleRoom,
    setActiveScreen,
    setShowNewGameModal,
    navigateToScreen,
    theme,
    cycleTheme,
    soundEnabled,
    setSoundEnabled,
    isGuidedTutorial,
    guidedStep,
    setGuidedStep,
    setIsGuidedTutorial,
    adRefreshTrigger,
    onReturnHome
  } = ui;

  return {
    activeBattleRoom,
    timerSeconds,
    onLeaveBattle: () => {
      const isAIBattle = isAIRoom(activeBattleRoom);
      battleService.leaveRoom();
      aiBotService.stopMatch();
      if (setActiveBattleRoom) setActiveBattleRoom(null);
      if (isAIBattle) {
        setActiveScreen('aiBattle');
      } else {
        setActiveScreen('battleLobby');
      }
    },
    level,
    gameMode,
    variant,
    cages,
    mistakes,
    comboCount,
    timeFloatingText,
    isPaused,
    isFinished: Boolean(isVictory || isGameOver),
    onTogglePause: () => setIsPaused(prev => !prev),
    onRestart: restartCurrentGame,
    onOpenNewGame: () => setShowNewGameModal(true),
    onReturnHome: onReturnHome || (() => setActiveScreen('home')),
    onOpenSettings: () => {
      setIsPaused(true);
      navigateToScreen('settings');
    },
    theme,
    onCycleTheme: cycleTheme,
    soundEnabled,
    onToggleSound: () => setSoundEnabled(prev => !prev),
    isGuidedTutorial,
    guidedStep,
    onNextGuidedStep: () => setGuidedStep(prev => prev + 1),
    // The walkthrough is played on a real board: leaving it keeps the game (KP-18).
    onExitGuidedTutorial: () => {
      setIsGuidedTutorial(false);
    },
    board,
    initialBoard,
    solutionBoard,
    notes,
    selectedCell,
    activeNumber,
    onSelectCell: handleSelectCell,
    onResume: () => setIsPaused(false),
    conflictInfo,
    flashCell,
    remainingCounts,
    onInputNumber: handleKeypadNumberTap,
    onErase: handleErase,
    onUndo: handleUndo,
    canUndo: (history || []).length > 0,
    isNoteMode,
    onToggleNoteMode: () => setIsNoteMode(prev => !prev),
    isFastEntryMode,
    onToggleFastEntryMode: handleToggleFastEntryMode,
    lockedNumber,
    onGetHint: handleGetHint,
    hintsRemaining,
    rivalMode,
    ghostRecord,
    userFilledCount,
    totalEmptyCount,
    onOpenRemoveAds: () => {
      setIsPaused(true);
      navigateToScreen('removeAds');
    },
    adRefreshTrigger
  };
}
