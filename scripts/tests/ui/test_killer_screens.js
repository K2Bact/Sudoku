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
 *      so switching does not change its height; Speedrun (2026-10-07) and
 *      Survival (2026-10-14, KP-2) switch the killer card to their own start —
 *      Survival said "coming" until then; in Survival the Ghost chip says it is
 *      off there, and with no killer record it is locked for the classic reason
 *      (2026-10-14, KP-3); the ⓘ opens the selected kind's rules; the switch
 *      survives a reload
 *   2. the first killer starts after its rules; the board's outlines and sums
 *      match the cages saved for the game, cell by cell
 *   3. the second killer starts straight away; 3b. a new killer started on the
 *      Speedrun tab is a speedrun (⚡), not a Classic one
 *   4. Resume is offered on the kind of game that was saved, and only there
 *   5. a killer won from the board is graded on killer times (2026-10-07: 105 s
 *      at Lv.1 is S+ for a killer, A on classic times), offers the Logic Score
 *      leaderboard (it counts both kinds, 2026-10-08), and moves the killer
 *      record and the killer ghost only (with its cages) — not the classic
 *      ones; the day's mission as its rules say
 *   5c. racing the killer ghost (2026-10-14, KP-3): the chip shows the killer
 *      record, not the classic one beside it; Ghost deals the record's board
 *      and cages, its banner counts the killer's open cells, and header,
 *      banner, board and keypad fit the phone; Time Gap deals a new killer
 *      and races the killer record
 *   5b. a killer speedrun: ⚡ in the header, no hint button, a wrong digit adds
 *      10 s and does not end the game, the grade is the killer one, and the win
 *      lands in the killer's own speedrun table — not its plain one, not the
 *      classic speedrun table
 *   5d. killer Survival (2026-10-14, KP-2): 7 min on the clock at Lv.1, +9 s a
 *      right cell, a loss in the killer record when the clock runs out, a win
 *      kept by its seconds played, graded on killer times, on the killer card
 *   5e. a killer AI battle (2026-10-14, KP-11): the AI lobby's switch opens on
 *      Home's kind and shares it, the first killer starts after its rules, the
 *      board draws the room's cages, a cage mistake is named, the loss stays out
 *      of the killer record, a rematch is a killer; standard still deals a classic
 *   5f. the killer daily (2026-10-21, KP-4 — one calendar, user 2026-10-07): the
 *      daily screen has the shared switch, the first killer starts after its
 *      rules, today's killer is the day's own (board and cages as gate 2-2 pins
 *      them) saved as the daily, the mission's Start opens the same kind, and the
 *      win ticks today on the calendar and says it was a killer
 *   6. 13 languages at 360px and at 320px with a 1.3x font: the switch (on Home
 *      and in the AI lobby), the rules card and the killer stats card are not cut
 *      and do not scroll sideways
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';
import { generateKillerPuzzle } from '../../../src/engine/killer/killerGenerator.js';
import { cloneGrid, generatePuzzle } from '../../../src/engine/SudokuEngine.js';
import { getDailyMission, getDailyPuzzle } from '../../../src/utils/dailyChallenge.js';

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
    if (!(await page.locator('.mode-tab-btn.time-attack-tab.active').count())) fail('1: the Speedrun tab on the killer switch did not switch to Speedrun');
    if (!(await page.locator('.home-screen-container .btn-play-new .lucide-zap').count())) fail('1: on killer Speedrun the start button is not the speedrun one');
    // Survival opens on killer too since 2026-10-14 (KP-2); until then it said "coming".
    await tap(page, '.mode-tab-btn.time-limit-tab', '1: killer Survival tab');
    if (!(await page.locator('.mode-tab-btn.time-limit-tab.active').count())) fail('1: the Survival tab on the killer switch did not switch to Survival');
    if (!(await page.locator('.home-screen-container .btn-play-new .lucide-hourglass').count())) fail('1: on killer Survival the start button is not the Survival one');
    // Ghost and Time Gap are off in Survival on either kind, and the note says why.
    await tap(page, '.rival-chip.ghost-chip', '1: killer Ghost chip in Survival');
    const survivalLine = await page.locator('.locked-mode-popup[role="alert"] .locked-popup-text').first().innerText().catch(() => '');
    if (!survivalLine.includes('not available in Survival')) fail(`1: the Ghost chip in killer Survival says "${survivalLine}" — expected the Survival reason, as on classic`);
    // On Speedrun, with no killer record yet, the Ghost chip is locked for the reason a
    // classic one is — no longer "coming" (2026-10-14, KP-3). One note at a time.
    await tap(page, '.mode-tab-btn.time-attack-tab', '1: back to killer Speedrun');
    await tap(page, '.rival-chip.ghost-chip', '1: killer Ghost chip');
    const notes = await page.locator('.locked-mode-popup').count();
    if (notes !== 1) fail(`1: the locked Ghost chip on the killer switch put ${notes} notes in the same spot — one note at a time`);
    const lockedLine = await page.locator('.locked-mode-popup[role="alert"] .locked-popup-text').first().innerText().catch(() => '');
    if (!lockedLine.includes('Clear this difficulty')) fail(`1: the locked Ghost chip on the killer switch says "${lockedLine}" — expected the classic reason: clear this level once`);
    if (await tap(page, '.variant-rules-btn', '1: killer ⓘ') &&
        !(await page.locator('.variant-rules-card[data-variant="killer"]').count())) fail('1: the ⓘ on killer did not open the killer rules');
    await page.locator('.variant-rules-card button').click().catch(() => {});
    await page.reload();
    await page.waitForSelector('.home-bottom-nav');
    if (!(await page.locator('.variant-option.active[data-variant="killer"]').count())) fail('1: the killer switch was forgotten on reload');
    await tap(page, '.mode-tab-btn:not(.time-attack-tab):not(.time-limit-tab)', '1: back to the Classic tab');
    console.log(`  ▶ 1. home: one card shape (${standardAgain}px both; first look ${standardHeight}px), killer Speedrun and Survival open, Ghost off in Survival and locked like classic, one note at a time, rules for each kind`);

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

    // ── 3b. A new killer speedrun from Home ──────────────────────────────
    await page.goto(URL);
    await page.waitForSelector('.home-bottom-nav');
    await tap(page, '.mode-tab-btn.time-attack-tab', '3b: killer Speedrun tab');
    await page.click('.home-screen-container .btn-play-new');
    // The killer from step 3 is still going: starting another asks first.
    const startAnyway = page.locator('.modal-card button', { hasText: 'OK' });
    if (await startAnyway.count()) await startAnyway.first().click();
    await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => fail('3b: the speedrun start did not open a killer'));
    const newTag = await page.locator('.current-level-badge .lvl-tag').innerText().catch(() => '');
    if (!newTag.includes('⚡')) fail(`3b: a new killer from the Speedrun tab started without ⚡ ("${newTag}") — it played Classic`);
    console.log('  ▶ 3b. a new killer from the Speedrun tab is a speedrun');

    // ── 4. Resume on its own kind ────────────────────────────────────────
    const p = generateKillerPuzzle(1, 'gate-3-18-win');
    const last = p.board.flat().findIndex((d, i) => !d && i > 0);
    const board = cloneGrid(p.solution);
    board[Math.floor(last / 9)][last % 9] = 0;
    const state = {
      board, initialBoard: cloneGrid(p.board), solutionBoard: p.solution,
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      // 105 s at Lv.1: S+ on the killer times (≤110), A on the classic ones (≤150).
      mistakes: 0, timerSeconds: 105, level: 1, gameMode: 'classic', variant: 'killer', cages: p.cages,
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
      const grade = await page.locator('.victory-rank-banner').innerText().catch(() => '');
      if (!grade) fail('5: a killer win shows no grade');
      else if (!grade.includes('S+')) fail(`5: a killer won in 105 s at Lv.1 says "${grade}" — graded on classic times, not the killer ones (S+ ≤ 110 s)`);
      const stats = await readJSON(page, 'suidoku_user_stats_v1');
      if (stats?.killer?.gamesWon !== 1) fail(`5: the killer record shows ${stats?.killer?.gamesWon} wins after one`);
      if (!(await page.locator('.victory-card .btn-open-leaderboard').count())) fail('5: a killer win offers no leaderboard — the Logic Score counts killers too (2026-10-08)');
      if (!(stats?.killer?.bestTimes?.[1] > 0)) fail('5: the killer win set no Lv.1 best time');
      if (stats?.gamesWon) fail(`5: the classic record shows ${stats.gamesWon} win(s) after a killer`);
      // The ghost, in the killer's own slot, with the cages a Ghost race deals again (KP-3).
      const ghostTable = await readJSON(page, 'suidoku_ghost_records_v1');
      const won = ghostTable?.killer?.classic?.[1];
      if (!won) fail('5: a killer win recorded no killer ghost — Ghost and Time Gap on killer have nothing to race');
      else {
        if (won.bestSeconds !== 105) fail(`5: the killer ghost holds ${won.bestSeconds} s — the win took 105 s`);
        if (JSON.stringify(won.cages) !== JSON.stringify(p.cages)) fail('5: the killer ghost was saved without its cages — a Ghost race cannot deal its board again');
      }
      if (ghostTable?.classic?.[1]) fail('5: a killer win set the classic ghost');
      // Since 2026-10-08 a killer win counts toward the day's mission (Diary 112). The
      // mission changes with the date, so the expectation does too: this said "no daily
      // record, ever", and failed on the days the mission is "clear Lv.1 or higher"
      // (2026-10-10, found by Gemini's run — BACKLOG D18's twin). Read the day's
      // mission the way the win path does, then hold the record to it both ways.
      const dateKey = await page.evaluate(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      });
      const mission = getDailyMission(dateKey, stats || {});
      const missionDone = mission.type === 'level_clear' && 1 >= mission.minLevel;   // a Lv.1 game in plain mode
      const dayRecord = (await readJSON(page, 'suidoku_daily_records_v1'))?.[dateKey];
      if (missionDone && !dayRecord?.completed) fail(`5: today's mission (${mission.type}, Lv.${mission.minLevel}+) was met by the killer win and not recorded`);
      if (!missionDone && dayRecord) fail(`5: a killer win recorded today's ${mission.type} mission, which a Lv.1 plain game does not meet`);
    } catch {
      fail('5: no victory card after the last correct digit');
    }
    console.log("  ▶ 5. killer win: killer grade, killer record and killer ghost only, the day's mission as the rules say");

    // ── 5c. Racing the killer ghost ──────────────────────────────────────
    // The win above left a killer ghost at Lv.1 (105 s). A classic ghost at Lv.1
    // with another time (66 s) sits beside it, so a chip, a start or a banner that
    // reads the wrong slot shows on the screen. With the classic best time it comes
    // with: a classic ghost faster than that, or without one, is read as another
    // mode's and never shown (ghostManager.js, D19).
    const classicGhost = generatePuzzle(1, 'gate-3-18-classic-ghost');
    await page.evaluate((c) => {
      const g = JSON.parse(localStorage.getItem('suidoku_ghost_records_v1') || '{}');
      g.classic = { ...(g.classic || {}), 1: { bestSeconds: 66, puzzle: c.puzzle, solution: c.solution, totalEmptyCells: 45, timeline: [] } };
      localStorage.setItem('suidoku_ghost_records_v1', JSON.stringify(g));
      const s = JSON.parse(localStorage.getItem('suidoku_user_stats_v1') || '{}');
      s.bestTimes = { ...(s.bestTimes || {}), 1: 66 };
      localStorage.setItem('suidoku_user_stats_v1', JSON.stringify(s));
    }, classicGhost);
    const openCells = p.board.flat().filter((d) => !d).length;
    const homeOnLevel1 = async () => {
      await page.goto(URL);
      await page.waitForSelector('.home-bottom-nav');
      await tap(page, '.level-chip-group button:nth-child(1)', '5c: Lv.1');
    };
    const startFromHome = async () => {
      await page.click('.home-screen-container .btn-play-new');
      const startAnyway = page.locator('.modal-card button', { hasText: 'OK' });
      if (await startAnyway.count()) await startAnyway.first().click();
      if (!(await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => null))) return false;
      await page.waitForTimeout(400);
      return true;
    };
    const racedRecord = () => page.locator('.ghost-indicator-pin').getAttribute('title').catch(() => null);
    await homeOnLevel1();
    const killerChip = await page.locator('.ghost-chip').innerText().catch(() => '');
    if (!killerChip.includes('01:45')) fail(`5c: the killer Ghost chip says "${killerChip}" — expected the killer record, 01:45 (the classic one is 01:06)`);
    await tap(page, '.variant-option[data-variant="classic"]', '5c: standard switch');
    const classicChip = await page.locator('.ghost-chip').innerText().catch(() => '');
    if (!classicChip.includes('01:06')) fail(`5c: the standard Ghost chip says "${classicChip}" — expected the classic record, 01:06`);
    await tap(page, '.variant-option[data-variant="killer"]', '5c: back to the killer switch');
    await tap(page, '.rival-chip.ghost-chip', '5c: killer Ghost chip');
    if (!(await startFromHome())) fail('5c: the killer Ghost race did not open a killer — it dealt the record as a classic board');
    else {
      const raced = await readJSON(page, 'suidoku_game_state_v1');
      if (raced?.variant !== 'killer' || JSON.stringify(raced?.cages) !== JSON.stringify(p.cages)) {
        fail(`5c: the killer Ghost race dealt a ${raced?.variant} with ${raced?.cages?.length ?? 'no'} cages — not the board the record was set on (${p.cages.length} cages)`);
      } else if (JSON.stringify(raced.initialBoard) !== JSON.stringify(p.board)) {
        fail('5c: the killer Ghost race has the record\'s cages but other givens');
      } else {
        const b = await page.evaluate(readBoard, raced.cages);
        b.wrong.slice(0, 4).forEach((w) => fail(`5c: outline — ${w}`));
      }
      // Each side's count read on its own: read as the whole banner's text, the
      // ghost's "0/45" stood in for the player's count when that one said 0/40.
      const banner = await page.locator('.ghost-rival-banner-container').count();
      const count = (side) => page.locator(`.ghost-rival-banner-container .${side} .rival-count`).innerText().catch(() => '');
      if (!banner) fail('5c: no ghost banner on the killer Ghost race');
      else {
        const [you, rival] = [await count('user-col'), await count('ghost-col')];
        if (you !== `0/${openCells}`) fail(`5c: the player's count on the Ghost banner says "${you}" — expected the count out of the killer's ${openCells} open cells`);
        if (!rival.endsWith(`/${openCells}`)) fail(`5c: the ghost's count on the Ghost banner says "${rival}" — expected the count out of the killer's ${openCells} open cells`);
      }
      const against = await racedRecord();
      if (banner && !against?.includes('01:45')) fail(`5c: the killer Ghost race runs against "${against}" — expected the killer record, 01:45`);
      // Header, banner, board and keypad on one phone screen: none over another, none off it.
      const layout = await page.evaluate(() => {
        const parts = ['.game-header', '.ghost-rival-banner-container', '.board-zone', '.number-pad']
          .map((q) => [q, document.querySelector(q)?.getBoundingClientRect()]);
        const out = [];
        for (const [q, b] of parts) {
          if (!b) { out.push(`${q} not on screen`); continue; }
          if (b.left < -0.5 || b.right > innerWidth + 0.5 || b.bottom > innerHeight + 0.5) out.push(`${q} runs off the screen`);
        }
        for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
          const [qa, a] = parts[i];
          const [qb, c] = parts[j];
          if (a && c && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 1 && Math.min(a.right, c.right) - Math.max(a.left, c.left) > 1) out.push(`${qa} and ${qb} overlap`);
        }
        return out;
      });
      layout.forEach((l) => fail(`5c: killer Ghost race at 360×800 — ${l}`));
    }
    // Time Gap deals a new killer and races the killer record's pace.
    await homeOnLevel1();
    await tap(page, '.rival-chip.delta-chip', '5c: killer Time Gap chip');
    if (!(await startFromHome())) fail('5c: the killer Time Gap race did not open a killer');
    else {
      const fresh = await readJSON(page, 'suidoku_game_state_v1');
      if (fresh?.variant !== 'killer') fail(`5c: the killer Time Gap race is a ${fresh?.variant}`);
      else if (JSON.stringify(fresh.cages) === JSON.stringify(p.cages)) fail('5c: Time Gap on killer dealt the record\'s board — it deals a new one');
      const against = await racedRecord();
      if (!against) fail('5c: no pace banner on the killer Time Gap race');
      else if (!against.includes('01:45')) fail(`5c: the killer Time Gap race runs against "${against}" — expected the killer record, 01:45`);
    }
    console.log('  ▶ 5c. killer Ghost: its own chip time, the record\'s board and cages, the banner out of its open cells, all on screen; Time Gap: a new killer against the killer record');

    // ── 5b. A killer speedrun ────────────────────────────────────────────
    // Two open cells with different digits: with one, every other digit is already
    // placed nine times and its key is off, so no wrong digit can be entered.
    const right = p.solution[Math.floor(last / 9)][last % 9];
    const other = p.board.flat().findIndex((d, i) => !d && i !== last && p.solution[Math.floor(i / 9)][i % 9] !== right);
    const wrong = p.solution[Math.floor(other / 9)][other % 9];
    const twoOpen = cloneGrid(board);
    twoOpen[Math.floor(other / 9)][other % 9] = 0;
    await prime(page, { settings: { homeVariant: 'killer', killerRulesSeen: true }, state: { ...state, board: twoOpen, gameMode: 'timeAttack' } });
    await tap(page, '.mode-tab-btn.time-attack-tab', '5b: killer Speedrun tab');
    if (!(await page.locator('.btn-resume').count())) fail('5b: the killer Speedrun tab does not offer the killer speedrun in progress');
    await page.click('.btn-resume').catch(() => {});
    await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => fail('5b: resume did not open the killer speedrun'));
    const lvlTag = await page.locator('.current-level-badge .lvl-tag').innerText().catch(() => '');
    if (!lvlTag.includes('⚡')) fail(`5b: the header says "${lvlTag}" — no ⚡ on a killer speedrun`);
    if (await page.locator('.hint-btn').count()) fail('5b: a killer speedrun offers hints — speedrun has none');
    const clock = async () => {
      const [m, sec] = (await page.locator('.time-display').innerText()).split(':').map(Number);
      return m * 60 + sec;
    };
    await page.locator('.sudoku-cell').nth(last).click();
    const before = await clock();
    await page.locator(`.number-pad .num-btn:nth-child(${wrong})`).click();
    await page.waitForTimeout(200);
    const after = await clock();
    if (after - before < 10) fail(`5b: a wrong digit moved the killer speedrun clock ${before}s → ${after}s — speedrun adds 10 s`);
    if (await page.locator('.game-over-card, .modal-card.game-over').count()) fail('5b: a wrong digit ended the killer speedrun — speedrun has no mistake limit');
    // A filled cell takes no other digit until it is erased — the same as classic.
    await page.locator('.sudoku-cell').nth(last).click();
    await page.locator('.action-btn[title="Erase"]').click().catch(() => fail('5b: no Erase button'));
    await page.locator(`.number-pad .num-btn:nth-child(${right})`).click();
    await page.locator('.sudoku-cell').nth(other).click();
    await page.locator(`.number-pad .num-btn:nth-child(${wrong})`).click();
    try {
      await page.locator('.victory-card').waitFor({ state: 'visible', timeout: 8000 });
      const grade = await page.locator('.victory-rank-banner').innerText().catch(() => '');
      if (!grade) fail('5b: a killer speedrun shows no grade');
      else if (!grade.includes('S (')) fail(`5b: a killer speedrun at about 115-160 s says "${grade}" — the killer grade there is S`);
      const stats = await readJSON(page, 'suidoku_user_stats_v1');
      // 105 s saved + 10 for the wrong digit − 1 for the last cell, a 2-combo. Until
      // 2026-10-18 the win dropped that last bonus and this asked for ≥ 115 — the bug's
      // number (CH18-04, Diary 143). The best is the time the victory card shows.
      const cardText = await page.locator('.victory-card .stat-box').nth(1).innerText().catch(() => '');
      const cardMatch = cardText.match(/(\d+):(\d{2})/);
      const card = cardMatch ? Number(cardMatch[1]) * 60 + Number(cardMatch[2]) : null;
      const best = stats?.killer?.timeAttackBestTimes?.[1];
      if (!(best >= 114) || best !== card) fail(`5b: the killer speedrun set Lv.1 speedrun best ${best}, the card shows ${card} — expected the card's time, with the 10 s penalty and the last cell's 1 s combo bonus (105 + 10 − 1 = 114 or more)`);
      if (stats?.killer?.bestTimes?.[1]) fail('5b: the killer speedrun set the plain killer best time — speedrun times are kept apart');
      if (stats?.timeAttackBestTimes?.[1]) fail('5b: the killer speedrun set the classic speedrun best time');
      if (stats?.killer?.gamesWon !== 1) fail(`5b: the killer record shows ${stats?.killer?.gamesWon} wins after one speedrun`);
    } catch {
      fail('5b: no victory card after the last correct digit');
    }
    console.log('  ▶ 5b. killer speedrun: ⚡, no hints, +10 s a mistake, own best time');

    // ── 5d. Killer Survival (2026-10-14, KP-2) ───────────────────────────
    // Classic Survival on a killer board: the killer's limit on the clock at the
    // start (7 min at Lv.1, classic has 4), the killer's bonus for a right cell
    // (+9 s, classic 7), a loss in the killer record when the clock runs out, and
    // a win kept as a killer Survival clear by its seconds played, graded on
    // killer times and shown on the killer card.
    await prime(page, { settings: { homeVariant: 'killer', killerRulesSeen: true } });
    await tap(page, '.mode-tab-btn.time-limit-tab', '5d: killer Survival tab');
    await tap(page, '.level-chip-group button:nth-child(1)', '5d: Lv.1');
    await page.click('.home-screen-container .btn-play-new').catch(() => fail('5d: no start button on killer Survival'));
    if (!(await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => null))) fail('5d: the Survival start on the killer switch did not open a killer');
    else {
      await page.waitForTimeout(400);
      const started = await clock();
      const tag = await page.locator('.current-level-badge .lvl-tag').innerText().catch(() => '');
      if (!tag.includes('⏳')) fail(`5d: the header says "${tag}" — no ⏳ on a killer Survival`);
      if (!(await page.locator('.game-header .version-tag[data-variant="killer"]').count())) fail('5d: the killer Survival header does not say killer');
      if (started < 410 || started > 420) fail(`5d: a killer Survival Lv.1 started with ${started} s on the clock — its limit is 7 min (420 s), classic's 4 (240 s)`);
      const game = await readJSON(page, 'suidoku_game_state_v1');
      if (game?.gameMode !== 'timeLimit' || game?.variant !== 'killer') fail(`5d: the Survival start saved a ${game?.variant} ${game?.gameMode} game`);
      else {
        const open = game.initialBoard.flat().findIndex((d) => !d);
        const before = await clock();
        await page.locator('.sudoku-cell').nth(open).click();
        await page.locator(`.number-pad .num-btn:nth-child(${game.solutionBoard[Math.floor(open / 9)][open % 9]})`).click();
        await page.waitForTimeout(150);
        const gained = (await clock()) - before;
        const shown = await page.locator('.time-floating-indicator').innerText().catch(() => '');
        if (gained < 8 || gained > 9 || !shown.includes('+9s')) fail(`5d: a right cell moved the killer Survival clock by ${gained} s ("${shown}") — a killer Lv.1 adds 9 s a cell, classic 7`);
      }
    }
    // The clock runs out on a killer saved with 2 s left.
    await prime(page, { settings: { homeVariant: 'killer', killerRulesSeen: true }, state: { ...state, board: twoOpen, gameMode: 'timeLimit', timerSeconds: 2, playedSeconds: 300 } });
    await tap(page, '.mode-tab-btn.time-limit-tab', '5d: killer Survival tab');
    if (!(await page.locator('.btn-resume').count())) fail('5d: the killer Survival tab does not offer the killer Survival in progress');
    await page.click('.btn-resume').catch(() => {});
    if (!(await page.locator('.game-over-card').waitFor({ state: 'visible', timeout: 8000 }).then(() => true, () => false))) {
      fail('5d: a killer Survival whose clock ran out did not end');
    } else {
      const stats = await readJSON(page, 'suidoku_user_stats_v1');
      if (stats?.killer?.gamesPlayed !== 1) fail(`5d: a killer Survival lost on time left ${stats?.killer?.gamesPlayed} killer games played — expected 1`);
      if (stats?.gamesPlayed) fail('5d: a killer Survival lost on time counted in the classic record');
      const left = await readJSON(page, 'suidoku_game_state_v1');
      if (left && !left.isGameOver) fail('5d: a killer Survival lost on time can still be resumed');
    }
    // A win: 105 s played, 500 s left. Graded on the seconds played and killer times —
    // S+ (≤110 s); on the time left it would be the slowest grade.
    await prime(page, { settings: { homeVariant: 'killer', killerRulesSeen: true }, state: { ...state, gameMode: 'timeLimit', timerSeconds: 500, playedSeconds: 105 } });
    await tap(page, '.mode-tab-btn.time-limit-tab', '5d: killer Survival tab');
    await page.click('.btn-resume').catch(() => fail('5d: no resume on killer Survival'));
    await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => fail('5d: resume did not open the killer Survival'));
    await page.locator('.sudoku-cell').nth(last).click();
    await page.locator(`.number-pad .num-btn:nth-child(${right})`).click();
    if (!(await page.locator('.victory-card').waitFor({ state: 'visible', timeout: 8000 }).then(() => true, () => false))) {
      fail('5d: no victory card after the last correct digit of a killer Survival');
    } else {
      const grade = await page.locator('.victory-rank-banner').innerText().catch(() => '');
      if (!grade.includes('S+')) fail(`5d: a killer Survival won in about 105 s played says "${grade}" — expected S+ on the killer times, by the seconds played`);
      const stats = await readJSON(page, 'suidoku_user_stats_v1');
      const best = stats?.killer?.survivalBestTimes?.[1];
      if (stats?.killer?.timeLimitSurvivalWins !== 1) fail(`5d: the killer record shows ${stats?.killer?.timeLimitSurvivalWins} Survival clears after one`);
      if (!(best >= 105 && best <= 110)) fail(`5d: the killer Survival Lv.1 best is ${best} — expected the seconds played (about 105), not the time left (500)`);
      if (stats?.survivalBestTimes || stats?.timeLimitSurvivalWins) fail('5d: a killer Survival win moved the classic Survival record');
      const ghostTable = await readJSON(page, 'suidoku_ghost_records_v1');
      if (ghostTable?.killer?.classic?.[1] || ghostTable?.killer?.timeAttack?.[1]) fail('5d: a killer Survival win set a killer ghost — its clock is the time left; Survival keeps none (D19)');
      await page.goto(URL);
      await page.waitForSelector('.home-bottom-nav');
      await page.click('.home-bottom-nav .nav-item:nth-child(1)');
      await page.waitForSelector('.killer-stats-card');
      const row = await page.locator('.killer-survival-list .best-time-row').first().locator('.best-time-val').innerText().catch(() => '');
      const expected = `${String(Math.floor(best / 60)).padStart(2, '0')}:${String(best % 60).padStart(2, '0')}`;
      if (row !== expected) fail(`5d: the killer card's Survival Lv.1 says "${row}" — the killer Survival best is ${expected}`);
      const clears = await page.locator('.killer-survival-total .total-value').innerText().catch(() => '');
      if (clears.trim() !== '1') fail(`5d: the killer card counts "${clears}" Survival clears — expected 1`);
    }
    console.log('  ▶ 5d. killer Survival: 7 min on the clock, +9 s a right cell, a loss on time in the killer record, a win by seconds played on the killer card');

    // ── 5e. A killer AI battle (2026-10-14, KP-11, killer order ⑦) ───────
    // The AI lobby has the puzzle switch (user, 2026-10-14: a switch on the AI
    // screen, one remembered choice with Home's). It opens on the kind Home shows;
    // the first killer starts after its rules; the board draws the room's cages
    // and both sides count the killer's open cells; a wrong digit that breaks a
    // cage is told so; the duel stays out of the killer record (BT-1) and in the
    // duel record; a rematch is another killer; Home shows the kind picked in the
    // lobby; and the standard switch still deals a classic. The bot's pace is
    // gate 2-28's (9).
    const aiRoom = () => page.evaluate(() => {
      const r = window.suidokuBattle?.currentRoom;
      return r ? { code: r.code, variant: r.variant, cages: r.cages, puzzle: r.puzzle, solution: r.solution, open: r.initialEmptyCount } : null;
    });
    // An open cell and a digit that push its cage past its sum while no row, column,
    // box or cage already holds the digit — so the only thing wrong is the cage.
    const sumBreak = (room) => {
      const digit = (cell) => room.puzzle[Math.floor(cell / 9)][cell % 9];
      const sees = (a, b) => Math.floor(a / 9) === Math.floor(b / 9) || a % 9 === b % 9 ||
        (Math.floor(a / 27) === Math.floor(b / 27) && Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3));
      for (const cage of room.cages) {
        const left = cage.sum - cage.cells.reduce((s, c) => s + digit(c), 0);
        for (const cell of cage.cells.filter((c) => !digit(c))) {
          for (let d = 9; d > left; d--) {
            const seen = [...Array(81).keys()].some((i) => i !== cell && sees(i, cell) && digit(i) === d);
            if (!seen && !cage.cells.some((c) => digit(c) === d)) return { cell, d, sum: cage.sum };
          }
        }
      }
      return null;
    };
    const enter = async (cell, d) => {
      await page.locator('.game-screen-wrapper .sudoku-cell').nth(cell).click();
      await page.locator(`.number-pad .num-btn:nth-child(${d})`).click();
      await page.waitForTimeout(150);
    };
    const checkCages = async (room, where) => {
      const b = await page.evaluate(readBoard, room.cages);
      b.wrong.slice(0, 6).forEach((w) => fail(`5e: ${where} outline — ${w}`));
      b.misplaced.slice(0, 6).forEach((m) => fail(`5e: ${where} sum — ${m}`));
      if (b.sumCount !== room.cages.length) fail(`5e: ${where}: ${b.sumCount} sums on the board for ${room.cages.length} cages`);
    };
    await prime(page);
    await tap(page, '.ai-card-banner', '5e: the AI battle banner');
    await page.waitForSelector('.battle-lobby-container .variant-switch', { timeout: 5000 }).catch(() => fail('5e: the AI lobby has no puzzle switch'));
    if (!(await page.locator('.battle-lobby-container .variant-option.active[data-variant="classic"]').count())) fail('5e: the AI lobby did not open on standard, the kind Home shows');
    await tap(page, '.battle-lobby-container .variant-option[data-variant="killer"]', '5e: Killer in the AI lobby');
    await tap(page, '.btn-battle-action', '5e: start the AI battle');
    await page.waitForTimeout(300);
    if (!(await page.locator('.variant-rules-card[data-variant="killer"]').count())) fail('5e: the first killer AI battle started without its rules');
    else if (await page.locator('.battle-header-card').count()) fail('5e: the AI battle started behind the rules card');
    await page.locator('.variant-rules-card button').click().catch(() => fail('5e: the rules card has no button to start the AI battle'));
    await page.waitForSelector('.battle-header-card', { timeout: 8000 }).catch(() => fail('5e: the rules card did not start the AI battle'));
    await page.waitForTimeout(400);
    const first = await aiRoom();
    if (first?.variant !== 'killer' || !Array.isArray(first?.cages)) {
      fail(`5e: Killer in the AI lobby dealt a ${first?.variant} room with ${first?.cages?.length ?? 'no'} cages`);
    } else {
      if (!(await page.locator('.killer-board').count())) fail('5e: the killer AI battle board is not a killer board');
      await checkCages(first, 'first match');
      const mine = await page.locator('.my-box .countdown-number-val').innerText().catch(() => '');
      const theirs = await page.locator('.opp-box .countdown-number-val').innerText().catch(() => '');
      if (!mine.startsWith(`${first.open} `) || !theirs.startsWith(`${first.open} `)) fail(`5e: the battle header says "${mine}" / "${theirs}" — the killer has ${first.open} open cells`);
      const brk = sumBreak(first);
      if (!brk) fail('5e: no cell on this killer can break its cage alone — nothing to test the cage message with');
      else {
        await enter(brk.cell, brk.d);
        const said = await page.locator('.conflict-toast-banner').innerText().catch(() => '');
        if (!said.includes(`This cage no longer adds up to ${brk.sum}`)) fail(`5e: a ${brk.d} past its cage's ${brk.sum} in the AI battle says "${said}" — the mistake must name the cage`);
        const others = [...Array(81).keys()].filter((c) => c !== brk.cell && !first.puzzle[Math.floor(c / 9)][c % 9]).slice(0, 2);
        for (const c of others) await enter(c, (first.solution[Math.floor(c / 9)][c % 9] % 9) + 1);
      }
      if (!(await page.locator('.battle-result-card').waitFor({ state: 'visible', timeout: 8000 }).then(() => true, () => false))) {
        fail('5e: three wrong digits did not end the killer AI battle');
      } else {
        const stats = await readJSON(page, 'suidoku_user_stats_v1');
        if (stats?.killer?.gamesPlayed || stats?.gamesPlayed) fail(`5e: a killer AI battle lost on mistakes counted ${stats?.killer?.gamesPlayed ?? 0} killer / ${stats?.gamesPlayed ?? 0} classic games played — a duel counts in the duel record only (BT-1)`);
        const duel = await readJSON(page, 'suidoku_battle_profile_v1');
        if (duel?.losses !== 1) fail(`5e: the duel record shows ${duel?.losses} losses after a killer AI battle lost`);
        await tap(page, '.battle-result-card .btn-primary', '5e: rematch');
        await page.waitForFunction((code) => window.suidokuBattle?.currentRoom && window.suidokuBattle.currentRoom.code !== code, first.code, { timeout: 8000 })
          .catch(() => fail('5e: the rematch did not deal a new match'));
        await page.waitForTimeout(400);
        const again = await aiRoom();
        if (again?.variant !== 'killer' || !Array.isArray(again?.cages)) fail(`5e: the rematch after a killer AI battle is a ${again?.variant} with ${again?.cages?.length ?? 'no'} cages`);
        else await checkCages(again, 'rematch');
      }
    }
    // One choice: the kind picked in the AI lobby is the one Home shows, and back.
    await page.goto(URL);
    await page.waitForSelector('.home-bottom-nav');
    if (!(await page.locator('.home-screen-container .variant-option.active[data-variant="killer"]').count())) fail('5e: Killer was picked in the AI lobby and Home shows standard — two answers to which kind is played');
    await tap(page, '.ai-card-banner', '5e: the AI battle banner again');
    await page.waitForSelector('.battle-lobby-container .variant-switch', { timeout: 5000 }).catch(() => {});
    if (!(await page.locator('.battle-lobby-container .variant-option.active[data-variant="killer"]').count())) fail('5e: the AI lobby did not open on Killer, the kind Home shows');
    // The standard switch still deals a classic, with no rules card and no cages.
    await tap(page, '.battle-lobby-container .variant-option[data-variant="classic"]', '5e: Standard in the AI lobby');
    await tap(page, '.btn-battle-action', '5e: start a standard AI battle');
    await page.waitForSelector('.battle-header-card', { timeout: 8000 }).catch(() => fail('5e: the standard AI battle did not start'));
    await page.waitForTimeout(400);
    const plain = await aiRoom();
    if (plain?.variant !== 'classic' || plain?.cages) fail(`5e: Standard in the AI lobby dealt a ${plain?.variant} room with ${plain?.cages?.length ?? 'no'} cages`);
    if (await page.locator('.cage-sum').count()) fail('5e: the standard AI battle draws cage sums');
    if ((await readJSON(page, 'suidoku_settings_v1'))?.homeVariant !== 'classic') fail('5e: Standard picked in the AI lobby was not remembered for Home');
    console.log('  ▶ 5e. killer AI battle: the lobby switch shares Home\'s choice, rules first, the room\'s cages drawn, a cage mistake named, the loss in the duel record only, a rematch on killer; standard still classic');

    // ── 5f. The daily as a killer (2026-10-21, KP-4) ─────────────────────
    // One calendar for both kinds (user 2026-10-07: "통합"). The daily screen has the
    // switch Home and the AI lobby share; the day is the same killer for every
    // player; it is saved as the daily so a resume stays the daily (CH18-03); and
    // a win ticks the day once, whichever kind cleared it, saying which.
    {
      const today = await page.evaluate(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      });
      const expected = getDailyPuzzle(today, 'killer');
      const openDaily = async (where) => {
        await page.goto(URL);
        await page.waitForSelector('.home-bottom-nav');
        await tap(page, '.daily-card-banner', `${where}: the daily card`);
        await page.waitForSelector('.daily-screen-container', { timeout: 5000 }).catch(() => fail(`${where}: the daily screen did not open`));
      };
      const killerSwitch = '.daily-screen-container .variant-option[data-variant="killer"]';

      await prime(page, { settings: { homeVariant: 'classic' } });   // the killer rules not seen yet
      await openDaily('5f');
      if (!(await page.locator(killerSwitch).count())) fail('5f: the daily screen has no standard/killer switch');
      await tap(page, killerSwitch, '5f: the killer switch on the daily screen');
      await tap(page, '.calendar-day-btn.today', '5f: today on the calendar');
      await page.waitForTimeout(300);
      if (!(await page.locator('.variant-rules-card[data-variant="killer"]').count())) fail('5f: the first killer daily started without its rules');
      else if (await page.locator('.sudoku-grid').count()) fail('5f: the killer daily started behind the rules card');
      await page.locator('.variant-rules-card button').click().catch(() => fail('5f: the rules card has no button to start'));
      await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => fail('5f: today on the killer switch did not open a killer'));
      await page.waitForTimeout(400);
      const saved = await readJSON(page, 'suidoku_game_state_v1');
      if (saved?.variant !== 'killer') fail(`5f: today on the killer switch saved a ${saved?.variant}`);
      else if (JSON.stringify(saved.initialBoard) !== JSON.stringify(expected.board) || JSON.stringify(saved.cages) !== JSON.stringify(expected.cages)) {
        fail('5f: today\'s killer is not the day\'s killer — another player would get another board');
      }
      if (saved?.level !== expected.level) fail(`5f: the killer daily is Lv.${saved?.level}; the day's mission sets Lv.${expected.level}`);
      if (saved?.dailyDateKey !== today) fail(`5f: the killer daily saved with daily date "${saved?.dailyDateKey}" — a resume would not be the daily`);
      if ((await readJSON(page, 'suidoku_settings_v1'))?.homeVariant !== 'killer') fail('5f: killer picked on the daily screen was not remembered for Home');

      // The mission's Start opens the same kind. On a battle day it opens the lobby,
      // and a third of days are battle days — 2026-10-21, the day this was written,
      // was one, and a check that waited for the right date skipped itself. So it
      // runs on its own page with the clock fixed to the next day whose mission
      // starts a puzzle, whatever today is.
      const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const puzzleDay = [...Array(14).keys()].map((n) => new Date(Date.parse(`${today}T12:00:00`) + n * 86400000))
        .find((d) => getDailyMission(dayKey(d), {}).actionType !== 'open_battle');
      const mp = await browser.newPage({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
      await mp.clock.setFixedTime(puzzleDay);
      await prime(mp, { settings: { homeVariant: 'killer', killerRulesSeen: true } });
      await tap(mp, '.daily-card-banner', '5f mission: the daily card');
      await tap(mp, '.daily-mission-card .btn-play-new', '5f: the mission\'s Start');
      await mp.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => fail(`5f: the mission's Start on the killer switch (${dayKey(puzzleDay)}) did not open a killer`));
      await mp.waitForTimeout(400);
      const m = await readJSON(mp, 'suidoku_game_state_v1');
      const mExpected = getDailyPuzzle(dayKey(puzzleDay), 'killer');
      if (m?.variant !== 'killer' || m?.dailyDateKey !== dayKey(puzzleDay)) fail(`5f: the mission's Start opened a ${m?.variant} with daily date "${m?.dailyDateKey}" on ${dayKey(puzzleDay)}`);
      else if (JSON.stringify(m.cages) !== JSON.stringify(mExpected.cages)) fail('5f: the mission\'s Start dealt a killer that is not the day\'s');
      await mp.close();

      // Won — the save edited from Home, where no open game writes itself over it (Diary 144).
      await page.goto(URL);
      await page.waitForSelector('.home-bottom-nav');
      const g = await readJSON(page, 'suidoku_game_state_v1');
      const cell = (g?.board || []).flat().findIndex((d) => !d);
      if (cell < 0) fail('5f: no open cell in the saved killer daily');
      else {
        await page.evaluate(({ game, at }) => {
          const b = game.solutionBoard.map((row) => [...row]);
          b[Math.floor(at / 9)][at % 9] = 0;
          localStorage.setItem('suidoku_game_state_v1', JSON.stringify({ ...game, board: b }));
        }, { game: g, at: cell });
        await page.reload();
        await page.waitForSelector('.home-bottom-nav');
        await tap(page, '.btn-resume', '5f: resume the killer daily');
        await page.waitForSelector('.killer-board', { timeout: 8000 }).catch(() => fail('5f: resume did not open the killer daily'));
        await page.locator('.sudoku-cell').nth(cell).click();
        await page.locator(`.number-pad .num-btn:nth-child(${g.solutionBoard[Math.floor(cell / 9)][cell % 9]})`).click();
        await page.locator('.victory-card').waitFor({ state: 'visible', timeout: 8000 }).catch(() => fail('5f: no victory card after the killer daily\'s last digit'));
        const day = (await readJSON(page, 'suidoku_daily_records_v1'))?.[today];
        if (!day?.completed) fail('5f: a won killer daily did not tick today on the calendar');
        else if (day.variant !== 'killer') fail(`5f: today was cleared as a killer and the record says "${day.variant}"`);
        await openDaily('5f after the win');
        if (!(await page.locator('.calendar-day-btn.today.completed').count())) fail('5f: the calendar does not show today done after the killer daily');
      }
      console.log('  ▶ 5f. killer daily: the switch on the daily screen, rules first, the day\'s own killer saved as the daily, the mission\'s Start the same kind, won → today ticked as a killer');
    }

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
        // The same switch in the AI lobby (KP-11), in a card of its own width.
        await page.goto(URL);
        await page.waitForSelector('.home-bottom-nav');
        await tap(page, '.ai-card-banner', `6: ${where} AI lobby`);
        await page.waitForSelector('.battle-lobby-container .variant-switch-row', { timeout: 5000 }).catch(() => {});
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        if (s !== 1) await scale('.battle-lobby-container .variant-switch-row', s);
        (await cuts('.battle-lobby-container .variant-switch-row')).forEach((c) => fail(`6: ${where} AI lobby switch — ${c}`));
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
