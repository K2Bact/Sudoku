/**
 * test_cjk_script_purity.js
 * QA Gate: 일본어 문장에 중국어 간체가, 번체 문장에 간체가 섞이지 않는다.
 *
 * ── 이 게이트가 생긴 이유 ────────────────────────────────────────────────
 * 이 프로젝트에는 이미 문자 검사가 있었다. `gate4_cjk_isolation.mjs` 가
 * 쓰면 안 되는 글자를 적어둔 목록이고, 처음 52자였다가 165자로 넓혔다.
 * 넓힌 직후 그 목록이 zh-TW 에서 간체 33자를 찾아냈으므로, 목록을 넓히는
 * 일이 효과가 있다는 인상을 준다.
 *
 * 그 인상이 틀렸다. 165자짜리 목록이 초록인 상태에서 실제로는
 *
 *   ja    간체 39종 490회   确 134 · 补 97 · 连 55 · 锁 42 · 时 32 …
 *   zh-TW 간체  4종  23회   鳍 11 · 齐 6 · 网 5 · 闭 1
 *
 * 가 남아 있었다. 165 를 1650 으로 늘려도 같은 종류의 실패가 남는다.
 * 금지 목록은 완성될 수 없고, 완성되지 않았다는 사실을 목록 자신은 알 수
 * 없다. 초록이 "이 글자들이 없다" 는 뜻이지 "나쁜 글자가 없다" 는 뜻이
 * 아닌데, 읽는 사람은 후자로 읽는다.
 *
 * 그래서 방향을 뒤집은 검사 둘을 둔다. 둘 다 필요하다.
 *
 *   검사 1 · 자기모순  (근거가 데이터에 있다. 틀릴 수 없다)
 *     한 로케일의 말뭉치 안에 어떤 대응쌍의 양쪽이 모두 나타나면, 그 로케일이
 *     스스로 어느 형태를 쓰는지 증언한 것이다. 어느 쪽이 옳은지 내가 적어줄
 *     필요가 없다. 일본어의 数·内·独 처럼 간체와 모양이 같은 신자체를 오탐하지
 *     않는다 — 한쪽만 나타나면 판정하지 않기 때문이다.
 *     이 검사는 건전하지만 완전하지 않다. 올바른 형태가 말뭉치에 아예 없으면
 *     (ja 에서 確 가 0회이고 确 가 134회였던 상태) 침묵한다. 실제로 침묵했다.
 *
 *   검사 2 · 사용 목록  (완전하다. 새 글자를 반드시 검토하게 만든다)
 *     지금 쓰이는 한자를 전부 적어둔 스냅샷과 대조한다. 목록 밖의 글자가
 *     들어오면 막는다. 금지 목록과 반대로 이쪽은 구성상 완전하다 — 앱의 모든
 *     문자열에서 생성했으므로 빠진 글자가 없다.
 *
 * 검사 2 의 목록은 사람이 타이핑한 것이 아니라 앱에서 생성한 것이고, 목적이
 * 값의 확인이 아니라 변화의 감지다. 그래서 "검사가 자기 옆에 베껴 적은 목록은
 * 검사가 아니다" 라는 규칙에 어긋나지 않는다. 다만 조건이 하나 붙는다:
 * 실패했을 때 습관적으로 재생성하면 이 장치는 아무것도 막지 않는다.
 * 재생성은 새 문안을 넣어 정당한 새 글자가 생겼을 때만이고, 늘어난 글자를
 * 커밋 메시지에 적는다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOCALES } from '../../lib/locales.js';
import { hanLocales, inventory, observedPairs } from '../fixtures/build_han_inventory.js';

/**
 * 검사 대상은 목록이 아니라 데이터가 말해주는 것이다 — 말뭉치에 한자가 있는
 * 로케일. 여기에 `['ja','zh-CN','zh-TW']` 를 적어두면 앱이 로케일을 늘릴 때
 * 이 게이트가 조용히 새 로케일을 빼먹는다. 게이트 2-17 이 그 줄을 실제로
 * 잡아냈고, 그래서 유도하는 형태로 바꿨다.
 */
const HAN_LOCALES = hanLocales(LOCALES);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const FIXTURE = path.join(HERE, '../fixtures/cjk_han_inventory.json');

console.log('====================================================');
console.log('🧪 CJK SCRIPT PURITY — 간체·번체·신자체가 섞이지 않는다');
console.log('====================================================');

const errors = [];

if (!fs.existsSync(FIXTURE)) {
  console.error(`\n🚨 사용 목록이 없다: ${path.relative(ROOT, FIXTURE)}`);
  console.error('   node scripts/tests/fixtures/build_han_inventory.js 로 만든다.');
  process.exit(1);
}
const pinned = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));

