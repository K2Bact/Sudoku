import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

// List of cleanups across all locales
const cleanups = [
  // 1. Remove (You)
  { regex: /\s*\(You\)/gi, replace: '' },
  // 2. Remove (Unranked)
  { regex: /\s*\(Unranked\)/gi, replace: '' },
  // 3. Remove (Fast Entry)
  { regex: /\s*\(Fast Entry\)/gi, replace: '' },
  // 4. Remove (Speedrun) in non-en
  { regex: /\s*\(Speedrun\)/gi, replace: '' },
  // 5. Remove (Survival) in non-en
  { regex: /\s*\(Survival\)/gi, replace: '' },
  // 6. Remove (Zero-PII)
  { regex: /\s*\(Zero-PII\)/gi, replace: '' },
  // 7. Clean 'Zero-PII' in title/subtitles
  { regex: /Zero-PII\s*/gi, replace: '' }
];

for (const lang of fs.readdirSync(localesDir)) {
  if (lang === 'en') continue;
  const dir = path.join(localesDir, lang);
  if (!fs.statSync(dir).isDirectory()) continue;

  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const file = path.join(dir, f);
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const c of cleanups) {
      if (c.regex.test(content)) {
        content = content.replace(c.regex, c.replace);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`🧹 Cleaned English residue from ${lang}/${f}`);
    }
  }
}
