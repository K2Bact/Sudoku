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

// Some variables are measured at runtime and set from JS (text zoom, board fit, banner
// height), each read with a CSS fallback. They count as defined only if some source file
// really sets them — a name that nothing sets is still a typo.
for (const file of allSrcFiles) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/setProperty\(\s*['"`](--[a-zA-Z0-9_-]+)['"`]/g)) definedVars.add(m[1]);
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

// Every theme class a stylesheet names must be one the app sets (D24, 2026-10-21). Four
// dark-theme rules were written for `body.dark-theme`; the theme manager puts
// `theme-<id>` on body, so none of them ever applied — the battle header kept the light
// theme's blue and purple on the dark one. Comments are stripped first: they may name it.
{
  const themeSrc = readFileSync('src/hooks/useThemeManager.js', 'utf8');
  const list = themeSrc.match(/const themes = (\[[^\]]+\])/);
  assert(list, 'could not read the theme list in useThemeManager.js — this check would see nothing');
  const ids = JSON.parse(list[1].replace(/'/g, '"'));
  // 'dark' is the old setting's name: mapped to matte-dark on load, kept beside it in the CSS.
  const allowed = new Set([...ids, 'dark'].map((id) => `theme-${id}`));
  const strays = [];
  for (const file of allSrcFiles.filter((p) => p.endsWith('.css'))) {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/body\.([a-zA-Z0-9_-]+)|\.(dark-theme|light-theme)\b/g)) {
      if (!allowed.has(m[1] || m[2])) strays.push(`${file}: ${m[0]}`);
    }
  }
  assert.deepStrictEqual(strays, [], `stylesheet rules for a body class the app never sets — they never apply (D24): ${strays.join(' · ')}`);
  console.log(`  ✅ Every body class the stylesheets name is one the theme manager sets (${ids.length} themes).`);
}

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
    return Math.min(...stops.map((stop) => contrastRatio(textRgb, stop)));
  }
  return contrastRatio(textRgb, parseRgb(styles.backgroundColor));
}

/**
 * WCAG contrast ratio — relative luminance, (L1 + 0.05) / (L2 + 0.05).
 *
 * This used to be the straight-line RGB distance, passing above 30. The external
 * audit (V06, 2026-09-12) put white on #e6e6e6 through it: distance 43, passed —
 * and 1.25:1, which nobody can read. Distance in RGB is not how eyes see contrast.
 *
 * The line is 3:1 (MIN_CONTRAST): WCAG's level for bold large text and for UI
 * components. It is NOT the 4.5:1 WCAG asks of small text, and these labels are
 * small — 2026-09-30 the blue and purple gradients measure 3.68 and 4.23 at their
 * light end, so the gate says what it can honestly hold (BACKLOG, contrast AA).
 * Measuring it put the stats tab's white on amber at 2.15:1; it is darker now.
 */
