import { ALL_PRACTICE_MISSIONS } from '../../../src/data/academy/practice/index.js';
import { ACADEMY_STAGES } from '../../../src/data/academyStrategies.js';

console.log('====================================================');
console.log('🧪 ACADEMY INTERACTIVE PRACTICE HARNESS (54 MISSIONS)');
console.log('====================================================');

let totalStrategies = 0;
let totalMissions = 0;
let errors = [];

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
console.log(`Total Strategies Checked: ${totalStrategies} / 27`);
console.log(`Total Missions Verified:  ${totalMissions} / 54`);

if (errors.length > 0) {
  console.error('\n🚨 ERRORS DETECTED:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log('\n🎉 PERFECT! ALL 54 INTERACTIVE MISSIONS ARE 100% VALIDATED!');
}
