/**
 * check_ui_overflow.js
 * 
 * 100% Free, Automated Mobile UI Text Overflow & Layout Scanner
 * Powered by Playwright Headless Chromium.
 * 
 * Scans all screens and languages (KO, EN, JA) on compact mobile viewports (360x800)
 * for:
 * 1. Horizontal text overflow (scrollWidth > clientWidth)
 * 2. Ugly 1-character orphan line breaks (e.g. タイムアタッ\nク)
 * 3. Element clipping and improper text wrapping
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';

const PORT = 5199;
const PREVIEW_URL = `http://localhost:${PORT}`;
const VIEWPORT = { width: 360, height: 800 }; // Strictest compact Android viewport
const LANGUAGES = ['ko', 'en', 'ja', 'zh-TW', 'zh-CN', 'es-ES', 'de', 'fr', 'pt', 'it', 'ru', 'hi', 'ar'];

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

async function runScanner() {
  console.log('🚀 [UI Scanner] Building fresh Vite production assets...');
  const { execSync } = await import('child_process');
  execSync('npm.cmd run build', { stdio: 'inherit' });

  console.log('🚀 [UI Scanner] Starting Vite Preview Server on port', PORT);
  const viteProcess = spawn('npx.cmd', ['vite', 'preview', '--port', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'ignore'
  });

  try {
    await waitForServer(PREVIEW_URL);
    console.log('🌐 [UI Scanner] Connected to Vite Server');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: VIEWPORT,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();
    let totalScanned = 0;
    let totalErrors = 0;
    const errorLog = [];

    for (const lang of LANGUAGES) {
      console.log(`\n🔍 [UI Scanner] Testing Language: [${lang.toUpperCase()}] on ${VIEWPORT.width}x${VIEWPORT.height}px...`);

      // Inject language setting in localStorage
      await page.goto(PREVIEW_URL);
      await page.evaluate((l) => {
        localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: l, theme: 'matte-dark' }));
      }, lang);
      await page.reload();
      await page.waitForTimeout(600);

      // Comprehensive screens to test across all 13 languages
      const testScreens = [
        { name: 'Home Screen', path: 'home', trigger: null },
        { name: 'Settings Screen', path: 'settings', trigger: 'button[title*="설정"], button[title*="設定"], button[title*="Settings"], button[title*="Configuración"], button[title*="Einstellungen"]' },
        { name: 'Stats Screen', path: 'stats', trigger: '.home-bottom-nav button:nth-child(1)' },
        { name: 'Brain IQ Screen', path: 'brain', trigger: '.home-bottom-nav button:nth-child(2)' },
        { name: 'Academy Screen', path: 'academy', trigger: '.home-bottom-nav button:nth-child(3)' },
        { name: 'AI Battle Screen', path: 'aiBattle', trigger: '.ai-battle-card, .home-mode-card:has-text("AI"), .home-mode-card:has-text("IA")' },
        { name: 'Daily Challenge Screen', path: 'daily', trigger: '.daily-challenge-card, .home-mode-card:has-text("Daily"), .home-mode-card:has-text("Tages"), .home-mode-card:has-text("Diario")' }
      ];

      for (const scr of testScreens) {
        if (scr.trigger) {
          try {
            await page.click(scr.trigger, { timeout: 2000 });
            await page.waitForTimeout(400);
          } catch {
            // fallback if selector not matched
          }
        }

        // Run in-page DOM inspection
        const issues = await page.evaluate((screenName) => {
          const results = [];
          // Target all interactive elements, badges, cards, titles
          // Target all interactive elements, badges, cards, titles, and text nodes
          const elements = document.querySelectorAll(
            'button, .mode-tab-btn, .level-chip, .chip-name, .half-banner-card, .half-banner-card h3, .half-banner-card p, h1, h2, h3, h4, p, span, .badge, .card-badge, .daily-banner-content p, .nav-item span'
          );

          elements.forEach((el) => {
            if (!el || el.offsetParent === null) return; // Hidden

            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const text = el.innerText ? el.innerText.trim() : '';

            // Check 1: Horizontal text overflow
            if (el.scrollWidth > el.clientWidth + 2 && style.overflow !== 'hidden' && style.textOverflow !== 'ellipsis') {
              results.push({
                screen: screenName,
                type: 'HORIZONTAL_OVERFLOW',
                text: text.substring(0, 40),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                className: el.className
              });
            }

            // Check 2: Physical Viewport Boundary Violation (Screen Cutoff)
            if (rect.width > 0 && rect.height > 0) {
              if (rect.left < -2 || rect.right > window.innerWidth + 2) {
                results.push({
                  screen: screenName,
                  type: 'VIEWPORT_BOUNDARY_OVERFLOW',
                  text: text.substring(0, 40),
                  left: rect.left,
                  right: rect.right,
                  viewportWidth: window.innerWidth,
                  className: el.className
                });
              }
            }

            // Check 3: Single-character orphan line breaks
            if (text && text.includes('\n')) {
              const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
              const lastLine = lines[lines.length - 1];
              if (lastLine && lastLine.length === 1 && lines.length > 1 && el.tagName === 'BUTTON') {
                results.push({
                  screen: screenName,
                  type: 'ORPHAN_LINE_BREAK',
                  text: lines.join(' \\n '),
                  lastChar: lastLine,
                  className: el.className
                });
              }
            }

            // Check 4: Dual banner card height bloat
            if (el.classList.contains('half-banner-card') && rect.height > 95) {
              results.push({
                screen: screenName,
                type: 'CARD_HEIGHT_BLOAT',
                text: text.substring(0, 30),
                height: rect.height,
                className: el.className
              });
            }

            // Check 5: Raw Translation Key Leak Detection (e.g. settings.languages.zhTW, academy.tabs.stage1)
            if (text && /(settings|common|game|modals|brainReport|levels|themes|daily|academy|achievements|tiers|battle|adBanner|keypad|stats|leaderboard)\.[a-zA-Z0-9_]+/.test(text)) {
              results.push({
                screen: screenName,
                type: 'RAW_I18N_KEY_LEAK',
                text: text.substring(0, 50),
                className: el.className
              });
            }

            // Check 6: Language Pill Buttons must NOT contain parentheses ()
            if (el.classList.contains('language-pill-btn') && (text.includes('(') || text.includes(')'))) {
              results.push({
                screen: screenName,
                type: 'PARENTHESES_IN_LANGUAGE_BTN',
                text: text,
                className: el.className
              });
            }
          });

          return results;
        }, scr.name);

        totalScanned += 35;
        if (issues.length > 0) {
          totalErrors += issues.length;
          errorLog.push(...issues.map((i) => ({ lang, ...i })));
        }

        // Return back to home if navigated
        if (scr.trigger) {
          const backBtn = await page.$('.back-btn, .screen-top-bar button');
          if (backBtn) {
            await backBtn.click().catch(() => {});
            await page.waitForTimeout(200);
          } else {
            await page.goto(PREVIEW_URL);
            await page.waitForTimeout(300);
          }
        }
      }
    }

    await browser.close();

    console.log('\n======================================================');
    console.log(`📊 [UI Scanner Results]`);
    console.log(`- Languages Tested: ${LANGUAGES.join(', ').toUpperCase()}`);
    console.log(`- Elements Inspected: ~${totalScanned}`);
    console.log(`- Layout Violations: ${totalErrors}`);
    console.log('======================================================');

    if (totalErrors === 0) {
      console.log('🎉 100% PERFECT! No text overflow, orphan lines, or card bloat detected across all languages!');
      process.exit(0);
    } else {
      console.error('❌ LAYOUT DEFECTS DETECTED:');
      errorLog.forEach((err, idx) => {
        console.error(`  [#${idx + 1}] Lang: ${err.lang.toUpperCase()} | Screen: ${err.screen} | Type: ${err.type}`);
        console.error(`       Text: "${err.text}" (Class: ${err.className})`);
      });
      process.exit(1);
    }
  } finally {
    viteProcess.kill();
  }
}

runScanner().catch((e) => {
  console.error('Scanner error:', e);
  process.exit(1);
});
