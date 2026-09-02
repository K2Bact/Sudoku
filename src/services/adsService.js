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
// One hour. The interstitial is the only ad that takes the screen away from a
// player who did nothing wrong — they just won — and its length is the
// advertiser's to choose, not ours. Frequency is the only dial we hold, so it
// is set where the ad is a rare interruption rather than a toll on winning.
const MIN_INTERSTITIAL_INTERVAL_MS = 60 * 60 * 1000;

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

  /** Whether a purchase can actually be made. The UI must ask before offering. */
  get canPurchase() {
    return getBillingProvider().isAvailable;
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

  /** Frequency cap, so a player finishing several games is not buried in ads. */
  canShowInterstitial() {
    if (this.isAdsRemoved()) return false;
    try {
      const last = parseInt(localStorage.getItem(LAST_INTERSTITIAL_TIME_KEY) || '0', 10);
      return Date.now() - last >= MIN_INTERSTITIAL_INTERVAL_MS;
    } catch (e) {
      return false;
    }
  }

  async showInterstitial() {
    if (!this.canShowInterstitial()) return;
    try {
      localStorage.setItem(LAST_INTERSTITIAL_TIME_KEY, Date.now().toString());
    } catch (e) {
      /* a capped ad is better than a crash */
    }
    await getAdProvider().showInterstitial();
  }

  /**
   * Resolves { rewarded } when the ad finishes. Callers must check `rewarded`
   * before granting anything: a player who closes a real ad early is owed
   * nothing, and treating every return as a completed view is how reward
   * economies get drained.
   */
  async showRewarded() {
    if (this.isAdsRemoved()) return { rewarded: true };
    return getAdProvider().showRewarded();
  }
}

export const adsService = new AdsService();
export default adsService;
