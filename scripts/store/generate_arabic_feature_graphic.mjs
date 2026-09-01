import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const outDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/store_assets/ar-SA';
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

async function renderArabicFeatureGraphic() {
  console.log('🚀 Generating Saudi Arabia Arabic (ar-SA) RTL Feature Graphic (1024x500)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1
  });

  const featureHtml = `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
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
        font-family: "Segoe UI", "Tahoma", "Noto Sans Arabic", -apple-system, BlinkMacSystemFont, sans-serif;
        color: #ffffff;
        position: relative;
        overflow: hidden;
        direction: rtl;
        text-align: right;
      }
      /* Subtle background glow on right */
      .bg-glow {
        position: absolute;
        width: 420px;
        height: 420px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
        top: -50px;
        right: 50px;
        pointer-events: none;
      }
      /* Right Text Block in RTL */
      .text-block {
        max-width: 530px;
        z-index: 2;
        text-align: right;
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
        direction: ltr; /* Keeps badge clean with icon */
      }
      h1 {
        font-size: 48px;
        font-weight: 900;
        line-height: 1.25;
        margin-bottom: 14px;
        letter-spacing: -0.5px;
        color: #ffffff;
        text-align: right;
      }
      h1 span {
        color: #60a5fa;
      }
      .tagline {
        font-size: 22px;
        color: #cbd5e1;
        line-height: 1.5;
        font-weight: 600;
        text-align: right;
        word-break: keep-all;
      }
      /* Left Grid Card in RTL */
      .grid-block {
        z-index: 2;
      }
      .board-card {
        width: 280px;
        height: 280px;
        background: #ffffff;
        border-radius: 36px;
        box-shadow: 0 24px 48px rgba(0,0,0,0.55), 0 0 0 8px rgba(255,255,255,0.12);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 8px;
        padding: 22px;
        transform: rotate(3deg);
        direction: ltr;
      }
      .cell {
        background: #f1f5f9;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: 900;
        color: #1e293b;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .cell.blue {
        background: #2563eb;
        color: #ffffff;
      }
      .cell.gold {
        background: #f59e0b;
        color: #ffffff;
      }
    </style>
  </head>
  <body>
    <div class="bg-glow"></div>
    
    <!-- RTL Layout: Text Block on RIGHT -->
    <div class="text-block">
      <div class="pill">SUDOKU ☀</div>
      <h1>سودوكو<br><span>لغز المنطق</span></h1>
      <p class="tagline">كلاسيكي · 32 تقنية · تقرير معدل الذكاء ومبارزة 1 ضد 1</p>
    </div>

    <!-- RTL Layout: Board Grid on LEFT -->
    <div class="grid-block">
      <div class="board-card">
        <div class="cell blue">5</div>
        <div class="cell">3</div>
        <div class="cell gold">7</div>
        <div class="cell">6</div>
        <div class="cell blue">1</div>
        <div class="cell">9</div>
        <div class="cell gold">8</div>
        <div class="cell">4</div>
        <div class="cell blue">2</div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(featureHtml, { waitUntil: 'load' });
  
  // 1. Save with country code prefix
  const targetPath = join(outDir, 'ar-SA_feature_graphic_1024x500.png');
  await page.screenshot({ path: targetPath, type: 'png' });
  console.log(`✅ Generated: ${targetPath}`);

  // 2. Also update legacy name for backward compatibility
  const legacyPath = join(outDir, 'feature_graphic_1024x500.png');
  await page.screenshot({ path: legacyPath, type: 'png' });
  console.log(`✅ Updated: ${legacyPath}`);

  await browser.close();
}

renderArabicFeatureGraphic().catch(err => {
  console.error('❌ Error generating Arabic feature graphic:', err);
  process.exit(1);
});
