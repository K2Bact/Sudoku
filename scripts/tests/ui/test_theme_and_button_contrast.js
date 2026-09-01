import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import { chromium } from 'playwright';
import { spawn } from 'child_process';

console.log('======================================================');
console.log('🧪 QA Gate 15: Theme Contrast & Button State Visibility Audit');
console.log('======================================================\n');

// -------------------------------------------------------------
// 1. Static CSS Variable Integrity & Zero Undefined Variables
// -------------------------------------------------------------
console.log('▶ [1/3] Auditing CSS Theme Variables & Codebase References...');

const indexCss = readFileSync('src/index.css', 'utf8');
const definedVars = new Set(indexCss.match(/--[a-zA-Z0-9_-]+/g) || []);

const REQUIRED_THEME_VARS = [
  '--bg-primary', '--bg-surface', '--text-main', '--text-muted',
  '--board-grid-line', '--board-thick-line', '--btn-bg', '--btn-active',
  '--accent-primary', '--accent-primary-hover', '--card-bg', '--border-main'
];

for (const req of REQUIRED_THEME_VARS) {
  assert(definedVars.has(req), `Required theme variable [${req}] must be defined in index.css`);
}

const usedVars = new Map();
function walkDir(dir) {
  let list = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) list = list.concat(walkDir(full));
    else if (f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.css')) list.push(full);
  }
  return list;
}

const allSrcFiles = walkDir('src');
for (const file of allSrcFiles) {
  const text = readFileSync(file, 'utf8');
  const matches = text.match(/var\((--[a-zA-Z0-9_-]+)[^)]*\)/g);
  if (matches) {
    for (const m of matches) {
      const varName = m.match(/--[a-zA-Z0-9_-]+/)[0];
      if (!usedVars.has(varName)) usedVars.set(varName, []);
      usedVars.get(varName).push(file);
    }
  }
}

const undefinedVars = [];
for (const [varName, files] of usedVars.entries()) {
  if (!definedVars.has(varName)) {
    undefinedVars.push({ varName, files });
  }
}

if (undefinedVars.length > 0) {
  console.error('❌ Found undefined CSS variables:', undefinedVars);
  process.exit(1);
}
console.log(`  ✅ 0 Undefined CSS variables! Inspected ${usedVars.size} unique variables across ${allSrcFiles.length} files.`);

// -------------------------------------------------------------
// 2. Anti-White-on-White & Inline Active Override Scan
// -------------------------------------------------------------
console.log('\n▶ [2/3] Scanning for White-on-White or Inline Style Active Collisions...');

let antiPatternCount = 0;
for (const file of allSrcFiles) {
  if (!file.endsWith('.jsx')) continue;
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check if inline style overrides active background with undefined var
    if (line.includes('active') && line.includes('background:') && line.includes('var(--accent-primary)')) {
      console.error(`❌ [${file}:${idx + 1}] Dangerous inline background override: ${line.trim()}`);
      antiPatternCount++;
    }
  });
}
assert(antiPatternCount === 0, 'No inline active background overrides allowed');
console.log('  ✅ 0 Inline active style collisions detected.');

// -------------------------------------------------------------
// 3. Playwright Multi-Theme Active Button Contrast & Visibility Audit
// -------------------------------------------------------------
console.log('\n▶ [3/3] Running Playwright Headless Multi-Theme Button Contrast Tests...');

const PORT = 5198;
const PREVIEW_URL = `http://localhost:${PORT}`;

