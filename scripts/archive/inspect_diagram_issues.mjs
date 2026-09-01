import fs from 'fs';

const issues = JSON.parse(fs.readFileSync('scripts/audit_issues.json', 'utf8'));

const diagramIssues = issues.filter(i => i.key.includes('Diagrams.js:'));
console.log('Total diagram issues:', diagramIssues.length);
for (const iss of diagramIssues.slice(0, 40)) {
  console.log(`  [${iss.lang.padEnd(5)}] ${iss.key}: "${iss.matchedWord}" in "${iss.text.slice(0, 70)}..."`);
}
