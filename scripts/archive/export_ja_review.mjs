// Export every Japanese string a player can see, next to its English source, for a
// native-level review by another model (ChatGPT does the final Japanese check).
//   node scripts/archive/export_ja_review.mjs  →  docs/archive/ja_review.md
// Only live text: the theory drawings replaced by TheoryBoardDiagram are skipped,
// so the reviewer does not spend time on strings no screen shows.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = [];
const flat = (o, p = '', acc = {}) => {
  for (const [k, v] of Object.entries(o || {})) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, acc); else acc[key] = v;
  }
  return acc;
};
const load = async (loc) => {
  const dir = path.join(ROOT, 'src/i18n/locales', loc);
  const all = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
    const m = await import(pathToFileURL(path.join(dir, f)).href);
    Object.assign(all, flat(m[Object.keys(m)[0]], f.replace('.js', '')));
  }
  return all;
};
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, '⏎');

// 1. UI strings
const ja = await load('ja');
const en = await load('en');
out.push('# 日本語レビュー用エクスポート', '', `生成: ${new Date().toISOString().slice(0, 10)} · scripts/review/export_ja_review.mjs`, '');
out.push('## 1. アプリ UI (src/i18n/locales/ja)', '', '| key | EN | JA |', '|---|---|---|');
for (const k of Object.keys(ja).sort()) if (typeof ja[k] === 'string') out.push(`| ${k} | ${esc(en[k] ?? '')} | ${esc(ja[k])} |`);

// 2. Academy
const { ACADEMY_STAGES } = await import(pathToFileURL(path.join(ROOT, 'src/data/academyStrategies.js')).href);
const { ALL_PRACTICE_MISSIONS } = await import(pathToFileURL(path.join(ROOT, 'src/data/academy/practice/index.js')).href);
const tbd = fs.readFileSync(path.join(ROOT, 'src/components/academy/TheoryBoardDiagram.jsx'), 'utf8');
const boardTheory = new Set([...(tbd.match(/BOARD_THEORY = new Set\(\[([\s\S]*?)\]\)/) || ['', ''])[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
const { DIAGRAM_TRANSLATIONS } = await import(pathToFileURL(path.join(ROOT, 'src/data/academy/diagramTranslations.js')).href);
out.push('', '## 2. アカデミー', '');
for (const stage of ACADEMY_STAGES) {
  for (const s of stage.strategies) {
    out.push(`### ${s.id}  (${s.badge?.ja ?? ''})`, '', '| field | EN | JA |', '|---|---|---|');
    out.push(`| title | ${esc(s.title?.en)} | ${esc(s.title?.ja)} |`, `| desc | ${esc(s.desc?.en)} | ${esc(s.desc?.ja)} |`);
    if (boardTheory.has(s.id)) out.push('| theory | (9x9 board from example 1 — captions: academy.theoryBoard.*) | |');
    else for (const [k, v] of Object.entries(DIAGRAM_TRANSLATIONS[s.id] || {})) if (v?.ja) out.push(`| theory.${k} | ${esc(v.en)} | ${esc(v.ja)} |`);
    for (const m of ALL_PRACTICE_MISSIONS[s.id] || []) {
      out.push(`| ${m.id}.title | ${esc(m.title?.en)} | ${esc(m.title?.ja)} |`, `| ${m.id}.guide | ${esc(m.guide?.en)} | ${esc(m.guide?.ja)} |`);
    }
    out.push('');
  }
}

// 3. Store listing and 4. privacy policy
out.push('## 3. ストア掲載文 (store_assets/ja-JP/store_description_ja.txt)', '', '```', fs.readFileSync(path.join(ROOT, 'store_assets/ja-JP/store_description_ja.txt'), 'utf8').trim(), '```', '');
const html = fs.readFileSync(path.join(ROOT, 'docs/privacy.html'), 'utf8');
// The page shows one language at a time; each lives in its own <section data-lang>.
const jaStart = html.indexOf('<section class="lang-section" lang="ja"');
if (jaStart < 0) throw new Error('privacy.html: Japanese section not found');
const jaPart = html.slice(jaStart, html.indexOf('</section>', jaStart));
out.push('## 4. プライバシーポリシー 日本語節 (docs/privacy.html)', '', '```', jaPart.replace(/<[^>]+>/g, '').replace(/\n\s*\n+/g, '\n').trim(), '```', '');

fs.mkdirSync(path.join(ROOT, 'docs/review'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/archive/ja_review.md'), out.join('\n'));
console.log('wrote docs/archive/ja_review.md', out.length, 'lines');
