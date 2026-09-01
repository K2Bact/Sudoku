import fs from 'fs';

const items = JSON.parse(fs.readFileSync('scripts/ui_overflow_report.json', 'utf8'));

// Filter out paragraphs/descriptions (like .desc, share.text, etc.)
const compactLabels = items.filter(i => {
  if (i.key.includes('.desc') || i.key.includes('share.text') || i.key.includes('conflicts.')) return false;
  return true;
});

console.log(`Total compact UI label overflow candidates: ${compactLabels.length}`);
compactLabels.sort((a, b) => b.len - a.len);

for (const it of compactLabels) {
  console.log(`[${it.lang.padEnd(6)}] (${String(it.len).padStart(2)}/${it.maxLen}) ${it.key.padEnd(35)} : "${it.text}"`);
}