const MIN_CONTRAST = 3;
function luminance([r, g, b]) {
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrastRatio(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * 실제로 수행된 대비 검사 횟수.
 *
 * 이 파일에는 `if (await ...isVisible())` 가드가 여러 겹이라, 버튼이 안 보이면
 * 검사가 조용히 건너뛰어지고 게이트는 통과한다. 요소가 사라진 것과 대비가
 * 멀쩡한 것을 구별할 수 없다는 뜻이다.
 *
 * 그래서 실제 수행 횟수를 세고 마지막에 단언한다. 테마 4개 × 버튼 3종 = 12회,
 * 그리고 D24(2026-10-21): 테마 4개 × (힌트 단추 1 + 대전 머리 숫자 2) = 12회,
 * 어두운 테마에서만 힌트 단추가 바탕에서 띄는 정도 1 + 게이지 바탕 1 — 합 26회.
 * 화면이 사라지면 이 수가 줄고 게이트가 실패한다.
 */
let contrastChecksRun = 0;
const EXPECTED_CONTRAST_CHECKS = 26;

/** The colour an element sits on: its nearest ancestor with a mostly opaque background. */
const SURFACE_OF = (el) => {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const bg = getComputedStyle(p).backgroundColor;
    const v = (bg.match(/rgba?\(([^)]+)\)/) || [])[1]?.split(',').map(Number);
    if (v && (v.length < 4 || v[3] > 0.5)) return bg;
  }
  return getComputedStyle(document.body).backgroundColor;
};

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
        localStorage.setItem('suidoku_settings_v1', JSON.stringify({ guidedOffered: { classic: true, killer: true }, language: 'en', theme: th }));
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
            dist >= MIN_CONTRAST,
            `[${themeId}] Active language button text must have strong contrast with every gradient stop. ` +
            `(text: ${styles.color}, bg: ${styles.backgroundColor}, image: ${styles.backgroundImage}, 최소 대비 ${dist.toFixed(2)}:1, 기준 ${MIN_CONTRAST}:1)`
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

        // The stats tab is selected on arrival — white on an amber gradient, which
        // measured 2.15:1 when this check was added (2026-09-30).
        const statsTab = page.locator('.stats-tab-bar .seg-tab-btn.active').first();
        if (await statsTab.isVisible()) {
          const s = await statsTab.evaluate((el) => {
            const cs = window.getComputedStyle(el);
            return { color: cs.color, backgroundColor: cs.backgroundColor, backgroundImage: cs.backgroundImage };
          });
          const d = minContrast(parseRgb(s.color), s);
          contrastChecksRun++;
          assert(d >= MIN_CONTRAST,
            `[${themeId}] Selected stats tab text must reach ${MIN_CONTRAST}:1 against every gradient stop (최소 대비 ${d.toFixed(2)}:1, image: ${s.backgroundImage})`);
        }

        // Open the Achievements tab — its selected button is a gradient
        const lbTab = page.locator('.stats-tab-bar button:nth-child(2)').first();
        if (await lbTab.isVisible()) {
          await lbTab.click();
          await page.waitForTimeout(200);

          // The selected tab button (gradient background). The leaderboard tab this used to open
          // was removed (SudokuDiary ㉖).
          const lv3Btn = page.locator('.stats-tab-bar .seg-tab-btn.active').first();
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
              dist >= MIN_CONTRAST,
              `[${themeId}] Selected stats tab button must have strong contrast with every gradient stop. ` +
              `(text: ${lv3Styles.color}, bg: ${lv3Styles.backgroundColor}, image: ${lv3Styles.backgroundImage}, 최소 대비 ${dist.toFixed(2)}:1, 기준 ${MIN_CONTRAST}:1)`
            );
          }
        }
      }
    }

    // D24 (2026-10-21), on every theme: the hint button and the AI battle header.
    for (const themeId of themesToTest) {
      await page.goto(PREVIEW_URL);
      await page.evaluate((th) => {
        localStorage.clear();
        localStorage.setItem('suidoku_settings_v1', JSON.stringify({ guidedOffered: { classic: true, killer: true }, language: 'en', theme: th, killerRulesSeen: true }));
        localStorage.setItem('suidoku_review_prompted', '1');
      }, themeId);
      await page.reload();
      await page.waitForSelector('.home-screen-container .btn-play-new', { timeout: 8000 });
      for (const b of await page.locator('.modal-card button').all()) await b.click().catch(() => {});

      // The hint button keeps its yellow on every theme. Its text must read at 4.5:1 (small
      // text), and on the dark theme it must stand 3:1 off its surface — the two the dark
      // amber it was meant to have there failed (4.23 and 2.14). On the light themes it is
      // told apart by its hue, so only the text is held there.
      await page.locator('.home-screen-container .btn-play-new').first().click();
      const hint = page.locator('.action-btn.hint-btn').first();
      await hint.waitFor({ state: 'visible', timeout: 8000 });
      const h = await hint.evaluate((el, surfaceOf) => {
        const cs = getComputedStyle(el);
        // eslint-disable-next-line no-new-func
        const surface = new Function(`return (${surfaceOf})`)()(el);
        return { color: cs.color, backgroundColor: cs.backgroundColor, backgroundImage: cs.backgroundImage, surface };
      }, SURFACE_OF.toString());
      const hText = minContrast(parseRgb(h.color), h);
      contrastChecksRun++;
      assert(hText >= 4.5, `[${themeId}] the hint button's text reads ${hText.toFixed(2)}:1 against its gradient — under 4.5:1 (D24; image: ${h.backgroundImage})`);
      if (themeId === 'matte-dark') {
        const stops = gradientStops(h.backgroundImage);
        const off = stops.length ? Math.min(...stops.map((st) => contrastRatio(st, parseRgb(h.surface)))) : 0;
        contrastChecksRun++;
        assert(off >= MIN_CONTRAST, `[matte-dark] the hint button stands ${off.toFixed(2)}:1 off its surface ${h.surface} — under ${MIN_CONTRAST}:1 it is hard to find (D24)`);
      }

      // The AI battle header's two counts, and on the dark theme the gauge's track. These
      // dark-theme colours were written for a class nothing set (D24): on the dark theme the
      // counts read under 3:1 and the track was a black wash on a dark card.
      await page.goto(PREVIEW_URL);
      await page.waitForSelector('.ai-card-banner', { timeout: 8000 });
      await page.locator('.ai-card-banner').click();
      const leave = page.locator('.confirm-overlay .btn-primary');
      if (await leave.count()) await leave.click();
      await page.locator('.btn-battle-action').click();
      await page.waitForSelector('.battle-header-card', { timeout: 8000 });
      for (const side of ['my-box', 'opp-box']) {
        const c = await page.locator(`.${side} .countdown-number-val`).first().evaluate((el, surfaceOf) => {
          // eslint-disable-next-line no-new-func
          const surface = new Function(`return (${surfaceOf})`)()(el);
          return { color: getComputedStyle(el).color, surface };
        }, SURFACE_OF.toString());
        const r = contrastRatio(parseRgb(c.color), parseRgb(c.surface));
        contrastChecksRun++;
        assert(r >= MIN_CONTRAST, `[${themeId}] the battle header's ${side} count ${c.color} reads ${r.toFixed(2)}:1 on ${c.surface} — under ${MIN_CONTRAST}:1 (D24)`);
      }
      if (themeId === 'matte-dark') {
        const g = await page.locator('.countdown-gauge-bar').first().evaluate((el, surfaceOf) => {
          // eslint-disable-next-line no-new-func
          const surface = new Function(`return (${surfaceOf})`)()(el);
          return { track: getComputedStyle(el).backgroundColor, surface };
        }, SURFACE_OF.toString());
        const t = (g.track.match(/rgba?\(([^)]+)\)/) || [])[1]?.split(',').map(Number) || [0, 0, 0, 0];
        const under = parseRgb(g.surface);
        const a = t.length > 3 ? t[3] : 1;
        const shown = [0, 1, 2].map((k) => Math.round(t[k] * a + under[k] * (1 - a)));
        contrastChecksRun++;
        assert(luminance(shown) > luminance(under), `[matte-dark] the battle gauge's track ${g.track} on ${g.surface} is no lighter than the card — it does not show (D24)`);
      }
    }

    await browser.close();
    console.log('  ✅ Playwright dynamic contrast verified across all 4 themes & active buttons, the hint button and the battle header!');
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
