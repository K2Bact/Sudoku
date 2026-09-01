import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const outBaseDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/store_assets';

const GRAPHICS_CONFIG = {
  'fr-FR': {
    lang: 'fr',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    title2: 'Casse-tête logique',
    tagline: 'Classique · 32 techniques · Rapport de QI et duel 1v1',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Pretendard", sans-serif'
  },
  'hi-IN': {
    lang: 'hi',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'सुडोकू',
    title2: 'लॉजिक पहेली',
    tagline: 'क्लासिक · 32 तकनीकें · ब्रेन IQ और 1v1 मुकाबला',
    font: '"Nirmala UI", "Noto Sans Devanagari", "Segoe UI", sans-serif'
  },
  'ar-SA': {
    lang: 'ar',
    dir: 'rtl',
    badge: 'SUDOKU ☀',
    title1: 'سودوكو',
    title2: 'لغز المنطق',
    tagline: 'كلاسيكي · 32 تقنية · تقرير معدل الذكاء ومبارزة 1 ضد 1',
    font: '"Segoe UI", "Tahoma", "Noto Sans Arabic", sans-serif'
  },
  'zh-CN': {
    lang: 'zh-CN',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: '数独',
    title2: '经典逻辑谜题',
    tagline: '经典 · 32种解法学院 · 大脑IQ报告与1v1对决',
    font: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
  },
  'zh-TW': {
    lang: 'zh-TW',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: '數獨',
    title2: '經典邏輯謎題',
    tagline: '經典 · 32種解法學院 · 大腦IQ報告與1v1對決',
    font: '"PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif'
  },
  'ko-KR': {
    lang: 'ko',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: '스도쿠',
    title2: '클래식 정통 로직',
    tagline: '클래식 · 32가지 아카데미 · 두뇌 IQ 리포트 & 1v1 배틀',
    font: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  'en-US': {
    lang: 'en',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    title2: 'Classic Logic Puzzle',
    tagline: 'Classic · 32 Academy Techniques · Brain IQ & 1v1 Battle',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  'ja-JP': {
    lang: 'ja',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'ナンプレ Sudoku',
    title2: '正統派ロジックパズル',
    tagline: 'クラシック・32の解法アカデミー・脳IQレポート',
    font: '"Meiryo", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif'
  },
  'de-DE': {
    lang: 'de',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    title2: 'Klassisches Logikspiel',
    tagline: 'Klassik · 32 Techniken · IQ-Bericht und 1v1-Duell',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  'es-ES': {
    lang: 'es',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    title2: 'Puzle de lógica clásico',
    tagline: 'Clásico · 32 técnicas · Informe de IQ y duelo 1v1',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  'pt-BR': {
    lang: 'pt',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    title2: 'Jogo de lógica clássico',
    tagline: 'Clássico · 32 técnicas · Relatório de QI e batalha 1v1',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  'it-IT': {
    lang: 'it',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    title2: 'Rompicapo di logica',
    tagline: 'Classico · 32 tecniche · Report QI e duelli 1v1',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  'ru-RU': {
    lang: 'ru',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Судоку',
    title2: 'Классическая логика',
    tagline: 'Классика · 32 техники · Отчёт IQ и дуэли 1v1',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }
};

async function generateAllGraphics() {
  console.log('🎨 Generating Gold-Standard Feature Graphics across all target locales...');
  const browser = await chromium.launch({ headless: true });

  for (const [folder, cfg] of Object.entries(GRAPHICS_CONFIG)) {
    const targetDir = join(outBaseDir, folder);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const isRtl = cfg.dir === 'rtl';

    const html = `
    <!DOCTYPE html>
    <html lang="${cfg.lang}" dir="${cfg.dir}">
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
          padding: ${isRtl ? '50px 110px 50px 90px' : '50px 110px 50px 90px'};
          font-family: ${cfg.font};
          color: #ffffff;
          position: relative;
          overflow: hidden;
          direction: ${cfg.dir};
          text-align: ${isRtl ? 'right' : 'left'};
        }
        .bg-glow {
          position: absolute;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
          top: -50px;
          ${isRtl ? 'right: 50px;' : 'left: 50px;'}
          pointer-events: none;
        }
        .text-block {
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
          ${isRtl ? 'direction: ltr;' : ''}
        }
        h1 {
          font-size: 48px;
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
          color: #e2e8f0;
          line-height: 1.5;
          font-weight: 600;
          word-break: keep-all;
        }
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
          transform: ${isRtl ? 'rotate(3deg)' : 'rotate(-3deg)'};
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
      
      ${isRtl ? `
        <div class="text-block">
          <div class="pill">${cfg.badge}</div>
          <h1>${cfg.title1}<br><span>${cfg.title2}</span></h1>
          <p class="tagline">${cfg.tagline}</p>
        </div>
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
      ` : `
        <div class="text-block">
          <div class="pill">${cfg.badge}</div>
          <h1>${cfg.title1}<br><span>${cfg.title2}</span></h1>
          <p class="tagline">${cfg.tagline}</p>
        </div>
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
      `}
    </body>
    </html>
    `;

    const page = await browser.newPage({
      viewport: { width: 1024, height: 500 },
      deviceScaleFactor: 1
    });

    await page.setContent(html, { waitUntil: 'load' });

    // 1. Locale-prefixed filename (e.g. fr-FR_feature_graphic_1024x500.png)
    const prefixedName = `${folder}_feature_graphic_1024x500.png`;
    const prefixedPath = join(targetDir, prefixedName);
    await page.screenshot({ path: prefixedPath, type: 'png' });

    // 2. Standard filename (feature_graphic_1024x500.png)
    const standardPath = join(targetDir, 'feature_graphic_1024x500.png');
    await page.screenshot({ path: standardPath, type: 'png' });

    await page.close();
    console.log(`  ✅ [${folder}] Generated: ${prefixedName}`);
  }

  await browser.close();
  console.log('\n🎉 ALL 13 LOCALES FEATURE GRAPHICS GENERATED AT GOLD-STANDARD QUALITY!');
}

generateAllGraphics().catch(err => {
  console.error('❌ Error generating graphics:', err);
  process.exit(1);
});
