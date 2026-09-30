/**
 * Gate 3-15 — the app starts when the network does not answer.
 *
 * Until 2026-09-29 the first line of index.css @imported Google Fonts. A stylesheet
 * @import holds back painting and the app's scripts until it answers, so on a network
 * that neither answers nor fails — weak signal, a half-dead connection — the real build
 * stayed blank for more than 30 seconds (at 10 s: #root empty, no stylesheets). Offline
 * it was fine, because the request failed at once. It also sent every player's IP to
 * Google on every launch (BACKLOG FONT-1, SudokuDiary 57).
 *
 * This runs the real build with every request to a host other than the preview server
 * held open — never answered, never failed — and asks:
 *   1. does the home screen appear, styled, promptly
 *   2. did the app try to reach anyone at all while starting
 *   3. are the fonts it now bundles actually in the bundle
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const PORT = 5215;
const URL = `http://localhost:${PORT}`;
const START_MS = 3000;
// Hosts the app may contact while starting. Empty on purpose: adding one is a decision
// (what does the player's first screen wait on, and what does the privacy policy say).
const ALLOWED_AT_START = new Set([]);
// The faces index.css bundles (@fontsource, latin subset).
const BUNDLED = [
  ['Outfit', 400], ['Outfit', 500], ['Outfit', 600], ['Outfit', 700], ['Outfit', 800],
  ['Playfair Display', 700], ['Playfair Display', 800],
  ['Space Grotesk', 600], ['Space Grotesk', 700],
];

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
console.log('📴 Gate 3-15: the app starts when the network does not answer');
console.log('======================================================');

const errors = [];
const vite = spawn('npx.cmd', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });
let browser;
try {
  await waitForServer(URL);
  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const reached = [];
  await ctx.route('**/*', (route) => {
    const u = new globalThis.URL(route.request().url());
    if (u.hostname === 'localhost' || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue();
    reached.push(u.hostname);
    // held open: no response, no error — the network that neither answers nor fails
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`page error: ${e.message}`));

  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'commit' });
  let ms = null;
  while (Date.now() - t0 < START_MS + 7000) {
    const styled = await page.evaluate(() => {
      const el = document.querySelector('.battle-card-banner');
      if (!el) return false;
      return el.getBoundingClientRect().height > 20 && getComputedStyle(el).borderRadius !== '0px';
    }).catch(() => false);
    if (styled) { ms = Date.now() - t0; break; }
    await page.waitForTimeout(50);
  }
  if (ms === null) errors.push(`with the network held open, the home screen did not show within ${START_MS + 7000}ms — something on the first screen waits for the network`);
  else if (ms > START_MS) errors.push(`with the network held open, the home screen took ${ms}ms (limit ${START_MS}ms)`);
  console.log(`  ① home screen, network held open: ${ms === null ? 'never' : `${ms}ms`}`);

  await page.waitForTimeout(1500);   // anything fired right after the first paint
  const outside = [...new Set(reached)].filter((h) => !ALLOWED_AT_START.has(h));
  if (outside.length) errors.push(`the app reached out while starting: ${outside.join(', ')} — each is a wait on the first screen and a disclosure to that host`);
  console.log(`  ② hosts contacted while starting: ${outside.length ? outside.join(', ') : 'none'}`);

  const faces = await page.evaluate(() => [...document.fonts].map((f) => `${f.family.replace(/["']/g, '')}|${f.weight}`));
  const have = new Set(faces);
  const missing = BUNDLED.filter(([fam, w]) => !have.has(`${fam}|${w}`)).map(([f, w]) => `${f} ${w}`);
  if (missing.length) errors.push(`not bundled: ${missing.join(', ')} — the page falls back to a system face (or the fonts moved back to the network)`);
  console.log(`  ③ bundled faces: ${BUNDLED.length - missing.length}/${BUNDLED.length}`);
} finally {
  if (browser) await browser.close();
  shutdown(vite);
}

if (errors.length) {
  console.error('\n❌ [FAIL] The app does not start cleanly without the network:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n🎉 [3-15] PASSED — starts at once with the network held open, contacts no one, fonts are bundled.');
