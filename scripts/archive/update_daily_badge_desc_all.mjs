import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

const badgeDescMap = {
  'es-ES': "badgeDesc: '{completed} / {target} completados (Meta: 15+)'",
  'en': "badgeDesc: '{completed} / {target} completed (Goal: 15+)'",
  'ko': "badgeDesc: '{completed} / {target}개 완료 (목표: 15개 이상)'",
  'ja': "badgeDesc: '{completed} / {target}個完了 (目標: 15個以上)'",
  'zh-TW': "badgeDesc: '已完成 {completed} / {target} 局（目標：15+ 局）'",
  'zh-CN': "badgeDesc: '已完成 {completed} / {target} 局（目标：15+ 局）'",
  'de': "badgeDesc: '{completed} / {target} gelöst (Ziel: 15+)'",
  'fr': "badgeDesc: '{completed} / {target} complétés (Objectif : 15+)'",
  'pt': "badgeDesc: '{completed} / {target} concluídos (Meta: 15+)'",
  'it': "badgeDesc: '{completed} / {target} completati (Obiettivo: 15+)'",
  'ru': "badgeDesc: 'Завершено: {completed} / {target} (Цель: 15+)'",
  'hi': "badgeDesc: '{completed} / {target} पूर्ण (लक्ष्य: 15+)'",
  'ar': "badgeDesc: 'تم إكمال {completed} / {target} (الهدف: 15+)'"
};

for (const [lang, newLine] of Object.entries(badgeDescMap)) {
  const filePath = path.join(localesDir, lang, 'screens.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/badgeDesc:\s*['"][^'"]+['"]/, newLine);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${lang}/screens.js badgeDesc`);
  }
}
