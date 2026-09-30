/**
 * Gate 3-14 — the 1v1 lobby says when it cannot reach the server.
 *
 * The published database rules refuse every read and write without a signed-in
 * account (BACKLOG FB-1). When anonymous sign-in failed, the search still ran, and
 * twelve seconds later the lobby said "no opponent found" — a claim about other
 * players, when this phone had never reached the server (BT-2, SudokuDiary 51).
 * The fix was checked with a fake Firebase API in gate 2-9; this gate runs the real
 * build against the real SDK and project, with only Google's auth hosts blocked.
 *
 *   1. blocked sign-in → the lobby shows battleLobby.connectFailed, promptly
 *   2. block lifted → the next search starts, and the player's id becomes the
 *      account uid the transport signs with (the retry is what makes 1v1 usable
 *      again without restarting the app)
 *   3. the failure card, in every locale at 360px, stays inside its pill —
 *      the red team of 2026-09-29 found Japanese 21px outside it (SudokuDiary 56),
 *      because gate 3-7 never renders this state
 *
 * It touches the production database once per run: step 2 signs one anonymous
 * account in and puts one ticket in the queue, and leaves the room straight away.
 * Steps 1 and 3 never reach Firebase at all.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import path from 'path';
import { pathToFileURL } from 'url';
import { LOCALES } from '../../lib/locales.js';

const PORT = 5214;
const URL = `http://localhost:${PORT}`;
const AUTH_HOSTS = /identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/;
// Well under the 12-second search timeout: a failure reported this fast cannot be
// the timeout path in disguise.
const PROMPT_MS = 6000;

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

const text = {};
for (const loc of LOCALES) {
  const dict = (await import(pathToFileURL(path.resolve(`src/i18n/locales/${loc}.js`)).href)).default;
  text[loc] = { failed: dict.battleLobby.connectFailed, none: dict.battleLobby.noOpponentFound };
}

console.log('======================================================');
console.log('📡 Gate 3-14: the 1v1 lobby says when it cannot connect');
console.log('======================================================');

const errors = [];
const vite = spawn('npx.cmd', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });
let browser;
try {
  await waitForServer(URL);
  browser = await chromium.launch();

  async function lobby(loc, width) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 } });
    const state = { blocked: true };
    await ctx.route(AUTH_HOSTS, (route) => (state.blocked ? route.abort('internetdisconnected') : route.continue()));
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${loc}: page error ${e.message}`));
    // Not waitUntil 'load': index.css @imports Google Fonts, and "load" waits for it. On a
    // bad network that request hangs and a page that is fully usable never reaches "load"
    // — this gate timed out that way on 2026-09-29 with the lobby already on screen.
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate((l) => localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: l })), loc);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.battle-card-banner');
    // Widths depend on the font, so give the web fonts a bounded chance before measuring,
    // and say when they did not arrive rather than measure silently in a fallback face.
    const fonts = await Promise.race([
      page.evaluate(() => document.fonts.ready.then(() => document.fonts.status)),
      new Promise((r) => setTimeout(() => r('timeout'), 10000)),
    ]);
    if (fonts !== 'loaded') console.log(`  ⚠️  ${loc}: web fonts ${fonts} — measured in the fallback font`);
    await page.click('.battle-card-banner');
    await page.waitForSelector('.primary-battle-card button');
    return { ctx, page, state };
  }
  // What the lobby card says once it stops searching, or null while it still is.
  const cardText = (page) => page.evaluate(() => {
    const w = document.querySelector('.match-searching-wrapper');
    if (!w || document.querySelector('.radar-visual-arena')) return null;
    return w.querySelector('.radar-status-badge span')?.textContent || '';
  });
  async function waitForCard(page, ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const s = await cardText(page);
      if (s !== null) return { said: s, ms: Date.now() - t0 };
      await page.waitForTimeout(100);
    }
    return { said: null, ms };
  }

  // 1 + 2 — the whole path, in Korean.
  {
    const { ctx, page, state } = await lobby('ko', 390);
    await page.click('.primary-battle-card button');
    const { said, ms } = await waitForCard(page, 15000);
    if (said !== text.ko.failed) {
      errors.push(`blocked sign-in: the lobby said ${JSON.stringify(said)} after ${ms}ms instead of could-not-connect (${JSON.stringify(text.ko.failed)})`);
    } else if (ms > PROMPT_MS) {
      errors.push(`blocked sign-in: could-not-connect took ${ms}ms — that is the search timeout, not the sign-in check`);
    }
    console.log(`  ① blocked sign-in → ${said === text.ko.failed ? 'could not connect' : JSON.stringify(said)} in ${ms}ms`);

    state.blocked = false;
    await page.click('.match-radar-card .btn-secondary');
    await page.waitForSelector('.primary-battle-card button');
    await page.click('.primary-battle-card button');
    let searching = false;
    for (let i = 0; i < 40 && !searching; i++) {
      if (await page.locator('.radar-visual-arena').count()) searching = true;
      else if ((await cardText(page)) !== null) break;
      else await page.waitForTimeout(100);
    }
    let id = null;
    let signs = null;
    for (let i = 0; i < 80; i++) {
      [id, signs] = await page.evaluate(() => [window.suidokuBattle?.myPlayerId || null, window.suidokuBattle?.channel?.identity || null]);
      if (id && id === signs && !id.startsWith('user_')) break;
      await page.waitForTimeout(100);
    }
    await page.evaluate(() => window.suidokuBattle?.leaveRoom?.());   // take the ticket back
    if (!searching) errors.push('after the block was lifted the next search did not start — a failed sign-in is not retried');
    if (!id || id !== signs || id.startsWith('user_')) {
      errors.push(`after the block was lifted the player id did not become the account uid (id ${id}, transport signs as ${signs})`);
    }
    console.log(`  ② block lifted → ${searching ? 'searching' : 'not searching'} · id ${id === signs && id && !id.startsWith('user_') ? 'is the account uid' : `${id} / ${signs}`}`);
    await ctx.close();
  }

  // 3 — the failure card in every locale at 360px.
  for (const loc of LOCALES) {
    const { ctx, page } = await lobby(loc, 360);
    await page.click('.primary-battle-card button');
    const { said } = await waitForCard(page, 15000);
    if (said !== text[loc].failed) {
      errors.push(`${loc}: expected could-not-connect, the lobby said ${JSON.stringify(said)}`);
      await ctx.close();
      continue;
    }
    const m = await page.evaluate(() => {
      const card = document.querySelector('.match-radar-card');
      const badge = card.querySelector('.radar-status-badge');
      const span = badge.querySelector('span');
      return {
        badge: badge.scrollWidth - badge.clientWidth,
        span: span.scrollWidth - span.clientWidth,
        card: Math.round(card.getBoundingClientRect().right - innerWidth),
        page: document.documentElement.scrollWidth - innerWidth,
      };
    });
    const bad = m.badge > 1 || m.span > 1 || m.card > 0 || m.page > 0;
    if (bad) errors.push(`${loc}: the could-not-connect card overflows at 360px (pill +${m.badge}px, text +${m.span}px, card ${m.card}px past the edge, page +${m.page}px)`);
    console.log(`  ③ ${loc.padEnd(5)} ${bad ? '❌' : '✅'} pill +${m.badge} · text +${m.span} · card ${m.card} · page +${m.page}`);
    await ctx.close();
  }
} finally {
  if (browser) await browser.close();
  shutdown(vite);
}

if (errors.length) {
  console.error('\n❌ [FAIL] The 1v1 lobby does not say it cannot connect:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n🎉 [3-14] PASSED — could not connect is said at once, retried, and fits in every language.');
