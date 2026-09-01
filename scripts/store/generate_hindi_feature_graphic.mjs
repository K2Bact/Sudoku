import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const outDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/store_assets/hi-IN';
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

async function renderHindiFeatureGraphic() {
  console.log('🚀 Generating Hindi (hi-IN) Feature Graphic (1024x500)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1
  });

  const featureHtml = `
  <!DOCTYPE html>
  <html lang="hi">
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
        padding: 50px 110px;
        font-family: "Nirmala UI", "Noto Sans Devanagari", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
        color: #ffffff;
        position: relative;
        overflow: hidden;
      }
      /* Subtle background glow effect */
      .bg-glow {
        position: absolute;
        width: 400px;
        height: 400px;
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
        font-size: 46px;
        font-weight: 900;
        line-height: 1.25;
        margin-bottom: 14px;
        letter-spacing: -0.5px;
        color: #ffffff;
      }
      h1 span {
        color: #60a5fa;
      }
      .tagline {
        font-size: 22px;
        color: #cbd5e1;
        line-height: 1.5;
        font-weight: 600;
        word-break: keep-all;
      }
      .right {
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
        transform: rotate(-3deg);
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
    <div class="left">
      <div class="pill">☀ SUDOKU</div>
      <h1>सुडोकू<br><span>लॉजिक पहेली</span></h1>
      <p class="tagline">क्लासिक · 32 तकनीकें · ब्रेन IQ और 1v1 मुकाबला</p>
    </div>
    <div class="right">
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
  
  // Save with standard country code prefix
  const targetPath = join(outDir, 'hi-IN_feature_graphic_1024x500.png');
  await page.screenshot({ path: targetPath, type: 'png' });
  console.log(`✅ Generated: ${targetPath}`);

  // Also update legacy un-prefixed name for backward compatibility
  const legacyPath = join(outDir, 'feature_graphic_1024x500.png');
  await page.screenshot({ path: legacyPath, type: 'png' });
  console.log(`✅ Updated: ${legacyPath}`);

  await browser.close();
}

renderHindiFeatureGraphic().catch(err => {
  console.error('❌ Error generating feature graphic:', err);
  process.exit(1);
});
