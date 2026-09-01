/**
 * capture_screenshots_ja.js
 * Captures 6 in-app screenshots in Japanese mode for store listing.
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';

const PORT = 5198;
const PREVIEW_URL = `http://localhost:${PORT}`;
const OUT_DIR = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/store_assets/ja-JP';

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

async function capture() {
  const viteProcess = spawn('cmd', ['/c', `npx vite preview --port ${PORT}`], {
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  try {
    await waitForServer(PREVIEW_URL);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 412, height: 892 }, // Standard flagship Android resolution ratio
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();

    // 1. Home Screen (Japanese, Ad-Free for Store Listing)
    await page.goto(PREVIEW_URL);
    await page.evaluate(() => {
      localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'ja', theme: 'matte-dark' }));
      localStorage.setItem('suidoku_remove_ads_purchased_v1', 'true');
    });
    await page.reload();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'ja-JP_screenshot_real_01.png') });
    console.log('📸 1. Home screen captured');

    // 2. Game Screen (Japanese)
    await page.click('.btn-play-new');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'ja-JP_screenshot_real_02.png') });
    console.log('📸 2. Game screen captured');

    // 3. Academy Screen (Japanese)
    await page.goto(PREVIEW_URL);
    await page.waitForTimeout(400);
    await page.click('.home-bottom-nav button:nth-child(3)');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'ja-JP_screenshot_real_03.png') });
    console.log('📸 3. Academy screen captured');

    // 4. Brain IQ Screen (Japanese)
    await page.goto(PREVIEW_URL);
    await page.waitForTimeout(400);
    await page.click('.home-bottom-nav button:nth-child(2)');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'ja-JP_screenshot_real_04.png') });
    console.log('📸 4. Brain IQ screen captured');

    // 5. Daily Challenge Screen (Japanese)
    await page.goto(PREVIEW_URL);
    await page.waitForTimeout(400);
    await page.click('.daily-card-banner');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'ja-JP_screenshot_real_05.png') });
    console.log('📸 5. Daily Challenge screen captured');

    // 6. Stats & Achievements Screen (Japanese)
    await page.goto(PREVIEW_URL);
    await page.waitForTimeout(400);
    await page.click('.home-bottom-nav button:nth-child(1)');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'ja-JP_screenshot_real_06.png') });
    console.log('📸 6. Stats screen captured');

    await browser.close();
    console.log('🎉 All 6 Japanese screenshots saved to:', OUT_DIR);
  } finally {
    viteProcess.kill();
  }
}

capture().catch(console.error);
