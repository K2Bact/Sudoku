/**
 * test_match_replay_screen.js — gate 3-17
 *
 * The 1v1 replay screen, in the built app (I-1, 2026-09-30).
 *
 * Gate 2-26 proves the moves are recorded, stored and exchanged correctly. This
 * one proves a player can see them: two stored replays are put on the phone —
 * one where both players shared, one where the opponent declined — and each is
 * opened from the records screen the way a player would.
 *
 * ── What it asserts, in every language ───────────────────────────────────
 *   1. The records screen lists both replays, and a row opens the replay.
 *   2. Scrubbed to the end, the board drawn is the board the moves make: the
 *      solution for the winner, the unfinished board for the loser. The drawn
 *      board is compared with the record, not with a copy of it written here.
 *   3. The mistake the player made is marked on the time bar.
 *   4. The opponent's board can be opened when their moves came, and cannot
 *      when they declined — and then a line says why.
 *   5. Nothing in the replay leaves the screen or is cut without "…", at 360px
 *      with the normal font and with the 1.3x text zoom (as gate 3-16 emulates it).
 *   6. Back closes the replay and leaves the records screen where it was.
 *   Once, in English: a killer match's replay draws every cage and its sum,
 *   and ends on the solution (KP-14, 2026-11-06).
 *   Once, in Korean: pressing play moves the clock.
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';
import { generatePuzzle } from '../../../src/engine/SudokuEngine.js';
import { createPuzzle } from '../../../src/engine/variants.js';
import { gridToString, stateAt } from '../../../src/utils/replay/replayRecord.js';

const PORT = 5217;
const URL = `http://localhost:${PORT}`;
const CASES = [[360, 1], [360, 1.3]];

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}

// ── Two replays, built from a real puzzle ─────────────────────────────────
const p = generatePuzzle(3, 'replay-screen-gate');
const PUZ = gridToString(p.puzzle);
const SOL = gridToString(p.solution);
const empties = [...PUZ].map((d, i) => (d === '0' ? i : -1)).filter((i) => i >= 0);

function solve(cells, { stepMs, mistakeAt = -1, notes = false }) {
  const ev = [];
  let t = 2000;
  if (notes) ev.push([(t += 300), 'n', cells[0], 1], [(t += 300), 'n', cells[0], 2]);
  cells.forEach((cell, i) => {
    const right = Number(SOL[cell]);
    if (i === mistakeAt) {
      ev.push([(t += stepMs), 'v', cell, (right % 9) + 1]);
      ev.push([(t += 800), 'v', cell, 0]);
    }
    ev.push([(t += stepMs), 'v', cell, right]);
  });
  return ev;
}
const myEvents = solve(empties, { stepMs: 1500, mistakeAt: 5, notes: true });
const theirEvents = solve(empties.slice(0, empties.length - 12), { stepMs: 1700 });
const now = Date.UTC(2026, 8, 30, 12, 0, 0);
const SHARED = {
  v: 1, id: 'GATE1-0', savedAt: now, pinned: false, level: 3, puzzle: PUZ, solution: SOL, winner: 'me', reason: 'my_completion',
  me: { name: 'Player_1111', elapsedMs: myEvents.at(-1)[0], mistakes: 1, events: myEvents },
  opp: { name: 'Player_2222', elapsedMs: null, mistakes: 0, progress: [[5000, 3, 0], [60000, 40, 0]], events: theirEvents, shareState: 'shared' },
};
const DECLINED = {
  ...SHARED, id: 'GATE2-0', savedAt: now - 60000, winner: 'opponent', reason: 'opponent_completion',
  opp: { name: 'Player_3333', elapsedMs: 90000, mistakes: 2, progress: [[5000, 10, 0], [90000, 100, 2]], events: null, shareState: 'declined' },
};
const EXPECT = {
  mine: stateAt(PUZ, myEvents).values.join(''),
  theirs: stateAt(PUZ, theirEvents).values.join(''),
};

// A killer 1v1's replay (KP-14): its cages are drawn, or the board is a sparse
// standard puzzle nobody could follow. Newest, so it is the first row.
const kp = createPuzzle('killer', 3, 'replay-screen-killer');
const KPUZ = gridToString(kp.puzzle);
const KSOL = gridToString(kp.solution);
const kEvents = [...KPUZ].map((d, i) => (d === '0' ? i : -1)).filter((i) => i >= 0)
  .map((cell, i) => [2000 + i * 1200, 'v', cell, Number(KSOL[cell])]);
const KILLER = {
  ...SHARED, id: 'GATEK-0', savedAt: now + 60000, puzzle: KPUZ, solution: KSOL, variant: 'killer', cages: kp.cages,
  me: { ...SHARED.me, elapsedMs: kEvents.at(-1)[0], mistakes: 0, events: kEvents },
  opp: { ...SHARED.opp, events: null, shareState: 'declined' },
};

/** Overflow in the replay layer. The board is left to gate 3-12. */
function readLayer() {
  const layer = document.querySelector('.replay-layer');
  if (!layer) return null;
  const out = [];
  const cut = [];
  for (const e of layer.querySelectorAll('*')) {
    if (!e.offsetParent || e.closest('.sudoku-board-container')) continue;
    const b = e.getBoundingClientRect();
    if (b.width === 0) continue;
    const name = (typeof e.className === 'string' && e.className.split(' ')[0]) || e.tagName.toLowerCase();
    const text = (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    if (b.right > innerWidth + 1 || b.left < -1) { out.push(`${name} ${Math.round(Math.max(b.right - innerWidth, -b.left))}px "${text}"`); continue; }
    const s = getComputedStyle(e);
    if (s.overflow === 'visible' || e.scrollWidth <= e.clientWidth + 1) continue;
    if (e.tagName === 'INPUT') continue;
    const onPurpose = s.textOverflow === 'ellipsis' || (s.webkitLineClamp && s.webkitLineClamp !== 'none');
    if (!onPurpose) cut.push(`${name} ${e.scrollWidth - e.clientWidth}px "${text}"`);
  }
  return { out, cut, pageScroll: document.documentElement.scrollWidth - innerWidth, layerScroll: layer.scrollWidth - layer.clientWidth };
}

const drawnBoard = () => [...document.querySelectorAll('.replay-board .sudoku-cell')]
  .map((c) => c.querySelector('.cell-number')?.textContent.trim() || '0').join('');

async function scrubToEnd(page) {
  await page.evaluate(() => {
    const r = document.querySelector('.replay-timeline input[type=range]');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(r, r.max);
    r.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(150);
}

async function openRecords(page, lang, replays = [SHARED, DECLINED]) {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  await page.evaluate(([l, list]) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: l, theme: 'matte-dark' }));
    localStorage.setItem('suidoku_review_prompted', '1');
    localStorage.setItem('suidoku_replays_v1', JSON.stringify(list));
  }, [lang, replays]);
  await page.reload();
  await page.waitForSelector('.home-bottom-nav');
  for (let i = 0; i < 3; i++) {
    if (!(await page.locator('.modal-overlay').count())) break;
    await page.locator('.modal-overlay button').last().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.click('.home-bottom-nav .nav-item:nth-child(1)', { timeout: 5000 });
  await page.waitForSelector('.stats-screen-container');
}

