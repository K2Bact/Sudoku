/**
 * test_follow_up_game.js — gate 3-19
 *
 * The game that starts from inside a game (2026-10-06). Three buttons start a
 * fresh puzzle without going back to Home: Restart on the game-over card, Next
 * puzzle on the victory card, and the level picker behind the header's New game.
 * They passed only a level, so:
 *   - Speedrun and Survival quietly became Classic, and
 *   - after the daily puzzle the daily key stayed on: every later win granted
 *     the daily hint again and wrote a random puzzle's time over the daily record.
 * Both were reproduced in the browser before the fix (Diary 99). This plays each
 * button in a browser and reads what the next game is:
 *
 *   1. Survival → New game → Lv.2   is Survival Lv.2
 *   2. Survival → game over → Restart   is Survival
 *   3. Speedrun → win → Next puzzle   is Speedrun
 *   4. daily → win (+1 hint) → Next puzzle → win   gives no hint and leaves the
 *      daily record as the daily left it
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const PORT = 5219;
const URL = `http://localhost:${PORT}`;
const IS_WIN = process.platform === 'win32';
const failures = [];
const fail = (msg) => failures.push(msg);

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Fresh storage: English, today's attendance claimed, no review prompt, 3 hints. */
async function prime(page) {
  await page.goto(URL);
  await page.evaluate((today) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en', theme: 'matte-dark' }));
    localStorage.setItem('suidoku_user_wallet_v1', JSON.stringify({ hints: 3, lastDailyClaimDate: today, streakDays: 1, totalAdsWatched: 0, history: [] }));
    localStorage.setItem('suidoku_review_prompted', '1');
  }, todayKey());
  await page.reload();
  await page.waitForSelector('.home-bottom-nav', { timeout: 8000 });
}

const save = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('suidoku_game_state_v1') || 'null'));
const hints = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('suidoku_user_wallet_v1') || '{}').hints);
const dailyRecord = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem('suidoku_daily_records_v1') || '{}')[k] || null, key);

/** "Throw away the game in progress?" — yes, when it is asked. */
async function acceptAbandon(page) {
  const yes = page.locator('.confirm-overlay .btn-primary');
  if (await yes.count()) await yes.click();
  await page.waitForTimeout(300);
}

async function startFromHome(page, tabSelector) {
  await page.click(tabSelector);
  await page.click('.btn-play-new');
  await acceptAbandon(page);
  await page.waitForSelector('.sudoku-grid', { timeout: 8000 });
}

/** Fill every open cell with the saved solution, through the board and keypad. */
async function solve(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const st = JSON.parse(localStorage.getItem('suidoku_game_state_v1'));
    const cells = [...document.querySelectorAll('.sudoku-cell')];
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      if (st.initialBoard[r][c] !== 0) continue;
      cells[i].click();
      await sleep(20);
      [...document.querySelectorAll('.num-btn')].find((b) => b.innerText.trim().startsWith(String(st.solutionBoard[r][c])))?.click();
      await sleep(20);
    }
  });
}

/** Win the game on screen, then press Next puzzle on the victory card. */
async function winThenNext(page) {
  await solve(page);
  const next = page.locator('.modal-overlay .modal-actions .btn-primary');
  await next.waitFor({ timeout: 15000 });
  return next;
}

