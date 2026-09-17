/**
 * rewardedWatch.js
 * Turns a shown AdMob rewarded ad into one result that always arrives.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * The obvious code is `const item = await admob.showRewardVideoAd()`. It was
 * this app's code, and a player who closed the ad early was trapped.
 *
 * In @capacitor-community/admob 8.1.0 the native call is settled in exactly one
 * place, the earned-reward listener:
 *
 *     OnUserEarnedRewardListener { ... call.resolve(response) }
 *
 * onAdDismissedFullScreenContent and onAdFailedToShowFullScreenContent only emit
 * events; neither touches the call. So an ad closed before the reward, or one
 * that fails to appear, leaves the promise pending forever. Every placement set
 * a "watching" flag, awaited, and cleared it afterwards — the clear never ran.
 * The game-over modal hides all of its buttons while that flag is set, so the
 * player sat on a spinner with no revive, no restart and no way home.
 *
 * The interstitial does not have this problem: its executor calls
 * `call.resolve()` straight after `show()`.
 *
 * The events are the only complete signal, so this listens to them:
 *
 *   Rewarded      marks the reward. Does not settle — the game must not change
 *                 under an ad that is still on screen.
 *   Dismissed     settles with whatever was earned.
 *   FailedToShow  settles as a failure.
 *
 * and two timers bound the ways it can still go quiet: an earned reward whose
 * ad never reports closing (the reward is still owed), and a shown ad that
 * reports nothing at all.
 */

/** Rejects if `promise` has not settled within `ms`. The timer never outlives the race. */
export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timer));
}

/**
 * Show the already-prepared rewarded ad and resolve { rewarded, reason } exactly once.
 *
 * @param admob  the Capacitor AdMob plugin
 * @param opts.dismissGraceMs  after the reward, how long to wait for the close event
 * @param opts.showCeilingMs   absolute ceiling if the ad reports nothing
 */
export async function watchRewarded(admob, { dismissGraceMs, showCeilingMs }) {
  let earned = false;
  let settled = false;
  let settle;
  const done = new Promise((resolve) => {
    settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
  });
  const timers = [];
  const earnedResult = () => (earned ? { rewarded: true, reason: null } : null);

  const markEarned = () => {
    if (earned) return;
    earned = true;
    // Dismissed should follow within moments. If it never arrives the reward
    // was still earned, and withholding it would be the worse failure.
    timers.push(setTimeout(() => settle(earnedResult()), dismissGraceMs));
  };

  // Register before showing, and wait for registration: an event that fires
  // before its listener exists is an event that never happened.
  const pending = [];
  const listen = (name, fn) => {
    if (typeof admob.addListener !== 'function') return;
    try {
      pending.push(Promise.resolve(admob.addListener(name, fn)).catch(() => null));
    } catch {
      /* a listener that cannot attach is covered by the ceiling below */
    }
  };
  listen('onRewardedVideoAdReward', markEarned);
  listen('onRewardedVideoAdDismissed', () => settle(earnedResult() || { rewarded: false, reason: 'dismissed' }));
  listen('onRewardedVideoAdFailedToShow', () => settle({ rewarded: false, reason: 'failed_to_show' }));
  const handles = await Promise.all(pending);

  timers.push(setTimeout(
    () => settle(earnedResult() || { rewarded: false, reason: 'failed_to_show' }),
    showCeilingMs,
  ));

  const failedToShow = (e) => {
    console.warn('[ads] rewarded ad failed to show:', e?.message || e);
    // An error after the reward was earned does not take the reward back.
    settle(earnedResult() || { rewarded: false, reason: 'failed_to_show' });
  };
  try {
    Promise.resolve(admob.showRewardVideoAd()).then((item) => {
      // On Android this resolves only when the reward is earned. The web stub
      // resolves at once with { type: '', amount: 0 } and shows nothing, so an
      // empty payload is not a reward — and not worth a spinner either.
      if (item && (item.type || item.amount)) markEarned();
      else settle({ rewarded: false, reason: 'unavailable' });
    }, failedToShow);
  } catch (e) {
    failedToShow(e);
  }

  const result = await done;
  timers.forEach(clearTimeout);
  // Not awaited: a native detach that hangs must not hold the player's result.
  for (const h of handles) {
    try {
      if (h && typeof h.remove === 'function') Promise.resolve(h.remove()).catch(() => {});
    } catch {
      /* a listener that will not detach must not undo a settled result */
    }
  }
  return result;
}
