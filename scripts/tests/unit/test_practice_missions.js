import { ALL_PRACTICE_MISSIONS } from '../../../src/data/academy/practice/index.js';
import { ACADEMY_STAGES } from '../../../src/data/academyStrategies.js';
import { LOCALES } from '../../lib/locales.js';

console.log('====================================================');
console.log('🧪 ACADEMY INTERACTIVE PRACTICE HARNESS (64 MISSIONS)');
console.log('====================================================');

let totalStrategies = 0;
let totalMissions = 0;
let errors = [];

// 지금 저장소에 실제로 존재하는 수. 아래에서 단언한다.
// 늘어나면 이 숫자를 같이 올리고, 줄었다면 왜 줄었는지 먼저 확인할 것.
const EXPECTED_STRATEGIES = 32;
const EXPECTED_MISSIONS = 64;

/**
 * 한 자리 숫자를 감싼 대괄호만 고른다. 후보 묶음은 제외한다.
 *
 * `[3,8]` 은 은닉쌍의 후보 두 개이고 `[2,5,8]` 은 삼중수다. 그것들은 정답이나
 * 소거값을 가리키는 말이 아니므로 이 검사의 대상이 아니다. 뒤따르는 쉼표나
 * 숫자를 부정형 전방탐색으로 걸러 `[3]` 과 `[3,8]` 을 구분한다.
 */
const SINGLE_BRACKETED_DIGIT = /\[(\d)\](?![\s]*[,0-9])/g;

ACADEMY_STAGES.forEach(stage => {
  console.log(`\n▶ Stage: ${stage.id}`);
  stage.strategies.forEach(strat => {
    totalStrategies++;
    const missions = ALL_PRACTICE_MISSIONS[strat.id];
    if (!missions || missions.length < 2) {
      errors.push(`Strategy '${strat.id}' is missing missions! Found: ${missions ? missions.length : 0}`);
      console.log(`  ❌ [FAIL] ${strat.id}: Missing 2 missions`);
      return;
    }

    missions.forEach((m) => {
      totalMissions++;
      if (m.targetIndex === undefined || m.targetIndex < 0 || m.targetIndex >= m.cells.length) {
        errors.push(`[${m.id}] Invalid targetIndex: ${m.targetIndex} in cells length ${m.cells.length}`);
      }
      if (!m.correctVal || m.correctVal < 1 || m.correctVal > 9) {
        errors.push(`[${m.id}] Invalid correctVal: ${m.correctVal}`);
      }

      // 문장이 말해도 되는 숫자를, 화면이 실제로 그리는 칸에서 끌어낸다.
      // 이 두 줄이 아래 제목 검사의 근거 전부다. 여기에 숫자를 적지 않는 것이
      // 요점이다 — 적어두면 데이터가 바뀔 때 같이 낡는다.
      const targetCell = m.cells?.[m.targetIndex] || {};
      const eliminated = targetCell.eliminatedNotes || [];
      const allowed = new Set([m.correctVal, ...eliminated]);

      /** field → lang → 그 문장이 말한 한 자리 숫자들. 언어 간 대조에 쓴다. */
      const saidBy = {};

      // Every language the app ships, read from the app — not a list written here.
      //
      // This used to be ['ko','en','ja','zh','es'] and it passed for months while
      // two shipped languages had no practice text at all. `zh` and `es` exist in
      // this data but the app never asks for them: the selector offers `zh-CN`,
      // `zh-TW` and `es-ES`. So the check was verifying keys nobody reads, and the
      // keys players actually hit were missing and falling back to English.
      LOCALES.forEach(lang => {
        const titleText = m.title?.[lang];
        const guideText = m.guide?.[lang];
        if (!titleText) errors.push(`[${m.id}] Missing title for lang: ${lang}`);
        if (!guideText) errors.push(`[${m.id}] Missing guide for lang: ${lang}`);

        if (guideText) {
          // In stage 1 beginner quiz missions (Full House, Last Free Cell), the answer is deliberately asked as a quiz riddle
          const isQuizQuestion = m.id.startsWith('full_house') || m.id.startsWith('last_free_cell');
          if (!isQuizQuestion) {
            const hasVal = guideText.includes(String(m.correctVal)) || guideText.includes(`[${m.correctVal}]`);
            if (!hasVal) {
              errors.push(`[${m.id}] Lang '${lang}' guide mentions wrong number! Expected correctVal [${m.correctVal}], got: "${guideText}"`);
            }
          }
        }

        // 제목도 검사한다. 여기가 비어 있었고, 버그는 정확히 여기 있었다.
        //
        // 위의 안내문 검사는 오래 초록이었다. 그동안 34개 미션의 제목이 엉뚱한
        // 숫자를 말하고 있었다 — "[9] 확정" 인데 정답은 6 인 식으로, 13개 언어
        // 전부. 번역 잘못이 아니라 한국어 원본이 틀렸고 12개 언어가 충실히
        // 옮긴 것이다. 게이트가 두 필드 중 한쪽만 봤기 때문에 안 걸렸다.
        //
        // 안내문 검사 자체도 약하다. `includes(String(correctVal))` 는 문자열
        // 어디에든 그 숫자가 있으면 통과한다 — correctVal 이 2 일 때
        // "2개 가로줄에서" 의 2 로도 통과한다. 존재를 보고 일치를 안 본 것이다.
        //
        // 그래서 아래 규칙은 값을 이 파일에 적어두지 않고 데이터에서 끌어낸다.
        // 제목·안내문이 대괄호로 감싼 한 자리 숫자는 둘 중 하나여야 한다:
        //   · correctVal                                  플레이어가 넣을 답
        //   · cells[targetIndex].eliminatedNotes 의 값     기법이 지우는 후보
        // 제목은 이 둘 중 하나를 말하거나, 아무 숫자도 말하지 않는다.
        // 셋째 숫자가 나오면 그 문장은 화면의 퍼즐과 다른 말을 하고 있다.
        [
          ['title', titleText],
          ['guide', guideText],
        ].forEach(([field, text]) => {
          if (!text) return;
          for (const hit of text.matchAll(SINGLE_BRACKETED_DIGIT)) {
            const n = Number(hit[1]);
            if (allowed.has(n)) continue;
            errors.push(
              `[${m.id}] Lang '${lang}' ${field} claims [${n}] but the cell allows ` +
                `{${[...allowed].join(', ')}} (correctVal ${m.correctVal}` +
                `${eliminated.length ? `, eliminates ${eliminated.join(',')}` : ''}): "${text}"`,
            );
          }
          (saidBy[field] ||= {})[lang] = new Set(
            [...text.matchAll(SINGLE_BRACKETED_DIGIT)].map((h) => h[1]),
          );
        });
      });

      // 위 검사만으로는 부족하다. 허용 집합은 두 값을 받아들이므로 정답과
      // 소거값을 맞바꾼 제목은 그대로 통과한다 — 변이 테스트에서 실제로
      // SURVIVED 가 나왔다. 그 구멍을 언어 간 대조로 막는다.
      //
      // 13개 언어는 같은 퍼즐 하나를 설명한다. 그러니 숫자를 말하는 언어들은
      // 같은 숫자를 말해야 한다. 한 언어만 다른 숫자를 말하면 그 언어가 틀렸다.
      // 숫자를 아예 말하지 않는 제목은 주장을 하지 않은 것이므로 대조에서 뺀다
      // (실제로 "X-Wing Corner Lock" 처럼 숫자 없는 제목이 146곳 있다).
      //
      // 두 검사는 서로 다른 것을 잡는다. 같이 있어야 한다:
      //   허용 집합    13개 언어가 다 같이 틀린 경우 (이번에 나온 34개 미션)
      //   언어 간 대조 한 언어만 벗어난 경우 (번역 중 숫자가 어긋나는 경우)
      Object.entries(saidBy).forEach(([field, byLang]) => {
        const groups = new Map();
        for (const [lang, digits] of Object.entries(byLang)) {
          if (!digits.size) continue;
          const key = [...digits].sort().join(',');
          (groups.get(key) || groups.set(key, []).get(key)).push(lang);
        }
        if (groups.size <= 1) return;
        const shown = [...groups].map(([k, ls]) => `[${k}] in ${ls.join(',')}`).join(' vs ');
        errors.push(
          `[${m.id}] ${field} names different numbers in different languages — ${shown}. ` +
            `All thirteen describe one puzzle, so one of these is a translation that drifted.`,
        );
      });
    });

    console.log(`  ✅ [PASS] ${strat.id} (2 Missions: ${missions[0].id}, ${missions[1].id})`);
  });
});

