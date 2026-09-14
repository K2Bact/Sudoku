/**
 * academy_corpus.js
 * 아카데미 문자열을 `로케일 → 키 → 문자열` 로 펴서 돌려준다.
 *
 * ── 왜 모듈로 떼어냈나 ────────────────────────────────────────────────────
 * 아카데미는 번역문을 `항목 → 로케일` 축으로 저장하고, l10n 엔진은
 * `로케일 → 키` 축을 받는다. 뒤집는 일을 게이트 2-16 이 자기 안에서 하고
 * 있었고, 게이트 2-19 는 같은 데이터를 **소스 텍스트에 정규식을 걸어**
 * 따로 모았다. 같은 말뭉치를 두 방법으로 읽은 것이다.
 *
 * 그래서 둘이 갈라졌다. 2-19 의 정규식은 `"ja":"…"` 만 보았고
 * `"ja": "…"` (콜론 뒤 공백) 을 놓쳤다. `stage1Diagrams.js` 가 그 형식이다.
 * 그 파일의 ja 문자열에 간체 确 를 넣어도 2-19 가 통과하는 것을 확인했다 —
 * 수집기가 그 글자를 애초에 보지 못했기 때문이다. 「앱의 모든 문자열에서
 * 생성했으므로 구성상 완전하다」 는 주석이 그 상태로 파일에 적혀 있었다.
 *
 * 정규식을 공백 허용으로 넓히는 것은 이번 형식만 덮는다. 따옴표 종류,
 * escape, 템플릿 리터럴, 줄바꿈이 다음에 같은 일을 한다. 그래서 소스
 * 텍스트를 읽는 대신 **모듈이 실제로 내보내는 객체**를 읽는다. 문법이
 * 어떻게 적혀 있든 결과가 같고, 두 게이트가 같은 말뭉치를 본다.
 *
 * 이 파일은 값을 베껴 적지 않는다. 앱의 export 를 그대로 걸어 다닌다.
 */

import { ACADEMY_STAGES } from '../../../src/data/academyStrategies.js';
import { ALL_PRACTICE_MISSIONS } from '../../../src/data/academy/practice/index.js';
import { DIAGRAM_TRANSLATIONS } from '../../../src/data/academy/diagramTranslations.js';
import { LOCALES } from '../../lib/locales.js';

/**
 * `{ [locale]: { [dottedKey]: string } }` 와 블록 수를 돌려준다.
 *
 * 블록 = 로케일 하나당 문자열 하나씩 들어 있는 번역 객체 한 덩어리.
 * 키가 점으로 이어진 이름인 것은 실패 메시지에서 어느 문자열인지 바로
 * 찾기 위해서다 — 파일 이름보다 좁다.
 */
export function academyCorpus() {
  const dictionaries = Object.fromEntries(LOCALES.map((l) => [l, {}]));
  let blocks = 0;

  const put = (key, dict) => {
    if (!dict || typeof dict !== 'object') return;
    blocks++;
    for (const loc of LOCALES) {
      const v = dict[loc];
      if (typeof v === 'string') dictionaries[loc][key] = v;
    }
  };

  for (const stage of ACADEMY_STAGES) {
    for (const strat of stage.strategies) {
      put(`academy.${strat.id}.badge`, strat.badge);
      put(`academy.${strat.id}.title`, strat.title);
      put(`academy.${strat.id}.desc`, strat.desc);
    }
  }

  for (const [stratId, missions] of Object.entries(ALL_PRACTICE_MISSIONS)) {
    for (const m of missions) {
      put(`practice.${stratId}.${m.id}.title`, m.title);
      put(`practice.${stratId}.${m.id}.guide`, m.guide);
    }
  }

  for (const [type, entries] of Object.entries(DIAGRAM_TRANSLATIONS)) {
    for (const [key, dict] of Object.entries(entries)) {
      put(`diagram.${type}.${key}`, dict);
    }
  }

  return { dictionaries, blocks };
}
