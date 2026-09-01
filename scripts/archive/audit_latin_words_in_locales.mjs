import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';
const files = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.js')) files.push(full);
  }
}
walk(localesDir);

// Whitelisted technical tokens, acronyms, placeholders, and proper nouns
const ALLOWED_TOKENS = new Set([
  'Sudoku', 'PRO', 'IQ', 'AI', 'PVP', 'VS', 'Lv.', 'LV.', 'PB', 'AdMob',
  'DeepSudoku', 'Google', 'Play', 'Games', 'SDK', 'ID', 'UI', 'OK', 'Delta', 'Ghost', '1v1',
  'SPEEDRUN', 'CLASSIC', 'SURVIVAL'
]);

const suspiciousEntries = [];

for (const file of files) {
  const parts = file.split(path.sep);
  const lang = parts[parts.length - 2];
  if (lang === 'en' || lang === 'locales') continue; // skip English base

  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Look for string values
    const match = line.match(/(['"`])(.*?)\1/);
    if (!match) return;
    const str = match[2];

    // Find all Latin word sequences of length >= 2
    // Ignore template placeholders like {time}, {level}, {count}, etc.
    const cleanStr = str.replace(/\{[a-zA-Z0-9_]+\}/g, '');
    const latinWords = cleanStr.match(/[A-Za-z]{2,}/g) || [];

    const suspicious = latinWords.filter(w => !ALLOWED_TOKENS.has(w) && !w.startsWith('http'));
    if (suspicious.length > 0) {
      suspiciousEntries.push({
        lang,
        file: path.relative(localesDir, file),
        line: idx + 1,
        suspiciousWords: suspicious,
        fullLine: line.trim()
      });
    }
  });
}

console.log(`Found ${suspiciousEntries.length} entries with potential English words in non-English locales:`);
suspiciousEntries.forEach(e => {
  console.log(`[${e.lang}] ${e.file}:${e.line} -> Words: [${e.suspiciousWords.join(', ')}]`);
  console.log(`   Line: ${e.fullLine}\n`);
});

fs.writeFileSync('scripts/suspicious_latin_words.json', JSON.stringify(suspiciousEntries, null, 2), 'utf8');
