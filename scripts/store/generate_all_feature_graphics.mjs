import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// The app's own store_assets, found from this file rather than written as a drive path:
// the workspace moved on 2026-10-27 (PythonWorkspace/Project_Dev/Suidoku → Workspace/Dev/Sudoku)
// and the old absolute path pointed at a folder that no longer exists.
const outBaseDir = fileURLToPath(new URL('../../store_assets', import.meta.url));

const GRAPHICS_CONFIG = {
  'fr-FR': {
    lang: 'fr',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    // The store title's words (store_description_fr.txt), made for the France launch
    // 2026-10-14. The old tagline sold a "rapport de QI" the app renamed to Logic Score,
    // and "Casse-tête" right under "Sudoku" read like the registered « Casse-tête Sudoku »
    // (INPI 3396139, Diary 126).
    title2: 'Académie de logique',
    tagline: 'Classique et Killer · 32 techniques · duels 1v1 et IA',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Pretendard", sans-serif'
  },
  'hi-IN': {
    lang: 'hi',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'सुडोकू',
    // Same words as the store title and short description (store_description_hi.txt).
    // The old tagline sold a "Brain IQ" the app renamed to Logic Score (BACKLOG STORE-2).
    title2: 'तर्क पहेली अकादमी',
    tagline: '5 कठिनाई स्तर · 32 तकनीकें · 1v1 व AI मुकाबले',
    font: '"Nirmala UI", "Noto Sans Devanagari", "Segoe UI", sans-serif'
  },
  'ar-SA': {
    lang: 'ar',
    dir: 'rtl',
    badge: 'SUDOKU ☀',
    title1: 'سودوكو',
    // Store title and short description words (store_description_ar.txt). The old tagline
    // sold an "IQ report" the app renamed to Logic Score; this one is the Saudi review's
    // proposal (SudokuAITalk AR30-17), made for the Saudi launch 2026-10-07.
    title2: 'أكاديمية المنطق',
    tagline: '5 مستويات · 32 تقنية · مبارزات 1 ضد 1 وضد الذكاء الاصطناعي',
    taglineSize: 19,  // at 22px the last word went to a second line on its own (AGENTS §4.4: one line)
    font: '"Segoe UI", "Tahoma", "Noto Sans Arabic", sans-serif'
  },
  'zh-CN': {
    lang: 'zh-CN',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: '数独',
    // Store title and short description words (store_description_zh-CN.txt), for the Singapore
    // launch 2026-10-15. The old tagline still sold a "大脑IQ报告" the app renamed to Logic Score.
    // The 40 counts the killer academy (8) — upload with the version that has it.
    title2: '逻辑谜题学院',
    tagline: '经典与杀手 · 40 种解题技巧 · 1v1 与 AI 对战',
    font: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
  },
  'zh-TW': {
    lang: 'zh-TW',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: '數獨',
    // Store title and short description words (store_description_zh-TW.txt), for the Taiwan
    // launch 2026-11-06. The old tagline sold a "大腦IQ報告" the app renamed to Logic Score,
    // and counted 32 techniques; the academy has 40 since the killer academy.
    title2: '邏輯謎題學院',
    tagline: '經典與殺手 · 40 種解題技巧 · 1v1 與 AI 對戰',
    font: '"PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif'
  },
  'ko-KR': {
    lang: 'ko',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: '스도쿠',
    // Same words as the store title and short description (store_description_ko.txt).
    // The old tagline sold a "두뇌 IQ 리포트" the app renamed to Logic Score (BACKLOG STORE-2).
    title2: '해법을 배우는 논리 퍼즐',
    title2Size: 44,   // at 48px it ends 20px from the board card
    tagline: '5단계 난이도 · 32가지 해법 · 1v1·AI 대전',
    font: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  'en-US': {
    lang: 'en',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    // The store title's words (store_description_en.txt) — it said "Logic Puzzle Academy" while the
    // title says "Classic Puzzle Academy". Singapore launch 2026-10-15; 40 = 32 + 8 killer, so it
    // goes up with the version that carries the killer academy.
    title2: 'Classic Puzzle Academy',
    title2Size: 42,   // at 48px the title ran into the board card (2026-10-15)
    tagline: 'Classic & Killer · 40 Techniques · 1v1 & AI Duels',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  'ja-JP': {
    lang: 'ja',
    dir: 'ltr',
    // 「数独／SUDOKU」 is Nikoli's registered mark in Japan (classes 9/16/28/41);
    // the Japanese listing uses the generic ナンプレ only (BACKLOG M-1).
    badge: '☀ ナンプレ',
    title1: 'ナンプレ',
    title2: '解法が学べるロジックパズル',
    title2Size: 38,
    // 32 counts solving techniques, not academies (SudokuAITalk JA29-12, 2026-09-29).
    tagline: 'クラシック・32種類の解法・1v1対戦',
    font: '"Meiryo", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif'
  },
  'de-DE': {
    lang: 'de',
    dir: 'ltr',
    badge: '☀ SUDOKU',
    title1: 'Sudoku',
    // Same words as the store title and short description (store_description_de.txt).
    // The old tagline sold an "IQ-Bericht" the app renamed to Logic Score (SudokuAITalk DE29-11).
    title2: 'Logikrätsel-Akademie',
    title2Size: 44,   // at 48px it ends about 25px from the board card, as Korean did at 20px
    tagline: '5 Stufen · 32 Techniken · 1v1- und KI-Duelle',
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
    // The store title's words (store_description_it.txt), for the Italy launch 2026-10-15. The old
    // tagline sold a "Report QI" the app renamed to Logic Score. 40 = 32 + 8 killer — upload with
    // the version that carries the killer academy.
    title2: 'Accademia di logica',
    tagline: 'Classico e Killer · 40 tecniche · duelli 1v1 e con l’IA',
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
  console.log('🎨 Generating feature graphics...');
  const browser = await chromium.launch({ headless: true });
  let made = 0;

  for (const [folder, cfg] of Object.entries(GRAPHICS_CONFIG)) {

    // node generate_all_feature_graphics.mjs ja-JP  → only that locale

    if (process.argv[2] && folder !== process.argv[2]) continue;
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
          /* one line, always (AGENTS §4.4) — a long second title is shrunk per locale instead */
          white-space: nowrap;
          ${cfg.title2Size ? `font-size: ${cfg.title2Size}px;` : ''}
        }
        .tagline {
          font-size: ${cfg.taglineSize || 22}px;
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

    // One file per locale. A second, unprefixed copy used to be written too — the
    // same image under two names, which only made people ask which one to upload.

    await page.close();
    made++;
    console.log(`  ✅ [${folder}] Generated: ${prefixedName}`);
  }

  await browser.close();
  // Count what was made. It used to announce all 13 locales even when one was asked for.
  if (made === 0) throw new Error(`no locale matched "${process.argv[2]}"`);
  console.log(`\n🎉 ${made} feature graphic(s) generated.`);
}

generateAllGraphics().catch(err => {
  console.error('❌ Error generating graphics:', err);
  process.exit(1);
});
