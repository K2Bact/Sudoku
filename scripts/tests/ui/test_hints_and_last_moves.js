/**
 * test_hints_and_last_moves.js — gate 3-20
 *
 * What the last move of a game writes, played through the real buttons
 * (ChatGPT's review of 1.6.0, 2026-10-18, CH18-01…04 — Diary 143). Every one of
 * these passed the unit gates, which hand the win function the right facts; the
 * bugs were in how the screen produced those facts:
 *
 *   1. The first hint on the last cell (classic, killer). The hint count reached
 *      state a render after the win was recorded, so a hint game saved a best
 *      time, a ghost and a hint-free level clear while the victory card said it
 *      was not a record. Control: the same cell typed in records all three.
 *   2. A hint with the pencil on. It went in as a note: the hint spent, the cell
 *      empty. It must place the answer.
 *   3. A daily resumed after a relaunch, and after a trip home. The day lived only
 *      in App's state, so the finish was a plain win: no calendar mark, no hint.
 *   4. The last cell of a Speedrun in a combo (classic, killer). Its bonus and
 *      combo reached state a render late: 04:59 on screen, 300 s saved, combo 1.
 *      The saved best must be the time on the victory card, the combo counted.
 *   5. A combo early in a Speedrun, then a pause. The win kept only the streak
 *      still running at the last cell, so a 2-combo followed by a pause saved 1.
 *   6. A 5-combo, a pause, then home or a relaunch and Resume (classic, killer).
 *      The first fix for 5 kept the best beside the clock, which a resume resets:
 *      saved 1, "combo 5" missed (ChatGPT's re-review, CH18-R01). Kept in the save.
 *
 * Each case writes a finished-but-one save the way the app does (createPuzzle,
 * the same shape useGameLifecycle saves) and resumes it from Home, except the
 * dailies, which are started from the calendar and played through.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { createPuzzle } from '../../../src/engine/variants.js';

const PORT = 5221;
const URL = `http://localhost:${PORT}`;
const IS_WIN = process.platform === 'win32';
const failures = [];
const fail = (msg) => failures.push(msg);
const pass = (msg) => console.log(`  ✓ ${msg}`);

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** A level-3 save with only the last `blanks` open cells left, as the app writes one. */
function nearlyDone(variant, blanks, gameMode = 'classic') {
  const p = createPuzzle(variant, 3, `gate-3-20-${variant}`);
  const initialBoard = p.puzzle || p.board;
  const open = initialBoard.flatMap((row, r) => row.flatMap((n, c) => (n === 0 ? [{ r, c, value: p.solution[r][c] }] : [])));
  const left = open.slice(-blanks);
  const board = p.solution.map((row) => [...row]);
  for (const { r, c } of left) board[r][c] = 0;
  return {
    left,
    state: {
      board, initialBoard, solutionBoard: p.solution,
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      level: 3, variant, cages: p.cages || null, gameMode,
      mistakes: 0, timerSeconds: 300, playedSeconds: 300,
      hintsUsedCount: 0, adHintsUsedThisGame: 0,
      playFacts: { notesPlaced: 0, fastEntryUsed: false, fromStart: true, rewardedCells: [] },
      isFastEntryMode: false, lockedNumber: null
    }
  };
}

/** Fresh storage (English, attendance claimed, 5 hints), optionally a save; Home. */
async function prime(page, { variant = 'classic', save = null } = {}) {
  await page.goto(URL);
  await page.evaluate(({ today, variant, save }) => {
    localStorage.clear();
    localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en', theme: 'matte-dark', homeVariant: variant, killerRulesSeen: true, limitMistakes: true, autoCheckMistakes: true, soundEnabled: false }));
    localStorage.setItem('suidoku_user_wallet_v1', JSON.stringify({ hints: 5, lastDailyClaimDate: today, streakDays: 1, totalAdsWatched: 0, history: [] }));
    localStorage.setItem('suidoku_review_prompted', '1');
    if (save) localStorage.setItem('suidoku_game_state_v1', JSON.stringify(save));
  }, { today: todayKey(), variant, save });
  await page.reload();
  await page.waitForSelector('.home-bottom-nav', { timeout: 8000 });
}

