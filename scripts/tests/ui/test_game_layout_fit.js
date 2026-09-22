/**
 * test_game_layout_fit.js — gate 3-12
 *
 * The game screen must fit the phone: no page scroll, the whole keypad visible,
 * every digit inside its cell, and the keypad kept clear of the bottom banner.
 *
 * BACKLOG U-1 (2026-09-19). A Galaxy S25 Ultra user (412x891, larger system font)
 * saw the native banner cover the keypad digits: the game screen was a plain
 * column with a full-width square board, taller than the screen, and the banner is
 * pinned to the bottom. A Flip5 at its largest font reproduced it — and also cut
 * the board's last row, because the digits were sized from the screen width while
 * the board was not.
 *
 * Sizes: a short phone, the Flip5, the S25 Ultra, a small tablet. Each at the
 * normal font and at 1.3× (the WebView text zoom cap set in MainActivity),
 * emulated by multiplying every element's computed font size — except the board
 * digits, which the app divides by --text-zoom and the WebView multiplies back.
 *
 * The browser has no advertiser, so AdBanner draws no slot. The test inserts the
 * slot at the height the SDK reports at that width (about 15.5% of it), exactly
 * where the app puts it; without it the test would measure a screen with no ad
 * and pass for the wrong reason (it did, once, while this was being written).
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const PORT = 5212;
const URL = `http://localhost:${PORT}`;
const SIZES = [[360, 640], [384, 939], [412, 891], [600, 960]];
const SCALES = [1, 1.3];
const MIN_AD_GAP = 24;

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
console.log('📐 Gate 3-12: The game screen fits the phone');
console.log('======================================================');

const errors = [];
const vite = spawn('npx.cmd', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });
try {
  await waitForServer(URL);
  const browser = await chromium.launch();
  for (const [w, h] of SIZES) {
    for (const S of SCALES) {
      const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
      page.on('pageerror', (e) => errors.push(`${w}x${h} ×${S}: page error ${e.message}`));
      await page.goto(URL);
      await page.evaluate(() => localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'ko', theme: 'clay' })));
      await page.reload();
      await page.locator('.home-screen-container .btn-play-new').first().click();
      await page.waitForSelector('.sudoku-board-container', { timeout: 8000 });
      await page.evaluate(() => {
        if (document.querySelector('.ad-slot-container')) return;
        const slot = document.createElement('div');
        slot.className = 'ad-slot-container';
        document.documentElement.style.setProperty('--ad-banner-h', `${Math.round(Math.min(90, Math.max(50, innerWidth * 0.155)))}px`);
        document.querySelector('.game-screen-wrapper').appendChild(slot);
      });
      if (S !== 1) {
        await page.evaluate((s) => {
          const els = [...document.querySelectorAll('body *')];
          const sizes = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
          els.forEach((e, i) => { e.style.fontSize = `${sizes[i] * s}px`; });
          document.documentElement.style.setProperty('--text-zoom', String(s));
          document.querySelectorAll('.cell-number, .note-digit').forEach((e) => { e.style.fontSize = ''; });
        }, S);
      }
      await page.waitForTimeout(250);
      const r = await page.evaluate(() => {
        const rect = (sel) => document.querySelector(sel)?.getBoundingClientRect() || null;
        const kp = document.querySelector('.keypad-container');
        const kb = kp.getBoundingClientRect();
        const cells = [...document.querySelectorAll('.sudoku-cell')];
        return {
          scroll: document.scrollingElement.scrollHeight - innerHeight,
          cells: cells.length,
          overflow: cells.filter((c) => c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1).length,
          clipped: [...kp.querySelectorAll('button')].filter((b) => { const x = b.getBoundingClientRect(); return x.bottom > kb.bottom + 1 || x.top < kb.top - 1; }).length,
          keypadBottom: kb.bottom,
          adTop: rect('.ad-slot-container')?.top,
          board: rect('.sudoku-board-container')?.width,
        };
      });
      const where = `${w}x${h} font×${S}`;
      if (r.scroll > 0) errors.push(`${where}: the page scrolls by ${r.scroll}px — the game screen is taller than the phone`);
      if (r.cells !== 81) errors.push(`${where}: ${r.cells} cells on the board`);
      if (r.overflow) errors.push(`${where}: ${r.overflow} cells overflow — digits bigger than their cells`);
      if (r.clipped) errors.push(`${where}: ${r.clipped} keypad buttons cut off — the keypad was squeezed`);
      if (r.adTop == null) errors.push(`${where}: no ad slot measured — the check did not reach the banner`);
      else if (r.adTop < r.keypadBottom) errors.push(`${where}: the keypad runs ${Math.round(r.keypadBottom - r.adTop)}px under the banner — the S25 Ultra report`);
      else if (r.adTop - r.keypadBottom < MIN_AD_GAP) errors.push(`${where}: keypad ends ${Math.round(r.adTop - r.keypadBottom)}px above the banner (need ≥${MIN_AD_GAP}) — accidental ad taps`);
      console.log(`  ${where.padEnd(22)} board ${Math.round(r.board)}px · keypad→banner ${Math.round(r.adTop - r.keypadBottom)}px`);
      await page.close();
    }
  }
  await browser.close();
} finally {
  shutdown(vite);
}

if (errors.length) {
  console.error('\n❌ [FAIL] The game screen does not fit:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n🎉 The game screen fits every size and font scale checked.');
