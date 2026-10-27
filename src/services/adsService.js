/**
 * adsService.js
 * What the app talks to about ads. Delegates every actual ad to the provider
 * chosen in ads/index.js, and owns the one thing that is not the provider's
 * business: whether this player has removed ads.
 *
 * Renamed from admobService.js. The old name asserted a vendor the code never
 * used — there was no AdMob SDK anywhere in the project, only a table of
 * Google's public test unit ids and console.log lines that printed them as if
 * an ad had been served. A file that says AdMob while serving nothing is the
 * kind of code this project keeps having to dig out; the name now says what it
 * is, and the vendor lives in one provider behind the seam.
 *
 * `isReal` is re-exported deliberately. Any placement that draws a sponsor,
 * an advertiser name, or the word "ad" as though something were sold must ask
 * this first. See ads/index.js for the contract.
 */

import { getAdProvider } from '../ads/index.js';
import { getBillingProvider } from '../billing/index.js';

const AD_REMOVED_KEY = 'suidoku_remove_ads_purchased_v1';
const LAST_INTERSTITIAL_TIME_KEY = 'suidoku_last_interstitial_time_v1';
const FIRST_SEEN_KEY = 'suidoku_ads_first_seen_v1';
// One hour. The interstitial is the only ad that takes the screen away from a
// player who did nothing wrong — they just won — so it is set where the ad is a
// rare interruption rather than a toll on winning.
//
// This used to say frequency was the only dial we hold and the ad's length was
// the advertiser's. Not quite: AdMob's app-level "High-engagement ads" setting
// caps how long an interstitial can keep the skip button away — 12 seconds
// when on (the default), 5 when off. It was switched off on 2026-09-17. That
// dial lives in the AdMob console, not in this file.
const MIN_INTERSTITIAL_INTERVAL_MS = 60 * 60 * 1000;
// 48 hours from first launch before any interstitial.
//
// The cap above measured time since the last interstitial, and on a fresh
// install there is no last interstitial — the stored value is absent, read as
// 0, and "now minus 0" is always more than an hour. So the very first game a
// new player ever won ended in a full-screen ad. Someone installing the app
// saw that on their first win. A first session is where a player decides
// whether to keep the app; an ad there is the likeliest thing to end it.
//
// The clock starts at first launch, not first win, so it counts from install.
// Players who already had the app get the same 48 hours from the first launch
// of the version that introduced this — there is no install time to read.
// A reinstall wipes localStorage and restarts the grace; without a server
// there is no record that survives that, and erring toward fewer ads is the
// cheaper mistake.
const NEW_PLAYER_GRACE_MS = 48 * 60 * 60 * 1000;

class AdsService {
  /** Which provider is live: 'fake' during closed testing, 'admob' at release. */
  get providerId() {
    return getAdProvider().id;
  }

  /**
   * Whether a real advertiser is actually being served. False on the fake
   * provider, and false on AdMob until the plugin and unit ids are in place.
   */
  get isReal() {
    return getAdProvider().isReal;
  }

