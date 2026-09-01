import { writeFileSync } from 'fs';

import { STAGE1_PRACTICE } from '../src/data/academy/practice/stage1Practice.js';
import { STAGE2_PAIRS_PRACTICE } from '../src/data/academy/practice/stage2PairsPractice.js';
import { STAGE2_TUPLES_PRACTICE } from '../src/data/academy/practice/stage2TuplesPractice.js';
import { STAGE3_PRACTICE } from '../src/data/academy/practice/stage3Practice.js';
import { STAGE4_FISH_PRACTICE } from '../src/data/academy/practice/stage4FishPractice.js';
import { STAGE4_CHAINS_PRACTICE } from '../src/data/academy/practice/stage4ChainsPractice.js';
import { STAGE5_PRACTICE } from '../src/data/academy/practice/stage5Practice.js';

function formatCompact(obj) {
  let str = '{\n';
  const entries = Object.entries(obj);
  entries.forEach(([stratKey, missions], idx) => {
    str += `  '${stratKey}': [\n`;
    missions.forEach((m, mIdx) => {
      str += '    {\n';
      str += `      id: '${m.id}',\n`;
      str += `      title: ${JSON.stringify(m.title)},\n`;
      str += `      guide: ${JSON.stringify(m.guide)},\n`;
      str += `      layoutType: '${m.layoutType}',\n`;
      str += `      targetIndex: ${m.targetIndex},\n`;
      str += `      correctVal: ${m.correctVal},\n`;
      str += '      cells: [\n';
      const cellRows = [];
      const cells = m.cells || [];
      const chunkSize = m.layoutType === 'grid4x4' ? 4 : (m.layoutType === 'box3x3' ? 3 : 9);
      for (let i = 0; i < cells.length; i += chunkSize) {
        const chunk = cells.slice(i, i + chunkSize);
        cellRows.push('        ' + chunk.map(c => JSON.stringify(c)).join(', '));
      }
      str += cellRows.join(',\n') + '\n';
      str += '      ]\n';
      str += '    }' + (mIdx < missions.length - 1 ? ',\n' : '\n');
    });
    str += '  ]' + (idx < entries.length - 1 ? ',\n' : '\n');
  });
  str += '};\n';
  return str;
}

function writeStageFile(path, varName, obj, comment) {
  const code = `/**\n * ${comment}\n */\n\nexport const ${varName} = ${formatCompact(obj)};\n`;
  writeFileSync(path, code, 'utf8');
  console.log(`✅ Saved compact: ${path}`);
}

writeStageFile('src/data/academy/practice/stage1Practice.js', 'STAGE1_PRACTICE', STAGE1_PRACTICE, 'Stage 1 Practice Missions (Verified)');
writeStageFile('src/data/academy/practice/stage2PairsPractice.js', 'STAGE2_PAIRS_PRACTICE', STAGE2_PAIRS_PRACTICE, 'Stage 2 Pairs Practice (Verified)');
writeStageFile('src/data/academy/practice/stage2TuplesPractice.js', 'STAGE2_TUPLES_PRACTICE', STAGE2_TUPLES_PRACTICE, 'Stage 2 Tuples Practice (Verified)');
writeStageFile('src/data/academy/practice/stage3Practice.js', 'STAGE3_PRACTICE', STAGE3_PRACTICE, 'Stage 3 Practice (Verified)');
writeStageFile('src/data/academy/practice/stage4FishPractice.js', 'STAGE4_FISH_PRACTICE', STAGE4_FISH_PRACTICE, 'Stage 4 Fish Practice (Verified)');
writeStageFile('src/data/academy/practice/stage4ChainsPractice.js', 'STAGE4_CHAINS_PRACTICE', STAGE4_CHAINS_PRACTICE, 'Stage 4 Chains Practice (Verified)');
writeStageFile('src/data/academy/practice/stage5Practice.js', 'STAGE5_PRACTICE', STAGE5_PRACTICE, 'Stage 5 Practice (Verified)');

console.log('🎉 Compact formatting complete!');
