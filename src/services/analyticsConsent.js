import { Capacitor } from '@capacitor/core';

/**
 * analyticsConsent.js — whether Google Analytics for Firebase may identify this install.
 *
 * Added 2026-10-22. The manifest starts every consent type denied (AndroidManifest.xml) and
 * turns off Analytics' own reading of the advertising ID. This grants analytics_storage — and
 * only that — once the ad consent check (Google's UMP, the same one AdMob uses) says the
 * player is outside the regions where Google asks for consent: privacy options NOT_REQUIRED.
 * Where it is REQUIRED (the EEA, the UK, Switzerland) or UNKNOWN, or the check could not be
 * read, it stays denied — the app asks those players about ads, not about analytics, and an
 * answer to one is not an answer to the other. Ad storage, ad user data and ad
 * personalization are never granted: Analytics is not used for ads.
 *
 * Gate 2-14 holds the manifest defaults, this rule and the privacy policy together.
 */

/** The rule on its own, for the gate: only an explicit NOT_REQUIRED allows it. */
export function analyticsStorageAllowed(info) {
  return info?.privacyOptionsRequirementStatus === 'NOT_REQUIRED';
}

/** Grant analytics_storage when `info` allows it. Returns whether it was granted. Never throws. */
export async function applyAnalyticsConsent(info) {
  if (!analyticsStorageAllowed(info) || !Capacitor.isNativePlatform()) return false;
  try {
    const { FirebaseAnalytics, ConsentType, ConsentStatus } = await import('@capacitor-firebase/analytics');
    await FirebaseAnalytics.setConsent({ type: ConsentType.AnalyticsStorage, status: ConsentStatus.Granted });
    return true;
  } catch (e) {
    console.warn('[analytics] consent not applied:', e?.message || e);
    return false;
  }
}

/**
 * At launch: read the consent state without showing any form, then apply it. The ad SDK
 * starts later (the first banner), and until something is granted every event goes out
 * without an identifier.
 */
export async function syncAnalyticsConsent(readConsentInfo) {
  try {
    return await applyAnalyticsConsent(await readConsentInfo());
  } catch {
    return false;
  }
}
