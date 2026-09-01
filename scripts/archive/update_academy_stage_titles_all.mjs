import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

const stageTitleUpdates = {
  'en': {
    stage3: 'Stage 3: Advanced Techniques (Wing Family)',
    stage4: 'Stage 4: Expert Techniques (Fish, Coloring & Unique Rectangle)',
    stage5: 'Stage 5: Master Techniques (AIC, ALS & Exocet Chains)'
  },
  'ko': {
    stage3: '3단계: 고급 테크닉 (윙 시리즈)',
    stage4: '4단계: 전문가 테크닉 (대형 피쉬, 컬러링 & UR)',
    stage5: '5단계: 마스터 테크닉 (AIC, ALS & 엑소셋 체인)'
  },
  'ja': {
    stage3: '第3段階: 上級テクニック (Wingシリーズ)',
    stage4: '第4段階: 専門テクニック (Fish・カラーリング＆UR)',
    stage5: '第5段階: マスターテクニック (AIC・ALS＆Exocet連鎖)'
  },
  'zh-TW': {
    stage3: '第3階段: 高級技巧 (翼系解法)',
    stage4: '第4階段: 專家技巧 (魚類、著色法與唯一矩形)',
    stage5: '第5階段: 大師技巧 (AIC、ALS 與 飛魚 Exocet 連鎖)'
  },
  'zh-CN': {
    stage3: '第3阶段: 高级技巧 (翼系解法)',
    stage4: '第4阶段: 专家技巧 (鱼类、着色法与唯一矩形)',
    stage5: '第5阶段: 大师技巧 (AIC、ALS 与 飞鱼 Exocet 连锁)'
  },
  'es-ES': {
    stage3: 'Etapa 3: Técnicas Avanzadas (Familia Wing)',
    stage4: 'Etapa 4: Técnicas Expertas (Peces, Coloreado y Rectángulo Único)',
    stage5: 'Etapa 5: Técnicas Maestras (Cadenas AIC, ALS y Exocet)'
  },
  'fr': {
    stage3: 'Étape 3 : Techniques Avancées (Famille Wing)',
    stage4: 'Étape 4 : Techniques Expertes (Fish, Coloriage & Rectangle Unique)',
    stage5: 'Étape 5 : Techniques Maître (Chaînes AIC, ALS & Exocet)'
  },
  'de': {
    stage3: 'Stufe 3: Fortgeschrittene Techniken (Wing-Familie)',
    stage4: 'Stufe 4: Experten-Techniken (Fish, Coloring & Unique Rectangle)',
    stage5: 'Stufe 5: Meister-Techniken (AIC, ALS & Exocet-Ketten)'
  },
  'pt': {
    stage3: 'Etapa 3: Técnicas Avançadas (Família Wing)',
    stage4: 'Etapa 4: Técnicas Especialistas (Fish, Coloração & Retângulo Único)',
    stage5: 'Etapa 5: Técnicas Mestre (Cadeias AIC, ALS & Exocet)'
  },
  'it': {
    stage3: 'Tappa 3: Tecniche Avanzate (Famiglia Wing)',
    stage4: 'Tappa 4: Tecniche Esperti (Fish, Colorazione & Rettangolo Unico)',
    stage5: 'Tappa 5: Tecniche Maestro (Catene AIC, ALS & Exocet)'
  },
  'ru': {
    stage3: 'Этап 3: Продвинутые техники (Семейство Крыльев)',
    stage4: 'Этап 4: Экспертные техники (Рыбы, Раскраска и Уникальный прямоугольник)',
    stage5: 'Этап 5: Мастерские техники (Цепи AIC, ALS и Exocet)'
  },
  'ar': {
    stage3: 'المرحلة 3: التقنيات المتقدمة (سلاسل الأجنحة Wing)',
    stage4: 'المرحلة 4: تقنيات الخبراء (الأسماك، التلوين والمستطيل الفريد)',
    stage5: 'المرحلة 5: تقنيات الأساتذة (سلاسل AIC و ALS و Exocet)'
  },
  'hi': {
    stage3: 'चरण 3: उन्नत तकनीकें (विंग्स श्रृंखला)',
    stage4: 'चरण 4: विशेषज्ञ तकनीकें (फिश, कलरिंग और यूनीक रेक्टेंगल)',
    stage5: 'चरण 5: मास्टर तकनीकें (AIC, ALS और Exocet चेन्स)'
  }
};

for (const [lang, u] of Object.entries(stageTitleUpdates)) {
  const scrPath = path.join(localesDir, lang, 'screens.js');
  if (fs.existsSync(scrPath)) {
    let content = fs.readFileSync(scrPath, 'utf8');

    // Update inside stageTitles
    content = content.replace(/stage3:\s*['"][^'"]+['"]/, `stage3: '${u.stage3}'`);
    content = content.replace(/stage4:\s*['"][^'"]+['"]/, `stage4: '${u.stage4}'`);
    content = content.replace(/stage5:\s*['"][^'"]+['"]/, `stage5: '${u.stage5}'`);

    fs.writeFileSync(scrPath, content, 'utf8');
    console.log(`✅ Updated ${lang}/screens.js academy stage titles`);
  }
}
