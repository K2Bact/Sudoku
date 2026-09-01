import fs from 'fs';

const issues = JSON.parse(fs.readFileSync('scripts/audit_issues.json', 'utf8'));

const WHITELIST_WORDS = new Set([
  'x-wing', 'y-wing', 'xy-wing', 'xyz-wing', 'w-wing', 'wxyz-wing', 'swordfish', 'jellyfish',
  'fin', 'finned', 'sue', 'de', 'coq', 'exocet', 'aic', 'als', 'bug', 'ur', 'medusa',
  'wing', 'wings', 'kite', 'turbot', 'medusa', 'iq', 'mmr', 'ai', 'lv', 'sudoku'
]);

const realLeaks = [];
for (const iss of issues) {
  if (iss.type === 'ENGLISH_LEAK') {
    const w = (iss.matchedWord || '').toLowerCase();
    if (!WHITELIST_WORDS.has(w)) {
      realLeaks.push(iss);
    }
  }
}

console.log(`Total non-proper-noun English leaks: ${realLeaks.length}`);
const byKey = {};
for (const iss of realLeaks) {
  const root = iss.key.split('.')[0];
  byKey[root] = (byKey[root] || 0) + 1;
}
console.log('Grouped by key root:', byKey);

console.log('\nTop 40 Real English Leaks:');
for (const iss of realLeaks.slice(0, 40)) {
  console.log(`  [${iss.lang.padEnd(5)}] ${iss.key}: "${iss.matchedWord}" -> "${iss.text.slice(0, 70)}..."`);
}
