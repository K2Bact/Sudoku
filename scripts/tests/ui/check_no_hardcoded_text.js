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
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

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
 * Product names that deliberately stay in English in every locale. Keep this
 * list short: each entry is a string no translator will ever be able to reach.
 */
const BRAND_TERMS = ['Sudoku IQ', 'Sudoku PRO', 'ONLINE PVP', 'VS AI', 'DAILY'];

/**
 * Literal prose sitting between JSX tags, e.g. `<p>Watching ad</p>`.
 * `{t('...')}` and every other expression carries braces and is skipped.
 */
function hardcodedJsxText(line) {
  const found = [];
  for (const match of line.matchAll(/>([^<>{}]+)</g)) {
    const text = match[1].trim();
    if (!text) continue;
    if (BRAND_TERMS.includes(text)) continue;
    // Three letters is enough to be a word rather than a symbol, unit or arrow.
    if ((text.match(/[A-Za-z]/g) || []).length < 3) continue;
    // SHOUTED LABELS and dotted.identifiers are decoration, not prose.
    if (/^[A-Z0-9_.\-\s]+$/.test(text)) continue;
    found.push(text);
  }
  return found;
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

for (const f of targetFiles) {
  let raw = readFileSync(f, 'utf8');
  // Strip block comments and JSX comments
  raw = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  raw = raw.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  const lines = raw.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    if (koreanRegex.test(trimmed)) {
      violations.push({ file: f, line: idx + 1, text: trimmed });
      return;
    }

    if (f.endsWith('.jsx')) {
      for (const text of hardcodedJsxText(line)) {
        violations.push({ file: f, line: idx + 1, text: `(English) ${text}` });
      }
    }
  });
}

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
  console.log(`✅ [QA Hardcode Scanner] PASSED! Inspected ${targetFiles.length} UI & Hook files with 0 hardcoded strings.`);
}
