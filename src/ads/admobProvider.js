/**
 * admobProvider.js
 * The real one. Not enabled during closed testing — see ads/index.js.
 *
 * This is live now, running against Google's published sample unit ids. Those
 * always return a test ad: no revenue, no impressions on a live unit, and
 * clicking them is not invalid traffic. Clicking your own LIVE ads is, which is
 * how AdMob accounts get suspended — so the sample ids stay until release and
 * the first live impression comes from a real player.
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

/**
 * Google publishes fixed sample unit ids that always return a test ad. They are
 * what makes it safe to run the real SDK during closed testing: no revenue, no
 * impressions on a live unit, and clicking them is not invalid traffic. Clicking
 * your own LIVE ads is, and that is how accounts get suspended.
 *
 * `isTesting` is passed alongside so the SDK marks the request as a test even if
 * a real unit id is configured. Both signals, not one.
 */
function isTestingAds() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  return String(env.VITE_ADMOB_TESTING || '').toLowerCase() === 'true';
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
    /** Set by init(). Null until consent has been resolved one way or the other. */
    this.canRequestAds = null;
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

  /**
   * Consent first, then the SDK.
   *
   * Google decides whether this user is in a region that requires consent; we
   * do not guess from a locale. `canRequestAds` is the SDK's own answer to
   * "may I ask for an ad for this person", and it is the only thing that gates
   * a request — reading the status string ourselves would be re-implementing a
   * judgement the SDK already makes.
   *
   * Anything that goes wrong here turns ads off rather than on. Serving a
   * personalised ad to someone whose consent state could not be read is the
   * failure this whole flow exists to prevent.
   */
  init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      const admob = plugin();
      if (!admob) return false;
      try {
        let info = await admob.requestConsentInfo();

        if (info?.status === 'REQUIRED' && info?.isConsentFormAvailable) {
          info = await admob.showConsentForm();
        }

        this.canRequestAds = Boolean(info?.canRequestAds);
        if (!this.canRequestAds) {
          console.info('[ads] consent not given; no ads will be requested');
          return false;
        }

        await admob.initialize({ initializeForTesting: false });
        return true;
      } catch (e) {
        this.canRequestAds = false;
        console.warn('[ads] consent or initialize failed; ads stay off:', e?.message || e);
        return false;
      }
    })();
    return this.initPromise;
  }

  /**
   * The settings entry a user needs to change their mind later. Google requires
   * a way back into the choice for anyone the consent form was shown to.
   */
  /**
   * Whether this user has a consent choice to return to. Only true where the
   * SDK says a privacy options form is required — showing the entry anywhere
   * else would be a menu that does nothing.
   */
  async hasPrivacyOptions() {
    const admob = plugin();
    if (!admob) return false;
    try {
      const info = await admob.requestConsentInfo();
      return info?.privacyOptionsRequirementStatus === 'REQUIRED';
    } catch (e) {
      console.warn('[ads] could not read consent state:', e?.message || e);
      return false;
    }
  }

  async showPrivacyOptions() {
    const admob = plugin();
    if (!admob) return false;
    try {
      await admob.showPrivacyOptionsForm();
      return true;
    } catch (e) {
      console.warn('[ads] privacy options form failed:', e?.message || e);
      return false;
    }
  }

  async showRewarded() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.rewarded) return { rewarded: false };
    // init() resolves consent. Without it we do not know whether this user may
    // be shown an ad at all, and asking anyway is the violation.
    await this.init();
    if (!this.canRequestAds) return { rewarded: false };
    try {
      await admob.prepareRewardVideoAd({ adId: ids.rewarded, isTesting: isTestingAds() });
      const result = await admob.showRewardVideoAd();
      // The SDK reports the reward it granted; no reward object means the
      // player closed the ad early and is owed nothing.
      return { rewarded: Boolean(result && (result.type || result.amount)) };
    } catch (e) {
      console.warn('[ads] rewarded ad failed:', e?.message || e);
      return { rewarded: false };
    }
  }

  /**
   * The banner is a native overlay pinned to the bottom of the screen, not an
   * element inside the WebView. AdBanner reserves the height so the overlay does
   * not sit on top of the keypad; this puts the ad in that space.
   */
  async showBanner() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.banner) return false;
    // init() resolves consent. Without it we do not know whether this user may
    // be shown an ad at all, and asking anyway is the violation.
    await this.init();
    if (!this.canRequestAds) return false;
    try {
      await admob.showBanner({
        adId: ids.banner,
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        isTesting: isTestingAds()
      });
      return true;
    } catch (e) {
      // A banner that fails to load must not take the screen with it. The
      // reserved space stays empty and the game keeps working.
      console.warn('[ads] banner failed:', e?.message || e);
      return false;
    }
  }

  async hideBanner() {
    const admob = plugin();
    if (!admob) return;
    try {
      await admob.hideBanner();
    } catch (e) {
      console.warn('[ads] hideBanner failed:', e?.message || e);
    }
  }

  async showInterstitial() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.interstitial) return;
    // init() resolves consent. Without it we do not know whether this user may
    // be shown an ad at all, and asking anyway is the violation.
    await this.init();
    if (!this.canRequestAds) return;
    try {
      await admob.prepareInterstitial({ adId: ids.interstitial, isTesting: isTestingAds() });
      await admob.showInterstitial();
    } catch (e) {
      console.warn('[ads] interstitial failed:', e?.message || e);
    }
  }
}
