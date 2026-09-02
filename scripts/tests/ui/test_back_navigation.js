import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

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

run().catch((e) => {
  console.error('Fatal test error:', e);
  shutdownPreview(viteProcess);
  process.exit(1);
});