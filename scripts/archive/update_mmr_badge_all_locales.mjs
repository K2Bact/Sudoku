import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

const mmrBadgeMap = {
  'ar': 'مطابقة حسب المهارة · نسبة الفوز: {rate}%',
  'ko': '실력 기반 매칭 · 내 승률 {rate}%',
  'en': 'Skill-Based Match · Win Rate {rate}%',
  'ja': '実力マッチング · 勝率 {rate}%',
  'zh-TW': '實力匹配 · 當前勝率 {rate}%',
  'zh-CN': '实力匹配 · 当前胜率 {rate}%',
  'es-ES': 'Emparejamiento por nivel · Victorias: {rate}%',
  'de': 'Skill-Matchmaking · Siegquote: {rate}%',
  'fr': 'Match équilibré · Victoires : {rate}%',
  'pt': 'Partida por nível · Vitórias: {rate}%',
  'it': 'Match per abilità · Vittorie: {rate}%',
  'ru': 'Подбор по навыку · Винрейт: {rate}%',
  'hi': 'कौशल आधारित मैच · जीत दर: {rate}%'
};

for (const [lang, newBadge] of Object.entries(mmrBadgeMap)) {
  const filePath = path.join(localesDir, lang, 'screens.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace mmrBadge line
    content = content.replace(/mmrBadge:\s*['"][^'"]+['"]/, `mmrBadge: '${newBadge}'`);
    
    // In Arabic, fix daily header from 'التحديات اليومية ({month})' to 'التحديات اليومية — شهر {month}'
    if (lang === 'ar') {
      content = content.replace(/header:\s*'التحديات اليومية \(\{month\}\)'/, "header: 'التحديات اليومية — شهر {month}'");
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${lang}/screens.js`);
  }
}
