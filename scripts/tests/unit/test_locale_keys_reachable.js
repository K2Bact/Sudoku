/**
 * test_locale_keys_reachable.js
 *
 * Every string translated into thirteen languages must be reachable from the
 * running app.
 *
 * Screens here get rewritten, and a rewrite renames keys. `stats.summaryTitle`
 * replaced `stats.title`; `academy.stageTitles.stage1` replaced `academy.stage1`.
 * The new keys were added and the old ones were never removed, so both sets sit
 * in the locale files and gate 1 keeps all thirteen languages in sync on the
 * dead half forever. Sixty-seven keys had accumulated that way — 871 translated
 * strings that nothing renders, and a cost paid again by every new language.
 *
 * The scan already reported them, at NOTE severity, which is a tier nothing acts
 * on. This gate is that finding promoted to something that fails.
 *
 * WHAT COUNTS AS REACHABLE
 *
 * Not "appears inside t()". That was tried and it was wrong: the achievements
 * screen renders `{t(ach.titleKey)}` and the key itself lives in
 * achievementsData.js as `titleKey: 'achievements.first_win.title'` — neither a
 * literal in a t() call nor a template. Sixty live keys were counted as dead.
 *
 * So a key is reachable if its dotted path appears as a string literal anywhere
 * in `src/` outside the locale files, or if a template-literal call could build
 * it. `t(`levels.${level}`)` marks the whole `levels.` subtree reachable, which
 * is deliberately coarse.
 *
 * The bias is intentional and it only goes one way. Calling a live key dead
 * leads to deleting it, and the player then sees `achievements.first_win.title`
 * on the screen. Calling a dead key live merely leaves it in place. When in
 * doubt this gate says reachable.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'src');
const LOCALES = path.join(SRC, 'i18n/locales');
const REFERENCE_LOCALE = 'en';

console.log('======================================================');
console.log('🗝️  Testing Every Translated Key Is Reachable');
console.log('======================================================\n');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

// ── What the app refers to ────────────────────────────────────────────────
// scripts/build too: what the build writes into index.html ships with the app — the old-WebView
// notice (D38) reads its words there, at build time, where the app's bundle cannot run.
const appFiles = [...walk(SRC).filter((f) => !f.startsWith(LOCALES)), ...walk(path.join(ROOT, 'scripts/build'))];
const appSource = appFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// Any dotted path written as a string literal, wherever it sits. Comments count
// too — see the note above on which direction to be wrong in.
const literalPaths = new Set(
  [...appSource.matchAll(/['"`]([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+)['"`]/g)].map((m) => m[1])
);

// `t(`levels.${level}`)` → the prefix "levels." covers everything beneath it.
const dynamicPrefixes = [...new Set(
  [...appSource.matchAll(/\bt\(\s*`([^`]*)`/g)]
    .map((m) => m[1].split('${')[0])
    .filter(Boolean)
)];

// ── What the locale files define ──────────────────────────────────────────
function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.push(key);
  }
  return out;
}


const locales = fs.readdirSync(LOCALES).filter((d) => fs.statSync(path.join(LOCALES, d)).isDirectory());
assert(locales.includes(REFERENCE_LOCALE), `Reference locale ${REFERENCE_LOCALE} is missing`);

// Every locale, not just the reference one. The first version of this gate read
// only `en` and so could not see that `ja` carries seven keys no other language
// has — numbers.* and share.*, none of them called from anywhere. A key that
// exists in one language is still a key somebody translated and nobody reads.
const keysByLocale = new Map();
const definedKeys = new Set();
for (const lang of locales) {
  const dir = path.join(LOCALES, lang);
  const found = new Set();
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const mod = await import('file://' + path.join(dir, file).replace(/\\/g, '/'));
    for (const value of Object.values(mod)) {
      // The export name is not part of the key path: screens.js exports `screens`
      // and the key is `game.ghost.ahead`, not `screens.game.ghost.ahead`.
      if (value && typeof value === 'object') flatten(value, '', []).forEach((k) => { found.add(k); definedKeys.add(k); });
    }
  }
  keysByLocale.set(lang, found);
}

const allKeys = [...definedKeys];
assert(allKeys.length > 100, `Only ${allKeys.length} keys read across ${locales.length} locales — the loader is broken, not the locales`);

// ── The verdict ───────────────────────────────────────────────────────────
const reachable = (key) =>
  literalPaths.has(key) ||
  dynamicPrefixes.some((p) => key.startsWith(p));
const orphans = allKeys.filter((k) => !reachable(k)).sort();


console.log(`▶ ${allKeys.length} keys defined in ${REFERENCE_LOCALE}, across ${locales.length} languages`);
console.log(`  ${dynamicPrefixes.length} dynamic prefixes: ${dynamicPrefixes.join(', ')}`);

if (orphans.length) {
  const byGroup = new Map();
  for (const o of orphans) {
    const top = o.split('.')[0];
    byGroup.set(top, [...(byGroup.get(top) || []), o]);
  }
  console.error('\n❌ Keys nothing can reach:\n');
  for (const [group, keys] of [...byGroup].sort((a, b) => b[1].length - a[1].length)) {
    console.error(`  ${group} (${keys.length})`);
    for (const k of keys) console.error(`     ${k}`);
  }
}

assert.strictEqual(orphans.length, 0,
  `${orphans.length} translated key(s) have no caller, costing ${orphans.length * locales.length} ` +
  'strings kept in sync across every language for nothing.\n\n' +
  'Delete them from all ' + locales.length + ' locale files. If one is genuinely needed, the fix ' +
  'is to call it, not to keep it: a key nothing renders is a translation bill ' +
  'that every new language pays again.\n\n' +
  'If a key here IS reached at runtime, this gate cannot see how. Say the key ' +
  'somewhere as a plain string literal — that is how achievementsData.js does ' +
  'it — rather than assembling it from fragments.');

console.log(`  ✅ every one of them is reachable\n`);
console.log('======================================================');
console.log('🎉 Locale key gate passed — nothing translated goes unread.');
console.log('======================================================');
