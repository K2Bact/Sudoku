import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const outDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/store_assets/ru-RU';
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

async function renderRussianFeatureGraphic() {
  console.log('🚀 Generating Russian (ru-RU) Feature Graphic (1024x500)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1
  });

  const featureHtml = `
  <!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1024px;
        height: 500px;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 50px 110px 50px 90px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Pretendard", sans-serif;
        color: #ffffff;
        position: relative;
        overflow: hidden;
      }
      /* Subtle background glow effect */
      .bg-glow {
        position: absolute;
        width: 420px;
        height: 420px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
        top: -50px;
        left: 50px;
        pointer-events: none;
      }
      .left {
        max-width: 530px;
        z-index: 2;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(59, 130, 246, 0.2);
        border: 1.5px solid #3b82f6;
        color: #60a5fa;
        padding: 6px 18px;
        border-radius: 20px;
        font-weight: 800;
        font-size: 15px;
        letter-spacing: 0.5px;
        margin-bottom: 16px;
      }
      h1 {
        font-size: 48px;
        font-weight: 900;
        line-height: 1.25;
        margin-bottom: 14px;
        letter-spacing: -0.5px;
      }
      h1 span {
        background: linear-gradient(90deg, #38bdf8 0%, #818cf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .tagline {
        font-size: 16px;
        color: #94a3b8;
        font-weight: 500;
        line-height: 1.5;
        word-break: keep-all;
        white-space: nowrap;
      }
      .right {
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .board-card {
        background: rgba(30, 41, 59, 0.85);
        border: 2px solid rgba(59, 130, 246, 0.4);
        padding: 16px;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.2);
        backdrop-filter: blur(12px);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .cell {
        width: 72px;
        height: 72px;
        background: #0f172a;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: 900;
        color: #e2e8f0;
        box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      }
      .cell.hl {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: #ffffff;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
      }
    </style>
  </head>
  <body>
    <div class="bg-glow"></div>
    <div class="left">
      <div class="pill">☀ SUDOKU</div>
      <h1>Судоку<br><span>Классическая логика</span></h1>
      <p class="tagline">Классика · 32 техники · Отчёт IQ и дуэли 1v1</p>
    </div>
    <div class="right">
      <div class="board-card">
        <div class="grid">
          <div class="cell">5</div>
          <div class="cell hl">3</div>
          <div class="cell">7</div>
          <div class="cell">6</div>
          <div class="cell">1</div>
          <div class="cell">9</div>
          <div class="cell">8</div>
          <div class="cell">4</div>
          <div class="cell hl">2</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(featureHtml);
  const outPath1 = join(outDir, 'ru-RU_feature_graphic_1024x500.png');
  const outPath2 = join(outDir, 'feature_graphic_1024x500.png');

  await page.screenshot({ path: outPath1, type: 'png' });
  await page.screenshot({ path: outPath2, type: 'png' });
  await browser.close();

  console.log(`✅ Generated: ${outPath1}`);
  console.log(`✅ Updated: ${outPath2}`);
}

renderRussianFeatureGraphic().catch(console.error);
