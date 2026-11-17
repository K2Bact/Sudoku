/**
 * test_daily_done_message.js — gate 3-26: a finished day says why it does not open (D36, 2026-11-06).
 *
 * The calendar has one mark per day, and the day's mission (a 1v1, a Lv.3 clear …) sets it as well as
 * the day's puzzle. A day finished by its mission therefore kept its puzzle shut — and pressing the
 * date did nothing at all (stability round 1, the Flip5). Now it says so. Three finished days, the
 * clock held on 2026-11-15, in all 13 languages at 360px:
 *
 *   today, by its mission       → daily.doneByMission
 *   the 14th, by its puzzle     → daily.doneAlready
 *   the 13th, a record from before `via` existed → daily.doneAlready (it cannot know which)
 *
 * and none of them starts a game. The message box fits (nothing off screen or cut).
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';

const PORT = 5227;
const URL = `http://localhost:${PORT}`;
const { DICTIONARIES } = await import('../../../src/i18n/dictionaries.js');
const NOW = new Date('2026-11-15T12:00:00');
const RECORDS = {
  '2026-11-15': { completed: true, timeSeconds: 0, mistakes: 0, variant: 'classic', via: 'mission', completedAt: '2026-11-15T03:00:00Z' },
  '2026-11-14': { completed: true, timeSeconds: 412, mistakes: 1, variant: 'classic', via: 'puzzle', completedAt: '2026-11-14T03:00:00Z' },
  '2026-11-13': { completed: true, timeSeconds: 0, mistakes: 0, variant: 'killer', completedAt: '2026-11-13T03:00:00Z' },
};

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}

async function run() {
  console.log('======================================================');
  console.log('📅 Gate 3-26: a finished day says why it does not open (13 languages, 360px)');
  console.log('======================================================');
  const vite = spawn('cmd', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const failures = [];
  let pressed = 0;
  try {
    await waitForServer();
    for (const lang of LOCALES) {
      const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
      try {
        await page.clock.setFixedTime(NOW);
        await page.goto(URL);
        await page.evaluate(([l, recs]) => {
          localStorage.clear();
          localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: l, guidedOffered: { classic: true, killer: true } }));
          localStorage.setItem('suidoku_review_prompted', '1');
          localStorage.setItem('suidoku_daily_records_v1', JSON.stringify(recs));
        }, [lang, RECORDS]);
        await page.reload();
        await page.waitForSelector('.home-bottom-nav');
        for (let i = 0; i < 3; i++) {
          const b = page.locator('.modal-card .btn').first();
          if (!(await b.count())) break;
          await b.click().catch(() => {});
          await page.waitForTimeout(250);
        }
        await page.click('.daily-card-banner');
        await page.waitForSelector('.calendar-day-btn');
        const t = (k) => k.split('.').reduce((o, p) => o?.[p], DICTIONARIES[lang]);
        for (const [day, key] of [[15, 'daily.doneByMission'], [14, 'daily.doneAlready'], [13, 'daily.doneAlready']]) {
          await page.locator('.calendar-day-btn', { has: page.locator('.day-number', { hasText: new RegExp(`^${day}$`) }) }).click();
          await page.waitForTimeout(350);
          const r = await page.evaluate(() => {
            const card = document.querySelector('.confirm-overlay .modal-card');
            if (!card) return null;
            const cut = [...card.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 || b.left < -1 || e.scrollWidth > e.clientWidth + 1; });
            return { text: card.querySelector('.modal-desc')?.textContent.trim(), cut: cut.length };
          });
          if (!r) failures.push(`${lang} day ${day}: pressing a finished day says nothing`);
          else {
            if (r.text !== t(key)) failures.push(`${lang} day ${day}: says "${(r.text || '').slice(0, 50)}" — want ${key}`);
            if (r.cut) failures.push(`${lang} day ${day}: ${r.cut} elements of the message off screen or cut`);
            await page.locator('.confirm-overlay .btn-primary').click();
            await page.waitForTimeout(250);
          }
          if (await page.locator('.game-screen-wrapper').count()) failures.push(`${lang} day ${day}: a finished day started a game`);
          pressed++;
        }
      } catch (e) {
        failures.push(`${lang}: the flow stopped — ${e.message.split('\n')[0]}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    vite.kill();
    try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
  }
  const want = LOCALES.length * 3;
  console.log(`▶ pressed ${pressed} of ${want} finished days`);
  if (pressed !== want) failures.push(`only ${pressed} of ${want} days were pressed`);
  if (failures.length) {
    console.error(`\n❌ [FAIL] Finished days (${failures.length}):`);
    failures.slice(0, 30).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log(`\n🎉 [3-26] PASSED — a day finished by its mission says so; other finished days say they are done; none starts a game.`);
}

run().catch((err) => {
  console.error('❌ Gate 3-26 crashed:', err);
  process.exit(1);
});
