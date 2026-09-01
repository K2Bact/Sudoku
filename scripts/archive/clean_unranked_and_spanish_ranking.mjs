import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

// Clean unranked across all locales
const unrankedClean = {
  ko: '순위 없음',
  en: 'Unranked',
  ja: 'ランク外',
  'zh-CN': '暂无排名',
  'zh-TW': '暫無排名',
  'es-ES': 'Sin clasificar',
  de: 'Ohne Rang',
  fr: 'Non classé',
  pt: 'Sem Classificação',
  it: 'Non Classificato',
  ru: 'Вне рейтинга',
  hi: 'बिना रैंक',
  ar: 'غير مصنف'
};

// Spanish leaderboard tabs to pure native Spanish
const spanishLeaderboardUpdates = {
  classicTab: 'Clasificación Clásica',
  speedrunTab: 'Contrarreloj',
  pvpTab: 'Batalla 1v1',
  iqTab: 'IQ Cerebral',
  leaderboardTab: 'Clasificación Global'
};

for (const [lang, unrankedText] of Object.entries(unrankedClean)) {
  const lbPath = path.join(localesDir, lang, 'leaderboard.js');
  if (fs.existsSync(lbPath)) {
    let content = fs.readFileSync(lbPath, 'utf8');
    content = content.replace(/unranked:\s*['"][^'"]*['"]/g, `unranked: '${unrankedText}'`);
    if (lang === 'es-ES') {
      content = content.replace(/classicTab:\s*['"][^'"]*['"]/g, `classicTab: '${spanishLeaderboardUpdates.classicTab}'`);
      content = content.replace(/speedrunTab:\s*['"][^'"]*['"]/g, `speedrunTab: '${spanishLeaderboardUpdates.speedrunTab}'`);
    }
    fs.writeFileSync(lbPath, content, 'utf8');
    console.log(`✅ Updated ${lang}/leaderboard.js`);
  }

  const scPath = path.join(localesDir, lang, 'screens.js');
  if (fs.existsSync(scPath)) {
    let scContent = fs.readFileSync(scPath, 'utf8');
    if (lang === 'es-ES') {
      scContent = scContent.replace(/leaderboardTab:\s*['"][^'"]*['"]/g, `leaderboardTab: '${spanishLeaderboardUpdates.leaderboardTab}'`);
    }
    fs.writeFileSync(scPath, scContent, 'utf8');
  }
}
