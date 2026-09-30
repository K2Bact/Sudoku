/**
 * capture_device_screenshots.mjs — store screenshots from a real phone.
 *
 *   node scripts/store/capture_device_screenshots.mjs ja ja-JP
 *   → store_assets/ja-JP/ja-JP_screenshot_01.png … 08.png   (1080x1920, 9:16)
 *
 *   node scripts/store/capture_device_screenshots.mjs ko ko-KR "" tablet
 *   → store_assets/ko-KR/tablet/ko-KR_tablet_screenshot_01.png … 08.png
 *
 * Needs: a debug build installed and running on a USB-connected device (the
 * WebView is only inspectable in debug builds), adb from the Android SDK, and
 * Python with Pillow for the crop.
 *
 * The BARS are measured, not assumed. This used to crop a fixed 95px off the top
 * because that is the Flip5's status bar; on any other device that either left a
 * strip of the bar in the picture or ate the top of the app. The app's own
 * WebView bounds say where the usable area starts and ends, and uiautomator
 * reports them, so the same script works on a tablet — or on the emulator
 * widened into one, which is where the tablet shots come from (no tablet here).
 *
 * The phone crop's 1080x1920 is still an assumption — the store listing's shape,
 * which happens to be the Flip5's screen. It is asserted rather than trusted;
 * see the crop below.
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

const [LANG = 'ja', FOLDER = 'ja-JP', ONLY = '', MODE = 'phone'] = process.argv.slice(2);
const TABLET = MODE === 'tablet';
const ADB = `${process.env.LOCALAPPDATA}/Android/Sdk/platform-tools/adb.exe`;
const OUT = path.resolve('store_assets', FOLDER, ...(TABLET ? ['tablet'] : []));
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'shots-'));
// Filled in from the device once the app is up; see measureUsableArea().
let CROP = null;
const env = { ...process.env, MSYS_NO_PATHCONV: '1' };
const adb = (...a) => execFileSync(ADB, a, { env }).toString().trim();

// ANDROID_SERIAL picks the device when more than one is attached — the phone and
// the emulator standing in for a tablet are usually both plugged in here.
const attached = adb('devices').split(String.fromCharCode(10)).slice(1).map((l) => l.split(String.fromCharCode(9)))
  .filter(([, st]) => st === 'device').map(([d]) => d);
const serial = process.env.ANDROID_SERIAL || attached[0];
if (!serial) throw new Error('no device connected (adb devices)');
if (!process.env.ANDROID_SERIAL && attached.length > 1) {
  throw new Error(`${attached.length} devices attached (${attached.join(', ')}) — set ANDROID_SERIAL to choose one`);
}
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
  // The home screen only has to BE the home screen, with its main button fully in
  // view. onScreen() below asks for the top 60% of the window, which is right for
  // a card that was scrolled to, and wrong here: on a tablet lying down the home
  // content is centred vertically, and the button landed at 607px of a 1011px
  // window — 0.4px past the line (2026-09-24).
  ['01_home', [], `(()=>{const b=document.querySelector('.home-screen-container .btn-play-new'); if(!b) return false;
    const r=b.getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight;})()`],
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
  // By the card's class. This used to look for the text "VS AI", which worked only because the badge
  // was English in every language; it became GEGEN KI in German on 2026-09-30 and the shoot stopped here.
  ['05_ai_battle', [click('.home-screen-container .ai-card-banner')],
    `!document.querySelector('.home-screen-container')`],
  ['06_daily', [click('.daily-card-banner')], `!document.querySelector('.home-screen-container')`],
  ['07_achievements', [click('.home-bottom-nav .nav-item', 0), `(()=>{const b=document.querySelectorAll('.home-bottom-nav ~ * button, button'); const t=[...b].filter(x=>x.offsetParent)[2]; if(!t) return false; t.click(); return true;})()`],
    `!document.querySelector('.home-screen-container')`],
  ['08_play_analysis', [click('.home-bottom-nav .nav-item', 1)], `!document.querySelector('.home-screen-container')`],
];

/**
 * Where the app actually is on the screen: the app's WebView, as uiautomator
 * reports it. Its top is the bottom of the status bar and its bottom is the top
 * of the navigation bar, which is exactly what a store screenshot should show.
 */
function measureUsableArea() {
  sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml');
  const xml = sh('shell', 'cat', '/sdcard/ui.xml');
  const views = [...xml.matchAll(/class="android\.webkit\.WebView"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)]
    .map((m) => ({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] }))
    .sort((a, b) => (b.y2 - b.y1) - (a.y2 - a.y1));
  const app = views[0];
  if (!app) throw new Error('could not find the app WebView — is the app on screen?');
  // Only the vertical bounds are taken from here. The width comes from the
  // screenshot itself: `wm size` prints both a physical and an override line,
  // and reading the wrong one cropped a tablet shot to 1080px of its top-left
  // corner (2026-09-24). The picture cannot disagree with itself.
  return { top: app.y1, bottom: app.y2 };
}

/**
 * Refuse to shoot in the wrong orientation.
 *
 * Tablet store shots are landscape, and the device does not always agree. Twice
 * now the emulator came back upright after an install — `settings put system
 * user_rotation 1` leaves mCurrentRotation at 0 and only `wm user-rotation lock`
 * actually turns it — and both times the script took eight portrait pictures,
 * named them tablet shots and reported success. Nothing in the crop could tell:
 * a portrait frame is a perfectly ordinary rectangle.
 *
 * So the shape is stated up front, checked against one throwaway screencap, and
 * the failure carries the command that fixes it. Before any scene is captured,
 * because eight wrong pictures are worse than none.
 */
