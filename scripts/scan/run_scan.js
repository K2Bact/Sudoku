/**
 * run_scan.js
 * The scan. Not a gate — a different question entirely.
 *
 * A gate is handed a feature and asks whether it clears the bar. Every gate in
 * this project was green on 2026-09-02 while the ad service had no callers, the
 * matchmaking broadcast was rejected on arrival every single time, a purchase
 * button showed a literal `{price}`, and the hardcoded-text scanner reported
 * "0 hardcoded strings" with four English literals shipping to thirteen
 * locales. Nothing cleared a bar wrongly. The bars were being cleared by people
 * who never entered the race.
 *
 * So the scan asks the other question: did the thing that was supposed to run,
 * run at all? Is anyone on the other end of this wire?
 *
 * Two severities, because the two need different handling:
 *
 *   CONFIRMED  broken as written — a prop nobody receives, a method that does
 *              not exist, a placeholder the player reads. Fails the run.
 *   SUSPECT    needs a human. Dead code is usually a leftover and occasionally
 *              a public surface. Reported, does not fail.
 *
 * Anything genuinely fine goes in allowlist.js WITH ITS REASON. A scan that
 * cries wolf gets ignored, and an ignored scan is worse than none: it reports
 * success in the exact voice a working one would use.
 *
 *   node scripts/scan/run_scan.js          모두 보고, CONFIRMED 있으면 실패
 *   node scripts/scan/run_scan.js --all    SUSPECT 까지 전부 나열
 */

import { buildIndex } from './sourceIndex.js';
import { scanDeadCode } from './checks/deadCode.js';
import { scanI18nReach } from './checks/i18nReach.js';
import { scanWiring } from './checks/wiring.js';

const KIND_LABEL = {
  unusedExports: '아무도 안 부르는 export',
  unreadHookValues: '훅이 돌려주는데 아무도 안 읽는 값',
  orphanI18nKeys: '버튼이 없는 고아 번역 키',
  unresolvedPlaceholders: '화면에 그대로 찍히는 자리표시자',
  unsuppliedCallbacks: '부모가 안 넘기는데 가드 없이 호출하는 prop (크래시)',
  deadCallbackBranch: '부모가 안 넘겨서 영원히 안 도는 분기',
  unusedProps: '넘기는데 받는 쪽이 선언 안 한 prop',
  missingMethods: '존재하지 않는 메서드 호출'
};

const showAll = process.argv.includes('--all');

console.log('======================================================');
console.log('🔎 [SCAN] 출전하기로 한 선수가 실제로 나왔는가');
console.log('======================================================\n');

const index = buildIndex();
console.log(`앱 파일 ${index.app.size} · 로케일 파일 ${index.locales.size} · 스크립트 ${index.tests.size}\n`);

const findings = [
  ...scanWiring(index),
  ...scanI18nReach(index),
  ...scanDeadCode(index)
];

const confirmed = findings.filter((f) => f.severity === 'CONFIRMED');
const suspect = findings.filter((f) => f.severity === 'SUSPECT');
// Inventory rather than defects — reported so nobody has to wonder, but kept
// out of the two tiers that ask for action.
const notes = findings.filter((f) => f.severity === 'NOTE');

function report(list, title) {
  if (!list.length) return;
  console.log(title);
  const byKind = new Map();
  for (const f of list) {
    if (!byKind.has(f.kind)) byKind.set(f.kind, []);
    byKind.get(f.kind).push(f);
  }
  for (const [kind, rows] of byKind) {
    console.log(`\n  ▸ ${KIND_LABEL[kind] || kind} (${rows.length}건)`);
    const shown = showAll ? rows : rows.slice(0, 12);
    for (const r of shown) {
      console.log(`     ${r.where}`);
      console.log(`        ${r.detail}`);
    }
    if (shown.length < rows.length) {
      console.log(`     … ${rows.length - shown.length}건 더 (--all 로 전부 보기)`);
    }
  }
  console.log('');
}

report(confirmed, '❌ CONFIRMED — 지금 깨져 있음');
report(suspect, '⚠️  SUSPECT — 사람이 판단해야 함');
if (notes.length && showAll) report(notes, 'ℹ️  NOTE — 참고 (동작에 영향 없음)');
else if (notes.length) {
  const byKind = new Map();
  for (const n of notes) byKind.set(n.kind, (byKind.get(n.kind) || 0) + 1);
  console.log('ℹ️  NOTE — 참고 (동작에 영향 없음)');
  for (const [kind, count] of byKind) console.log(`  ▸ ${KIND_LABEL[kind] || kind}: ${count}건`);
  console.log('  --all 로 전부 보기\n');
}

console.log('======================================================');
if (confirmed.length) {
  console.log(`❌ [SCAN] 확정 ${confirmed.length}건 / 의심 ${suspect.length}건 / 참고 ${notes.length}건`);
  console.log('======================================================');
  process.exit(1);
}
console.log(`✅ [SCAN] 확정 0건 / 의심 ${suspect.length}건 / 참고 ${notes.length}건`);
console.log('======================================================');
