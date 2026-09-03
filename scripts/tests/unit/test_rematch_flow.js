/**
 * test_rematch_flow.js
 * Multi-client real-time 1v1 matchmaking & top rematch notification e2e test.
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';

const PORT = 5203;
const PREVIEW_URL = `http://localhost:${PORT}`;

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

async function run() {
  console.log('🚀 Starting Vite preview server...');
  const vite = spawn('cmd', ['/c', `npx vite preview --port ${PORT} --strictPort`], {
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  const browser = await chromium.launch({ headless: true });

  try {
    await waitForServer(PREVIEW_URL);
    console.log('🌐 Connected to preview server');

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

    // Tab 1: Player A
    const pageA = await context.newPage();
    await pageA.goto(PREVIEW_URL);
    await pageA.evaluate(() => {
      localStorage.setItem('suidoku_player_id', 'player_alpha_99');
      localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'ko' }));
    });
    await pageA.reload();
    await pageA.waitForSelector('.battle-card-banner');

    // Tab 2: Player B
    const pageB = await context.newPage();
    await pageB.goto(PREVIEW_URL);
    await pageB.evaluate(() => {
      localStorage.setItem('suidoku_player_id', 'player_beta_88');
      localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'ko' }));
    });
    await pageB.reload();
    await pageB.waitForSelector('.battle-card-banner');

    console.log('🎮 1. Player A enters 1v1 Battle Lobby and searches for opponent...');
    await pageA.click('.battle-card-banner');
    await pageA.waitForSelector('.primary-battle-card button');
    await pageA.click('.primary-battle-card button');

    await pageA.waitForTimeout(300);

    console.log('🎮 2. Player B enters 1v1 Battle Lobby and searches for opponent...');
    await pageB.click('.battle-card-banner');
    await pageB.waitForSelector('.primary-battle-card button');
    await pageB.click('.primary-battle-card button');

    await pageA.waitForSelector('.game-screen-wrapper', { timeout: 5000 });
    await pageB.waitForSelector('.game-screen-wrapper', { timeout: 5000 });
    console.log('✅ Real Match Paired! Both Player A & B are actively in 1v1 Game!');

    // Player A wins
    console.log('🏆 3. Player A completes puzzle (100%)...');
    await pageA.evaluate(() => {
      if (window.suidokuBattle) {
        window.suidokuBattle.sendProgress({ 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 }, 0);
      }
    });

    await pageA.waitForSelector('.battle-result-card', { timeout: 5000 });
    await pageB.waitForSelector('.battle-result-card', { timeout: 5000 });
    console.log('✅ Battle Result modal displayed on both screens!');

    // Player A requests Rematch
    console.log('⚔️ 4. Player A clicks [재대결 신청]...');
    await pageA.click('.battle-result-card button.btn-primary');

    await pageB.waitForSelector('.rematch-toast-wrapper', { timeout: 5000 });
    console.log('🚨 5. Player B received Top Rematch Notification Toast banner!');

    // Player B accepts Rematch
    console.log('🤝 6. Player B clicks [수락] on Rematch Toast...');
    await pageB.click('.rematch-btn-accept');

    await pageA.waitForSelector('.game-screen-wrapper', { timeout: 5000 });
    await pageB.waitForSelector('.game-screen-wrapper', { timeout: 5000 });
    console.log('🎉 7. Both Players simultaneously started New Rematch Battle with a fresh puzzle!');

    console.log('======================================================');
    console.log('🏆 100% PERFECT! Real 1v1 Matchmaking & Rematch Flow Verified!');
    console.log('======================================================');
  } finally {
    vite.kill();
    // vite.kill() stops the cmd wrapper, not the vite process under it, so the
    // port stays listening. Leaked servers pile up across QA runs until a later
    // gate cannot start its own. The port is the thing that has to come back.
    try {
      execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' });
    } catch (e) {
      /* nothing listening — the outcome we wanted */
    }
    await browser.close();
  }
}

/*
 * 실패는 반드시 종료코드로 나가야 한다.
 *
 * 여기는 원래 run().catch(console.error) 였다. 어떤 단계가 실패하든 — 매칭이
 * 안 붙든, 재대결 토스트가 안 뜨든 — 에러를 출력만 하고 프로세스는 0으로 끝났다.
 * run_all_qa 의 execSync 는 0 을 성공으로 읽으므로 이 게이트는 언제나
 * "✅ PASSED" 였다. 실패할 수 없는 게이트는, 제대로 도는 게이트와 똑같은
 * 목소리로 성공을 보고한다.
 *
 * 셀렉터를 없는 것으로 바꿔 실제로 확인했다: 타임아웃이 나고도 종료코드 0.
 */
run().catch((err) => {
  console.error("❌ 1v1 매칭·재대결 흐름 실패:", err);
  process.exit(1);
});
