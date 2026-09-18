/**
 * build_han_inventory.js
 * CJK 로케일이 실제로 쓰는 한자 목록을 만들어 저장한다.
 *
 * ── 왜 이런 모양인가 ─────────────────────────────────────────────────────
 * 앞서 이 프로젝트의 문자 검사는 "쓰면 안 되는 글자" 목록이었다. 처음 52자,
 * 넓혀서 165자. 그래도 zh-TW 의 网·鳍·齐·闭 와 ja 의 确·补 를 놓쳤고,
 * 1650자로 늘려도 같은 종류의 실패가 남는다. 금지 목록은 완성될 수 없다 —
 * 목록에 없는 글자가 항상 있고, 없다는 사실을 목록 자신은 알 수 없다.
 *
 * 방향을 뒤집는다. 지금 실제로 쓰이는 글자를 전부 적어두고, 그 밖의 글자가
 * 들어오면 막는다.
 *
 * ── 「구성상 완전하다」 고 적혀 있던 자리 ──────────────────────────────────
 * 2026-09-11 에 이 자리에는 이렇게 적혀 있었다.
 *
 *     이 목록은 구성상 완전하다 — 앱의 모든 문자열을 읽어서 만들었으므로
 *     빠진 글자가 없고, 새 글자는 예외 없이 검토를 거친다.
 *
 * 완전하지 않았다. 아카데미 쪽 수집이 소스 텍스트에 `"ja":"…"` 정규식을
 * 거는 방식이었고, `"ja": "…"` (콜론 뒤 공백) 을 놓쳤다. `stage1Diagrams.js`
 * 전체가 그 형식이다 — 아카데미 380블록 중 10블록이 수집 밖에 있었다.
 * 그 파일의 ja 문자열에서 確定 를 간체 确定 로 바꾸고 게이트 2-19 를 돌렸더니
 * 통과했다. 수집기가 그 글자를 본 적이 없으니 "목록 밖의 글자" 도 될 수 없다.
 *
 * 주석이 틀렸다는 것보다 나쁜 것은, 그 주석이 근거로 인용됐다는 점이다.
 * 문서가 "CJK 전수 검사 완료" 로 옮겨 적은 출처가 여기였다.
 *
 * 그래서 정규식을 공백 허용으로 넓히지 않았다. 그것은 이번 형식만 덮고,
 * 따옴표 종류·escape·템플릿 리터럴·줄바꿈이 다음에 같은 일을 한다. 대신
 * 아카데미 축은 `academy_corpus.js` 가 **모듈이 실제로 내보내는 객체**를
 * 걸어서 만든다. 문법이 어떻게 적혀 있든 결과가 같고, 게이트 2-16 과 2-19 가
 * 같은 말뭉치를 본다.
 *
 * 지금 이 목록이 덮는 범위는 정확히 이것이다: **아카데미 export 객체 전체 +
 * `src/i18n/locales/<loc>/` 파일 텍스트.** 그 밖(예: `dictionaries.js` 의
 * `nativeName`)은 포함하지 않는다. "앱의 모든 문자열" 이 아니다.
 *
 * 이것은 "검사가 읽어야 할 값을 손으로 베껴 적은 목록" 이 아니다. 사람이
 * 타이핑하지 않고 앱에서 생성하며, 목적이 값의 확인이 아니라 변화의 감지다.
 * 그 구분이 이 파일이 규칙을 어기지 않는 이유다.
 *
 * ── 목록이 언제 바뀌어도 되는가 ───────────────────────────────────────────
 * 새 문안을 넣어 정당한 새 글자가 생겼을 때만. 그때는 이 스크립트를 다시
 * 돌리고, 늘어난 글자를 커밋 메시지에 적는다. 게이트가 실패했다고 해서
 * 습관적으로 다시 돌리면 이 장치는 아무것도 막지 않는다.
 *
 * 실행: node scripts/tests/fixtures/build_han_inventory.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { academyCorpus } from './academy_corpus.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const SRC = path.join(ROOT, 'src');
const I18N = path.join(SRC, 'i18n/locales');
const OUT = path.join(HERE, 'cjk_han_inventory.json');

const HAN = /\p{Script=Han}/u;

/**
 * 한자를 쓰는 로케일이 무엇인지 적어두지 않고 알아낸다.
 *
 * 처음에는 `['ja', 'zh-CN', 'zh-TW']` 라고 적었다. 게이트 2-17 이 그 줄을
 * 즉시 잡았고, 옳은 지적이었다 — 그것은 로케일 목록의 사본이고, 앱이
 * zh-HK 같은 로케일을 추가하면 조용히 낡는다. 이 게이트가 막으려는 바로
 * 그 실패를, 이 게이트를 쓰려고 만든 파일이 저지른 것이다.
 *
 * 판정 근거는 데이터에 있다: 말뭉치에 한자가 들어 있는 로케일이 한자를
 * 쓰는 로케일이다. 목록이 필요 없다.
 *
 * `ko` 는 여기서 빠진다. 한국어 UI 는 한자를 쓰지 않으므로 한 글자라도
 * 나오면 그 자체가 오염이고, 검사 대상이 아니라 판정 대상이다. 만약 이
 * 함수로 ko 를 판정하면 오염된 순간 ko 가 "한자를 쓰는 로케일" 로 편입되어
 * 오염이 스스로를 정당화한다.
 */
