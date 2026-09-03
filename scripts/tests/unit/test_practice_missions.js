import { ALL_PRACTICE_MISSIONS } from '../../../src/data/academy/practice/index.js';
import { ACADEMY_STAGES } from '../../../src/data/academyStrategies.js';

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

      const langs = ['ko', 'en', 'ja', 'zh', 'es'];
      langs.forEach(lang => {
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
