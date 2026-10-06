/**
 * Gate 2-29 — in a right-to-left language, a Latin or number token with a sign
 * is drawn the way it is written.
 *
 * Unicode's bidi rules move a `+`, `-` or `%` at the edge of a Latin/number run
 * to the other side when the line around it is Arabic: `+10` is drawn `10+`,
 * `S+` is drawn `+S`, `Lv.4+` is drawn `+Lv.4` (UAX#9 W5–W7, N1). The text in the
 * file is right; the picture is not. Measured in the browser 2026-10-06 for the
 * Saudi launch: all 11 such strings in Arabic flipped, 0 after wrapping each token
 * in LRI…PDI (U+2066…U+2069), the way Diary 92 already fixed `+38.8s` and `2-1`.
 * The shared rule is app_common/l10n_engine/rules/ar/README.md §5.2.
 *
 * So: every string of every RTL language — the UI dictionaries and the Academy —
 * that holds a letter of that script may carry a signed token only inside an
 * isolate. RTL languages come from SUPPORTED_LANGUAGES (isRTL), not a list here.
 *
 * Components count too: a `+{points}` written in JSX flips the same way, so the
 * line holding it must put it inside <bdi dir="ltr"> (added 2026-10-07).
 *
 * A self-test runs first: the check must flag a bare `+10` and pass an isolated
 * one, or a clean result would mean nothing.
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { SUPPORTED_LANGUAGES, DICTIONARIES } from '../../../src/i18n/dictionaries.js';
import { academyCorpus } from '../fixtures/academy_corpus.js';

console.log('\n↔️  [2-29] Signed Latin tokens in RTL text are isolated');

const LRI = String.fromCodePoint(0x2066);
const PDI = String.fromCodePoint(0x2069);
const ISOLATED = new RegExp(`${LRI}[^${PDI}]*${PDI}`, 'g');
// A run of Latin letters, digits and dots that starts or ends with a weak sign.
// Only at the run's edge: the hyphen inside `X-Wing` sits between two Latin
// letters and stays put (it matched here at first and flagged correct Academy strings).
const SIGNED = /(?:(?<![A-Za-z0-9.])[+\-%][A-Za-z0-9][A-Za-z0-9.]*|[A-Za-z0-9][A-Za-z0-9.]*[+%](?![A-Za-z0-9]))/g;
const RTL_LETTER = /[֐-ࣿ]/;

/** The signed tokens of one string that are not inside an isolate. */
function bareTokens(text) {
  if (!RTL_LETTER.test(text)) return [];
  return text.replace(ISOLATED, ' ').match(SIGNED) || [];
}

// ── self-test ───────────────────────────────────────────────────────────────
assert.deepStrictEqual(bareTokens('خطأ (+10 ث)'), ['+10'], 'self-test: a bare +10 in Arabic was not flagged');
assert.deepStrictEqual(bareTokens(`خطأ (${LRI}+10${PDI} ث)`), [], 'self-test: an isolated +10 was flagged');
assert.deepStrictEqual(bareTokens('[Lv.4+ صعب]'), ['Lv.4+'], 'self-test: a bare Lv.4+ was not flagged');
assert.deepStrictEqual(bareTokens('Mistake (+10s)'), [], 'self-test: a string with no RTL letter was flagged');
assert.deepStrictEqual(bareTokens('نمط X-Wing هنا'), [], 'self-test: the hyphen inside X-Wing was flagged');
console.log('  ✓ self-test: a bare token is caught, an isolated one and a Latin-only string are not');

const flatten = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else if (typeof v === 'string') out[key] = v;
  }
  return out;
};

const rtl = SUPPORTED_LANGUAGES.filter((l) => l.isRTL).map((l) => l.code);
assert.ok(rtl.length > 0, 'no RTL language found in SUPPORTED_LANGUAGES — the gate would check nothing');
const { dictionaries: academy } = academyCorpus();

const failures = [];
for (const code of rtl) {
  const ui = flatten(DICTIONARIES[code]);
  const learn = academy[code] || {};
  const sources = [['UI', ui], ['Academy', learn]];
  let checked = 0;
  for (const [where, strings] of sources) {
    for (const [key, text] of Object.entries(strings)) {
      checked++;
      for (const tok of bareTokens(text)) failures.push(`${code} ${where} ${key}: "${tok}" is drawn reversed — wrap it as \\u2066${tok}\\u2069`);
    }
  }
  assert.ok(Object.keys(ui).length > 100 && Object.keys(learn).length > 100, `${code}: read only ${Object.keys(ui).length} UI and ${Object.keys(learn).length} Academy strings — the corpus did not load`);
  console.log(`  ✓ ${code}: ${checked} strings read (${Object.keys(ui).length} UI, ${Object.keys(learn).length} Academy)`);
}

// ── Components that glue a sign to a number themselves ───────────────────────
// The dictionaries are not the only source: AchievementsView drew `(+{points})`
// and an Arabic screen showed "(10+)" (store screenshot, 2026-10-07). A sign
// written in JSX right before `{…}` must sit inside a left-to-right <bdi>.
// Scoped to the JSX line that holds the sign, not the whole file (AGENTS §3.3).
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.jsx') ? [path.join(dir, e.name)] : []));
const jsxFiles = walk('src');
let glued = 0;
for (const file of jsxFiles) {
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    const code = line.replace(/\{\/\*.*?\*\/\}/g, '').replace(/^\s*\/\/.*$/, '');
    // `+{` or `-{` as JSX text: preceded by `>`, space or `(` — not an operator inside an expression.
    for (const m of code.matchAll(/(^|[>\s(])([+\-])\{/g)) {
      glued++;
      const before = code.slice(0, m.index + m[1].length);
      const isolated = /<bdi dir="ltr">\s*$/.test(before);
      if (!isolated) failures.push(`${path.relative('.', file)}:${i + 1}: "${m[2]}{…}" in JSX is drawn after the number in Arabic — put it inside <bdi dir="ltr">`);
    }
  });
}
assert.ok(jsxFiles.length > 50, `read only ${jsxFiles.length} .jsx files — the component scan did not reach src`);
console.log(`  ✓ components: ${jsxFiles.length} .jsx files read, ${glued} sign(s) glued to a value in JSX`);

if (failures.length) {
  console.error(`\n❌ [2-29] FAILED — ${failures.length} signed token(s) not isolated:`);
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log('\n✅ [2-29] PASSED — every signed token in RTL text is isolated');
