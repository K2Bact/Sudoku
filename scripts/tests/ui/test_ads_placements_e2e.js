/**
 * test_ads_placements_e2e.js
 *
 * Clicks the ad placements in a real browser, because every static check in the
 * pipeline passed while these were broken.
 *
 * The Remove Ads purchase in the shipped closed-testing build called
 * `onAdsRemovedPurchased`, a prop the router never passes — it passes
 * `onPurchaseSuccess`. The TypeError was thrown inside a setTimeout, so no React
 * error boundary caught it and nothing appeared in the console UI: the
 * entitlement was written to localStorage, and then the success message and the
 * navigation home never ran. The player was left sitting on the purchase screen
 * with no feedback, having "bought" something.
 *
 * A prop-name mismatch is invisible to linting, to type-free JS, and to every
 * shape-checking gate here. The only thing that catches it is pressing the
 * button, so this gate presses the button.
 *
 * That purchase no longer exists to press. Billing now sits behind a provider
 * that reports it cannot charge, so the honest behaviour is not to offer the
 * sale at all — and the cases below check that instead. The earlier version
 * clicked through the purchase and asserted it succeeded, which it did: with no
 * billing library, no product and no charge, granting the entitlement from a
 * setTimeout. A gate can pin a bug in place as easily as it can catch one.
 *
 *   Case 0  nothing threw on the page while the cases ran
 *   Case 1  no ad slot while no advertiser is served
 *   Case 2  no Remove Ads button while nothing can be charged
 *   Case 3  the purchase screen is not rendered on the game screen
 *   Case 4  an entitlement hides a slot that is otherwise SHOWN
 *
 * Narrowed 2026-09-30 (external audit V11). Three things were claimed and not
 * shown:
 *
 *   pageErrors were collected and never read. An exception thrown during the run
 *   — the very failure in the story above — did not fail this gate. Case 0.
 *
 *   Case 4 ran in a browser where the slot never appears (Case 1 is exactly
 *   that), so "gone after the entitlement" was true before it too. It now runs
 *   on a page with a stand-in AdMob plugin, where the slot does appear, and
 *   checks that first — a control — before checking the entitlement hides it.
 *
 *   Case 3 said "unreachable". It checks that the screen is not rendered where
 *   the player is; no button leads there to try. That the route itself refuses
 *   is test_billing_honesty.js (the router is gated on canPurchase).
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const PORT = 5202;
const PREVIEW_URL = `http://localhost:${PORT}`;
const VIEWPORT = { width: 360, height: 800 };
const IS_WIN = process.platform === 'win32';
const VENDORS = /AdMob|AdSense|Sponsored|Google Ads/i;

function waitForServer(url, timeout = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, (res) => (res.statusCode === 200 ? resolve() : setTimeout(check, 200)))
        .on('error', () =>
          Date.now() - start > timeout ? reject(new Error('Preview server timeout')) : setTimeout(check, 200)
        );
    };
    check();
  });
}

async function primeStorage(page) {
  await page.goto(PREVIEW_URL);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ guidedOffered: { classic: true, killer: true }, language: 'en', theme: 'matte-dark' }));
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem(
      'suidoku_user_wallet_v1',
      JSON.stringify({ hints: 3, lastDailyClaimDate: today, streakDays: 1, totalAdsWatched: 0, history: [] })
    );
    localStorage.setItem('suidoku_review_prompted', '1');
  });
  await page.reload();
  await page.waitForTimeout(700);
  for (let i = 0; i < 3; i++) {
    if (!(await page.locator('.modal-overlay').count())) break;
    await page.locator('.modal-overlay button').last().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

/**
 * Stands in for the native AdMob plugin, so the app's AdMobProvider reports a
 * real advertiser and draws the slot in a desktop browser. Runs before the app's
 * scripts. Every method resolves; consent answers "may request". Nothing leaves
 * the page — there is no SDK behind it.
 */
function installAdMobStandIn() {
  const ok = (v = {}) => () => Promise.resolve(v);
  const AdMob = new Proxy({
    requestConsentInfo: ok({ status: 'NOT_REQUIRED', canRequestAds: true, isConsentFormAvailable: false, privacyOptionsRequirementStatus: 'NOT_REQUIRED' }),
    addListener: () => Promise.resolve({ remove: () => {} })
  }, { get: (target, key) => (key in target ? target[key] : ok()) });
  window.Capacitor = window.Capacitor || {};
  window.Capacitor.Plugins = Object.assign(window.Capacitor.Plugins || {}, { AdMob });
}

