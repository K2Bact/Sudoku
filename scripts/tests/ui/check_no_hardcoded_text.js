/**
 * check_no_hardcoded_text.js
 *
 * Every user-facing string must come from t('key') and exist in all 13 locales.
 *
 * This gate used to look for Korean characters ONLY, and reported
 * "0 hardcoded strings" while four English literals were rendering to every
 * locale — among them `📺 Watching rewarded ad... (3s)`, which was also wrong
 * about the duration and claimed a real advertiser during closed testing.
 *
 * That gap was not bad luck. The base locale of this app is English, so an
 * untranslated English literal reads as perfectly finished code to whoever
 * writes it, and to every reviewer after. Korean is the language a contributor
 * has to go out of their way to hardcode. The scanner was watching the door
 * nobody walks through.
 *
 * ── Read through the parser, not line by line (2026-10-07, BACKLOG D4) ──────
 * Until today this gate stripped comments with regular expressions and read JSX
 * children one line at a time, and both left holes it had written down itself:
 *   - `//` inside a string ('x//y') was taken for a comment, and everything after
 *     it on the line — a Korean literal included — went unread;
 *   - only `>…<` on one line was read, so a JSX child split over several lines
 *     (the replay screen writes them that way) was never looked at.
 * The file is now parsed with the parser Vite itself uses (oxc, `parseSync`), the
 * way gates 0-3 and 2-11 read code. Comments never reach the check because they
 * are not strings; a JSX child is a node however many lines it spans; and line
 * endings (CRLF/LF), which once made the same code pass or fail by checkout
 * setting, do not enter the judgement at all.
 * A self-test runs first on both holes, and the run fails if it parsed too little.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import { parseSync } from 'vite';

function walk(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

const koreanRegex = /[가-힯]/;

/**
 * English that stays English in every locale, each with its reason. Keep this list
 * short: every entry is a string no translator will ever be able to reach.
 *
 * ── Why this is a list of exact strings and not a rule (2026-09-30) ─────────
 * The scanner used to skip three kinds of English, and each skip hid a label that
 * every locale saw untranslated (SudokuAITalk DE29-12, found in German screenshots):
 *
 *   - SHOUTED LABELS were "decoration" — `VS AI` and `DAILY` on the home cards
 *   - text next to an expression was never read — `{totalPoints} pts`
 *   - a quoted word inside an expression was never read — `{on ? 'ON' : 'OFF'}`
 *
 * `VS AI` and `DAILY` were also in the old brand list, with no reason written down
 * and no user decision behind them. A German player read VS AI beside KI-Bot-Duell.
 * So there are no categories any more: an exemption names the string and says why.
 */
const KEPT_ENGLISH = new Map([
  ['ONLINE PVP', 'gaming abbreviation — the German review kept it (DE29-12)'],
  ['PVP', 'the same abbreviation, on the 1v1 battle header'],
  ['VS', 'the versus mark between the two players'],
  // The dictionaries write it too (header.levelPrefix, missions) — gate 2-24 holds them to Lv.
  ['Lv.', 'the level mark gamers read in every language (user 2026-09-30, BACKLOG HC-1)'],
  ['Build', 'version line in settings, read back in bug reports'],
  // PB (ghost banner) and RP (stats) were here until the user decided on 2026-09-30: the
  // banner now names the mode, and the rating shows only its number beside its label.
]);

/** Enough letters to be a word: two catches ON, VS, AI; symbols and arrows have none. */
const isWordy = (s) => (s.match(/[A-Za-z]/g) || []).length >= 2;
const kept = (s) => KEPT_ENGLISH.has(s.replace(/^[^A-Za-z]+|[^A-Za-z.]+$/g, ''));

const isString = (n) => n && n.type === 'Literal' && typeof n.value === 'string';
const isTCall = (n) => n && n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 't';
const children = (node) => Object.entries(node)
  .filter(([k, v]) => k !== 'parent' && v && typeof v === 'object')
  .flatMap(([, v]) => (Array.isArray(v) ? v : [v]))
  .filter((v) => v && typeof v.type === 'string');

