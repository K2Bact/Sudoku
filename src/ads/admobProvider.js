/**
 * admobProvider.js
 * The real one. Not enabled during closed testing — see ads/index.js.
 *
 * This file is written and shipped but dormant, so that going live is a config
 * change rather than a coding session against a deadline. It is deliberately
 * NOT exercised on a device: showing real ads to ourselves is invalid traffic,
 * and that is how AdMob accounts get suspended. The first real impression
 * should come from a real player after release.
 *
 * There is no import of the plugin package. Capacitor registers native plugins
 * on `window.Capacitor.Plugins` at runtime, so this file compiles and ships
 * fine without `@capacitor-community/admob` installed, and starts working the
 * moment it is. A static import would break the build for everyone until then.
 *
 * GOTCHA that already cost this project once (see Play Games): a Capacitor
 * plugin object is a Proxy, so `await plugin` invokes `plugin.then()` and the
 * native layer answers "PlayGames.then() is not implemented". Only ever await
 * the RESULT OF A METHOD CALL, never the plugin itself.
 */

function plugin() {
  if (typeof window === 'undefined') return null;
  const plugins = window.Capacitor && window.Capacitor.Plugins;
  return (plugins && plugins.AdMob) || null;
}

function unitIds() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  return {
    banner: env.VITE_ADMOB_BANNER_ID || '',
    interstitial: env.VITE_ADMOB_INTERSTITIAL_ID || '',
    rewarded: env.VITE_ADMOB_REWARDED_ID || ''
  };
}

export class AdMobProvider {
  constructor() {
    this.initPromise = null;
  }

  get id() {
    return 'admob';
  }

  /**
   * True only when the SDK is actually present AND configured. Selecting this
   * provider is not the same as being able to serve: without the plugin
   * installed or the unit ids set, claiming a real ad would be the same lie the
   * fake provider exists to avoid.
   */
  get isReal() {
    const ids = unitIds();
    return Boolean(plugin() && ids.rewarded && ids.banner);
  }

  init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      const admob = plugin();
      if (!admob) return false;
      try {
        await admob.initialize({ initializeForTesting: false });
        return true;
      } catch (e) {
        console.warn('[ads] AdMob initialize failed:', e?.message || e);
        return false;
      }
    })();
    return this.initPromise;
  }

  async showRewarded() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.rewarded) return { rewarded: false };
    try {
      await this.init();
      await admob.prepareRewardVideoAd({ adId: ids.rewarded });
      const result = await admob.showRewardVideoAd();
      // The SDK reports the reward it granted; no reward object means the
      // player closed the ad early and is owed nothing.
      return { rewarded: Boolean(result && (result.type || result.amount)) };
    } catch (e) {
      console.warn('[ads] rewarded ad failed:', e?.message || e);
      return { rewarded: false };
    }
  }

  async showInterstitial() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.interstitial) return;
    try {
      await this.init();
      await admob.prepareInterstitial({ adId: ids.interstitial });
      await admob.showInterstitial();
    } catch (e) {
      console.warn('[ads] interstitial failed:', e?.message || e);
    }
  }
}
