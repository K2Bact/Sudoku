/**
 * Gate 3-21 — Attendance Is Paid On Home, Not Only When The App Starts (D45).
 *
 * The reward used to be claimed once, when the app started. A phone that kept the
 * app in the background got nothing the next day until the app was killed, and a
 * day that passed with the app open was paid only after a restart (emulator,
 * 2026-10-29). Now Home claims when it is reached and when the app comes back to
 * the front while it is showing — not in a game, where a window over the board
 * would cut into a move.
 *
 * The page clock is fixed at 23:59 Seoul time and moved past midnight. Coming back
 * to the front is the document's visibilitychange, sent by hand: page.clock moves
 * time, it does not hide or show the page (Gemini G4-3, 2026-10-30).
 *   1. a cold start pays once (one window, +1 hint)
 *   2. after midnight, staying on Home, the app comes back → paid, streak 2
 *   3. the same day again → nothing
 *   4. the next day, the app comes back on a game → nothing; Home → paid, streak 3
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const { en } = await import('../../../src/i18n/locales/en.js');
const REWARD_TITLE = en.modals.dailyReward.title;
const PORT = 5198;
const URL = 'http://localhost:' + PORT;

let passed = 0;
let failed = 0;
function check(ok, message) {
  if (ok) { passed++; console.log('  PASS: ' + message); } else { failed++; console.error('  FAIL: ' + message); }
}

function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      http.get(url, (res) => (res.statusCode === 200 ? resolve() : setTimeout(poll, 200)))
        .on('error', () => (Date.now() - start > timeout ? reject(new Error('Server timeout')) : setTimeout(poll, 200)));
    };
    poll();
  });
}

// Same as 3-6: the spawned shell wrapper dies, the vite server under it keeps the port.
function shutdown(server) {
  try { server.kill(); } catch { /* already gone */ }
  try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
}

async function run() {
  console.log('======================================================');
  console.log('QA Gate 3-21: Attendance Is Paid On Home, Not Only At Start (D45)');
  console.log('======================================================');
  const server = spawn('cmd', ['/c', `npx vite preview --port ${PORT} --strictPort`], { cwd: process.cwd(), stdio: 'ignore' });
  let browser;
  try {
    await waitForServer(URL);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, timezoneId: 'Asia/Seoul' });
    const page = await context.newPage();
    await page.clock.install({ time: new Date('2026-10-30T23:59:00+09:00') });
    await page.goto(URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('suidoku_settings_v1', JSON.stringify({ guidedOffered: { classic: true, killer: true }, language: 'en' }));
      localStorage.setItem('suidoku_review_prompted', '1');
    });
    await page.reload();

    const reward = page.locator('.modal-card', { hasText: REWARD_TITLE });
    const wallet = () => page.evaluate(() => JSON.parse(localStorage.getItem('suidoku_user_wallet_v1') || '{}'));
    const closeReward = async () => { await reward.locator('.btn-primary').click(); await page.waitForTimeout(300); };
    const backToFront = () => page.evaluate(() => {
      for (const state of ['hidden', 'visible']) {
        Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      }
    });

    console.log('\n1. A cold start at 23:59 pays once');
    await reward.waitFor({ timeout: 5000 });
    await page.waitForTimeout(500);
    check(await reward.count() === 1, 'one reward window at start');
    let w = await wallet();
    check(w.hints === 4 && w.streakDays === 1 && w.lastDailyClaimDate === '2026-10-30', `start paid once — hints ${w.hints}, streak ${w.streakDays}, day ${w.lastDailyClaimDate}`);
    await closeReward();

    console.log('\n2. Past midnight, still on Home, the app comes back to the front');
    await page.clock.fastForward('02:00');
    await page.waitForTimeout(300);
    check(await reward.count() === 0, 'nothing is paid before the app comes back (no timer)');
    await backToFront();
    await reward.waitFor({ timeout: 3000 }).catch(() => {});
    w = await wallet();
    check(await reward.count() === 1 && w.streakDays === 2 && w.hints === 5,
      `coming back to the front on Home pays the new day — window ${await reward.count()}, streak ${w.streakDays}, hints ${w.hints}`);
    if (await reward.count()) await closeReward();

    console.log('\n3. The same day again');
    await backToFront();
    await page.waitForTimeout(500);
    w = await wallet();
    check(await reward.count() === 0 && w.hints === 5, `the same day pays nothing more — hints ${w.hints}`);

    console.log('\n4. The next day, coming back on a game, then Home');
    await page.click('.btn-play-new');
    await page.waitForSelector('.game-screen-wrapper .sudoku-cell', { timeout: 5000 });
    await page.clock.fastForward('24:00:00');
    await backToFront();
    await page.waitForTimeout(600);
    w = await wallet();
    check(await reward.count() === 0 && w.streakDays === 2, `coming back on a game pays nothing yet — window ${await reward.count()}, streak ${w.streakDays}`);
    await page.click('.back-home-btn');
    await page.locator('.confirm-modal-card .btn-primary').click({ timeout: 3000 });
    await reward.waitFor({ timeout: 3000 }).catch(() => {});
    w = await wallet();
    check(await reward.count() === 1 && w.streakDays === 3, `reaching Home pays the day — window ${await reward.count()}, streak ${w.streakDays}`);
  } finally {
    if (browser) await browser.close();
    shutdown(server);
  }
  console.log('\n======================================================');
  console.log(`Attendance Return Results: ${passed} PASSED / ${failed} FAILED`);
  console.log('======================================================');
  if (failed > 0) process.exit(1);
  console.log('[3-21] PASSED — attendance is paid on Home');
  process.exit(0);
}

run().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