/**
 * Words a JSX child expression writes itself: `{on ? 'ON' : 'OFF'}`, `{`${n} pts`}`.
 * Not reported: the key inside t('…'), a fallback after it (`t('x') || 'X'` never
 * renders — t returns the key when one is missing), a comparison (`=== 'ghost'`),
 * and nested JSX, whose own children are read where they stand.
 */
// An id handed to a helper — lockedChip('ghost', …), a class name — not a word on screen.
const KEY_LIKE = /^[a-z][a-zA-Z0-9_-]*$/;

/** The values a function body hands back: its expression, or its own return statements. */
function returned(body, out) {
  if (body.type !== 'BlockStatement') { out.push(body); return out; }
  const walkBlock = (node) => {
    if (!node || typeof node.type !== 'string') return;
    if (/Function/.test(node.type)) return;              // a nested function returns for itself
    if (node.type === 'ReturnStatement') { if (node.argument) out.push(node.argument); return; }
    for (const c of children(node)) walkBlock(c);
  };
  walkBlock(body);
  return out;
}

function wordsInExpression(node, out) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return;
  if (isTCall(node)) return;
  // A callback's statements build classes and keys (`let btnClass = 'practice-key-btn'`);
  // only what it returns can be drawn. The returned JSX is read where it stands.
  if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
    for (const r of returned(node.body, [])) wordsInExpression(r, out);
    return;
  }
  if (node.type === 'CallExpression') {
    wordsInExpression(node.callee, out);
    for (const a of node.arguments) if (!(isString(a) && KEY_LIKE.test(a.value))) wordsInExpression(a, out);
    return;
  }
  if (node.type === 'LogicalExpression' && isTCall(node.left)) return;
  if (node.type === 'BinaryExpression' && /^[!=]==?$/.test(node.operator)) return;
  if (isString(node)) { out.push({ text: node.value, start: node.start }); return; }
  if (node.type === 'TemplateLiteral') {
    for (const q of node.quasis) out.push({ text: q.value.cooked ?? q.value.raw, start: q.start });
    for (const e of node.expressions) wordsInExpression(e, out);
    return;
  }
  for (const c of children(node)) wordsInExpression(c, out);
}

/**
 * English a template builds anywhere, not only in a JSX child (2026-10-21, BACKLOG D22).
 * The words over the Speedrun and Survival clock — `+${n}s Bonus!`, `-${n}s (${c} COMBO!)` —
 * were built in a hook and handed to the header as finished text, so the reading of JSX
 * children never met them and every locale showed them in English. The share text's mode
 * was a variable handed to t() as a value, the same way (D27).
 *
 * A template whose fixed parts read as prose — letters, and a space, ! or ? — is reported,
 * except where nothing it says reaches a player: a className, style, key or id attribute,
 * the key inside t() (its values are read), a console call, an Error, and the stand-in
 * translator a function keeps for callers that pass no t
 * (`typeof t === 'function' ? t : …`, conflictDetector.js — the app's caller passes t).
 *
 * Not read: plain quoted strings outside JSX. Most of them are CSS, URLs and keys, and a
 * prose rule over them reports noise; the AI bot names ('AI Solver', BACKLOG D28) are the
 * known English among them.
 */
const QUIET_ATTRIBUTES = /^(className|style|key|id)$/;
const isProse = (s) => /[A-Za-z]{2,}/.test(s) && /[\s!?]/.test(s.trim());
const isStandInTranslator = (n) => n.type === 'ConditionalExpression'
  && n.test.type === 'BinaryExpression' && n.test.left.type === 'UnaryExpression'
  && n.test.left.operator === 'typeof' && n.test.left.argument?.name === 't'
  && n.consequent.type === 'Identifier' && n.consequent.name === 't';

