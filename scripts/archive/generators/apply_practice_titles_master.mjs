import fs from 'fs';
import path from 'path';
import { MASTER_PRACTICE_TITLES } from './practice_titles_dictionary.mjs';

const practiceFiles = [
  'stage1Practice.js', 'stage2PairsPractice.js', 'stage2TuplesPractice.js',
  'stage3WingsPractice.js', 'stage3ChainsPractice.js', 'stage4FishPractice.js',
  'stage4ChainsPractice.js', 'stage5Practice.js'
];

for (const pf of practiceFiles) {
  const full = path.join('src/data/academy/practice', pf);
  const mod = await import('file://' + path.resolve(full));
  const exportKey = Object.keys(mod)[0];
  const data = mod[exportKey];

  for (const [stratId, missions] of Object.entries(data)) {
    for (const m of missions) {
      if (MASTER_PRACTICE_TITLES[m.id]) {
        m.title = MASTER_PRACTICE_TITLES[m.id];
      } else {
        console.warn('⚠️ Missing master title for mission ID:', m.id);
      }
    }
  }

  // Re-serialize the file preserving the clean format
  const outCode = `/**
 * ${pf}
 * Master 13-Language Translations for Academy Practice Missions
 */

export const ${exportKey} = ${JSON.stringify(data, null, 2)};
`;

  fs.writeFileSync(full, outCode, 'utf8');
  console.log(`✅ Updated all practice titles in ${pf}`);
}
