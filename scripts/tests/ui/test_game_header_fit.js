/**
 * test_game_header_fit.js — gate 3-16
 *
 * The game header fits: every language × every kind of puzzle × every mode it
 * plays, at 360px and 320px, at the normal font and at the 1.3x text zoom
 * MainActivity allows. A killer's badge says KILLER / КИЛЛЕР / 杀手数独 where the
 * mode name was (2026-10-01). The cases come from variants.js since 2026-10-14
 * (killer Survival, KP-2): the list had one killer case, Classic, and killer
 * Speedrun (2026-10-07) was never measured — a mode a kind gains is now measured
 * with it.
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
 *   4. The AI battle's header (KP-11, 2026-10-14), standard and killer, under the
 *      same rules with the longest bot name — and it names the kind, in the lobby
 *      switch's word, over the VS without making the header taller. Until then no
 *      gate measured the battle header at all.
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
import { VARIANTS } from '../../../src/engine/variants.js';
import { DICTIONARIES } from '../../../src/i18n/dictionaries.js';

const PORT = 5213;
const URL = `http://localhost:${PORT}`;
// Every kind × every mode it plays: [name, mode, its tab on Home, kind]. The kind is
// chosen with the puzzle switch above the tabs.
const TAB = { classic: 1, timeAttack: 2, timeLimit: 3 };
const MODES = VARIANTS.flatMap((v) => v.modes.map((mode) => [v.id === 'classic' ? mode : `${v.id} ${mode}`, mode, TAB[mode], v.id]));
const CASES = [[360, 1], [320, 1], [360, 1.3], [320, 1.3]];

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}

/**
 * D47 (2026-10-29): the pause button was its 13×13 icon, and the page's title was
 * the Korean line in index.html in every language. Now the whole timer badge is
 * the button: a point just inside each corner of the badge must reach it. And the
 * title is the language's own home.title.
 */
function readPause() {
  const b = document.querySelector('.game-header .timer-badge');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  const corners = [[r.left + 3, r.top + 3], [r.right - 3, r.top + 3], [r.left + 3, r.bottom - 3], [r.right - 3, r.bottom - 3]];
  const reached = corners.filter(([x, y]) => {
    const e = document.elementFromPoint(x, y);
    return b.tagName === 'BUTTON' && e && e.closest('button') === b;
  }).length;
  return { reached, width: Math.round(r.width), height: Math.round(r.height), title: document.title };
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

async function openGame(page, lang, tab, kind) {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  await page.evaluate(({ l, killer }) => {
    localStorage.clear();
    const settings = { guidedOffered: { classic: true, killer: true }, language: l, theme: 'matte-dark' };
    // Home opens on the killer switch, and the first-killer rules card is already seen.
    if (killer) Object.assign(settings, { homeVariant: 'killer', killerRulesSeen: true });
    localStorage.setItem('suidoku_settings_v1', JSON.stringify(settings));
    localStorage.setItem('suidoku_review_prompted', '1');
  }, { l: lang, killer: kind === 'killer' });
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
  if ((kind === 'killer') !== Boolean(await page.locator('.killer-board').count())) {
    throw new Error(`${lang}: the ${kind} case opened a game of the other kind`);
  }
  return (await page.locator('.game-header .version-tag').innerText()).trim();
}

/**
 * The AI battle's header (KP-11, 2026-10-14): what readHeader reads for the solo
 * one, plus the kind of puzzle over the VS — the lobby switch's word on both
 * kinds (user: "킬러인지 클래식인지 알 수 있게 해야지") — and whether that tag made
 * the header taller than the three lines either side of it.
 */
function readBattleHeader() {
  const h = document.querySelector('.battle-header-card');
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
    if (b.right > Math.min(hb.right, innerWidth) + 1 || b.left < Math.max(hb.left, 0) - 1) {
      out.push(`${name} "${text}"`);
      continue;
    }
    const s = getComputedStyle(e);
    if (s.overflow === 'visible' || e.scrollWidth <= e.clientWidth + 1) continue;
    (s.textOverflow === 'ellipsis' ? shortened : cut).push(`${name} ${e.scrollWidth - e.clientWidth}px "${text}"`);
  }
  const tag = h.querySelector('.battle-kind-tag');
  const stack = h.querySelector('.battle-vs-stack');
  const sides = [...h.querySelectorAll('.player-countdown-box')].map((e) => e.getBoundingClientRect().height);
  return {
    pageScroll: document.documentElement.scrollWidth - innerWidth,
    out, cut, shortened,
    kind: tag ? { text: tag.innerText.trim(), variant: tag.dataset.variant, shown: Boolean(tag.offsetParent) } : null,
    taller: stack && sides.length ? Math.round(stack.getBoundingClientRect().height - Math.max(...sides)) : null,
  };
}

