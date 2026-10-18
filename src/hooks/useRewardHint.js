import { addHints } from '../utils/wallet.js';

/**
 * useRewardHint.js — the hint a rewarded video pays (HintRewardModal → App).
 *
 * Two a game at most. The hint goes into the wallet and is spent on the board at
 * once, as if the hint button had been pressed (useKeypadActions.handleGetHint).
 * Split out of useSudokuGame.js on 2026-10-18, when that file reached its
 * code-line budget (gate 0-1); gate 2-7 reads the cap here.
 */
export function useRewardHint({
  adHintsUsedThisGame,
  setAdHintsUsedThisGame,
  setHintsRemaining,
  setShowHintRewardModal,
  handleGetHint
}) {
  // Rewarded Video Ad Completion Handler (with instant Auto-Apply)
  return () => {
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
}
