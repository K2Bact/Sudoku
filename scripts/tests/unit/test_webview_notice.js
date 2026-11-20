/**
 * test_webview_notice.js — gate 2-37: the "please update Android System WebView" notice (D38, 2026-11-06).
 *
 * On a WebView older than the build target the app's bundle either stops at its first line (Chrome 69:
 * a dark screen, no word of why) or draws a board of 9px cells (D31). The page now carries a small
 * classic script that says what to do instead. This gate holds its three promises:
 *
 *   1. It can run where it is needed: it parses as ES2015 — the oldest engine this app installs on
 *      (minSdk 24, Chrome 51+). A `?.` slipping in would put the notice itself behind the very
 *      syntax error it exists to explain.
 *   2. It shows exactly when it should: below 105 with no way past it, 105–110 with "continue anyway"
 *      (remembered for that version), 111 and up never, and never outside Chrome engines.
 *   3. It speaks the player's language by the app's own rule: the saved setting first, then the
 *      system language as matchSystemLanguage reads it — every locale the app ships, Arabic right to left.
 *   4. No string can break the script it is written into: "</script>", U+2028 and U+2029 go in as
 *      \u escapes (review 2026-11-20).
 *
 * Gate 3-24 runs the built page in a browser with old user agents.
 */
import assert from 'assert';
import vm from 'vm';
import * as espree from 'espree';
import { LOCALES } from '../../lib/locales.js';
import { noticeScript, noticeStrings, webviewNoticePlugin, NOTICE_BELOW, CONTINUE_FROM, WEBVIEW_PLAY_URL } from '../../build/webviewNotice.js';
import { matchSystemLanguage } from '../../../src/i18n/dictionaries.js';

console.log('======================================================');
console.log('🧭 Gate 2-37: the old-WebView notice (D38)');
console.log('======================================================\n');

const strings = noticeStrings();
const src = noticeScript(strings);

// ── 1. Syntax every installable WebView reads ─────────────────────────────
console.log('▶ 1. ES2015 at most');
try {
  espree.parse(src, { ecmaVersion: 6, sourceType: 'script' });
} catch (e) {
  assert.fail(`the notice script is not ES2015 (${e.message}) — on an old WebView the notice would fail with the same syntax error it is meant to explain`);
}
// The line is the build's own target, not a number of this file's choosing: Vite's default
// (no build.target in vite.config.js) is `baseline-widely-available`, whose Chrome entry is read here.
{
  const fs = await import('fs');
  const config = fs.readFileSync(new URL('../../../vite.config.js', import.meta.url), 'utf8');
  assert(!/\btarget\s*:/.test(config), 'vite.config.js sets a build target — the notice line must follow it, read that value here instead');
  const dir = new URL('../../../node_modules/vite/dist/node/', import.meta.url);
  const chunks = fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith('.js')).map((f) => fs.readFileSync(new URL(String(f).replace(/\\/g, '/'), dir), 'utf8'));
  const list = chunks.map((s) => s.match(/ESBUILD_BASELINE_WIDELY_AVAILABLE_TARGET\s*=\s*\[([^\]]*)\]/)?.[1]).find(Boolean);
  const chrome = Number(list?.match(/"chrome(\d+)"/)?.[1]);
  assert(chrome, 'could not read Vite\'s default browser target — this check did not reach it');
  assert.strictEqual(NOTICE_BELOW, chrome, `the notice shows below Chrome ${NOTICE_BELOW} but the bundle is built for Chrome ${chrome}`);
}
const tag = webviewNoticePlugin().transformIndexHtml()[0];
assert(tag.tag === 'script' && !tag.attrs.type && tag.injectTo === 'body',
  'the plugin must add a classic <script> at the end of <body> — a module would wait for the bundle, the head would run before <body> exists');
console.log('  ✅ parses as ES2015; a classic script at the end of <body>');

// ── 2. Every shipped language has all four strings ────────────────────────
console.log('▶ 2. Words for every locale');
assert.deepStrictEqual(Object.keys(strings).sort(), [...LOCALES].sort(), 'the notice must carry exactly the locales the app ships');
for (const [loc, s] of Object.entries(strings)) {
  for (const k of ['title', 'body', 'update', 'continue']) assert(s[k] && s[k].trim().length > 1, `${loc}.webviewUpdate.${k} is empty`);
}
console.log(`  ✅ ${LOCALES.length} locales × 4 strings`);

// ── 3. When it shows, in which language, and what it offers ───────────────
function element(tag) {
  const e = {
    tag, style: {}, attrs: {}, children: [], parentNode: null, textContent: '', href: '', className: '', id: '', type: '', onclick: null,
    setAttribute(k, v) { this.attrs[k] = String(v); },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; },
  };
  return e;
}
function run({ ua, language = 'en-US', saved = null, store = new Map(), script = src }) {
  const body = element('body');
  if (saved) store.set('suidoku_settings_v1', JSON.stringify({ language: saved }));
  const ctx = {
    navigator: { userAgent: ua, language },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
    document: { body, createElement: element },
  };
  vm.runInNewContext(script, ctx);
  const box = body.children.find((c) => c.id === 'webview-notice') || null;
  const find = (root, tg) => (root.tag === tg ? root : root.children.map((c) => find(c, tg)).find(Boolean));
  return { box, store, body, title: box && find(box, 'h1')?.textContent, link: box && find(box, 'a'), button: box && find(box, 'button') };
}
const UA = (v) => `Mozilla/5.0 (Linux; Android 9; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/${v}.0.0.0 Mobile Safari/537.36`;