console.log('\n----------------------------------------------------');
console.log(`Total Strategies Checked: ${totalStrategies} / ${EXPECTED_STRATEGIES}`);
console.log(`Total Missions Verified:  ${totalMissions} / ${EXPECTED_MISSIONS}`);

// 개수를 실제로 단언한다. 예전에는 27 과 54 를 화면에 찍기만 했다.
//
// 변이 테스트에서 stage5 를 통째로 지웠더니 "27 / 27", "54 / 54" 가 찍히고
// "PERFECT! ALL 54 INTERACTIVE MISSIONS ARE 100% VALIDATED!" 로 통과했다.
// 기대값이 낡아서(실제는 32/64) 부서진 상태와 정확히 맞아떨어졌기 때문이다.
// 표시만 하는 숫자는 검사가 아니고, 낡은 기대값은 삭제를 보상한다.
if (totalStrategies !== EXPECTED_STRATEGIES) {
  errors.push(`전략 수가 ${EXPECTED_STRATEGIES} 이어야 하는데 ${totalStrategies} 개다 — 스테이지나 전략이 사라졌는지 확인`);
}
if (totalMissions !== EXPECTED_MISSIONS) {
  errors.push(`미션 수가 ${EXPECTED_MISSIONS} 이어야 하는데 ${totalMissions} 개다`);
}

if (errors.length > 0) {
  console.error('\n🚨 ERRORS DETECTED:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log(`\n🎉 PERFECT! ALL ${totalMissions} INTERACTIVE MISSIONS ARE 100% VALIDATED!`);
}
