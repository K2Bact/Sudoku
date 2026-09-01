import fs from 'fs';

const issues = JSON.parse(fs.readFileSync('scripts/audit_issues.json', 'utf8'));

const practiceIssues = issues.filter(i => i.key.includes('Practice.js:'));
console.log('Total practice issues:', practiceIssues.length);
for (const iss of practiceIssues.slice(0, 30)) {
  console.log(`  [${iss.lang.padEnd(5)}] ${iss.key}: "${iss.matchedWord}" in "${iss.text.slice(0, 70)}..."`);
}
