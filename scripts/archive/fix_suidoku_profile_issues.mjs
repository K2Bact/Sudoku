import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

const shortTabs = {
  'en': { s1: 'Stage 1', s2: 'Stage 2', s3: 'Stage 3', s4: 'Stage 4', s5: 'Stage 5' },
  'ko': { s1: '1단계', s2: '2단계', s3: '3단계', s4: '4단계', s5: '5단계' },
  'ja': { s1: '第1段階', s2: '第2段階', s3: '第3段階', s4: '第4段階', s5: '第5段階' },
  'zh-CN': { s1: '第1阶段', s2: '第2阶段', s3: '第3阶段', s4: '第4阶段', s5: '第5阶段' },
  'zh-TW': { s1: '第1階段', s2: '第2階段', s3: '第3階段', s4: '第4階段', s5: '第5階段' },
  'es-ES': { s1: 'Etapa 1', s2: 'Etapa 2', s3: 'Etapa 3', s4: 'Etapa 4', s5: 'Etapa 5' },
  'fr': { s1: 'Étape 1', s2: 'Étape 2', s3: 'Étape 3', s4: 'Étape 4', s5: 'Étape 5' },
  'de': { s1: 'Stufe 1', s2: 'Stufe 2', s3: 'Stufe 3', s4: 'Stufe 4', s5: 'Stufe 5' },
  'pt': { s1: 'Etapa 1', s2: 'Etapa 2', s3: 'Etapa 3', s4: 'Etapa 4', s5: 'Etapa 5' },
  'it': { s1: 'Tappa 1', s2: 'Tappa 2', s3: 'Tappa 3', s4: 'Tappa 4', s5: 'Tappa 5' },
  'ru': { s1: 'Этап 1', s2: 'Этап 2', s3: 'Этап 3', s4: 'Этап 4', s5: 'Этап 5' },
  'ar': { s1: 'المرحلة 1', s2: 'المرحلة 2', s3: 'المرحلة 3', s4: 'المرحلة 4', s5: 'المرحلة 5' },
  'hi': { s1: 'चरण 1', s2: 'चरण 2', s3: 'चरण 3', s4: 'चरण 4', s5: 'चरण 5' }
};

fs.readdirSync(localesDir).forEach(lang => {
  const scrPath = path.join(localesDir, lang, 'screens.js');
  if (!fs.existsSync(scrPath) || !fs.statSync(scrPath).isFile()) return;

  let content = fs.readFileSync(scrPath, 'utf8');

  // 1. Replace brand name typo Suidoku -> Sudoku
  content = content.replace(/Suidoku/g, 'Sudoku');

  // 2. Fix academy tabs if present
  if (shortTabs[lang]) {
    const t = shortTabs[lang];
    content = content.replace(/tabs:\s*{[^}]+}/, `tabs: { stage1: '${t.s1}', stage2: '${t.s2}', stage3: '${t.s3}', stage4: '${t.s4}', stage5: '${t.s5}' }`);
  }

  // 3. Ensure English stage titles are canonical
  if (lang === 'en') {
    content = content.replace(/stage3:\s*['"][^'"]+['"]/, `stage3: 'Stage 3: Advanced Techniques (Wing Family)'`);
    content = content.replace(/stage4:\s*['"][^'"]+['"]/, `stage4: 'Stage 4: Expert Techniques (Fish, Coloring & Unique Rectangle)'`);
    content = content.replace(/stage5:\s*['"][^'"]+['"]/, `stage5: 'Stage 5: Master Techniques (AIC, ALS & Exocet Chains)'`);
  }

  fs.writeFileSync(scrPath, content, 'utf8');
  console.log(`✅ Cleaned up ${lang}/screens.js`);
});
