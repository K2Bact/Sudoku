import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';
const outputFile = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/ALL_TRANSLATIONS_AUDIT.txt';

const targetLanguages = [
  { code: 'en', name: '영어 (English - Global Baseline)' },
  { code: 'ja', name: '일본어 (Japanese)' },
  { code: 'zh-CN', name: '중국어 간체 (Simplified Chinese)' },
  { code: 'zh-TW', name: '중국어 번체 (Traditional Chinese)' },
  { code: 'es-ES', name: '스페인어 (Spanish)' },
  { code: 'de', name: '독일어 (German)' },
  { code: 'fr', name: '프랑스어 (French)' },
  { code: 'pt', name: '포르투갈어 (Portuguese)' },
  { code: 'it', name: '이탈리아어 (Italian)' },
  { code: 'ru', name: '러시아어 (Russian)' },
  { code: 'hi', name: '힌디어 (Hindi)' },
  { code: 'ar', name: '아랍어 (Arabic)' }
];

async function loadDict(langCode) {
  const dir = path.join(localesDir, langCode);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  const res = {};

  for (const f of files) {
    const ns = path.basename(f, '.js');
    const full = path.join(dir, f);
    const mod = await import(pathToFileURL(full).href);
    const exported = mod[ns] || mod.default || mod;
    res[ns] = (exported && typeof exported === 'object' && exported[ns]) ? exported[ns] : exported;
  }
  return res;
}

function flattenDict(obj, prefix = '') {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(res, flattenDict(v, key));
    } else {
      res[key] = v;
    }
  }
  return res;
}

// Load Korean base for reference keys and description
const koDict = flattenDict(await loadDict('ko'));
const enDict = flattenDict(await loadDict('en'));

const allFlattened = {};
for (const lang of targetLanguages) {
  allFlattened[lang.code] = flattenDict(await loadDict(lang.code));
}

let out = '';
out += '================================================================================\n';
out += '🌐 [ALL_TRANSLATIONS_AUDIT.txt] 글로벌 다국어 번역 전수 검수용 통합 마스터 텍스트\n';
out += '================================================================================\n';
out += '★ 기준선 (Baseline): 영어 (English)를 최상단 글로벌 기준 원문으로 배치\n';
out += '목적: ChatGPT, Claude 등 외부 AI에 그대로 복사/붙여넣기하여 원어민 관점에서\n';
out += '      1) 영어 기준선(Baseline) 대비 각 언어별 번역 정확도\n';
out += '      2) 어색한 외래어/영문 잔존 여부\n';
out += '      3) 직역 투 및 문법 오류\n';
out += '      4) Google Play / App Store 모바일 게임 표준 용어 준수 여부\n';
out += '      를 1:1로 정밀 교차 검수하기 위한 파일입니다.\n';
out += '================================================================================\n\n';

const allKeys = Object.keys(koDict);

let currentNamespace = '';

for (const key of allKeys) {
  const ns = key.split('.')[0];
  if (ns !== currentNamespace) {
    currentNamespace = ns;
    out += `\n################################################################################\n`;
    out += `### [NAMESPACE: ${ns.toUpperCase()}]\n`;
    out += `################################################################################\n\n`;
  }

  out += `--------------------------------------------------------------------------------\n`;
  out += `[KEY]: ${key}\n`;
  out += `[★ ENGLISH BASELINE (글로벌 기준 원문)]: ${enDict[key] || ''}\n`;
  out += `[KOREAN REFERENCE (한국어 원문)]:         ${koDict[key] || ''}\n`;
  out += `--- [12개국 번역본 (영어 기준선 최상단 포함)] ---\n`;

  for (const lang of targetLanguages) {
    const val = allFlattened[lang.code][key] || '(MISSING)';
    out += `  * [${lang.code}] (${lang.name}): ${val}\n`;
  }
  out += `\n`;
}

fs.writeFileSync(outputFile, out, 'utf8');
console.log(`✅ Successfully updated ${outputFile} with English baseline at the top!`);
