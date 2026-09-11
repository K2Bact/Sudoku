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
 * TO GO LIVE at real release. The order below is not a preference — the first
 * two steps are forced by Play Console, and the earlier version of this comment
 * had them backwards:
 *
 *   1. npm i @capacitor-community/in-app-purchases && npx cap sync
 *      This is what puts `com.android.vending.BILLING` in the merged manifest;
 *      the Play Billing Library declares it, we do not write it by hand.
 *      Keep VITE_BILLING_PROVIDER=none for this build.
 *
 *   2. Build and upload to a test track.
 *      Play Console refuses to create the product until an uploaded build
 *      carries that permission — the one-time products page says so and offers
 *      nothing but an upload button. So the product cannot come first.
 *
 *   3. Play Console → Play를 통한 수익 창출 → 제품 → 일회성 제품.
 *      (Google renamed "인앱 상품" to "일회성 제품".) Create it with id
 *      `remove_ads_permanent` — non-consumable, since the benefit is permanent
 *      — add at least one purchase option with a price, then ACTIVATE it.
 *      An un-activated purchase option stays 임시 and the Billing Library does
 *      not return it at all: no error, just a product that appears not to exist.
 *
 *   4. set VITE_BILLING_PROVIDER=play in .env, build, upload.
 *
 * Two uploads, and step 4 has to be the later one. `isAvailable` only asks
 * whether the plugin is present, not whether the product exists, so flipping
 * the switch before step 3 makes the Remove Ads screen reachable with no price
 * on the button and an error when it is tapped.
 *
 * Step 4 alone is the switch. No screen or service code changes.
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
