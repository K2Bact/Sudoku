import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';

const LANGUAGES_DATA = [
  {
    folder: 'de-DE',
    code: 'de',
    langName: 'Deutsch',
    appName: 'Sudoku - Logik-Rätsel & Gehirn',
    shortDesc: 'Klassisches Sudoku, 32 Meister-Techniken, Gehirn-IQ & tägliche Herausforderungen',
    featureTitle: 'Sudoku Meister',
    featureSub: 'Klassik · 32 Akademie · Gehirn-IQ & 1v1 Duell',
    descFile: 'store_description_de.txt',
    fullDesc: `Sudoku Master ist ein erstklassiges Logik- und Gehirntrainingsspiel für Anfänger und Profis gleichermaßen.

Genießen Sie den puren Denkspaß, intuitive haptische Rückmeldung und eine integrierte Sudoku-Akademie mit 32 echten Meister-Techniken.

━━━━━━━━━━━━━━━━━━━━━
🌟 HIGHLIGHTS VON SUIDOKU
━━━━━━━━━━━━━━━━━━━━━

🧩 1. 5 Klassische Schwierigkeitsstufen
- Von Sehr Einfach (Very Easy) bis Meister (Expert)
- 100% mathematisch garantierte eindeutige Lösungen
- 4 augenfreundliche Premium-Themes (Clay, Dark, Ceramic, Paper)

🎓 2. Sudoku-Akademie mit 32 Techniken
- Schritt-für-Schritt visuelles Training für Anfänger bis Großmeister
- Singles, Naked/Hidden Pairs, Pointing Lines
- Wings, X-Wing, Swordfish, Jellyfish, XY-Wing, XYZ-Wing
- Profi: 3D Medusa, Unique Rectangle, AIC & ALS Chains

⚔️ 3. Echtzeit 1v1 Battle & AI Bot Duell
- Lösen Sie dasselbe Board gleichzeitig gegen weltweite Spieler oder smarte KI-Gegner!

🧠 4. Detaillierter Gehirn-IQ-Bericht
- Messen Sie Ihre 5 kognitiven Fähigkeiten: Fokus, Logik, Geschwindigkeit, Ausdauer und Genauigkeit.

📅 5. 365 Tage Tägliche Herausforderungen
- Jeden Tag ein neues Rätsel, Monatsabzeichen und lückenlose Kalender-Stempel.

Laden Sie Sudoku Master jetzt herunter und trainieren Sie Ihr Gehirn jeden Tag aufs Neue!`
  },
  {
    folder: 'fr-FR',
    code: 'fr',
    langName: 'Français',
    appName: 'Sudoku - Casse-tête & Logique',
    shortDesc: 'Sudoku classique, 32 techniques, rapport QI cérébral & défis quotidiens 365',
    featureTitle: 'Maître du Sudoku',
    featureSub: 'Classique · 32 Techniques · Rapport QI & Duel 1v1',
    descFile: 'store_description_fr.txt',
    fullDesc: `Sudoku Master est un jeu de puzzle et d'entraînement cérébral haut de gamme conçu pour tous les passionnés de logique.

Découvrez le plaisir de la déduction pure avec 32 techniques authentiques enseignées pas à pas.

━━━━━━━━━━━━━━━━━━━━━
🌟 LES ATOUTS DE SUIDOKU
━━━━━━━━━━━━━━━━━━━━━

🧩 1. 5 Niveaux de Difficulté Classiques
- De Très Facile à Expert
- Grilles 100% uniques et solubles par pure déduction logique
- 4 thèmes visuels reposants et élégants

🎓 2. Académie Sudoku en 32 Leçons
- Apprenez toutes les techniques étape par étape
- Débutant : Hidden Singles, Paires nues
- Avancé : X-Wing, Swordfish, Jellyfish, XY-Wing
- Expert : 3D Medusa, Unique Rectangle, chaînes AIC et ALS

⚔️ 3. Duel 1v1 en Temps Réel et Matchs IA
- Défiez des joueurs du monde entier ou affrontez nos robots IA ultra-rapides.

🧠 4. Rapport de QI Cérébral Personnalisé
- Analyse précise de vos 5 piliers cognitifs : concentration, logique, vitesse, endurance et précision.

📅 5. Défis Quotidiens 365 Jours
- Un nouveau défi chaque jour et des trophées mensuels à débloquer.

Téléchargez Sudoku dès maintenant et boostez votre cerveau au quotidien !`
  },
  {
    folder: 'pt-BR',
    code: 'pt',
    langName: 'Português',
    appName: 'Sudoku - Jogo de Lógica & QI',
    shortDesc: 'Sudoku clássico, 32 técnicas de mestre, relatório de QI e desafio diário 365',
    featureTitle: 'Mestre do Sudoku',
    featureSub: 'Clássico · 32 Técnicas · QI Cerebral & Batalha 1v1',
    descFile: 'store_description_pt.txt',
    fullDesc: `Sudoku Master é o jogo definitivo de raciocínio lógico e treino mental para jogadores de todos os níveis.

Exercite seu cérebro com o prazer da lógica pura e aprenda 32 técnicas oficiais na Academia de Sudoku.

━━━━━━━━━━━━━━━━━━━━━
🌟 DIFERENCIAIS DO SUIDOKU
━━━━━━━━━━━━━━━━━━━━━

🧩 1. 5 Níveis de Dificuldade Equilibrados
- Do Muito Fácil ao Especialista
- Soluções 100% únicas e verificadas matematicamente
- 4 temas visuais confortáveis para os olhos

🎓 2. Academia de Sudoku com 32 Técnicas
- Tutoriais interativos do básico ao nível Grão-Mestre
- Simples: Hidden Single, Pares e Trios
- Avançado: X-Wing, Swordfish, Jellyfish, XY-Wing
- Mestre: 3D Medusa, Unique Rectangle e Cadeias AIC/ALS

⚔️ 3. Batalha 1v1 em Tempo Real e Duelos contra IA
- Disputas eletrizantes no mesmo tabuleiro contra jogadores do mundo todo ou robôs IA.

🧠 4. Relatório de QI Mental
- Avaliação detalhada de 5 habilidades cognitivas: foco, lógica, agilidade, persistência e precisão.

📅 5. Desafio Diário dos 365 Dias
- Puzzles diários inéditos, medalhas mensais e calendário completo de presença.

Baixe o Sudoku Master agora e leve sua mente para o próximo nível!`
  },
  {
    folder: 'it-IT',
    code: 'it',
    langName: 'Italiano',
    appName: 'Sudoku - Gioco di Logica & QI',
    shortDesc: 'Sudoku classico, 32 tecniche, rapporto QI mentale & sfide quotidiane 365',
    featureTitle: 'Maestro di Sudoku',
    featureSub: 'Classico · 32 Tecniche · Rapporto QI & Battaglia 1v1',
    descFile: 'store_description_it.txt',
    fullDesc: `Sudoku Master è il gioco di logica e allenamento cerebrale di nuova generazione perfetto per principianti ed esperti.

Vivi il piacere della deduzione pura e scopri i segreti del gioco con la nostra esclusiva Accademia di Sudoku.

━━━━━━━━━━━━━━━━━━━━━
🌟 CARATTERISTICHE PRINCIPALI
━━━━━━━━━━━━━━━━━━━━━

🧩 1. 5 Livelli di Difficoltà Classici
- Da Molto Facile a Esperto
- Schemi matematicamente perfetti con soluzione unica garantita
- 4 temi eleganti e rilassanti per la vista

🎓 2. Accademia di Sudoku con 32 Tecniche
- Impara passo dopo passo con esempi visivi interattivi
- Base: Singoli Nascosti, Coppie e Terzine
- Avanzato: X-Wing, Swordfish, Jellyfish, XY-Wing
- Esperto: 3D Medusa, Rettangolo Unico, Catene AIC e ALS

⚔️ 3. Battaglia 1v1 in Tempo Reale & Sfide contro IA
- Sfida avversari da tutto il mondo o allenati contro bot intelligenti.

🧠 4. Analisi del QI Cerebrale
- Misura le tue 5 abilità cognitive: concentrazione, logica, velocità, resistenza e accuratezza.

📅 5. Sfide Giornaliere 365 Giorni
- Nuovi puzzle ogni giorno con trofei mensili collezionabili.

Scarica subito Sudoku Master e allena la tua mente ogni giorno!`
  },
  {
    folder: 'ru-RU',
    code: 'ru',
    langName: 'Русский',
    appName: 'Судоку - Логика и IQ мозга',
    shortDesc: 'Классический судоку, 32 техники, отчет IQ мозга и ежедневные испытания 365',
    featureTitle: 'Мастер Судоку',
    featureSub: 'Классика · 32 Техники · IQ Мозга & 1v1 Битва',
    descFile: 'store_description_ru.txt',
    fullDesc: `Судоку Мастер (Sudoku) — это премиальная логическая игра и тренажер для мозга нового поколения, созданный как для новичков, так и для профессионалов.

Наслаждайтесь чистой логикой, приятным тактильным откликом и пошаговой Академией судоку из 32 классических техник.

━━━━━━━━━━━━━━━━━━━━━
🌟 ОСОБЕННОСТИ SUIDOKU
━━━━━━━━━━━━━━━━━━━━━

🧩 1. 5 Классических Уровней Сложности
- От Очень Легкого до Эксперта
- 100% уникальные математически выверенные решения
- 4 стильные и комфортные для глаз темы оформления

🎓 2. Академия Судоку: 32 Техники Решения
- Интерактивное обучение от основ до уровня Грандмастера
- Базовые: Одиночки, Открытые/Скрытые пары и тройки
- Продвинутые: X-Wing, Swordfish, Jellyfish, XY-Wing
- Эксперт: 3D Medusa, Unique Rectangle, цепи AIC и ALS

⚔️ 3. Онлайн Битва 1 на 1 и Дуэли с ИИ
- Соревнуйтесь на одинаковых полях в реальном времени с игроками со всего мира или умными ботами.

🧠 4. Детальный Отчет IQ Мозга
- Оценка 5 когнитивных навыков: концентрация, логика, скорость мышления, выносливость и точность.

📅 5. 365 Дней Ежедневных Испытаний
- Новая головоломка каждый день, ежемесячные кубки и отметки в календаре.

Скачайте Судоку Мастер прямо сейчас и развивайте свой интеллект ежедневно!`
  },
  {
    folder: 'hi-IN',
    code: 'hi',
    langName: 'हिन्दी',
    appName: 'सुडोकू - लॉजिक और ब्रेन IQ',
    shortDesc: 'क्लासिक सुडोकू, 32 मास्टर तकनीकें, ब्रेन IQ रिपोर्ट और 365 दैनिक चुनौतियाँ',
    featureTitle: 'सुडोकू मास्टर',
    featureSub: 'क्लासिक · 32 तकनीकें · ब्रेन IQ & 1v1 मुकाबला',
    descFile: 'store_description_hi.txt',
    fullDesc: `सुडोकू मास्टर (Sudoku) शुरुआती और प्रो खिलाड़ियों दोनों के लिए डिज़ाइन किया गया एक बेहतरीन लॉजिक और ब्रेन ट्रेनिंग गेम है।

32 प्रामाणिक तकनीकों के साथ शुद्ध तर्क और मस्तिष्क प्रशिक्षण का आनंद लें।

━━━━━━━━━━━━━━━━━━━━━
🌟 SUIDOKU की मुख्य विशेषताएं
━━━━━━━━━━━━━━━━━━━━━

🧩 1. 5 क्लासिक कठिनाई स्तर
- बहुत आसान (Very Easy) से लेकर एक्सपर्ट (Expert) तक
- 100% गारंटीकृत अद्वितीय समाधान
- आंखों के लिए 4 आरामदायक और सुंदर थीम

🎓 2. 32 तकनीकों वाली सुडोकू अकादमी
- शुरुआत से लेकर ग्रैंडमास्टर स्तर तक चरण-दर-चरण सीखें
- बेसिक: हिडन सिंगल्स, नेकेड पेयर्स
- एडवांस्ड: X-Wing, Swordfish, Jellyfish, XY-Wing
- एक्सपर्ट: 3D Medusa, Unique Rectangle, AIC चेन्स

⚔️ 3. रीयल-टाइम 1v1 बैटल और AI मुकाबला
- दुनिया भर के खिलाड़ियों या स्मार्ट AI बॉट्स के साथ तेज़ गति में मुकाबला करें।

🧠 4. मस्तिष्क IQ विश्लेषण रिपोर्ट
- अपनी 5 संज्ञानात्मक क्षमताओं को मापें: एकाग्रता, तर्क, गति, सहनशक्ति और सटीकता।

📅 5. 365 दिन की दैनिक चुनौतियाँ
- हर दिन एक नई पहेली, मासिक पदक और उपस्थिति कैलेंडर।

आज ही सुडोकू मास्टर डाउनलोड करें और अपने दिमाग को तेज़ बनाएं!`
  },
  {
    folder: 'ar-SA',
    code: 'ar',
    langName: 'العربية',
    appName: 'سودوكو - لغز المنطق والذكاء',
    shortDesc: 'سودوكو كلاسيكي، 32 تقنية احترافية، تقرير معدل الذكاء وتحديات يومية 365',
    featureTitle: 'أستاذ السودوكو',
    featureSub: 'كلاسيكي · 32 تقنية · تقرير الذكاء & مبارزة 1 ضد 1',
    descFile: 'store_description_ar.txt',
    fullDesc: `سودوكو ماستر (Sudoku) هي لعبة ألغاز منطقية وتدريب ذهني متميزة مصممة للمبتدئين والخبراء على حد سواء.

استمتع بمتعة التفكير الاستنتاجي ودعم كامل للغة العربية واتجاه القراءة من اليمين إلى اليسار (RTL) مع أكاديمية سودوكو تضم 32 تقنية أصلية.

━━━━━━━━━━━━━━━━━━━━━
🌟 مميزات لعبة SUIDOKU
━━━━━━━━━━━━━━━━━━━━━

🧩 1. 5 مستويات صعوبة كلاسيكية
- من سهل جداً إلى خبير
- ألغاز ذات حلول فريدة وصحيحة رياضياً بنسبة 100%
- 4 مظاهر مريحة للعين وتصميمات أنيقة

🎓 2. أكاديمية سودوكو لتعليم 32 تقنية
- تدريب عملي تفاعلي من الأساسيات إلى رتبة الأستاذ الكبير
- المبتدئ: الخلايا الفردية، الأزواج المكشوفة والمخفية
- المتقدم: X-Wing, Swordfish, Jellyfish, XY-Wing
- الخبير: 3D Medusa, Unique Rectangle, سلاسل AIC و ALS

⚔️ 3. مبارزة مباشرة 1 ضد 1 ومباريات الذكاء الاصطناعي
- تنافس في الوقت الفعلي على نفس اللوحة ضد لاعبين من حول العالم أو روبوتات الذكاء الاصطناعي السريعة.

🧠 4. تقرير معدل الذكاء الذهني (Brain IQ)
- قياس وتحليل دقيق لـ 5 قدرات معرفية: التركيز، التفكير المنطقي، سرعة المعالجة، والتحمل والدقة.

📅 5. 365 يوماً من التحديات اليومية
- لغز متجدد كل يوم، أوسمة شهرية وسجل حضور متكامل.

حمّل سودوكو ماستر الآن واختبر قدرات عقلك الذهنية يومياً!`
  }
];

