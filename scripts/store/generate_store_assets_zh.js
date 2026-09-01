/**
 * generate_store_assets_zh.js
 * Generates Traditional Chinese (zh-TW) Feature Graphic (1024x500) and Store Screenshots.
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 5197;
const PREVIEW_URL = `http://localhost:${PORT}`;
const OUT_DIR = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/store_assets/zh-TW';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

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
  const browser = await chromium.launch({ headless: true });

  // 1. Generate 1024x500 Feature Graphic
  console.log('🎨 Generating Traditional Chinese Feature Graphic (1024x500)...');
  const pageGraphic = await browser.newPage({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1
  });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Noto+Sans+TC:wght@700;900&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1024px;
        height: 500px;
        background: linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%);
        font-family: 'Plus Jakarta Sans', 'Noto Sans TC', sans-serif;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 45px 65px;
        position: relative;
        overflow: hidden;
      }
      .bg-glow-1 {
        position: absolute;
        width: 450px;
        height: 450px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(0,0,0,0) 70%);
        top: -100px;
        right: 80px;
        border-radius: 50%;
      }
      .bg-glow-2 {
        position: absolute;
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(0,0,0,0) 70%);
        bottom: -80px;
        left: 20px;
        border-radius: 50%;
      }
      .left-col {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 530px;
        z-index: 2;
      }
      .tag-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background: rgba(59, 130, 246, 0.18);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        color: #93c5fd;
        letter-spacing: 1px;
        text-transform: uppercase;
        width: fit-content;
      }
      .title-hero {
        font-size: 42px;
        font-weight: 900;
        line-height: 1.15;
        letter-spacing: -0.5px;
        background: linear-gradient(135deg, #ffffff 30%, #bfdbfe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .title-sub {
        font-size: 22px;
        font-weight: 800;
        color: #f59e0b;
        margin-top: -6px;
      }
      .desc-text {
        font-size: 14.5px;
        color: #94a3b8;
        line-height: 1.5;
        font-weight: 600;
      }
      .badges-row {
        display: flex;
        gap: 8px;
        margin-top: 6px;
      }
      .feature-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        font-size: 11.5px;
        font-weight: 700;
        color: #e2e8f0;
      }
      .right-col {
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .board-3d-card {
        width: 310px;
        height: 310px;
        background: #1e293b;
        border-radius: 28px;
        padding: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.12);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        transform: rotate(3deg) perspective(600px) rotateY(-8deg);
      }
      .cell-3d {
        background: #334155;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: 900;
        color: #ffffff;
        box-shadow: 0 4px 0 #1e293b, 0 8px 16px rgba(0, 0, 0, 0.3);
      }
      .cell-3d.highlight {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        box-shadow: 0 4px 0 #1d4ed8, 0 8px 20px rgba(37, 99, 235, 0.4);
      }
      .cell-3d.accent {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        box-shadow: 0 4px 0 #b45309, 0 8px 20px rgba(245, 158, 11, 0.4);
      }
    </style>
  </head>
  <body>
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    <div class="left-col">
      <div class="tag-pill">✨ PREMIUM LOGIC PUZZLE</div>
      <h1 class="title-hero">數獨 (Sudoku)</h1>
      <div class="title-sub">經典邏輯 ＆ 1v1即時對決</div>
      <p class="desc-text">32種實戰解法學院 · 5段正統難度 · 30種全球成就 · Google Play Games連線</p>
      <div class="badges-row">
        <div class="feature-badge">🎯 5段正統難度</div>
        <div class="feature-badge">🏆 30種成就</div>
        <div class="feature-badge">📅 每日挑戰</div>
      </div>
    </div>
    <div class="right-col">
      <div class="board-3d-card">
        <div class="cell-3d">5</div>
        <div class="cell-3d highlight">3</div>
        <div class="cell-3d">8</div>
        <div class="cell-3d">6</div>
        <div class="cell-3d accent">9</div>
        <div class="cell-3d">1</div>
        <div class="cell-3d highlight">2</div>
        <div class="cell-3d">7</div>
        <div class="cell-3d">4</div>
      </div>
    </div>
  </body>
  </html>
  `;

  await pageGraphic.setContent(htmlContent);
  await pageGraphic.screenshot({ path: path.join(OUT_DIR, 'feature_graphic_1024x500.png') });
  console.log('✅ Traditional Chinese Feature Graphic created:', path.join(OUT_DIR, 'feature_graphic_1024x500.png'));
  await pageGraphic.close();

  // 2. Start Vite server and capture screenshots
  console.log('📸 Capturing Traditional Chinese In-Game Screenshots...');
  const viteProcess = spawn('cmd', ['/c', `npx vite preview --port ${PORT}`], {
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  try {
    await waitForServer(PREVIEW_URL);
    const context = await browser.newContext({
      viewport: { width: 412, height: 892 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();

    // 1. Home Screen
    await page.goto(PREVIEW_URL);
    await page.evaluate(() => {
      localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'zh-TW', theme: 'matte-dark' }));
      localStorage.setItem('suidoku_remove_ads_purchased_v1', 'true');
    });
    await page.reload();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'zh-TW_screenshot_real_01.png') });
    console.log('📸 1. Home screen captured');

    // 2. Game Screen
    await page.click('.btn-play-new');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'zh-TW_screenshot_real_02.png') });
    console.log('📸 2. Game screen captured');

    // 3. Academy Screen
    await page.goto(PREVIEW_URL);
    await page.waitForTimeout(400);
    await page.click('.home-bottom-nav button:nth-child(3)');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'zh-TW_screenshot_real_03.png') });
    console.log('📸 3. Academy screen captured');

    // 4. Brain IQ Screen
    await page.goto(PREVIEW_URL);
    await page.waitForTimeout(400);
    await page.click('.home-bottom-nav button:nth-child(2)');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'zh-TW_screenshot_real_04.png') });
    console.log('📸 4. Brain IQ screen captured');

    // 5. Daily Challenge Screen
    await page.goto(PREVIEW_URL);
    await page.waitForTimeout(400);
    await page.click('.daily-card-banner');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'zh-TW_screenshot_real_05.png') });
    console.log('📸 5. Daily Challenge screen captured');

    // 6. Stats & Achievements Screen
    await page.goto(PREVIEW_URL);
    await page.waitForTimeout(400);
    await page.click('.home-bottom-nav button:nth-child(1)');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'zh-TW_screenshot_real_06.png') });
    console.log('📸 6. Stats screen captured');

    console.log('🎉 All Traditional Chinese assets generated in:', OUT_DIR);
  } finally {
    viteProcess.kill();
    await browser.close();
  }
}

run().catch(console.error);
