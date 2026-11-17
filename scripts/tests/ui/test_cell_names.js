/**
 * test_cell_names.js — gate 3-25: every board cell has a name a screen reader can say (D47, 2026-11-06).
 *
 * The third stability round read the accessibility tree Chrome computes — what TalkBack reads — and
 * found the board's empty cells were nameless buttons (39 on a Lv.2 board, 27 on a killer) and a
 * filled cell was its digit with no place. This gate reads the same tree (CDP Accessibility) on the
 * game screen, standard and killer, in all 13 languages:
 *
 *   - no button on the game screen without a name;
 *   - each cell's name is this language's sentence for its row, column and content — given digit,
 *     entered digit, notes or empty — and in a killer, its cage's sum, on every cell of the cage;
 *   - in a short window (≤520px) restart and new game are icons, and still have their names.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';

const PORT = 5226;
const URL = `http://localhost:${PORT}`;
const { DICTIONARIES } = await import('../../../src/i18n/dictionaries.js');
const { cellLabel } = await import('../../../src/utils/cellLabel.js');

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}
const tFor = (lang) => (key, vars = {}) => {
  const s = key.split('.').reduce((o, p) => o?.[p], DICTIONARIES[lang]);
  return String(s ?? key).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
};

async function startGame(page, lang, kind, height = 800) {
  await page.setViewportSize({ width: 412, height });
  await page.goto(URL);
  await page.evaluate((l) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: l, killerRulesSeen: true, guidedOffered: { classic: true, killer: true } }));
    localStorage.setItem('suidoku_review_prompted', '1');
  }, lang);
  await page.reload();
  await page.waitForSelector('.home-bottom-nav');
  for (let i = 0; i < 3; i++) {
    const b = page.locator('.modal-card .btn').first();
    if (!(await b.count())) break;
    await b.click().catch(() => {});
    await page.waitForTimeout(250);
  }
  await page.locator('.variant-switch .variant-option').nth(kind === 'killer' ? 1 : 0).click();
  await page.locator('.home-screen-container .btn-play-new').first().click();
  await page.waitForSelector('.sudoku-board-container .sudoku-cell');
  await page.waitForTimeout(300);
}

/** What the page's game state says each cell holds, to build the expected names from. */
const readCells = () => {
  const gs = JSON.parse(localStorage.getItem('suidoku_game_state_v1') || 'null');
  return { board: gs?.board, initial: gs?.initialBoard, notes: gs?.notes, cages: gs?.cages || null };
};

async function unnamedButtons(page) {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  await cdp.detach();
  return nodes.filter((n) => !n.ignored && n.role?.value === 'button' && !(n.name?.value || '').trim()).length;
}

async function run() {
  console.log('======================================================');
  console.log('🔊 Gate 3-25: every board cell has a name (13 languages, standard and killer)');
  console.log('======================================================');
  const vite = spawn('cmd', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const failures = [];
  let checked = 0;
  try {
    await waitForServer();
    const page = await browser.newPage();
    for (const lang of LOCALES) {
      for (const kind of ['classic', 'killer']) {
        try {
          await startGame(page, lang, kind);
          // a note in one empty cell, so the notes sentence is read too
          await page.evaluate(async () => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            const cells = [...document.querySelectorAll('.sudoku-board-container .sudoku-cell')];
            const i = cells.findIndex((c) => !c.querySelector('.cell-number'));
            const acts = document.querySelectorAll('.action-toolbar .action-btn');
            acts[2].click(); await sleep(150); cells[i].click(); await sleep(100);
            document.querySelectorAll('.number-pad .num-btn')[2].click(); await sleep(100);
            document.querySelectorAll('.number-pad .num-btn')[6].click(); await sleep(150);
            acts[2].click(); await sleep(250);
          });
          const n = await unnamedButtons(page);
          if (n) failures.push(`${lang} ${kind}: ${n} buttons without a name on the game screen`);
          const names = await page.$$eval('.sudoku-board-container .sudoku-cell', (cs) => cs.map((c) => c.getAttribute('aria-label') || ''));
          const st = await page.evaluate(readCells);
          if (!st.board) { failures.push(`${lang} ${kind}: no saved game to compare with`); continue; }
          if (kind === 'killer' && !st.cages) failures.push(`${lang} killer: the saved game has no cages`);
          const t = tFor(lang);
          let wrong = 0;
          let sample = '';
          const sumOf = new Map();
          (st.cages || []).forEach((cage) => cage.cells.forEach((cell) => sumOf.set(cell, cage.sum)));
          for (let i = 0; i < 81; i++) {
            const r = Math.floor(i / 9);
            const c = i % 9;
            const want = cellLabel(t, { r, c, value: st.board[r][c], given: st.initial[r][c] !== 0, notes: st.notes?.[r]?.[c] || [], cageSum: kind === 'killer' ? sumOf.get(i) : undefined });
            if (names[i] !== want) { wrong++; sample ||= `cell ${i}: "${names[i]}" — want "${want}"`; }
          }
          if (wrong) failures.push(`${lang} ${kind}: ${wrong} cells named wrongly — ${sample}`);
          const withNotes = names.filter((x) => x.includes(t('board.cellNotes', { list: '3 7' }))).length;
          if (withNotes !== 1) failures.push(`${lang} ${kind}: ${withNotes} cells read "${t('board.cellNotes', { list: '3 7' })}" (want the 1 with notes)`);
          checked++;
        } catch (e) {
          failures.push(`${lang} ${kind}: the flow stopped — ${e.message.split('\n')[0]}`);
        }
      }
    }
    // A short window: restart and new game lose their words, not their names.
    await startGame(page, 'en', 'classic', 500);
    const shortNames = await page.evaluate(() => [...document.querySelectorAll('.restart-btn, .new-game-btn')].map((b) => ({
      name: b.getAttribute('aria-label'), textShown: [...b.querySelectorAll('span')].some((s) => getComputedStyle(s).display !== 'none'),
    })));
    if (shortNames.length !== 2 || shortNames.some((b) => !b.name)) failures.push(`500px window: restart / new game without a name (${JSON.stringify(shortNames)})`);
    if (shortNames.some((b) => b.textShown)) failures.push('500px window: restart / new game still show their words — the row did not become icons (D44)');
    const n = await unnamedButtons(page);
    if (n) failures.push(`500px window: ${n} buttons without a name`);
  } finally {
    await browser.close();
    vite.kill();
    try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
  }
  const want = LOCALES.length * 2;
  console.log(`▶ checked ${checked} of ${want} boards`);
  if (checked !== want) failures.push(`only ${checked} of ${want} boards were checked`);
  if (failures.length) {
    console.error(`\n❌ [FAIL] Cell names (${failures.length}):`);
    failures.slice(0, 30).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log(`\n🎉 [3-25] PASSED — every cell says where it is and what it holds, in ${LOCALES.length} languages; no nameless button on the game screen.`);
}

run().catch((err) => {
  console.error('❌ Gate 3-25 crashed:', err);
  process.exit(1);
});
