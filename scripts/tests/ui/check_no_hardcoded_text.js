import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

const koreanRegex = /[\uac00-\ud7af]/;

// Files allowed to contain internal localized data dictionaries
const allowedFiles = [
  'src/i18n',
  'src/data/',
  'src/components/academy/Stage',
  'src/services/'
];

const targetFiles = walk('src').filter(f => {
  if (!f.endsWith('.jsx') && !f.endsWith('.js')) return false;
  return !allowedFiles.some(af => f.replace(/\\/g, '/').includes(af));
});

console.log('🔍 [QA Hardcode Scanner] Inspecting source files for forbidden hardcoded text...');

let violations = [];

for (const f of targetFiles) {
  let raw = readFileSync(f, 'utf8');
  // Strip block comments and JSX comments
  raw = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  raw = raw.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  
  const lines = raw.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    
    // Check for hardcoded Korean strings
    if (koreanRegex.test(trimmed)) {
      violations.push({
        file: f,
        line: idx + 1,
        text: trimmed
      });
    }
  });
}

if (violations.length > 0) {
  console.error(`\n❌ [QA Hardcode Scanner] FOUND ${violations.length} HARDCODED STRINGS:`);
  violations.forEach(v => {
    console.error(`  - ${v.file}:${v.line} -> ${v.text}`);
  });
  console.error('\n🚨 All user-facing strings MUST use t("key") and be registered in all 5 locale dictionaries.\n');
  process.exit(1);
} else {
  console.log(`✅ [QA Hardcode Scanner] PASSED! Inspected ${targetFiles.length} UI & Hook files with 0 hardcoded strings.`);
}
