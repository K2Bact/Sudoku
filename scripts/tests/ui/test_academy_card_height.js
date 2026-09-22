/**
 * test_academy_card_height.js
 * QA Gate 3-13: each academy card is as tall as its own tallest tab — no more, no less.
 *
 * Until 2026-09-19 every card had one min-height, sized for a 9x9 practice board with
 * its keypad. A technique whose tabs are all small (Full House: one row of nine digits)
 * sat in a frame hundreds of pixels too tall. Before that, with no min-height, switching
 * tabs moved the page by up to 273px. The rule now (user): the card's height is the
 * tallest of ITS three tabs.
 *
 * For every card of all five stages, on three phone widths:
 *   - the card is the same height on the theory tab, practice 1 and practice 2
 *   - the frame is no taller than the tallest tab's content (slack <= 2px)
 *   - the invisible measuring copies are gone once the page settles (no duplicate boards)
 */
import assert from 'assert';
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import { ACADEMY_STAGES } from '../../../src/data/academyStrategies.js';

const PORT = 5213;
const URL = `http://localhost:${PORT}`;
const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 384, height: 857 },   // Flip5
  { width: 412, height: 915 },
];
const SLACK_PX = 2;

console.log('\n======================================================');
console.log('📏 Gate 3-13: each academy card is as tall as its tallest tab');
console.log('======================================================');

try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });
const wait = async () => {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(URL)).ok) return; } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('preview server did not start');
};

const errors = [];
const rows = [];
let checked = 0;
const browser = await chromium.launch();
try {
  await wait();
  for (const viewport of VIEWPORTS) {
    const page = await (await browser.newContext({ viewport, isMobile: true, hasTouch: true })).newPage();
    await page.goto(URL);
    await page.evaluate(() => localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en', theme: 'matte-dark' })));
    await page.reload();
    await page.waitForSelector('.home-bottom-nav');
    await page.click('.home-bottom-nav button:nth-child(3)');
    await page.waitForSelector('.academy-tab-bar .seg-tab-btn');
    await page.evaluate(() => document.fonts && document.fonts.ready);

    for (let si = 0; si < ACADEMY_STAGES.length; si++) {
      await page.locator('.academy-tab-bar .seg-tab-btn').nth(si).click();
      await page.waitForTimeout(200);
      const cards = page.locator('.strategy-item-card');
      const n = await cards.count();
      assert.strictEqual(n, ACADEMY_STAGES[si].strategies.length, `stage ${si + 1}: card count differs from data`);
      for (let k = 0; k < n; k++) {
        const card = cards.nth(k);
        const id = ACADEMY_STAGES[si].strategies[k].id;
        const where = `${viewport.width}px ${id}`;
        const tabs = card.locator('.practice-tab-btn');
        const t = await tabs.count();
        const seen = [];
        for (let i = 0; i < t; i++) {
          await tabs.nth(i).click();
          await page.waitForTimeout(40);
          seen.push(await card.locator('.interactive-practice-card').evaluate((el) => {
            const slot = el.querySelector('.practice-panel-slot');
            const content = slot && slot.firstElementChild;
            return {
              card: el.getBoundingClientRect().height,
              slot: slot ? slot.getBoundingClientRect().height : -1,
              content: content ? content.getBoundingClientRect().height : -1,
              ghosts: slot ? slot.querySelectorAll(':scope > [aria-hidden="true"]').length : -1,
              // empty space between the frame and the card's own bottom edge — a height set
              // on the card itself shows up here, not in the frame
              below: slot ? (() => {
                const cs = getComputedStyle(el);
                return el.getBoundingClientRect().bottom - slot.getBoundingClientRect().bottom
                  - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth);
              })() : -1,
            };
          }));
        }
        checked++;
        if (seen.some((s) => s.slot < 0)) { errors.push(`${where}: no .practice-panel-slot — the measuring frame is gone`); continue; }
        const cardHs = seen.map((s) => s.card);
        if (Math.max(...cardHs) - Math.min(...cardHs) > 1) {
          errors.push(`${where}: card height changes between tabs (${cardHs.map(Math.round).join(' / ')}px)`);
        }
        const tallest = Math.max(...seen.map((s) => s.content));
        const slack = Math.round(seen[0].slot - tallest);
        if (slack > SLACK_PX) errors.push(`${where}: frame is ${slack}px taller than its tallest tab`);
        const below = Math.round(Math.max(...seen.map((s) => s.below)));
        if (below > SLACK_PX) errors.push(`${where}: ${below}px of empty card below the tallest tab`);
        if (seen.some((s) => s.ghosts > 0)) errors.push(`${where}: measuring copies are still in the page`);
        if (viewport.width === 384) rows.push(`${id.padEnd(20)} ${String(Math.round(seen[0].card)).padStart(4)}px  tabs: ${seen.map((s) => Math.round(s.content)).join(' / ')}`);
      }
    }
    await page.context().close();
  }
} finally {
  await browser.close();
  server.kill();
  try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* already down */ }
}

console.log('\nFlip5 width (384px): card height, and each tab\'s own height');
for (const r of rows) console.log('  ' + r);
assert(checked >= 32 * VIEWPORTS.length, `only ${checked} cards were measured — expected every card on every width`);
if (errors.length) {
  console.error(`\n❌ ${errors.length} problem(s):\n  - ` + errors.slice(0, 40).join('\n  - '));
  process.exit(1);
}
console.log(`\n🎉 ${checked} card checks: every card is as tall as its tallest tab, steady across tabs, no leftover copies`);