function requireOrientation() {
  const want = TABLET ? 'land' : 'port';
  const probe = path.join(TMP, '__orient.png');
  // The display id, as the real captures below pass it. Without it a phone with two
  // screens (the Flip's cover display) prints "[Warning] Multiple displays were found…"
  // to stdout ahead of the PNG, and this file stops being an image. The probe was
  // added on the emulator, which has one display, so it never met a Flip (2026-09-29).
  fs.writeFileSync(probe, execFileSync(ADB, ['-s', serial, 'exec-out', 'screencap', ...(display ? ['-d', display] : []), '-p'], { env, maxBuffer: 64 * 1024 * 1024 }));
  const dims = execFileSync('python', ['-c',
    `from PIL import Image; im = Image.open(r'${probe}'); print(im.size[0], im.size[1])`]).toString().trim().split(/\s+/).map(Number);
  fs.unlinkSync(probe);
  const [w, h] = dims;
  const got = w > h ? 'land' : 'port';
  if (got !== want) {
    throw new Error(
      `the device is ${got} (${w}x${h}) but ${TABLET ? 'tablet' : 'phone'} shots must be ${want}.
` +
      `  adb -s ${serial} shell wm user-rotation lock ${want === 'land' ? 1 : 0}
` +
      '  (settings put system user_rotation is not enough — it leaves mCurrentRotation at 0)');
  }
  console.log(`device is ${got} ${w}x${h}, as ${TABLET ? 'tablet' : 'phone'} shots require`);
}

// A game left in progress is put aside for the shoot too. Since quitting counts as a
// loss (2026-09-19), "new game" over a saved game asks first — the dialog stopped scene
// 02 on 2026-09-29 — and answering it would record a loss on the phone to take a picture.
const saved = await evaluate(`(()=>{const s=localStorage.getItem('suidoku_settings_v1'); const r=localStorage.getItem('suidoku_remove_ads_purchased_v1'); const g=localStorage.getItem('suidoku_game_state_v1'); const n=JSON.parse(s||'{}'); n.language=${JSON.stringify(LANG)}; n.theme='matte-dark'; localStorage.setItem('suidoku_settings_v1', JSON.stringify(n)); localStorage.setItem('suidoku_remove_ads_purchased_v1','true'); localStorage.removeItem('suidoku_game_state_v1'); return {s, r, g};})()`);
try {
  requireOrientation();
  CROP = measureUsableArea();
  console.log(`usable area: y ${CROP.top}..${CROP.bottom} (the width comes from each screenshot)`);

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
  await evaluate(`(()=>{const o=${JSON.stringify(saved || {})}; if(o.s===null||o.s===undefined) localStorage.removeItem('suidoku_settings_v1'); else localStorage.setItem('suidoku_settings_v1', o.s); if(o.r===null||o.r===undefined) localStorage.removeItem('suidoku_remove_ads_purchased_v1'); else localStorage.setItem('suidoku_remove_ads_purchased_v1', o.r); if(o.g) localStorage.setItem('suidoku_game_state_v1', o.g); else localStorage.removeItem('suidoku_game_state_v1'); location.reload(); return true;})()`);
  ws.close();
}

// A phone keeps the 1080x1920 the store listing has always used; a tablet keeps
// the whole usable area, and its width is whatever the screenshot is.
//
// The 1080 in the phone branch is a real assumption, not a measurement: it is
// the Flip5's width, and on a wider phone this would quietly take the left 1080
// columns and save a picture with the right-hand side cut off. The 320..3840
// size check below cannot see that — 1080 is a perfectly ordinary width. So the
// phone branch states the assumption and fails on it instead.
const cropBox = TABLET
  ? [0, CROP.top, null, CROP.bottom]
  : [0, CROP.top, 1080, CROP.top + 1920];
const suffix = TABLET ? '_tablet_screenshot_' : '_screenshot_';
execFileSync('python', ['-c', `
from PIL import Image
import glob, os
for f in sorted(glob.glob(os.path.join(r'${TMP}', '*.png'))):
    n = os.path.basename(f)[:2]
    im = Image.open(f).convert('RGB')
    right = ${cropBox[2] === null ? 'im.size[0]' : cropBox[2]}
    bottom = min(${cropBox[3]}, im.size[1])
    im = im.crop((${cropBox[0]}, ${cropBox[1]}, right, bottom))
    w, h = im.size
    # Play takes 320..3840 on each side; nothing here should be outside that, and
    # a screenshot that is has been cropped from the wrong rectangle.
    assert 320 <= w <= 3840 and 320 <= h <= 3840, (w, h)
    if ${TABLET ? "True" : "False"}:
        # Checked before the first shot too; this catches a device that turned
        # while the eight scenes were being walked.
        assert w > h, 'tablet shots must be landscape, got %sx%s' % (w, h)
    else:
        # The phone listing is 1080x1920. Anything else means this ran on a phone
        # the crop was not written for, and the picture would be silently cut.
        assert (w, h) == (1080, 1920), (
            'phone mode expects a 1080-wide screen and a 1920-tall crop, got %sx%s. '
            'Check the device, or give this phone its own crop.' % (w, h))
    im.save(os.path.join(r'${OUT}', '${FOLDER}' + '${suffix}' + n + '.png'), optimize=True)
`]);
console.log(`saved ${fs.readdirSync(TMP).length} screenshots to ${OUT}`);