function templateProse(program, code, out) {
  const walkNode = (node) => {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'JSXAttribute' && QUIET_ATTRIBUTES.test(node.name?.name ?? '')) return;
    if (node.type === 'NewExpression' || node.type === 'ThrowStatement') return;
    if (node.type === 'CallExpression') {
      if (/^console\./.test(code.slice(node.callee.start, node.callee.end))) return;
      if (isTCall(node)) { node.arguments.slice(1).forEach(walkNode); return; }
    }
    if (isStandInTranslator(node)) { walkNode(node.test); walkNode(node.consequent); return; }
    if (node.type === 'TemplateLiteral') {
      const text = node.quasis.map((q) => q.value.cooked ?? q.value.raw).join('{}');
      if (!koreanRegex.test(text) && isProse(text.replace(/\{\}/g, ''))) {
        out.push({ start: node.start, end: node.end, text: `(English) ${text.replace(/\s+/g, ' ').trim()}` });
      }
    }
    for (const c of children(node)) walkNode(c);
  };
  walkNode(program);
  return out;
}

/**
 * Everything one file would show that did not come from t():
 *   - Korean in any string, template or JSX text in the code (comments are not
 *     strings, so they never get here);
 *   - English in a JSX child — text between tags, or a word an expression writes.
 * Returns [{ start, text }]; `stats` counts what was read.
 */
function scan(code, filename, stats) {
  const parsed = parseSync(filename, code);
  if (parsed.errors.length) throw new Error(`${filename} could not be parsed: ${parsed.errors[0].message}`);
  const found = [];
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return;
    if (isString(node) && koreanRegex.test(node.value)) found.push({ start: node.start, text: node.value.trim() });
    if (node.type === 'TemplateElement' && koreanRegex.test(node.value.cooked ?? node.value.raw)) {
      found.push({ start: node.start, text: (node.value.cooked ?? node.value.raw).trim() });
    }
    if (node.type === 'JSXText') {
      stats.jsxText++;
      const text = node.value.replace(/\s+/g, ' ').trim();
      if (koreanRegex.test(text)) found.push({ start: node.start, text });
      else if (isWordy(text) && !kept(text)) found.push({ start: node.start, text: `(English) ${text}` });
    }
    if ((node.type === 'JSXElement' || node.type === 'JSXFragment') && filename.endsWith('.jsx')) {
      for (const child of node.children) {
        if (child.type !== 'JSXExpressionContainer') continue;
        stats.jsxExpressions++;
        const words = [];
        wordsInExpression(child.expression, words);
        for (const w of words) {
          const text = w.text.replace(/\s+/g, ' ').trim();
          // Korean in a string is already reported above; this adds the English.
          if (!koreanRegex.test(text) && isWordy(text) && !kept(text)) found.push({ start: w.start, text: `(English) ${text}` });
        }
      }
    }
    for (const c of children(node)) visit(c);
  };
  visit(parsed.program);
  // A template in a JSX child is already reported word by word above; report the rest.
  for (const hit of templateProse(parsed.program, code, [])) {
    if (!found.some((f) => f.start >= hit.start && f.start < hit.end)) found.push({ start: hit.start, text: hit.text });
  }
  return found.sort((a, b) => a.start - b.start);
}

const lineOf = (code, offset) => code.slice(0, offset).split('\n').length;

