import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOCALES = [
  {
    folder: 'ar-SA',
    isRTL: true,
    fontFamily: '"Pretendard", "Segoe UI", Tahoma, Arial, sans-serif',
    shots: [
      {
        tag: '📅 تحديات يومية متجددة',
        title: '365 يوماً من التحديات اليومية<br>شارات شهرية حصرية',
        calTitle: 'تحديات أغسطس 2026',
        calStatus: 'تم إكمال 15 / 31',
        missionTag: '🎯 مهمة اليوم الخاصة',
        missionTitle: '[مستوى 3 متوسط] حل لغز سودوكو 1',
        missionDesc: 'أكمل لغزاً لاختبار مهاراتك الاستنتاجية.',
        missionBtn: 'بدء المهمة 🚀'
      },
      {
        tag: '⚡ تجربة لعب نقية ومريحة',
        title: '5 مستويات صعوبة كلاسيكية<br>ملاحظات ذكية وتلميحات',
        level: 'مستوى 3 متوسط',
        timer: '⏱️ 02:45',
        mistakes: 'الأخطاء 0/3',
        actUndo: '↩️ تراجع',
        actErase: '🧹 مسح',
        actNotes: '✏️ ملاحظات',
        actHint: '💡 تلميح (3)'
      },
      {
        tag: '🎓 تعلّم أسرار الاحتراف',
        title: 'أكاديمية سودوكو 32 تقنية<br>تدريب عملي تفاعلي',
        tab1: 'المرحلة 1: الأساسيات',
        tab2: 'المرحلة 2: الأزواج',
        tab3: 'المرحلة 3: الأجنحة',
        lTitle: 'الخلية الفردية المخفية (Hidden Single)',
        lDesc: 'استنتاج الرقم الوحيد الممكن في الصف أو العمود أو المربع.',
        pBox: '🎯 تدريب عملي: انقر على الرقم الصحيح للخلية [?]'
      },
      {
        tag: '⚔️ سرعة وذكاء اصطناعي',
        title: 'مبارزة 1:1 ضد الذكاء الاصطناعي<br>تحديات سرعة مباشرة',
        tab1: 'روبوت مبتدئ',
        tab2: 'روبوت محترف',
        tab3: 'AlphaDoku أستاذ',
        lTitle: 'مباراة سريعة ضد روبوت الذكاء الاصطناعي',
        lDesc: 'تنافس في الوقت الفعلي على نفس اللوحة وحقق أسرع وقت!',
        pBox: '🚀 بدء المبارزة السريعة الآن'
      },
      {
        tag: '🧠 تحليل إدراكي متكامل',
        title: 'تقرير معدل الذكاء الذهني<br>5 ركائز عقلية وتصنيف نخبوي',
        heroLabel: 'معدل ذكاء سودوكو الخاص بك',
        iqVal: '142',
        iqTier: '👑 مستوى مينسا (أفضل 2.4%)',
        s1: '🎯 التركيز العميق',
        s2: '💡 التفكير المنطقي',
        s3: '⚡ سرعة المعالجة',
        s4: '🎯 دقة الحل',
        shareBtn: '🔗 مشاركة تقرير الذكاء الذهني'
      },
      {
        tag: '🏆 منافسة وتخصيص',
        title: 'قوائم المتصدرين العالمية<br>4 مظاهر جمالية مريحة للعين',
        tab1: 'ترتيب كلاسيكي',
        tab2: 'ترتيب السرعة',
        tab3: 'معدل الذكاء',
        lTitle: 'قائمة مشاهير العالم (TOP 10)',
        lDesc: 'نافس أمهر لاعبي السودوكو وسجل اسمك في القمة!',
        pBox: '🎨 4 مظاهر: طين، راتنج داكن، سيراميك، ورق سويسري'
      }
    ]
  },
  {
    folder: 'de-DE',
    isRTL: false,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif',
    shots: [
      {
        tag: '📅 Tägliche Rätsel',
        title: '365 Tage Herausforderungen<br>Monatliche Meister-Abzeichen',
        calTitle: 'August 2026 Herausforderung',
        calStatus: '15 / 31 Gelöst',
        missionTag: '🎯 Heutige Spezial-Mission',
        missionTitle: '[Lv.3 Mittel] 1 Sudoku lösen',
        missionDesc: 'Nutzen Sie logische Deduktion für die Lösung.',
        missionBtn: 'Mission Starten 🚀'
      },
      {
        tag: '⚡ Echtes Taktiles Feedback',
        title: '5 Klassische Schwierigkeitsstufen<br>Notizen & Smarte Hinweise',
        level: 'Lv.3 Mittel',
        timer: '⏱️ 02:45',
        mistakes: 'Fehler 0/3',
        actUndo: '↩️ Rückgängig',
        actErase: '🧹 Löschen',
        actNotes: '✏️ Notizen',
        actHint: '💡 Hinweis (3)'
      },
      {
        tag: '🎓 Meister-Techniken Lernen',
        title: 'Sudoku-Akademie mit 32 Lektionen<br>Interaktives Praxistraining',
        tab1: 'Stufe 1: Basics',
        tab2: 'Stufe 2: Paare',
        tab3: 'Stufe 3: Wings',
        lTitle: 'Hidden Single (Versteckte Einer)',
        lDesc: 'Finden Sie die einzige Zelle für eine bestimmte Zahl.',
        pBox: '🎯 Praxisaufgabe: Tippen Sie die Zielzahl für [?]'
      },
      {
        tag: '⚔️ Echtzeit KI-Duell',
        title: '1:1 KI-Bot Geschwindigkeitsduell<br>Echtzeit-Rennen auf Zeit',
        tab1: 'Anfänger Bot',
        tab2: 'Experten Bot',
        tab3: 'AlphaDoku Meister',
        lTitle: '1:1 Speedmatch gegen smarte KI',
        lDesc: 'Gleiches Board, maximale Geschwindigkeit!',
        pBox: '🚀 KI-Duell Jetzt Starten'
      },
      {
        tag: '🧠 Gehirntraining & Analyse',
        title: 'Detaillierter Gehirn-IQ-Bericht<br>5 Kognitive Fähigkeiten & Tiers',
        heroLabel: 'Ihr Sudoku-Gehirn-IQ',
        iqVal: '142',
        iqTier: '👑 Mensa-Niveau (Top 2.4%)',
        s1: '🎯 Tiefer Fokus',
        s2: '💡 Logische Deduktion',
        s3: '⚡ Verarbeitungs-Speed',
        s4: '🎯 Lösungs-Genauigkeit',
        shareBtn: '🔗 Gehirn-Bericht Teilen'
      },
      {
        tag: '🏆 Globale Rangliste',
        title: 'Weltweite Bestenlisten<br>4 Elegante Premium-Themes',
        tab1: 'Klassik-Rang',
        tab2: 'Speedrun',
        tab3: 'Gehirn-IQ',
        lTitle: 'Globale Hall of Fame (TOP 10)',
        lDesc: 'Messen Sie sich mit den besten Denkern der Welt!',
        pBox: '🎨 Themes: Warm Clay, Matte Dark, Pure Ceramic, Paper'
      }
    ]
  },
  {
    folder: 'fr-FR',
    isRTL: false,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif',
    shots: [
      {
        tag: '📅 Défis Quotidiens',
        title: 'Défis Quotidiens 365 Jours<br>Trophées Mensuels à Débloquer',
        calTitle: 'Défis Août 2026',
        calStatus: '15 / 31 Complétés',
        missionTag: '🎯 Mission Spéciale du Jour',
        missionTitle: '[Lv.3 Moyen] Résoudre 1 Sudoku',
        missionDesc: 'Appliquez la pure déduction pour réussir.',
        missionBtn: 'Commencer la Mission 🚀'
      },
      {
        tag: '⚡ Confort de Jeu Idéal',
        title: '5 Niveaux de Difficulté Équilibrés<br>Notes Crayon & Indices Futés',
        level: 'Lv.3 Moyen',
        timer: '⏱️ 02:45',
        mistakes: 'Erreurs 0/3',
        actUndo: '↩️ Annuler',
        actErase: '🧹 Effacer',
        actNotes: '✏️ Notes',
        actHint: '💡 Indice (3)'
      },
      {
        tag: '🎓 Académie Sudoku',
        title: '32 Techniques Authentiques<br>Entraînement Visuel et Interactif',
        tab1: 'Étape 1 : Base',
        tab2: 'Étape 2 : Paires',
        tab3: 'Étape 3 : Wings',
        lTitle: 'Hidden Single (Candidat Unique)',
        lDesc: 'Identifiez le seul emplacement valide pour un chiffre donné.',
        pBox: '🎯 Exercice : Touchez le chiffre cible pour [?]'
      },
      {
        tag: '⚔️ Duel IA en Direct',
        title: 'Duel 1:1 contre l’Intelligence Artificielle<br>Course de Vitesse en Temps Réel',
        tab1: 'Bot Débutant',
        tab2: 'Bot Expert',
        tab3: 'AlphaDoku Maître',
        lTitle: 'Match de vitesse 1v1 contre l’IA',
        lDesc: 'Même grille, faites preuve de rapidité absolue !',
        pBox: '🚀 Lancer le Duel IA'
      },
      {
        tag: '🧠 Analyse Cognitive',
        title: 'Rapport de QI Cérébral Complet<br>5 Piliers Cognitifs & Rang Mondial',
        heroLabel: 'Votre QI Sudoku Estimé',
        iqVal: '142',
        iqTier: '👑 Niveau Mensa (Top 2.4%)',
        s1: '🎯 Concentration',
        s2: '💡 Déduction Logique',
        s3: '⚡ Vitesse d’Exécution',
        s4: '🎯 Précision Pure',
        shareBtn: '🔗 Partager le Rapport de QI'
      },
      {
        tag: '🏆 Compétition & Thèmes',
        title: 'Classement Mondial Google Play<br>4 Thèmes Élégants et Reposants',
        tab1: 'Rang Classique',
        tab2: 'Speedrun',
        tab3: 'QI Cérébral',
        lTitle: 'Temple de la Renommée Mondial',
        lDesc: 'Affrontez les plus grands maîtres du monde entier !',
        pBox: '🎨 Thèmes : Céramique, Résine Sombre, Argile, Papier'
      }
    ]
  },
  {
    folder: 'pt-BR',
    isRTL: false,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif',
    shots: [
      {
        tag: '📅 Desafios Diários',
        title: 'Desafio Diário dos 365 Dias<br>Medalhas e Troféus Mensais',
        calTitle: 'Desafio de Agosto 2026',
        calStatus: '15 / 31 Concluídos',
        missionTag: '🎯 Missão Especial de Hoje',
        missionTitle: '[Lv.3 Médio] Concluir 1 Sudoku',
        missionDesc: 'Desenvolva seu raciocínio lógico no nível médio.',
        missionBtn: 'Iniciar Missão 🚀'
      },
      {
        tag: '⚡ Toque Preciso e Elegante',
        title: '5 Níveis de Dificuldade Clássicos<br>Modo Anotações & Dicas Inteligentes',
        level: 'Lv.3 Médio',
        timer: '⏱️ 02:45',
        mistakes: 'Erros 0/3',
        actUndo: '↩️ Desfazer',
        actErase: '🧹 Apagar',
        actNotes: '✏️ Notas',
        actHint: '💡 Dica (3)'
      },
      {
        tag: '🎓 Academia de Sudoku',
        title: '32 Técnicas Oficiais de Mestres<br>Aulas Práticas e Interativas',
        tab1: 'Fase 1: Básica',
        tab2: 'Fase 2: Pares',
        tab3: 'Fase 3: Wings',
        lTitle: 'Hidden Single (Único Oculto)',
        lDesc: 'Encontre a única célula possível para um número na linha/bloco.',
        pBox: '🎯 Exercício: Toque no número correto para a célula [?]'
      },
      {
        tag: '⚔️ Duelo contra Robôs IA',
        title: 'Duelo 1:1 em Tempo Real contra IA<br>Disputa de Velocidade Pura',
        tab1: 'Bot Novato',
        tab2: 'Bot Perito',
        tab3: 'AlphaDoku Mestre',
        lTitle: 'Partida Rápida 1:1 contra IA',
        lDesc: 'Mesmo tabuleiro, dispute quem resolve primeiro!',
        pBox: '🚀 Iniciar Batalha contra IA'
      },
      {
        tag: '🧠 Avaliação de Desempenho',
        title: 'Relatório de QI Cerebral Completo<br>5 Pilares Cognitivos e Rankings',
        heroLabel: 'Seu QI de Raciocínio Sudoku',
        iqVal: '142',
        iqTier: '👑 Nível Mensa (Top 2.4%)',
        s1: '🎯 Foco Profundo',
        s2: '💡 Lógica e Dedução',
        s3: '⚡ Agilidade Mental',
        s4: '🎯 Precisão de Acerto',
        shareBtn: '🔗 Compartilhar Relatório de QI'
      },
      {
        tag: '🏆 Hall da Fama Global',
        title: 'Classificações Mundiais em Tempo Real<br>4 Temas Visuais Confortáveis',
        tab1: 'Clássico',
        tab2: 'Speedrun',
        tab3: 'QI Mental',
        lTitle: 'Hall da Fama Global (TOP 10)',
        lDesc: 'Conquiste o topo entre os melhores jogadores do mundo!',
        pBox: '🎨 Temas: Cerâmica Quente, Dark Resina, Argila, Papel Suíço'
      }
    ]
  },
  {
    folder: 'it-IT',
    isRTL: false,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif',
    shots: [
      {
        tag: '📅 Sfide Quotidiane',
        title: 'Sfide Giornaliere 365 Giorni<br>Trofei e Distintivi Mensili',
        calTitle: 'Sfide Agosto 2026',
        calStatus: '15 / 31 Completati',
        missionTag: '🎯 Missione Speciale di Oggi',
        missionTitle: '[Lv.3 Medio] Risolvi 1 Sudoku',
        missionDesc: 'Allena la logica con uno schema di livello medio.',
        missionBtn: 'Inizia Missione 🚀'
      },
      {
        tag: '⚡ Esperienza di Gioco Pura',
        title: '5 Livelli di Difficoltà Classici<br>Note a Matita e Suggerimenti',
        level: 'Lv.3 Medio',
        timer: '⏱️ 02:45',
        mistakes: 'Errori 0/3',
        actUndo: '↩️ Annulla',
        actErase: '🧹 Cancella',
        actNotes: '✏️ Note',
        actHint: '💡 Suggerimento (3)'
      },
      {
        tag: '🎓 Accademia di Sudoku',
        title: '32 Tecniche di Risoluzione<br>Esercizi Pratici e Interattivi',
        tab1: 'Fase 1: Base',
        tab2: 'Fase 2: Coppie',
        tab3: 'Fase 3: Wings',
        lTitle: 'Hidden Single (Singolo Nascosto)',
        lDesc: 'Individua l’unica posizione valida per un numero nel settore.',
        pBox: '🎯 Esercizio: Tocca il numero corretto per la cella [?]'
      },
      {
        tag: '⚔️ Sfida Diretta contro IA',
        title: 'Duello 1:1 contro Bot Intelligenti<br>Risoluzione Rapida in Tempo Reale',
        tab1: 'Bot Base',
        tab2: 'Bot Esperto',
        tab3: 'AlphaDoku Maestro',
        lTitle: 'Gara di velocità 1v1 contro IA',
        lDesc: 'Stesso schema, vince chi completa prima senza errori!',
        pBox: '🚀 Inizia Duello contro IA'
      },
      {
        tag: '🧠 Misurazione del QI',
        title: 'Analisi del QI Cerebrale Dettagliata<br>5 Abilità Cognitive & Percentile',
        heroLabel: 'Il Tuo QI Sudoku Calcolato',
        iqVal: '142',
        iqTier: '👑 Livello Mensa (Top 2.4%)',
        s1: '🎯 Massima Concentrazione',
        s2: '💡 Deduzione Logica',
        s3: '⚡ Velocità di Calcolo',
        s4: '🎯 Accuratezza e Precisione',
        shareBtn: '🔗 Condividi Analisi del QI'
      },
      {
        tag: '🏆 Classifiche Mondiali',
        title: 'Classifica Globale Google Play<br>4 Temi Visivi Rilassanti',
        tab1: 'Classico',
        tab2: 'Speedrun',
        tab3: 'QI Mentale',
        lTitle: 'Hall of Fame Mondiale (TOP 10)',
        lDesc: 'Scala le classifiche contro i maestri di logica mondiali!',
        pBox: '🎨 4 Temi: Ceramica, Resina Scura, Argilla, Carta Svizzera'
      }
    ]
  },
  {
    folder: 'ru-RU',
    isRTL: false,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif',
    shots: [
      {
        tag: '📅 Ежедневные Испытания',
        title: '365 Дней Ежедневных Испытаний<br>Ежемесячные Кубки Мастера',
        calTitle: 'Испытания Август 2026',
        calStatus: '15 / 31 Завершено',
        missionTag: '🎯 Особая Миссия Дня',
        missionTitle: '[Ур.3 Средний] Решить 1 Судоку',
        missionDesc: 'Примените чистую логику для решения головоломки.',
        missionBtn: 'Начать Миссию 🚀'
      },
      {
        tag: '⚡ Максимальное Удобство',
        title: '5 Классических Уровней Сложности<br>Режим Заметок и Подсказки',
        level: 'Ур.3 Средний',
        timer: '⏱️ 02:45',
        mistakes: 'Ошибки 0/3',
        actUndo: '↩️ Отмена',
        actErase: '🧹 Стереть',
        actNotes: '✏️ Заметки',
        actHint: '💡 Подсказка (3)'
      },
      {
        tag: '🎓 Академия Судоку',
        title: '32 Профессиональные Техники<br>Пошаговое Интерактивное Обучение',
        tab1: 'Этап 1: Базовый',
        tab2: 'Этап 2: Пары',
        tab3: 'Этап 3: Wings',
        lTitle: 'Скрытая Одиночка (Hidden Single)',
        lDesc: 'Нахождение единственной клетки для цифры в строке/блоке.',
        pBox: '🎯 Практика: Нажмите правильную цифру для клетки [?]'
      },
      {
        tag: '⚔️ Дуэль с Умным ИИ',
        title: '1:1 Битва на Скорость против ИИ<br>Соревнование в Реальном Времени',
        tab1: 'Новичок Бот',
        tab2: 'Профи Бот',
        tab3: 'Грандмастер AlphaDoku',
        lTitle: 'Скоростной матч 1 на 1 против ИИ',
        lDesc: 'Одинаковое поле, решите быстрее бота без ошибок!',
        pBox: '🚀 Начать Дуэль с ИИ'
      },
      {
        tag: '🧠 Интеллектуальный Анализ',
        title: 'Полный Отчет IQ Мозга<br>5 Когнитивных Навыков и Ранг',
        heroLabel: 'Ваш Уровень IQ в Судоку',
        iqVal: '142',
        iqTier: '👑 Уровень Менса (Топ 2.4%)',
        s1: '🎯 Глубокая Концентрация',
        s2: '💡 Логическое Мышление',
        s3: '⚡ Скорость Обработки',
        s4: '🎯 Точность Решений',
        shareBtn: '🔗 Поделиться Отчетом IQ'
      },
      {
        tag: '🏆 Мировой Рейтинг',
        title: 'Глобальные Таблицы Лидеров<br>4 Приятных Темы Оформления',
        tab1: 'Классика',
        tab2: 'Спидран',
        tab3: 'IQ Мозга',
        lTitle: 'Мировой Зал Славы (ТОП 10)',
        lDesc: 'Соревнуйтесь с лучшими мастерами судоку со всего мира!',
        pBox: '🎨 Темы: Теплая Керамика, Темная Смола, Глина, Бумага'
      }
    ]
  },
  {
    folder: 'hi-IN',
    isRTL: false,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif',
    shots: [
      {
        tag: '📅 दैनिक चुनौतियाँ',
        title: '365 दिन की दैनिक चुनौतियाँ<br>मासिक मास्टर बैज और पुरस्कार',
        calTitle: 'अगस्त 2026 चुनौती',
        calStatus: '15 / 31 पूर्ण',
        missionTag: '🎯 आज का विशेष मिशन',
        missionTitle: '[स्तर 3 मध्यम] 1 सुडोकू हल करें',
        missionDesc: 'मध्यम स्तर की पहेली हल करके तर्क कौशल बढ़ाएं।',
        missionBtn: 'मिशन शुरू करें 🚀'
      },
      {
        tag: '⚡ सहज और सुखद गेमप्ले',
        title: '5 क्लासिक कठिनाई स्तर<br>स्मार्ट पेंसिल नोट्स और संकेत',
        level: 'स्तर 3 मध्यम',
        timer: '⏱️ 02:45',
        mistakes: 'गलतियाँ 0/3',
        actUndo: '↩️ पूर्ववत',
        actErase: '🧹 मिटाएं',
        actNotes: '✏️ नोट्स',
        actHint: '💡 संकेत (3)'
      },
      {
        tag: '🎓 सुडोकू अकादमी',
        title: '32 प्रामाणिक मास्टर तकनीकें<br>इंटरैक्टिव चरण-दर-चरण अभ्यास',
        tab1: 'चरण 1: बुनियादी',
        tab2: 'चरण 2: जोड़े',
        tab3: 'चरण 3: विंग्स',
        lTitle: 'हिडन सिंगल (Hidden Single)',
        lDesc: 'पंक्ति, स्तंभ या बॉक्स में किसी संख्या के लिए एकमात्र सही स्थान खोजें।',
        pBox: '🎯 अभ्यास: सेल [?] के लिए सही संख्या पर टैप करें'
      },
      {
        tag: '⚔️ AI बॉट स्पीड बैटल',
        title: '1:1 रियल-टाइम AI मुकाबला<br>तेज़ गति वाली सुडोकू रेस',
        tab1: 'शुरुआती बॉट',
        tab2: 'एक्सपर्ट बॉट',
        tab3: 'AlphaDoku मास्टर',
        lTitle: 'स्मार्ट AI बॉट के खिलाफ स्पीड मैच',
        lDesc: 'एक ही बोर्ड पर रीयल-टाइम में सबसे तेज़ हल करें!',
        pBox: '🚀 AI बैटल शुरू करें'
      },
      {
        tag: '🧠 मस्तिष्क क्षमता विश्लेषण',
        title: 'विस्तृत ब्रेन IQ रिपोर्ट<br>5 मुख्य संज्ञानात्मक कौशल और स्तर',
        heroLabel: 'आपका सुडोकू ब्रेन IQ स्कोर',
        iqVal: '142',
        iqTier: '👑 मेन्सा स्तर (शीर्ष 2.4%)',
        s1: '🎯 गहरा ध्यान',
        s2: '💡 तार्किक सोच',
        s3: '⚡ प्रोसेसिंग स्पीड',
        s4: '🎯 सटीकता',
        shareBtn: '🔗 IQ रिपोर्ट शेयर करें'
      },
      {
        tag: '🏆 ग्लोबल लीडरबोर्ड',
        title: 'विश्वव्यापी रैंकिंग और लीडरबोर्ड<br>4 सुंदर और आरामदायक थीम',
        tab1: 'क्लासिक रैंक',
        tab2: 'स्पीडरन',
        tab3: 'ब्रेन IQ',
        lTitle: 'ग्लोबल हॉल ऑफ फेम (TOP 10)',
        lDesc: 'दुनिया भर के सर्वश्रेष्ठ खिलाड़ियों के साथ प्रतिस्पर्धा करें!',
        pBox: '🎨 4 थीम: वार्म सिरेमिक, मैट डार्क, प्योर क्ले, क्लासिक पेपर'
      }
    ]
  }
];

