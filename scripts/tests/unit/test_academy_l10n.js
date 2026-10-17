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
 * This gate runs the engine's own gate functions over the inverted corpus —
 * the rules are imported, never restated here. If a rule changes in
 * app_common, this gate changes with it.
 *
 * The inversion itself lives in `../fixtures/academy_corpus.js`, shared with
 * gate 2-19. It used to happen here, while 2-19 collected the same strings by
 * running a regex over the source text; that regex missed `"ja": "…"` with a
 * space after the colon, so a Simplified character dropped into
 * `stage1Diagrams.js` was invisible to it. Two collectors over one corpus
 * drift, and the drift is silent. There is one now.
 */

import { academyCorpus } from '../fixtures/academy_corpus.js';
import { LOCALES } from '../../lib/locales.js';

import { auditGate1Completeness } from '../../../../../app_common/l10n_engine/core/gate1_completeness.mjs';
import { auditGate2Tokens } from '../../../../../app_common/l10n_engine/core/gate2_tokens.mjs';
import { auditGate3EnglishLeakage } from '../../../../../app_common/l10n_engine/core/gate3_english_leakage.mjs';
import { auditGate4CjkIsolation } from '../../../../../app_common/l10n_engine/core/gate4_cjk_isolation.mjs';
import { auditGate6TypoBlacklist } from '../../../../../app_common/l10n_engine/core/gate6_typo_blacklist.mjs';
import { auditGate7SentenceIntegrity } from '../../../../../app_common/l10n_engine/core/gate7_sentence_integrity.mjs';
import { auditGate10FrenchTypography } from '../../../../../app_common/l10n_engine/core/gate10_french_typography.mjs';
import { auditGate11ItalianTypography } from '../../../../../app_common/l10n_engine/core/gate11_italian_typography.mjs';
import { auditGate12ScriptAllowlist } from '../../../../../app_common/l10n_engine/core/gate12_script_allowlist.mjs';

console.log('======================================================');
console.log('🧪 QA Gate: Academy content under the l10n engine');
console.log('======================================================\n');

// 축을 뒤집는 일은 `academy_corpus.js` 가 한다. 이 게이트가 자기 안에서 하던
// 일이었는데, 게이트 2-19 가 같은 말뭉치를 소스 정규식으로 따로 모으고 있었고
// 그쪽이 `"ja": "…"` 형식을 놓쳤다. 수집기가 둘이면 언젠가 갈라진다.
const { dictionaries, blocks } = academyCorpus();

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
runGate('Gate 10 — 프랑스어 조판 (: ; ! ? 앞 줄바꿈 없는 공백 · ’ · « »)', auditGate10FrenchTypography(dictionaries));
runGate('Gate 11 — 이탈리아어 조판·철자 (’ · … · È · -ché · po’ · qual è)', auditGate11ItalianTypography(dictionaries));
runGate('Gate 12 — 문자 체계 허용 목록 (그 언어의 글자 + 라틴만)', auditGate12ScriptAllowlist(dictionaries));

console.log('\n======================================================');
if (failed > 0) {
  console.error(`❌ [AUDIT FAILED] ${failed} gate(s) failed.`);
  process.exit(1);
}
console.log('🎉 [PASS] Academy content passes the shared l10n gates.');
console.log('======================================================');
