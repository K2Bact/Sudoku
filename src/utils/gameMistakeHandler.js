import { soundHaptic } from './soundHaptic.js';
import { clearGameState } from './storage.js';
import { recordLoss } from './killerStats.js';
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
  t,
  variant = 'classic',
  cages = null
}) {
  soundHaptic.playErrorSound();
  const newMistakes = mistakes + 1;
  setMistakes(newMistakes);

  if (gameMode === 'timeAttack') {
    handleTimePenalty(10);
  }

  const isUnlimited = !limitMistakes || gameMode === 'timeAttack';
  const conflict = detectSudokuConflict(nextBoard, r, c, num, newMistakes, isUnlimited, t, cages);
  setConflictInfo(conflict);
  if (conflictTimeoutRef.current) clearTimeout(conflictTimeoutRef.current);
  conflictTimeoutRef.current = setTimeout(() => setConflictInfo(null), 3000);

  if (limitMistakes && gameMode !== 'timeAttack' && newMistakes >= 3) {
    soundHaptic.playGameOverSound();
    setIsGameOver(true);
    recordLoss(variant, gameMode);
    // The loss is recorded; the last save (taken at 2 mistakes) must not survive it,
    // or Home offers to resume a lost game — a free revive — and quitting it later
    // would count the same loss twice (abandonedGame.js).
    clearGameState();
  }
}
