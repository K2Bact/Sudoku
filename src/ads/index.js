/**
 * ads/index.js
 * The single place that decides where ads come from.
 *
 * ── Ad provider contract ──────────────────────────────────────────────────
 *   get id()            'fake' | 'admob' — which provider is live
 *   get isReal()        true ONLY if a real ad network can actually serve an
 *                       ad. The UI must branch on this instead of assuming;
 *                       a placement that claims a sponsor while this is false
 *                       is telling the player something untrue.
 *   init()              Promise; safe to call repeatedly, resolves when ready
 *   showRewarded()      Promise<{ rewarded: boolean, reason: string|null }> —
 *                       MUST resolve, whatever the ad does. `rewarded` false
 *                       means no reward is owed, and `reason` says why:
 *                       'dismissed' (closed early), 'unavailable' (no ad to
 *                       give), 'failed_to_show'. Callers tell the player —
 *                       a silent false looks like a broken button.
 *   showInterstitial()  Promise<void> — resolves when the ad is dismissed
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Same shape as transport/index.js, and for the same reason: the callers should
 * not know or care which implementation is behind it, so swapping one for the
 * other cannot turn into a rewrite of every placement.
 *
 * WHY THE DEFAULT IS FAKE — this is deliberate, not unfinished work.
 * The app is in Play closed testing. Serving real ads to testers, or generating
 * impressions and clicks from our own devices, is how AdMob accounts get
 * suspended for invalid traffic. So closed testing runs the fake provider,
 * which draws a clearly-labelled placeholder and touches no network.
 *
 * TO GO LIVE at real release, in this order:
 *   1. npm i @capacitor-community/admob && npx cap sync
 *   2. put the real unit ids in .env  (VITE_ADMOB_* — see .env.example)
 *   3. set VITE_ADS_PROVIDER=admob in .env
 * Step 3 alone is the switch; steps 1-2 are what makes it able to serve.
 * Nothing in the placements changes.
 */

import { FakeAdProvider } from './fakeAdProvider.js';
import { AdMobProvider } from './admobProvider.js';

/**
 * Build a provider by name. Exported separately from the memoised accessor so a
 * test can exercise both without reaching into module state.
 */
export function createAdProvider(choice) {
  return String(choice).toLowerCase() === 'admob' ? new AdMobProvider() : new FakeAdProvider();
}

let provider = null;

export function getAdProvider() {
  if (provider) return provider;
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  provider = createAdProvider(env.VITE_ADS_PROVIDER || 'fake');
  return provider;
}