async function resume(page, gameMode = 'classic') {
  if (gameMode === 'timeAttack') await page.click('.time-attack-tab');
  await page.click('.btn-resume');
  await page.waitForSelector('.sudoku-grid', { timeout: 8000 });
}

const read = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
const hintsLeft = async (page) => (await read(page, 'suidoku_user_wallet_v1'))?.hints;
const recordOf = (stats, variant) => (variant === 'killer' ? stats?.killer : stats) || {};
const ghostOf = (ghosts, variant, mode, level) => ((variant === 'killer' ? ghosts?.killer : ghosts) || {})?.[mode]?.[level] || null;

/** Type a digit into a cell through the board and the keypad. */
async function enter(page, { r, c, value }) {
  const i = r * 9 + c;
  await page.locator('.sudoku-cell').nth(i).click();
  await page.locator('.num-btn').filter({ has: page.locator('.num-val', { hasText: new RegExp(`^${value}$`) }) }).click();
}

async function victory(page) {
  await page.waitForSelector('.victory-card', { timeout: 15000 });
}

/** The time on the victory card, in seconds. */
async function cardSeconds(page) {
  const text = await page.locator('.victory-card .stat-box').nth(1).innerText();
  const m = text.match(/(\d+):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** Fill every open cell from the save's solution. */
async function solveRest(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const st = JSON.parse(localStorage.getItem('suidoku_game_state_v1'));
    const cells = [...document.querySelectorAll('.sudoku-cell')];
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      if (st.board[r][c] !== 0) continue;
      cells[i].click();
      await sleep(20);
      [...document.querySelectorAll('.num-btn')].find((b) => b.innerText.trim().startsWith(String(st.solutionBoard[r][c])))?.click();
      await sleep(20);
    }
  });
}

/** "Leave the game?" and "throw it away?" — yes, when asked. */
async function confirmIfAsked(page) {
  await page.waitForTimeout(250);
  const yes = page.locator('.confirm-overlay .btn-primary');
  if (await yes.count()) await yes.click();
  await page.waitForTimeout(300);
}