async function run() {
  console.log('======================================================');
  console.log('📺 Testing Ad Placements End-to-End (Playwright)');
  console.log('======================================================\n');

  const failures = [];
  const server = spawn(IS_WIN ? 'npx.cmd' : 'npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'ignore',
    shell: IS_WIN
  });
  let browser;

  try {
    await waitForServer(PREVIEW_URL);
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: VIEWPORT });

    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('dialog', (d) => d.accept().catch(() => {}));

    await primeStorage(page);
    await page.click('.btn-play-new', { timeout: 6000 });
    await page.waitForSelector('.sudoku-grid', { timeout: 6000 });
    await page.waitForTimeout(400);

    // ── Case 1: no advertiser, no slot ────────────────────────────────────
    //
    // This case used to require the slot to exist and to be labelled without a
    // vendor name, because the banner drew a placeholder whenever the fake
    // provider was live. The banner now renders nothing at all in that state,
    // so the honest condition is the absence of the box, not its wording.
    //
    // The vendor-name rule did not go away with it. Gate 2-10 checks the
    // adBanner block of all thirteen locales for vendor names statically,
    // which is broader than one rendered language ever was.
    const slot = page.locator('.ad-slot-container');
    const slotCount = await slot.count();
    if (slotCount > 0) {
      const text = (await slot.innerText()).replace(/\s+/g, ' ').trim();
      const provider = await slot.getAttribute('data-ad-provider');
      failures.push(
        `Case 1: an ad slot rendered with provider "${provider}" while no advertiser ` +
        `is being served — "${text}". A build with the placeholder provider must show ` +
        'no ad area at all.'
      );
    } else {
      console.log('  ✅ Case 1: no ad slot drawn while no advertiser is served');
    }

    // ── Case 2: nothing offers a purchase that cannot complete ────────────
    //
    // This used to click through the purchase and assert it succeeded. It did
    // succeed — with no billing library, no product and no charge, writing the
    // entitlement from a setTimeout. The gate was pinning the giveaway in place.
    // Now that billing is behind a provider that reports it cannot charge, the
    // correct behaviour is that the offer is not made at all.
    const buyButtons = await page.locator('.remove-ad-badge-btn').count();
    if (buyButtons > 0) {
      failures.push(
        `Case 2: ${buyButtons} Remove Ads button(s) shown while billing is unavailable — ` +
        'a purchase entry point that cannot complete leaves the player believing they bought it'
      );
    } else {
      console.log('  ✅ Case 2: no purchase offered while nothing can be charged');
    }

    // ── Case 3: the screen itself is unreachable, not just the button ─────
    if (await page.locator('.remove-ads-screen-container').count()) {
      failures.push('Case 3: the Remove Ads screen is rendered although billing is unavailable');
    } else {
      console.log('  ✅ Case 3: the purchase screen is not rendered on the game screen');
    }

    // ── Case 4: an entitlement hides a slot that would otherwise show ─────
    // Whatever grants Remove Ads later — a real purchase, a restore — the slot
    // must disappear. Verified through the flag rather than a fake purchase, on a
    // page where a stand-in AdMob plugin makes the slot real.
    const adPage = await browser.newPage({ viewport: VIEWPORT });
    adPage.on('pageerror', (e) => pageErrors.push(`(ad page) ${e.message}`));
    await adPage.addInitScript(installAdMobStandIn);
    await primeStorage(adPage);
    await adPage.click('.btn-play-new', { timeout: 6000 });
    await adPage.waitForSelector('.sudoku-grid', { timeout: 6000 });
    await adPage.waitForTimeout(500);
    const shownWithout = await adPage.locator('.ad-slot-container').count();
    if (!shownWithout) {
      failures.push(
        'Case 4 control: with the stand-in AdMob plugin and no entitlement the slot did not ' +
        'appear, so its absence after the entitlement would prove nothing. Is this build ' +
        'using VITE_ADS_PROVIDER=admob with unit ids set?'
      );
    } else {
      await adPage.evaluate(() => localStorage.setItem('suidoku_remove_ads_purchased_v1', 'true'));
      await adPage.reload();
      await adPage.waitForTimeout(900);
      for (let i = 0; i < 3; i++) {
        if (!(await adPage.locator('.modal-overlay').count())) break;
        await adPage.locator('.modal-overlay button').last().click({ timeout: 2000 }).catch(() => {});
        await adPage.waitForTimeout(300);
      }
      await adPage.locator('.btn-resume, .btn-play-new').first().click({ timeout: 6000 });
      await adPage.waitForSelector('.sudoku-grid', { timeout: 6000 });
      await adPage.waitForTimeout(500);
      if (await adPage.locator('.ad-slot-container').count()) {
        failures.push('Case 4: the ad slot is still shown to a player who has Remove Ads');
      } else {
        console.log('  ✅ Case 4: the slot shows without the entitlement (control) and is gone with it');
      }
    }

    // ── Case 0: nothing threw while the cases ran ─────────────────────────
    if (pageErrors.length) {
      failures.push(`Case 0: ${pageErrors.length} uncaught error(s) on the page — ${pageErrors.slice(0, 3).join(' | ')}`);
    } else {
      console.log('  ✅ Case 0: no uncaught error on either page');
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
    if (IS_WIN) {
      try {
        execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' });
      } catch {
        /* best effort */
      }
    }
  }

  console.log('\n======================================================');
  if (failures.length > 0) {
    console.error(`❌ ${failures.length} ad placement failure(s):\n`);
    failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
    process.exit(1);
  }
  console.log('🎉 [PASS] Ad placements verified by clicking them.');
  console.log('======================================================\n');
}

run().catch((err) => {
  console.error('\n❌ Ad placement E2E crashed:', err);
  process.exit(1);
});
