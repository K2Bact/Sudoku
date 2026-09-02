/**
 * test_ads_honesty.js
 *
 * The app must never tell a player an ad is being served when none is.
 *
 * What this gate exists to stop, all of it found in the shipped closed-testing
 * build on 2026-09-02:
 *
 *   - The bottom banner printed "Official Google AdMob Sponsored Ad" beside an
 *     "AdMob" tag, in thirteen languages, while no AdMob SDK existed anywhere in
 *     the project. To a player that is indistinguishable from a real ad.
 *   - admobService.showRewardedAd and showInterstitialAd had NO callers. Each of
 *     the four ad placements ran its own setTimeout and granted the reward
 *     unconditionally, so the ad service was decorative.
 *   - showInterstitial had no caller at all, while the Remove Ads screen sold
 *     "remove post-game interstitial ads" for money.
 *
 * The rule the gate enforces: a placement may claim an advertiser only when the
 * provider says one is really there, and every placement must go through the
 * provider rather than simulating an ad itself.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAdProvider } from '../../../src/ads/index.js';
import { FakeAdProvider } from '../../../src/ads/fakeAdProvider.js';
import { AdMobProvider } from '../../../src/ads/admobProvider.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

console.log('======================================================');
console.log('📺 Testing Ad Honesty & Provider Contract');
console.log('======================================================\n');

// ── 1. The seam picks the right provider ──────────────────────────────────
console.log('▶ 1. The provider seam');
assert(createAdProvider('fake') instanceof FakeAdProvider, 'fake must select FakeAdProvider');
assert(createAdProvider('admob') instanceof AdMobProvider, 'admob must select AdMobProvider');
assert(createAdProvider(undefined) instanceof FakeAdProvider,
  'An unset or unknown provider must fall back to the placeholder, never to a ' +
  'real ad network the build was not configured for');
console.log('  ✅ fake / admob / unset all resolve as intended');

// ── 2. Neither provider claims more than it can do ────────────────────────
console.log('▶ 2. isReal tells the truth');
assert.strictEqual(new FakeAdProvider().isReal, false,
  'The placeholder must never report itself as a real ad');
assert.strictEqual(new AdMobProvider().isReal, false,
  'AdMob must report false with no plugin and no unit ids — selecting the ' +
  'provider is not the same as being able to serve, and claiming otherwise is ' +
  'the same lie in the other direction');
console.log('  ✅ Neither provider overstates itself');

// ── 3. The placeholder still grants rewards ───────────────────────────────
console.log('▶ 3. The reward path keeps working');
const fake = new FakeAdProvider();
const result = await fake.showRewarded();
assert.strictEqual(result.rewarded, true,
  'Hints, revives and past-puzzle unlocks all depend on this resolving; a ' +
  'placeholder that never rewards silently breaks three features');
await fake.showInterstitial();
console.log('  ✅ Rewards granted, interstitial resolves');

// ── 4. No placement claims a sponsor while the default is fake ────────────
console.log('▶ 4. No vendor or sponsor claims in ad UI strings');
const VENDORS = /AdMob|AdSense|Google\s+Ads|공식\s*후원|Sponsored|patrocinado|sponsoris|gesponsert|спонсор/i;
const locales = fs.readdirSync(path.join(ROOT, 'src/i18n/locales'), { withFileTypes: true })
  .filter((d) => d.isDirectory()).map((d) => d.name);
assert(locales.length >= 13, `Expected 13+ locales, found ${locales.length}`);

for (const loc of locales) {
  const screens = read(`src/i18n/locales/${loc}/screens.js`);
  const banner = screens.match(/adBanner: \{[^}]*\}/);
  assert(banner, `${loc}: adBanner block missing`);
  assert(!VENDORS.test(banner[0]),
    `${loc}: the ad banner names an advertiser (${banner[0].slice(0, 90)}...). ` +
    'The slot may only be labelled as a placeholder while no real ad is served.');
}
console.log(`  ✅ ${locales.length} locales label the slot without naming an advertiser`);

// ── 5. Every placement goes through the service ───────────────────────────
console.log('▶ 5. No placement simulates its own ad');
const PLACEMENTS = [
  'src/components/GameOverModal.jsx',
  'src/components/HintRewardModal.jsx',
  'src/components/DailyChallengeScreen.jsx',
  'src/components/modals/GameModalsContainer.jsx'
];
for (const file of PLACEMENTS) {
  const src = read(file);
  assert(/adsService\.(showRewarded|showInterstitial)\s*\(/.test(src),
    `${file} does not call adsService — an ad placement that resolves itself is ` +
    'not an ad placement, and will keep working identically after AdMob is ' +
    'switched on, i.e. it will never show an ad');
  assert(!/Simulate.*(ad|AdMob)/i.test(src),
    `${file} still contains a simulated ad; the placeholder belongs in the ` +
    'provider, not in the placement');
}
console.log(`  ✅ All ${PLACEMENTS.length} placements delegate to adsService`);

// ── 6. The banner asks before it labels ───────────────────────────────────
console.log('▶ 6. The banner branches on isReal');
const bannerSrc = read('src/components/AdBanner.jsx');
assert(/adsService\.isReal/.test(bannerSrc),
  'AdBanner must consult adsService.isReal before drawing any ad label');
// Comments are where the history of this bug is recorded and must stay readable;
// what matters is that no vendor name can reach the screen.
const bannerCode = bannerSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
assert(!VENDORS.test(bannerCode),
  'AdBanner has a vendor name in code that can render. The slot may name an ' +
  'advertiser only when adsService.isReal says one is actually being served.');
console.log('  ✅ The banner labels itself according to what is really served');

// ── 7. The old lying service is gone ──────────────────────────────────────
console.log('▶ 7. admobService is gone, not just bypassed');
assert(!fs.existsSync(path.join(ROOT, 'src/services/admobService.js')),
  'src/services/admobService.js still exists. It named a vendor it never used ' +
  'and its ad methods had no callers; leaving it invites a caller to come back.');
const stragglers = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx)$/.test(e.name) && read(path.relative(ROOT, p)).includes('admobService')) {
      stragglers.push(path.relative(ROOT, p));
    }
  }
})(path.join(ROOT, 'src'));
assert.deepStrictEqual(stragglers.filter((f) => !f.endsWith('adsService.js')), [],
  `Still importing the deleted admobService: ${stragglers.join(', ')}`);
console.log('  ✅ No references remain');

console.log('\n======================================================');
console.log('🎉 Ad honesty gate passed — nothing claims an ad it cannot serve.');
console.log('======================================================');
