import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

const shortAcademyTabs = {
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

const statsTabs = {
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

  // Fix Stats tabs
  if (statsTabs[lang]) {
    const st = statsTabs[lang];
    content = content.replace(/stats:\s*{[\s\S]*?tabs:\s*{[^}]+}/, (match) => {
      return match.replace(/tabs:\s*{[^}]+}/, `tabs: { stats: '${st.stats}', achievements: '${st.ach}' }`);
    });
  }

  // Fix Academy tabs
  if (shortAcademyTabs[lang]) {
    const at = shortAcademyTabs[lang];
    content = content.replace(/academy:\s*{[\s\S]*?tabs:\s*{[^}]+}/, (match) => {
      return match.replace(/tabs:\s*{[^}]+}/, `tabs: { stage1: '${at.s1}', stage2: '${at.s2}', stage3: '${at.s3}', stage4: '${at.s4}', stage5: '${at.s5}' }`);
    });
  }

  // Specific single items:
  // de: ghost -> 👻 Geist, hapticFx -> Haptisches Feedback
  if (lang === 'de') {
    content = content.replace(/rivalModes:\s*{[\s\S]*?ghost:\s*['"][^'"]+['"]/, (m) => m.replace(/ghost:\s*['"][^'"]+['"]/, `ghost: '👻 Geist'`));
    content = content.replace(/hapticFx:\s*['"]Haptisches Feedback \(Vibration\)['"]/, `hapticFx: 'Haptisches Feedback'`);
  }

  // hi: ghostHintNotice -> remove (PB)
  if (lang === 'hi') {
    content = content.replace(/ghostHintNotice:\s*['"][^'"]+['"]/, `ghostHintNotice: '💡 संकेत का उपयोग करने पर व्यक्तिगत सर्वश्रेष्ठ रिकॉर्ड में नहीं गिना जाएगा।'`);
  }

  // es-ES: achTitle -> 🏆 30 logros mundiales, privacySubtitle trailing space
  if (lang === 'es-ES') {
    content = content.replace(/achTitle:\s*['"][^'"]+['"]/, `achTitle: '🏆 30 logros mundiales'`);
    content = content.replace(/privacySubtitle:\s*['"][^'"]+['"]/, `privacySubtitle: 'Protección local'`);
  }

  // it: rivalModes.standard -> 🎯 Normale
  if (lang === 'it') {
    content = content.replace(/standard:\s*['"]🎯 Standard['"]/, `standard: '🎯 Normale'`);
  }

  // en: canonical stage titles
  if (lang === 'en') {
    content = content.replace(/stageTitles:\s*{[\s\S]*?stage5:\s*['"][^'"]+['"]/, `stageTitles: {
      stage1: 'Stage 1: Basic Techniques (Singles & Lines)',
      stage2: 'Stage 2: Intermediate Techniques (Pairs & Intersections)',
      stage3: 'Stage 3: Advanced Techniques (Wing Family)',
      stage4: 'Stage 4: Expert Techniques (Fish, Coloring & Unique Rectangle)',
      stage5: 'Stage 5: Master Techniques (AIC, ALS & Exocet Chains)'
    }`);
  }

  fs.writeFileSync(scrPath, content, 'utf8');
  console.log(`✅ Fully normalized ${lang}/screens.js`);
});
