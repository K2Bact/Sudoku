/**
 * admobService.js
 * Google AdMob & AdSense SDK Integration Manager for Android / iOS / Web.
 * Uses official Google AdMob Test Ad Unit IDs.
 */

// Google Official AdMob Test Unit IDs for Android / iOS
export const ADMOB_TEST_UNITS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4486956802',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  }
};

const AD_REMOVED_KEY = 'suidoku_remove_ads_purchased_v1';
const LAST_INTERSTITIAL_TIME_KEY = 'suidoku_last_interstitial_time_v1';

class AdMobService {
  constructor() {
    this.adsRemoved = this.isAdsRemoved();
    this.minInterstitialIntervalMs = 3 * 60 * 1000; // 3 minutes frequency cap
  }

  // Check if user bought "Remove Ads"
  isAdsRemoved() {
    try {
      return localStorage.getItem(AD_REMOVED_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  // Purchase "Remove Ads"
  purchaseRemoveAds() {
    try {
      localStorage.setItem(AD_REMOVED_KEY, 'true');
      this.adsRemoved = true;
    } catch (e) {
      console.error('Failed to save purchase:', e);
    }
  }

  // Check if interstitial ad is ready (respecting frequency capping)
  canShowInterstitial() {
    if (this.adsRemoved) return false;
    const lastTime = parseInt(localStorage.getItem(LAST_INTERSTITIAL_TIME_KEY) || '0', 10);
    const now = Date.now();
    return now - lastTime >= this.minInterstitialIntervalMs;
  }

  // Show Interstitial Ad (Full-screen ad after game finish)
  showInterstitialAd(onClosed) {
    if (!this.canShowInterstitial()) {
      if (onClosed) onClosed();
      return;
    }

    localStorage.setItem(LAST_INTERSTITIAL_TIME_KEY, Date.now().toString());

    // If Capacitor / Native AdMob SDK is available
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
      window.Capacitor.Plugins.AdMob.showInterstitial().then(() => {
        if (onClosed) onClosed();
      }).catch(() => {
        if (onClosed) onClosed();
      });
    } else {
      // Simulated Interstitial Ad view for Web test
      console.log('📺 [AdMob SDK] Displaying Interstitial Ad (Test Unit ID: ca-app-pub-3940256099942544/1033173712)');
      if (onClosed) onClosed();
    }
  }

  // Show Rewarded Video Ad (Watch ad for hint, revive, or unlock)
  showRewardedAd(onRewardGranted, onClosed) {
    // Native AdMob SDK hook
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
      window.Capacitor.Plugins.AdMob.showRewardVideo().then(() => {
        if (onRewardGranted) onRewardGranted();
        if (onClosed) onClosed();
      }).catch(() => {
        if (onClosed) onClosed();
      });
    } else {
      // Simulated 2.5-second Rewarded Ad for Web test
      console.log('📺 [AdMob SDK] Displaying Rewarded Video Ad (Test Unit ID: ca-app-pub-3940256099942544/5224354917)');
      setTimeout(() => {
        if (onRewardGranted) onRewardGranted();
        if (onClosed) onClosed();
      }, 2500);
    }
  }
}

export const admobService = new AdMobService();
