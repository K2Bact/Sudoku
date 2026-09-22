/**
 * capture_device_screenshots.mjs — store screenshots from a real phone.
 *
 *   node scripts/store/capture_device_screenshots.mjs ja ja-JP
 *   → store_assets/ja-JP/ja-JP_screenshot_01.png … 08.png   (1080x1920, 9:16)
 *
 * Needs: a debug build installed and running on a USB-connected phone (the WebView
 * is only inspectable in debug builds), adb from the Android SDK, and Python with
 * Pillow for the crop. Written for the Flip5 (1080x2640, status bar 95px); other
 * phones need STATUS_BAR_PX checked.
 *
 * The app's own settings are switched for the shoot (language, dark theme, ads
 * hidden) and put back afterwards. The phone's system settings are never touched —
 * set the system font to default yourself; screenshots at a large font are not
 * what most players see.
 *
 * Every scene is checked before the shutter, and the check asks what is ON SCREEN:
 * on 2026-09-19 a scene whose check looked at the whole page captured the wrong
 * card and passed (SudokuDiary ⑳).
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const [LANG = 'ja', FOLDER = 'ja-JP', ONLY = ''] = process.argv.slice(2);
const ADB = `${process.env.LOCALAPPDATA}/Android/Sdk/platform-tools/adb.exe`;
const OUT = path.resolve('store_assets', FOLDER);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'shots-'));
const STATUS_BAR_PX = 95;
const env = { ...process.env, MSYS_NO_PATHCONV: '1' };
const adb = (...a) => execFileSync(ADB, a, { env }).toString().trim();

const serial = adb('devices').split('\n').slice(1).map((l) => l.split('\t')).find(([, s]) => s === 'device')?.[0];
if (!serial) throw new Error('no phone connected (adb devices)');
const sh = (...a) => adb('-s', serial, ...a);
const display = sh('shell', 'dumpsys', 'SurfaceFlinger', '--display-id').match(/Display (\d+)/)?.[1];
const pid = sh('shell', 'pidof', 'com.powerneja.suidoku');
if (!pid) throw new Error('the app is not running on the phone');
sh('forward', 'tcp:9222', `localabstract:webview_devtools_remote_${pid}`);

const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const ws = new WebSocket(targets.find((t) => t.type === 'page' && /localhost/.test(t.url)).webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0;
const evaluate = (expression) => new Promise((resolve) => {
  const my = ++id;
  const on = (m) => { const msg = JSON.parse(m.data); if (msg.id === my) { ws.removeEventListener('message', on); resolve(msg.result?.result?.value); } };
  ws.addEventListener('message', on);
  ws.send(JSON.stringify({ id: my, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } }));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (sel, i = 0) => `(()=>{const e=document.querySelectorAll(${JSON.stringify(sel)})[${i}]; if(!e) return false; e.click(); return true;})()`;
const onScreen = (sel) => `(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return false; const r=e.getBoundingClientRect(); return r.top>=0 && r.top<innerHeight*0.6;})()`;
// A strategy card by its technique id, not its translated title: /XY/ matched
// 「Y-Wing (XY-ウィング)」 before XY-Chains in Japanese and the shot went to the wrong card.
const card = (id) => `document.querySelector('[data-theory-board="${id}"]')?.closest('.strategy-item-card')`;

// Scenes are chosen by structure, not by translated text, so they work in any language.
const SCENES = [
  ['01_home', [], onScreen('.home-screen-container .btn-play-new')],
  ['02_game', [click('.home-screen-container .btn-play-new')], `document.querySelectorAll('.sudoku-cell').length===81`],
  ['03_academy_theory', [click('.home-bottom-nav .nav-item', 2), click('.academy-tab-bar .seg-tab-btn', 2),
    click('.strategy-item-card .theory-board-diagram .cross-tab-btn', 1),
    `(async()=>{for(let i=0;i<5;i++){const c=document.querySelector('.strategy-item-card'); c.scrollIntoView({block:'start', behavior:'instant'}); await new Promise(r=>setTimeout(r,400)); const t=c.getBoundingClientRect().top; if(t>=-2&&t<innerHeight*0.3) return true;} return false;})()`],
  onScreen('.strategy-item-card [data-theory-board="x-wing"]')],
  ['04_academy_practice', [click('.home-bottom-nav .nav-item', 2), click('.academy-tab-bar .seg-tab-btn', 3),
    // Remember the card's position: switching to the practice tab removes the theory
    // board this found it by, and React may replace the element itself.
    `(()=>{const c=${card('xy-chains')}; if(!c) return false; window.__shotIdx=[...document.querySelectorAll('.strategy-item-card')].indexOf(c); c.querySelectorAll('.practice-tab-btn')[1].click(); return true;})()`,
    `(async()=>{for(let i=0;i<5;i++){const c=document.querySelectorAll('.strategy-item-card')[window.__shotIdx]; const p=c&&c.querySelector('.interactive-practice-card'); if(!p) return false; p.scrollIntoView({block:'start', behavior:'instant'}); await new Promise(r=>setTimeout(r,400)); const t=p.getBoundingClientRect().top; if(t>=-2&&t<innerHeight*0.3) return true;} return false;})()`],
  `(()=>{const c=document.querySelectorAll('.strategy-item-card')[window.__shotIdx]; const g=c&&c.querySelector('.practice-guide-box'); if(!g) return false; const r=g.getBoundingClientRect(); return r.top>=0 && r.top<innerHeight*0.6;})()`],
  ['05_ai_battle', [`(()=>{const e=[...document.querySelectorAll('.home-screen-container *')].find(x=>/^\\s*VS AI/.test(x.textContent)); if(!e) return false; e.click(); return true;})()`],
    `!document.querySelector('.home-screen-container')`],
  ['06_daily', [click('.daily-card-banner')], `!document.querySelector('.home-screen-container')`],
  ['07_achievements', [click('.home-bottom-nav .nav-item', 0), `(()=>{const b=document.querySelectorAll('.home-bottom-nav ~ * button, button'); const t=[...b].filter(x=>x.offsetParent)[2]; if(!t) return false; t.click(); return true;})()`],
    `!document.querySelector('.home-screen-container')`],
  ['08_play_analysis', [click('.home-bottom-nav .nav-item', 1)], `!document.querySelector('.home-screen-container')`],
];

const saved = await evaluate(`(()=>{const s=localStorage.getItem('suidoku_settings_v1'); const r=localStorage.getItem('suidoku_remove_ads_purchased_v1'); const n=JSON.parse(s||'{}'); n.language=${JSON.stringify(LANG)}; n.theme='matte-dark'; localStorage.setItem('suidoku_settings_v1', JSON.stringify(n)); localStorage.setItem('suidoku_remove_ads_purchased_v1','true'); return {s, r};})()`);
try {
  for (const [name, steps, check] of SCENES) {
    if (ONLY && !ONLY.split(',').some((o) => name.startsWith(o))) continue;
    // The browser restores the previous scene's scroll on reload, and that restore
    // raced the scroll below — scene 04 failed only when run after scene 03.
    await evaluate(`history.scrollRestoration='manual'; window.scrollTo(0,0); location.reload()`);
    await sleep(3500);
    for (const st of steps) {
      if ((await evaluate(st)) === false) throw new Error(`${name}: step failed`);
      await sleep(900);
      if (process.env.SHOT_DEBUG) console.log('  after step:', await evaluate(`JSON.stringify({y:Math.round(scrollY), idx:window.__shotIdx, screen:!!document.querySelector('.home-screen-container')})`));
    }
    await sleep(900);
    if ((await evaluate(`(()=>{try{return !!(${check});}catch(e){return false}})()`)) !== true) {
      const why = await evaluate(`JSON.stringify({lang:document.documentElement.lang, y:scrollY, guides:[...document.querySelectorAll('.practice-guide-box')].map(g=>Math.round(g.getBoundingClientRect().top)), vh:innerHeight})`);
      throw new Error(`${name}: scene check failed ${why}`);
    }
    sh('shell', 'screencap', '-d', display, '-p', '/sdcard/shot.png');
    sh('pull', '/sdcard/shot.png', path.join(TMP, `${name}.png`));
    console.log('shot', name);
  }
} finally {
  // put the app's own settings back the way they were
  await evaluate(`(()=>{const o=${JSON.stringify(saved || {})}; if(o.s===null||o.s===undefined) localStorage.removeItem('suidoku_settings_v1'); else localStorage.setItem('suidoku_settings_v1', o.s); if(o.r===null||o.r===undefined) localStorage.removeItem('suidoku_remove_ads_purchased_v1'); else localStorage.setItem('suidoku_remove_ads_purchased_v1', o.r); location.reload(); return true;})()`);
  ws.close();
}

execFileSync('python', ['-c', `
from PIL import Image
import glob, os
for f in sorted(glob.glob(os.path.join(r'${TMP}', '*.png'))):
    n = os.path.basename(f)[:2]
    im = Image.open(f).convert('RGB').crop((0, ${STATUS_BAR_PX}, 1080, ${STATUS_BAR_PX} + 1920))
    assert im.size == (1080, 1920)
    im.save(os.path.join(r'${OUT}', '${FOLDER}_screenshot_' + n + '.png'), optimize=True)
`]);
console.log(`saved ${fs.readdirSync(TMP).length} screenshots to ${OUT}`);
