import fs from 'fs';
import path from 'path';

const locales = ['ko', 'ja', 'zh-CN', 'zh-TW', 'es-ES', 'de', 'fr', 'pt', 'it', 'ru', 'hi', 'ar'];
const namespaces = ['common', 'screens', 'modals', 'achievements', 'leaderboard'];

// Proper nouns or universal terms that CAN be identical to EN
const ALLOWED_IDENTICAL = new Set([
  'Sudoku', 'IQ', 'MMR', 'AI', 'Google', 'Apple', 'Game Center', 'Google Play',
  'X-Wing', 'Y-Wing', 'XYZ-Wing', 'W-Wing', 'WXYZ-Wing', 'Swordfish', 'Jellyfish',
  'BUG+1', 'AIC', 'ALS', 'ALS-XZ', 'ALS-XY', 'Exocet', 'Sue de Coq', 'UR',
  '3D Medusa', 'Simple Colors', 'Two-String Kite', 'Turbot Fish', 'Empty Rectangle',
  'Master', 'Grandmaster', 'Pro', 'Expert', 'Beginner', 'Normal', 'Hard', 'Extreme',
  'OK', 'PRO', 'VIP', 'ID', 'XP', 'VS', 'BGM', 'SFX', 'FPS', 'UI', 'v1.0', '{version}',
  '{count}', '{score}', '{time}', '{date}', '{tier}', '{rank}', '{name}', '{mmr}'
]);

function flatten(obj, prefix = '') {
  let res = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.assign(res, flatten(v, fullKey));
    } else {
      res[fullKey] = v;
    }
  }
  return res;
}

const report = {};

for (const ns of namespaces) {
  const enMod = await import(`../src/i18n/locales/en/${ns}.js`);
  const enFlat = flatten(enMod.default || enMod[Object.keys(enMod)[0]]);

  for (const loc of locales) {
    report[loc] = report[loc] || [];
    const locMod = await import(`../src/i18n/locales/${loc}/${ns}.js`);
    const locFlat = flatten(locMod.default || locMod[Object.keys(locMod)[0]]);

    for (const [key, enVal] of Object.entries(enFlat)) {
      const locVal = locFlat[key];
      if (locVal === undefined) {
        report[loc].push({ ns, key, issue: 'MISSING_KEY', enVal });
      } else if (typeof locVal === 'string' && typeof enVal === 'string') {
        // If string is identical to EN and has > 4 letters and is not an allowed term
        if (locVal.trim() === enVal.trim() && enVal.trim().length > 3 && !ALLOWED_IDENTICAL.has(enVal.trim())) {
          // check if it's just a number or placeholder
          if (!/^[0-9\s.,:%{}_\-/#+]+$/.test(enVal)) {
            report[loc].push({ ns, key, issue: 'IDENTICAL_TO_EN', val: locVal });
          }
        }
      }
    }
  }
}

console.log('=== LOCALE DICTIONARY IDENTICAL-TO-EN REPORT ===');
for (const [loc, issues] of Object.entries(report)) {
  console.log(`[${loc.padEnd(5)}]: ${issues.length} issues`);
  if (issues.length > 0) {
    for (const iss of issues) {
      console.log(`    - [${iss.issue}] ${iss.ns}.${iss.key}: "${iss.val || iss.enVal}"`);
    }
  }
}