async function run() {
  console.log('\n🔁 [3-19] A game started from inside a game is the same kind of game');
  execSync(IS_WIN ? 'npm.cmd run build' : 'npm run build', { stdio: 'ignore' });
  const server = spawn(IS_WIN ? 'cmd' : 'sh', [IS_WIN ? '/c' : '-c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    const page = await (await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true })).newPage();

    // ── 1. The level picker behind New game ──────────────────────────────────
    await prime(page);
    await startFromHome(page, '.mode-tab-btn.time-limit-tab');
    await page.click('.new-game-btn');
    await page.locator('.difficulty-modal-list button').nth(1).click();
    await page.click('.modal-overlay .modal-actions-vertical .btn-primary');
    await acceptAbandon(page);
    await page.waitForTimeout(500);
    let s = await save(page);
    if (s?.gameMode !== 'timeLimit' || s?.level !== 2) fail(`1. Survival → New game → Lv.2 started ${s?.gameMode} Lv.${s?.level} — the level picker turned Survival into ${s?.gameMode}`);
    else console.log('  ✓ 1. Survival → New game → Lv.2 is Survival Lv.2');

    // ── 2. Restart on the game-over card ─────────────────────────────────────
    s = await save(page);
    const wrong = [];
    for (let i = 0; i < 81 && wrong.length < 3; i++) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      if (s.initialBoard[r][c] !== 0) continue;
      // A digit already on the board nine times is refused, not counted as a mistake —
      // and each wrong digit typed here adds one more (a run with 2 mistakes of 3 was
      // this: the same digit chosen twice, the second one refused).
      const placed = (d) => s.board.flat().filter((v) => v === d).length + wrong.filter(([, w]) => w === d).length;
      const d = [1, 2, 3, 4, 5, 6, 7, 8, 9].find((n) => n !== s.solutionBoard[r][c] && placed(n) < 9);
      wrong.push([i, d]);
    }
    for (const [i, d] of wrong) {
      await page.locator('.sudoku-cell').nth(i).click();
      await page.locator('.num-btn').nth(d - 1).click();
      await page.waitForTimeout(150);
    }
    const restart = page.locator('.modal-overlay .btn-secondary.btn-lg');
    if (!(await restart.waitFor({ timeout: 8000 }).then(() => true, () => false))) {
      const seen = await page.evaluate(() => ({
        mistakes: JSON.parse(localStorage.getItem('suidoku_game_state_v1') || 'null')?.mistakes,
        buttons: [...document.querySelectorAll('.modal-overlay button')].map((el) => el.className),
      }));
      fail(`2. three wrong digits did not bring up the game-over card (saved mistakes ${seen.mistakes}, buttons on screen ${JSON.stringify(seen.buttons)})`);
    } else {
      await restart.click();
      await page.waitForTimeout(600);
      s = await save(page);
      if (s?.gameMode !== 'timeLimit') fail(`2. Survival → game over → Restart started ${s?.gameMode} — Restart turned Survival into ${s?.gameMode}`);
      else console.log('  ✓ 2. Survival → game over → Restart is Survival');
    }

    // ── 3. Next puzzle on the victory card ───────────────────────────────────
    await prime(page);
    await startFromHome(page, '.mode-tab-btn.time-attack-tab');
    await (await winThenNext(page)).click();
    await page.waitForTimeout(600);
    s = await save(page);
    if (s?.gameMode !== 'timeAttack') fail(`3. Speedrun → win → Next puzzle started ${s?.gameMode} — Next puzzle turned Speedrun into ${s?.gameMode}`);
    else console.log('  ✓ 3. Speedrun → win → Next puzzle is Speedrun');

    // ── 4. After the daily ───────────────────────────────────────────────────
    await prime(page);
    const key = todayKey();
    await page.click('.daily-card-banner');
    await page.click('.calendar-day-btn.today');
    await acceptAbandon(page);
    await page.waitForSelector('.sudoku-grid', { timeout: 8000 });
    const h0 = await hints(page);
    const next = await winThenNext(page);
    const h1 = await hints(page);
    const record = await dailyRecord(page, key);
    if (h1 !== h0 + 1 || !record?.completed) {
      fail(`4. the daily itself did not pay: hints ${h0} → ${h1}, record ${JSON.stringify(record)} — the control is broken, so the rest proves nothing`);
    } else {
      await next.click();
      await page.waitForTimeout(600);
      await (await winThenNext(page));
      const h2 = await hints(page);
      const after = await dailyRecord(page, key);
      if (h2 !== h1) fail(`4. a puzzle won after the daily granted the daily hint again (hints ${h1} → ${h2}) — the daily key stayed on`);
      if (JSON.stringify(after) !== JSON.stringify(record)) fail(`4. a puzzle won after the daily rewrote the daily record: ${JSON.stringify(record)} → ${JSON.stringify(after)}`);
      if (h2 === h1 && JSON.stringify(after) === JSON.stringify(record)) console.log(`  ✓ 4. the daily pays once (hints ${h0} → ${h1}); the puzzle after it pays nothing and leaves the record`);
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
    try { execSync(`${IS_WIN ? 'npx.cmd' : 'npx'} kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
  }

  if (failures.length) {
    console.error(`\n❌ [3-19] FAILED — ${failures.length} finding(s):`);
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('\n✅ [3-19] PASSED — restart, next puzzle and the level picker keep the mode and leave the daily behind');
}

run().catch((err) => {
  console.error('\n❌ [3-19] crashed:', err);
  process.exit(1);
});
