import { battleService } from '../firebase/battleService';
import { aiBotService } from '../engine/aiBotService';

/**
 * useGameProps
 * Flattens game state and UI control handlers into props for GameScreen.
 */
export function useGameProps(game, ui) {
  const {
    timerSeconds,
    level,
    gameMode,
    mistakes,
    comboCount,
    timeFloatingText,
    isPaused,
    setIsPaused,
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
      const isAIBattle = activeBattleRoom?.isAIBattle || activeBattleRoom?.opponentName?.includes('AI') || activeBattleRoom?.opponentName?.toLowerCase().includes('bot');
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
    mistakes,
    comboCount,
    timeFloatingText,
    isPaused,
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
    onExitGuidedTutorial: () => {
      setIsGuidedTutorial(false);
      setActiveScreen('home');
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