  isAdsRemoved() {
    try {
      return localStorage.getItem(AD_REMOVED_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  /**
   * Whether a purchase can actually be made. The UI must ask before offering.
   *
   * A billing library being present is not enough. Remove Ads is not sold in
   * Japan (a paid item there needs a 特定商取引法 notice; decided 2026-09-19,
   * BACKLOG M-1), and for an account the product is not offered to the store
   * returns nothing. Offering the button anyway leads to a price-less screen
   * whose only outcome is "purchase failed". So this stays false until the
   * store has actually named the product for this account — checkOffer().
   */
  get canPurchase() {
    return getBillingProvider().isAvailable && this.offered === true;
  }

  /**
   * Ask the store once whether Remove Ads is on sale to this account. A miss
   * is not cached: a network failure must not hide the button for the rest of
   * the session, so the next caller asks again.
   */
  checkOffer() {
    if (!getBillingProvider().isAvailable) return Promise.resolve(false);
    if (this.offered === true) return Promise.resolve(true);
    if (!this.offerPromise) {
      this.offerPromise = getBillingProvider().getProduct()
        .then((p) => {
          this.offered = Boolean(p);
          if (!this.offered) this.offerPromise = null;
          return this.offered;
        })
        .catch(() => {
          this.offerPromise = null;
          return false;
        });
    }
    return this.offerPromise;
  }

  /** The store's own localised price string, or null when nothing can be sold. */
  async getRemoveAdsProduct() {
    return getBillingProvider().getProduct();
  }

  /**
   * Buy Remove Ads. The entitlement is written ONLY after the store confirms
   * the purchase — never on the way there.
   *
   * The version this replaced wrote the flag first and announced success 1.5
   * seconds later without a store, a product or a charge. Anything that grants
   * before confirmation is not a purchase, it is a giveaway wearing one's
   * clothes, and the player cannot tell the difference.
   */
  async purchaseRemoveAds() {
    const res = await getBillingProvider().purchase();
    if (res.success && res.owned) this.setAdsRemoved(true);
    return res;
  }

  /**
   * A permanent product must survive a reinstall or a new phone, and our
   * localStorage flag does not. The store is the record.
   */
  async restoreRemoveAds() {
    const res = await getBillingProvider().restore();
    if (res.owned) this.setAdsRemoved(true);
    return res;
  }

  setAdsRemoved(removed) {
    try {
      if (removed) localStorage.setItem(AD_REMOVED_KEY, 'true');
      else localStorage.removeItem(AD_REMOVED_KEY);
    } catch (e) {
      console.warn('[ads] could not persist the remove-ads entitlement:', e?.message || e);
    }
  }

  /**
   * Record when this player first opened the app, once. Returns that time.
   *
   * Called at startup so the grace counts from launch; canShowInterstitial
   * also calls it, so a missed startup call shortens nothing — it only starts
   * the clock later. A value in the future (the device clock was moved back)
   * is replaced with now: left alone it would suppress ads until that future
   * moment plus 48 hours, with no upper bound on how far away that is.
   */
  markFirstSeen(now = Date.now()) {
    try {
      const stored = parseInt(localStorage.getItem(FIRST_SEEN_KEY) || '', 10);
      if (Number.isFinite(stored) && stored > 0 && stored <= now) return stored;
      localStorage.setItem(FIRST_SEEN_KEY, String(now));
    } catch {
      /* storage unavailable: treat this launch as the first */
    }
    return now;
  }

  /** New-player grace, then a frequency cap, so no one is buried in ads. */
  canShowInterstitial(now = Date.now()) {
    if (this.isAdsRemoved()) return false;
    if (now - this.markFirstSeen(now) < NEW_PLAYER_GRACE_MS) return false;
    try {
      const last = parseInt(localStorage.getItem(LAST_INTERSTITIAL_TIME_KEY) || '0', 10);
      return now - last >= MIN_INTERSTITIAL_INTERVAL_MS;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load the post-game interstitial ahead of the win, if one would be allowed.
   *
   * Called while a game is in progress. Nothing is loaded for a player inside
   * the grace or the cap, or who removed ads — an ad that cannot be shown should
   * not be requested.
   */
  preloadPostGameAd(now = Date.now()) {
    if (!this.canShowInterstitial(now)) return Promise.resolve(false);
    return Promise.resolve(getAdProvider().preloadInterstitial()).catch(() => false);
  }

  /**
   * Whether the win should pause for an interstitial: allowed now AND already
   * loaded. The win never waits for a load — AdMob warns that an ad arriving
   * late lands on a player who has moved on, and this game is tapped quickly.
   */
  isPostGameAdReady(now = Date.now()) {
    return this.canShowInterstitial(now) && Boolean(getAdProvider().isInterstitialReady(now));
  }

  /** Show the loaded post-game interstitial; resolves { shown, reason } after it closes. */
  async showPostGameAd(now = Date.now()) {
    if (!this.isPostGameAdReady(now)) return { shown: false, reason: 'not_ready' };
    try {
      localStorage.setItem(LAST_INTERSTITIAL_TIME_KEY, now.toString());
    } catch {
      /* a capped ad is better than a crash */
    }
    try {
      return await getAdProvider().showPreparedInterstitial();
    } catch {
      return { shown: false, reason: 'failed_to_show' };
    }
  }

  /**
   * Resolves { rewarded } when the ad finishes. Callers must check `rewarded`
   * before granting anything: a player who closes a real ad early is owed
   * nothing, and treating every return as a completed view is how reward
   * economies get drained.
   */
  /**
   * The banner is a native overlay on Android, so this is not "render an ad
   * into a div" — it is "put an ad in the space the screen has reserved".
   * Returns whether one was actually placed, so a caller never has to guess.
   */
  async hasPrivacyOptions() {
    return getAdProvider().hasPrivacyOptions();
  }

  /** The ad SDK's consent state, read without a form (null if none) — Analytics follows it. */
  async consentInfo() {
    return getAdProvider().consentInfo?.() ?? null;
  }

  async showPrivacyOptions() {
    return getAdProvider().showPrivacyOptions();
  }

  async showBanner() {
    return getAdProvider().showBanner();
  }

  async hideBanner() {
    return getAdProvider().hideBanner();
  }

  async showRewarded() {
    if (this.isAdsRemoved()) return { rewarded: true, reason: null };
    return getAdProvider().showRewarded();
  }
}

export const adsService = new AdsService();
export default adsService;
