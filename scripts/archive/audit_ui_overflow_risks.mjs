import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';
const langDirs = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory());

const budgetRules = [
  { prefix: 'battleHeader.emptyCellsLeft', maxLen: 14, desc: 'Battle Header Remaining Text' },
  { prefix: 'gameHeader.', maxLen: 16, desc: 'Game Header Meta Badges' },
  { prefix: 'gameActions.', maxLen: 14, desc: 'Game Keypad Action Buttons' },
  { prefix: 'home.modes.', suffix: '.title', maxLen: 22, desc: 'Home Screen Mode Titles' },
  { prefix: 'common.', maxLen: 18, desc: 'Common Action & Nav Buttons' },
  { prefix: 'academy.practiceUi.', maxLen: 15, desc: 'Academy Practice Tabs/Buttons' },
  { prefix: 'modals.', suffix: 'Btn', maxLen: 20, desc: 'Modal Action Buttons' },
  { prefix: 'daily.', suffix: 'Btn', maxLen: 22, desc: 'Daily Challenge Buttons' },
  { prefix: 'leaderboard.', suffix: 'Tab', maxLen: 16, desc: 'Leaderboard Tabs' }
];

function flattenObj(obj, prefix = '') {
  let res = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.assign(res, flattenObj(v, fullKey));
    } else if (typeof v === 'string') {
      res[fullKey] = v;
    }
  }
  return res;
}

const report = [];

for (const lang of langDirs) {
  const langPath = path.join(localesDir, lang);
  const files = fs.readdirSync(langPath).filter(f => f.endsWith('.js'));
  let allStrings = {};

  for (const file of files) {
    const mod = await import('file://' + path.resolve(path.join(langPath, file)));
    const flat = flattenObj(mod.default || mod);
    Object.assign(allStrings, flat);
  }

  for (const rule of budgetRules) {
    for (const [key, val] of Object.entries(allStrings)) {
      let matches = true;
      if (rule.prefix && !key.startsWith(rule.prefix)) matches = false;
      if (rule.suffix && !key.endsWith(rule.suffix)) matches = false;

      if (matches && val.length > rule.maxLen) {
        report.push({
          lang,
          key,
          desc: rule.desc,
          len: val.length,
          maxLen: rule.maxLen,
          text: val
        });
      }
    }
  }
}

console.log(`Found ${report.length} UI text length budget potential overflow items:`);
report.sort((a, b) => b.len - a.len);

for (const r of report.slice(0, 50)) {
  console.log(`[${r.lang.padEnd(6)}] (len: ${r.len}/${r.maxLen}) ${r.key} : "${r.text}"`);
}

fs.writeFileSync('scripts/ui_overflow_report.json', JSON.stringify(report, null, 2), 'utf8');
