/**
 * test_gameplay_e2e.js
 *
 * Plays the game for real in a headless browser, instead of only inspecting layout.
 *
 * Every other gate in this pipeline verifies *shape* — keys present, text not
 * hardcoded, contrast ratios, line counts. The four bugs found in the 2026-09-01
 * audit were all *behavioural* and passed all of them. These cases exercise the
 * paths those bugs lived in:
 *
 *   Case 1  fresh game survives cell taps and number entry      (crash regression)
 *   Case 2  clock keeps advancing while the player taps rapidly (timer starvation)
 *   Case 3  resuming a save with no solutionBoard does not die  (ensureValidSolution)
 *   Case 4  filling the final cell raises the victory modal     (win path)
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import assert from 'assert';
import { generatePuzzle, cloneGrid } from '../../../src/engine/SudokuEngine.js';

const PORT = 5201;
const PREVIEW_URL = `http://localhost:${PORT}`;
const VIEWPORT = { width: 360, height: 800 };
const IS_WIN = process.platform === 'win32';

function waitForServer(url, timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) resolve();
          else setTimeout(check, 200);
        })
        .on('error', () => {
          if (Date.now() - start > timeout) reject(new Error('Preview server timeout'));
          else setTimeout(check, 200);
        });
    };
    check();
  });
}

// Build a localStorage game-state blob shaped exactly like saveGameState() writes it
function buildSavedState({ level = 1, leaveEmpty = null, omitSolution = false }) {
  const puzzle = generatePuzzle(level);
  const board = cloneGrid(puzzle.puzzle);

  if (leaveEmpty !== null) {
    const empties = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) if (board[r][c] === 0) empties.push([r, c]);
    }
    // Fill from the front, keeping `leaveEmpty` cells blank at the end
    for (let i = 0; i < empties.length - leaveEmpty; i++) {
      const [r, c] = empties[i];
      board[r][c] = puzzle.solution[r][c];
    }
  }

  const state = {
    board,
    initialBoard: cloneGrid(puzzle.puzzle),
    solutionBoard: puzzle.solution,
    notes: Array(9).fill(null).map(() => Array(9).fill([])),
    mistakes: 0,
    timerSeconds: 12,
    level,
    gameMode: 'classic',
    isFastEntryMode: false,
    lockedNumber: null,
    adHintsUsedThisGame: 0
  };
  if (omitSolution) delete state.solutionBoard;

  // Remaining blank coordinates plus their correct values, for the caller to drive
  const remaining = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) remaining.push({ r, c, value: puzzle.solution[r][c] });
    }
  }
  return { state, remaining };
}

// Close a modal if one covers the screen, so subsequent clicks actually land
async function dismissAnyModal(page) {
  for (let i = 0; i < 3; i++) {
    if (!(await page.locator('.modal-overlay').count())) return;
    const button = page.locator('.modal-overlay button').last();
    if (!(await button.count())) return;
    await button.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

/**
 * Put the app in a deterministic pre-game state: English, attendance already
 * claimed today (otherwise the daily-reward modal covers the home screen and
 * swallows every click), and the store-review prompt suppressed.
 */
async function primeStorage(page, gameState = null, settings = {}) {
  await page.goto(PREVIEW_URL);
  await page.evaluate(({ s, extra }) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en', theme: 'matte-dark', ...extra }));

    // Same local-time day key the app derives in src/utils/dateKey.js
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem(
      'suidoku_user_wallet_v1',
      JSON.stringify({ hints: 3, lastDailyClaimDate: today, streakDays: 1, totalAdsWatched: 0, history: [] })
    );
    localStorage.setItem('suidoku_review_prompted', '1');

    if (s) localStorage.setItem('suidoku_game_state_v1', JSON.stringify(s));
  }, { s: gameState, extra: settings });
  await page.reload();
  await page.waitForTimeout(700);
  await dismissAnyModal(page);
}

async function enterGame(page, triggerSelector) {
  await page.click(triggerSelector, { timeout: 5000 });
  await page.waitForSelector('.sudoku-grid', { timeout: 5000 });
  await page.waitForTimeout(300);
}