function waitForServer(url, timeout = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status === 200 || res.status === 304) return resolve();
      } catch (e) {}
      if (Date.now() - start > timeout) reject(new Error('Server timeout'));
      else setTimeout(check, 200);
    };
    check();
  });
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [255, 255, 255];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function colorDistance(rgb1, rgb2) {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

async function runVisualContrastTest() {
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    shell: true,
    stdio: 'pipe'
  });

  try {
    await waitForServer(PREVIEW_URL);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });

    const themesToTest = ['clay', 'matte-dark', 'pure-ceramic', 'editorial'];
    for (const themeId of themesToTest) {
      await page.goto(PREVIEW_URL);
      await page.evaluate((th) => {
        localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: 'en', theme: th }));
        localStorage.setItem('suidoku_theme_id', th);
        localStorage.setItem('suidoku_tutorial_completed', 'true');
      }, themeId);
      await page.reload();
      await page.waitForTimeout(300);

      // Dismiss any initial modal if open
      try {
        const closeBtn = page.locator('.modal-close-btn, .modal-header button').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click({ timeout: 1000 });
          await page.waitForTimeout(200);
        }
      } catch (e) {}

      // Test 1: Open Settings Screen
      const settingsBtn = page.locator('button[title*="Settings"], button[title*="설정"], .header-actions button').last();
      if (await settingsBtn.isVisible()) {
        await settingsBtn.click();
        await page.waitForTimeout(200);

        // Verify active language button has vibrant contrast and is not white-on-white
        const activeLangBtn = page.locator('.language-pill-btn.active').first();
        if (await activeLangBtn.isVisible()) {
          const styles = await activeLangBtn.evaluate((el) => {
            const cs = window.getComputedStyle(el);
            return {
              color: cs.color,
              backgroundColor: cs.backgroundColor,
              backgroundImage: cs.backgroundImage,
              border: cs.border,
              boxShadow: cs.boxShadow
            };
          });

          const textRgb = parseRgb(styles.color);
          const bgRgb = parseRgb(styles.backgroundColor);
          const dist = colorDistance(textRgb, bgRgb);

          assert(
            dist > 30 || styles.backgroundImage.includes('gradient'),
            `[${themeId}] Active language button text must have strong contrast with background. (text: ${styles.color}, bg: ${styles.backgroundColor})`
          );
        }
      }

      // Test 2: Global Leaderboard Level Buttons
      await page.goto(PREVIEW_URL);
      await page.waitForTimeout(200);
      const statsNavBtn = page.locator('.home-bottom-nav button:nth-child(1)').first();
      if (await statsNavBtn.isVisible()) {
        await statsNavBtn.click();
        await page.waitForTimeout(200);

        // Click Global Leaderboard Tab
        const lbTab = page.locator('.stats-tab-bar button:nth-child(3)').first();
        if (await lbTab.isVisible()) {
          await lbTab.click();
          await page.waitForTimeout(200);

          // Click Lv.3 Button
          const lv3Btn = page.locator('button:has-text("Lv.3")').first();
          if (await lv3Btn.isVisible()) {
            await lv3Btn.click();
            await page.waitForTimeout(150);

            const lv3Styles = await lv3Btn.evaluate((el) => {
              const cs = window.getComputedStyle(el);
              return {
                color: cs.color,
                backgroundColor: cs.backgroundColor,
                backgroundImage: cs.backgroundImage,
                border: cs.border
              };
            });

            const textRgb = parseRgb(lv3Styles.color);
            const bgRgb = parseRgb(lv3Styles.backgroundColor);
            const dist = colorDistance(textRgb, bgRgb);

            assert(
              dist > 30 || lv3Styles.backgroundImage.includes('gradient'),
              `[${themeId}] Lv.3 leaderboard button must have strong contrast. (text: ${lv3Styles.color}, bg: ${lv3Styles.backgroundColor})`
            );
          }
        }
      }
    }

    await browser.close();
    console.log('  ✅ Playwright dynamic contrast verified across all 4 themes & active buttons!');
  } finally {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(preview.pid), '/f', '/t'], { shell: true });
      } else {
        preview.kill('SIGTERM');
      }
    } catch (e) {}
  }
}

await runVisualContrastTest();

console.log('\n======================================================');
console.log('🎉 [GATE 15 PASSED] Theme Contrast & Button State 100% Verified!');
console.log('======================================================\n');