/** An AI battle of this kind, started from the lobby's switch; returns the switch's word. */
// Each language's bot names, read from the app's own dictionary.
async function botNames(lang) {
  const mod = await import(`../../../src/i18n/locales/${lang}/screens.js`);
  return Object.values(mod)[0].battleHeader.botNames;
}
async function longestBotId(lang) {
  const names = await botNames(lang);
  return Object.keys(names).reduce((a, b) => ([...names[b]].length > [...names[a]].length ? b : a));
}

async function openBattle(page, lang, kind) {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  await page.evaluate((l) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ guidedOffered: { classic: true, killer: true }, language: l, theme: 'matte-dark', killerRulesSeen: true }));
    localStorage.setItem('suidoku_review_prompted', '1');
  }, lang);
  await page.reload();
  await page.waitForSelector('.home-bottom-nav');
  for (let i = 0; i < 3; i++) {
    if (!(await page.locator('.modal-overlay').count())) break;
    await page.locator('.modal-overlay button').last().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.click('.ai-card-banner', { timeout: 5000 });
  const option = page.locator(`.battle-lobby-container .variant-option[data-variant="${kind}"]`);
  await option.click({ timeout: 5000 });
  const word = (await option.innerText()).trim();
  await page.click('.btn-battle-action', { timeout: 5000 });
  await page.waitForSelector('.battle-header-card', { timeout: 8000 });
  // The longest bot name in this language: the opponent's side is the one that runs short
  // of room. The room holds the bot's id and the header names it in the player's language
  // (D28) — setting an English opponentName, as this did, no longer reaches the screen.
  const longest = await longestBotId(lang);
  await page.evaluate((id) => {
    window.suidokuBattle.currentRoom.botId = id;
    window.suidokuBattle.notifyListeners();
  }, longest);
  const shown = await page.locator('.battle-header-card').innerText();
  const want = (await botNames(lang))[longest];
  if (!shown.includes(want)) throw new Error(`${lang}: the AI header does not show its longest bot name "${want}" — the measurement would not reach it`);
  await page.waitForTimeout(150);
  return word;
}

