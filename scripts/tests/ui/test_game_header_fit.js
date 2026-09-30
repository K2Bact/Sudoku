/**
 * test_game_header_fit.js — gate 3-16
 *
 * The game header fits: every language × every mode, at 360px and 320px, at the
 * normal font and at the 1.3x text zoom MainActivity allows.
 *
 * ── Why (2026-09-30) ──────────────────────────────────────────────────────
 * Measuring something else, a German speedrun header came up overflowing at
 * 320px. Swept properly it was 54 of 156 cases, and 16 of them at 360px with the
 * 1.3x text zoom — the setting gate 3-12 was built for:
 *
 *   row 1   the title and the mode badge could not shrink, so they pushed the
 *           theme, sound and SETTINGS buttons off the right edge (pt, ru, en …)
 *   row 2   the level / mistakes / time badges were nowrap + 32px + hidden, so
 *           text that did not fit was cut mid-word: 「Ошибка 0 (+1」
 *
 * No gate looked: 3-12 measures the board and keypad, 3-7 the home screens, and
 * both at one language or one font. This one reads the header itself.
 *
 * ── What it asserts ───────────────────────────────────────────────────────
 *   1. Nothing in the header leaves the screen or the header, nothing in the
 *      title group lies over the buttons, and the page does not scroll sideways.
 *   2. No text is cut. An element may shorten its text only on purpose — a
 *      visible "…" (text-overflow: ellipsis or line-clamp). Hidden overflow
 *      without one is a cut.
 *   3. At 360px and the normal font — the common phone — no text is shortened
 *      at all. "…" there would be text the player cannot read on an ordinary
 *      screen.
 *   Self-checks: the header was found in every case, and the narrow cases did
 *   make something wrap or shorten — otherwise the sweep never reached the
 *   squeeze it exists to test.
 *
 * 1.3x is emulated the way 3-12 does it: every font size in the header times
 * 1.3. Icons keep their size, as they do under WebView text zoom.
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';

const PORT = 5213;
const URL = `http://localhost:${PORT}`;
const MODES = [['classic', 1], ['timeAttack', 2], ['timeLimit', 3]];
const CASES = [[360, 1], [320, 1], [360, 1.3], [320, 1.3]];

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}

/** Everything the assertions need, read from the live header. */
function readHeader() {
  const h = document.querySelector('.game-header');
  if (!h) return null;
  const hb = h.getBoundingClientRect();
  const out = [];
  const cut = [];
  const shortened = [];
  for (const e of h.querySelectorAll('*')) {
    if (!e.offsetParent) continue;
    const b = e.getBoundingClientRect();
    if (b.width === 0) continue;
    const name = (typeof e.className === 'string' && e.className.split(' ')[0]) || e.tagName.toLowerCase();
    const text = (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 24);
    const right = Math.min(hb.right, innerWidth);
    const left = Math.max(hb.left, 0);
    if (b.right > right + 1 || b.left < left - 1) {
      out.push(`${name} ${Math.round(Math.max(b.right - right, left - b.left))}px "${text}"`);
      continue;
    }
    const s = getComputedStyle(e);
    if (s.overflow === 'visible' || e.scrollWidth <= e.clientWidth + 1) continue;
    const onPurpose = s.textOverflow === 'ellipsis' || (s.webkitLineClamp && s.webkitLineClamp !== 'none');
    (onPurpose ? shortened : cut).push(`${name} ${e.scrollWidth - e.clientWidth}px "${text}"`);
  }
  // Text lying over the buttons. A group that is allowed to shrink can let its
  // contents spill instead of pushing — the buttons stay on screen and are
  // covered. "Off the screen" alone missed exactly that (first 3-16 mutation).
  const actions = h.querySelector('.header-actions')?.getBoundingClientRect();
  const overlaps = [];
  if (actions) {
    for (const e of h.querySelectorAll('.logo-group > *')) {
      if (!e.offsetParent) continue;
      const b = e.getBoundingClientRect();
      const x = Math.min(b.right, actions.right) - Math.max(b.left, actions.left);
      const y = Math.min(b.bottom, actions.bottom) - Math.max(b.top, actions.top);
      if (x > 1 && y > 1) {
        const name = (typeof e.className === 'string' && e.className.split(' ')[0]) || e.tagName.toLowerCase();
        overlaps.push(`${name} lies ${Math.round(x)}px over the buttons "${(e.innerText || '').trim().slice(0, 24)}"`);
      }
    }
  }
  const wrapped = [...h.querySelectorAll('.current-level-badge, .mistakes-badge, .timer-badge, .version-tag')]
    .filter((b) => b.getBoundingClientRect().height > (b.classList.contains('version-tag') ? 22 : 34)).length;
  return {
    headerScroll: h.scrollWidth - h.clientWidth,
    pageScroll: document.documentElement.scrollWidth - innerWidth,
    out, cut, shortened, wrapped, overlaps,
  };
}

