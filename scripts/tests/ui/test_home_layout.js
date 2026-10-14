import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

/**
 * 검증 스크린샷을 저장소 루트가 아니라 출력 디렉터리에 쓴다.
 *
 * 예전에는 루트에 맨 파일명으로 5개를 덮어썼고, 그 5개가 git 에 추적되고 있어서
 * QA 를 돌릴 때마다 작업트리에 2바이트짜리 diff 가 생겼다(PNG 압축이 실행마다
 * 미세하게 다르다). 앱이 깨지지는 않지만 진짜 변경을 가리고, 테스트 산출물을
 * 실수로 커밋할 통로가 된다.
 */
const SHOT_DIR = 'test_output/home_layout';
fs.mkdirSync(SHOT_DIR, { recursive: true });
import { spawn, execSync } from 'child_process';
import http from 'http';

const PORT = 5195;
const PREVIEW_URL = 'http://localhost:' + PORT;
const VIEWPORT = { width: 360, height: 800 };

function waitForServer(url, timeout = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) resolve();
        else setTimeout(check, 200);
      }).on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Server timeout'));
        else setTimeout(check, 200);
      });
    };
    check();
  });
}


/**
 * process.exit() skips finally, so cleanup has to happen before it. Every exit
 * in this file goes through here.
 *
 * Killing the spawned process is not enough on Windows: it is spawned through a
 * shell wrapper, so the signal stops the wrapper and the vite server underneath
 * keeps the port. The port is what the next run needs back, so free that.
 */
function shutdownPreview(viteProcess) {
  try { viteProcess.kill(); } catch (e) { /* already gone */ }
  try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch (e) { /* nothing listening */ }
}

/**
 * What this gate asserts, per state (external audit V05, 2026-09-12 — until
 * 2026-09-30 it saved five pictures and asserted nothing, so a home screen whose
 * cards sat on top of each other passed as long as it rendered):
 *   - the page does not scroll sideways, and no block runs past the screen edge
 *   - the home screen's blocks do not overlap one another
 *   - the three mode tabs share one row; the five level chips share one row at one width
 *   - the ghost chip shows the recorded time when there is one, and --:-- when not
 * The pictures are still saved, for a person to look at; they are not the verdict.
 */
async function checkLayout(page, state, expectGhostTime) {
  const found = await page.evaluate((ghostTime) => {
    const out = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 1) out.push(`the page scrolls sideways (${document.documentElement.scrollWidth}px in ${vw}px)`);
    const home = document.querySelector('.home-screen-container');
    if (!home) return ['the home screen is not on screen'];
    const visible = (el) => el.offsetParent !== null && el.getBoundingClientRect().height > 0;
    const blocks = [...home.children].filter(visible);
    if (blocks.length < 3) out.push(`only ${blocks.length} home blocks are visible`);
    const r = (el) => el.getBoundingClientRect();
    const name = (el) => (el.className && String(el.className).split(' ')[0]) || el.tagName.toLowerCase();
    for (const b of blocks) {
      const x = r(b);
      if (x.left < -1 || x.right > vw + 1) out.push(`${name(b)} runs past the screen edge (${Math.round(x.left)}..${Math.round(x.right)} of ${vw})`);
    }
    const overlap = (a, b) => { const p = r(a), q = r(b); return Math.min(p.right, q.right) - Math.max(p.left, q.left) > 1 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 1; };
    const pairs = (list) => { for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (overlap(list[i], list[j])) out.push(`${name(list[i])} and ${name(list[j])} overlap`); };
    pairs(blocks);
    // The mode card, the duel cards and the daily card sit one level down, in
    // .home-menu-group — comparing only the top level never looked at them.
    for (const group of home.querySelectorAll('.home-menu-group')) pairs([...group.children].filter(visible));
    pairs([...home.querySelectorAll('.half-banner-card')].filter(visible));
    for (const sel of ['.home-hero-card', '.btn-play-new']) if (!home.querySelector(sel) || !visible(home.querySelector(sel))) out.push(`${sel} is not on screen`);
    const row = (sel, n, sameWidth) => {
      const els = [...home.querySelectorAll(sel)].filter(visible);
      if (els.length !== n) { out.push(`${sel}: ${els.length} visible, expected ${n}`); return; }
      const tops = els.map((e) => Math.round(r(e).top));
      if (Math.max(...tops) - Math.min(...tops) > 2) out.push(`${sel} do not share one row (tops ${tops.join(',')})`);
      if (sameWidth) {
        const w = els.map((e) => r(e).width);
        if (Math.max(...w) - Math.min(...w) > 2) out.push(`${sel} differ in width (${w.map(Math.round).join(',')})`);
      }
      pairs(els);
    };
    row('.mode-tab-btn', 3, false);
    row('.level-chip-group button', 5, true);
    const ghost = home.querySelector('.ghost-chip');
    if (!ghost) out.push('the ghost chip is not on screen');
    else if (!ghost.textContent.includes(ghostTime)) out.push(`the ghost chip says "${ghost.textContent.trim()}", expected it to show ${ghostTime}`);
    return out;
  }, expectGhostTime);
  if (found.length) layoutProblems.push(...found.map((p) => `${state}: ${p}`));
}
const layoutProblems = [];

