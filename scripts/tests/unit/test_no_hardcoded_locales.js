/**
 * test_no_hardcoded_locales.js
 * QA Gate: nobody writes the locale list down a second time.
 *
 * ── Why this gate exists ──────────────────────────────────────────────────
 * Four checks each carried their own copy of the locale list. Three said
 * thirteen; one still said five, and had for long enough that two shipped
 * languages were silently broken behind it:
 *
 *   const langs = ['ko', 'en', 'ja', 'zh', 'es'];
 *
 * That line is not a check of the locale list. It IS a copy of the locale
 * list — so it cannot detect the list changing, any more than a photograph
 * notices you have moved. It stayed green while the app grew to thirteen.
 *
 * A document can ask people not to do this. Only a gate stops it. The rule
 * this file enforces is the one thing that makes the whole arrangement hold:
 *
 *   a check derives its expected values from the same source the app reads,
 *   never from a list retyped beside the assertion.
 *
 * The single source is `scripts/lib/locales.js`, which reads
 * `src/i18n/locales/` and cross-checks it against the language selector.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOCALES } from '../../lib/locales.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');

/** Files allowed to name locales: the source of truth and the app itself. */
const ALLOWED = [
  'scripts/lib/locales.js',                          // reads the app; this is the source
  'src/i18n/dictionaries.js',                        // the selector — one of the two real lists
  'scripts/tests/unit/test_no_hardcoded_locales.js', // this file
];

const SEARCH_DIRS = ['scripts', 'src'];

/**
 * `archive/` and `generators/` are exempt, and the reason matters.
 *
 * They are one-shot authoring tools. Their locale arrays are not copies of the
 * current list — they are the batch somebody translated on a particular day
 * (`['de','fr','pt','it','ru','hi','ar']` is "the seven added in round two",
 * which is a historical fact, not a claim about today).
 *
 * The residual risk is real: rerun a generator after adding a language and it
 * skips the new one. That risk is now covered from the other side — gate 2-16
 * runs Gate 1 (key completeness) over the academy content these tools produce,
 * so a language they miss fails the build anyway. The list is checked at the
 * output rather than at the tool.
 *
 * `locales/` and `academy/` are skipped because they hold the translations
 * themselves; naming a locale there is the point.
 */
const SKIP_DIRS = new Set([
  'node_modules', 'dist', '.git',
  'locales', 'academy',
  'archive', 'generators',
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(js|jsx|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}

console.log('======================================================');
console.log('🧪 QA Gate: No Hand-Copied Locale Lists');
console.log('======================================================\n');
console.log(`  단일 출처: scripts/lib/locales.js → ${LOCALES.length}개 로케일\n`);

// An array literal holding three or more quoted locale codes. Two is a pair
// being compared (zh-CN vs zh-TW is a legitimate thing to write); three or
// more is somebody transcribing the list.
const CODE = "(?:[a-z]{2}(?:-[A-Za-z]{2})?)";
const LIST = new RegExp(`\\[\\s*(['"])${CODE}\\1\\s*,\\s*(['"])${CODE}\\2\\s*,\\s*(['"])${CODE}\\3`);

const offenders = [];

for (const dir of SEARCH_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    if (ALLOWED.includes(rel)) continue;

    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return;
      if (!LIST.test(line)) return;
      // Only complain when the literal actually names locales this app ships.
      const quoted = [...line.matchAll(/['"]([a-z]{2}(?:-[A-Za-z]{2})?)['"]/g)].map((m) => m[1]);
      const hits = quoted.filter((c) => LOCALES.includes(c));
      if (hits.length >= 3) offenders.push({ rel, line: i + 1, text: line.trim().slice(0, 88), hits });
    });
  }
}

if (offenders.length === 0) {
  console.log('  ✅ [PASS] 로케일 목록을 손으로 적어둔 곳이 없습니다.');
  console.log('\n======================================================');
  console.log('🎉 [PASS] The list lives in one place.');
  console.log('======================================================');
} else {
  console.error(`  ❌ [FAIL] 로케일 목록 사본 ${offenders.length}건\n`);
  for (const o of offenders) {
    console.error(`     ${o.rel}:${o.line}`);
    console.error(`       ${o.text}`);
    console.error(`       → ${o.hits.length}개 로케일을 직접 나열함\n`);
  }
  console.error("  이 배열은 로케일 목록을 '검사'하는 것이 아니라 그 목록의 '사본'입니다.");
  console.error('  사본은 원본이 바뀌어도 그대로 남고, 검사는 초록불을 유지합니다.');
  console.error("  고치는 법:  import { LOCALES } from '…/scripts/lib/locales.js'");
  console.error('\n======================================================');
  console.error('❌ [AUDIT FAILED]');
  process.exit(1);
}
