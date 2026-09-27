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
 * Sizes: a short phone, the Flip5, the S25 Ultra, a small tablet, a 10-inch
 * tablet upright and lying down, an 8-inch tablet, and a split-screen half.
 * Each at the normal font and at 1.3× (the WebView text zoom cap set in MainActivity),
 * emulated by multiplying every element's computed font size — except the board
 * digits, which the app divides by --text-zoom and the WebView multiplies back.
 *
 * A short second pass checks the screens OUTSIDE the game at tablet sizes. They
 * have no board to measure, but the mistake that reached the store screenshots
 * was made there too: a width cap raised, measured at one window size, and left
 * at 53% on the window a tablet actually has.
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
// Phones upright, then the sizes a tablet actually shows. A tablet may rotate
// (MainActivity frees the orientation at 600dp of smallest width, 2026-09-23),
// and lying down the board sits BESIDE the keypad — so the thing nearest the
// banner is the board, whose bottom row is as tappable as a keypad digit.
// 780x480 is the smallest window the app accepts (AndroidManifest <layout
// minHeight=480dp>) — a split-screen half on a tablet. Below that the board is
// too small to read whatever the layout does, which is why the minimum is
// declared rather than faked: at 380 tall it came out 132dp across.
const SIZES = [[360, 640], [384, 939], [412, 891], [600, 960],
               [800, 1280], [1066, 1650], [1280, 800], [1024, 768], [1706, 1011], [780, 480],
               // Wide AND low. Every landscape size above is also tall, and that
               // gap is what let the 3x3 keypad ship with only a width condition:
               // the pad is three times the height of the row it replaces, and at
               // 1280x480 it ran 90px under the banner — digit buttons on top of
               // an ad. 480 is the minimum height the manifest declares, so this
               // is a window the app actually accepts.
               [1280, 480], [1100, 560], [1024, 640],
               // Both sides of the 760px line the 3x3 pad switches at. A
               // breakpoint is least trustworthy at its own edge: at 760 the pad
               // fits only because its width is also capped by the column height,
               // and 720 is where the first version of that line left 23px of
               // clearance at 1.3x font against the 24 this layout promises.
               [1280, 720], [1280, 760]];
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
      // Wait for the home screen to exist before clicking into it. Without this
      // the click lands while the screen is still arriving — it animates in over
      // 0.25s and the cards below it settle as stats and records load — and
      // Playwright gives up with "element is not stable". It passed alone and
      // failed inside the full suite on 2026-09-26, which is what a missing wait
      // looks like: fine when the machine is idle, not when it is not.
      await page.waitForSelector('.home-bottom-nav');
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
          // Side by side, the board reaches further down than the keypad.
          lowest: Math.max(kb.bottom, rect('.sudoku-board-container')?.bottom || 0),
          sideBySide: (() => {
            const b = rect('.sudoku-board-container'), k = rect('.keypad-container');
            return Boolean(b && k && k.left >= b.right - 2);
          })(),
          // How many columns the digits are laid out in, and how wide the app
          // lets itself be. Both are about using a tablet rather than fitting on
          // one, which is what Play's large-screen review is looking at.
          padColumns: getComputedStyle(document.querySelector('.number-pad')).gridTemplateColumns.split(' ').length,
          usedWidth: (() => {
            const b = rect('.sudoku-board-container'), k = rect('.keypad-container');
            if (!b || !k) return 0;
            return (Math.max(b.right, k.right) - Math.min(b.left, k.left)) / innerWidth;
          })(),
        };
      });
      const where = `${w}x${h} font×${S}`;
      if (r.scroll > 0) errors.push(`${where}: the page scrolls by ${r.scroll}px — the game screen is taller than the phone`);
      if (r.cells !== 81) errors.push(`${where}: ${r.cells} cells on the board`);
      if (r.overflow) errors.push(`${where}: ${r.overflow} cells overflow — digits bigger than their cells`);
      if (r.clipped) errors.push(`${where}: ${r.clipped} keypad buttons cut off — the keypad was squeezed`);
      if (r.adTop == null) errors.push(`${where}: no ad slot measured — the check did not reach the banner`);
      else if (r.adTop < r.lowest) errors.push(`${where}: the ${r.lowest === r.keypadBottom ? 'keypad' : 'board'} runs ${Math.round(r.lowest - r.adTop)}px under the banner — the S25 Ultra report`);
      else if (r.adTop - r.lowest < MIN_AD_GAP) errors.push(`${where}: the board or keypad ends ${Math.round(r.adTop - r.lowest)}px above the banner (need ≥${MIN_AD_GAP}) — accidental ad taps`);
      // A board small enough to be unplayable is a layout failure of its own: a
      // 780x380 split-screen half gave 26px before the landscape rule.
      if (r.board < 200) errors.push(`${where}: the board is only ${Math.round(r.board)}px across — unplayable`);
      // Wide and lying down, the two halves must be side by side; stacked, the
      // board is starved by a keypad taller than the window.
      if (w >= 720 && w > h && !r.sideBySide) errors.push(`${where}: landscape and ${w}px wide, but the keypad is still under the board`);
      // Nine digits in a row is the only shape that fits across a phone. Lying
      // down on a tablet it makes 46px keys in a column a thousand pixels tall,
      // with the pad floating in the middle of it (㊸). 3x3 is the board's own
      // shape and spends the unused height on the keys.
      //
      // Wide AND tall, both. The pad is about three times the height of the row,
      // so a wide low window cannot hold it — the first version of this check
      // asked only about width, and the layout it blessed put the keypad 90px
      // under the banner at 1280x480. The banner check above is what catches
      // that; this one keeps the two conditions in step.
      const wantsGrid = w >= 1000 && h >= 760 && w > h;
      if (wantsGrid && r.padColumns !== 3) {
        errors.push(`${where}: ${r.padColumns} keypad columns — a window this wide and this tall has room for the 3x3 pad`);
      }
      if (!wantsGrid && r.padColumns !== 9) {
        errors.push(`${where}: ${r.padColumns} keypad columns — the row of nine is what fits a window this shape`);
      }
      // The empty-screen test. A flat 900px cap looked right at the 1280px it
      // was measured on and came out at 53% on a 1706px tablet — the number it
      // was written to fix. Anything that can only be checked at one size gets
      // checked at every size.
      //
      // Upright only, and that is not a shortcut. Lying down the board is
      // min(100cqh, 58cqw) and the height always runs out first, so the width it
      // leaves is geometry, not a cap — at 1280x480 the board is 240px because
      // the window is 480 tall, and nothing could fill the rest. This check fired
      // at 53% there, and at 65% on 1280x720, and both times the check was wrong
      // rather than the layout. It asks "did the app cap itself too narrow",
      // which only a window whose board is bound by WIDTH can answer.
      //
      // Lying down is not left unchecked: the side-by-side rule and the banner
      // gap above cover the game screen, and the second pass at the bottom of
      // this file covers the screens that do have a width cap.
      //
      // 0.68: the sizes this does cover land at 74-82%, and a cap that stops
      // scaling with the window drops straight through it (680px in a 1066px
      // window is 61%). Tight enough to catch that, loose enough not to fire on
      // a gap.
      if (w >= 840 && h > w && r.usedWidth < 0.68) {
        errors.push(`${where}: board and keypad use ${Math.round(r.usedWidth * 100)}% of the width — a tablet showing this much nothing is an app Play reads as not supporting it`);
      }
      console.log(`  ${where.padEnd(22)} board ${Math.round(r.board)}px · ${r.sideBySide ? 'side-by-side' : 'stacked'} · pad ${r.padColumns}col · width ${Math.round(r.usedWidth * 100)}% · lowest→banner ${Math.round(r.adTop - r.lowest)}px`);
      await page.close();
    }
  }

  // ── The screens outside the game, on a large screen ────────────────────
  //
  // Same failure, different place. The cap on .app-viewport was raised to 900px
  // and measured once, at 1280px, where it came to 70%. On the 1706px window a
  // tablet actually has, the same 900px is 53% — the number the change was
  // written to fix — and that is what the store screenshots came out as.
  //
  // These screens have no board to measure, so the check is the container's own
  // width against the window. 65%: the measured values are 70-88%, and a cap
  // that stops growing falls to 53%.
  for (const [w, h] of [[1706, 1011], [1280, 800], [1066, 1650]]) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    page.on('pageerror', (e) => errors.push(`${w}x${h} home: page error ${e.message}`));
    await page.goto(URL);
    await page.evaluate(() => localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'ko', theme: 'clay' })));
    await page.reload();
    await page.waitForSelector('.home-bottom-nav');
    const r = await page.evaluate(() => {
      const c = document.querySelector('.app-viewport');
      return {
        used: c ? c.getBoundingClientRect().width / innerWidth : 0,
        hscroll: document.documentElement.scrollWidth - innerWidth,
      };
    });
    if (r.used < 0.65) {
      errors.push(`${w}x${h} home: the app uses ${Math.round(r.used * 100)}% of the width — a cap that stops growing with the window`);
    }
    if (r.hscroll > 0) errors.push(`${w}x${h} home: the page scrolls sideways by ${r.hscroll}px`);
    console.log(`  ${`${w}x${h} home`.padEnd(22)} width ${Math.round(r.used * 100)}%`);
    await page.close();
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
