/**
 * Gate 2-34 — Text Size And High Contrast Reach The Board And The WebView (D9).
 *
 * The second most common request in competing apps' reviews was "the text is
 * small / the contrast is low" (user 2026-10-02, 34 reviews). Settings → Display
 * now has four text steps and a high-contrast switch (utils/textScale.js). What
 * this checks, without a browser:
 *   1. the steps and their factors, and the defaults a new player gets
 *   2. applyDisplaySettings puts them where they act: the board's digit step
 *      (at most 1.2 — past it the digit font's 1.4em box is taller than a cell),
 *      the note step (at most 1.15 — a killer note's room), the contrast class,
 *      and the full factor to the native plugin, whose answer is waited for
 *      before the zoom is measured again; no plugin (a browser) is not an error
 *   3. the native side: the WebView zoom is the phone's font scale times the
 *      step inside 0.85..1.3 — the cap the layouts are gated to — kept across
 *      starts, and applied in onCreate before the page loads
 *   4. the app applies the saved settings at start
 * Gate 3-22 measures what this cannot: the cells, the notes and the contrast.
 */
import assert from 'node:assert/strict';
import fs from 'fs';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

// A document and window just big enough for applyDisplaySettings and measureTextZoom.
const props = new Map();
const classes = new Set();
const log = [];
globalThis.document = {
  documentElement: {
    style: { setProperty: (k, v) => { props.set(k, v); if (k === '--text-zoom') log.push('measure'); } },
    classList: { toggle: (c, on) => { if (on) classes.add(c); else classes.delete(c); } },
  },
  createElement: () => ({ style: {}, remove() {} }),
  body: { appendChild() {} },
};
globalThis.getComputedStyle = () => ({ fontSize: '100px' });
globalThis.requestAnimationFrame = (f) => { log.push('frame'); f(); };
globalThis.window = {};

const { TEXT_STEPS, DIGIT_STEP_MAX, NOTE_STEP_MAX, textStepFactor, applyDisplaySettings } = await import('../../../src/utils/textScale.js');
const { loadSettings } = await import('../../../src/utils/storage.js');

console.log('======================================================');
console.log('🔠 Gate 2-34: Text size and high contrast reach the board and the WebView');
console.log('======================================================');

// 1. Steps and defaults.
assert.deepEqual(TEXT_STEPS.map((s) => [s.id, s.factor]), [['small', 0.9], ['normal', 1], ['large', 1.15], ['xlarge', 1.3]],
  'the four steps the settings screen offers, and what each multiplies by');
assert.equal(DIGIT_STEP_MAX, 1.2, 'the board digit stops at 1.2: the digit font\'s 1.4em text box is a whole cell there');
assert.equal(NOTE_STEP_MAX, 1.15, 'the notes stop at 1.15 — a margin by arithmetic (a 1.3 killer note: about 11.8px in 11.3px of room); no screen gate can measure it, so this line holds it');
assert.equal(textStepFactor('nonsense'), 1, 'an unknown step is the normal one, not a crash or a zero');
const fresh = loadSettings();
assert.equal(fresh.textSize, 'normal', 'a new player starts at the normal text size');
assert.equal(fresh.highContrast, false, 'and without high contrast');
console.log('  ✅ 1. four steps 0.9 · 1 · 1.15 · 1.3, normal and no high contrast by default');

// 2. What applyDisplaySettings sets.
const expect = { small: [0.9, 0.9], normal: [1, 1], large: [1.15, 1.15], xlarge: [1.2, 1.15] };
for (const [id, [digit, note]] of Object.entries(expect)) {
  await applyDisplaySettings({ textSize: id, highContrast: false });
  assert.equal(props.get('--board-digit-step'), String(digit), `${id}: the board digit step`);
  assert.equal(props.get('--board-note-step'), String(note), `${id}: the note step`);
}
await applyDisplaySettings({ textSize: 'normal', highContrast: true });
assert(classes.has('high-contrast'), 'high contrast on puts the class on <html>, where contrast.css reads it');
await applyDisplaySettings({ textSize: 'normal', highContrast: false });
assert(!classes.has('high-contrast'), 'and off takes it away again');
props.delete('--text-zoom');
await applyDisplaySettings({ textSize: 'large' });
assert(props.has('--text-zoom'), 'with no native plugin (a browser) the zoom is still measured, and nothing throws');

