/**
 * bannerWidthWatcher.js — keep the banner matched to the window it sits in.
 *
 * Split out of admobProvider.js when that file went over its 280-code-line
 * budget (gate 0-1). One subject: an anchored adaptive banner is sized when it
 * is created and never resizes itself, so when the window changes width the
 * banner has to be thrown away and asked for again.
 *
 * While the app was locked to portrait none of this could happen. Opening
 * rotation for tablets (V22 ③) made it real, and it showed up on a Flip6 widened
 * to a tablet (2640x1080, sw720dp): the app's WebView spanned x 94..2640 while
 * the banner stayed 1080 wide against the left edge, with 1,400px of black
 * beside it. The advertiser was paying for a banner nobody reads in a corner.
 *
 * The functions take the provider rather than living on it — the provider owns
 * the native plugin and the queue, this file owns the policy about when to
 * rebuild. Same shape as battleMatchmaking.js taking its service.
 */

/**
 * The width the banner would be built for, in CSS px (= dp in this WebView).
 * Not the screen: the WebView is what the banner is laid out against.
 */
export function bannerWidth() {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerWidth || 0);
}

// Below this, a width change is a keyboard, a scrollbar or a soft-key row, not a
// new screen. An ad reload for one of those would be a wasted request.
export const BANNER_WIDTH_TOLERANCE_PX = 48;

/**
 * The least time between two banner rebuilds.
 *
 * The debounce in watchBannerWidth folds ONE rotation into a single request. It
 * does nothing about ten of them: turn a tablet over and back five times in
 * twenty seconds and that is ten ad requests, which is faster than any refresh
 * interval AdMob itself offers and is the shape of traffic that gets an account
 * looked at.
 *
 * A rebuild inside the window is not dropped, it is deferred to the end of it,
 * and the deferred pass re-reads the width — so turning back to where you
 * started costs nothing at all.
 */
export const BANNER_REBUILD_MIN_INTERVAL_MS = 30000;

/** How long to wait for the window to settle. A rotation fires resize several times. */
const SETTLE_MS = 400;

/**
 * Give the reserved slot back to the stylesheet's width-derived estimate.
 *
 * --ad-banner-h is only ever set, never cleared, so after a rebuild it holds the
 * height of the banner that just went away. Left there it is wrong in whichever
 * direction the rotation went: turning to landscape it reserves a portrait
 * banner's 50px while a 90px one is being drawn, and a banner overlapping the
 * keypad is U-1 itself; turning back it reserves 90px for a 50px banner and
 * leaves a dead band. Dropping the value falls back to the clamp in screens.css,
 * which is derived from the width by the same formula the adaptive banner uses —
 * right for the new width at once, and when it is wrong it over-reserves rather
 * than under-reserves. bannerAdSizeChanged replaces it when the ad lands.
 *
 * Guarded because the gates run this module under a hand-made window with no
 * document.
 */
export function clearBannerReserve() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  document.documentElement.style.removeProperty('--ad-banner-h');
}

/**
 * Build the banner again when the window has changed width.
 *
 * hideBanner is not enough — the native view survives it and resumeBanner brings
 * the same one back at the same width. It has to be removed and asked for again,
 * so a rotation costs one more ad request, which is what a new screen is.
 */
export async function rebuildBannerIfWidthChanged(provider, admob) {
  if (!provider.bannerWanted || !provider.bannerCreated) return false;
  const now = bannerWidth();
  if (!now || Math.abs(now - (provider.bannerWidth || 0)) < BANNER_WIDTH_TOLERANCE_PX) return false;

  // Too soon after the last one: come back at the end of the window instead of
  // dropping it. One timer, not one per event.
  const since = Date.now() - (provider.lastBannerRebuildAt || 0);
  if (since < BANNER_REBUILD_MIN_INTERVAL_MS) {
    if (!provider.rebuildDeferred) {
      provider.rebuildDeferred = setTimeout(() => {
        provider.rebuildDeferred = null;
        provider.rebuildBannerIfWidthChanged().catch(() => {});
      }, BANNER_REBUILD_MIN_INTERVAL_MS - since);
    }
    return false;
  }

  if (!admob) return false;
  provider.lastBannerRebuildAt = Date.now();
  try {
    await provider.queueBanner(async () => {
      if (typeof admob.removeBanner === 'function') await admob.removeBanner();
      else await admob.hideBanner();
      provider.bannerCreated = false;
    });
  } catch (e) {
    console.warn('[ads] could not remove the banner before rebuilding it:', e?.message || e);
    return false;
  }
  clearBannerReserve();
  // showBanner re-reads the width and the margin for the new window.
  return provider.showBanner();
}

/** Watch the window for the change above. Called once, from showBanner. */
export function watchBannerWidth(provider) {
  // Node runs this module in the gates with a hand-made `window`, which has no
  // event API. A missing listener there costs nothing; throwing would take the
  // banner down with it.
  if (provider.widthWatcher || typeof window === 'undefined'
      || typeof window.addEventListener !== 'function') return;
  let timer = null;
  provider.widthWatcher = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { provider.rebuildBannerIfWidthChanged().catch(() => {}); }, SETTLE_MS);
  };
  window.addEventListener('resize', provider.widthWatcher);
  window.addEventListener('orientationchange', provider.widthWatcher);
}

/** Let the screen go: the listener and any deferred rebuild belong to it. */
export function stopWatchingBannerWidth(provider) {
  if (provider.widthWatcher && typeof window !== 'undefined'
      && typeof window.removeEventListener === 'function') {
    window.removeEventListener('resize', provider.widthWatcher);
    window.removeEventListener('orientationchange', provider.widthWatcher);
    provider.widthWatcher = null;
  }
  if (provider.rebuildDeferred) {
    clearTimeout(provider.rebuildDeferred);
    provider.rebuildDeferred = null;
  }
}
