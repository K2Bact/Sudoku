/**
 * test_billing_honesty.js
 *
 * Nothing may be sold that cannot be charged for, and nothing may be granted
 * that was not.
 *
 * What shipped in closed testing: the Remove Ads screen showed a button reading
 * "영구 제거하기 ({price})" — the placeholder itself, in all thirteen languages —
 * then "💳 결제 처리 중…" for 1.5 seconds, then "광고가 영구적으로 제거되었습니다!".
 * There was no billing library in the project, no product in Play Console, and
 * no charge. `purchaseRemoveAds()` wrote a localStorage flag. A player could not
 * tell that apart from a purchase, and the developer earned nothing.
 *
 * The rules this pins:
 *   1. the default provider cannot charge, and says so
 *   2. neither provider grants anything without the store confirming ownership
 *   3. the UI asks canPurchase before offering an entry point OR the screen
 *   4. the price string is never assembled in app code
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBillingProvider, REMOVE_ADS_PRODUCT_ID } from '../../../src/billing/index.js';
import { NoBillingProvider } from '../../../src/billing/noBillingProvider.js';
import { PlayBillingProvider } from '../../../src/billing/playBillingProvider.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/**
 * Comments are where this project records what went wrong before, so they name
 * the very things these checks forbid. Reading them as code makes a gate fail
 * on its own history — which it did here, on the sentence explaining that a
 * setTimeout used to live in the purchase screen.
 */
const codeOf = (p) => read(p)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

console.log('======================================================');
console.log('💳 Testing Billing Honesty');
console.log('======================================================\n');

// ── 1. The seam ───────────────────────────────────────────────────────────
console.log('▶ 1. The provider seam');
assert(createBillingProvider('none') instanceof NoBillingProvider);
assert(createBillingProvider('play') instanceof PlayBillingProvider);
assert(createBillingProvider(undefined) instanceof NoBillingProvider,
  'An unset provider must fall back to the one that cannot charge — never to a ' +
  'store the build was not configured for');
console.log('  ✅ none / play / unset all resolve as intended');

// ── 2. Neither provider claims it can charge when it cannot ───────────────
console.log('▶ 2. isAvailable tells the truth');
assert.strictEqual(new NoBillingProvider().isAvailable, false,
  'The no-billing provider must never report that it can take money');
assert.strictEqual(new PlayBillingProvider().isAvailable, false,
  'Play billing must report false with no plugin installed — selecting the ' +
  'provider is not the same as being able to charge');
console.log('  ✅ Neither provider overstates itself');

// ── 3. Nothing is granted without a confirmed purchase ────────────────────
console.log('▶ 3. No entitlement without the store');
const none = new NoBillingProvider();
const bought = await none.purchase();
assert.strictEqual(bought.success, false, 'A purchase with no store must fail');
assert.strictEqual(bought.owned, false, 'A failed purchase must not report ownership');
assert.strictEqual((await none.restore()).owned, false, 'Nothing to restore without a store');
assert.strictEqual(await none.getProduct(), null, 'No product exists to price');
console.log('  ✅ Refuses to sell, refuses to grant');

const service = codeOf('src/services/adsService.js');
assert(/if\s*\(res\.success\s*&&\s*res\.owned\)\s*this\.setAdsRemoved\(true\)/.test(service),
  'adsService.purchaseRemoveAds must write the entitlement only when the store ' +
  'confirms BOTH success and ownership. Writing it first, or on success alone, ' +
  'is what turned this screen into a giveaway that announced itself as a sale.');
assert(!/setTimeout/.test(codeOf('src/components/RemoveAdsScreen.jsx')),
  'The purchase screen must not simulate a wait. It is busy exactly as long as ' +
  'the store takes; a timer there is theatre that once ended in a free grant.');
console.log('  ✅ The entitlement follows the store, not a timer');

// ── 4. Nothing is offered that cannot be bought ───────────────────────────
console.log('▶ 4. The UI asks before offering');
assert(/adsService\.canPurchase/.test(codeOf('src/components/AdBanner.jsx')),
  'AdBanner must hide the Remove Ads button when no purchase can complete');
assert(/adsService\.canPurchase/.test(codeOf('src/components/screens/AppScreenRouter.jsx')),
  'The router must not route to the Remove Ads screen when no purchase can ' +
  'complete — the hidden button is one lock, the route is the second');
console.log('  ✅ Entry point and route both gated on canPurchase');

// ── 5. The price comes from the store ─────────────────────────────────────
console.log('▶ 5. The price is never assembled here');
const screen = codeOf('src/components/RemoveAdsScreen.jsx');
assert(/product\?\.price/.test(screen),
  'The screen must render the store\'s own localised price string');
assert(!/[₩$€¥]\s*\{|toLocaleString\(|\bprice\s*\+/.test(screen),
  'Currency symbols, separators and placement differ by country and the store ' +
  'already knows the answer. Formatting a price here is how "({price})" reached ' +
  'the screen in the first place.');
console.log('  ✅ The store\'s string is rendered as-is');

console.log(`▶ 6. Product id is pinned: ${REMOVE_ADS_PRODUCT_ID}`);
assert(/^[a-z0-9_]+$/.test(REMOVE_ADS_PRODUCT_ID),
  'Play Console product ids are lowercase, digits and underscores only');
console.log('  ✅ Matches what Play Console will accept');

console.log('\n======================================================');
console.log('🎉 Billing gate passed — nothing sold that cannot be charged.');
console.log('======================================================');