const calls = [];
window.Capacitor = { Plugins: { NativeInfo: { setTextScale: async (arg) => { calls.push(arg); log.push('native'); return { zoom: 130 }; } } } };
log.length = 0;
props.delete('--text-zoom');
await applyDisplaySettings({ textSize: 'xlarge' });
assert.deepEqual(calls, [{ step: 1.3 }], 'the native plugin gets the full step (1.3), not the board\'s capped one — the WebView cap is its own');
assert.equal(log[0], 'native', 'the plugin is called first');
assert.deepEqual(log.slice(0, 4), ['native', 'frame', 'frame', 'measure'],
  'and the zoom is measured again only after the plugin answered and a frame passed — before that, the old zoom is still in place');
window.Capacitor.Plugins.NativeInfo.setTextScale = async () => { throw new Error('not implemented'); };
await applyDisplaySettings({ textSize: 'small' });
assert.equal(props.get('--board-digit-step'), '0.9', 'an older native build without the method still gets the board changed');
console.log('  ✅ 2. board digit ≤ 1.2 · notes ≤ 1.15 · contrast class · full step to the native plugin, measured after a frame');

// 3. The native side.
const main = fs.readFileSync('android/app/src/main/java/com/powerneja/suidoku/MainActivity.java', 'utf8');
const plugin = fs.readFileSync('android/app/src/main/java/com/powerneja/suidoku/NativeInfoPlugin.java', 'utf8');
assert(/Math\.min\(Math\.max\(fontScale \* s, 0\.85f\), 1\.3f\)/.test(main),
  'MainActivity: the zoom is font scale × step inside 0.85..1.3 — past 1.3 the board loses its room (U-1); the layouts are gated to 1.3');
{
  // NaN passes Math.max/Math.min unchanged and Math.round(NaN) is 0: a step of NaN would set a 0%
  // text zoom. The guard has to come before the clamps (review 2026-11-20).
  const body = main.slice(main.indexOf('static int textZoomFor('), main.indexOf('Math.min(Math.max(fontScale * s'));
  assert(/if \(Float\.isNaN\(step\)\) step = 1f;/.test(body), 'MainActivity.textZoomFor must turn a NaN step into 1 before clamping — NaN slips through both clamps and rounds to a 0% zoom');
}
assert(/setTextZoom\(\s*textZoomFor\(this,\s*savedTextStep\(this\)\)\s*\)|int zoom = textZoomFor\(this, savedTextStep\(this\)\);/.test(main),
  'MainActivity.onCreate applies the kept step before the page loads');
assert(/@PluginMethod\s+public void setTextScale/.test(plugin), 'NativeInfoPlugin has setTextScale');
assert(/putFloat\(MainActivity\.TEXT_STEP_KEY/.test(plugin), 'and keeps the step for the next start');
assert(/setTextZoom\(zoom\)/.test(plugin) && /MainActivity\.textZoomFor\(getContext\(\), step\)/.test(plugin),
  'and sets the zoom now, through the same capped formula');
console.log('  ✅ 3. native: font scale × step capped at 0.85..1.3, kept, applied before the page loads');

// 4. At start.
const entry = fs.readFileSync('src/main.jsx', 'utf8');
assert(/applyDisplaySettings\(loadSettings\(\)\)/.test(entry), 'main.jsx applies the saved display settings at start');
console.log('  ✅ 4. the saved settings are applied at start');

console.log('\n[2-34] PASSED — text size and high contrast reach the board and the WebView');