async function openGame(page, lang, tab) {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  await page.evaluate((l) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: l, theme: 'matte-dark' }));
    localStorage.setItem('suidoku_review_prompted', '1');
  }, lang);
  await page.reload();
  await page.waitForSelector('.home-bottom-nav');
  for (let i = 0; i < 3; i++) {
    if (!(await page.locator('.modal-overlay').count())) break;
    await page.locator('.modal-overlay button').last().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.click(`.mode-tab-btn:nth-child(${tab})`, { timeout: 5000 });
  await page.click('.home-screen-container .btn-play-new', { timeout: 6000 });
  await page.waitForSelector('.game-header', { timeout: 8000 });
}

async function run() {
  console.log('======================================================');
  console.log('📐 Gate 3-16: the game header fits (13 languages × 3 modes × 360/320px × font 1/1.3)');
  console.log('======================================================');

  const vite = spawn('cmd', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const failures = [];
  let measured = 0;
  let squeezed = 0;
  let expected = 0;
  try {
    await waitForServer();
    const page = await browser.newPage({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
    for (const lang of LOCALES) {
      for (const [mode, tab] of MODES) {
        await openGame(page, lang, tab);
        let scaled = false;
        for (const [width, scale] of CASES) {
          expected++;
          if (scale !== 1 && !scaled) {
            await page.evaluate((s) => {
              const els = [...document.querySelectorAll('.game-header, .game-header *')];
              const sizes = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
              els.forEach((e, i) => { e.style.fontSize = `${sizes[i] * s}px`; });
            }, scale);
            scaled = true;
          }
          await page.setViewportSize({ width, height: 800 });
          await page.waitForTimeout(120);
          const r = await page.evaluate(readHeader);
          const where = `${lang} ${mode} ${width}px font×${scale}`;
          if (!r) { failures.push(`${where}: no .game-header — the case was not measured`); continue; }
          measured++;
          if (width === 320 || scale !== 1) squeezed += r.wrapped + r.shortened.length;
          if (r.headerScroll > 1) failures.push(`${where}: header scrolls sideways by ${r.headerScroll}px`);
          if (r.pageScroll > 0) failures.push(`${where}: the page scrolls sideways by ${r.pageScroll}px`);
          for (const o of r.out) failures.push(`${where}: off the screen — ${o}`);
          for (const o of r.overlaps) failures.push(`${where}: covers a button — ${o}`);
          for (const c of r.cut) failures.push(`${where}: text cut without "…" — ${c}`);
          if (width === 360 && scale === 1) for (const s of r.shortened) failures.push(`${where}: shortened on an ordinary phone — ${s}`);
        }
      }
    }
  } finally {
    await browser.close();
    vite.kill();
    try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
  }

  console.log(`▶ measured ${measured} of ${expected} cases; wraps and "…" in the narrow cases: ${squeezed}`);
  if (measured !== expected) failures.push(`only ${measured} of ${expected} cases were measured`);
  if (squeezed === 0) failures.push('no case wrapped or shortened anything — the sweep never reached the squeeze it exists to test');

  if (failures.length) {
    console.error(`\n❌ [FAIL] The game header does not fit (${failures.length}):`);
    failures.slice(0, 40).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('\n🎉 [3-16] PASSED — the game header fits every language, mode, width and font scale checked.');
}

run().catch((err) => {
  console.error('❌ Gate 3-16 crashed:', err);
  process.exit(1);
});
