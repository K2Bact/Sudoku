import fs from 'fs';
import path from 'path';

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(walk(full));
    } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk('src');
const hardcodedTexts = [];

for (const file of files) {
  if (file.includes('locales') || file.includes('scripts') || file.includes('test')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check for hardcoded English badge strings: 'SPEEDRUN', 'SURVIVAL', 'CLASSIC', 'PRO', 'GHOST', 'PB'
    const badges = ['SPEEDRUN', 'SURVIVAL', 'CLASSIC', 'GHOST', 'PB'];
    for (const b of badges) {
      if (line.includes(`'${b}'`) || line.includes(`"${b}"`)) {
        hardcodedTexts.push({ file, line: idx + 1, badge: b, code: line.trim() });
      }
    }
  });
}

console.log(`Found ${hardcodedTexts.length} hardcoded badge occurrences across codebase:`);
for (const h of hardcodedTexts) {
  console.log(`[${h.file}:${h.line}] Badge: '${h.badge}' -> ${h.code}`);
}