async function seedAndResume(page, state, settings) {
  await primeStorage(page, state, settings);
  await enterGame(page, '.btn-resume');
}

async function startFreshGame(page) {
  await primeStorage(page);
  await enterGame(page, '.btn-play-new');
}

async function readTimerSeconds(page) {
  const raw = (await page.locator('.time-display').first().innerText()).trim();
  const parts = raw.split(':').map((n) => parseInt(n, 10));
  if (parts.length !== 2 || parts.some(Number.isNaN)) throw new Error(`Unparsable timer: "${raw}"`);
  return parts[0] * 60 + parts[1];
}

// Index of the first blank cell in DOM order, or -1
async function firstBlankCellIndex(page) {
  return page.evaluate(() => {
    const cells = [...document.querySelectorAll('.sudoku-cell')];
    return cells.findIndex((el) => !el.querySelector('.cell-number'));
  });
}

// Index of the first cell that already shows a digit, or -1
async function firstFilledCellIndex(page) {
  return page.evaluate(() => {
    const cells = [...document.querySelectorAll('.sudoku-cell')];
    return cells.findIndex((el) => el.querySelector('.cell-number'));
  });
}

async function cellDigitAt(page, index) {
  return page.evaluate((i) => {
    const el = document.querySelectorAll('.sudoku-cell')[i];
    const num = el && el.querySelector('.cell-number');
    return num ? num.textContent.trim() : '';
  }, index);
}

