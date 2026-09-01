import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

const statsTabsMap = {
  'en': { stats: 'Stats', ach: 'Achievements' },
  'ko': { stats: '통계', ach: '업적' },
  'ja': { stats: '統計', ach: '実績' },
  'zh-CN': { stats: '统计', ach: '成就' },
  'zh-TW': { stats: '統計', ach: '成就' },
  'es-ES': { stats: 'Estadísticas', ach: 'Logros' },
  'fr': { stats: 'Statistiques', ach: 'Succès' },
  'de': { stats: 'Statistik', ach: 'Erfolge' },
  'pt': { stats: 'Estatísticas', ach: 'Conquistas' },
  'it': { stats: 'Statistiche', ach: 'Obiettivi' },
  'ru': { stats: 'Статистика', ach: 'Достижения' },
  'ar': { stats: 'الإحصائيات', ach: 'الإنجازات' },
  'hi': { stats: 'आंकड़े', ach: 'उपलब्धियां' }
};

fs.readdirSync(localesDir).forEach(lang => {
  const scrPath = path.join(localesDir, lang, 'screens.js');
  if (!fs.existsSync(scrPath) || !fs.statSync(scrPath).isFile()) return;

  let content = fs.readFileSync(scrPath, 'utf8');

  if (statsTabsMap[lang]) {
    const { stats, ach } = statsTabsMap[lang];
    // Replace tabs within the stats block
    content = content.replace(/(stats:\s*\{[\s\S]*?)tabs:\s*\{[^}]+\}([\s\S]*?brainReport:)/, (match, p1, p2) => {
      return `${p1}tabs: { stats: '${stats}', achievements: '${ach}' }${p2}`;
    });
  }

  fs.writeFileSync(scrPath, content, 'utf8');
  console.log(`✅ Corrected stats.tabs in ${lang}/screens.js`);
});
