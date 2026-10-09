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
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';

const PORT = 5199;
const PREVIEW_URL = `http://localhost:${PORT}`;
const VIEWPORT = { width: 360, height: 800 }; // Strictest compact Android viewport
const LANGUAGES = LOCALES; // 목록을 여기 적지 않는다 — scripts/tests/lib/locales.js 가 앱에서 읽어온다

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


/**
 * process.exit() skips finally, so cleanup has to happen before it. Every exit
 * in this file goes through here.
 *
 * Killing the spawned process is not enough on Windows: it is spawned through a
 * shell wrapper, so the signal stops the wrapper and the vite server underneath
 * keeps the port. The port is what the next run needs back, so free that.
 */
function shutdownPreview(viteProcess) {
  try { viteProcess.kill(); } catch (e) { /* already gone */ }
  try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch (e) { /* nothing listening */ }
}

async function runScanner() {
  console.log('🚀 [UI Scanner] Building fresh Vite production assets...');
  const { execSync } = await import('child_process');
  execSync('npm.cmd run build', { stdio: 'inherit' });

  console.log('🚀 [UI Scanner] Starting Vite Preview Server on port', PORT);
  const viteProcess = spawn('npx.cmd', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
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
        // `expect` is a class only that screen has. Until 2026-09-19 three triggers named
        // elements that did not exist (Daily, AI Battle) or only matched five languages'
        // tooltips (Settings); the click failed silently and the home screen was checked
        // again under the other screen's name.
        { name: 'Home Screen', path: 'home', trigger: null, expect: '.home-screen-container' },
        { name: 'Settings Screen', path: 'settings', trigger: 'button.icon-btn:has(.lucide-settings)', expect: '.settings-screen-container' },
        { name: 'Stats Screen', path: 'stats', trigger: '.home-bottom-nav button:nth-child(1)', expect: '.stats-screen-container' },
        // The achievements are a tab of the stats screen, and every card shows its
        // title beside a tier tag — 40 of them, the longest names in the app (2026-10-08).
        // Each screen starts from Home, so this one takes two taps.
        { name: 'Achievements Tab', path: 'achievements', trigger: ['.home-bottom-nav button:nth-child(1)', '.seg-tab-btn:has(.lucide-trophy)'], expect: '.achievements-view-wrapper' },
        { name: 'Play Analysis Screen', path: 'brain', trigger: '.home-bottom-nav button:nth-child(2)', expect: '.brain-screen-container' },
        { name: 'Academy Screen', path: 'academy', trigger: '.home-bottom-nav button:nth-child(3)', expect: '.academy-tab-bar' },
        { name: 'AI Battle Screen', path: 'aiBattle', trigger: '.ai-card-banner', expect: '.battle-lobby-container' },
        { name: 'Daily Challenge Screen', path: 'daily', trigger: '.daily-card-banner', expect: '.daily-screen-container' }
      ];

      for (const scr of testScreens) {
        if (scr.trigger) {
          try {
            for (const sel of [].concat(scr.trigger)) {
              await page.click(sel, { timeout: 2000 });
              await page.waitForTimeout(400);
            }
          } catch { /* judged below by whether the screen opened */ }
        }
        if (!(await page.$(scr.expect))) {
          totalErrors++;
          errorLog.push({ lang, screen: scr.name, type: 'SCREEN_NOT_OPENED', text: `${scr.trigger} did not open it (${scr.expect} missing)`, className: '' });
          await page.goto(PREVIEW_URL);
          await page.waitForTimeout(300);
          continue;
        }

        // Run in-page DOM inspection
        const { issues, inspected } = await page.evaluate((screenName) => {
          const results = [];
          let inspected = 0;
          // Target all interactive elements, badges, cards, titles
          // Target all interactive elements, badges, cards, titles, and text nodes
          const elements = document.querySelectorAll(
            'button, .mode-tab-btn, .level-chip, .chip-name, .half-banner-card, .half-banner-card h3, .half-banner-card p, h1, h2, h3, h4, p, span, .badge, .card-badge, .daily-banner-content p, .nav-item span'
          );

          elements.forEach((el) => {
            if (!el || el.offsetParent === null) return; // Hidden
            inspected++;

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

          return { issues: results, inspected };
        }, scr.name);

        // The count is what was looked at. It used to be a flat 35 per screen, so the
        // total printed 3,185 whatever happened (external audit V04, 2026-09-12). A
        // screen that shows nothing to inspect was not checked, and is not a pass.
        totalScanned += inspected;
        if (inspected === 0) {
          errorLog.push({ lang, screen: scr.name, type: 'NOTHING_INSPECTED', text: 'no visible element to check', className: '' });
          totalErrors++;
        }
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
    console.log(`- Elements Inspected: ${totalScanned} (visible, counted)`);
    console.log(`- Layout Violations: ${totalErrors}`);
    console.log('======================================================');

    if (totalErrors === 0) {
      console.log('🎉 100% PERFECT! No text overflow, orphan lines, or card bloat detected across all languages!');
      shutdownPreview(viteProcess);
      process.exit(0);
    } else {
      console.error('❌ LAYOUT DEFECTS DETECTED:');
      errorLog.forEach((err, idx) => {
        console.error(`  [#${idx + 1}] Lang: ${err.lang.toUpperCase()} | Screen: ${err.screen} | Type: ${err.type}`);
        console.error(`       Text: "${err.text}" (Class: ${err.className})`);
      });
      shutdownPreview(viteProcess);
      process.exit(1);
    }
  } finally {
    shutdownPreview(viteProcess);
  }
}

// The preview server is shut down by runScanner's own finally. This handler used to
// call shutdownPreview(viteProcess) too, but viteProcess lives inside runScanner, so
// on the failure path it threw a ReferenceError of its own (ESLint no-undef, 2026-10-07).
runScanner().catch((e) => {
  console.error('Scanner error:', e);
  process.exit(1);
});
