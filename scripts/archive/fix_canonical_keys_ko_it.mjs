import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

const keyFixes = [
  { regex: /스피드런Tab/g, replace: 'speedrunTab' },
  { regex: /스피드런Title/g, replace: 'speedrunTitle' },
  { regex: /스피드런Desc/g, replace: 'speedrunDesc' },
  { regex: /스피드런Best/g, replace: 'speedrunBest' },
  { regex: /cronometroTab/g, replace: 'speedrunTab' },
  { regex: /cronometroTitle/g, replace: 'speedrunTitle' },
  { regex: /cronometroDesc/g, replace: 'speedrunDesc' },
  { regex: /cronometroBest/g, replace: 'speedrunBest' }
];

for (const lang of ['ko', 'it']) {
  const dir = path.join(localesDir, lang);
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    for (const fix of keyFixes) {
      content = content.replace(fix.regex, fix.replace);
    }
    fs.writeFileSync(p, content, 'utf8');
  }
}
console.log('✅ Standard canonical keys restored in ko and it!');