export function hanLocales(allLocales) {
  return allLocales.filter((loc) => loc !== 'ko' && inventory(loc).size > 0);
}

export function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(js|jsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

/**
 * 이 앱은 번역문을 두 가지 방식으로 저장한다. 둘 다 읽어야 한다.
 *
 *   A) 아카데미:  {ko:"…", ja:"…"} 블록 — 항목이 먼저, 로케일이 나중
 *   B) i18n:      src/i18n/locales/<loc>/*.js — 로케일이 먼저, 키가 나중
 *
 * 처음 이 조사를 할 때 A 만 읽었고, ja 의 한자가 245종이라고 셌다. 실제로는
 * 518종이었다. 더 나쁜 것은 올바른 일본어 형태(確·補·連·鎖)가 전부 B 쪽에만
 * 있었다는 점이다 — 그래서 "같은 로케일 안에 두 형태가 함께 있는가" 라는
 * 검사가 0건을 냈다. 축이 두 개인 저장 구조에서 한 축만 읽으면 답이 아니라
 * 침묵이 나온다.
 */
export function inventory(loc) {
  const counts = new Map();
  const bump = (ch, where) => {
    const e = counts.get(ch) || { n: 0, where: new Set() };
    e.n++;
    e.where.add(where);
    counts.set(ch, e);
  };

  // A) 아카데미 — export 객체에서. 소스에 어떻게 적혀 있든 같은 결과가 나온다.
  const { dictionaries } = academyCorpus();
  for (const [key, str] of Object.entries(dictionaries[loc] || {})) {
    for (const ch of str) if (HAN.test(ch)) bump(ch, key);
  }

  // B) i18n — 파일 텍스트에서. 이쪽은 축이 이미 `로케일/키` 라 파일 하나가
  //    통째로 한 로케일이고, 문자열만 따로 뽑을 필요가 없다.
  for (const f of walk(path.join(I18N, loc))) {
    // 주석은 한국어 설명일 수 있다. 번역문만 센다.
    const text = fs
      .readFileSync(f, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    for (const ch of text) if (HAN.test(ch)) bump(ch, path.relative(ROOT, f));
  }
  return counts;
}

/**
 * 간체↔번체 대응을 앱 자신의 데이터에서 관찰한다.
 *
 * zh-CN 과 zh-TW 는 같은 내용을 두 표기로 적은 것이다. 같은 **키**의 두
 * 문자열이 길이가 같으면 자리마다 맞대어 보고, 다른 자리를 관찰된 쌍으로
 * 삼는다. 대응표를 어디서 가져오지 않고 앱에서 얻는 것이 요점이다.
 *
 * 전에는 「같은 줄에 나란히 있는 두 문자열」 을 맞대었다. 그러면 한 줄에
 * 우연히 같이 있는 무관한 문자열도 짝이 된다 — 임의의 甲乙 / 丙丁 를 두 줄
 * 넣으면 甲↔丙, 乙↔丁 가 대응쌍으로 승격됐다. 줄은 두 문자열이 같은 내용의
 * 두 표기라는 근거가 아니다. 키가 그 근거다. 그래서 키로 맞댄다.
 *
 * 주석에는 「한 자리만 다르면」 이라고 적혀 있었지만 코드는 자리 수를 재지
 * 않았다. 재보니 자리 수를 1로 제한하면 114쌍이 7쌍으로 줄어 검사 1이
 * 무력해진다. 키로 맞대는 것만으로 위 오탐이 사라지므로 제한하지 않는다 —
 * 대신 주석을 코드에 맞춘다. (키 기준으로 바꾼 뒤에도 관찰된 쌍은 114개로
 * 줄 기준과 같았다. 잃은 것도 얻은 것도 없다.)
 *
 * 한 번만 관찰된 쌍은 오타이거나 실제로 다른 낱말일 수 있어 버린다.
 *
 * 그래도 자리 맞대기가 잡아내지 못하는 것이 하나 있다. 같은 자리에 있는 두
 * 글자가 **같은 글자의 두 표기가 아니라 서로 다른 낱말**인 경우다. 스도쿠에서
 * 실제로 그렇다: 중국 본토는 가로줄을 「行」, 세로줄을 「列」 이라 하고 대만은
 * 그 둘이 반대다. 그래서 같은 키의 zh-CN/zh-TW 가 이 자리에서 갈리고, 검사 1은
 * 「한 로케일이 두 형태를 같이 쓴다」 며 두 글자가 함께 나오는 문구를 막는다.
 * 변환 누락이 아니라 번역이 옳은 경우이므로 이 짝만 제외한다. 다른 짝을 여기에
 * 추가할 때는 두 글자가 정말 다른 낱말인지 먼저 확인할 것 — 이 목록은 검사를
 * 조용히 시키는 곳이 아니다. 「和」 와 「與」 도 같은 이유로 들어 있다 — 둘 다
 * 양쪽 표기에 실재하는 낱말이고, 번역이 서로 다른 접속사를 고른 것뿐이다.
 */
const NOT_VARIANTS = new Set(['行|列', '列|行', '和|與', '與|和']);

export function observedPairs() {
  const { dictionaries } = academyCorpus();
  const cnAll = dictionaries['zh-CN'] || {};
  const twAll = dictionaries['zh-TW'] || {};
  const seen = new Map();

  for (const key of Object.keys(cnAll)) {
    const cn = cnAll[key];
    const tw = twAll[key];
    if (typeof cn !== 'string' || typeof tw !== 'string') continue;
    if (cn.length !== tw.length) continue;
    for (let i = 0; i < cn.length; i++) {
      const [s, t] = [cn[i], tw[i]];
      if (s === t || !HAN.test(s) || !HAN.test(t)) continue;
      const k = s + '|' + t;
      if (NOT_VARIANTS.has(k)) continue;
      seen.set(k, (seen.get(k) || 0) + 1);
    }
  }
  return [...seen].filter(([, n]) => n >= 2).map(([k]) => k.split('|'));
}

// ── 생성 ────────────────────────────────────────────────────────────────
if (import.meta.url === 'file:///' + process.argv[1].replace(/\\/g, '/')) {
  const { LOCALES } = await import('../../lib/locales.js');
  const data = { generatedBy: 'scripts/tests/fixtures/build_han_inventory.js', locales: {} };
  for (const loc of hanLocales(LOCALES)) {
    const inv = inventory(loc);
    data.locales[loc] = [...inv.keys()].sort().join('');
    console.log(`${loc.padEnd(6)} 고유 한자 ${String(inv.size).padStart(4)}종`);
  }
  data.observedPairs = observedPairs().map(([s, t]) => s + t).sort().join(' ');
  console.log(`관찰된 간체↔번체 대응 ${data.observedPairs.split(' ').length}쌍`);
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`\n${path.relative(ROOT, OUT)} 에 저장했다.`);
}