async function run() {
  console.log('Building Vite bundle...');
  execSync('cmd /c npx vite build', { stdio: 'ignore' });

  console.log('Starting preview server...');
  const viteProcess = spawn('cmd', ['/c', 'npx vite preview --port ' + PORT + ' --strictPort'], {
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  try {
    await waitForServer(PREVIEW_URL);
    console.log('Connected to server');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: VIEWPORT,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();
    await page.goto(PREVIEW_URL);

    // Set up storage with a PB on level 3 for Time Attack
    await page.evaluate(() => {
      localStorage.setItem('suidoku_review_prompted', 'done');
      localStorage.setItem('suidoku_daily_reward_v1', JSON.stringify({ claimedDate: new Date().toISOString().slice(0, 10) }));
      // A killer speedrun ghost at the same level, with another time (2026-10-14,
      // KP-3): on the killer switch the chip must show the killer one.
      localStorage.setItem('suidoku_ghost_records_v1', JSON.stringify({
        classic: {},
        timeAttack: {
          3: {
            bestSeconds: 66,
            timeSeconds: 66,
            hintsUsed: 0,
            seed: 'test-seed'
          }
        },
        killer: { classic: {}, timeAttack: { 3: { bestSeconds: 222 } } }
      }));
    });
    await page.reload();
    await page.waitForTimeout(600);

    // 1. Classic Mode Screenshot
    await checkLayout(page, 'classic', '--:--');
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_classic_verified.png') });
    console.log('Saved home_classic_verified.png');

    // 2. Click Time Attack Tab
    await page.click('.time-attack-tab');
    await page.waitForTimeout(400);
    await checkLayout(page, 'speedrun with a record', '01:06');
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_timeattack_pb_verified.png') });
    console.log('Saved home_timeattack_pb_verified.png');

    // 3. Click Ghost chip
    await page.click('.ghost-chip');
    await page.waitForTimeout(400);
    await checkLayout(page, 'ghost selected', '01:06');
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_timeattack_ghost_selected.png') });
    console.log('Saved home_timeattack_ghost_selected.png');

    // 4. Click Level 1 (No PB -> should show --:--)
    await page.click('.level-chip-group button:nth-child(1)');
    await page.waitForTimeout(400);
    await checkLayout(page, 'speedrun, no record', '--:--');
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_timeattack_nopb_verified.png') });
    console.log('Saved home_timeattack_nopb_verified.png');

    // 5. Click Survival (Time Limit) Tab
    await page.click('.time-limit-tab');
    await page.waitForTimeout(400);
    await checkLayout(page, 'survival', '--:--');
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_survival_verified.png') });
    console.log('Saved home_survival_verified.png');

    // 6. The killer switch, Speedrun, level 3: its own record (03:42), not the classic 01:06
    await page.click('.variant-option[data-variant="killer"]');
    await page.click('.time-attack-tab');
    await page.click('.level-chip-group button:nth-child(3)');
    await page.waitForTimeout(400);
    await checkLayout(page, 'killer speedrun with a record', '03:42');
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_killer_timeattack_pb_verified.png') });
    console.log('Saved home_killer_timeattack_pb_verified.png');

    // 7. Its Ghost chip selected
    await page.click('.ghost-chip');
    await page.waitForTimeout(400);
    await checkLayout(page, 'killer ghost selected', '03:42');
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_killer_ghost_selected.png') });
    console.log('Saved home_killer_ghost_selected.png');

    // 8. The killer switch, Survival (2026-10-14, KP-2): the tab opens — it said
    //    "coming" until then — the start is the Survival one, and the rival chips
    //    are off in Survival (--:--) though a killer speedrun record exists.
    await page.click('.time-limit-tab');
    await page.waitForTimeout(400);
    await checkLayout(page, 'killer survival', '--:--');
    const survivalOpen = await page.evaluate(() => Boolean(document.querySelector('.time-limit-tab.active') && document.querySelector('.btn-play-new .lucide-hourglass')));
    if (!survivalOpen) layoutProblems.push('killer survival: the Survival tab on the killer switch did not switch to Survival (no active tab, no Survival start)');
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_killer_survival_verified.png') });
    console.log('Saved home_killer_survival_verified.png');

    await browser.close();
    if (layoutProblems.length) {
      console.error(`❌ [3-5] ${layoutProblems.length} layout problem(s) on the home screen:`);
      for (const p of layoutProblems) console.error('   - ' + p);
      shutdownPreview(viteProcess);
      process.exit(1);
    }
    console.log('  ✅ 8 home states (3 on the killer switch): no sideways scroll, no overlapping blocks, tabs and chips in their rows, the ghost time of the kind shown');
    console.log('All screenshots captured successfully!');
  } finally {
    shutdownPreview(viteProcess);
  }
}

run().catch((e) => {
  console.error(e);
  // viteProcess lives inside run(); out here only the port can be freed.
  shutdownPreview(null);
  process.exit(1);
});
