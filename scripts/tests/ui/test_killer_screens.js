/**
 * test_killer_screens.js — gate 3-18
 *
 * A killer game, on the screen, from the home switch to the win (2026-10-01).
 *
 * Gates 2-27 and 2-28 prove the puzzles and the records in Node. Neither sees
 * what the player sees: whether the dashed outlines follow the cages the game
 * holds, whether the sums sit in the right corners, whether Home offers the
 * right game. This plays it in a browser:
 *
 *   1. Home — both kinds show the same card (same tabs, same chips, the ⓘ),
 *      so switching does not change its height; a mode or rival the killer does
 *      not have yet says it is coming instead of switching (user, 2026-10-01);
 *      the ⓘ opens the selected kind's rules; the switch survives a reload
 *   2. the first killer starts after its rules; the board's outlines and sums
 *      match the cages saved for the game, cell by cell
 *   3. the second killer starts straight away
 *   4. Resume is offered on the kind of game that was saved, and only there
 *   5. a killer won from the board shows no classic grade, and moves the killer
 *      record only — not the classic one, the ghost or the daily mission
 *   6. 13 languages at 360px and at 320px with a 1.3x font: the switch, the rules
 *      card and the killer stats card are not cut and do not scroll sideways
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';
import { generateKillerPuzzle } from '../../../src/engine/killer/killerGenerator.js';
import { cloneGrid } from '../../../src/engine/SudokuEngine.js';

const PORT = 5218;
const URL = `http://localhost:${PORT}`;
const IS_WIN = process.platform === 'win32';
const failures = [];
const fail = (msg) => failures.push(msg);
// A control that cannot be tapped is a finding, not a reason to stop: stopping
// on a timeout threw away the failures already found (the reason a mutation
// broke the screen) and printed only "crashed".
async function tap(page, selector, where) {
  try {
    await page.click(selector, { timeout: 3000 });
    return true;
  } catch {
    fail(`${where}: could not tap ${selector}`);
    return false;
  }
}

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}

/** Fresh storage: the given settings, today's attendance claimed, no review prompt. */
async function prime(page, { settings = {}, state = null } = {}) {
  await page.goto(URL);
  await page.evaluate(({ settings: s, state: g }) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en', theme: 'matte-dark', ...s }));
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem('suidoku_user_wallet_v1', JSON.stringify({ hints: 3, lastDailyClaimDate: today, streakDays: 1, totalAdsWatched: 0, history: [] }));
    localStorage.setItem('suidoku_review_prompted', '1');
    if (g) localStorage.setItem('suidoku_game_state_v1', JSON.stringify(g));
  }, { settings, state });
  await page.reload();
  await page.waitForSelector('.home-bottom-nav', { timeout: 8000 });
}

const readJSON = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);

/**
 * Compare the board with the cages: each cell's outline must have a side line
 * exactly where its neighbour is in another cage (or off the board), and each
 * cage's sum must sit in its top-left cell.
 */
function readBoard(cages) {
  const cageOf = new Array(81);
  cages.forEach((cage, k) => cage.cells.forEach((c) => { cageOf[c] = k; }));
  const cells = [...document.querySelectorAll('.sudoku-cell')];
  const wrong = [];
  cells.forEach((el, i) => {
    const r = Math.floor(i / 9);
    const c = i % 9;
    const lines = [...el.querySelectorAll('.cage-outline line')].map((l) => ['x1', 'y1', 'x2', 'y2'].map((a) => Number(l.getAttribute(a))));
    // A side runs most of the cell; the corner pieces that join neighbours are short.
    const side = (test) => lines.some(([x1, y1, x2, y2]) => Math.hypot(x2 - x1, y2 - y1) > 50 && test(x1, y1, x2, y2));
    const drawn = {
      top: side((x1, y1, x2, y2) => y1 === y2 && y1 < 50),
      bottom: side((x1, y1, x2, y2) => y1 === y2 && y1 > 50),
      left: side((x1, y1, x2) => x1 === x2 && x1 < 50),
      right: side((x1, y1, x2) => x1 === x2 && x1 > 50),
    };
    const open = {
      top: r > 0 && cageOf[i - 9] === cageOf[i],
      bottom: r < 8 && cageOf[i + 9] === cageOf[i],
      left: c > 0 && cageOf[i - 1] === cageOf[i],
      right: c < 8 && cageOf[i + 1] === cageOf[i],
    };
    for (const s of ['top', 'bottom', 'left', 'right']) {
      if (drawn[s] === open[s]) wrong.push(`r${r + 1}c${c + 1} ${s}: ${drawn[s] ? 'a line inside its own cage' : 'no line against the next cage'}`);
    }
  });
  const sums = cells.map((el) => el.querySelector('.cage-sum')?.textContent ?? null);
  const misplaced = cages
    .filter((cage) => sums[Math.min(...cage.cells)] !== String(cage.sum))
    .map((cage) => `cage ${JSON.stringify(cage.cells)} should show ${cage.sum} at its top-left, shows ${sums[Math.min(...cage.cells)]}`);
  return { wrong, misplaced, sumCount: sums.filter((s) => s !== null).length, cellCount: cells.length };
}

