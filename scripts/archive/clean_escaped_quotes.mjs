import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

fs.readdirSync(localesDir).forEach(lang => {
  const scrPath = path.join(localesDir, lang, 'screens.js');
  if (!fs.existsSync(scrPath) || !fs.statSync(scrPath).isFile()) return;

  let c = fs.readFileSync(scrPath, 'utf8');
  // Remove backslash before single quotes
  c = c.replaceAll("\\'", "'");
  fs.writeFileSync(scrPath, c, 'utf8');
  console.log(`✅ Unescaped quotes in ${lang}/screens.js`);
});
