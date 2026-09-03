import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';

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

/**
 * 그라디언트 문자열에서 색 정지점을 전부 꺼낸다.
 *
 * getComputedStyle 은 그라디언트를 backgroundImage 로 돌려주고, 그 안의 색은
 * 이미 rgb()/rgba() 로 정규화되어 있다. 정지점이 하나도 안 나오면 빈 배열을
 * 돌려주고, 호출부는 그것을 "검사 실패" 로 다룬다 — 못 읽은 것을 통과로
 * 바꾸지 않기 위해서다.
 */
function gradientStops(backgroundImage) {
  if (!backgroundImage || !backgroundImage.includes('gradient')) return [];
  const matches = backgroundImage.match(/rgba?\([^)]+\)/g) || [];
  return matches.map(parseRgb);
}

/**
 * 배경이 단색이든 그라디언트든 최소 대비를 돌려준다.
 * 그라디언트면 모든 정지점과의 거리 중 **가장 가까운 것**이 기준이다 —
 * 한 지점에서만 글씨가 묻혀도 그 버튼은 읽기 어렵다.
 */
function minContrast(textRgb, styles) {
  const stops = gradientStops(styles.backgroundImage);
  if (stops.length > 0) {
    return Math.min(...stops.map((stop) => colorDistance(textRgb, stop)));
  }
  return colorDistance(textRgb, parseRgb(styles.backgroundColor));
}

function colorDistance(rgb1, rgb2) {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

/**
 * 실제로 수행된 대비 검사 횟수.
 *
 * 이 파일에는 `if (await ...isVisible())` 가드가 여러 겹이라, 버튼이 안 보이면
 * 검사가 조용히 건너뛰어지고 게이트는 통과한다. 요소가 사라진 것과 대비가
 * 멀쩡한 것을 구별할 수 없다는 뜻이다.
 *
 * 그래서 실제 수행 횟수를 세고 마지막에 단언한다. 테마 4개 × 버튼 2종 = 8회가
 * 나와야 한다. 화면이 사라지면 이 수가 줄고 게이트가 실패한다.
 */
let contrastChecksRun = 0;
const EXPECTED_CONTRAST_CHECKS = 8;

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

          // 예전에는 `dist > 30 || backgroundImage.includes('gradient')` 였다.
          // 이 버튼은 항상 그라디언트라 두 번째 항이 늘 참이었고, 대비는 한 번도
          // 검사되지 않았다. 변이 테스트에서 흰 글씨/흰 배경을 넣어도 통과했다.
          const textRgb = parseRgb(styles.color);
          const dist = minContrast(textRgb, styles);
          contrastChecksRun++;

          assert(
            dist > 30,
            `[${themeId}] Active language button text must have strong contrast with every gradient stop. ` +
            `(text: ${styles.color}, bg: ${styles.backgroundColor}, image: ${styles.backgroundImage}, 최소거리: ${dist.toFixed(1)})`
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

            // 언어 버튼과 같은 탈출구가 여기에도 있었다. 그라디언트면 통과였다.
            const textRgb = parseRgb(lv3Styles.color);
            const dist = minContrast(textRgb, lv3Styles);
            contrastChecksRun++;

            assert(
              dist > 30,
              `[${themeId}] Lv.3 leaderboard button must have strong contrast with every gradient stop. ` +
              `(text: ${lv3Styles.color}, bg: ${lv3Styles.backgroundColor}, image: ${lv3Styles.backgroundImage}, 최소거리: ${dist.toFixed(1)})`
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
    // Killing the process tree still left this port listening after a QA run.
    // The port is the thing that actually matters, so check it directly.
    try {
      execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' });
    } catch (e) {
      /* nothing listening — the outcome we wanted */
    }
  }
}

await runVisualContrastTest();

console.log('\n======================================================');
assert(
  contrastChecksRun === EXPECTED_CONTRAST_CHECKS,
  `대비 검사가 ${EXPECTED_CONTRAST_CHECKS}회 수행돼야 하는데 ${contrastChecksRun}회만 돌았다 — ` +
  '버튼을 못 찾아 조용히 건너뛴 것이다. 통과가 아니라 관찰 실패다.'
);
console.log(`  ✅ 대비 검사 ${contrastChecksRun}회 실제 수행됨`);

console.log('🎉 [GATE 15 PASSED] Theme Contrast & Button State 100% Verified!');
console.log('======================================================\n');
