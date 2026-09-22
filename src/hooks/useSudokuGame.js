import { useState, useRef, useEffect } from 'react';
import {
  generatePuzzle,
  cloneGrid,
  calculateRemainingCounts,
  createEmptyGrid
} from '../engine/SudokuEngine.js';
import { soundHaptic } from '../utils/soundHaptic.js';
import {
  loadGameState,
  clearGameState,
  recordGameLoss
} from '../utils/storage.js';
import { recordAbandonedGame } from '../utils/abandonedGame';
import { isResumableGame } from '../utils/savedGame';
import { loadWallet, addHints, subscribeToWallet } from '../utils/wallet.js';
import { useTranslation } from '../i18n/i18nContext.jsx';
import { useGameTimer } from './useGameTimer.js';
import { useGameHistory } from './useGameHistory.js';
import { useGameLifecycle } from './useGameLifecycle.js';
import { useGameInput, ensureValidSolution } from './useGameInput.js';

export function useSudokuGame(activeScreen, activeBattleRoom, activeDailyDateKey, showToast) {
  const { t } = useTranslation();
  const [level, setLevel] = useState(3);
  const [gameMode, setGameMode] = useState('classic');
  const [board, setBoard] = useState(() => createEmptyGrid());
  const [initialBoard, setInitialBoard] = useState(() => createEmptyGrid());
  const [solutionBoard, setSolutionBoard] = useState(() => createEmptyGrid());
  const [notes, setNotes] = useState(() => Array(9).fill(null).map(() => Array(9).fill([])));

  const [selectedCell, setSelectedCell] = useState(null);
  const [activeNumber, setActiveNumber] = useState(null);
  const [lockedNumber, setLockedNumber] = useState(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [isFastEntryMode, setIsFastEntryMode] = useState(false);

  const [mistakes, setMistakes] = useState(0);
  const [hasRevived, setHasRevived] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [conflictInfo, setConflictInfo] = useState(null);
  const [flashCell] = useState(null);
  const [hintsRemaining, setHintsRemaining] = useState(() => loadWallet().hints);
  const [showHintRewardModal, setShowHintRewardModal] = useState(false);
  const [adHintsUsedThisGame, setAdHintsUsedThisGame] = useState(0);
  const [rivalMode, setRivalMode] = useState('standard');
  const [ghostRecord, setGhostRecord] = useState(null);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);

  // The wallet announces every balance change; without this the number on
  // screen is a hand-refreshed copy and any writer that forgets to refresh it
  // leaves a stale count on the home screen. The manual refreshes below are now
  // redundant but harmless, and they still cover a balance changed outside the
  // wallet module (a cloud restore writes localStorage directly).
  useEffect(() => subscribeToWallet(setHintsRemaining), []);

  // Sub-hook: Game Timer, Combos & Floating Indicators
  const {
    timerSeconds,
    setTimerSeconds,
    comboCount,
    timeFloatingText,
    handleComboSuccess,
    handleTimePenalty,
    addSurvivalBonusTime,
    resetTimer
  } = useGameTimer({
    gameMode,
    level,
    isPaused,
    isGameOver,
    isVictory,
    onTimeLimitExpire: () => {
      soundHaptic.playErrorSound();
      setIsGameOver(true);
      recordGameLoss();
      clearGameState();   // same reason as gameMistakeHandler: a lost game is not resumable
    }
  });

  // Sub-hook: Undo History Stack
  const { history, pushHistory, handleUndo, resetHistory } = useGameHistory({
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
  });

  // Sub-hook: Background Auto-Save & Lifecycle
  useGameLifecycle({
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
    hintsUsedCount,
    activeScreen,
    isGameOver,
    isVictory,
    activeBattleRoom,
    setIsPaused
  });

  // Cell-by-cell pace of the current run: [{ time, count }]. ghostManager can
  // replay this to race the player against their own past self, but nothing ever
  // recorded it, so Ghost mode fell back to a flat average-pace approximation.
  const runTimelineRef = useRef([]);

  const resetGameState = () => {
    runTimelineRef.current = [];
    setHintsUsedCount(0);
    setAdHintsUsedThisGame(0);
    setHintsRemaining(loadWallet().hints);
    setSelectedCell(null);
    resetHistory();
    setMistakes(0);
    setHasRevived(false);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    setIsFastEntryMode(false);
    setIsNoteMode(false);
    setActiveNumber(null);
    setLockedNumber(null);
    setConflictInfo(null);
    clearGameState();
  };

  // Start fresh new game. A game in progress that this throws away counts as a loss.
  const startNewGame = (newLevel = level, mode = 'classic', customData = null) => {
    recordAbandonedGame();
    const hasCustomBoard = customData && (customData.board || customData.puzzle);
    const puzzle = hasCustomBoard ? customData : generatePuzzle(newLevel);
    const boardGrid = puzzle.board || puzzle.puzzle;
    const safeSolution = ensureValidSolution(boardGrid, puzzle.solution);

    setGameMode(mode);
    setLevel(newLevel);
    setBoard(cloneGrid(boardGrid));
    setInitialBoard(cloneGrid(boardGrid));
    setSolutionBoard(safeSolution);
    setNotes(Array(9).fill(null).map(() => Array(9).fill([])));

    if (customData?.rivalMode) {
      setRivalMode(customData.rivalMode);
      setGhostRecord(customData.ghostRecord || null);
    } else {
      setRivalMode('standard');
      setGhostRecord(null);
    }
    resetGameState();
    resetTimer(newLevel, mode);
  };

  const restartCurrentGame = () => {
    recordAbandonedGame();
    setBoard(cloneGrid(initialBoard));
    setNotes(Array(9).fill(null).map(() => Array(9).fill([])));
    resetGameState();
    resetTimer(level, gameMode);
  };

  const resumeSavedGame = (requestedLevel) => {
    const saved = loadGameState();
    if (isResumableGame(saved)) {
      const safeSolution = ensureValidSolution(saved.initialBoard || saved.board, saved.solutionBoard);
      setBoard(saved.board);
      setInitialBoard(saved.initialBoard);
      setSolutionBoard(safeSolution);
      setNotes(saved.notes || Array(9).fill(null).map(() => Array(9).fill([])));
      setMistakes(saved.mistakes || 0);
      setTimerSeconds(saved.timerSeconds || 0);
      setLevel(saved.level || requestedLevel || 3);
      setGameMode(saved.gameMode || 'classic');
      setAdHintsUsedThisGame(saved.adHintsUsedThisGame || 0);
      setHintsUsedCount(saved.hintsUsedCount || 0);
      setHintsRemaining(loadWallet().hints);
      if (typeof saved.isFastEntryMode === 'boolean') setIsFastEntryMode(saved.isFastEntryMode);
      if (saved.lockedNumber !== undefined) setLockedNumber(saved.lockedNumber);
      setIsGameOver(false);
      setIsVictory(false);
      setIsPaused(false);
      return true;
    }
    startNewGame(requestedLevel || level);
    return false;
  };

  // Sub-hook: Game Input & Keypad Actions
  const {
    handleSelectCell,
    handleInputNumber,
    handleKeypadNumberTap,
    handleErase,
    handleGetHint,
    handleToggleFastEntryMode
  } = useGameInput({
    board,
    setBoard,
    initialBoard,
    solutionBoard,
    notes,
    setNotes,
    selectedCell,
    setSelectedCell,
    activeNumber,
    setActiveNumber,
    lockedNumber,
    setLockedNumber,
    isNoteMode,
    isFastEntryMode,
    setIsFastEntryMode,
    mistakes,
    setMistakes,
    isPaused,
    isGameOver,
    setIsGameOver,
    isVictory,
    setIsVictory,
    gameMode,
    level,
    timerSeconds,
    activeBattleRoom,
    activeDailyDateKey,
    pushHistory,
    clearGameState,
    handleTimePenalty,
    handleComboSuccess,
    addSurvivalBonusTime,
    setConflictInfo,
    setShowHintRewardModal,
    setHintsRemaining,
    hintsUsedCount,
    setHintsUsedCount,
    adHintsUsedThisGame,
    rivalMode,
    showToast,
    runTimelineRef,
    comboCount,
    t
  });

  // Rewarded Video Ad Completion Handler (with instant Auto-Apply)
  const handleRewardHint = () => {
    if (adHintsUsedThisGame >= 2) return;
    setAdHintsUsedThisGame(prev => prev + 1);
    const newCount = addHints(1, 'ad_reward');
    setHintsRemaining(newCount);
    setShowHintRewardModal(false);

    // Automatically apply the rewarded hint directly onto the board
    setTimeout(() => {
      handleGetHint();
    }, 120);
  };

  const remainingCounts = calculateRemainingCounts(board);
  const userFilledCount = board.reduce((acc, row, r) =>
    acc + row.filter((val, c) => val !== 0 && initialBoard[r][c] === 0).length, 0
  );
  const totalEmptyCount = initialBoard.reduce((acc, row) =>
    acc + row.filter(val => val === 0).length, 0
  );

  return {
    level, setLevel, gameMode, setGameMode,
    board, initialBoard, solutionBoard, notes,
    selectedCell, activeNumber, lockedNumber,
    isNoteMode, setIsNoteMode,
    isFastEntryMode, handleToggleFastEntryMode,
    mistakes, setMistakes, hasRevived, setHasRevived,
    timerSeconds, setTimerSeconds, comboCount, timeFloatingText,
    isGameOver, setIsGameOver, isVictory, setIsVictory, conflictInfo, flashCell,
    history, remainingCounts,
    hintsRemaining, showHintRewardModal, setShowHintRewardModal,
    adHintsUsedThisGame,
    handleRewardHint, handleSelectCell, handleInputNumber,
    handleKeypadNumberTap, handleErase, handleUndo, handleGetHint,
    startNewGame, restartCurrentGame, resumeSavedGame,
    isPaused, setIsPaused,
    rivalMode, ghostRecord, userFilledCount, totalEmptyCount, hintsUsedCount
  };
}
