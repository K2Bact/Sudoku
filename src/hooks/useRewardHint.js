import { addHints, loadWallet } from '../utils/wallet.js';

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
  handleGetHint,
  showToast,
  t
}) {
  // Rewarded Video Ad Completion Handler (with instant Auto-Apply)
  return () => {
    if (adHintsUsedThisGame >= 2) return;
    const before = loadWallet().hints;
    const newCount = addHints(1, 'ad_reward');
    setHintsRemaining(newCount);
    setShowHintRewardModal(false);
    // addHints reports the balance really stored. If it did not go up, the phone would
    // not keep the reward (storage full, D30): say so, and do not hand on to the hint
    // button — it would spend nothing and offer the ad again. Not counted toward the two.
    if (newCount <= before) {
      if (typeof showToast === 'function' && typeof t === 'function') {
        showToast(t('modals.hintReward.notSaved'), 3500);
      }
      return;
    }
    setAdHintsUsedThisGame(prev => prev + 1);

    // Automatically apply the rewarded hint directly onto the board
    setTimeout(() => {
      handleGetHint();
    }, 120);
  };
}
