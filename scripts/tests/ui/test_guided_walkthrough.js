/**
 * test_guided_walkthrough.js — gate 3-23
 *
 * The first-game walkthrough (KP-18, 2026-11-06), played through in the browser:
 *   1. a new player's first standard game offers it; yes starts it on the board
 *   2. the four steps move on only when the player does them: a wrong digit in the
 *      glowing cell does not count, the right one does; a note; a cell filled with
 *      Fast Entry; then the last card, whose button closes it and keeps the game
 *   3. the second new game does not offer it again
 *   4. the first killer game offers its own after the killer rules; the last cell
 *      of a cage, then the rule of 45 — which must come up, not be skipped (it was,
 *      once, when the next step saw the cage step's cell already filled)
 *   5. a player who has played before is not offered it
 *   6. the Academy's button starts it for the kind shown; back closes it and keeps
 *      the game
 * Gate 2-35 checks the cells' answers; this checks the screens.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const PORT = 5224;
const URL = `http://localhost:${PORT}`;
const { DICTIONARIES } = await import('../../../src/i18n/dictionaries.js');
const T = DICTIONARIES.ko.tutorialOverlay;

function waitForServer(url, timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => (res.statusCode === 200 ? resolve() : setTimeout(check, 200)))
        .on('error', () => (Date.now() - start > timeout ? reject(new Error('Server timeout')) : setTimeout(check, 200)));
    };
    check();
  });
}
function shutdown(p) {
  try { p.kill(); } catch { /* gone */ }
  try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
}

console.log('======================================================');
console.log('🧭 Gate 3-23: The first-game walkthrough');
console.log('======================================================');

const errors = [];
const fail = (m) => errors.push(m);
const vite = spawn('npx.cmd', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });

const step = (page) => page.evaluate(() => document.querySelector('.guided-coaching-banner')?.dataset.step || null);
const target = (page) => page.evaluate(() => [...document.querySelectorAll('.sudoku-cell')].findIndex((c) => c.classList.contains('guide-target')));
const solutionAt = (page, i) => page.evaluate((k) => {
  const g = JSON.parse(localStorage.getItem('suidoku_game_state_v1'));
  return (g.solutionBoard || g.solution)[Math.floor(k / 9)][k % 9];
}, i);
const dialog = (page) => page.evaluate(() => document.querySelector('.confirm-overlay')?.innerText.replace(/\s+/g, ' ') || null);
const answer = async (page, yes) => { await page.locator(`.confirm-overlay ${yes ? '.btn-primary' : '.btn-secondary'}`).first().click(); await page.waitForTimeout(500); };
const digit = (page, d) => page.locator(`.number-pad .num-btn:nth-child(${d})`).click();
const tool = (page, i) => page.locator('.action-toolbar .action-btn').nth(i).click();