async function checkFit(page, where, failures) {
  let scaled = false;
  for (const [width, scale] of CASES) {
    if (scale !== 1 && !scaled) {
      await page.evaluate((s) => {
        const els = [...document.querySelectorAll('.replay-layer *')].filter((e) => !e.closest('.sudoku-board-container'));
        const sizes = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
        els.forEach((e, i) => { e.style.fontSize = `${sizes[i] * s}px`; });
      }, scale);
      scaled = true;
    }
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(120);
    const r = await page.evaluate(readLayer);
    const w = `${where} ${width}px font×${scale}`;
    if (!r) { failures.push(`${w}: no replay on screen`); continue; }
    if (r.pageScroll > 0) failures.push(`${w}: the page scrolls sideways by ${r.pageScroll}px`);
    if (r.layerScroll > 1) failures.push(`${w}: the replay scrolls sideways by ${r.layerScroll}px`);
    for (const o of r.out) failures.push(`${w}: off the screen — ${o}`);
    for (const c of r.cut) failures.push(`${w}: text cut without "…" — ${c}`);
  }
}

async function run() {
  console.log('======================================================');
  console.log('🎬 Gate 3-17: the 1v1 replay screen (13 languages × 360px × font 1/1.3)');
  console.log('======================================================');
  if (EXPECT.mine !== SOL || EXPECT.theirs === SOL) throw new Error('the seeded replays are not what this gate needs');

  const vite = spawn('cmd', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const failures = [];
  let opened = 0;
  try {
    await waitForServer();
    const page = await browser.newPage({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
    for (const lang of LOCALES) {
      // One language that breaks the flow must not hide what was already found
      // (the first mutation audit lost "back did not close the replay" that way).
      try {
      await openRecords(page, lang);
      const rows = await page.locator('.replay-list-open').count();
      if (rows !== 2) { failures.push(`${lang}: the records screen lists ${rows} replays, not 2`); continue; }

      // Both shared: my board, then theirs.
      await page.locator('.replay-list-open').nth(0).click();
      await page.waitForSelector('.replay-layer .replay-board .sudoku-cell', { timeout: 5000 });
      opened++;
      if (lang === 'ko') {
        await page.click('.replay-play');
        await page.waitForTimeout(700);
        const moved = await page.evaluate(() => Number(document.querySelector('.replay-timeline input').value));
        if (!(moved > 0)) failures.push('ko: pressing play did not move the replay');
        await page.click('.replay-play');
      }
      await scrubToEnd(page);
      if ((await page.evaluate(drawnBoard)) !== EXPECT.mine) failures.push(`${lang}: my board at the end is not the board my moves make`);
      if (!(await page.locator('.replay-marks span').count())) failures.push(`${lang}: my mistake is not marked on the time bar`);
      const their = page.locator('.replay-sides .seg-tab-btn').nth(1);
      if (await their.isDisabled()) failures.push(`${lang}: the opponent's board cannot be opened although their moves came`);
      else {
        await their.click();
        await scrubToEnd(page);
        if ((await page.evaluate(drawnBoard)) !== EXPECT.theirs) failures.push(`${lang}: the opponent's board at the end is not the board their moves make`);
      }
      await checkFit(page, `${lang} shared`, failures);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
      if (await page.locator('.replay-layer').count()) failures.push(`${lang}: back did not close the replay`);
      if (!(await page.locator('.stats-screen-container').count())) failures.push(`${lang}: back left the records screen`);

      // Declined: no opponent board, and a reason.
      await page.setViewportSize({ width: 360, height: 800 });
      await page.locator('.replay-list-open').nth(1).click();
      await page.waitForSelector('.replay-layer .replay-board', { timeout: 5000 });
      opened++;
      if (!(await page.locator('.replay-sides .seg-tab-btn').nth(1).isDisabled())) failures.push(`${lang}: the opponent's board can be opened although they declined`);
      const why = (await page.locator('.replay-body > .replay-note').first().textContent().catch(() => '')) || '';
      if (why.trim().length < 8 || why.includes('replay.')) failures.push(`${lang}: no reason is given for the missing opponent board ("${why.trim()}")`);
      await checkFit(page, `${lang} declined`, failures);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
      } catch (e) {
        failures.push(`${lang}: the flow stopped — ${e.message.split('\n')[0]}`);
      }
    }

    // A killer match's replay draws its cages and their sums, and ends on its moves.
    try {
      await openRecords(page, 'en', [KILLER, SHARED]);
      await page.locator('.replay-list-open').first().click();
      await page.waitForSelector('.replay-layer .replay-board .sudoku-cell', { timeout: 5000 });
      const drawn = await page.evaluate(() => ({
        outlines: document.querySelectorAll('.replay-board .cage-outline').length,
        sums: [...document.querySelectorAll('.replay-board .cage-sum')].map((e) => Number(e.textContent.trim())).sort((a, b) => a - b),
      }));
      const want = kp.cages.map((c) => c.sum).sort((a, b) => a - b);
      if (drawn.outlines !== 81) failures.push(`killer replay: ${drawn.outlines} of 81 cells draw a cage outline`);
      if (JSON.stringify(drawn.sums) !== JSON.stringify(want)) failures.push(`killer replay: the cage sums drawn (${drawn.sums.length}) are not the record's ${want.length}`);
      await scrubToEnd(page);
      if ((await page.evaluate(drawnBoard)) !== KSOL) failures.push('killer replay: the board at the end is not the solution its moves make');
      await checkFit(page, 'en killer', failures);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
    } catch (e) {
      failures.push(`killer replay: the flow stopped — ${e.message.split('\n')[0]}`);
    }

    // A question asked over the replay is seen: starring past the limit says so on top of it.
    const pinnedFull = Array.from({ length: 20 }, (_, i) => ({ ...SHARED, id: `PIN${i}-0`, pinned: true, savedAt: now - 3600000 - i }));
    await openRecords(page, 'ko', [SHARED, ...pinnedFull]);
    await page.locator('.replay-list-open').first().click();
    await page.waitForSelector('.replay-layer');
    await page.click('.replay-screen .replay-pin');
    await page.waitForTimeout(300);
    const onTop = await page.evaluate(() => {
      const card = document.querySelector('.confirm-modal-card');
      if (!card) return 'no message at all';
      const b = card.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      return card.contains(hit) ? 'top' : `covered by ${(hit && hit.className) || 'something'}`;
    });
    if (onTop !== 'top') failures.push(`ko: the star-limit message is not visible over the replay (${onTop})`);

    // The AdMob banner is a native overlay, so a browser has none. Give the page
    // the banner height the SDK would report, and the end of the replay must still
    // scroll clear of it (on a Flip5 the banner covered the last summary rows).
    const BANNER = 64;
    await openRecords(page, 'ko');
    await page.evaluate((h) => document.documentElement.style.setProperty('--ad-banner-h', `${h}px`), BANNER);
    await page.locator('.replay-list-open').first().click();
    await page.waitForSelector('.replay-layer .replay-summary');
    const clear = await page.evaluate((h) => {
      const layer = document.querySelector('.replay-layer');
      layer.scrollTop = layer.scrollHeight;
      const rows = document.querySelectorAll('.replay-summary .replay-sum-row');
      return Math.round(innerHeight - h - rows[rows.length - 1].getBoundingClientRect().bottom);
    }, BANNER);
    if (clear < 0) failures.push(`ko: with a ${BANNER}px banner, the last summary row stays ${-clear}px under it`);
  } finally {
    await browser.close();
    vite.kill();
    try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
  }

  const expected = LOCALES.length * 2;
  console.log(`▶ opened ${opened} of ${expected} replays`);
  if (opened !== expected) failures.push(`only ${opened} of ${expected} replays were opened`);
  if (failures.length) {
    console.error(`\n❌ [FAIL] The replay screen (${failures.length}):`);
    failures.slice(0, 40).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('\n🎉 [3-17] PASSED — replays open, end on the board their moves make, say why a board is missing, and fit.');
}

run().catch((err) => {
  console.error('❌ Gate 3-17 crashed:', err);
  process.exit(1);
});