function buildScreenshotHtml(data, shot, index) {
  const dirAttr = data.isRTL ? 'dir="rtl"' : 'dir="ltr"';
  const textAlign = data.isRTL ? 'text-align: right;' : 'text-align: left;';

  // Shot 1: Daily
  if (index === 0) {
    return `
    <!DOCTYPE html>
    <html ${dirAttr}>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1080px; height: 1920px;
          background: #f1f5f9;
          display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          padding: 100px 70px 80px;
          font-family: ${data.fontFamily};
        }
        .header { text-align: center; width: 100%; }
        .pill { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 28px; font-weight: 800; padding: 12px 32px; border-radius: 40px; margin-bottom: 24px; }
        h1 { font-size: 56px; font-weight: 900; color: #0f172a; line-height: 1.35; }
        .app-card {
          width: 100%; height: 1380px; background: #ffffff; border: 4px solid #e2e8f0; border-radius: 64px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.1); padding: 48px; display: flex; flex-direction: column; justify-content: space-between;
          ${textAlign}
        }
        .cal-header { display: flex; justify-content: space-between; font-weight: 900; font-size: 34px; color: #1e293b; margin-bottom: 30px; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 14px; text-align: center; margin-bottom: 40px; }
        .d-name { font-size: 22px; font-weight: 800; color: #94a3b8; margin-bottom: 8px; }
        .d-cell { height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; background: #f8fafc; color: #334155; }
        .d-cell.done { background: #2563eb; color: #ffffff; box-shadow: 0 8px 20px rgba(37,99,235,0.35); }
        .mission-box { background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; border-radius: 36px; padding: 40px; }
        .m-tag { font-size: 22px; color: #fbbf24; font-weight: 800; margin-bottom: 12px; }
        .m-title { font-size: 32px; font-weight: 900; margin-bottom: 12px; }
        .m-desc { font-size: 22px; color: #94a3b8; margin-bottom: 28px; line-height: 1.5; }
        .m-btn { background: #2563eb; color: #ffffff; text-align: center; padding: 24px; border-radius: 24px; font-weight: 900; font-size: 28px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="pill">${shot.tag}</div>
        <h1>${shot.title}</h1>
      </div>
      <div class="app-card">
        <div>
          <div class="cal-header">
            <span>${shot.calTitle}</span>
            <span style="color: #2563eb;">${shot.calStatus}</span>
          </div>
          <div class="cal-grid">
            <div class="d-name">1</div><div class="d-name">2</div><div class="d-name">3</div><div class="d-name">4</div><div class="d-name">5</div><div class="d-name">6</div><div class="d-name">7</div>
            <div class="d-cell done">1</div><div class="d-cell done">2</div><div class="d-cell done">3</div><div class="d-cell done">4</div><div class="d-cell done">5</div><div class="d-cell done">6</div><div class="d-cell done">7</div>
            <div class="d-cell done">8</div><div class="d-cell done">9</div><div class="d-cell done">10</div><div class="d-cell done">11</div><div class="d-cell done">12</div><div class="d-cell done">13</div><div class="d-cell done">14</div>
            <div class="d-cell done">15</div><div class="d-cell" style="border: 3px solid #2563eb; color: #2563eb;">16</div><div class="d-cell">17</div><div class="d-cell">18</div><div class="d-cell">19</div><div class="d-cell">20</div><div class="d-cell">21</div>
          </div>
        </div>
        <div class="mission-box">
          <div class="m-tag">${shot.missionTag}</div>
          <div class="m-title">${shot.missionTitle}</div>
          <div class="m-desc">${shot.missionDesc}</div>
          <div class="m-btn">${shot.missionBtn}</div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Shot 2: Core Gameplay
  if (index === 1) {
    return `
    <!DOCTYPE html>
    <html ${dirAttr}>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1080px; height: 1920px;
          background: #f1f5f9;
          display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          padding: 100px 70px 80px;
          font-family: ${data.fontFamily};
        }
        .header { text-align: center; width: 100%; }
        .pill { display: inline-block; background: #fef3c7; color: #b45309; font-size: 28px; font-weight: 800; padding: 12px 32px; border-radius: 40px; margin-bottom: 24px; }
        h1 { font-size: 56px; font-weight: 900; color: #0f172a; line-height: 1.35; }
        .app-card {
          width: 100%; height: 1380px; background: #ffffff; border: 4px solid #e2e8f0; border-radius: 64px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.1); padding: 40px; display: flex; flex-direction: column; justify-content: space-between;
          ${textAlign}
        }
        .game-top { display: flex; justify-content: space-between; align-items: center; font-weight: 900; font-size: 30px; color: #334155; padding: 0 10px; }
        .board-grid {
          width: 100%; aspect-ratio: 1; background: #ffffff; border: 4px solid #0f172a; border-radius: 28px;
          display: grid; grid-template-columns: repeat(9, 1fr); direction: ltr !important;
          box-shadow: 0 12px 32px rgba(0,0,0,0.08); overflow: hidden;
        }
        .cell { display: flex; align-items: center; justify-content: center; font-size: 42px; font-weight: 800; color: #0f172a; border-right: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1; }
        .cell:nth-child(3n) { border-right: 3.5px solid #0f172a; }
        .cell:nth-child(9n) { border-right: none; }
        .cell.selected { background: #dbeafe; color: #1d4ed8; font-weight: 900; }
        .cell.related { background: #f8fafc; }
        .cell.user-val { color: #2563eb; font-weight: 900; }
        .actions-row { display: flex; justify-content: space-between; gap: 12px; }
        .action-pill { flex: 1; text-align: center; background: #f1f5f9; padding: 18px 0; border-radius: 20px; font-size: 22px; font-weight: 800; color: #475569; }
        .keypad-grid { display: grid; grid-template-columns: repeat(9, 1fr); gap: 10px; direction: ltr !important; }
        .key-btn { height: 96px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 900; color: #1e293b; box-shadow: 0 5px 0 #cbd5e1; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="pill">${shot.tag}</div>
        <h1>${shot.title}</h1>
      </div>
      <div class="app-card">
        <div class="game-top">
          <span>${shot.level}</span>
          <span style="color: #2563eb;">${shot.timer}</span>
          <span style="color: #ef4444;">${shot.mistakes}</span>
        </div>
        <div class="board-grid">
          <div class="cell related">5</div><div class="cell related">3</div><div class="cell selected">4</div><div class="cell">6</div><div class="cell">7</div><div class="cell">8</div><div class="cell">9</div><div class="cell">1</div><div class="cell">2</div>
          <div class="cell">6</div><div class="cell">7</div><div class="cell related">2</div><div class="cell">1</div><div class="cell">9</div><div class="cell">5</div><div class="cell">3</div><div class="cell">4</div><div class="cell">8</div>
          <div class="cell">1</div><div class="cell">9</div><div class="cell related">8</div><div class="cell">3</div><div class="cell">4</div><div class="cell">2</div><div class="cell">5</div><div class="cell">6</div><div class="cell">7</div>
          <div class="cell">8</div><div class="cell">5</div><div class="cell related">9</div><div class="cell">7</div><div class="cell">6</div><div class="cell">1</div><div class="cell">4</div><div class="cell">2</div><div class="cell">3</div>
          <div class="cell">4</div><div class="cell">2</div><div class="cell related user-val">6</div><div class="cell">8</div><div class="cell">5</div><div class="cell">3</div><div class="cell">7</div><div class="cell">9</div><div class="cell">1</div>
          <div class="cell">7</div><div class="cell">1</div><div class="cell related">3</div><div class="cell">9</div><div class="cell">2</div><div class="cell">4</div><div class="cell">8</div><div class="cell">5</div><div class="cell">6</div>
          <div class="cell">9</div><div class="cell">6</div><div class="cell related">1</div><div class="cell">5</div><div class="cell">3</div><div class="cell">7</div><div class="cell">2</div><div class="cell">8</div><div class="cell">4</div>
          <div class="cell">2</div><div class="cell">8</div><div class="cell related">7</div><div class="cell">4</div><div class="cell">1</div><div class="cell">9</div><div class="cell">6</div><div class="cell">3</div><div class="cell">5</div>
          <div class="cell">3</div><div class="cell">4</div><div class="cell related">5</div><div class="cell">2</div><div class="cell">8</div><div class="cell">6</div><div class="cell">1</div><div class="cell">7</div><div class="cell">9</div>
        </div>
        <div class="actions-row">
          <div class="action-pill">${shot.actUndo}</div>
          <div class="action-pill">${shot.actErase}</div>
          <div class="action-pill" style="background: #dbeafe; color: #2563eb;">${shot.actNotes}</div>
          <div class="action-pill">${shot.actHint}</div>
        </div>
        <div class="keypad-grid">
          <div class="key-btn">1</div><div class="key-btn">2</div><div class="key-btn">3</div>
          <div class="key-btn" style="background: #2563eb; color: #fff;">4</div><div class="key-btn">5</div><div class="key-btn">6</div>
          <div class="key-btn">7</div><div class="key-btn">8</div><div class="key-btn">9</div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Shot 3: Academy
  if (index === 2) {
    return `
    <!DOCTYPE html>
    <html ${dirAttr}>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1080px; height: 1920px;
          background: #f1f5f9;
          display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          padding: 100px 70px 80px;
          font-family: ${data.fontFamily};
        }
        .header { text-align: center; width: 100%; }
        .pill { display: inline-block; background: #dcfce7; color: #15803d; font-size: 28px; font-weight: 800; padding: 12px 32px; border-radius: 40px; margin-bottom: 24px; }
        h1 { font-size: 56px; font-weight: 900; color: #0f172a; line-height: 1.35; }
        .app-card {
          width: 100%; height: 1380px; background: #ffffff; border: 4px solid #e2e8f0; border-radius: 64px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.1); padding: 48px; display: flex; flex-direction: column; justify-content: space-between;
          ${textAlign}
        }
        .stage-tabs { display: flex; gap: 14px; }
        .stage-chip { padding: 16px 28px; border-radius: 20px; font-size: 24px; font-weight: 800; background: #f1f5f9; color: #64748b; }
        .stage-chip.active { background: #2563eb; color: #ffffff; }
        .lesson-card { background: #f8fafc; border: 2.5px solid #cbd5e1; border-radius: 36px; padding: 36px; }
        .l-title { font-size: 34px; font-weight: 900; color: #0f172a; margin-bottom: 14px; }
        .l-desc { font-size: 24px; color: #475569; line-height: 1.5; margin-bottom: 28px; }
        .p-box { background: #ffffff; border: 3px dashed #93c5fd; border-radius: 24px; padding: 28px; text-align: center; font-weight: 900; color: #1d4ed8; font-size: 26px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="pill">${shot.tag}</div>
        <h1>${shot.title}</h1>
      </div>
      <div class="app-card">
        <div class="stage-tabs">
          <div class="stage-chip active">${shot.tab1}</div>
          <div class="stage-chip">${shot.tab2}</div>
          <div class="stage-chip">${shot.tab3}</div>
        </div>
        <div class="lesson-card">
          <div class="l-title">${shot.lTitle}</div>
          <div class="l-desc">${shot.lDesc}</div>
          <div class="p-box">${shot.pBox}</div>
        </div>
        <div class="lesson-card" style="opacity: 0.7;">
          <div class="l-title">Naked Pair (الأزواج المكشوفة / Offene Paare)</div>
          <div class="l-desc">Eliminating candidate digits from intersecting cells.</div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Shot 4: AI Battle
  if (index === 3) {
    return `
    <!DOCTYPE html>
    <html ${dirAttr}>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1080px; height: 1920px;
          background: #f1f5f9;
          display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          padding: 100px 70px 80px;
          font-family: ${data.fontFamily};
        }
        .header { text-align: center; width: 100%; }
        .pill { display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 28px; font-weight: 800; padding: 12px 32px; border-radius: 40px; margin-bottom: 24px; }
        h1 { font-size: 56px; font-weight: 900; color: #0f172a; line-height: 1.35; }
        .app-card {
          width: 100%; height: 1380px; background: #ffffff; border: 4px solid #e2e8f0; border-radius: 64px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.1); padding: 48px; display: flex; flex-direction: column; justify-content: space-between;
          ${textAlign}
        }
        .ai-header { background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; border-radius: 36px; padding: 40px; text-align: center; }
        .stage-tabs { display: flex; gap: 14px; }
        .stage-chip { padding: 16px 28px; border-radius: 20px; font-size: 24px; font-weight: 800; background: #f1f5f9; color: #64748b; }
        .stage-chip.active { background: #ef4444; color: #ffffff; }
        .l-box { background: #f8fafc; border: 2.5px solid #cbd5e1; border-radius: 36px; padding: 36px; }
        .l-title { font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 14px; }
        .l-desc { font-size: 24px; color: #475569; line-height: 1.5; margin-bottom: 28px; }
        .p-btn { background: #ef4444; color: #ffffff; text-align: center; padding: 24px; border-radius: 24px; font-weight: 900; font-size: 28px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="pill">${shot.tag}</div>
        <h1>${shot.title}</h1>
      </div>
      <div class="app-card">
        <div class="ai-header">
          <div style="font-size: 24px; color: #f87171; font-weight: 800; margin-bottom: 8px;">🤖 1:1 REAL-TIME BATTLE</div>
          <div style="font-size: 40px; font-weight: 900;">Speed Duel Mode</div>
        </div>
        <div class="stage-tabs">
          <div class="stage-chip">${shot.tab1}</div>
          <div class="stage-chip active">${shot.tab2}</div>
          <div class="stage-chip">${shot.tab3}</div>
        </div>
        <div class="l-box">
          <div class="l-title">${shot.lTitle}</div>
          <div class="l-desc">${shot.lDesc}</div>
          <div class="p-btn">${shot.pBox}</div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Shot 5: Brain IQ
  if (index === 4) {
    return `
    <!DOCTYPE html>
    <html ${dirAttr}>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1080px; height: 1920px;
          background: #f1f5f9;
          display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          padding: 100px 70px 80px;
          font-family: ${data.fontFamily};
        }
        .header { text-align: center; width: 100%; }
        .pill { display: inline-block; background: #e0e7ff; color: #4338ca; font-size: 28px; font-weight: 800; padding: 12px 32px; border-radius: 40px; margin-bottom: 24px; }
        h1 { font-size: 56px; font-weight: 900; color: #0f172a; line-height: 1.35; }
        .app-card {
          width: 100%; height: 1380px; background: #ffffff; border: 4px solid #e2e8f0; border-radius: 64px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.1); padding: 48px; display: flex; flex-direction: column; justify-content: space-between;
          ${textAlign}
        }
        .iq-hero { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; border-radius: 40px; padding: 40px; text-align: center; }
        .iq-val { font-size: 96px; font-weight: 900; line-height: 1; margin: 16px 0; }
        .iq-tier { font-size: 30px; font-weight: 800; color: #fbbf24; }
        .skills-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 36px; padding: 36px; }
        .skill-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .skill-name { font-size: 24px; font-weight: 800; color: #334155; }
        .skill-bar-wrap { width: 340px; height: 16px; background: #e2e8f0; border-radius: 8px; overflow: hidden; }
        .skill-bar { height: 100%; background: #2563eb; border-radius: 8px; }
        .share-btn { background: #0f172a; color: #ffffff; text-align: center; padding: 26px; border-radius: 26px; font-size: 28px; font-weight: 900; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="pill">${shot.tag}</div>
        <h1>${shot.title}</h1>
      </div>
      <div class="app-card">
        <div class="iq-hero">
          <div style="font-size: 24px; opacity: 0.9;">${shot.heroLabel}</div>
          <div class="iq-val">${shot.iqVal} <span style="font-size: 36px;">IQ</span></div>
          <div class="iq-tier">${shot.iqTier}</div>
        </div>
        <div class="skills-card">
          <div class="skill-row">
            <span class="skill-name">${shot.s1}</span>
            <div class="skill-bar-wrap"><div class="skill-bar" style="width: 95%;"></div></div>
            <span style="font-weight: 900; font-size: 24px; color: #2563eb;">95</span>
          </div>
          <div class="skill-row">
            <span class="skill-name">${shot.s2}</span>
            <div class="skill-bar-wrap"><div class="skill-bar" style="width: 92%;"></div></div>
            <span style="font-weight: 900; font-size: 24px; color: #2563eb;">92</span>
          </div>
          <div class="skill-row">
            <span class="skill-name">${shot.s3}</span>
            <div class="skill-bar-wrap"><div class="skill-bar" style="width: 88%;"></div></div>
            <span style="font-weight: 900; font-size: 24px; color: #2563eb;">88</span>
          </div>
          <div class="skill-row">
            <span class="skill-name">${shot.s4}</span>
            <div class="skill-bar-wrap"><div class="skill-bar" style="width: 96%;"></div></div>
            <span style="font-weight: 900; font-size: 24px; color: #2563eb;">96</span>
          </div>
        </div>
        <div class="share-btn">${shot.shareBtn}</div>
      </div>
    </body>
    </html>
    `;
  }

  // Shot 6: Leaderboard
  return `
  <!DOCTYPE html>
  <html ${dirAttr}>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1080px; height: 1920px;
        background: #f1f5f9;
        display: flex; flex-direction: column; align-items: center; justify-content: space-between;
        padding: 100px 70px 80px;
        font-family: ${data.fontFamily};
      }
      .header { text-align: center; width: 100%; }
      .pill { display: inline-block; background: #fef9c3; color: #854d0e; font-size: 28px; font-weight: 800; padding: 12px 32px; border-radius: 40px; margin-bottom: 24px; }
      h1 { font-size: 56px; font-weight: 900; color: #0f172a; line-height: 1.35; }
      .app-card {
        width: 100%; height: 1380px; background: #ffffff; border: 4px solid #e2e8f0; border-radius: 64px;
        box-shadow: 0 40px 80px rgba(0,0,0,0.1); padding: 48px; display: flex; flex-direction: column; justify-content: space-between;
        ${textAlign}
      }
      .tabs { display: flex; gap: 14px; }
      .tab { padding: 16px 28px; border-radius: 20px; font-size: 24px; font-weight: 800; background: #f1f5f9; color: #64748b; }
      .tab.active { background: #2563eb; color: #ffffff; }
      .rank-card { background: #f8fafc; border: 2.5px solid #cbd5e1; border-radius: 36px; padding: 36px; }
      .r-title { font-size: 34px; font-weight: 900; color: #0f172a; margin-bottom: 14px; }
      .r-desc { font-size: 24px; color: #475569; line-height: 1.5; margin-bottom: 28px; }
      .p-box { background: #ffffff; border: 2px solid #e2e8f0; border-radius: 24px; padding: 24px; font-size: 22px; font-weight: 800; color: #1e293b; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="pill">${shot.tag}</div>
      <h1>${shot.title}</h1>
    </div>
    <div class="app-card">
      <div class="tabs">
        <div class="tab active">${shot.tab1}</div>
        <div class="tab">${shot.tab2}</div>
        <div class="tab">${shot.tab3}</div>
      </div>
      <div class="rank-card">
        <div class="r-title">${shot.lTitle}</div>
        <div class="r-desc">${shot.lDesc}</div>
        <div class="p-box">${shot.pBox}</div>
      </div>
      <div class="rank-card" style="opacity: 0.8;">
        <div class="r-title">🥇 Top Master 1: 01:23 (S+)</div>
        <div class="r-desc">🥈 Top Master 2: 01:35 (S+) · 🥉 Top Master 3: 01:42 (S)</div>
      </div>
    </div>
  </body>
  </html>
  `;
}

async function main() {
  console.log('🎨 Generating 100% Native Localized Phone Screenshots (6 shots per language)...');
  const browser = await chromium.launch({ headless: true });

  for (const locale of LOCALES) {
    const dir = join('store_assets', locale.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    console.log(`\n📸 Generating screenshots for [${locale.folder}]...`);
    for (let i = 0; i < 6; i++) {
      const shotData = locale.shots[i];
      const html = buildScreenshotHtml(locale, shotData, i);
      const page = await browser.newPage({
        viewport: { width: 1080, height: 1920 },
        deviceScaleFactor: 1
      });
      await page.setContent(html, { waitUntil: 'load' });
      await page.waitForTimeout(200);
      const outPath = join(dir, `screenshot_real_0${i + 1}.png`);
      await page.screenshot({ path: outPath, type: 'png' });
      await page.close();
      console.log(`  ✅ [${locale.folder}] screenshot_real_0${i + 1}.png (1080x1920)`);
    }
  }

  await browser.close();
  console.log('\n🎉 ALL 7 LANGUAGES NATIVE LOCALIZED SCREENSHOTS COMPLETED!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
