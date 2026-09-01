import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

const GLOBAL_SAFE_TOKENS = new Set([
  'google', 'apple', 'admob', 'suidoku', 'deepsudoku', 'iq', 'ai', 'pvp', '1v1',
  'lv', 'xp', 'mmr', 'sdk', 'id', 'ui', 'alphadoku', 'mensa', 'url', 'http', 'https',
  'ur', 'aic', 'als'
]);

const findings = {};

for (const lang of fs.readdirSync(localesDir)) {
  if (lang === 'en') continue;
  const dir = path.join(localesDir, lang);
  if (!fs.statSync(dir).isDirectory()) continue;

  findings[lang] = [];

  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const file = path.join(dir, f);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      // Extract strings
      const match = line.match(/(['"`])(.*?)\1/);
      if (!match) return;
      const val = match[2];

      // Remove placeholders {time}, etc.
      const cleaned = val.replace(/\{[a-zA-Z0-9_]+\}/g, '');
      const words = cleaned.match(/[A-Za-z]{2,}/g) || [];

      // Find words not in safe list
      // For European languages (es, de, fr, pt, it), some words are native Latin.
      // But for ko, ja, zh-CN, zh-TW, ru, hi, ar, ANY Latin word (unless safe token) is an English leak!
      // For European languages, words like 'Speedrun', 'Classic', 'Survival', 'Standard', 'Rank', 'Leaderboard', 'Ghost', 'Mode', 'Online', 'Combo' are anglicisms/English.
      
      const suspicious = [];
      for (const w of words) {
        const lower = w.toLowerCase();
        if (GLOBAL_SAFE_TOKENS.has(lower)) continue;

        // Specific English / Anglicism keywords to catch everywhere
        const forbiddenWords = [
          'speedrun', 'survival', 'classic', 'standard', 'unranked', 'rank', 'ranking',
          'leaderboard', 'game', 'play', 'player', 'ghost', 'start', 'restart',
          'pause', 'resume', 'settings', 'level', 'mode', 'stats', 'stat', 'hint',
          'theme', 'sound', 'haptic', 'battle', 'match', 'easy', 'medium', 'hard',
          'expert', 'master', 'beginner', 'intermediate', 'advanced', 'combo',
          'perfect', 'victory', 'gameover', 'loss', 'profile', 'achievement',
          'login', 'logout', 'sync', 'online', 'offline', 'versus', 'time', 'score',
          'fast', 'entry', 'notes', 'erase', 'undo', 'best', 'record', 'new', 'top'
        ];

        if (forbiddenWords.includes(lower)) {
          suspicious.push(w);
        } else if (['ko', 'ja', 'zh-CN', 'zh-TW', 'ru', 'hi', 'ar'].includes(lang)) {
          // In non-Latin script languages, ALL remaining Latin words are leaks!
          suspicious.push(w);
        }
      }

      if (suspicious.length > 0) {
        findings[lang].push({
          file: f,
          line: idx + 1,
          keyLine: line.trim(),
          suspicious: suspicious
        });
      }
    });
  }
}

let totalCount = 0;
for (const [lang, items] of Object.entries(findings)) {
  console.log(`\n======================================================`);
  console.log(`🌐 [${lang.toUpperCase()}] Found ${items.length} items to localize:`);
  console.log(`======================================================`);
  items.forEach(it => {
    console.log(`  [${it.file}:${it.line}] (${it.suspicious.join(', ')}) -> ${it.keyLine}`);
  });
  totalCount += items.length;
}

console.log(`\n🚨 TOTAL FINDINGS ACROSS ALL NON-ENGLISH LANGUAGES: ${totalCount}`);
fs.writeFileSync('scripts/all_languages_audit_report.json', JSON.stringify(findings, null, 2), 'utf8');
