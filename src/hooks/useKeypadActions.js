import { cloneGrid, calculateRemainingCounts, getSmartHint } from '../engine/SudokuEngine.js';
import { soundHaptic } from '../utils/soundHaptic.js';
import { loadWallet, spendHint } from '../utils/wallet.js';

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

    // Find the answer before spending a hint: a hint that has nothing to show
    // must not cost one.
    const hint = getSmartHint(board, solutionBoard, selectedCell);
    if (!hint) return;

    const spent = spendHint();
    if (spent === 'not_saved') {
      // The player has hints; the phone would not store the spend (D30). An ad offer
      // here would ask them to watch one for a hint they already have.
      soundHaptic.playSelectSound();
      if (typeof showToast === 'function' && typeof t === 'function') {
        showToast(t('modals.hintReward.notSaved'), 3500);
      }
      return;
    }
    if (spent !== 'spent') {
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

    // fromHint (CH18-01, CH18-02, 2026-10-18): the hint places the answer even with
    // the pencil on — it used to go in as a note, the hint spent and the cell empty —
    // and a win it completes is a win with this hint used. setHintsUsedCount above
    // lands next render; the win is recorded in this one, and the first hint on the
    // last cell saved a best time and a ghost the victory card called a hint game.
    const { row, col, num } = hint;
    setSelectedCell([row, col]);
    handleInputNumber(num, [row, col], { fromHint: true });
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
