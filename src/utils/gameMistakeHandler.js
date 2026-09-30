import { soundHaptic } from './soundHaptic.js';
import { recordGameLoss, clearGameState } from './storage.js';
import { detectSudokuConflict } from '../engine/conflictDetector.js';

export function handleMistakeLogic({
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
  t
}) {
  soundHaptic.playErrorSound();
  const newMistakes = mistakes + 1;
  setMistakes(newMistakes);

  if (gameMode === 'timeAttack') {
    handleTimePenalty(10);
  }

  const isUnlimited = !limitMistakes || gameMode === 'timeAttack';
  const conflict = detectSudokuConflict(nextBoard, r, c, num, newMistakes, isUnlimited, t);
  setConflictInfo(conflict);
  if (conflictTimeoutRef.current) clearTimeout(conflictTimeoutRef.current);
  conflictTimeoutRef.current = setTimeout(() => setConflictInfo(null), 3000);

  if (limitMistakes && gameMode !== 'timeAttack' && newMistakes >= 3) {
    soundHaptic.playGameOverSound();
    setIsGameOver(true);
    recordGameLoss(gameMode);
    // The loss is recorded; the last save (taken at 2 mistakes) must not survive it,
    // or Home offers to resume a lost game — a free revive — and quitting it later
    // would count the same loss twice (abandonedGame.js).
    clearGameState();
  }
}
