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

const files = walk('src/components');
const results = [];

// Whitelist of valid technical tokens, icons, and CSS classes
const WHITELIST = new Set([
  'div', 'span', 'button', 'header', 'p', 'h1', 'h2', 'h3', 'h4', 'section', 'main',
  'svg', 'path', 'g', 'rect', 'circle', 'line', 'use', 'img', 'input', 'label',
  'text', 'number', 'tel', 'button', 'submit', 'reset', 'checkbox', 'radio',
  'none', 'auto', 'hidden', 'visible', 'block', 'flex', 'grid', 'inline-block',
  'true', 'false', 'null', 'undefined', 'inherit', 'initial', 'unset',
  'px', 'em', 'rem', '%', 'deg', 'vh', 'vw', 'ms', 's',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
  'center', 'left', 'right', 'top', 'bottom', 'start', 'end',
  'row', 'column', 'wrap', 'nowrap', 'space-between', 'space-around',
  'rgba', 'rgb', 'hsl', 'hsla', '#',
  'X', '✕', '✓', '⚡', '⏳', '🎯', '🔥', '🏆', '💡', '🧠', '🧩', '👑', '🥇', '🥈', '🥉',
  'Lv.', 'LV.', 'x', 'vs', 'VS', ':', '/', '-', '·', '+', '=', '>', '<',
  'classic', 'timeAttack', 'timeLimit', 'daily', 'battle', 'aiBattle', 'ghost', 'standard', 'delta'
]);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check for hardcoded badges or strings in JSX
    // Pattern 1: Literal text between tags: >Some Text<
    const tagMatches = line.match(/>([A-Za-z]{2,}[^<>{}]*)</g);
    if (tagMatches) {
      tagMatches.forEach(m => {
        const text = m.slice(1, -1).trim();
        if (text && !WHITELIST.has(text) && !text.startsWith('http') && !text.includes('icon') && isNaN(Number(text))) {
          results.push({ file, line: idx + 1, type: 'JSX_TEXT', text, code: line.trim() });
        }
      });
    }

    // Pattern 2: Ternary literal string returns: ? 'SPEEDRUN' : 'SURVIVAL'
    const ternaryMatches = line.match(/\?\s*['"]([A-Za-z]{2,}[^'"]*)['"]\s*:\s*['"]([A-Za-z]{2,}[^'"]*)['"]/g);
    if (ternaryMatches) {
      ternaryMatches.forEach(m => {
        results.push({ file, line: idx + 1, type: 'TERNARY_STRING', text: m, code: line.trim() });
      });
    }
  });
}

console.log(`Found ${results.length} potential hardcoded string occurrences:`);
for (const r of results) {
  console.log(`[${r.file}:${r.line}] (${r.type}) ${r.text}`);
  console.log(`     Code: ${r.code}\n`);
}

fs.writeFileSync('scripts/hardcoded_jsx_audit.json', JSON.stringify(results, null, 2), 'utf8');
