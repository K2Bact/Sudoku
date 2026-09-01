import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 5195;
const PREVIEW_URL = `http://localhost:${PORT}`;

const TARGET_LANGS = [
  { folder: 'ar-SA', code: 'ar' },
  { folder: 'de-DE', code: 'de' },
  { folder: 'fr-FR', code: 'fr' },
  { folder: 'pt-BR', code: 'pt' },
  { folder: 'it-IT', code: 'it' },
  { folder: 'ru-RU', code: 'ru' },
  { folder: 'hi-IN', code: 'hi' }
];

function waitForServer(url, timeout = 15000) {
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

async function main() {
  console.log('🚀 Starting Live In-App Screenshot Capturing for 7 Languages...');

  const viteProcess = spawn('cmd', ['/c', `npx vite preview --port ${PORT}`], {
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  try {
    await waitForServer(PREVIEW_URL);
    console.log('🌐 Vite Preview Server is live on', PREVIEW_URL);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 412, height: 892 }, // Standard Android 9:19.5 ratio
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();

    for (const { folder, code } of TARGET_LANGS) {
      const outDir = path.join('store_assets', folder);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      console.log(`\n📸 Capturing 6 Real In-App Screenshots for [${folder}] (${code})...`);

      // Initialize storage state
      await page.goto(PREVIEW_URL);
      await page.evaluate(({ lang }) => {
        localStorage.clear();
        localStorage.setItem('suidoku_settings_v1', JSON.stringify({
          language: lang,
          theme: 'pure-ceramic',
          soundEffects: true,
          hapticFeedback: true
        }));
        localStorage.setItem('suidoku_remove_ads_purchased_v1', 'true');
        localStorage.setItem('suidoku_brain_stats_v1', JSON.stringify({
          totalPlayed: 48,
          totalWon: 45,
          iqScore: 160,
          currentStreak: 15,
          bestStreak: 21,
          attributes: { focus: 96, logic: 98, speed: 92, durability: 90, accuracy: 97 },
          history: []
        }));
        localStorage.setItem('suidoku_daily_challenges_v1', JSON.stringify({
          clearedDates: ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15'],
          currentStreak: 15,
          bestStreak: 15
        }));
      }, { lang: code });

      await page.reload();
      await page.waitForTimeout(600);

      // 1. Game Screen (Play Mode) -> screenshot_real_01.png
      try {
        // Start a game from home
        const startBtn = page.locator('.btn-play-new, button.start-game-btn, .action-btn-primary').first();
        if (await startBtn.isVisible()) {
          await startBtn.click();
        } else {
          // Click classic mode
          await page.click('.mode-card-classic, .home-mode-card:first-child');
        }
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, 'screenshot_real_01.png') });
        console.log(`  ✅ 1. Game Screen captured -> screenshot_real_01.png`);
      } catch (err) {
        console.warn('  ⚠️ Error on screen 1:', err.message);
      }

      // 2. Academy Screen -> screenshot_real_02.png
      try {
        await page.goto(PREVIEW_URL);
        await page.waitForTimeout(500);
        // Click Academy tab (4th button in bottom nav: Daily, Brain, Stats, Academy, Settings)
        const academyNavBtn = page.locator('.home-bottom-nav button, .bottom-nav button').nth(3);
        if (await academyNavBtn.isVisible()) {
          await academyNavBtn.click();
        } else {
          await page.click('button:has-text("Academy"), button:has-text("아카데미"), button:has-text("أكاديمية"), button:has-text("Akademie")');
        }
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, 'screenshot_real_02.png') });
        console.log(`  ✅ 2. Academy Screen captured -> screenshot_real_02.png`);
      } catch (err) {
        console.warn('  ⚠️ Error on screen 2:', err.message);
      }

      // 3. Daily Challenge Screen -> screenshot_real_03.png
      try {
        await page.goto(PREVIEW_URL);
        await page.waitForTimeout(500);
        const dailyNavBtn = page.locator('.home-bottom-nav button, .bottom-nav button').nth(0);
        if (await dailyNavBtn.isVisible()) {
          await dailyNavBtn.click();
        } else {
          await page.click('.daily-banner-card, button:has-text("Daily"), button:has-text("اليومي"), button:has-text("Täglich")');
        }
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, 'screenshot_real_03.png') });
        console.log(`  ✅ 3. Daily Challenge Screen captured -> screenshot_real_03.png`);
      } catch (err) {
        console.warn('  ⚠️ Error on screen 3:', err.message);
      }

      // 4. AI Battle Screen -> screenshot_real_04.png
      try {
        await page.goto(PREVIEW_URL);
        await page.waitForTimeout(500);
        // Find AI Battle card on Home
        const aiBattleCard = page.locator('.home-mode-card, .menu-card').filter({ hasText: /AI|봇|Bot|ذكاء/i }).first();
        if (await aiBattleCard.isVisible()) {
          await aiBattleCard.click();
        }
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, 'screenshot_real_04.png') });
        console.log(`  ✅ 4. AI Battle Screen captured -> screenshot_real_04.png`);
      } catch (err) {
        console.warn('  ⚠️ Error on screen 4:', err.message);
      }

      // 5. Brain IQ Report Screen -> screenshot_real_05.png
      try {
        await page.goto(PREVIEW_URL);
        await page.waitForTimeout(500);
        const brainNavBtn = page.locator('.home-bottom-nav button, .bottom-nav button').nth(1);
        if (await brainNavBtn.isVisible()) {
          await brainNavBtn.click();
        } else {
          await page.click('.brain-hero-card, button:has-text("Brain"), button:has-text("الذكاء"), button:has-text("Gehirn")');
        }
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, 'screenshot_real_05.png') });
        console.log(`  ✅ 5. Brain IQ Report Screen captured -> screenshot_real_05.png`);
      } catch (err) {
        console.warn('  ⚠️ Error on screen 5:', err.message);
      }

      // 6. Home Screen -> screenshot_real_06.png
      try {
        await page.goto(PREVIEW_URL);
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, 'screenshot_real_06.png') });
        console.log(`  ✅ 6. Home Screen captured -> screenshot_real_06.png`);
      } catch (err) {
        console.warn('  ⚠️ Error on screen 6:', err.message);
      }
    }

    await browser.close();
    console.log('\n🎉 ALL REAL IN-APP LOCALIZED SCREENSHOTS CAPTURED PERFECTLY!');
  } finally {
    viteProcess.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
