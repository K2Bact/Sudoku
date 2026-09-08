/**
 * test_academy_l10n.js
 * QA Gate: the academy's content goes through the same l10n gates as the UI.
 *
 * ── Why this gate exists ──────────────────────────────────────────────────
 * The l10n engine reads `src/i18n/locales/` and nothing else. The academy
 * keeps its text somewhere else and in a different shape:
 *
 *   locales/       locale → key → string          (what the engine expects)
 *   data/academy/  item → locale → string          (axis inverted)
 *
 * So roughly five thousand strings — every strategy title, every diagram
 * caption, every practice mission — sat outside all nine gates. Not by
 * decision; the engine simply could not be fed them.
 *
 * What that cost: the academy used its own locale codes (`zh`, `es`) instead
 * of the app's (`zh-CN`, `zh-TW`, `es-ES`), so Traditional Chinese readers
 * were served Simplified for months. Gate 4 exists precisely to catch
 * Simplified characters in zh-TW. It never saw the data.
 *
 * This gate inverts the axis and runs the engine's own gate functions over
 * the result — the rules are imported, never restated here. If a rule
 * changes in app_common, this gate changes with it.
 */

import { ACADEMY_STAGES } from '../../../src/data/academyStrategies.js';
import { ALL_PRACTICE_MISSIONS } from '../../../src/data/academy/practice/index.js';
import { DIAGRAM_TRANSLATIONS } from '../../../src/data/academy/diagramTranslations.js';
import { LOCALES } from '../../lib/locales.js';

import { auditGate1Completeness } from '../../../../app_common/l10n_engine/core/gate1_completeness.mjs';
import { auditGate2Tokens } from '../../../../app_common/l10n_engine/core/gate2_tokens.mjs';
import { auditGate3EnglishLeakage } from '../../../../app_common/l10n_engine/core/gate3_english_leakage.mjs';
import { auditGate4CjkIsolation } from '../../../../app_common/l10n_engine/core/gate4_cjk_isolation.mjs';
import { auditGate6TypoBlacklist } from '../../../../app_common/l10n_engine/core/gate6_typo_blacklist.mjs';
import { auditGate7SentenceIntegrity } from '../../../../app_common/l10n_engine/core/gate7_sentence_integrity.mjs';

console.log('======================================================');
console.log('🧪 QA Gate: Academy content under the l10n engine');
console.log('======================================================\n');

/** locale → { key: string } — the shape every core gate takes. */
const dictionaries = Object.fromEntries(LOCALES.map((l) => [l, {}]));

let blocks = 0;

/** Record one localised object under a dotted key. */
function put(key, dict) {
  if (!dict || typeof dict !== 'object') return;
  blocks++;
  for (const loc of LOCALES) {
    const v = dict[loc];
    if (typeof v === 'string') dictionaries[loc][key] = v;
  }
}

// 1. Strategy cards
for (const stage of ACADEMY_STAGES) {
  for (const strat of stage.strategies) {
    put(`academy.${strat.id}.badge`, strat.badge);
    put(`academy.${strat.id}.title`, strat.title);
    put(`academy.${strat.id}.desc`, strat.desc);
  }
}

// 2. Practice missions
for (const [stratId, missions] of Object.entries(ALL_PRACTICE_MISSIONS)) {
  for (const m of missions) {
    put(`practice.${stratId}.${m.id}.title`, m.title);
    put(`practice.${stratId}.${m.id}.guide`, m.guide);
  }
}

// 3. Diagram captions
for (const [type, entries] of Object.entries(DIAGRAM_TRANSLATIONS)) {
  for (const [key, dict] of Object.entries(entries)) {
    put(`diagram.${type}.${key}`, dict);
  }
}

const counts = LOCALES.map((l) => Object.keys(dictionaries[l]).length);
console.log(`  로케일 ${LOCALES.length}개 · 블록 ${blocks}개 · 문자열 ${counts.reduce((a, b) => a + b, 0)}개\n`);

let failed = 0;

function runGate(name, violations) {
  const list = violations || [];
  if (list.length === 0) {
    console.log(`  ✅ [PASS] ${name}`);
    return;
  }
  failed++;
  console.error(`  ❌ [FAIL] ${name} — ${list.length}건`);
  for (const v of list.slice(0, 8)) {
    console.error(`      [${v.locale || '?'}] ${v.key || ''} — ${v.message || JSON.stringify(v)}`);
  }
  if (list.length > 8) console.error(`      … 외 ${list.length - 8}건`);
}

// Gates 5, 8 and 9 are deliberately not run here. Five and eight police store
// wording and reviewer-facing tone; nine checks graphic files. None of them
// have anything to say about a Sudoku technique caption, and running them
// would produce noise that trains people to ignore this gate.
runGate('Gate 1 — 전 로케일 키 완전성', auditGate1Completeness(dictionaries, 'ko'));
runGate('Gate 2 — 토큰 대칭성', auditGate2Tokens(dictionaries, 'ko'));
runGate('Gate 3 — 영어 찌꺼기', auditGate3EnglishLeakage(dictionaries));
runGate('Gate 4 — 한중일 문자 격리 (zh-TW 안의 간체 포함)', auditGate4CjkIsolation(dictionaries));
runGate('Gate 6 — 오타 블랙리스트', auditGate6TypoBlacklist(dictionaries));
runGate('Gate 7 — 문장 무결성', auditGate7SentenceIntegrity(dictionaries));

console.log('\n======================================================');
if (failed > 0) {
  console.error(`❌ [AUDIT FAILED] ${failed} gate(s) failed.`);
  process.exit(1);
}
console.log('🎉 [PASS] Academy content passes the shared l10n gates.');
console.log('======================================================');