async function generateAssets() {
  console.log('🚀 Generating Multi-Language Store Assets for 7 Languages...');
  const browser = await chromium.launch({ headless: true });

  for (const lang of LANGUAGES_DATA) {
    const dir = join('store_assets', lang.folder);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // 1. Text Assets File
    const textContent = `[앱 이름 (App name - 최대 30자)]
${lang.appName}

[간단한 설명 (Short description - 최대 80자)]
${lang.shortDesc}

[자세한 설명 (Full description - 최대 4000자)]
${lang.fullDesc}
`;
    writeFileSync(join(dir, lang.descFile), textContent, 'utf8');
    console.log(`📝 [${lang.langName}] Saved text assets: ${join(dir, lang.descFile)}`);

    // 2. Feature Graphic (1024x500)
    const featureHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1024px; height: 500px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          display: flex; align-items: center; justify-content: space-between;
          padding: 50px 80px;
          font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .left { max-width: 520px; z-index: 2; }
        .pill { display: inline-block; background: rgba(59, 130, 246, 0.2); border: 1.5px solid #3b82f6; color: #60a5fa; padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 14px; margin-bottom: 16px; }
        h1 { font-size: 42px; font-weight: 900; line-height: 1.25; margin-bottom: 14px; letter-spacing: -0.5px; }
        h1 span { color: #60a5fa; }
        p { font-size: 18px; color: #94a3b8; line-height: 1.5; font-weight: 500; }
        .right { z-index: 2; }
        .board-card {
          width: 280px; height: 280px;
          background: #ffffff; border-radius: 36px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 8px rgba(255,255,255,0.1);
          display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
          gap: 8px; padding: 22px;
          transform: rotate(-3deg);
        }
        .cell {
          background: #f1f5f9; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; font-weight: 900; color: #1e293b;
        }
        .cell.blue { background: #2563eb; color: #fff; }
        .cell.gold { background: #f59e0b; color: #fff; }
      </style>
    </head>
    <body>
      <div class="left">
        <div class="pill">🌟 SUIDOKU</div>
        <h1>${lang.featureTitle}<br><span>${lang.langName}</span></h1>
        <p>${lang.featureSub}</p>
      </div>
      <div class="right">
        <div class="board-card">
          <div class="cell blue">5</div>
          <div class="cell">3</div>
          <div class="cell gold">7</div>
          <div class="cell">6</div>
          <div class="cell blue">1</div>
          <div class="cell">9</div>
          <div class="cell gold">8</div>
          <div class="cell">4</div>
          <div class="cell blue">2</div>
        </div>
      </div>
    </body>
    </html>
    `;

    const page = await browser.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
    await page.setContent(featureHtml, { waitUntil: 'load' });
    await page.screenshot({ path: join(dir, 'feature_graphic_1024x500.png'), type: 'png' });
    await page.close();
    console.log(`🖼️ [${lang.langName}] Generated: ${join(dir, 'feature_graphic_1024x500.png')}`);

    // 3. Copy/Link screenshots from ko-KR/en-US base
    for (let i = 1; i <= 6; i++) {
      const src = join('store_assets/ko-KR', `screenshot_real_0${i}.png`);
      const dest = join(dir, `screenshot_real_0${i}.png`);
      if (existsSync(src)) {
        copyFileSync(src, dest);
      }
    }
  }

  await browser.close();
  console.log('\n🎉 ALL 7 LANGUAGES STORE ASSETS GENERATED PERFECTLY!');
}

generateAssets().catch(err => {
  console.error(err);
  process.exit(1);
});
