import { useRef } from 'react';
import {
  cloneGrid,
  calculateRemainingCounts,
  findNextIncompleteNumber,
  autoRemoveNotes
} from '../engine/SudokuEngine.js';
import { soundHaptic } from '../utils/soundHaptic.js';
import { loadSettings } from '../utils/storage.js';
import { battleService } from '../firebase/battleService.js';
import { handleGameWinLogic } from '../utils/gameCompletion.js';
import { handleMistakeLogic } from '../utils/gameMistakeHandler.js';
import { useKeypadActions } from './useKeypadActions.js';
import { ensureValidSolution } from '../engine/puzzleSetup.js';
import { notePlaced, digitPlaced, winFacts, firstRightAnswer } from '../utils/playFacts.js';

export function useGameInput({
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
  playedSeconds = null,
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
  hintsUsedCount = 0,
  setHintsUsedCount,
  adHintsUsedThisGame = 0,
  rivalMode = 'standard',
  showToast,
  runTimelineRef,
  playFactsRef = null,
  comboCount = 0,
  variant = 'classic',
  cages = null,
  t
}) {
  const conflictTimeoutRef = useRef(null);

  const handleSelectCell = (r, c) => {
    if (isPaused || isGameOver || isVictory) return;
    soundHaptic.playSelectSound();
    setSelectedCell([r, c]);

    const cellVal = board[r][c];
    const validSolution = ensureValidSolution(initialBoard, solutionBoard, cages);
    const isErrorCell = cellVal !== 0 && cellVal !== validSolution[r][c];

    if (!isFastEntryMode) {
      if (cellVal !== 0 && !isErrorCell) {
        setActiveNumber(cellVal);
      } else {
        setActiveNumber(null);
      }
      return;
    }

    // Fast Entry Mode (Number-First)
    if (cellVal === 0 || isErrorCell) {
      if (lockedNumber !== null) {
        handleInputNumber(lockedNumber, [r, c]);
      }
    } else {
      // Cell already has a valid number -> Fast Switch locked tool to this number
      const counts = calculateRemainingCounts(board);
      if (counts[cellVal] > 0) {
        setLockedNumber(cellVal);
        setActiveNumber(cellVal);
      } else {
        setActiveNumber(cellVal);
        setLockedNumber(null);
      }
    }
  };

  const handleInputNumber = (num, targetCell = selectedCell) => {
    if (!targetCell || isPaused || isGameOver || isVictory) return;
    const [r, c] = targetCell;
    if (initialBoard[r][c] !== 0) return;

    const validSolution = ensureValidSolution(initialBoard, solutionBoard, cages);
    const isCorrectCell = board[r][c] !== 0 && board[r][c] === validSolution[r][c];
    if (!isNoteMode && isCorrectCell && board[r][c] !== num) return;

    if (!isNoteMode && board[r][c] !== num) {
      const counts = calculateRemainingCounts(board);
      if (counts[num] <= 0) {
        soundHaptic.playSelectSound();
        return;
      }
    }

    pushHistory();

    if (isNoteMode) {
      if (board[r][c] !== 0) return;
      soundHaptic.playNoteSound();
      if (!(notes?.[r]?.[c] || []).includes(num)) notePlaced(playFactsRef?.current);
      setNotes(prev => {
        const next = prev.map(row => row.map(col => [...col]));
        const currentNotes = next[r][c];
        next[r][c] = currentNotes.includes(num)
          ? currentNotes.filter(n => n !== num)
          : [...currentNotes, num].sort();
        return next;
      });
      return;
    }

    if (board[r][c] === num) return;

    digitPlaced(playFactsRef?.current, isFastEntryMode);
    soundHaptic.playPopSound();
    const nextBoard = cloneGrid(board);
    nextBoard[r][c] = num;
    setBoard(nextBoard);

    if (!isFastEntryMode) {
      setActiveNumber(null);
    } else {
      const nextCounts = calculateRemainingCounts(nextBoard);
      if (nextCounts[num] === 0) {
        setSelectedCell(null);
        const nextNum = findNextIncompleteNumber(num, nextCounts);
        if (nextNum !== null) {
          setActiveNumber(nextNum);
          setLockedNumber(nextNum);
        } else {
          if (lockedNumber === num) setLockedNumber(null);
          setActiveNumber(null);
        }
      }
    }

    const settings = loadSettings();
    const limitMistakes = settings.limitMistakes ?? true;
    const autoCheckMistakes = settings.autoCheckMistakes ?? true;

    if (num !== validSolution[r][c] && autoCheckMistakes) {
      if (activeBattleRoom) {
        battleService.sendProgress(calculateRemainingCounts(nextBoard), mistakes + 1, nextBoard);
      }
      handleMistakeLogic({
        nextBoard,
        r,
        c,
        num,
        mistakes,
        setMistakes,
        gameMode,
        handleTimePenalty,
        setConflictInfo,
        conflictTimeoutRef,
        limitMistakes,
        setIsGameOver,
        t,
        variant,
        cages
      });
      return;
    }

    if (num === validSolution[r][c]) {
      soundHaptic.playPlaceNumberSound();
      setConflictInfo(null);

      // Pace sample for Ghost mode: how many blanks were filled by this second.
      if (runTimelineRef) {
        const filled = nextBoard.reduce((acc, row, ri) =>
          acc + row.filter((v, ci) => v !== 0 && initialBoard[ri][ci] === 0).length, 0);
        runTimelineRef.current.push({ time: timerSeconds, count: filled });
      }

      // A cell earns its reward once a game (playFacts.js, D17): erasing a right
      // digit and placing it again used to pay again — Survival +7 s, a Speedrun
      // combo off the clock — as often as it was repeated.
      if (firstRightAnswer(playFactsRef?.current, r * 9 + c)) {
        if (gameMode === 'timeAttack') {
          handleComboSuccess();
        } else if (gameMode === 'timeLimit') {
          addSurvivalBonusTime(7);
        }
      }
    }

    if (settings.autoRemoveNotes ?? true) {
      setNotes(prev => autoRemoveNotes(prev, r, c, num, cages));
    }

    if (activeBattleRoom) {
      battleService.sendProgress(calculateRemainingCounts(nextBoard), mistakes, nextBoard);
    }

    const isComplete = nextBoard.every((row, rIdx) =>
      row.every((val, cIdx) => val === validSolution[rIdx][cIdx])
    );

    if (isComplete) {
      soundHaptic.playCompleteChime();
      handleGameWinLogic({
        level,
        timerSeconds,
        playedSeconds,
        gameMode,
        variant,
        mistakes,
        activeDailyDateKey,
        clearGameState,
        setIsVictory,
        setHintsRemaining,
        hintsUsed: hintsUsedCount || 0,
        initialBoard,
        solutionBoard: validSolution,
        cages,
        comboCount,
        ...winFacts(playFactsRef?.current),
        timeline: runTimelineRef ? runTimelineRef.current.slice() : [],
        totalEmptyCells: initialBoard.reduce((acc, row) => acc + row.filter(v => v === 0).length, 0)
      });
    } else if (!autoCheckMistakes && nextBoard.every(row => row.every(val => val !== 0))) {
      soundHaptic.playErrorSound();
      setConflictInfo({
        type: 'logic',
        message: t('conflicts.boardFullHasMistakes')
      });
      if (conflictTimeoutRef.current) clearTimeout(conflictTimeoutRef.current);
      conflictTimeoutRef.current = setTimeout(() => setConflictInfo(null), 3000);
    }
  };

  const {
    handleKeypadNumberTap,
    handleErase,
    handleGetHint,
    handleToggleFastEntryMode
  } = useKeypadActions({
    board,
    setBoard,
    initialBoard,
    solutionBoard,
    setNotes,
    selectedCell,
    setSelectedCell,
    activeNumber,
    setActiveNumber,
    lockedNumber,
    setLockedNumber,
    isFastEntryMode,
    setIsFastEntryMode,
    isPaused,
    isGameOver,
    isVictory,
    pushHistory,
    setConflictInfo,
    setShowHintRewardModal,
    setHintsRemaining,
    setHintsUsedCount,
    handleInputNumber,
    activeBattleRoom,
    adHintsUsedThisGame,
    rivalMode,
    showToast,
    t,
    gameMode
  });

  return {
    handleSelectCell,
    handleInputNumber,
    handleKeypadNumberTap,
    handleErase,
    handleGetHint,
    handleToggleFastEntryMode
  };
}
