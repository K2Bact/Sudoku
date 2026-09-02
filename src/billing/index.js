/**
 * billing/index.js
 * The single place that decides where purchases come from.
 *
 * ── Billing provider contract ─────────────────────────────────────────────
 *   get id()          'none' | 'play'
 *   get isAvailable() true ONLY if a real charge can actually be made. The UI
 *                     must branch on this: an entry point that leads to a
 *                     purchase nobody can complete is worse than no entry
 *                     point, because the player believes they bought it.
 *   init()            Promise; safe to call repeatedly
 *   getProduct()      Promise<{ price, currency, owned } | null>
 *                     `price` is the store's own localised string ("₩3,300"),
 *                     never one we format — currency, separators and placement
 *                     all vary by country and Google already knows the answer.
 *   purchase()        Promise<{ success, reason, owned }>
 *   restore()         Promise<{ success, owned }>
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Same shape as transport/index.js and ads/index.js, and for the same reason:
 * the screen should not know which implementation is behind it.
 *
 * WHY 'none' IS THE DEFAULT — deliberate, not unfinished.
 * The app is in Play closed testing and no billing library is installed, so
 * nothing can take money. Until then the Remove Ads screen is not reachable at
 * all: `isAvailable` is false and AppScreenRouter does not route to it.
 *
 * That is the correction of a real bug, not caution. The screen shipped showing
 * a price placeholder, "💳 결제 처리 중…" for 1.5 seconds, and then "광고가
 * 영구적으로 제거되었습니다!" — a complete simulation of a payment, with the
 * product handed over free. A player could not tell that apart from a purchase.
 *
 * TO GO LIVE at real release, in this order:
 *   1. create the product in Play Console: an in-app product (managed),
 *      id `remove_ads_permanent`, then activate it
 *   2. npm i @capacitor-community/in-app-purchases && npx cap sync
 *   3. set VITE_BILLING_PROVIDER=play in .env
 * Step 3 alone is the switch. No screen or service code changes.
 */

import { NoBillingProvider } from './noBillingProvider.js';
import { PlayBillingProvider } from './playBillingProvider.js';

/** The product id the store knows. Must match Play Console exactly. */
export const REMOVE_ADS_PRODUCT_ID = 'remove_ads_permanent';

/**
 * Build a provider by name. Exported separately from the memoised accessor so
 * a test can exercise both without reaching into module state.
 */
export function createBillingProvider(choice) {
  return String(choice).toLowerCase() === 'play'
    ? new PlayBillingProvider()
    : new NoBillingProvider();
}

let provider = null;

export function getBillingProvider() {
  if (provider) return provider;
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  provider = createBillingProvider(env.VITE_BILLING_PROVIDER || 'none');
  return provider;
}
