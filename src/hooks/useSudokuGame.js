import { useState, useRef, useEffect } from 'react';
import {
  cloneGrid,
  createEmptyGrid
} from '../engine/SudokuEngine.js';
import { startingPuzzle, savedPuzzle } from '../engine/puzzleSetup.js';
import { soundHaptic } from '../utils/soundHaptic.js';
import {
  loadGameState,
  clearGameState
} from '../utils/storage.js';
import { recordLoss } from '../utils/killerStats.js';
import { recordAbandonedGame } from '../utils/abandonedGame';
import { isResumableGame } from '../utils/savedGame';
import { loadWallet, subscribeToWallet } from '../utils/wallet.js';
import { useTranslation } from '../i18n/i18nContext.jsx';
import { useGameTimer } from './useGameTimer.js';
import { useGameHistory } from './useGameHistory.js';
import { useGameLifecycle } from './useGameLifecycle.js';
import { useGameInput } from './useGameInput.js';
import { useRewardHint } from './useRewardHint.js';
import { observe as observeForReplay } from '../utils/replay/matchRecorder.js';
import { newPlayFacts, restorePlayFacts } from '../utils/playFacts.js';
import { boardProgress } from '../utils/boardProgress.js';

export function useSudokuGame(activeScreen, activeBattleRoom, activeDailyDateKey, showToast) {
  const { t } = useTranslation();
  const [level, setLevel] = useState(3);
  const [gameMode, setGameMode] = useState('classic');
  // The kind of puzzle (engine/variants.js) and, for a killer, its cages.
  const [variant, setVariant] = useState('classic');
  const [cages, setCages] = useState(null);
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
    playedSeconds,
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
      recordLoss(variant);
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

  // Notes placed and Fast Entry used in this game, for the achievements (playFacts.js).
  const playFactsRef = useRef(newPlayFacts());

  // Sub-hook: Background Auto-Save & Lifecycle
  useGameLifecycle({
    board,
    initialBoard,
    solutionBoard,
    notes,
    mistakes,
    timerSeconds,
    playedSeconds,
    level,
    gameMode,
    variant,
    cages,
    isFastEntryMode,
    lockedNumber,
    adHintsUsedThisGame,
    hintsUsedCount,
    playFactsRef,
    dailyDateKey: activeDailyDateKey,
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

  // 1v1 replay (I-1): record what changed on the board and in the notes. The
  // recorder decides whether this is a live 1v1 and ignores everything else.
  useEffect(() => {
    observeForReplay(activeBattleRoom, board, notes);
  }, [activeBattleRoom, board, notes]);

  // Everything one game keeps, back to its start — both clocks included, with
  // the Survival limit of the game's kind.
  const resetGameState = (newLevel, newMode, newVariant) => {
    runTimelineRef.current = [];
    playFactsRef.current = newPlayFacts();
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
    resetTimer(newLevel, newMode, null, newVariant);
  };

  // Start fresh new game. A game in progress that this throws away counts as a loss.
  // Which puzzle — handed in or new, classic or killer — is puzzleSetup.js's call.
  const startNewGame = (newLevel = level, mode = 'classic', customData = null) => {
    recordAbandonedGame();
    const puzzle = startingPuzzle(newLevel, customData, variant);

    setVariant(puzzle.variant);
    setCages(puzzle.cages);
    setGameMode(mode);
    setLevel(newLevel);
    setBoard(cloneGrid(puzzle.board));
    setInitialBoard(cloneGrid(puzzle.board));
    setSolutionBoard(puzzle.solution);
    setNotes(Array(9).fill(null).map(() => Array(9).fill([])));

    if (customData?.rivalMode) {
      setRivalMode(customData.rivalMode);
      setGhostRecord(customData.ghostRecord || null);
    } else {
      setRivalMode('standard');
      setGhostRecord(null);
    }
    // The new puzzle's kind, not the state's: setVariant above lands next render,
    // and a killer started after a classic would get the classic limit.
    resetGameState(newLevel, mode, puzzle.variant);
  };

  const restartCurrentGame = () => {
    recordAbandonedGame();
    setBoard(cloneGrid(initialBoard));
    setNotes(Array(9).fill(null).map(() => Array(9).fill([])));
    resetGameState(level, gameMode, variant);
  };

  const resumeSavedGame = (requestedLevel, requestedVariant = null) => {
    const saved = loadGameState();
    if (isResumableGame(saved)) {
      const puzzle = savedPuzzle(saved);
      setVariant(puzzle.variant);
      setCages(puzzle.cages);
      setBoard(saved.board);
      setInitialBoard(saved.initialBoard);
      setSolutionBoard(puzzle.solution);
      setNotes(saved.notes || Array(9).fill(null).map(() => Array(9).fill([])));
      setMistakes(saved.mistakes || 0);
      resetTimer(saved.level, saved.gameMode, saved);   // the clock and the seconds played
      setLevel(saved.level || requestedLevel || 3);
      setGameMode(saved.gameMode || 'classic');
      setAdHintsUsedThisGame(saved.adHintsUsedThisGame || 0);
      setHintsUsedCount(saved.hintsUsedCount || 0);
      playFactsRef.current = restorePlayFacts(saved);
      setHintsRemaining(loadWallet().hints);
      if (typeof saved.isFastEntryMode === 'boolean') setIsFastEntryMode(saved.isFastEntryMode);
      if (saved.lockedNumber !== undefined) setLockedNumber(saved.lockedNumber);
      setIsGameOver(false);
      setIsVictory(false);
      setIsPaused(false);
      return true;
    }
    startNewGame(requestedLevel || level, 'classic', requestedVariant ? { variant: requestedVariant } : null);
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
    playedSeconds,
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
    playFactsRef,
    comboCount,
    variant,
    cages,
    t
  });

  // The hint a rewarded video pays, spent at once (useRewardHint.js).
  const handleRewardHint = useRewardHint({
    adHintsUsedThisGame, setAdHintsUsedThisGame, setHintsRemaining, setShowHintRewardModal, handleGetHint
  });

  const { remainingCounts, userFilledCount, totalEmptyCount } = boardProgress(board, initialBoard);

  return {
    level, setLevel, gameMode, setGameMode, variant, cages,
    board, initialBoard, solutionBoard, notes,
    selectedCell, activeNumber, lockedNumber,
    isNoteMode, setIsNoteMode,
    isFastEntryMode, handleToggleFastEntryMode,
    mistakes, setMistakes, hasRevived, setHasRevived,
    timerSeconds, setTimerSeconds, playedSeconds, comboCount, timeFloatingText,
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