async function run() {
  console.log('======================================================');
  console.log('🎮 Testing Real Gameplay End-to-End (Playwright)');
  console.log('======================================================\n');

  console.log('🚀 Building production assets...');
  execSync(IS_WIN ? 'npm.cmd run build' : 'npm run build', { stdio: 'ignore' });

  console.log(`🚀 Starting preview server on ${PORT}...`);
  const server = spawn(IS_WIN ? 'npx.cmd' : 'npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'ignore'
  });

  let browser;
  const failures = [];

  try {
    await waitForServer(PREVIEW_URL);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: VIEWPORT, isMobile: true, hasTouch: true });
    const page = await context.newPage();

    // Any uncaught exception or console error anywhere in this run is a failure
    const runtimeErrors = [];
    page.on('pageerror', (err) => runtimeErrors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') runtimeErrors.push(`console.error: ${msg.text()}`);
    });

    // ---------------------------------------------------------------------
    console.log('▶ Case 1: fresh game survives cell taps and number entry');
    // ---------------------------------------------------------------------
    await startFreshGame(page);
    const errorsBeforeCase1 = runtimeErrors.length;

    const cells = page.locator('.sudoku-cell');
    assert.strictEqual(await cells.count(), 81, 'Board must render exactly 81 cells');

    let blank = await firstBlankCellIndex(page);
    assert.ok(blank >= 0, 'A fresh puzzle must have at least one blank cell');

    // Tap a blank cell, then press three different keypad digits
    for (const digit of [1, 2, 3]) {
      blank = await firstBlankCellIndex(page);
      if (blank < 0) break;
      await cells.nth(blank).click();
      await page.waitForTimeout(80);
      await page.locator(`.number-pad .num-btn:nth-child(${digit})`).click();
      await page.waitForTimeout(120);
    }

    const case1Errors = runtimeErrors.slice(errorsBeforeCase1);
    if (case1Errors.length) failures.push(`Case 1 runtime errors:\n     ${case1Errors.join('\n     ')}`);
    else console.log('  ✅ 81 cells rendered; taps and digit entry raised no runtime errors');

    // ---------------------------------------------------------------------
    console.log('▶ Case 2: clock keeps advancing while the player taps rapidly');
    // ---------------------------------------------------------------------
    await startFreshGame(page);
    const tapCells = page.locator('.sudoku-cell');
    const startSeconds = await readTimerSeconds(page);

    // Tap ~5x/second for 7s. Each tap re-renders; a callback in the interval's
    // dependency array would restart the 1s tick every time and freeze the clock.
    const tapUntil = Date.now() + 7000;
    let taps = 0;
    while (Date.now() < tapUntil) {
      await tapCells.nth(taps % 2 === 0 ? 0 : 80).click({ timeout: 2000 });
      taps++;
      await page.waitForTimeout(200);
    }
    const endSeconds = await readTimerSeconds(page);
    const advanced = endSeconds - startSeconds;

    if (advanced < 5) {
      failures.push(
        `Case 2: timer advanced only ${advanced}s during 7s of rapid tapping (${taps} taps). ` +
        `Expected >= 5s. The interval is being torn down on every render.`
      );
    } else {
      console.log(`  ✅ Timer advanced ${advanced}s across ${taps} rapid taps (>= 5s required)`);
    }

    // ---------------------------------------------------------------------
    console.log('▶ Case 3: resuming a save with no solutionBoard does not crash');
    // ---------------------------------------------------------------------
    const { state: noSolutionState } = buildSavedState({ level: 1, omitSolution: true });
    await seedAndResume(page, noSolutionState);
    const errorsBeforeCase3 = runtimeErrors.length;

    // Tapping a FILLED cell dereferences the solution grid, so a boolean sneaking
    // in there throws here. (A blank cell short-circuits and hides the fault.)
    const filled = await firstFilledCellIndex(page);
    if (filled >= 0) {
      await page.locator('.sudoku-cell').nth(filled).click();
      await page.waitForTimeout(150);
    }

    // Then prove input still works. If initialBoard was solved in place, every cell
    // now counts as a given and entry is silently rejected — no crash, just a dead board.
    const target = await firstBlankCellIndex(page);
    let placed = '';
    if (target >= 0) {
      await page.locator('.sudoku-cell').nth(target).click();
      await page.waitForTimeout(150);
      await page.locator('.number-pad .num-btn:nth-child(1)').click();
      await page.waitForTimeout(250);
      placed = await cellDigitAt(page, target);
    }

    const case3Errors = runtimeErrors.slice(errorsBeforeCase3);
    if (case3Errors.length) {
      failures.push(
        `Case 3: resuming a save without solutionBoard raised errors:\n     ${case3Errors.join('\n     ')}`
      );
    } else if (target < 0) {
      failures.push('Case 3: resumed board had no blank cells at all — initialBoard was overwritten');
    } else if (placed !== '1') {
      failures.push(
        `Case 3: entered "1" into a blank cell but the cell shows "${placed || '(empty)'}". ` +
        'Input is dead — initialBoard was solved in place, so every cell reads as a given.'
      );
    } else {
      console.log('  ✅ Resumed cleanly; tapping a given cell and entering a digit both work');
    }

    // ---------------------------------------------------------------------
    console.log('▶ Case 4: filling the final cell raises the victory modal');
    // ---------------------------------------------------------------------
    const { state: almostDone, remaining } = buildSavedState({ level: 1, leaveEmpty: 1 });
    assert.strictEqual(remaining.length, 1, 'Fixture must leave exactly one blank cell');
    await seedAndResume(page, almostDone);

    const lastIdx = await firstBlankCellIndex(page);
    if (lastIdx < 0) {
      failures.push('Case 4: no blank cell found after resuming a one-cell-remaining save');
    } else {
      await page.locator('.sudoku-cell').nth(lastIdx).click();
      await page.waitForTimeout(150);
      await page.locator(`.number-pad .num-btn:nth-child(${remaining[0].value})`).click();

      const victory = page.locator('.victory-card');
      try {
        await victory.waitFor({ state: 'visible', timeout: 4000 });
        console.log('  ✅ Victory modal appeared after the final correct entry');
        if (await page.locator('.victory-not-recorded').count()) {
          failures.push('Case 4: a clean win with the mistake limit on says the time was not recorded');
        }
        // The celebration draws on one small canvas. A viewport-sized one failed to
        // allocate on the phone and left tiles of the card unpainted (SudokuDiary ㉜).
        const canvases = await page.evaluate(() => [...document.querySelectorAll('canvas')]
          .map((c) => ({ cls: c.className, w: c.width, h: c.height, vw: window.innerWidth })));
        const big = canvases.filter((c) => c.w >= c.vw);
        if (big.length) failures.push(`Case 4: a full-viewport canvas is on the win screen (${JSON.stringify(big)})`);
        else if (canvases.length) console.log(`  ✅ celebration canvas ${canvases[0].w}x${canvases[0].h} (viewport ${canvases[0].vw})`);

        // The victory modal's buttons call back into the game hook. A handler that
        // reaches for something the hook does not return throws mid-click, and the
        // navigation after it never runs — the button looks simply dead.
        const errorsBeforeNav = runtimeErrors.length;
        await page.locator('.victory-card button').first().click();
        await page.waitForTimeout(1000);

        const nav = await page.evaluate(() => {
          const tabs = [...document.querySelectorAll('.seg-tab-btn')];
          return {
            victoryStillUp: !!document.querySelector('.victory-card'),
            onStatsScreen: tabs.length > 0,
            activeTab: tabs.find((t) => t.classList.contains('active'))?.innerText?.trim() || null
          };
        });
        const navErrors = runtimeErrors.slice(errorsBeforeNav);

        if (navErrors.length) {
          failures.push(`Case 4: the My Records button threw:\n     ${navErrors.join('\n     ')}`);
        } else if (nav.victoryStillUp || !nav.onStatsScreen) {
          failures.push('Case 4: the victory modal\'s leaderboard button did nothing — no navigation happened');
        } else if (!/^Stats$/i.test(nav.activeTab || '')) {
          // The button reads "My Records" and opens the records tab. The ranking tab it
          // used to open was removed (SudokuDiary ㉖).
          failures.push(`Case 4: navigated to stats but landed on the "${nav.activeTab}" tab, not the records tab`);
        } else {
          console.log(`  ✅ My Records button navigated to the stats screen, tab "${nav.activeTab}"`);
        }
      } catch {
        failures.push('Case 4: victory modal never appeared after completing the board');
      }
    }
    // ---------------------------------------------------------------------
    console.log('▶ Case 4b: a win without the mistake limit says why the time was not recorded');
    // ---------------------------------------------------------------------
    // Without this line the player sees a fast time that never becomes their best and
    // takes it for a bug (BACKLOG R-1, gate 2-21 covers the stats themselves).
    {
      const { state: s4b, remaining: r4b } = buildSavedState({ level: 1, leaveEmpty: 1 });
      await seedAndResume(page, s4b, { limitMistakes: false });
      const idx = await firstBlankCellIndex(page);
      await page.locator('.sudoku-cell').nth(idx).click();
      await page.waitForTimeout(150);
      await page.locator(`.number-pad .num-btn:nth-child(${r4b[0].value})`).click();
      try {
        await page.locator('.victory-card').waitFor({ state: 'visible', timeout: 4000 });
        const note = page.locator('.victory-not-recorded');
        const reason = (await note.count()) ? await note.getAttribute('data-reason') : null;
        const text = (await note.count()) ? (await note.innerText()).trim() : '';
        if (reason !== 'no_mistake_limit' || !/3-mistake limit/.test(text)) {
          failures.push(`Case 4b: expected the no-limit notice, got reason=${reason} text="${text}"`);
        } else {
          console.log(`  ✅ Notice shown: "${text}"`);
        }
      } catch {
        failures.push('Case 4b: victory modal never appeared');
      }
    }

    // ---------------------------------------------------------------------
    console.log('▶ Case 4c: a game still being played past 3 mistakes can be resumed (RT-1)');
    // ---------------------------------------------------------------------
    // With the limit off, or in Speedrun, 3 mistakes do not end the game — but Home
    // used to hide Resume for any save with 3 mistakes (ChatGPT red team F12).
    for (const { mode, settings, label } of [
      { mode: 'classic', settings: { limitMistakes: false }, label: 'classic, limit off' },
      { mode: 'timeAttack', settings: {}, label: 'Speedrun' },
    ]) {
      const { state } = buildSavedState({ level: 1, leaveEmpty: 20 });
      state.mistakes = 3;
      state.gameMode = mode;
      await primeStorage(page, state, settings);
      await page.waitForSelector('.home-screen-container', { timeout: 5000 });
      if (mode === 'timeAttack') {
        await page.locator('.home-screen-container .mode-tab-btn').nth(1).click();
        await page.waitForTimeout(200);
      }
      try {
        await enterGame(page, '.btn-resume');
        console.log(`  ✅ ${label}: Resume offered and the game reopened with 3 mistakes`);
      } catch {
        failures.push(`Case 4c (${label}): no Resume for a game still being played with 3 mistakes`);
      }
    }

    // ---------------------------------------------------------------------
    console.log('▶ Case 4d: a broken save does not blank the app (RT-6)');
    // ---------------------------------------------------------------------
    {
      const { state } = buildSavedState({ level: 1, leaveEmpty: 20 });
      state.board = 'broken';
      const before = runtimeErrors.length;
      await primeStorage(page, state);
      await page.waitForTimeout(800);
      const home = await page.$('.home-screen-container');
      const resume = await page.$('.btn-resume');
      const errs = runtimeErrors.slice(before);
      if (!home || resume || errs.length) {
        failures.push(`Case 4d: broken save — home=${!!home} resume=${!!resume} errors=${errs.join(' | ')}`);
      } else {
        console.log('  ✅ Home renders, the broken save is simply not offered');
      }
    }

    // ---------------------------------------------------------------------
    console.log('▶ Case 5: progress is saved on a move, and flushed on backgrounding');
    // ---------------------------------------------------------------------
    // Auto-save is change-driven, not clock-driven (see useGameLifecycle). This
    // guards both halves of that: a move must persist immediately, and hiding the
    // app must flush the clock even though no move happened.
    await startFreshGame(page);
    const readSave = () => page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem('suidoku_game_state_v1') || 'null');
      } catch {
        return null;
      }
    });

    const blankIdx = await firstBlankCellIndex(page);
    await page.locator('.sudoku-cell').nth(blankIdx).click();
    await page.waitForTimeout(120);
    await page.locator('.number-pad .num-btn:nth-child(1)').click();
    await page.waitForTimeout(400);

    // The cell that was played, read by its coordinates. This asked whether a 1
    // was ANYWHERE on the saved board, and a puzzle's clues nearly always hold a
    // 1 — so a move that was never saved passed (external audit V11, 2026-09-12;
    // fixed 2026-09-30).
    const row = Math.floor(blankIdx / 9);
    const col = blankIdx % 9;
    const afterMove = await readSave();
    const playedValue = afterMove?.board?.[row]?.[col];
    if (!afterMove || !Array.isArray(afterMove.board)) {
      failures.push('Case 5: no game state was saved after entering a digit');
    } else if (playedValue !== 1) {
      failures.push(`Case 5: the saved board has ${JSON.stringify(playedValue)} at row ${row + 1}, column ${col + 1}, where 1 was entered — the move was not persisted`);
    } else {
      const clockAtMove = afterMove.timerSeconds ?? 0;

      // Idle (no moves) so only the clock advances, then background the app
      await page.waitForTimeout(3500);
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForTimeout(400);

      const afterHide = await readSave();
      const clockAtHide = afterHide?.timerSeconds ?? 0;
      if (clockAtHide <= clockAtMove) {
        failures.push(
          `Case 5: backgrounding did not flush the clock (saved ${clockAtMove}s -> ${clockAtHide}s). ` +
          'A game abandoned mid-think would resume with a stale timer.'
        );
      } else {
        console.log(`  ✅ Move persisted; hide flushed the clock ${clockAtMove}s -> ${clockAtHide}s`);
      }
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
    if (IS_WIN) {
      try {
        execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' });
      } catch {
        /* best effort */
      }
    }
  }

  console.log('\n======================================================');
  if (failures.length > 0) {
    console.error(`❌ ${failures.length} gameplay failure(s):\n`);
    failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
    process.exit(1);
  }
  console.log('🎉 [PASS] Real Gameplay End-to-End 100% Verified!');
  console.log('======================================================\n');
}

run().catch((err) => {
  console.error('\n❌ Gameplay E2E crashed:', err);
  process.exit(1);
});
