import { ALL_PRACTICE_MISSIONS } from '../src/data/academy/practice/index.js';

for (const [stratId, missions] of Object.entries(ALL_PRACTICE_MISSIONS)) {
  missions.forEach((m, idx) => {
    console.log('[' + stratId + ' #' + (idx + 1) + '] ID: ' + m.id + ' | CorrectVal: ' + m.correctVal);
    console.log('  KO: ' + m.guide?.ko);
    console.log('  JA: ' + m.guide?.ja);
  });
}
