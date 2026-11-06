/**
 * test_text_size_board.js — gate 3-22
 *
 * Settings → Display (D9, 2026-11-06): four text steps and high contrast. Gate
 * 2-34 checks the numbers and the native side; this one looks at the screen.
 *
 *   1. At the largest step, on a phone, a large phone and a tablet lying down,
 *      standard and killer, with notes in eight cells: no cell overflows and no
 *      note leaves its cell. The step must actually be on the board — the digit
 *      is read back against the board's width — or the check measured a normal
 *      board (the numbers a 1.3 digit gave before the 1.2 cap: its 1.4em text
 *      box was 44.5px in a 41px cell). What it cannot see: a note's ink crossing
 *      the dashed cage line — a note's text box is taller than its slot even at the
 *      normal size, so the notes' 1.15 cap is held by gate 2-34, not here.
 *   2. High contrast, in each of the four themes: the thin grid lines reach 3:1
 *      against the board and notes take the main text colour (and are ≥ 7:1;
 *      without it they are the muted colour), the box
 *      lines get thicker; and with it off the same lines are under 3:1 — otherwise
 *      the switch could do nothing and this would still pass.
 *   3. The preview in Settings draws a digit the same size, against its width,
 *      as the board does — it is a preview of the board, not a picture of one.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const PORT = 5223;
const URL = `http://localhost:${PORT}`;
const SIZES = [[360, 640], [412, 891], [1280, 800]];
const THEMES = ['clay', 'matte-dark', 'pure-ceramic', 'editorial'];

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

// Relative luminance and contrast ratio of two CSS rgb() colours.
const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

console.log('======================================================');
console.log('🔠 Gate 3-22: The largest text step fits the board; high contrast is high');
console.log('======================================================');

const errors = [];
let boards = 0;
let themes = 0;
const vite = spawn('npx.cmd', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });

async function openGame(browser, { w, h, kind, settings }) {
  // A phone's pixel density: at 1 a 0.5px line and a 1px line both draw as one pixel, and
  // the thicker lines of high contrast could not be told apart.
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3 })).newPage();
  page.on('pageerror', (e) => errors.push(`${w}x${h} ${kind}: page error ${e.message}`));
  await page.goto(URL);
  await page.evaluate((s) => {
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ guidedOffered: { classic: true, killer: true }, language: 'ko', killerRulesSeen: true, ...s }));
    localStorage.setItem('suidoku_review_prompted', 'done');
  }, settings);
  await page.reload();
  await page.waitForSelector('.home-bottom-nav');
  for (let i = 0; i < 3; i++) {
    const b = page.locator('.modal-card .btn').first();
    if (!(await b.count())) break;
    await b.click().catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.locator('.variant-switch .variant-option').nth(kind === 'killer' ? 1 : 0).click();
  await page.locator('.home-screen-container .btn-play-new').first().click();
  await page.waitForSelector('.sudoku-board-container .sudoku-cell', { timeout: 8000 });
  await page.waitForTimeout(300);
  return page;
}

try {
  await waitForServer(URL);
  const browser = await chromium.launch();

  // 1. The largest step on the board, with notes.
  for (const [w, h] of SIZES) for (const kind of ['classic', 'killer']) {
    const where = `${w}x${h} ${kind}`;
    const page = await openGame(browser, { w, h, kind, settings: { theme: 'clay', textSize: 'xlarge' } });
    const empties = await page.evaluate(() => [...document.querySelectorAll('.sudoku-cell')]
      .map((c, i) => (c.querySelector('.cell-number') ? -1 : i)).filter((i) => i >= 0).slice(0, 8));
    await page.locator('.action-toolbar .action-btn').nth(2).click();
    for (const i of empties) {
      await page.locator('.sudoku-cell').nth(i).click();
      for (let d = 1; d <= 9; d++) await page.locator(`.number-pad .num-btn:nth-child(${d})`).click();
    }
    await page.locator('.action-toolbar .action-btn').nth(2).click();
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => {
      const board = document.querySelector('.sudoku-board-container');
      const cs = getComputedStyle(board);
      const inner = board.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const over = (e) => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1;
      const cells = [...document.querySelectorAll('.sudoku-cell')];
      const noted = cells.filter((c) => c.querySelector('.cell-notes-grid'));
      let outside = 0;
      for (const c of noted) {
        const g = c.getBoundingClientRect();
        for (const n of c.querySelectorAll('.note-digit')) {
          if (!n.textContent) continue;
          const range = document.createRange(); range.selectNodeContents(n);
          const x = range.getBoundingClientRect();
          if (x.top < g.top - 0.5 || x.bottom > g.bottom + 0.5 || x.left < g.left - 0.5 || x.right > g.right + 0.5) outside++;
        }
      }
      const digit = document.querySelector('.cell-number');
      return {
        killer: Boolean(board.classList.contains('killer-board')),
        digitPerWidth: digit ? parseFloat(getComputedStyle(digit).fontSize) / inner : 0,
        overflow: cells.filter(over).length,
        noted: noted.length,
        noteOverflow: noted.flatMap((c) => [...c.querySelectorAll('.note-digit')]).filter(over).length,
        outside,
      };
    });
    boards++;
    if (r.killer !== (kind === 'killer')) errors.push(`${where}: the game started was not a ${kind} board — this case measured the wrong kind`);
    // 6.1cqw × 1.2 of the board's inner width: 0.0732. A board left at the normal step reads 0.061.
    if (Math.abs(r.digitPerWidth - 0.0732) > 0.003) errors.push(`${where}: the digit is ${(r.digitPerWidth * 100).toFixed(2)}% of the board — the largest step did not reach the board (expected 7.32%)`);
    if (r.noted < 8) errors.push(`${where}: notes went into ${r.noted} of 8 cells — the notes were not measured`);
    if (r.overflow) errors.push(`${where}: ${r.overflow} cells overflow at the largest step — a digit or its notes bigger than the cell (D9)`);
    if (r.noteOverflow || r.outside) errors.push(`${where}: ${r.noteOverflow + r.outside} notes do not fit their cell at the largest step (D9)`);
    console.log(`  ${where.padEnd(22)} digit ${(r.digitPerWidth * 100).toFixed(2)}% of the board · ${r.noted} noted cells · overflow ${r.overflow} · notes out ${r.noteOverflow + r.outside}`);
    await page.close();
  }

  // 2. High contrast in every theme, and the same lines without it.
  for (const theme of THEMES) {
    const read = async (highContrast) => {
      const page = await openGame(browser, { w: 412, h: 891, kind: 'classic', settings: { theme, highContrast } });
      const empty = await page.evaluate(() => [...document.querySelectorAll('.sudoku-cell')].findIndex((c) => !c.querySelector('.cell-number')));
      await page.locator('.action-toolbar .action-btn').nth(2).click();
      await page.locator('.sudoku-cell').nth(empty).click();
      await page.locator('.number-pad .num-btn:nth-child(4)').click();
      await page.locator('.action-toolbar .action-btn').nth(2).click();
      // A cell nobody selected, in a box nobody selected, so no highlight paints it.
      await page.locator('.sudoku-cell').nth(empty).click();
      const r = await page.evaluate((i) => {
        const cells = [...document.querySelectorAll('.sudoku-cell')];
        const sel = cells[i];
        const plain = cells.find((c, k) => !c.className.match(/selected|related|same-value/) && Math.abs(Math.floor(k / 9) - Math.floor(i / 9)) > 3 && !c.querySelector('.cell-notes-grid'));
        const thick = cells.find((c) => c.classList.contains('border-right-thick'));
        const note = sel.querySelector('.note-digit:not(:empty)');
        return {
          grid: getComputedStyle(plain).borderTopColor, bg: getComputedStyle(plain).backgroundColor,
          cellWidth: parseFloat(getComputedStyle(plain).borderTopWidth), thickWidth: parseFloat(getComputedStyle(thick).borderRightWidth),
          note: note ? getComputedStyle(note).color : null, noteBg: getComputedStyle(sel).backgroundColor,
          // The theme's main text colour, resolved by the browser the way the note's is.
          main: (() => { const p = document.createElement('span'); p.style.color = 'var(--text-main)'; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; })(),
          cls: document.documentElement.className, bodyCls: document.body.className,
        };
      }, empty);
      await page.close();
      return r;
    };
    const on = await read(true);
    const off = await read(false);
    themes++;
    const gOn = ratio(on.grid, on.bg), gOff = ratio(off.grid, off.bg);
    if (!on.cls.includes('high-contrast') || on.bodyCls !== `theme-${theme}`) errors.push(`${theme}: high contrast or the theme was not on the page (<html class="${on.cls}">, <body class="${on.bodyCls}">)`);
    if (gOn < 3) errors.push(`${theme}: with high contrast the grid lines are ${gOn.toFixed(2)}:1 against the board — under 3:1`);
    if (gOff >= 3) errors.push(`${theme}: without high contrast the grid lines are already ${gOff.toFixed(2)}:1 — this check cannot tell the switch did anything`);
    if (!on.note) errors.push(`${theme}: no note on the board — the note colour was not measured`);
    else {
      if (on.note !== on.main) errors.push(`${theme}: with high contrast a note is ${on.note}, the main text ${on.main} — notes should take the main text colour`);
      if (off.note === off.main) errors.push(`${theme}: without high contrast notes are already the main text colour — this check cannot tell the switch did anything`);
      if (ratio(on.note, on.noteBg) < 7) errors.push(`${theme}: with high contrast a note is ${ratio(on.note, on.noteBg).toFixed(2)}:1 against its cell — under 7:1`);
    }
    // The box lines, not the cell lines: current engines snap a border to whole pixels, so the
    // cell line's 0.5px and high contrast's 1px both draw as 1px — there the change is the colour,
    // measured above. The box lines go from 2.5 to 3.5 and stay apart after snapping.
    if (!(on.thickWidth > off.thickWidth)) errors.push(`${theme}: the box lines did not get thicker (${off.thickWidth}→${on.thickWidth}px)`);
    if (on.cellWidth < off.cellWidth) errors.push(`${theme}: the cell lines got thinner with high contrast (${off.cellWidth}→${on.cellWidth}px)`);
    console.log(`  ${theme.padEnd(14)} grid ${gOff.toFixed(2)} → ${gOn.toFixed(2)}:1 · note ${on.note ? ratio(on.note, on.noteBg).toFixed(1) : '?'}:1 · lines ${off.cellWidth}/${off.thickWidth} → ${on.cellWidth}/${on.thickWidth}px`);
  }

  // 3. The preview is the board's own proportion.
  {
    const page = await openGame(browser, { w: 412, h: 891, kind: 'classic', settings: { theme: 'clay', textSize: 'large' } });
    const boardRatio = await page.evaluate(() => {
      const b = document.querySelector('.sudoku-board-container'); const cs = getComputedStyle(b);
      return parseFloat(getComputedStyle(document.querySelector('.cell-number')).fontSize) / (b.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    });
    await page.goto(URL);
    await page.waitForSelector('.home-bottom-nav');
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((x) => /settings|설정/i.test(`${x.getAttribute('aria-label') || ''}${x.title || ''}`));
      btn?.click();
    });
    await page.waitForSelector('.display-preview .cell-number', { timeout: 5000 }).catch(() => {});
    const previewRatio = await page.evaluate(() => {
      const b = document.querySelector('.display-preview'); if (!b) return null;
      const cs = getComputedStyle(b);
      return parseFloat(getComputedStyle(b.querySelector('.cell-number')).fontSize) / (b.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    });
    if (previewRatio == null) errors.push('Settings: no display preview found — the preview was not measured');
    else if (Math.abs(previewRatio - boardRatio) / boardRatio > 0.03) errors.push(`Settings: the preview draws a digit at ${(previewRatio * 100).toFixed(2)}% of its width, the board at ${(boardRatio * 100).toFixed(2)}% — not the board's proportion`);
    console.log(`  preview digit ${(previewRatio * 100).toFixed(2)}% of its width · board ${(boardRatio * 100).toFixed(2)}%`);
    await page.close();
  }
  await browser.close();
} finally {
  shutdown(vite);
}

const expected = SIZES.length * 2;
console.log(`▶ boards at the largest step: ${boards} of ${expected} · themes with high contrast: ${themes} of ${THEMES.length}`);
if (boards !== expected) errors.push(`the largest step was measured on ${boards} of ${expected} boards`);
if (themes !== THEMES.length) errors.push(`high contrast was measured in ${themes} of ${THEMES.length} themes`);

if (errors.length) {
  console.error('\n❌ [FAIL] Text size or contrast:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n🎉 [3-22] PASSED — the largest text step fits the board and high contrast is high in every theme.');