// 목록을 만든 스크립트와 로케일 집합이 어긋나면 둘 중 하나가 낡았다.
const pinnedLocales = Object.keys(pinned.locales).sort();
if (pinnedLocales.join(',') !== [...HAN_LOCALES].sort().join(',')) {
  errors.push(
    `사용 목록의 로케일 ${pinnedLocales.join(',')} 과 검사 대상 ${HAN_LOCALES.join(',')} 이 다르다 — ` +
      `목록을 다시 만들어야 한다`,
  );
}

// ── 검사 1 · 자기모순 ────────────────────────────────────────────────────
const pairs = observedPairs();
console.log(`\n▶ 검사 1 · 자기모순   앱 데이터에서 관찰한 간체↔번체 대응 ${pairs.length}쌍`);

for (const loc of HAN_LOCALES) {
  const inv = inventory(loc);
  const n = (ch) => inv.get(ch)?.n || 0;
  let found = 0;
  for (const [simp, trad] of pairs) {
    if (!n(simp) || !n(trad)) continue;
    found++;
    // zh-CN 은 간체가 옳고, ja 와 zh-TW 는 번체·신자체 쪽이 옳다.
    const wrong = loc === 'zh-CN' ? trad : simp;
    const right = loc === 'zh-CN' ? simp : trad;
    const where = [...(inv.get(wrong)?.where || [])].slice(0, 3).join(', ');
    errors.push(
      `[${loc}] 「${wrong}」 ${n(wrong)}회 — 이 로케일은 같은 글자를 「${right}」 로 ${n(right)}회 쓴다. ` +
        `두 형태가 함께 있다는 것은 한쪽이 변환에서 빠졌다는 뜻이다. ${where}`,
    );
  }
  console.log(`  ${found ? '❌' : '✅'} ${loc.padEnd(6)} 양쪽 형태가 함께 쓰인 쌍 ${found}개`);
}

// ── 검사 2 · 사용 목록 ───────────────────────────────────────────────────
console.log('\n▶ 검사 2 · 사용 목록   목록 밖의 한자가 들어왔는지');

for (const loc of HAN_LOCALES) {
  const inv = inventory(loc);
  const allowed = new Set(pinned.locales[loc] || '');
  const added = [...inv.keys()].filter((ch) => !allowed.has(ch));
  const removed = [...allowed].filter((ch) => !inv.has(ch));

  if (added.length) {
    const detail = added
      .map((ch) => `${ch}×${inv.get(ch).n} (${[...inv.get(ch).where][0]})`)
      .join('  ');
    errors.push(
      `[${loc}] 목록에 없는 한자 ${added.length}종: ${detail}\n` +
        `      새 문안을 넣어 정당하게 늘어난 글자라면 ` +
        `node scripts/tests/fixtures/build_han_inventory.js 를 돌리고 늘어난 글자를 커밋 메시지에 적는다. ` +
        `그게 아니라면 다른 언어의 글자가 섞여 들어온 것이다.`,
    );
  }
  // 글자가 줄어드는 것은 문안을 다듬으면 늘 일어난다. 막을 일이 아니라 알릴 일이다.
  const note = removed.length ? `  (더 이상 안 쓰는 글자 ${removed.length}종 — 문제는 아니다)` : '';
  console.log(`  ${added.length ? '❌' : '✅'} ${loc.padEnd(6)} 쓰는 한자 ${inv.size}종 · 목록 밖 ${added.length}종${note}`);
}

// ── 검사 3 · ko 에는 한자가 없다 ─────────────────────────────────────────
// 한국어 UI 는 한자를 쓰지 않는다. 한 글자라도 나오면 중국어·일본어 문자열이
// 잘못된 칸에 들어간 것이고, 이건 목록이 필요 없는 판정이다.
const koInv = inventory('ko');
console.log(`\n▶ 검사 3 · ko 에 한자   ${koInv.size === 0 ? '✅ 없다' : `❌ ${koInv.size}종`}`);
if (koInv.size) {
  const detail = [...koInv].slice(0, 20).map(([ch, e]) => `${ch}×${e.n} (${[...e.where][0]})`).join('  ');
  errors.push(`[ko] 한국어 문자열에 한자 ${koInv.size}종: ${detail}`);
}

// ── 결과 ────────────────────────────────────────────────────────────────
console.log('\n----------------------------------------------------');
if (errors.length) {
  console.error('🚨 문자 체계가 섞였다:');
  errors.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log('🎉 세 로케일 모두 자기 문자 체계만 쓴다 (목록 밖 글자 없음)');
