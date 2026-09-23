/**
 * Gate 2-23 — the win screen does not ask the WebView for a full-screen canvas.
 *
 * On a Flip5 the win screen asked for a 384x857 canvas (canvas-confetti makes one per
 * call, sized to the viewport) while the blurred overlay, the board and the banner were
 * up and a full-screen ad had just closed. The allocation failed 35 times in 10 seconds
 * and tiles of the dialog went unpainted — the "flashing" a player reported
 * (SudokuDiary ㉜; reproduced on the phone: 28 failures on the old code, 0 on five runs
 * of the new one).
 *
 * A Flip6 on the store build then showed the same failure lasting far longer:
 * 103 of them, one every 0.55s for 57 seconds, all 384x857, starting the instant
 * the win screen appeared after the interstitial and stopping by themselves when
 * the ad's video buffers were released. The confetti canvas was not the only
 * full-viewport surface the win screen asked for — `.modal-overlay` carried
 * `backdrop-filter: blur(8px)`, which makes the compositor snapshot the whole
 * viewport as well. Both are gone now.
 *
 * Four things keep it away, and each is checked here:
 *   - one canvas, reused, at a fraction of the resolution (utils/celebrate.js)
 *   - no screen calls canvas-confetti directly any more
 *   - no full-screen modal scrim asks for a blurred backdrop
 *   - nobody tries to paint over the banner's own refresh gap
 *   - the last-minute timer heartbeat stops once the game is finished
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const code = (rel) => read(rel).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

console.log('\n🎉 [2-23] The win screen does not ask for a full-screen canvas');

// 1. Only the helper may touch canvas-confetti
const users = [];
const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach((e) => {
  const rel = `${dir}/${e.name}`;
  if (e.isDirectory()) walk(rel);
  else if (/\.(js|jsx)$/.test(e.name) && /canvas-confetti/.test(code(rel))) users.push(rel);
});
walk('src');
assert.deepStrictEqual(users, ['src/utils/celebrate.js'],
  `only utils/celebrate.js may import canvas-confetti — a direct call makes its own viewport-sized canvas (found: ${users.join(', ')})`);

// 2. The helper reuses one canvas at reduced resolution
const helper = code('src/utils/celebrate.js');
const scale = Number((helper.match(/const SCALE\s*=\s*([\d.]+)/) || [])[1]);
assert(scale > 0 && scale <= 0.6, `celebrate.js must draw at a fraction of the screen resolution (SCALE=${scale})`);
assert(/confetti\.create\(/.test(helper) && /resize:\s*false/.test(helper),
  'celebrate.js must own its canvas (confetti.create with resize:false), not let the library size one per call');
assert(/isConnected/.test(helper), 'the canvas is made once and reused while it is still in the page');
assert(/catch/.test(helper), 'a failed celebration must not take the win screen with it');

// 3. The full-screen scrim behind a modal must not ask for a blurred backdrop
{
  // comments stripped: this file's own comment explains why there is no blur here
  const css = code('src/styles/modals.css');
  const overlay = (css.match(/\.modal-overlay\s*\{[^}]*\}/) || [''])[0];
  assert(overlay, '.modal-overlay rule not found in modals.css');
  assert(!/backdrop-filter/.test(overlay),
    'a full-screen .modal-overlay must not use backdrop-filter: it makes the compositor '
    + 'snapshot the whole viewport, which is the allocation that fails after the interstitial');
  assert(!/will-change/.test(overlay),
    'and it must not be promoted with will-change either — that is a second full-screen surface');
  const alpha = Number((overlay.match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/) || [])[1]);
  assert(alpha >= 0.8, `without the blur the scrim has to hide the board on its own (alpha ${alpha})`);
  // Any other full-screen blurred layer would cost exactly the same.
  for (const file of ['src/styles/modals.css', 'src/styles/screens.css', 'src/index.css']) {
    for (const rule of code(file).match(/[^}]*\{[^}]*\}/g) || []) {
      if (!/backdrop-filter/.test(rule)) continue;
      assert(!/position:\s*fixed[\s\S]*inset:\s*0/.test(rule),
        `${file}: a full-screen blurred layer is back — ${rule.slice(0, 60).trim()}`);
    }
  }
}

// 4. Nobody tries to colour the banner's refresh gap again
{
  const slot = code('src/styles/screens.css');
  assert(!/banner-live/.test(slot) && !/banner-live/.test(code('src/ads/admobProvider.js')),
    'the slot cannot soften the banner gap: AdMob draws that gap itself (black, with its own '
    + 'label on it) over this slot, measured on a Flip6 — only the refresh interval changes it');
}

// 5. The last-minute heartbeat stops when the game ends
const header = code('src/components/Header.jsx');
const danger = (header.match(/const isDangerTime = [^;]+;/) || [''])[0];
assert(/!isFinished/.test(danger), `the timer heartbeat must stop once the game is finished: ${danger.trim()}`);
assert(/isFinished/.test(code('src/hooks/useGameProps.js')) && /isFinished/.test(code('src/components/screens/GameScreen.jsx')),
  'isFinished must reach the header from the game state (useGameProps → GameScreen → Header)');

console.log('  ✅ one reused canvas at reduced resolution, no direct confetti calls, no full-screen blur,');
console.log('     no slot colour pretending to fix the banner gap, and the heartbeat stops at the end');
console.log('🎉 [2-23] PASSED');
