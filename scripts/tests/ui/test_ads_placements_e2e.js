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
 *   Case 1  the ad slot is labelled as a placeholder, naming no advertiser
 *   Case 2  buying Remove Ads completes, navigates away, and raises no error
 *   Case 3  the slot is gone afterwards, i.e. the purchase did something
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
  const server = spawn(IS_WIN ? 'npx.cmd' : 'npx', ['vite', 'preview', '--port', String(PORT)], {
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

    // ── Case 2: the purchase completes instead of stranding the player ────
    await page.locator('.remove-ad-badge-btn').click({ timeout: 5000 });
    await page.waitForTimeout(700);
    if (!(await page.locator('.remove-ads-screen-container').count())) {
      failures.push('Case 2: the Remove Ads screen did not open');
    } else {
      const errorsBefore = pageErrors.length;
      await page.locator('.purchase-btn').click({ timeout: 5000 });
      await page.waitForTimeout(3000);

      const stranded = (await page.locator('.remove-ads-screen-container').count()) > 0;
      const newErrors = pageErrors.slice(errorsBefore);
      if (newErrors.length) {
        failures.push(`Case 2: buying raised ${newErrors.length} page error(s): ${newErrors.join(' | ')}`);
      }
      if (stranded) {
        failures.push('Case 2: the player is still on the purchase screen after buying — the flow does not complete');
      }
      const flag = await page.evaluate(() => localStorage.getItem('suidoku_remove_ads_purchased_v1'));
      if (flag !== 'true') {
        failures.push(`Case 2: the entitlement was not recorded (flag=${flag})`);
      }
      if (!newErrors.length && !stranded && flag === 'true') {
        console.log('  ✅ Case 2: purchase completes, navigates away, no errors');
      }
    }

    // ── Case 3: the purchase actually removes the slot ────────────────────
    await page.waitForTimeout(400);
    if (await page.locator('.ad-slot-container').count()) {
      failures.push('Case 3: the ad slot is still shown after Remove Ads was purchased');
    } else {
      console.log('  ✅ Case 3: the ad slot is gone after purchase');
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
