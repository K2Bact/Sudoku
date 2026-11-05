import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const { en } = await import('../../../src/i18n/locales/en.js');
const EXIT_PROMPT = en.common.exitAppPrompt;

const PORT = 5197;
const PREVIEW_URL = 'http://localhost:' + PORT;

function waitForServer(url, timeout = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) resolve();
        else setTimeout(check, 200);
      }).on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Server timeout'));
        else setTimeout(check, 200);
      });
    };
    check();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  PASS: ' + message);
    passed++;
  } else {
    console.error('  FAIL: ' + message);
    failed++;
  }
}


/**
 * process.exit() skips finally, so cleanup has to happen before it. Every exit
 * in this file goes through here.
 *
 * Killing the spawned process is not enough on Windows: it is spawned through a
 * shell wrapper, so the signal stops the wrapper and the vite server underneath
 * keeps the port. The port is what the next run needs back, so free that.
 */
function shutdownPreview(viteProcess) {
  try { viteProcess.kill(); } catch (e) { /* already gone */ }
  try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch (e) { /* nothing listening */ }
}

async function run() {
  console.log('======================================================');
  console.log('QA Gate: Android Back Button & Radar Cancel Audit');
  console.log('======================================================');

  console.log('Starting Vite preview server on port ' + PORT);
  const viteProcess = spawn('cmd', ['/c', 'npx vite preview --port ' + PORT + ' --strictPort'], {
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  try {
    await waitForServer(PREVIEW_URL);
    console.log('Connected to Vite Server');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 360, height: 800 },
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();
    await page.goto(PREVIEW_URL);
    await page.evaluate(() => {
      localStorage.setItem('suidoku_review_prompted', 'done');
      localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en' }));
      localStorage.setItem('suidoku_daily_reward_v1', JSON.stringify({ claimedDate: new Date().toISOString().slice(0, 10) }));
    });
    await page.reload();
    await page.waitForTimeout(600);

    console.log('\nSTEP 1: Enter 1v1 Battle Lobby...');
    await page.click('.battle-card-banner', { force: true });
    await page.waitForTimeout(400);

    const lobbyHeader = await page.waitForSelector('.battle-lobby-container', { timeout: 2000 });
    assert(lobbyHeader !== null, 'Entered 1v1 Battle Lobby successfully');

    console.log('\nSTEP 2: Start Quick Match Search (Radar View)...');
    await page.click('.primary-battle-card button', { force: true });
    await page.waitForTimeout(400);

    const radarView = await page.waitForSelector('.match-searching-wrapper', { timeout: 2000 });
    assert(radarView !== null, 'Match searching radar screen is actively displayed');

    console.log('\nSTEP 3: Press Hardware Back (Escape) while searching...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);

    const radarClosed = await page.waitForSelector('.match-searching-wrapper', { timeout: 500 }).catch(() => null);
    assert(radarClosed === null, 'Match searching radar view closed cleanly on Back press');

    const stillInLobby = await page.waitForSelector('.primary-battle-card', { timeout: 1000 }).catch(() => null);
    assert(stillInLobby !== null, 'User remains in Battle Lobby (same destination as Cancelar button)');

    const notInHome = await page.waitForSelector('.hero-brain-card', { timeout: 500 }).catch(() => null);
    assert(notInHome === null, 'User was NOT improperly kicked to Home screen');

    console.log('\nSTEP 4: Press Hardware Back (Escape) from Battle Lobby idle state...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);

    const backInHome = await page.waitForSelector('.battle-card-banner', { timeout: 2000 }).catch(() => null);
    assert(backInHome !== null, 'User returned to Home screen on second Back press');

    // 2026-10-01, both found on a Flip5 — neither had ever worked.
    console.log('\nSTEP 5: One Back on Home says "press again" and stays...');
    await page.waitForTimeout(700); // past the 600ms debounce
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const toast = await page.locator('.theme-toast-banner').textContent({ timeout: 1000 }).catch(() => null);
    assert(toast === EXIT_PROMPT, `The first Back on Home shows the exit prompt ("${toast}")`);
    assert(await page.locator('.battle-card-banner').count() === 1, 'The first Back on Home keeps the app on Home');

    console.log('\nSTEP 6: After a battle result is closed with Back, Back still works...');
    await page.waitForTimeout(2200); // let the exit window close, so this Back cannot exit
    await page.click('.ai-card-banner');
    await page.click('.btn-battle-action', { timeout: 3000 });
    await page.waitForSelector('.game-screen-wrapper', { timeout: 5000 });
    const room = await page.evaluate(() => ({ p: window.suidokuBattle.currentRoom.puzzle, s: window.suidokuBattle.currentRoom.solution }));
    const empties = [];
    for (let i = 0; i < 81; i++) if (!room.p[Math.floor(i / 9)][i % 9]) empties.push(i);
    for (const cell of empties.slice(0, 3)) {
      await page.locator('.game-screen-wrapper .sudoku-cell').nth(cell).click();
      await page.locator('.number-pad .num-btn').nth(room.s[Math.floor(cell / 9)][cell % 9] % 9).click();
      await page.waitForTimeout(150);
    }
    const result = await page.waitForSelector('.battle-result-card', { timeout: 8000 }).catch(() => null);
    assert(result !== null, 'Three wrong digits end the AI match on its result screen');
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    assert(await page.locator('.battle-result-card').count() === 0, 'Back on the battle result closes it');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    assert(await page.locator('.battle-card-banner').count() === 1, 'The next Back goes Home — not stuck on the battle screen');

    // D43 (release 32 on the emulator, 2026-10-29): windows a screen opens with its
    // own state were invisible to the back key. On Home it said "press again to
    // exit" with the window still up, and a second press closed the app.
    console.log('\nSTEP 7: Back closes the windows a screen opened itself (D43)...');
    const p2 = await context.newPage();
    await p2.goto(PREVIEW_URL);
    await p2.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en' }));
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      localStorage.setItem('suidoku_user_wallet_v1', JSON.stringify({ hints: 3, lastDailyClaimDate: today, streakDays: 1, totalAdsWatched: 0, history: [] }));
      localStorage.setItem('suidoku_review_prompted', '1');
    });
    await p2.reload();
    await p2.waitForSelector('.battle-card-banner', { timeout: 5000 });
    await p2.waitForTimeout(700);
    const back = async () => { await p2.keyboard.press('Escape'); await p2.waitForTimeout(700); };
    const onHome = async () => (await p2.locator('.battle-card-banner').count()) === 1;
    const exitToast = async () => (await p2.locator('.theme-toast-banner').allTextContents()).includes(EXIT_PROMPT);

    // A window on Home, closed by Back: gone, Home stays, no exit prompt.
    const homeWindow = async (label, open, windowSel) => {
      await open();
      await p2.waitForSelector(windowSel, { timeout: 2000 });
      await back();
      assert(await p2.locator(windowSel).count() === 0, `Back closes the ${label}`);
      assert(await onHome() && !(await exitToast()), `Back on the ${label} keeps Home with no exit prompt`);
    };

    await homeWindow('Home rules card', () => p2.click('.variant-rules-btn'), '.variant-rules-card');
    await p2.keyboard.press('Escape');
    await p2.waitForTimeout(300);
    assert(await exitToast(), 'After the rules card closed, the next Back on Home reaches the exit prompt — the window left the list');
    await p2.waitForTimeout(2200); // let the exit window close, so no later Back can exit

    await homeWindow('rival modes note', () => p2.click('.rival-info-btn:not(.variant-rules-btn)'), '.rival-info-popup');
    await homeWindow('locked Ghost note', () => p2.click('.ghost-chip'), '.locked-mode-popup[role="alert"]');

    await p2.click('.variant-option[data-variant="killer"]');
    await homeWindow('first killer rules', () => p2.click('.btn-play-new'), '.variant-rules-card[data-variant="killer"]');
    assert(await p2.locator('.game-screen-wrapper').count() === 0, 'Back on the first killer rules starts no game');
    await p2.click('.variant-option[data-variant="classic"]');

    console.log('\nSTEP 8: The daily unlock window and the settings privacy page...');
    await p2.click('.daily-card-banner');
    await p2.waitForSelector('.calendar-day-btn', { timeout: 3000 });
    if (await p2.locator('.calendar-day-btn.missed').count() > 0) {
      await p2.locator('.calendar-day-btn.missed').first().click();
      const unlock = p2.locator('.modal-card', { hasText: en.daily.unlockModalTitle });
      await unlock.waitFor({ timeout: 2000 });
      await back();
      assert(await unlock.count() === 0, 'Back closes the daily unlock window');
      assert(await p2.locator('.calendar-day-btn').count() > 0, 'Back on the daily unlock window stays on the calendar');
    } else {
      console.log('  (the 1st of the month has no past day to unlock — skipped)');
    }
    await back();
    assert(await onHome(), 'The next Back leaves the daily screen for Home');

    await p2.click(`button[title="${en.home.nav.settings}"]`);
    await p2.waitForSelector('.settings-row.clickable', { timeout: 3000 });
    await p2.locator('.settings-row.clickable').filter({ has: p2.locator('.settings-icon-badge.green') }).first().click();
    await p2.waitForSelector('.privacy-modal-card', { timeout: 2000 });
    await back();
    assert(await p2.locator('.privacy-modal-card').count() === 0, 'Back closes the privacy page');
    assert(await p2.locator('.settings-row.clickable').count() > 0, 'Back on the privacy page stays in Settings');
    await back();
    assert(await onHome(), 'The next Back leaves Settings for Home');

    console.log('\nSTEP 9: In a game — the leave question, then a game over...');
    await p2.click('.btn-play-new');
    await p2.waitForSelector('.game-screen-wrapper .sudoku-cell', { timeout: 5000 });
    await p2.waitForTimeout(500);
    await p2.click('.back-home-btn');
    await p2.waitForSelector('.confirm-modal-card', { timeout: 2000 });
    await back();
    assert(await p2.locator('.confirm-modal-card').count() === 0, 'Back answers the leave question (No) and closes it');
    assert(await p2.locator('.game-screen-wrapper').count() === 1, 'Back on the leave question keeps the game');

    // Three wrong digits: each empty cell gets a digit its own row already shows.
    const wrong = await p2.evaluate(() => {
      const cells = [...document.querySelectorAll('.game-screen-wrapper .sudoku-cell')].map((c) => c.textContent.trim());
      const picks = [];
      for (let i = 0; i < 81 && picks.length < 3; i++) {
        if (cells[i]) continue;
        const row = Math.floor(i / 9);
        const shown = cells.slice(row * 9, row * 9 + 9).find((v) => /^[1-9]$/.test(v));
        if (shown) picks.push({ i, d: Number(shown) });
      }
      return picks;
    });
    for (const { i, d } of wrong) {
      await p2.locator('.game-screen-wrapper .sudoku-cell').nth(i).click();
      await p2.locator('.number-pad .num-btn').nth(d - 1).click();
      await p2.waitForTimeout(250);
    }
    await p2.waitForSelector('.game-over-card', { timeout: 4000 });
    await p2.waitForTimeout(400);
    await back();
    assert(await p2.locator('.confirm-modal-card').count() === 0, 'Back on a game over does not ask to leave a game already over');
    assert(await p2.locator('.game-over-card').count() === 0 && await onHome(), 'Back on a game over goes Home, as its Home button does');
    await p2.close();

    await browser.close();

    console.log('\n======================================================');
    console.log('Back Navigation Results: ' + passed + ' PASSED / ' + failed + ' FAILED');
    console.log('======================================================');

    if (failed > 0) {
      shutdownPreview(viteProcess);
      process.exit(1);
    } else {
      console.log('100% PERFECT! Android Back Button and Radar Cancel behavior verified!\n');
      shutdownPreview(viteProcess);
      process.exit(0);
    }
  } finally {
    shutdownPreview(viteProcess);
  }
}

// The preview server is shut down by run()'s own finally; viteProcess is not visible
// here, and calling it threw on the failure path (ESLint no-undef, 2026-10-07).
run().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});