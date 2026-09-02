/**
 * test_file_responsibility.js
 * Keeps source files small enough that one person can hold them in their head.
 *
 * WHY THIS REPLACED A RAW LINE COUNT
 * The previous gate counted every line in the file, comments included. That
 * punished the wrong thing: on 2026-09-02 a fix pushed battleService.js to 302
 * lines and the quickest way through the gate was to *compress a comment* back
 * to 299. The code got less clear and the file's real problem — one class doing
 * matchmaking, progress, rematch and AI battles — was untouched. Later the same
 * file crossed the line again, and that time it was decomposed properly. The
 * difference was never the line count. It was whether responsibilities got split.
 *
 * So this gate measures CODE lines only. Explain as much as you like; the budget
 * is for logic. And when a file crosses a threshold it prints the top-level units
 * it can see, so the message is "here are the seams" rather than "you are over a
 * number".
 *
 * Thresholds come from measuring this repository (107 files, median 86% code):
 *   Logic (.js/.jsx)   WARN 200 code lines, FAIL 280  (~325 raw at 86% density)
 *   Styles (.css)      FAIL 320 only, no warning
 *
 * Stylesheets get no warning tier because they have no responsibilities to
 * separate in the same sense — this repo already splits them per screen
 * (home.css, battle.css, modals.css). A long stylesheet is a screen with many
 * elements, not a module doing too many jobs. They keep a hard cap so nothing
 * runs away, and nothing more.
 *
 * i18n/ and data/ are excluded entirely: flat translation and puzzle tables with
 * no logic to separate, where splitting would help nobody.
 */

import assert from 'assert';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, sep, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const WARN_AT = 200;      // logic files only
const FAIL_AT = 280;      // logic files
const CSS_FAIL_AT = 320;  // stylesheets: hard cap only

const toPosix = (p) => p.split(sep).join('/');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Lines that carry logic: blank lines and comments do not count. */
function countCodeLines(text) {
  let code = 0;
  let inBlock = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (inBlock) {
      if (line.includes('*/')) inBlock = false;
      continue;
    }
    if (!line) continue;
    if (line.startsWith('/*')) {
      if (!line.includes('*/')) inBlock = true;
      continue;
    }
    if (line.startsWith('//') || line.startsWith('*')) continue;
    code++;
  }
  return code;
}

/** Top-level units in the file — the candidate seams to split along. */
function findUnits(text) {
  const units = [];
  for (const m of text.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm)) units.push(`export ${m[1]}()`);
  for (const m of text.matchAll(/^export\s+class\s+(\w+)/gm)) units.push(`export class ${m[1]}`);
  for (const m of text.matchAll(/^export\s+const\s+(\w+)/gm)) units.push(`export ${m[1]}`);
  for (const m of text.matchAll(/^ {2}(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/gm)) {
    if (!['if', 'for', 'while', 'switch', 'catch', 'return'].includes(m[1])) units.push(`${m[1]}()`);
  }
  for (const m of text.matchAll(/^\s*const\s+(handle\w+|use\w+)\s*=/gm)) units.push(`${m[1]}`);
  return [...new Set(units)];
}

console.log('======================================================');
console.log('📏 Testing File Size & Responsibility Separation');
console.log('======================================================\n');

const files = walk(join(ROOT, 'src'))
  .map(toPosix)
  .filter((f) => !f.includes('/i18n/') && !f.includes('/data/') && /\.(js|jsx|css)$/.test(f));

const measured = files.map((f) => {
  const text = readFileSync(f, 'utf8');
  const isStyle = f.endsWith('.css');
  return {
    file: f.slice(f.indexOf('/src/') + 1),
    isStyle,
    limit: isStyle ? CSS_FAIL_AT : FAIL_AT,
    code: countCodeLines(text),
    raw: text.split('\n').length,
    units: isStyle ? [] : findUnits(text)
  };
});

const failures = measured.filter((m) => m.code > m.limit).sort((a, b) => b.code - a.code);
const warnings = measured
  .filter((m) => !m.isStyle && m.code > WARN_AT && m.code <= FAIL_AT)
  .sort((a, b) => b.code - a.code);

console.log(`▶ Scanned ${measured.length} files (i18n/ and data/ excluded)`);
console.log(`▶ Logic: warn above ${WARN_AT}, fail above ${FAIL_AT} code lines`);
console.log(`▶ Styles: fail above ${CSS_FAIL_AT} code lines, no warning tier\n`);

if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} file(s) past the warning line — decompose before they grow further:`);
  for (const w of warnings) {
    console.log(`   ${w.code} code lines (${w.raw} raw)  ${w.file}`);
    if (w.units.length > 0) {
      console.log(`      does: ${w.units.slice(0, 8).join(', ')}${w.units.length > 8 ? `, +${w.units.length - 8} more` : ''}`);
    }
  }
  console.log('');
}

if (failures.length > 0) {
  console.error(`❌ ${failures.length} file(s) over the ${FAIL_AT}-code-line budget:\n`);
  for (const f of failures) {
    console.error(`   ${f.code} code lines (${f.raw} raw, limit ${f.limit})  ${f.file}`);
    console.error(`      does: ${f.units.join(', ') || '(no top-level units detected)'}`);
    console.error('      Split these into separate modules. Do NOT shorten comments to');
    console.error('      get under the limit — comments are not counted here.\n');
  }
}

assert.strictEqual(
  failures.length,
  0,
  `${failures.length} file(s) exceed their code-line budget and need their responsibilities separated`
);

console.log(`✅ Every file is within budget${warnings.length ? ` (${warnings.length} logic file(s) on the watch list)` : ''}`);
console.log('\n🎉 [PASS] File Size & Responsibility Separation Verified!\n');