// ── self-test: the two holes this rewrite closes, and what must stay quiet ──────
{
  const s = { jsxText: 0, jsxExpressions: 0 };
  const texts = (code) => scan(code, 'probe.jsx', s).map((f) => f.text);
  assert.deepStrictEqual(texts("const a = 'x//y'; const b = '안녕';"), ['안녕'],
    "self-test: a Korean literal after 'x//y' on the same line was not found (the old comment hole)");
  assert.deepStrictEqual(texts('const v = (\n  <p>\n    Watching ad\n  </p>\n);'), ['(English) Watching ad'],
    'self-test: English in a JSX child split over lines was not found (the old one-line hole)');
  assert.deepStrictEqual(texts("// 주석은 한국어로 쓴다\nconst v = <p>{t('home.title')}</p>; /* 블록 주석 */"), [],
    'self-test: a comment or a t() key was reported');
  assert.deepStrictEqual(texts("const v = <p>{t('x') || 'Fallback'}{mode === 'ghost' ? t('a') : t('b')}</p>;"), [],
    'self-test: a t() fallback or a comparison was reported');
  assert.deepStrictEqual(texts("const v = <p>{n} pts {on ? 'ON' : 'OFF'}</p>;"), ['(English) pts', '(English) ON', '(English) OFF'],
    'self-test: the words a child expression writes, or text beside it, were not found');
  assert.deepStrictEqual(texts("const v = <p>{[1, 2].map((n) => { let c = 'practice-key-btn'; return <b className={c}>{n}</b>; })}{chip('ghost', t('x'))}</p>;"), [],
    "self-test: a class name built in a callback, or an id handed to a helper, was reported");
  assert.deepStrictEqual(texts("const v = <p>{items.map((i) => 'Hello there')}</p>;"), ['(English) Hello there'],
    'self-test: words a callback returns for the screen were not found');
  // D22 and D27: a template outside JSX — in a hook, or as a value handed to t().
  assert.deepStrictEqual(texts("const bonus = (n) => show('bonus', `+${n}s Bonus!`);"), ['(English) +{}s Bonus!'],
    'self-test: an English template built in a hook was not found (the D22 hole)');
  assert.deepStrictEqual(texts("const s = t('x.share', { mode: `[${a} Attack]` });"), ['(English) [{} Attack]'],
    'self-test: an English template handed to t() as a value was not found (D27)');
  assert.deepStrictEqual(texts("const v = <b className={`cell ${x} hot`} key={`k ${i}`}>{t(`levels.${l}`)}</b>; console.log(`saved ${n} games`); throw new Error(`timed out after ${ms}ms`); const tr = typeof t === 'function' ? t : (k, p) => `Mistakes ${p.count}`;"), [],
    'self-test: a class name, key, t() key, log, Error or stand-in translator template was reported');
  assert.deepStrictEqual(texts("const v = <p>{`${n} pts`}</p>;"), ['(English) pts'],
    'self-test: a template in a JSX child was reported twice, or not at all');
  console.log('  ✓ self-test: both old holes are caught; comments, t() keys, fallbacks, comparisons, class names and ids stay quiet');
  console.log('  ✓ self-test: English templates outside JSX are caught (D22, D27); class/key/log/Error/stand-in templates stay quiet');
}

// Files allowed to contain internal localized data dictionaries
const allowedFiles = [
  'src/i18n',
  'src/data/',
  'src/components/academy/Stage',
  'src/services/'
];

const targetFiles = walk('src').filter((f) => {
  if (!f.endsWith('.jsx') && !f.endsWith('.js')) return false;
  return !allowedFiles.some((af) => f.replace(/\\/g, '/').includes(af));
});

console.log('🔍 [QA Hardcode Scanner] Inspecting source files for forbidden hardcoded text...');

const violations = [];
const stats = { jsxText: 0, jsxExpressions: 0 };
for (const f of targetFiles) {
  const code = readFileSync(f, 'utf8');
  for (const hit of scan(code, f, stats)) violations.push({ file: f, line: lineOf(code, hit.start), text: hit.text });
}
// A parse that reached nothing would pass every file; the app has hundreds of JSX children.
assert.ok(stats.jsxText > 300 && stats.jsxExpressions > 300,
  `read only ${stats.jsxText} JSX texts and ${stats.jsxExpressions} child expressions in ${targetFiles.length} files — the parse did not reach the screens`);

if (violations.length > 0) {
  console.error(`\n❌ [QA Hardcode Scanner] FOUND ${violations.length} HARDCODED STRINGS:`);
  violations.forEach((v) => {
    console.error(`  - ${v.file}:${v.line} -> ${v.text}`);
  });
  console.error(
    '\n🚨 All user-facing strings MUST use t("key") and be registered in all 13 locale dictionaries.' +
    '\n   A literal that happens to be English is not exempt — it reaches every locale untranslated.\n'
  );
  process.exit(1);
} else {
  console.log(`✅ [QA Hardcode Scanner] PASSED! Inspected ${targetFiles.length} UI & Hook files (${stats.jsxText} JSX texts, ${stats.jsxExpressions} child expressions) with 0 hardcoded strings.`);
}
