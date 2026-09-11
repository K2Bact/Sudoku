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
const LIST = new RegExp(`\\[\\s*(['"])${CODE}\\1\\s*,\\s*(['"])${CODE}\\2\\s*,\\s*(['"])${CODE}\\3`, 'g');

/**
 * 주석을 공백으로 덮되 줄 수는 유지한다. 행 번호가 그대로 맞아야 한다.
 *
 * 이 게이트는 원래 줄마다 `startsWith('//')` 로 주석을 건너뛰었다. 그러면
 * 줄 끝 주석(`const n = 1; // ['ko','en','ja']`)이 위반으로 보고된다.
 * 오탐은 누락보다 낫지만, 시끄러운 게이트는 무시당하고 무시당하는 게이트는
 * 검사처럼 보이는 장식이 된다.
 */
function blankComments(src) {
  const keepNewlines = (s) => s.replace(/[^\n]/g, ' ');
  return src
    .replace(/\/\*[\s\S]*?\*\//g, keepNewlines)
    .replace(/(^|[^:\\])\/\/[^\n]*/g, (m, lead) => lead + ' '.repeat(m.length - lead.length));
}

const offenders = [];

for (const dir of SEARCH_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    if (ALLOWED.includes(rel)) continue;

    /*
     * 줄 단위가 아니라 파일 전체에 건다. 이유가 있다.
     *
     * 줄 단위로 보는 동안 이 게이트는 여러 줄로 쪼갠 목록을 통째로 놓쳤다:
     *
     *     const langs = [
     *       'ko',
     *       'en',
     *       'ja',
     *     ];
     *
     * 이 게이트가 막으려는 바로 그 형태다. 포매터가 배열 한 줄을 넘기는
     * 순간 검사가 조용히 꺼지고, 꺼진 것을 알 방법이 없다. 원래 사고를 낸
     * `['ko','en','ja','zh','es']` 도 줄바꿈만 하면 통과했다.
     *
     * "파일 전체에 정규식을 걸지 않는다" 는 규칙이 있고, 그 규칙이 막으려는
     * 것은 `[\s\S]*` 처럼 끝이 열린 패턴이 파일을 가로질러 엉뚱한 짝을
     * 맺는 일이다. 여기 쓰는 패턴은 원소 사이의 `\s*` 뿐이고 배열 원소 세
     * 개로 닫혀 있어 그런 확장이 일어나지 않는다. 행 번호는 일치 위치까지의
     * 줄바꿈을 세어 복원한다.
     */
    const src = blankComments(fs.readFileSync(file, 'utf8'));
    for (const m of src.matchAll(LIST)) {
      // Only complain when the literal actually names locales this app ships.
      const chunk = src.slice(m.index, m.index + 400);
      const arrayEnd = chunk.indexOf(']');
      const inside = arrayEnd === -1 ? chunk : chunk.slice(0, arrayEnd);
      const quoted = [...inside.matchAll(/['"]([a-z]{2}(?:-[A-Za-z]{2})?)['"]/g)].map((q) => q[1]);
      const hits = quoted.filter((c) => LOCALES.includes(c));
      if (hits.length < 3) continue;
      const line = src.slice(0, m.index).split('\n').length;
      offenders.push({
        rel,
        line,
        text: inside.replace(/\s+/g, ' ').trim().slice(0, 88),
        hits,
      });
    }
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
