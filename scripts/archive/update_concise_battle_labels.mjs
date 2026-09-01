import fs from 'fs';
import path from 'path';

const conciseEmptyCellsLeft = {
  ko: '남음',
  en: 'left',
  ja: '残り',
  zh: '剩餘',
  'zh-CN': '剩余',
  es: 'restantes',
  'es-ES': 'restantes',
  de: 'übrig',
  fr: 'restants',
  pt: 'restantes',
  it: 'rimasti',
  ru: 'осталось',
  hi: 'शेष',
  ar: 'متبقية'
};

const localesDir = 'src/i18n/locales';

for (const [lang, val] of Object.entries(conciseEmptyCellsLeft)) {
  const filePath = path.join(localesDir, lang, 'screens.js');
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  // Match emptyCellsLeft: '...'
  content = content.replace(/emptyCellsLeft:\s*['"][^'"]+['"]/g, `emptyCellsLeft: '${val}'`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${lang}/screens.js: emptyCellsLeft -> '${val}'`);
}
