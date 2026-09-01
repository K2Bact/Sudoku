import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';
const outputFile = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/ARABIC_TRANSLATIONS_AUDIT.txt';

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

const koDict = flattenDict(await loadDict('ko'));
const enDict = flattenDict(await loadDict('en'));
const arDict = flattenDict(await loadDict('ar'));

let out = '';
out += '================================================================================\n';
out += '🇸🇦 [ARABIC_TRANSLATIONS_AUDIT.txt] 아랍어(Arabic) 전수 번역 정밀 감수용 데이터\n';
out += '================================================================================\n';
out += '★ 기준선: [ENGLISH BASELINE] 영어 원문\n';
out += '★ 감수 대상: [ARABIC TRANSLATION] 아랍어 번역문\n';
out += '★ 보조 참고: [KOREAN REFERENCE] 한국어 원문\n';
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
  out += `[ENGLISH BASELINE]:   ${enDict[key] || ''}\n`;
  out += `[KOREAN REFERENCE]:   ${koDict[key] || ''}\n`;
  out += `[ARABIC TRANSLATION]: ${arDict[key] || ''}\n\n`;
}

fs.writeFileSync(outputFile, out, 'utf8');
console.log(`✅ Successfully generated ${outputFile} (427 keys)!`);
