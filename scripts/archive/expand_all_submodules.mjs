import fs from 'fs';
import path from 'path';
import { expandLangObject } from './translate_all_diagrams_and_practice.mjs';

// Custom compact serializer that prints { ko: "...", en: "...", ... } on a single line
function serializeCompact(data) {
  if (Array.isArray(data)) {
    return '[\n' + data.map(item => '      ' + serializeMission(item)).join(',\n') + '\n    ]';
  }
  
  // Object of strategies
  const entries = Object.entries(data).map(([key, val]) => {
    if (Array.isArray(val)) {
      return `  '${key}': [\n` + val.map(item => '    ' + serializeMission(item)).join(',\n') + '\n  ]';
    }
    // Dict of properties
    const props = Object.entries(val).map(([pKey, pVal]) => {
      return `    ${pKey}: ${JSON.stringify(pVal)}`;
    }).join(',\n');
    return `  '${key}': {\n${props}\n  }`;
  });

  return '{\n' + entries.join(',\n') + '\n}';
}

function serializeMission(m) {
  const parts = [];
  parts.push(`id: ${JSON.stringify(m.id)}`);
  parts.push(`title: ${JSON.stringify(m.title)}`);
  parts.push(`guide: ${JSON.stringify(m.guide)}`);
  if (m.explanation) parts.push(`explanation: ${JSON.stringify(m.explanation)}`);
  if (m.layoutType) parts.push(`layoutType: ${JSON.stringify(m.layoutType)}`);
  if (m.targetIndex !== undefined) parts.push(`targetIndex: ${m.targetIndex}`);
  if (m.correctVal !== undefined) parts.push(`correctVal: ${m.correctVal}`);
  if (m.cells) parts.push(`cells: ${JSON.stringify(m.cells)}`);
  return '{\n      ' + parts.join(',\n      ') + '\n    }';
}

// 1. Process diagram files
const diagramFiles = [
  'src/data/academy/diagrams/stage1Diagrams.js',
  'src/data/academy/diagrams/stage2PairsDiagrams.js',
  'src/data/academy/diagrams/stage2TuplesDiagrams.js',
  'src/data/academy/diagrams/stage3Diagrams.js',
  'src/data/academy/diagrams/stage4FishDiagrams.js',
  'src/data/academy/diagrams/stage4ChainsDiagrams.js',
  'src/data/academy/diagrams/stage5Diagrams.js'
];

for (const filePath of diagramFiles) {
  const mod = await import(`file://${path.resolve(filePath)}`);
  const exportKey = Object.keys(mod)[0];
  const data = mod[exportKey];

  const updatedData = {};
  for (const [strategyKey, stratDict] of Object.entries(data)) {
    updatedData[strategyKey] = {};
    for (const [propKey, langObj] of Object.entries(stratDict)) {
      updatedData[strategyKey][propKey] = expandLangObject(langObj);
    }
  }

  const content = `/**
 * ${path.basename(filePath)}
 * Master 13-Language Translations for Academy Diagrams (Clean Plain-Text Strings)
 */

export const ${exportKey} = ${serializeCompact(updatedData)};

export default ${exportKey};
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated diagram: ${filePath}`);
}

// 2. Process practice files
const practiceFiles = [
  'src/data/academy/practice/stage1Practice.js',
  'src/data/academy/practice/stage2PairsPractice.js',
  'src/data/academy/practice/stage2TuplesPractice.js',
  'src/data/academy/practice/stage3WingsPractice.js',
  'src/data/academy/practice/stage3ChainsPractice.js',
  'src/data/academy/practice/stage4FishPractice.js',
  'src/data/academy/practice/stage4ChainsPractice.js',
  'src/data/academy/practice/stage5Practice.js'
];

for (const filePath of practiceFiles) {
  const mod = await import(`file://${path.resolve(filePath)}`);
  const exportKey = Object.keys(mod)[0];
  const data = mod[exportKey];

  const updatedData = {};
  for (const [strategyKey, missions] of Object.entries(data)) {
    updatedData[strategyKey] = missions.map(m => ({
      ...m,
      title: expandLangObject(m.title),
      guide: expandLangObject(m.guide),
      explanation: m.explanation ? expandLangObject(m.explanation) : undefined
    }));
  }

  const content = `/**
 * ${path.basename(filePath)}
 * Master 13-Language Translations for Academy Practice Missions
 */

export const ${exportKey} = ${serializeCompact(updatedData)};

export default ${exportKey};
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated practice: ${filePath}`);
}