async function run() {
  console.log('======================================================');
  console.log('🔪 Gate 3-18: a killer game on the screen (home, board, win, 13 languages)');
  console.log('======================================================');
  execSync(IS_WIN ? 'npm.cmd run build' : 'npm run build', { stdio: 'ignore' });
  const server = spawn(IS_WIN ? 'cmd' : 'sh', [IS_WIN ? '/c' : '-c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  const browser = await chromium.launch();
  try {
    await waitForServer();
    const page = await browser.newPage({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    // ── 1. Home ──────────────────────────────────────────────────────────
    await prime(page);
    // Measured once the fonts have arrived and the card has finished coming in:
    // measured mid-entrance it is taller by a few pixels, and compared with one
    // measured later, a "jump" that no player sees (seen 2026-10-01: 334 vs 328).
    const cardHeight = () => page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));
      return Math.round(document.querySelector('.single-card').getBoundingClientRect().height);
    });
    const visible = (sel) => page.evaluate((q) => { const e = document.querySelector(q); return Boolean(e && e.offsetParent); }, sel);
    const standardHeight = await cardHeight();
    if (!(await visible('.variant-rules-btn'))) fail('1: no ⓘ on the standard switch — the switch changes width with the kind');
    if (await tap(page, '.variant-rules-btn', '1: standard ⓘ') &&
        !(await page.locator('.variant-rules-card[data-variant="classic"]').count())) fail('1: the ⓘ on standard did not open the standard rules');
    await page.locator('.variant-rules-card button').click().catch(() => {});
    await page.click('.variant-option[data-variant="killer"]');
    const killerHeight = await cardHeight();
    await page.click('.variant-option[data-variant="classic"]');
    const standardAgain = await cardHeight();
    await page.click('.variant-option[data-variant="killer"]');
    if (Math.abs(killerHeight - standardAgain) > 1) fail(`1: the home card is ${standardAgain}px on standard and ${killerHeight}px on killer — the layout jumps`);
    if (!(await visible('.mode-tab-group'))) fail('1: no mode tabs on the killer switch');
    if (!(await visible('.rival-mode-chip-group'))) fail('1: no rival chips on the killer switch');
    await tap(page, '.mode-tab-btn.time-attack-tab', '1: killer Speedrun tab');
    const activeTab = await page.locator('.mode-tab-btn.active').innerText().catch(() => '');
    if (!(await page.locator('.mode-tab-btn.active:not(.time-attack-tab):not(.time-limit-tab)').count())) fail(`1: the Speedrun tab on the killer switch changed the mode (active: "${activeTab}") instead of saying it is coming`);
    if (!(await page.locator('.coming-soon-popup').count())) fail('1: the Speedrun tab on the killer switch said nothing');
    await tap(page, '.rival-chip.ghost-chip', '1: killer Ghost chip');
    const notes = await page.locator('.locked-mode-popup').count();
    const comingNotes = await page.locator('.coming-soon-popup').count();
    if (notes !== 1 || comingNotes !== 1) fail(`1: after the Ghost chip on the killer switch, ${notes} note(s) are shown, ${comingNotes} of them "coming soon" — one note, the same one, is expected`);
    if (await tap(page, '.variant-rules-btn', '1: killer ⓘ') &&
        !(await page.locator('.variant-rules-card[data-variant="killer"]').count())) fail('1: the ⓘ on killer did not open the killer rules');
    await page.locator('.variant-rules-card button').click().catch(() => {});
    await page.reload();
    await page.waitForSelector('.home-bottom-nav');
    if (!(await page.locator('.variant-option.active[data-variant="killer"]').count())) fail('1: the killer switch was forgotten on reload');
    console.log(`  ▶ 1. home: one card shape (${standardAgain}px both; first look ${standardHeight}px), coming-soon note, rules for each kind`);

    // ── 2. The first killer ──────────────────────────────────────────────
    await prime(page, { settings: { homeVariant: 'killer' } });
    await page.click('.home-screen-container .btn-play-new');
    await page.waitForTimeout(300);
    if (!(await page.locator('.variant-rules-card[data-variant="killer"]').count())) fail('2: the first killer started without its rules');
    else if (await page.locator('.sudoku-grid').count()) fail('2: the game started behind the rules card');
    await page.locator('.variant-rules-card button').click().catch(() => fail('2: the rules card has no button to start'));
    await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => fail('2: the rules card did not start a killer'));
    await page.waitForTimeout(400);
    const saved = await readJSON(page, 'suidoku_game_state_v1');
    if (saved?.variant !== 'killer' || !Array.isArray(saved?.cages)) {
      fail(`2: the game saved as "${saved?.variant}" with ${saved?.cages?.length ?? 'no'} cages`);
    } else {
      const b = await page.evaluate(readBoard, saved.cages);
      if (b.cellCount !== 81) fail(`2: ${b.cellCount} cells on the board`);
      b.wrong.slice(0, 8).forEach((w) => fail(`2: outline — ${w}`));
      b.misplaced.slice(0, 8).forEach((m) => fail(`2: sum — ${m}`));
      if (b.sumCount !== saved.cages.length) fail(`2: ${b.sumCount} sums on the board for ${saved.cages.length} cages`);
    }
    if (!(await page.locator('.game-header .version-tag[data-variant="killer"]').count())) fail('2: the game header does not say killer');
    console.log('  ▶ 2. first killer: rules, then outlines and sums checked against the saved cages');

    // ── 3. The second killer ─────────────────────────────────────────────
    const settings = await readJSON(page, 'suidoku_settings_v1');
    if (!settings?.killerRulesSeen) fail('3: starting from the rules card did not remember that they were seen');
    await page.goto(URL);
    await page.waitForSelector('.home-bottom-nav');
    await page.click('.home-screen-container .btn-play-new');
    await page.waitForTimeout(300);
    if (await page.locator('.variant-rules-card').count()) fail('3: the rules came back before the second killer');
    console.log('  ▶ 3. second killer starts without the rules');

    // ── 4. Resume on its own kind ────────────────────────────────────────
    const p = generateKillerPuzzle(1, 'gate-3-18-win');
    const last = p.board.flat().findIndex((d, i) => !d && i > 0);
    const board = cloneGrid(p.solution);
    board[Math.floor(last / 9)][last % 9] = 0;
    const state = {
      board, initialBoard: cloneGrid(p.board), solutionBoard: p.solution,
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      mistakes: 0, timerSeconds: 30, level: 1, gameMode: 'classic', variant: 'killer', cages: p.cages,
      isFastEntryMode: false, lockedNumber: null, adHintsUsedThisGame: 0, hintsUsedCount: 0,
    };
    await prime(page, { settings: { homeVariant: 'classic', killerRulesSeen: true }, state });
    if (await page.locator('.btn-resume').count()) fail('4: the standard switch offers to resume a killer');
    await page.click('.variant-option[data-variant="killer"]');
    if (!(await page.locator('.btn-resume').count())) fail('4: the killer switch does not offer the killer in progress');
    console.log('  ▶ 4. resume offered on its own kind only');

    // ── 5. A killer won ──────────────────────────────────────────────────
    await page.click('.btn-resume').catch(() => {});
    await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => fail('5: resume did not open the killer'));
    await page.locator('.sudoku-cell').nth(last).click();
    await page.locator(`.number-pad .num-btn:nth-child(${p.solution[Math.floor(last / 9)][last % 9]})`).click();
    try {
      await page.locator('.victory-card').waitFor({ state: 'visible', timeout: 8000 });
      if (await page.locator('.victory-rank-banner').count()) fail('5: a killer win shows the classic grade — its times are graded for classic puzzles');
      const stats = await readJSON(page, 'suidoku_user_stats_v1');
      if (stats?.killer?.gamesWon !== 1) fail(`5: the killer record shows ${stats?.killer?.gamesWon} wins after one`);
      if (!(stats?.killer?.bestTimes?.[1] > 0)) fail('5: the killer win set no Lv.1 best time');
      if (stats?.gamesWon) fail(`5: the classic record shows ${stats.gamesWon} win(s) after a killer`);
      if (await readJSON(page, 'suidoku_ghost_records_v1')) fail('5: a killer win recorded a ghost run');
      if (await readJSON(page, 'suidoku_daily_records_v1')) fail('5: a killer win touched the daily records');
    } catch {
      fail('5: no victory card after the last correct digit');
    }
    console.log('  ▶ 5. killer win: no grade, killer record only');

    // ── 6. Thirteen languages ────────────────────────────────────────────
    let measured = 0;
    const CASES = [[360, 1], [320, 1.3]];
    const scale = (sel, s) => page.evaluate(({ sel: q, s: k }) => {
      const els = [...document.querySelectorAll(`${q}, ${q} *`)];
      const sizes = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
      els.forEach((e, i) => { e.style.fontSize = `${sizes[i] * k}px`; });
    }, { sel, s });
    const cuts = (sel) => page.evaluate((q) => {
      const out = [];
      const root = document.querySelector(q);
      if (!root) return ['not on screen'];
      for (const el of [root, ...root.querySelectorAll('*')]) {
        const b = el.getBoundingClientRect();
        if (!b.width) continue;
        const name = el.className || el.tagName;
        if (b.right > innerWidth + 0.5 || b.left < -0.5) out.push(`${name} off the screen`);
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible') out.push(`${name} cut`);
        // Text that runs past its own box. The box stays where it was, so neither its
        // position nor a page scroll shows it — a fixed card does not scroll the page.
        const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (ownText && el.scrollWidth > el.clientWidth + 1) out.push(`"${el.textContent.trim().slice(0, 30)}" runs past its box`);
      }
      if (document.documentElement.scrollWidth > innerWidth) out.push('the page scrolls sideways');
      return out;
    }, sel);
    for (const lang of LOCALES) {
      for (const [width, s] of CASES) {
        const where = `${lang} ${width}px font×${s}`;
        await page.setViewportSize({ width, height: 800 });
        await prime(page, { settings: { language: lang, homeVariant: 'killer', killerRulesSeen: true } });
        if (s !== 1) await scale('.variant-switch-row', s);
        (await cuts('.variant-switch-row')).forEach((c) => fail(`6: ${where} switch — ${c}`));
        if (await tap(page, '.mode-tab-btn.time-attack-tab', `6: ${where}`) && await page.locator('.coming-soon-popup').count()) {
          if (s !== 1) await scale('.coming-soon-popup', s);
          (await cuts('.coming-soon-popup')).forEach((c) => fail(`6: ${where} coming-soon note — ${c}`));
          await tap(page, '.coming-soon-popup .locked-popup-close-btn', `6: ${where}`);
        }
        for (const kind of ['classic', 'killer']) {
          await tap(page, `.variant-option[data-variant="${kind}"]`, `6: ${where}`);
          if (!(await tap(page, '.variant-rules-btn', `6: ${where} ${kind} ⓘ`))) continue;
          if (!(await page.locator(`.variant-rules-card[data-variant="${kind}"]`).count())) continue;
          if (s !== 1) await scale('.variant-rules-card', s);
          (await cuts('.variant-rules-card')).forEach((c) => fail(`6: ${where} ${kind} rules — ${c}`));
          await tap(page, '.variant-rules-card button', `6: ${where}`);
        }
        await page.click('.home-bottom-nav .nav-item:nth-child(1)');
        await page.waitForSelector('.killer-stats-card');
        // The stats screen slides in from 20px to the right (slideInRight); measured
        // mid-slide, every card on it hangs off the edge.
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        if (s !== 1) await scale('.killer-stats-card', s);
        (await cuts('.killer-stats-card')).forEach((c) => fail(`6: ${where} stats — ${c}`));
        measured++;
      }
    }
    if (measured !== LOCALES.length * CASES.length) fail(`6: measured ${measured} of ${LOCALES.length * CASES.length} cases`);
    console.log(`  ▶ 6. ${measured} language × size cases measured`);
    errors.forEach((e) => fail(`runtime error: ${e}`));
  } finally {
    await browser.close();
    server.kill();
    try { execSync(`${IS_WIN ? 'npx.cmd' : 'npx'} kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
  }

  if (failures.length) {
    console.error(`\n❌ [FAIL] A killer game on the screen (${failures.length}):`);
    failures.slice(0, 40).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('\n🎉 [3-18] PASSED — a killer game on the screen, from the switch to the win, in 13 languages.');
}

run().catch((err) => {
  failures.forEach((f) => console.error(`  - ${f}`));
  console.error('❌ Gate 3-18 crashed:', err);
  process.exit(1);
});
