import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

const tabUpdates = {
  'ar': {
    statsTab: 'الإحصائيات',
    tabTitle: 'الإنجازات',
    leaderboardTab: 'المتصدرون'
  },
  'de': {
    statsTab: 'Statistik',
    tabTitle: 'Erfolge',
    leaderboardTab: 'Rangliste'
  },
  'en': {
    statsTab: 'Stats',
    tabTitle: 'Achievements',
    leaderboardTab: 'Leaderboard'
  },
  'es-ES': {
    statsTab: 'Estadísticas',
    tabTitle: 'Logros',
    leaderboardTab: 'Ránking'
  },
  'fr': {
    statsTab: 'Statistiques',
    tabTitle: 'Succès',
    leaderboardTab: 'Classement'
  },
  'hi': {
    statsTab: 'आंकड़े',
    tabTitle: 'उपलब्धियां',
    leaderboardTab: 'रैंकिंग'
  },
  'it': {
    statsTab: 'Statistiche',
    tabTitle: 'Obiettivi',
    leaderboardTab: 'Classifica'
  },
  'ja': {
    statsTab: '統計',
    tabTitle: '実績',
    leaderboardTab: 'ランキング'
  },
  'ko': {
    statsTab: '통계',
    tabTitle: '업적',
    leaderboardTab: '랭킹'
  },
  'pt': {
    statsTab: 'Estatísticas',
    tabTitle: 'Conquistas',
    leaderboardTab: 'Classificação'
  },
  'ru': {
    statsTab: 'Статистика',
    tabTitle: 'Достижения',
    leaderboardTab: 'Рейтинг'
  },
  'zh-CN': {
    statsTab: '统计',
    tabTitle: '成就',
    leaderboardTab: '排行'
  },
  'zh-TW': {
    statsTab: '統計',
    tabTitle: '成就',
    leaderboardTab: '排行'
  }
};

for (const [lang, u] of Object.entries(tabUpdates)) {
  // Update achievements.js
  const achPath = path.join(localesDir, lang, 'achievements.js');
  if (fs.existsSync(achPath)) {
    let content = fs.readFileSync(achPath, 'utf8');
    content = content.replace(/statsTab:\s*'[^']+'/, `statsTab: '${u.statsTab}'`);
    content = content.replace(/tabTitle:\s*'[^']+'/, `tabTitle: '${u.tabTitle}'`);
    fs.writeFileSync(achPath, content, 'utf8');
    console.log(`✅ Updated ${lang}/achievements.js tabs`);
  }

  // Update screens.js
  const scrPath = path.join(localesDir, lang, 'screens.js');
  if (fs.existsSync(scrPath)) {
    let content = fs.readFileSync(scrPath, 'utf8');
    content = content.replace(/leaderboardTab:\s*'[^']+'/, `leaderboardTab: '${u.leaderboardTab}'`);
    fs.writeFileSync(scrPath, content, 'utf8');
    console.log(`✅ Updated ${lang}/screens.js leaderboardTab`);
  }
}
