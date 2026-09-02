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
 *   Case 1  the ad slot is labelled as a placeholder, naming no advertiser
 *   Case 2  no Remove Ads button while nothing can be charged
 *   Case 3  the purchase screen is unreachable, not merely unlinked
 *   Case 4  an existing entitlement still hides the slot
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
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en', theme: 'matte-dark' }));
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

    // ── Case 1: the slot is honest about being empty ──────────────────────
    const slot = page.locator('.ad-slot-container');
    if (!(await slot.count())) {
      failures.push('Case 1: no ad slot rendered on the game screen');
    } else {
      const text = (await slot.innerText()).replace(/\s+/g, ' ').trim();
      if (VENDORS.test(text)) {
        failures.push(`Case 1: the ad slot names an advertiser while none is served — "${text}"`);
      } else {
        console.log(`  ✅ Case 1: slot labelled without an advertiser — "${text}"`);
      }
      const provider = await slot.getAttribute('data-ad-provider');
      if (provider !== 'fake') {
        failures.push(`Case 1: expected the placeholder provider in a test build, got "${provider}"`);
      }
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
      console.log('  ✅ Case 3: the purchase screen is not reachable either');
    }

    // ── Case 4: an entitlement still hides the ad slot ────────────────────
    // Whatever grants Remove Ads later — a real purchase, a restore — the slot
    // must disappear. Verified through the flag rather than a fake purchase.
    await page.evaluate(() => localStorage.setItem('suidoku_remove_ads_purchased_v1', 'true'));
    await page.reload();
    await page.waitForTimeout(900);
    for (let i = 0; i < 3; i++) {
      if (!(await page.locator('.modal-overlay').count())) break;
      await page.locator('.modal-overlay button').last().click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
    await page.locator('.btn-resume, .btn-play-new').first().click({ timeout: 6000 });
    await page.waitForSelector('.sudoku-grid', { timeout: 6000 });
    await page.waitForTimeout(500);
    if (await page.locator('.ad-slot-container').count()) {
      failures.push('Case 4: the ad slot is still shown to a player who has Remove Ads');
    } else {
      console.log('  ✅ Case 4: the ad slot is gone once the entitlement exists');
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
