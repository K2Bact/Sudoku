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
      localStorage.setItem('suidoku_ghost_records_v1', JSON.stringify({
        classic: {},
        timeAttack: {
          3: {
            bestSeconds: 66,
            timeSeconds: 66,
            hintsUsed: 0,
            seed: 'test-seed'
          }
        }
      }));
    });
    await page.reload();
    await page.waitForTimeout(600);

    // 1. Classic Mode Screenshot
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_classic_verified.png') });
    console.log('Saved home_classic_verified.png');

    // 2. Click Time Attack Tab
    await page.click('.time-attack-tab');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_timeattack_pb_verified.png') });
    console.log('Saved home_timeattack_pb_verified.png');

    // 3. Click Ghost chip
    await page.click('.ghost-chip');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_timeattack_ghost_selected.png') });
    console.log('Saved home_timeattack_ghost_selected.png');

    // 4. Click Level 1 (No PB -> should show --:--)
    await page.click('.level-chip-group button:nth-child(1)');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_timeattack_nopb_verified.png') });
    console.log('Saved home_timeattack_nopb_verified.png');

    // 5. Click Survival (Time Limit) Tab
    await page.click('.time-limit-tab');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOT_DIR, 'home_survival_verified.png') });
    console.log('Saved home_survival_verified.png');

    await browser.close();
    console.log('All screenshots captured successfully!');
  } finally {
    shutdownPreview(viteProcess);
  }
}

run().catch((e) => {
  console.error(e);
  shutdownPreview(viteProcess);
  process.exit(1);
});