console.log('▶ 3. Shows below 111, with a way past it only from 105');
{
  const r = run({ ua: UA(69), language: 'de-DE' });
  assert(r.box, 'Chrome 69 must get the notice — its screen is otherwise dark with no explanation');
  assert.strictEqual(r.title, strings.de.title, 'in German, from the system language');
  assert.strictEqual(r.link?.href, WEBVIEW_PLAY_URL, 'the button opens Android System WebView on Google Play');
  assert(!r.button, 'below 105 the app cannot work, so there is no "continue anyway" into a dark screen');
}
{
  const store = new Map();
  const r = run({ ua: UA(NOTICE_BELOW - 3), language: 'ko-KR', store });
  assert(r.box && r.button, `Chrome ${NOTICE_BELOW - 3} gets the notice and "continue anyway"`);
  assert.strictEqual(r.button.textContent, strings.ko.continue, 'in Korean');
  r.button.onclick();
  assert(!r.body.children.includes(r.box), '"continue anyway" removes the notice');
  assert.strictEqual(store.get('suidoku_webview_notice'), String(NOTICE_BELOW - 3), 'and remembers it for this WebView version');
  assert(!run({ ua: UA(NOTICE_BELOW - 3), language: 'ko-KR', store }).box, 'so the next start does not ask again');
  assert(run({ ua: UA(NOTICE_BELOW - 2), language: 'ko-KR', store }).box, 'a different (still old) version asks again');
}
assert(run({ ua: UA(CONTINUE_FROM), language: 'en' }).button, `${CONTINUE_FROM} is the first version with "continue anyway"`);
assert(!run({ ua: UA(CONTINUE_FROM - 1), language: 'en' }).button, `${CONTINUE_FROM - 1} has none`);
assert(!run({ ua: UA(NOTICE_BELOW) }).box, `Chrome ${NOTICE_BELOW} (the build target) gets no notice`);
assert(!run({ ua: UA(156) }).box, 'a current WebView gets none');
assert(!run({ ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0' }).box, 'nor does an engine that is not Chrome');
console.log(`  ✅ 69: notice only · ${NOTICE_BELOW - 3}: notice + continue, remembered per version · ${NOTICE_BELOW}+: nothing`);

console.log('▶ 4. The language, by the app\'s rule');
assert.strictEqual(run({ ua: UA(69), language: 'en-US', saved: 'ja' }).title, strings.ja.title, 'the saved language comes first');
assert.strictEqual(run({ ua: UA(69), language: 'ja-JP', saved: 'auto' }).title, strings.ja.title, '"auto" means the system language');
for (const raw of ['zh-HK', 'zh-Hant-TW', 'zh-CN', 'pt-BR', 'es-MX', 'ar-SA', 'hi-IN', 'it-IT', 'ru-RU', 'fr-CA', 'vi-VN']) {
  const want = matchSystemLanguage(raw) || 'en';
  assert.strictEqual(run({ ua: UA(69), language: raw }).title, strings[want].title, `${raw} must read like the app reads it (${want})`);
}
const ar = run({ ua: UA(69), language: 'ar-SA' });
assert.strictEqual(ar.box.attrs.dir, 'rtl', 'Arabic runs right to left');
assert.strictEqual(run({ ua: UA(69), language: 'fr-FR' }).box.attrs.dir, 'ltr', 'and nothing else does');
console.log('  ✅ saved setting, then the system language as matchSystemLanguage reads it; Arabic RTL');

// ── 5. A string cannot break the script it is written into ────────────────
// The words are written into an inline <script>. "</script>" in one would end the script in the
// HTML parser, and U+2028/U+2029 are line breaks inside a string literal for engines before
// ES2019 (Chrome below 66, which this notice is for). No shipped string has either today; this
// keeps a future translation from doing it (review 2026-11-20).
console.log('▶ 5. Strings are escaped for an inline script');
{
  const LS = String.fromCharCode(0x2028);
  const PS = String.fromCharCode(0x2029);
  const nasty = `A </script><b>x</b> ${LS} B ${PS} C`;
  const hostile = { ...strings, en: { ...strings.en, title: nasty } };
  const out = noticeScript(hostile);
  assert(!/<\/script/i.test(out), 'a string holding "</script>" reaches the page raw — the HTML parser would end the notice script there');
  assert(!out.includes(LS) && !out.includes(PS), 'U+2028/U+2029 reach the page raw — before Chrome 66 that is a line break inside a string: a syntax error');
  try {
    espree.parse(out, { ecmaVersion: 6, sourceType: 'script' });
  } catch (e) {
    assert.fail(`with an awkward string the notice is no longer ES2015 (${e.message})`);
  }
  assert.strictEqual(run({ ua: UA(69), language: 'en-US', script: out }).title, nasty, 'escaped, the string must still read back as the same words');
}
console.log('  ✅ "</script>", U+2028 and U+2029 are written as \\u escapes and read back unchanged');

console.log('\n======================================================');
console.log('🎉 [2-37] PASSED — an old WebView is told what to do, in its own language.');
console.log('======================================================');
