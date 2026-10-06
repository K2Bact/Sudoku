import fs from 'fs';
import path from 'path';

export function serializePracticeData(data) {
  let lines = ['{'];
  const stratKeys = Object.keys(data);

  stratKeys.forEach((stratKey, sIdx) => {
    const missions = data[stratKey];
    lines.push(`  '${stratKey}': [`);

    missions.forEach((m, mIdx) => {
      lines.push('    {');
      lines.push(`      id: ${JSON.stringify(m.id)},`);
      lines.push(`      title: ${JSON.stringify(m.title)},`);
      lines.push(`      guide: ${JSON.stringify(m.guide)},`);
      if (m.explanation) {
        lines.push(`      explanation: ${JSON.stringify(m.explanation)},`);
      }
      if (m.layoutType !== undefined) lines.push(`      layoutType: ${JSON.stringify(m.layoutType)},`);
      if (m.targetIndex !== undefined) lines.push(`      targetIndex: ${JSON.stringify(m.targetIndex)},`);
      if (m.correctVal !== undefined) lines.push(`      correctVal: ${JSON.stringify(m.correctVal)},`);
      if (m.cells !== undefined) {
        lines.push(`      cells: ${JSON.stringify(m.cells)}`);
      }
      const mComma = mIdx < missions.length - 1 ? ',' : '';
      lines.push(`    }${mComma}`);
    });

    const sComma = sIdx < stratKeys.length - 1 ? ',' : '';
    lines.push(`  ]${sComma}`);
  });

  lines.push('}');
  return lines.join('\n');
}

const practiceFiles = [
  { file: 'stage1Practice.js', exportKey: 'STAGE1_PRACTICE' },
  { file: 'stage2PairsPractice.js', exportKey: 'STAGE2_PAIRS_PRACTICE' },
  { file: 'stage2TuplesPractice.js', exportKey: 'STAGE2_TUPLES_PRACTICE' },
  { file: 'stage3WingsPractice.js', exportKey: 'STAGE3_WINGS_PRACTICE' },
  { file: 'stage3ChainsPractice.js', exportKey: 'STAGE3_CHAINS_PRACTICE' },
  { file: 'stage4FishPractice.js', exportKey: 'STAGE4_FISH_PRACTICE' },
  { file: 'stage4ChainsPractice.js', exportKey: 'STAGE4_CHAINS_PRACTICE' },
  { file: 'stage5Practice.js', exportKey: 'STAGE5_PRACTICE' }
];

for (const { file, exportKey } of practiceFiles) {
  const full = path.join('src/data/academy/practice', file);
  const mod = await import('file://' + path.resolve(full));
  const data = mod[exportKey] || mod[Object.keys(mod)[0]];

  const code = `/**
 * ${file}
 * Master 13-Language Translations for Academy Practice Missions
 */

export const ${exportKey} = ${serializePracticeData(data)};

export default ${exportKey};
`;

  const lineCount = code.split('\n').length;
  if (lineCount > 300) {
    console.error(`❌ ERROR: ${file} has ${lineCount} lines (exceeds 300 lines limit!)`);
  } else {
    fs.writeFileSync(full, code, 'utf8');
    console.log(`✅ Formatted ${file} (${lineCount} lines, well under 300 lines limit)`);
  }
}
