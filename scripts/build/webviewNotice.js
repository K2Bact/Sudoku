/**
 * webviewNotice.js — "please update Android System WebView", written into index.html (D38, 2026-11-06).
 *
 * The bundle is built for Chrome 111 (Vite 8's default target, `baseline-widely-available`). On an
 * older WebView it either stops at its first line — Chrome 69 does not know `?.` and the screen stays
 * dark with no word of why (Android 7 and 9 images, a factory-reset phone before Play updates it) —
 * or it runs and draws a board of 9px cells (D31, Chrome 91–96: no container query units before 105).
 * D31 decided the app does not bend to those engines. This tells the player what to do instead.
 *
 * So it cannot be part of the bundle: it is a classic inline script in the page, run before the
 * module, in syntax every WebView this app can be installed on reads (minSdk 24 → Chrome 51 and up;
 * gate 2-37 parses it as ES2015). Its words come from the locale files at build time and its
 * language rule is the app's own `matchSystemLanguage`, copied in as source — no second list to drift.
 *
 *   below 105  the app cannot work: the notice and a Google Play button, nothing else
 *   105–110    it may: the same, and "continue anyway", remembered for that WebView version
 *   111 and up nothing
 */
import { DICTIONARIES, SUPPORTED_LANGUAGES, matchSystemLanguage } from '../../src/i18n/dictionaries.js';

export const NOTICE_BELOW = 111;
export const CONTINUE_FROM = 105;
export const WEBVIEW_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.google.android.webview';

// The four strings by their dotted keys, written out — gate 2-15 counts a key as used when its
// path appears as a literal, and this is where these are used.
const KEYS = { title: 'webviewUpdate.title', body: 'webviewUpdate.body', update: 'webviewUpdate.update', continue: 'webviewUpdate.continue' };

/** Every language's four strings, keyed by the app's own language codes. */
export function noticeStrings() {
  const out = {};
  for (const { code } of SUPPORTED_LANGUAGES) {
    if (code === 'auto') continue;
    out[code] = {};
    for (const [name, key] of Object.entries(KEYS)) {
      const s = key.split('.').reduce((o, p) => o?.[p], DICTIONARIES[code]);
      if (!s) throw new Error(`${key} missing for ${code}`);
      out[code][name] = s;
    }
  }
  return out;
}

/** The inline script itself (ES2015 at most; see the header). */
export function noticeScript(strings = noticeStrings()) {
  return `(function () {
  var m = /Chrome\\/(\\d+)/.exec(navigator.userAgent || '');
  if (!m) return;
  var v = parseInt(m[1], 10);
  if (v >= ${NOTICE_BELOW}) return;
  var S = ${JSON.stringify(strings)};
  var matchSystemLanguage = ${matchSystemLanguage.toString()};
  var lang = 'en';
  try {
    var saved = JSON.parse(localStorage.getItem('suidoku_settings_v1') || '{}').language;
    lang = saved && saved !== 'auto' && S[saved] ? saved : (matchSystemLanguage(navigator.language || '') || 'en');
    if (v >= ${CONTINUE_FROM} && localStorage.getItem('suidoku_webview_notice') === String(v)) return;
  } catch (e) { lang = matchSystemLanguage(navigator.language || '') || 'en'; }
  var t = S[lang] || S.en;
  var el = function (tag, css, text) { var e = document.createElement(tag); e.style.cssText = css; if (text) e.textContent = text; return e; };
  var box = el('div', 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:sans-serif;');
  box.id = 'webview-notice';
  box.setAttribute('role', 'alertdialog');
  box.setAttribute('lang', lang);
  box.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  var card = el('div', 'max-width:420px;width:100%;background:#1e293b;border-radius:16px;padding:24px;box-sizing:border-box;text-align:center;');
  card.appendChild(el('h1', 'font-size:20px;line-height:1.35;margin:0 0 12px;', t.title));
  card.appendChild(el('p', 'font-size:15px;line-height:1.55;margin:0 0 20px;color:#cbd5e1;', t.body));
  var go = el('a', 'display:block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px;border-radius:12px;', t.update);
  go.href = '${WEBVIEW_PLAY_URL}';
  go.className = 'webview-notice-update';
  card.appendChild(go);
  if (v >= ${CONTINUE_FROM}) {
    var later = el('button', 'display:block;width:100%;margin-top:10px;background:transparent;color:#94a3b8;border:1px solid #334155;font-size:15px;padding:12px;border-radius:12px;', t.continue);
    later.type = 'button';
    later.className = 'webview-notice-continue';
    later.onclick = function () { try { localStorage.setItem('suidoku_webview_notice', String(v)); } catch (e) {} box.parentNode.removeChild(box); };
    card.appendChild(later);
  }
  box.appendChild(card);
  document.body.appendChild(box);
})();`;
}

/** Vite plugin: the script goes at the end of <body>, a classic script, so it runs before the module. */
export function webviewNoticePlugin() {
  return {
    name: 'sudoku-webview-notice',
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { id: 'webview-check' }, children: noticeScript(), injectTo: 'body' }];
    },
  };
}