async function run() {
  const server = spawn(IS_WIN ? 'cmd' : 'sh', [IS_WIN ? '/c' : '-c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 360, height: 800 }, serviceWorkers: 'block' });
    await context.route('**/*', (route) => (route.request().url().startsWith(URL) ? route.continue() : route.abort()));
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    console.log('======================================================');
    console.log('🧪 [3-20] What the last move of a game writes (hints, a resumed daily, a final combo)');
    console.log('======================================================');

    // 1. The first hint on the last cell — and the same cell typed, as the control.
    for (const variant of ['classic', 'killer']) {
      for (const how of ['typed', 'hint']) {
        const { state, left } = nearlyDone(variant, 1);
        await prime(page, { variant, save: state });
        await resume(page);
        if (how === 'typed') await enter(page, left[0]);
        else await page.click('.hint-btn');
        await victory(page);
        const rec = recordOf(await read(page, 'suidoku_user_stats_v1'), variant);
        const ghost = ghostOf(await read(page, 'suidoku_ghost_records_v1'), variant, 'classic', 3);
        const noticeEl = page.locator('.victory-not-recorded');
        const notice = (await noticeEl.count()) ? await noticeEl.getAttribute('data-reason') : null;
        const left5 = await hintsLeft(page);
        const tag = `1. ${variant}, last cell ${how}`;
        if (how === 'typed') {
          if (!rec.bestTimes?.[3] || rec.clearedLevels?.[3] !== true || !ghost?.bestSeconds || notice) {
            fail(`${tag}: control should record — best ${rec.bestTimes?.[3]}, cleared ${rec.clearedLevels?.[3]}, ghost ${ghost?.bestSeconds}, card "${notice}"`);
          } else pass(`${tag}: best time, hint-free clear and ghost saved (the control)`);
        } else if (left5 !== 4 || notice !== 'hint_used' || rec.bestTimes?.[3] || rec.clearedLevels?.[3] || ghost?.bestSeconds) {
          fail(`${tag}: hints ${left5} (want 4), card "${notice}" (want hint_used), best ${rec.bestTimes?.[3]}, cleared ${rec.clearedLevels?.[3]}, ghost ${ghost?.bestSeconds} — a hint game saved as a record`);
        } else pass(`${tag}: one hint spent, the card and the save agree — no best, no hint-free clear, no ghost`);
      }
    }

    // 2. A hint with the pencil on places the answer.
    {
      const { state, left } = nearlyDone('classic', 2);
      await prime(page, { save: state });
      await resume(page);
      const target = left[0];
      await page.locator('.sudoku-cell').nth(target.r * 9 + target.c).click();
      await page.locator('.action-btn').filter({ has: page.locator('svg.lucide-pencil') }).click();
      await page.click('.hint-btn');
      await page.waitForTimeout(400);
      const save = await read(page, 'suidoku_game_state_v1');
      const cell = save?.board?.[target.r]?.[target.c];
      const notes = save?.notes?.[target.r]?.[target.c] || [];
      const left4 = await hintsLeft(page);
      if (left4 !== 4 || cell !== target.value || notes.length || save?.hintsUsedCount !== 1) {
        fail(`2. hint with the pencil on: hints ${left4} (want 4), cell ${cell} (want ${target.value}), notes [${notes}] (want none), hints used ${save?.hintsUsedCount}`);
      } else pass('2. a hint with the pencil on places the answer, not a note');
    }

    // 3. A daily finished after a relaunch, and after a trip home, is still the daily.
    for (const away of ['relaunch', 'home']) {
      await prime(page);
      await page.click('.daily-card-banner');
      await page.click('.calendar-day-btn.today');
      await page.waitForSelector('.sudoku-grid');
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('suidoku_game_state_v1') || '{}').solutionBoard?.length === 9);
      const start = await read(page, 'suidoku_game_state_v1');
      const first = start.board.flatMap((row, r) => row.flatMap((v, c) => (v === 0 ? [{ r, c, value: start.solutionBoard[r][c] }] : [])))[0];
      await enter(page, first);
      await page.waitForTimeout(300);
      if (away === 'relaunch') {
        await page.reload();
        await page.waitForSelector('.home-bottom-nav');
      } else {
        await page.click('.back-home-btn');
        await confirmIfAsked(page);
        await page.waitForSelector('.home-bottom-nav');
      }
      await resume(page);
      await solveRest(page);
      await victory(page);
      const day = (await read(page, 'suidoku_daily_records_v1'))?.[todayKey()];
      const left6 = await hintsLeft(page);
      // The calendar mark and the +1 alone do not tell: a plain win can earn both
      // through the day's mission (gameCompletion.js). Only a win that knows it is
      // the daily unlocks daily_first (achievementManager.js, ctx.isDaily).
      const dailyFirst = Boolean((await read(page, 'sudoku_achievements_v1'))?.daily_first);
      if (!day?.completed || left6 !== 6 || !dailyFirst) {
        fail(`3. daily after a ${away}: calendar ${JSON.stringify(day)} (want completed), hints ${left6} (want 6 — the daily's +1), daily_first ${dailyFirst} (want true — the win knew it was the daily)`);
      } else pass(`3. a daily resumed after a ${away} is the daily: calendar marked, its hint paid, daily_first unlocked`);
    }

    // 4. The last Speedrun cell in a combo: the saved best is the time on the card.
    for (const variant of ['classic', 'killer']) {
      const { state, left } = nearlyDone(variant, 2, 'timeAttack');
      await prime(page, { variant, save: state });
      await resume(page, 'timeAttack');
      await enter(page, left[0]);
      await enter(page, left[1]);
      await victory(page);
      const rec = recordOf(await read(page, 'suidoku_user_stats_v1'), variant);
      const shown = await cardSeconds(page);
      const best = rec.timeAttackBestTimes?.[3];
      if (shown == null || best !== shown || !(rec.maxCombo >= 2)) {
        fail(`4. ${variant} Speedrun, last cell in a combo: card ${shown} s, saved ${best} s, combo ${rec.maxCombo} (want the card's time and ≥ 2)`);
      } else pass(`4. ${variant} Speedrun: the saved best is the card's ${shown} s, the final 2-combo counted`);
    }

    // 5. A combo early, then a pause past 3.5 s: the game's best streak is kept.
    {
      const { state, left } = nearlyDone('classic', 3, 'timeAttack');
      await prime(page, { save: state });
      await resume(page, 'timeAttack');
      await enter(page, left[0]);
      await enter(page, left[1]);
      await page.waitForTimeout(4200);
      await enter(page, left[2]);
      await victory(page);
      const rec = recordOf(await read(page, 'suidoku_user_stats_v1'), 'classic');
      if (!(rec.maxCombo >= 2)) fail(`5. Speedrun 2-combo, pause, last cell: saved combo ${rec.maxCombo} (want 2 — the game's best streak)`);
      else pass('5. a 2-combo before a pause is kept as the game\'s best streak');
    }

    // 6. A 5-combo, a pause, then away and back (ChatGPT CH18-R01, 2026-10-18): the
    //    game's best was kept beside the clock, and a resume resets the clock — the
    //    win saved 1 and "combo 5" was missed. It is saved with the game now.
    for (const [variant, away] of [['classic', 'home'], ['killer', 'relaunch']]) {
      const { state, left } = nearlyDone(variant, 6, 'timeAttack');
      await prime(page, { variant, save: state });
      await resume(page, 'timeAttack');
      for (const cell of left.slice(0, 5)) await enter(page, cell);
      const floating = await page.locator('.time-floating-indicator').innerText().catch(() => '');
      await page.waitForTimeout(4200);
      if (away === 'home') {
        await page.click('.back-home-btn');
        await confirmIfAsked(page);
        await page.waitForSelector('.home-bottom-nav');
      } else {
        await page.reload();
        await page.waitForSelector('.home-bottom-nav');
      }
      await resume(page, 'timeAttack');
      await enter(page, left[5]);
      await victory(page);
      const rec = recordOf(await read(page, 'suidoku_user_stats_v1'), variant);
      const combo5 = Boolean((await read(page, 'sudoku_achievements_v1'))?.combo_streak_5);
      const tag = `6. ${variant} Speedrun 5-combo, pause, ${away}, resume, last cell`;
      if (!floating.includes('5 COMBO')) fail(`${tag}: the five quick cells showed "${floating}" — no 5-combo to keep (the case did not set itself up)`);
      else if (rec.maxCombo !== 5 || !combo5) fail(`${tag}: saved combo ${rec.maxCombo} (want 5), combo_streak_5 ${combo5} (want true) — the best was lost over the resume`);
      else pass(`${tag}: the 5-combo kept over the resume, "combo 5" earned`);
    }

    if (pageErrors.length) fail(`page errors: ${pageErrors.join(' | ')}`);
  } finally {
    if (browser) await browser.close();
    server.kill();
    try { execSync(`${IS_WIN ? 'npx.cmd' : 'npx'} kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
  }

  if (failures.length) {
    console.error(`\n❌ [3-20] FAILED — ${failures.length} finding(s):`);
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('\n✅ [3-20] PASSED — the last move writes what the screen shows: hints counted, a resumed daily is the daily, the final combo kept');
}

run().catch((err) => {
  console.error('\n❌ [3-20] crashed:', err);
  process.exit(1);
});
