import path from 'path';

const { DICTIONARIES } = await import('file://' + path.resolve('src/i18n/dictionaries.js'));
const enDict = DICTIONARIES['en'];

function findIdenticalToEnglish(curr, en, prefix, lang, list) {
  for (const [k, v] of Object.entries(curr)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    const enVal = en ? en[k] : undefined;
    if (typeof v === 'string') {
      if (enVal && typeof enVal === 'string' && v.trim() === enVal.trim() && v.length > 3) {
        if (!/^[0-9A-Z_ \-\+]+$/.test(v) && v !== 'Sudoku' && v !== 'Classic') {
          list.push({ lang, key: fullKey, val: v });
        }
      }
    } else if (typeof v === 'object' && v !== null) {
      findIdenticalToEnglish(v, enVal || {}, fullKey, lang, list);
    }
  }
}

const identicalList = [];
for (const [lang, dict] of Object.entries(DICTIONARIES)) {
  if (lang !== 'en') {
    findIdenticalToEnglish(dict, enDict, '', lang, identicalList);
  }
}

console.log(`Total strings identical to English across all non-en locales: ${identicalList.length}`);
const byLang = {};
for (const it of identicalList) {
  byLang[it.lang] = (byLang[it.lang] || 0) + 1;
}
console.log('Identical to English by language:', byLang);
console.log('\nTop 40 Samples:');
for (const it of identicalList.slice(0, 40)) {
  console.log(`  [${it.lang.padEnd(5)}] ${it.key}: "${it.val}"`);
}
