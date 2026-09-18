/**
 * test_academy_practice_play.js
 * QA Gate 3-11: every academy practice, played in the real app.
 *
 * Gate 2-5 proves each practice's answer follows from its board. That is logic on
 * data. It does not prove the screen: that the board the player sees is the board
 * that was checked, that tapping the answer says "correct", that every other digit is
 * refused, that a "which candidate goes?" mission shows the right prompt. Before
 * 2026-09-18 only a handful of practices had ever been tapped by hand.
 *
 * The boards and answers are the same data in every language, so the exhaustive
 * part runs once; what changes per language, theme and screen is checked per pass:
 *
 *   ko · dark · 360px     all nine digits on every mission: eight refused (and the
 *                         refusal clears), the answer accepted and shown, retry resets
 *   12 languages · 360px  text on screen = data, board drawn left-to-right, answer accepted
 *                         (Arabic sets dir=rtl on the page — a mirrored grid would put
 *                         r1c1 on the right and every coordinate in the guide would lie)
 *   ko · 3 other themes   answer accepted; candidates, struck-out candidates and plain
 *                         cells readable against their background (contrast ≥ 3:1)
 *   ko · 884px wide       tablet width: board fits, nine cells a row, answer accepted
 *
 * Every pass also checks: cell count, one target, cells per row for the layout, the
 * board inside the screen, the prompt for the mission type, and no page errors.
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';
import { ACADEMY_STAGES } from '../../../src/data/academyStrategies.js';
import { getPracticeMissions } from '../../../src/data/academy/practice/index.js';
import DICTIONARIES from '../../../src/i18n/dictionaries.js';

const PORT = 5211;
const URL = `http://localhost:${PORT}`;
const PHONE = { width: 360, height: 800 };
const UNFOLDED = { width: 884, height: 1104 };
const THEMES = ['clay', 'pure-ceramic', 'editorial'];

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

const pick = (obj, lang) => (obj && (obj[lang] ?? obj.en ?? obj.ko)) || '';
const promptText = (lang, key) => DICTIONARIES[lang]?.academy?.practiceUi?.[key] ?? DICTIONARIES.en.academy.practiceUi[key];
const COLS = (m) => ({ grid9x9: 9, grid6x6: 6, grid4x4: 4, box3x3: 3, twoBoxes: 3, grid6x3: 6, twoBoxesRow: 6, row: m.cells.length }[m.layoutType] ?? 3);

const PLAN = ACADEMY_STAGES.map((stage, si) => ({
  si,
  strategies: stage.strategies.map((s) => ({ id: s.id, missions: getPracticeMissions(s.id) })),
}));
const TOTAL = PLAN.reduce((n, s) => n + s.strategies.reduce((m, st) => m + st.missions.length, 0), 0);

const errors = [];
let plays = 0;
let taps = 0;

async function pass(browser, { lang, theme, viewport, allDigits = false, contrast = false, label }) {
  const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text()); });
  await page.goto(URL);
  await page.evaluate(([l, t]) => localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: l, theme: t })), [lang, theme]);
  await page.reload();
  await page.waitForSelector('.home-bottom-nav');
  await page.click('.home-bottom-nav button:nth-child(3)');
  await page.waitForSelector('.academy-tab-bar .seg-tab-btn');
  const before = errors.length;
  let n = 0;

  for (const stage of PLAN) {
    await page.locator('.academy-tab-bar .seg-tab-btn').nth(stage.si).click();
    await page.waitForTimeout(150);
    const cards = page.locator('.strategy-item-card');
    if ((await cards.count()) !== stage.strategies.length) { errors.push(`[${label}] stage ${stage.si + 1}: card count differs from data`); continue; }
    for (let k = 0; k < stage.strategies.length; k++) {
      const card = cards.nth(k);
      const tabs = card.locator('.practice-tab-btn');
      for (let e = 0; e < stage.strategies[k].missions.length; e++) {
        const m = stage.strategies[k].missions[e];
        const where = `[${label}] ${m.id}`;
        await tabs.nth(e + 1).click();
        await page.waitForTimeout(60);

        const shown = await card.evaluate((el, cols) => {
          const cells = [...el.querySelectorAll('.practice-mission-container .mini-cell, .practice-mission-container .mini-9cell')];
          const top = cells.length ? Math.round(cells[0].getBoundingClientRect().top) : 0;
          const firstRow = cells.filter((c) => Math.abs(Math.round(c.getBoundingClientRect().top) - top) <= 2);
          const board = el.querySelector('.practice-mission-container [class*="board"], .practice-mission-container .mini-row-grid');
          // WCAG contrast of an element's text against the backgrounds actually behind it
          const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
          const parse = (s) => { const x = s.match(/rgba?\(([^)]+)\)/); if (!x) return null; const p = x[1].split(',').map((y) => parseFloat(y)); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
          const bgOf = (node) => {
            const layers = [];
            for (let x = node; x; x = x.parentElement) { const c = parse(getComputedStyle(x).backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } }
            let rgb = [255, 255, 255];
            for (const l of layers.reverse()) rgb = rgb.map((v, i) => v * (1 - l.a) + l.rgb[i] * l.a);
            return rgb;
          };
          const ratio = (node) => { const fg = parse(getComputedStyle(node).color); if (!fg) return 99; const a = lum(fg.rgb), b = lum(bgOf(node)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
          const sample = (sel) => { const x = el.querySelector(`.practice-mission-container ${sel}`); return x ? Math.round(ratio(x) * 10) / 10 : null; };
          return {
            title: el.querySelector('.practice-guide-box strong')?.textContent || '',
            guide: el.querySelector('.practice-guide-box p')?.textContent || '',
            cells: cells.length,
            perRow: firstRow.length,
            leftToRight: firstRow.length < 2 || firstRow[0].getBoundingClientRect().left < firstRow[firstRow.length - 1].getBoundingClientRect().left,
            targets: el.querySelectorAll('.practice-mission-container .target-interactive').length,
            prompt: el.querySelector('.practice-hint-prompt')?.textContent?.trim() || '',
            right: board ? board.getBoundingClientRect().right : 0,
            contrast: { note: sample('.mini-note-grid span:not([class]):not(:empty)'), erased: sample('.candidate-erased'), value: sample('.mini-cell:not(.note-grid-cell)') },
            cols,
          };
        }, COLS(m));

        if (shown.title !== pick(m.title, lang)) errors.push(`${where}: title on screen differs from data`);
        if (shown.guide !== pick(m.guide, lang)) errors.push(`${where}: guide on screen differs from data`);
        if (shown.cells !== m.cells.length) errors.push(`${where}: ${shown.cells} cells drawn, ${m.cells.length} in data`);
        if (shown.perRow !== shown.cols) errors.push(`${where}: ${shown.perRow} cells per row drawn, layout ${m.layoutType} needs ${shown.cols}`);
        if (!shown.leftToRight) errors.push(`${where}: board drawn right-to-left — r1c1 is not on the left, every coordinate in the guide points at the wrong cell`);
        if (shown.targets !== 1) errors.push(`${where}: ${shown.targets} target cells drawn`);
        if (shown.right > viewport.width + 0.5) errors.push(`${where}: board runs off the screen (${Math.round(shown.right)}px of ${viewport.width})`);
        const want = promptText(lang, m.asks === 'eliminated' ? 'promptEliminated' : 'prompt').trim();
        if (shown.prompt !== want) errors.push(`${where}: prompt "${shown.prompt}" ≠ "${want}"`);
        if (contrast) for (const [kind, r] of Object.entries(shown.contrast)) if (r !== null && r < 3) errors.push(`${where}: ${kind} text contrast ${r}:1 on ${theme}`);

        const keys = card.locator('.practice-keypad-grid .practice-key-btn');
        if (allDigits) {
          for (let d = 1; d <= 9; d++) {
            if (d === m.correctVal) continue;
            await keys.nth(d - 1).click();
            taps++;
            if (!(await card.locator('.practice-error-badge').count())) errors.push(`${where}: digit ${d} was not refused`);
            if (await card.locator('.practice-success-badge').count()) errors.push(`${where}: digit ${d} was accepted`);
            await card.locator('.practice-error-badge').waitFor({ state: 'detached', timeout: 2000 }).catch(() => errors.push(`${where}: refusal of ${d} did not clear`));
          }
        }
        await keys.nth(m.correctVal - 1).click();
        taps++;
        if (!(await card.locator('.practice-success-badge').count())) errors.push(`${where}: the answer ${m.correctVal} was not accepted`);
        if (allDigits) {
          const solved = await card.locator('.target-solved').first().textContent().catch(() => '');
          if (!String(solved).includes(String(m.correctVal))) errors.push(`${where}: target does not show ${m.correctVal} once solved`);
          await card.locator('.practice-retry-btn').click();
          if (await card.locator('.practice-success-badge').count()) errors.push(`${where}: retry did not reset`);
        }
        plays++;
        n++;
      }
    }
  }
  if (pageErrors.length) errors.push(`[${label}] page errors: ${[...new Set(pageErrors)].slice(0, 3).join(' | ')}`);
  console.log(`  ${errors.length > before ? '❌' : '✅'} ${label.padEnd(28)} ${n} missions`);
  await context.close();
}

console.log('======================================================');
console.log(`🎮 Academy practice play-through — ${TOTAL} missions`);
console.log('======================================================');
execSync('npm.cmd run build', { stdio: 'ignore' });
const vite = spawn('npx.cmd', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });
try {
  await waitForServer(URL);
  const browser = await chromium.launch({ headless: true });
  await pass(browser, { lang: 'ko', theme: 'matte-dark', viewport: PHONE, allDigits: true, contrast: true, label: 'ko · all nine digits' });
  for (const lang of LOCALES.filter((l) => l !== 'ko')) await pass(browser, { lang, theme: 'matte-dark', viewport: PHONE, label: `${lang} · text + direction` });
  for (const theme of THEMES) await pass(browser, { lang: 'ko', theme, viewport: PHONE, contrast: true, label: `ko · theme ${theme}` });
  await pass(browser, { lang: 'ko', theme: 'matte-dark', viewport: UNFOLDED, label: 'ko · tablet width 884px' });
  await browser.close();
} catch (e) {
  errors.push(`harness: ${e.message}`);
} finally {
  shutdown(vite);
}

console.log(`\n${plays} missions played · ${taps} taps`);
if (errors.length) {
  // One line per kind of problem — the same fault usually repeats on every mission.
  console.error(`\n🚨 ${errors.length} problem(s), grouped:`);
  const groups = new Map();
  for (const e of errors) {
    const m = e.match(/^\[([^\]]+)\] (\S+): (.*)$/);
    const key = m ? `[${m[1]}] ${m[3].replace(/\d+(\.\d+)?:1/, 'N:1').replace(/\d+px/g, 'Npx').replace(/digit \d/, 'digit N').replace(/answer \d/, 'answer N')}` : e;
    const g = groups.get(key) || { n: 0, sample: e };
    g.n++;
    groups.set(key, g);
  }
  for (const [k, g] of groups) console.error(` - ${k}  ×${g.n}   e.g. ${g.sample}`);
  process.exit(1);
}
console.log('🎉 Every academy practice plays correctly in every language.');
