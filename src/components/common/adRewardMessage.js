/**
 * What a player is told when a rewarded ad gave them nothing.
 *
 * Every rewarded placement used to end in `if (!rewarded) return;`. Nothing on
 * screen changed, so a revive button that could not find an ad looked exactly
 * like a revive button that was broken. While AdMob reviews the app, ad serving
 * is limited and "no ad available" stops being rare, which is when that silence
 * costs the most.
 *
 * Two messages, not three. Closing the ad early is something the player did and
 * can choose not to do; every other failure — no fill, no consent, a load that
 * timed out, an ad that would not appear — is the same thing from where they
 * stand: there is no ad right now, try again shortly.
 *
 * The keys are written out rather than built from `reason`, so the translation
 * reachability gate can see that both are used.
 *
 * Returns null when the ad did pay out.
 */
export function adRewardMessage(result, t) {
  if (!result || result.rewarded) return null;
  return result.reason === 'dismissed'
    ? t('modals.adReward.dismissed')
    : t('modals.adReward.unavailable');
}

/**
 * Run a rewarded ad and always come back with a result.
 *
 * The provider already guarantees it resolves. This guards the call site
 * against a throw from anywhere on the way there, because the thing the
 * placements must never do again is leave their "watching" flag set.
 */
export async function watchRewardedAd(adsService) {
  try {
    const result = await adsService.showRewarded();
    return result && typeof result.rewarded === 'boolean'
      ? result
      : { rewarded: false, reason: 'unavailable' };
  } catch (e) {
    console.warn('[ads] rewarded ad threw:', e?.message || e);
    return { rewarded: false, reason: 'unavailable' };
  }
}
