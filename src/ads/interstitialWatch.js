/**
 * interstitialWatch.js
 * Show an already-loaded AdMob interstitial and resolve when it is gone.
 *
 * The post-game interstitial now sits in front of the victory screen, so the
 * screen must not appear until the ad has closed. The plugin cannot say when
 * that is through the call itself — in @capacitor-community/admob 8.1.0 the
 * interstitial executor does `ad.show(activity); call.resolve()`, so the promise
 * settles the instant the ad starts. Closing is an event, `interstitialAdDismissed`,
 * and a failure to appear is another, `interstitialAdFailedToShow`.
 *
 * Two timers bound the ways it can go quiet:
 *   showed timeout   no `interstitialAdShowed` soon after the call — nothing is on
 *                    screen, so do not keep the player waiting. This is also what
 *                    happens on the plugin's web stub, which resolves and emits
 *                    nothing at all.
 *   show ceiling     shown, but never reports closing. Continue anyway; the victory
 *                    screen then renders beneath an ad that is still up, which is
 *                    harmless, where waiting forever is not.
 *
 * InterstitialSlot holds the one loaded ad between preload and show: when it
 * loaded, whether a load is in flight, and when it has aged out. A loaded
 * interstitial expires after an hour, so a load older than 55 minutes counts
 * as absent and the win goes straight to the victory screen.
 */

import { withTimeout } from './rewardedWatch.js';

export class InterstitialSlot {
  constructor() {
    this.loadedAt = null;
    this.loading = null;
    // Instance fields so the lifecycle gate can shrink them.
    this.loadTimeoutMs = 15000;
    this.maxAgeMs = 55 * 60 * 1000;
    this.showedTimeoutMs = 5000;
    this.showCeilingMs = 120000;
  }

  isReady(now = Date.now()) {
    return this.loadedAt !== null && now - this.loadedAt < this.maxAgeMs;
  }

  /** @param requestLoad () => Promise — the plugin's prepareInterstitial call */
  load(requestLoad) {
    if (this.isReady()) return Promise.resolve(true);
    if (this.loading) return this.loading;
    this.loading = withTimeout(Promise.resolve().then(requestLoad), this.loadTimeoutMs)
      .then(() => {
        this.loadedAt = Date.now();
        return true;
      })
      .catch((e) => {
        console.warn('[ads] interstitial did not load:', e?.message || e);
        return false;
      })
      .finally(() => {
        this.loading = null;
      });
    return this.loading;
  }

  /** Show the loaded ad once. An ad that is not ready is skipped, never waited for. */
  async show(admob) {
    if (!admob || !this.isReady()) return { shown: false, reason: 'not_ready' };
    this.loadedAt = null;
    return watchInterstitial(admob, { showedTimeoutMs: this.showedTimeoutMs, showCeilingMs: this.showCeilingMs });
  }
}

/**
 * @returns {{ shown: boolean, reason: string|null }}
 */
export async function watchInterstitial(admob, { showedTimeoutMs, showCeilingMs }) {
  let settled = false;
  let showed = false;
  let settle;
  const done = new Promise((resolve) => {
    settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
  });
  const timers = [];

  const pending = [];
  const listen = (name, fn) => {
    if (typeof admob.addListener !== 'function') return;
    try {
      pending.push(Promise.resolve(admob.addListener(name, fn)).catch(() => null));
    } catch {
      /* covered by the timers below */
    }
  };
  listen('interstitialAdShowed', () => { showed = true; });
  listen('interstitialAdDismissed', () => settle({ shown: true, reason: null }));
  listen('interstitialAdFailedToShow', () => settle({ shown: false, reason: 'failed_to_show' }));
  const handles = await Promise.all(pending);

  timers.push(setTimeout(() => {
    if (!showed) settle({ shown: false, reason: 'not_shown' });
  }, showedTimeoutMs));
  timers.push(setTimeout(() => settle({ shown: showed, reason: 'no_dismiss_event' }), showCeilingMs));

  try {
    Promise.resolve(admob.showInterstitial()).catch((e) => {
      console.warn('[ads] interstitial failed to show:', e?.message || e);
      settle({ shown: false, reason: 'failed_to_show' });
    });
  } catch (e) {
    console.warn('[ads] interstitial failed to show:', e?.message || e);
    settle({ shown: false, reason: 'failed_to_show' });
  }

  const result = await done;
  timers.forEach(clearTimeout);
  for (const h of handles) {
    try {
      if (h && typeof h.remove === 'function') Promise.resolve(h.remove()).catch(() => {});
    } catch {
      /* a listener that will not detach must not hold the result */
    }
  }
  return result;
}
