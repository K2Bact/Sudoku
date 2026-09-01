import { cloneGrid, calculateRemainingCounts, getSmartHint } from '../engine/SudokuEngine';
import { soundHaptic } from '../utils/soundHaptic';
import { loadWallet, consumeHint } from '../utils/wallet';

export function useKeypadActions({
  board,
  setBoard,
  initialBoard,
  solutionBoard,
  setNotes,
  selectedCell,
  setSelectedCell,
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
  adHintsUsedThisGame = 0,
  rivalMode = 'standard',
  showToast,
  t,
  gameMode
}) {
  const handleKeypadNumberTap = (num) => {
    if (isPaused || isGameOver || isVictory) return;

    const currentRemaining = calculateRemainingCounts(board)[num];
    const isComplete = currentRemaining <= 0;

    // 1. Fast Entry Mode (Number-First)
    if (isFastEntryMode) {
      if (lockedNumber === num) {
        soundHaptic.playSelectSound();
        setLockedNumber(null);
        setActiveNumber(null);
        return;
      }

      if (isComplete) {
        soundHaptic.playBlockedInput();
        setLockedNumber(null);
        setActiveNumber(prev => (prev === num ? null : num));
        return;
      }

      soundHaptic.playSelectSound();
      setLockedNumber(num);
      setActiveNumber(num);
      setSelectedCell(null);
      return;
    }

    // 2. Normal Mode (Cell-First)
    if (!selectedCell) {
      soundHaptic.playSelectSound();
      setActiveNumber(prev => (prev === num ? null : num));
      return;
    }

    const [r, c] = selectedCell;
    const isNonEmptyCell = board[r]?.[c] !== 0;

    if (isNonEmptyCell) {
      soundHaptic.playBlockedInput();
      return;
    }

    if (isComplete) {
      soundHaptic.playBlockedInput();
      return;
    }

    setActiveNumber(null);
    handleInputNumber(num, selectedCell);
  };

  const handleErase = () => {
    if (!selectedCell || isPaused || isGameOver || isVictory) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    pushHistory();
    soundHaptic.playEraseSound();

    const nextBoard = cloneGrid(board);
    nextBoard[r][c] = 0;
    setBoard(nextBoard);
    setActiveNumber(null);
    setConflictInfo(null);

    setNotes(prev => {
      const next = prev.map(row => row.map(col => [...col]));
      next[r][c] = [];
      return next;
    });
  };

  const handleGetHint = () => {
    if (activeBattleRoom || isPaused || isGameOver || isVictory || gameMode === 'timeAttack') return;

    const success = consumeHint();
    if (!success) {
      soundHaptic.playSelectSound();
      if (adHintsUsedThisGame >= 2) {
        if (typeof showToast === 'function' && typeof t === 'function') {
          showToast(t('modals.hintReward.maxReached'));
        }
        return;
      }
      setShowHintRewardModal(true);
      return;
    }

    setHintsRemaining(loadWallet().hints);
    if (typeof setHintsUsedCount === 'function') {
      setHintsUsedCount(prev => prev + 1);
    }
    soundHaptic.playHintSound();

    if ((rivalMode === 'ghost' || rivalMode === 'delta') && typeof showToast === 'function' && typeof t === 'function') {
      showToast(t('game.ghost.ghostHintNotice'), 2300);
    }

    const hint = getSmartHint(board, solutionBoard, selectedCell);
    if (!hint) return;

    const { row, col, num } = hint;
    setSelectedCell([row, col]);
    handleInputNumber(num, [row, col]);
  };

  const handleToggleFastEntryMode = () => {
    const next = !isFastEntryMode;
    setIsFastEntryMode(next);

    if (next) {
      let numToLock = null;
      if (selectedCell) {
        const [r, c] = selectedCell;
        if (board[r]?.[c] !== 0) numToLock = board[r][c];
      }
      if (numToLock) {
        const counts = calculateRemainingCounts(board);
        if (counts[numToLock] > 0) {
          setLockedNumber(numToLock);
          setActiveNumber(numToLock);
        } else {
          setLockedNumber(null);
          setActiveNumber(null);
        }
      } else {
        setLockedNumber(null);
        setActiveNumber(null);
      }
    } else {
      setLockedNumber(null);
    }
  };

  return {
    handleKeypadNumberTap,
    handleErase,
    handleGetHint,
    handleToggleFastEntryMode
  };
}