async function freshPage(browser, stats = null) {
  const page = await (await browser.newContext({ viewport: { width: 412, height: 891 } })).newPage();
  page.on('pageerror', (e) => fail(`page error: ${e.message}`));
  await page.goto(URL);
  await page.evaluate((s) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'ko', theme: 'clay' }));
    localStorage.setItem('suidoku_review_prompted', 'done');
    if (s) localStorage.setItem('suidoku_user_stats_v1', JSON.stringify(s));
  }, stats);
  await page.reload();
  await page.waitForSelector('.home-bottom-nav');
  for (let i = 0; i < 3; i++) {
    const b = page.locator('.modal-card .btn').first();
    if (!(await b.count())) break;
    await b.click().catch(() => {});
    await page.waitForTimeout(300);
  }
  return page;
}
async function toHome(page) {
  for (let i = 0; i < 4 && !(await page.locator('.home-bottom-nav').count()); i++) {
    if (await page.locator('.confirm-overlay').count()) await answer(page, true);
    else { await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
  }
}

try {
  await waitForServer(URL);
  const browser = await chromium.launch();

  // 1-3. A new player, standard.
  {
    const page = await freshPage(browser);
    try {
    await page.locator('.home-screen-container .btn-play-new').first().click();
    await page.waitForTimeout(400);
    const offer = await dialog(page);
    if (!offer || !offer.includes(T.offerClassic)) fail(`1. a new player's first standard game did not offer the walkthrough (dialog: ${offer})`);
    else await answer(page, true);
    await page.waitForSelector('.guided-coaching-banner', { timeout: 5000 }).catch(() => {});
    if ((await step(page)) !== 'single') fail(`1. yes did not start the walkthrough on its first step (step ${await step(page)})`);
    let t = await target(page);
    if (t < 0) fail('2. the first step points at no cell');
    else {
      const right = await solutionAt(page, t);
      const banner = await page.locator('.guided-coaching-banner').innerText();
      if (!banner.includes(String(right))) fail(`2. the first step does not name the cell's answer ${right}: "${banner.replace(/\s+/g, ' ')}"`);
      await page.locator('.sudoku-cell').nth(t).click();
      await digit(page, right === 1 ? 2 : 1);
      await page.waitForTimeout(400);
      if ((await step(page)) !== 'single') fail('2. a wrong digit in the glowing cell moved the walkthrough on');
      await tool(page, 1); // erase
      await page.locator('.sudoku-cell').nth(t).click();
      await digit(page, right);
      await page.waitForTimeout(500);
      if ((await step(page)) !== 'notes') fail(`2. the right digit did not move on to the notes step (step ${await step(page)})`);
    }
    t = await target(page);
    if (t >= 0) {
      await tool(page, 2);
      await page.locator('.sudoku-cell').nth(t).click();
      await digit(page, await solutionAt(page, t));
      await page.waitForTimeout(500);
      await tool(page, 2);
    }
    if ((await step(page)) !== 'fast') fail(`2. a note did not move on to the Fast Entry step (step ${await step(page)})`);
    const empty = await page.evaluate(() => [...document.querySelectorAll('.sudoku-cell')].findIndex((c) => !c.querySelector('.cell-number') && !c.querySelector('.cell-notes-grid')));
    await tool(page, 3);
    await digit(page, await solutionAt(page, empty));
    await page.locator('.sudoku-cell').nth(empty).click();
    await page.waitForTimeout(500);
    await tool(page, 3);
    if ((await step(page)) !== 'done') fail(`2. a cell filled with Fast Entry did not move on to the last card (step ${await step(page)})`);
    await page.locator('.guided-coaching-banner .btn-primary').click();
    await page.waitForTimeout(300);
    if (await page.locator('.guided-coaching-banner').count()) fail('2. the last card\'s button did not close the walkthrough');
    if (!(await page.locator('.sudoku-board-container').count())) fail('2. closing the walkthrough left the game — it is a real board, half played');

    await toHome(page);
    await page.locator('.home-screen-container .btn-play-new').first().click();
    await page.waitForTimeout(400);
    const second = await dialog(page);
    if (second && second.includes(T.offerClassic)) fail('3. the second new game offered the walkthrough again');
    if (second) await answer(page, false);
    if (await page.locator('.confirm-overlay').count()) await answer(page, false);

    // 4. The first killer, on the same player.
    await toHome(page);
    await page.locator('.variant-switch .variant-option').nth(1).click();
    await page.locator('.home-screen-container .btn-play-new').first().click();
    await page.waitForTimeout(500);
    const rulesStart = page.locator('.variant-rules-card .btn-play-new').first();
    if (!(await rulesStart.count())) fail('4. the first killer game did not show the killer rules first');
    else { await rulesStart.click(); await page.waitForTimeout(500); }
    const kOffer = await dialog(page);
    if (!kOffer || !kOffer.includes(T.offerKiller)) fail(`4. the first killer game did not offer the killer walkthrough (dialog: ${kOffer})`);
    else await answer(page, true);
    if (await page.locator('.confirm-overlay').count()) await answer(page, true); // give up the standard game in progress
    await page.waitForSelector('.killer-board .guided-coaching-banner, .guided-coaching-banner', { timeout: 6000 }).catch(() => {});
    if (!(await page.locator('.killer-board').count())) fail('4. the killer walkthrough did not start on a killer board');
    if ((await step(page)) !== 'cageLast') fail(`4. the killer walkthrough did not start with the last cell of a cage (step ${await step(page)})`);
    t = await target(page);
    if (t >= 0) {
      await page.locator('.sudoku-cell').nth(t).click();
      await digit(page, await solutionAt(page, t));
      await page.waitForTimeout(600);
    }
    if ((await step(page)) !== 'rule45') fail(`4. after the cage step the walkthrough is at "${await step(page)}", not the rule of 45 — a step was skipped`);
    } catch (e) {
      fail(`1-4 stopped: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }

  // 5. A player who has played before.
  {
    const page = await freshPage(browser, { gamesPlayed: 3, gamesWon: 2, bestTimes: {} });
    try {
    await page.locator('.home-screen-container .btn-play-new').first().click();
    await page.waitForTimeout(500);
    const d = await dialog(page);
    if (d && d.includes(T.offerClassic)) { fail('5. a player with games played was offered the first-game walkthrough'); await answer(page, false); }
    if (!(await page.locator('.sudoku-board-container').count())) fail('5. the game did not start for a player who has played before');

    // 6. The Academy's button, and back.
    await toHome(page);
    await page.locator('.home-bottom-nav .nav-item').nth(2).click();
    await page.waitForSelector('.guided-replay-btn', { timeout: 5000 }).catch(() => {});
    if (!(await page.locator('.guided-replay-btn').count())) fail('6. the Academy has no walkthrough button');
    else {
      await page.locator('.guided-replay-btn').click();
      await page.waitForTimeout(400);
      if (await page.locator('.confirm-overlay').count()) await answer(page, true);
      await page.waitForSelector('.guided-coaching-banner', { timeout: 5000 }).catch(() => {});
      if ((await step(page)) !== 'single') fail(`6. the Academy's button did not start the standard walkthrough (step ${await step(page)})`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      if (await page.locator('.guided-coaching-banner').count()) fail('6. back did not close the walkthrough');
      if (!(await page.locator('.sudoku-board-container').count())) fail('6. back during the walkthrough left the game');
    }
    } catch (e) {
      fail(`5-6 stopped: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }
  await browser.close();
} finally {
  shutdown(vite);
}

if (errors.length) {
  console.error('\n❌ [FAIL] The walkthrough:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('  ✅ 1-3. offered once to a new player; four steps that move on only when done; the game kept');
console.log('  ✅ 4. the killer one after the rules: cage, then the rule of 45 — not skipped');
console.log('  ✅ 5-6. not offered to a player who has played; the Academy starts it; back keeps the game');
console.log('\n🎉 [3-23] PASSED — the first-game walkthrough');
