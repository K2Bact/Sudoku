import fs from 'fs';

const issues = JSON.parse(fs.readFileSync('scripts/audit_issues.json', 'utf8'));

const catLang = {};
for (const iss of issues) {
  let cat = 'locales_dictionary';
  if (iss.key.includes('.js:')) {
    cat = 'academy_' + iss.key.split(':')[0];
  }
  if (!catLang[cat]) catLang[cat] = {};
  if (!catLang[cat][iss.lang]) catLang[cat][iss.lang] = [];
  catLang[cat][iss.lang].push(iss);
}

console.log('=== COMPONENT & LANGUAGE AUDIT BREAKDOWN ===');
for (const [cat, langs] of Object.entries(catLang)) {
  console.log(`\n📁 Component: [${cat}]`);
  for (const [lang, items] of Object.entries(langs)) {
    const sample = items[0];
    const detail = sample.matchedWord || sample.chars;
    console.log(`  - [${lang.padEnd(6)}]: ${String(items.length).padStart(4)} issues | Sample: ${sample.key} -> "${detail}" in "${sample.text.slice(0, 60)}..."`);
  }
}

// Check specifically which keys in i18n/locales have English words
console.log('\n=== TOP LOCALE DICTIONARY KEYS WITH ENGLISH WORDS ===');
const localeKeys = {};
for (const iss of issues) {
  if (!iss.key.includes('.js:')) {
    const rootKey = iss.key.split('.')[0];
    localeKeys[rootKey] = (localeKeys[rootKey] || 0) + 1;
  }
}
console.log(localeKeys);
