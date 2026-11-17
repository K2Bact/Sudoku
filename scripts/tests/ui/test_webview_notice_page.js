/**
 * test_webview_notice_page.js — gate 3-24: the old-WebView notice in the built page (D38, 2026-11-06).
 *
 * Gate 2-37 runs the script on its own. This one runs the page Vite built — so it fails if the plugin
 * is dropped from vite.config.js, if the script lands where <body> does not exist yet, or if the notice
 * does not cover the app it sits over. The browser is current, so the user agent says what a phone's
 * WebView would say: Chrome 69 (Android 7 and 9 images), 108 (old but past container queries), and the
 * browser's own. In all 13 languages at 360px, the notice fits: nothing off screen, nothing cut.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import http from 'http';
import { LOCALES } from '../../lib/locales.js';
import { noticeStrings, WEBVIEW_PLAY_URL } from '../../build/webviewNotice.js';

const PORT = 5225;
const URL = `http://localhost:${PORT}`;
const UA = (v) => `Mozilla/5.0 (Linux; Android 9; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/${v}.0.0.0 Mobile Safari/537.36`;
const strings = noticeStrings();

function waitForServer(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => http.get(URL, (r) => (r.statusCode === 200 ? resolve() : setTimeout(check, 200)))
      .on('error', () => (Date.now() - start > timeout ? reject(new Error('preview server did not start')) : setTimeout(check, 200)));
    check();
  });
}

const readNotice = () => {
  const box = document.getElementById('webview-notice');
  if (!box) return null;
  const b = box.getBoundingClientRect();
  const hit = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
  const cut = [...box.querySelectorAll('*')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.right > innerWidth + 1 || r.left < -1 || e.scrollWidth > e.clientWidth + 1;
  }).map((e) => e.tagName);
  return {
    covers: b.width >= innerWidth - 1 && b.height >= innerHeight - 1 && box.contains(hit),
    title: box.querySelector('h1')?.textContent, href: box.querySelector('a')?.href, cont: Boolean(box.querySelector('button')),
    dir: box.getAttribute('dir'), cut, pageScroll: document.documentElement.scrollWidth - innerWidth,
  };
};

async function open(browser, { ua, language }) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, ...(ua ? { userAgent: ua } : {}) });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.evaluate((l) => { localStorage.clear(); localStorage.setItem('suidoku_settings_v1', JSON.stringify({ language: l })); localStorage.setItem('suidoku_review_prompted', '1'); }, language);
  await page.reload();
  await page.waitForTimeout(600);
  return { ctx, page };
}

async function run() {
  console.log('======================================================');
  console.log('🧭 Gate 3-24: the old-WebView notice in the built page (13 languages, 360px)');
  console.log('======================================================');
  const vite = spawn('cmd', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const failures = [];
  try {
    await waitForServer();
    // Chrome 69, every language: the notice, over everything, in that language, fitting.
    for (const lang of LOCALES) {
      const { ctx, page } = await open(browser, { ua: UA(69), language: lang });
      const r = await page.evaluate(readNotice);
      if (!r) failures.push(`${lang}: Chrome 69 got no notice — the page would stay dark`);
      else {
        if (!r.covers) failures.push(`${lang}: the notice does not cover the screen`);
        if (r.title !== strings[lang].title) failures.push(`${lang}: the title is "${r.title}", not this language's`);
        if (r.href !== WEBVIEW_PLAY_URL) failures.push(`${lang}: the button goes to ${r.href}`);
        if (r.cont) failures.push(`${lang}: Chrome 69 is offered "continue anyway" into an app that cannot run`);
        if (r.dir !== (lang === 'ar' ? 'rtl' : 'ltr')) failures.push(`${lang}: dir is ${r.dir}`);
        if (r.cut.length || r.pageScroll > 0) failures.push(`${lang}: off screen or cut — ${r.cut.join(',')} scroll ${r.pageScroll}`);
      }
      await ctx.close();
    }
    // Chrome 108: the way past it, and it stays past for that version. Its own try: a notice that
    // does not cover the app leaves the app's modal over its button, and a timeout here must not
    // swallow what the languages above already found (the first mutation audit lost them that way).
    try {
      const { ctx, page } = await open(browser, { ua: UA(108), language: 'en' });
      const r = await page.evaluate(readNotice);
      if (!r?.cont) failures.push('Chrome 108: no "continue anyway"');
      else {
        await page.click('#webview-notice button', { timeout: 5000 });
        await page.waitForTimeout(300);
        if (await page.evaluate(readNotice)) failures.push('Chrome 108: "continue anyway" did not remove the notice');
        if (!(await page.locator('.home-bottom-nav').count())) failures.push('Chrome 108: the app is not there under the notice');
        await page.reload();
        await page.waitForTimeout(600);
        if (await page.evaluate(readNotice)) failures.push('Chrome 108: the notice came back after "continue anyway"');
      }
      await ctx.close();
    } catch (e) {
      failures.push(`Chrome 108: the flow stopped — ${e.message.split('\n')[0]}`);
    }
    // The browser's own (current) engine: nothing, the app as always.
    try {
      const { ctx, page } = await open(browser, { language: 'en' });
      if (await page.evaluate(readNotice)) failures.push('a current engine got the notice');
      if (!(await page.locator('.home-bottom-nav').count())) failures.push('a current engine did not get the app');
      await ctx.close();
    } catch (e) {
      failures.push(`current engine: the flow stopped — ${e.message.split('\n')[0]}`);
    }
  } finally {
    await browser.close();
    vite.kill();
    try { execSync(`npx.cmd kill-port ${PORT}`, { stdio: 'ignore' }); } catch { /* nothing listening */ }
  }
  if (failures.length) {
    console.error(`\n❌ [FAIL] The old-WebView notice (${failures.length}):`);
    failures.slice(0, 30).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log(`\n🎉 [3-24] PASSED — Chrome 69 is told what to do in ${LOCALES.length} languages; 108 may go on; a current engine sees the app.`);
}

run().catch((err) => {
  console.error('❌ Gate 3-24 crashed:', err);
  process.exit(1);
});
