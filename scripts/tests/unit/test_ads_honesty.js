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
// The placeholder never loads an interstitial, so a win goes straight to the
// victory screen instead of pausing for an ad that does not exist.
assert.strictEqual(await fake.preloadInterstitial(), false, 'the placeholder loads no interstitial');
assert.strictEqual(fake.isInterstitialReady(), false, 'the placeholder never has an interstitial ready');
assert.deepStrictEqual(await fake.showPreparedInterstitial(), { shown: false, reason: 'not_ready' },
  'showing with nothing loaded must resolve at once, not hang the victory sequence');
console.log('  ✅ Rewards granted; no interstitial is ever pending on the placeholder');

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
  'src/hooks/useVictoryAd.js'
];
// watchRewardedAd(adsService) counts only because the helper itself is checked
// to call adsService.showRewarded — otherwise a helper could become the place
// an ad gets faked.
const helperSrc = read('src/components/common/adRewardMessage.js');
assert(/adsService\.showRewarded\s*\(/.test(helperSrc) && !/setTimeout/.test(helperSrc),
  'watchRewardedAd must call adsService.showRewarded and must not stand in for the ad itself');
for (const file of PLACEMENTS) {
  const src = read(file);
  assert(/adsService\.(showRewarded|preloadPostGameAd)\s*\(|watchRewardedAd\(adsService\)|ads:\s*adsService\b/.test(src),
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

// ── 6b. Consent gates every ad request ────────────────────────────────────
//
// The app ships to thirteen languages including five spoken across the EEA, so
// Google's consent flow is not optional: requesting a personalised ad from
// someone who has not been asked is an advertising policy violation.
//
// Deleting one `await this.init()` would leave every other test passing and ads
// going out unasked, which is why this is checked structurally rather than left
// to a device run that happened once.
console.log('▶ 6b. Consent gates every ad request');
const admobSrc = read('src/ads/adMobProvider.js');

// Scoped to init(), not the whole file. Asking whether the string appears
// anywhere passed while init() had been gutted, because hasPrivacyOptions()
// calls the same method for its own reasons. Third time today that a regex over
// a whole file let another part of that file provide the alibi.
const initAt = admobSrc.indexOf('  init() {');
assert(initAt > -1, 'AdMobProvider has no init()');
const initEnd = admobSrc.indexOf('\n  }', initAt);
const initBody = admobSrc.slice(initAt, initEnd > -1 ? initEnd : undefined);
assert(/requestConsentInfo\(/.test(initBody),
  'init() does not ask the consent SDK. Without it the first ad request goes out ' +
  'before anyone has been asked, which in the EEA is a policy violation rather ' +
  'than a bug.');

// Each of the three request paths has to be gated, not just one. Counting the
// guard was the first attempt and it counted four: init() checks the same flag
// for itself, which is correct and has nothing to do with the request paths. A
// count also cannot say WHICH path is open, so each method is read on its own.
const methodBody = (name, prefix = 'async ') => {
  const at = admobSrc.indexOf(`  ${prefix}${name}(`);
  assert(at > -1, `AdMobProvider has no ${name} — the seam is missing a placement`);
  const close = admobSrc.indexOf(`\n  }`, at);
  return admobSrc.slice(at, close > -1 ? close : undefined);
};
// The rewarded request lives in runRewarded; showRewarded only lets a second tap
// join a flow already running. Checking showRewarded's own body would pass a
// guard that is no longer on the path, so the check follows the request.
for (const [placement, method] of [
  ['showBanner', 'showBanner'],
  ['showRewarded', 'runRewarded'],
  ['preloadPostGameAd', 'preloadInterstitial'],
]) {
  assert(/canRequestAds/.test(methodBody(method)),
    `${method} requests an ad without checking canRequestAds. That serves an ad to ` +
    'a player who has not been asked, which is the whole reason this flow exists.' +
    (placement !== method ? ` (${placement} reaches the SDK through ${method}.)` : ''));
}
const showRewardedBody = methodBody('showRewarded', '');
assert(/this\.runRewarded\(/.test(showRewardedBody) && !/prepareRewardVideoAd/.test(showRewardedBody),
  'showRewarded must reach the SDK only through runRewarded, where consent is checked');
// Showing never loads. The only interstitial request is preloadInterstitial, where
// consent is checked; an interstitial that loaded on show would skip that gate.
assert(!/prepareInterstitial/.test(methodBody('showPreparedInterstitial')),
  'showPreparedInterstitial must never load an ad — loading belongs to preloadInterstitial, behind consent');
// The SDK already decides whether a request is allowed. Re-deriving it from the
// status string loses the case proven on a device: a player who DECLINES
// personalised ads ends up OBTAINED with canRequestAds still true, because
// non-personalised ads may still be served. Reading the status instead would
// silently drop the revenue of every EEA player who declines.
assert(!/status\s*===\s*'(OBTAINED|REQUIRED|NOT_REQUIRED)'/.test(admobSrc)
  || /privacyOptionsRequirementStatus\s*===\s*'REQUIRED'/.test(admobSrc),
  'AdMobProvider decides whether ads may be requested by comparing the consent ' +
  'status itself. Use canRequestAds, which is the SDK\'s own answer: declining ' +
  'personalised ads still permits non-personalised ones, and a hand-rolled ' +
  'reading of the status turns that into no ads at all.');

// Google requires a way back into the choice for anyone shown the form.
assert(/showPrivacyOptionsForm\(/.test(admobSrc),
  'No way back into the consent choice. Google requires one for any user who ' +
  'was shown the form.');
const settingsSrc = read('src/components/SettingsScreen.jsx');
assert(/hasPrivacyOptions\(\)/.test(settingsSrc),
  'SettingsScreen never asks whether a privacy options form exists, so the row ' +
  'either never appears or appears where it does nothing.');
console.log('  ✅ consent is requested, gates all three ad types, and can be revisited');

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

// ── 8. The interstitial stays rare ────────────────────────────────────────
console.log('▶ 8. The post-game interstitial is capped at an hour');
const svc = read('src/services/adsService.js')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

const capMatch = svc.match(/MIN_INTERSTITIAL_INTERVAL_MS\s*=\s*([^;]+);/);
assert(capMatch, 'adsService must define MIN_INTERSTITIAL_INTERVAL_MS');
const capMs = Function(`"use strict"; return (${capMatch[1]});`)();
assert(capMs >= 60 * 60 * 1000,
  `The post-game interstitial cooldown is ${Math.round(capMs / 60000)} minutes; ` +
  'it must be at least 60. This is the only ad that takes the screen from a ' +
  'player who did nothing but win. Shortening it is a decision to interrupt ' +
  'more often, not a tuning detail.');
console.log(`  ✅ Cooldown is ${Math.round(capMs / 60000)} minutes`);

// ── 8b. A new player is not met with an interstitial ─────────────────────
//
// Driven through the real service with a controlled clock, not read off the
// source. The shipped defect was a state the source looked fine in: the cap
// compared against a stored timestamp that a fresh install does not have, read
// it as 0, and let the first win of a brand-new player through. A regex over
// the constant could not have seen that; only running the check with empty
// storage does.
console.log('▶ 8b. New players get 48 hours before any interstitial');
{
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const { adsService } = await import('../../../src/services/adsService.js');
  const H = 60 * 60 * 1000;
  const t0 = Date.UTC(2026, 8, 17, 0, 0, 0);

  // Empty storage is a fresh install. This is the exact case that shipped.
  assert.strictEqual(adsService.canShowInterstitial(t0), false,
    'A fresh install must not be shown an interstitial on its first win — ' +
    'empty storage reads as "no ad for a very long time", which is how the ' +
    'first game a new player ever won ended in a full-screen ad');
  assert.strictEqual(adsService.markFirstSeen(t0 + 5 * H), t0,
    'First launch is recorded once; later calls must not move it forward');
  assert.strictEqual(adsService.canShowInterstitial(t0 + 47 * H + 59 * 60 * 1000), false,
    'One minute short of 48 hours is still inside the grace');
  assert.strictEqual(adsService.canShowInterstitial(t0 + 48 * H), true,
    'At 48 hours the grace ends and the normal cap takes over');
  console.log('  ✅ Silent from first launch until 48 hours, then eligible');

  // After the grace the hourly cap still applies — the grace replaces nothing.
  store.set('suidoku_last_interstitial_time_v1', String(t0 + 48 * H));
  assert.strictEqual(adsService.canShowInterstitial(t0 + 48 * H + 30 * 60 * 1000), false,
    'Half an hour after an interstitial, the hourly cap must still hold');
  assert.strictEqual(adsService.canShowInterstitial(t0 + 49 * H), true,
    'An hour after the last interstitial, the next one is allowed');
  console.log('  ✅ The hourly cap still applies once the grace is over');

  // A device clock moved backwards must not suppress ads without limit.
  store.set('suidoku_ads_first_seen_v1', String(t0 + 1000 * H));
  store.delete('suidoku_last_interstitial_time_v1');
  assert.strictEqual(adsService.markFirstSeen(t0 + 60 * H), t0 + 60 * H,
    'A first-launch time in the future must be replaced with now');
  assert.strictEqual(adsService.canShowInterstitial(t0 + 108 * H), true,
    'Reset to now, the grace must still end 48 hours later');
  console.log('  ✅ A future-dated first launch is reset, not trusted');

  store.set('suidoku_remove_ads_purchased_v1', 'true');
  assert.strictEqual(adsService.canShowInterstitial(t0 + 500 * H), false,
    'A player who removed ads must never meet the interstitial');
  console.log('  ✅ Never shown to a player who removed ads');

  delete globalThis.localStorage;
}

console.log('▶ 8c. The post-game ad is loaded, paused for and counted only when allowed');
{
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const { adsService } = await import('../../../src/services/adsService.js');
  const { getAdProvider } = await import('../../../src/ads/index.js');
  const provider = getAdProvider();
  const real = {
    preload: provider.preloadInterstitial, ready: provider.isInterstitialReady, show: provider.showPreparedInterstitial,
  };
  const H = 60 * 60 * 1000;
  const t0 = Date.UTC(2026, 8, 18, 0, 0, 0);
  let loads = 0;
  let shows = 0;
  let loaded = true;
  provider.preloadInterstitial = async () => { loads++; return true; };
  provider.isInterstitialReady = () => loaded;
  provider.showPreparedInterstitial = async () => { shows++; return { shown: true, reason: null }; };
  try {
    store.set('suidoku_ads_first_seen_v1', String(t0));
    await adsService.preloadPostGameAd(t0 + H);
    assert.strictEqual(loads, 0,
      'An ad was requested inside the 48-hour grace. It can never be shown there, so the request ' +
      'only lowers the match rate');
    assert.strictEqual(adsService.isPostGameAdReady(t0 + H), false,
      'Inside the grace the win must not pause for an ad, even if one happens to be loaded');

    const after = t0 + 49 * H;
    await adsService.preloadPostGameAd(after);
    assert.strictEqual(loads, 1, 'After the grace the post-game ad must be loaded ahead of the win');
    loaded = false;
    assert.strictEqual(adsService.isPostGameAdReady(after), false,
      'Allowed but not loaded must not pause the win — the win never waits for a load');
    const unready = await adsService.showPostGameAd(after);
    assert.strictEqual(store.get('suidoku_last_interstitial_time_v1'), undefined,
      'An ad that was not shown must not start the hourly cap');
    assert.deepStrictEqual(unready, { shown: false, reason: 'not_ready' });
    loaded = true;
    assert.strictEqual(adsService.isPostGameAdReady(after), true, 'Allowed and loaded: the win pauses for it');
    assert.deepStrictEqual(await adsService.showPostGameAd(after), { shown: true, reason: null });
    assert.strictEqual(shows, 1, 'showPostGameAd must reach the provider');
    assert.strictEqual(store.get('suidoku_last_interstitial_time_v1'), String(after),
      'A shown ad must start the hourly cap, or the next win shows another');
    assert.strictEqual(adsService.isPostGameAdReady(after + 30 * 60 * 1000), false,
      'Half an hour later the cap must keep the next win ad-free');
    await adsService.preloadPostGameAd(after + 30 * 60 * 1000);
    assert.strictEqual(loads, 1, 'Inside the cap nothing should be requested');
    console.log('  ✅ Not loaded in the grace or cap · no pause unless loaded · the cap starts only on a shown ad');

    // The victory screen comes after the ad, and its buttons carry none. An ad behind
    // Next Game is the placement AdMob's guidance names as the one to avoid.
    const container = read('src/components/modals/GameModalsContainer.jsx')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert(/victoryPhase\s*===\s*'modal'\s*&&\s*\(\s*<VictoryModal/.test(container),
      'VictoryModal must render only once the post-game ad sequence reaches its modal phase — ' +
      'otherwise the victory screen appears under the ad');
    assert(!/adsService/.test(container),
      'GameModalsContainer calls adsService again. The ad belongs before the victory screen, ' +
      'not behind its Next Game or Home buttons');
    console.log('  ✅ The victory screen waits for the ad, and its buttons carry none');
  } finally {
    Object.assign(provider, {
      preloadInterstitial: real.preload, isInterstitialReady: real.ready, showPreparedInterstitial: real.show,
    });
    delete globalThis.localStorage;
  }
}

// The grace must start at launch. canShowInterstitial also stamps first-seen,
// so without this call the clock would start at the first win and a player
// who took a day to win anything would lose that day of grace. Scoped to
// main.jsx, the file that runs once at startup.
const mainSrc = read('src/main.jsx').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
assert(/adsService\.markFirstSeen\s*\(\s*\)/.test(mainSrc),
  'main.jsx must call adsService.markFirstSeen() at startup so the 48-hour ' +
  'grace counts from first launch, not from the first win');
console.log('  ✅ The grace clock starts at app launch');

// ── 9. A rewarded ad that pays nothing says so ────────────────────────────
//
// All three rewarded placements ended in `if (!rewarded) return;`. A revive
// that found no ad changed nothing on screen, which reads as a broken button —
// and while AdMob reviews the app, "no ad available" is common. Gate 2-20 proves
// the provider always comes back; this proves the placements tell the player
// what came back.
console.log('▶ 9. Every rewarded placement tells the player when there is no reward');
{
  const { adRewardMessage, watchRewardedAd } = await import('../../../src/components/common/adRewardMessage.js');
  const t = (k) => `<${k}>`;

  assert.strictEqual(adRewardMessage({ rewarded: true, reason: null }, t), null, 'a paid-out ad needs no message');
  assert.strictEqual(adRewardMessage({ rewarded: false, reason: 'dismissed' }, t), '<modals.adReward.dismissed>',
    'closing early is something the player can choose not to do, so it gets its own message');
  for (const reason of ['unavailable', 'failed_to_show', undefined, 'something new']) {
    assert.strictEqual(adRewardMessage({ rewarded: false, reason }, t), '<modals.adReward.unavailable>',
      `reason ${reason} must fall back to "no ad right now", never to silence`);
  }

  // Caught here so a helper that lets the throw through fails on this assertion,
  // not on an unhandled "boom" that would say nothing about why it matters.
  let threw;
  try {
    threw = await watchRewardedAd({ showRewarded: () => Promise.reject(new Error('boom')) });
  } catch (e) {
    threw = { escaped: e?.message };
  }
  assert.deepStrictEqual(threw, { rewarded: false, reason: 'unavailable' },
    'a throw on the way to the ad must come back as a result, or the placement keeps its spinner');
  const garbage = await watchRewardedAd({ showRewarded: () => Promise.resolve(undefined) });
  assert.deepStrictEqual(garbage, { rewarded: false, reason: 'unavailable' },
    'a malformed result must not be read as a reward');
  console.log('  ✅ dismissed and unavailable get distinct messages; throws and garbage come back as unavailable');

  // Each placement, scoped to its own handler — a message rendered somewhere else
  // in the file is not proof that this handler reaches it.
  const handlerBody = (src, name) => {
    const at = src.indexOf(`const ${name} = async`);
    assert(at > -1, `${name} not found`);
    const end = src.indexOf('\n  };', at);
    return src.slice(at, end > -1 ? end : undefined);
  };
  const placements = [
    ['src/components/GameOverModal.jsx', 'handleWatchAd', /setAdFailure\(result\)/],
    ['src/components/HintRewardModal.jsx', 'handleWatchAd', /setAdFailure\(result\)/],
    ['src/components/DailyChallengeScreen.jsx', 'handleUnlockWithAd', /notify\(adRewardMessage\(result, t\)\)/],
  ];
  for (const [file, handler, tellsPlayer] of placements) {
    const src = read(file).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const body = handlerBody(src, handler);
    assert(/watchRewardedAd\(adsService\)/.test(body),
      `${file} ${handler} must go through watchRewardedAd, which always returns a result`);
    assert(!/if\s*\(\s*!\s*rewarded\s*\)\s*return\s*;/.test(body),
      `${file} ${handler} still returns silently when no reward is given`);
    assert(tellsPlayer.test(body),
      `${file} ${handler} does not tell the player why nothing happened. A silent ` +
      'failure looks like a broken button — and during the AdMob review, no ad is common.');
    if (/setAdFailure/.test(tellsPlayer.source)) {
      assert(/adRewardMessage\(adFailure, t\)/.test(src) && /\{adMessage && \(/.test(src),
        `${file} records the failure but never renders the message`);
    }
  }
  console.log('  ✅ Revive, hint refill and past-day unlock each tell the player when the ad pays nothing');
}

console.log('\n======================================================');
console.log('🎉 Ad honesty gate passed — nothing claims an ad it cannot serve.');
console.log('======================================================');