async function run() {
  console.log('======================================================');
  console.log(`📐 Gate 3-16: the game header fits (13 languages × ${MODES.length} kinds and modes × 360/320px × font 1/1.3)`);
  console.log('======================================================');

  const vite = spawn('cmd', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const failures = [];
  let measured = 0;
  let squeezed = 0;
  let expected = 0;
  let battleMeasured = 0;
  let battleSqueezed = 0;
  let battleExpected = 0;
  let pauseChecked = 0;
  try {
    await waitForServer();
    const page = await browser.newPage({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
    for (const lang of LOCALES) {
      const classicBadge = {};
      for (const [name, mode, tab, kind] of MODES) {
        const badge = await openGame(page, lang, tab, kind);
        if (kind === 'classic') classicBadge[mode] = badge;
        // The killer badge is the one string a killer case adds; measuring a header that
        // still says the mode name would measure the classic header a second time.
        else if (badge === classicBadge[mode]) failures.push(`${lang} ${name}: the header says "${badge}", the classic badge — not its own`);
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
          const where = `${lang} ${name} ${width}px font×${scale}`;
          if (!r) { failures.push(`${where}: no .game-header — the case was not measured`); continue; }
          measured++;
          if (width === 320 || scale !== 1) squeezed += r.wrapped + r.shortened.length;
          if (r.headerScroll > 1) failures.push(`${where}: header scrolls sideways by ${r.headerScroll}px`);
          if (r.pageScroll > 0) failures.push(`${where}: the page scrolls sideways by ${r.pageScroll}px`);
          for (const o of r.out) failures.push(`${where}: off the screen — ${o}`);
          for (const o of r.overlaps) failures.push(`${where}: covers a button — ${o}`);
          for (const c of r.cut) failures.push(`${where}: text cut without "…" — ${c}`);
          if (width === 360 && scale === 1) for (const s of r.shortened) failures.push(`${where}: shortened on an ordinary phone — ${s}`);
          const p = await page.evaluate(readPause);
          pauseChecked++;
          if (!p) failures.push(`${where}: no timer badge — the pause button was not measured`);
          else if (p.reached !== 4) failures.push(`${where}: the pause button does not cover the timer badge (${p.reached} of 4 corners reach it, badge ${p.width}×${p.height})`);
          const title = DICTIONARIES[lang]?.home?.title;
          if (p && p.title !== title) failures.push(`${where}: the page title is "${p.title}", not this language's "${title}"`);
        }
      }
    }

    // The AI battle's header, on either kind (KP-11). Same rules; and it names the kind.
    for (const lang of LOCALES) {
      for (const kind of VARIANTS.map((v) => v.id)) {
        const word = await openBattle(page, lang, kind);
        let scaled = false;
        for (const [width, scale] of CASES) {
          battleExpected++;
          if (scale !== 1 && !scaled) {
            await page.evaluate((s) => {
              const els = [...document.querySelectorAll('.battle-header-card, .battle-header-card *')];
              const sizes = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
              els.forEach((e, i) => { e.style.fontSize = `${sizes[i] * s}px`; });
            }, scale);
            scaled = true;
          }
          await page.setViewportSize({ width, height: 800 });
          await page.waitForTimeout(120);
          const r = await page.evaluate(readBattleHeader);
          const where = `${lang} ${kind} AI battle ${width}px font×${scale}`;
          if (!r) { failures.push(`${where}: no .battle-header-card — the case was not measured`); continue; }
          battleMeasured++;
          if (width === 320 || scale !== 1) battleSqueezed += r.shortened.length;
          if (!r.kind?.shown) failures.push(`${where}: no kind on the battle header — a standard and a killer match look the same`);
          else if (r.kind.variant !== kind || r.kind.text !== word) failures.push(`${where}: the battle header says "${r.kind.text}" (${r.kind.variant}) on a ${kind} match — the lobby switch said "${word}"`);
          if (r.taller > 1) failures.push(`${where}: the kind over the VS makes the battle header taller by ${r.taller}px`);
          if (r.pageScroll > 0) failures.push(`${where}: the page scrolls sideways by ${r.pageScroll}px`);
          for (const o of r.out) failures.push(`${where}: off the screen — ${o}`);
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
  console.log(`▶ pause button over the whole timer badge and the page title: ${pauseChecked} of ${expected} cases`);
  if (pauseChecked !== expected) failures.push(`the pause button and title were checked in ${pauseChecked} of ${expected} cases`);
  console.log(`▶ AI battle header: measured ${battleMeasured} of ${battleExpected} cases; "…" in the narrow cases: ${battleSqueezed}`);
  if (battleMeasured !== battleExpected) failures.push(`only ${battleMeasured} of ${battleExpected} AI battle cases were measured`);
  if (battleSqueezed === 0) failures.push('no AI battle case shortened anything — the battle sweep never reached the squeeze it exists to test');

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
