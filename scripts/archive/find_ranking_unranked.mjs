import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';
const matches = [];

for (const lang of fs.readdirSync(localesDir)) {
  const dir = path.join(localesDir, lang);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const file = path.join(dir, f);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (l.toLowerCase().includes('unranked') || l.toLowerCase().includes('ránking') || (l.toLowerCase().includes('ranking') && lang !== 'en')) {
        matches.push({ lang, file: f, line: idx + 1, text: l.trim() });
      }
    });
  }
}

console.log(`Found ${matches.length} occurrences:`);
for (const m of matches) {
  console.log(`[${m.lang}/${m.file}:${m.line}] ${m.text}`);
}
