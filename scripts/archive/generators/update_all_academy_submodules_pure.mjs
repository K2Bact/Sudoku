import fs from 'fs';
import path from 'path';
import { getFullMissionText } from './translate_practice_missions_pure.mjs';
import { translateTextToLang } from './sync_all_academy_pure_l10n.mjs';

function processLangObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const en = obj.en || '';
  const ko = obj.ko || '';
  const ja = obj.ja || '';
  const zh = obj.zh || obj['zh-TW'] || '';
  const es = obj.es || obj['es-ES'] || '';

  const res = {
    ko,
    en,
    ja,
    zh,
    'zh-CN': obj['zh-CN'] || zh,
    es
  };

  const targetLangs = ['de', 'fr', 'pt', 'it', 'ru', 'hi', 'ar'];
  for (const lang of targetLangs) {
    // 1. Try exact match from mission translation dictionary
    let text = getFullMissionText(en, lang);
    // 2. If not exact, run phrase translation
    if (text === en) {
      text = translateTextToLang(en, lang);
    }
    // 3. Fallback translation if phrase translation didn't change anything
    text = translateTextToLang(text, lang);
    res[lang] = text;
  }

  return res;
}

function serializeCompact(data) {
  if (Array.isArray(data)) {
    return '[\n' + data.map(item => '      ' + serializeMission(item)).join(',\n') + '\n    ]';
  }
  
  const entries = Object.entries(data).map(([key, val]) => {
    if (Array.isArray(val)) {
      return `  '${key}': [\n` + val.map(item => '    ' + serializeMission(item)).join(',\n') + '\n  ]';
    }
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
      updatedData[strategyKey][propKey] = processLangObject(langObj);
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
      title: processLangObject(m.title),
      guide: processLangObject(m.guide),
      explanation: m.explanation ? processLangObject(m.explanation) : undefined
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
}

console.log('✅ All submodules updated with pure translations.');
