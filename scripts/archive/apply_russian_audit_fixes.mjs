import fs from 'fs';
import path from 'path';

const ruDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/ru';

// 1. Update achievements.js
const achPath = path.join(ruDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let a = fs.readFileSync(achPath, 'utf8');
  a = a.replace(/pure_logic_master:\s*\{\s*title:\s*['"]Высший разум['"],\s*desc:\s*['"]Пройдите Ур\.5 Эксперт с 0 ошибок и 0 подсказок['"]\s*\}/g,
    "pure_logic_master: { title: 'Высший разум', desc: 'Пройдите Ур.5 Мастер с 0 ошибок и 0 подсказок' }");
  a = a.replace(/clear_lv2:\s*\{\s*title:\s*['"]Простой уровень['"],\s*desc:\s*['"]Пройдите уровень Ур\.2 Простой['"]\s*\}/g,
    "clear_lv2: { title: 'Простой покорён', desc: 'Пройдите уровень Ур.2 Простой' }");
  a = a.replace(/clear_lv4:\s*\{\s*title:\s*['"]Сложный рубеж['"],\s*desc:\s*['"]Пройдите уровень Ур\.4 Сложный['"]\s*\}/g,
    "clear_lv4: { title: 'Сложный покорён', desc: 'Пройдите уровень Ур.4 Сложный' }");
  a = a.replace(/clear_lv5:\s*\{\s*title:\s*['"]Гроссмейстер['"],\s*desc:\s*['"]Пройдите максимальный уровень Ур\.5 Эксперт['"]\s*\}/g,
    "clear_lv5: { title: 'Гроссмейстер', desc: 'Пройдите максимальный уровень Ур.5 Мастер' }");
  a = a.replace(/iq_150:\s*\{\s*title:\s*['"]Мозг Mensa['"],/g, "iq_150: { title: 'Мозг Менса',");
  fs.writeFileSync(achPath, a, 'utf8');
  console.log('✅ Updated ru/achievements.js');
}

// 2. Update leaderboard.js
const leadPath = path.join(ruDir, 'leaderboard.js');
if (fs.existsSync(leadPath)) {
  let l = fs.readFileSync(leadPath, 'utf8');
  l = l.replace(/iqTab:\s*['"]IQ Мозга['"]/g, "iqTab: 'IQ'");
  fs.writeFileSync(leadPath, l, 'utf8');
  console.log('✅ Updated ru/leaderboard.js');
}

// 3. Update modals.js
const modPath = path.join(ruDir, 'modals.js');
if (fs.existsSync(modPath)) {
  let m = fs.readFileSync(modPath, 'utf8');
  m = m.replace(/mistakesCount:\s*['"]Ошибок: \{count\}['"]/g, "mistakesCount: 'Ошибки: {count}'");
  m = m.replace(/leaderboardBtn:\s*['"]🏆 Мировой рейтинг['"]/g, "leaderboardBtn: '🏆 Таблица лидеров'");
  m = m.replace(/reviveBtn:\s*['"]Смотреть рекламу \(\+1 жизнь\)['"]/g, "reviveBtn: 'Воскреснуть (+1)'");
  m = m.replace(/submitBtn:\s*['"]Оставить отзыв в магазине['"]/g, "submitBtn: 'Оставить отзыв'");
  m = m.replace(/Серия входов: \{days\} дн\. подряд!/g, 'Серия: {days}-й день подряд!');
  fs.writeFileSync(modPath, m, 'utf8');
  console.log('✅ Updated ru/modals.js');
}

// 4. Update screens.js
const scrPath = path.join(ruDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let s = fs.readFileSync(scrPath, 'utf8');

  // Home
  s = s.replace(/ghost:\s*['"]👻 Призрак PB['"]/g, "ghost: '👻 Призрак'");
  s = s.replace(/delta:\s*['"]⚡ Дельта-темп['"]/g, "delta: '⚡ Отрыв'");
  s = s.replace(/timeAttack:\s*\{\s*badge:\s*['"]СКОРОСТЬ['"],\s*title:\s*['"]⚡ Спидран \(На время\)['"],\s*desc:\s*['"][^'"]+['"],\s*startBtn:\s*['"][^'"]+['"]\s*\}/g,
    "timeAttack: { badge: 'СКОРОСТЬ', title: '⚡ Спидран', desc: 'Гонка со временем за лучший рекорд!', startBtn: 'Начать спидран' }");
  s = s.replace(/timeLimit:\s*\{\s*badge:\s*['"]ВЫЖИВАНИЕ['"],\s*title:\s*['"]⏳ Выживание \(Лимит времени\)['"],\s*desc:\s*['"][^'"]+['"],\s*startBtn:\s*['"][^'"]+['"]\s*\}/g,
    "timeLimit: { badge: 'ВЫЖИВАНИЕ', title: '⏳ Выживание', desc: 'Ур.{level} за {minutes} мин! Успейте до истечения таймера', startBtn: 'Начать выживание' }");
  s = s.replace(/nav:\s*\{\s*daily:\s*['"]Задания['"],\s*brain:\s*['"]IQ Мозга['"],\s*stats:\s*['"]Статистика['"],\s*academy:\s*['"]Академия['"],\s*settings:\s*['"]Опции['"]\s*\}/g,
    "nav: { daily: 'Задания', brain: 'IQ', stats: 'Статистика', academy: 'Академия', settings: 'Опции' }");

  // Daily
  s = s.replace(/header:\s*['"]Ежедневные испытания \(\{month\}\)['"]/g, "header: 'Испытания ({month})'");
  s = s.replace(/badgeTitle:\s*['"]Медаль мастера \(\{month\}\)['"]/g, "badgeTitle: 'Мастер {month}'");
  s = s.replace(/badgeDesc:\s*['"]Завершено: \{completed\} \/ \{target\} \(Цель: 15\+\)['"]/g, "badgeDesc: '{completed}/{target} · Цель 15'");
  s = s.replace(/unlockModalConfirmBtn:\s*['"]📺 Смотреть видео и открыть['"]/g, "unlockModalConfirmBtn: '📺 Смотреть и открыть'");
  s = s.replace(/beginnerLv1Title:\s*['"]\[Ур\.1 Начальный\] Пройти 1 судоку['"]/g, "beginnerLv1Title: '[Ур.1 Начальный] 1 судоку'");
  s = s.replace(/beginnerLv2Title:\s*['"]\[Ур\.2 Простой\] Пройти 1 судоку['"]/g, "beginnerLv2Title: '[Ур.2 Простой] 1 судоку'");
  s = s.replace(/medLv3Title:\s*['"]\[Ур\.3\+ Средний\] Пройти 1 судоку['"]/g, "medLv3Title: '[Ур.3+ Средний] 1 судоку'");
  s = s.replace(/advLv4Title:\s*['"]\[Ур\.4\+ Сложный\] Пройти 1 судоку['"]/g, "advLv4Title: '[Ур.4+ Сложный] 1 судоку'");
  s = s.replace(/advLv5Title:\s*['"]\[Ур\.5 Эксперт\] Пройти 1 судоку['"]/g, "advLv5Title: '[Ур.5 Мастер] 1 судоку'");
  s = s.replace(/Покорите элитный Ур\.5 Эксперт и войдите в число лучших\./g, 'Покорите самый сложный Ур.5 Мастер и войдите в число лучших.');

  // RemoveAds
  s = s.replace(/heroTitle:\s*['"]Наслаждайтесь чистым судоку без помех['"]/g, "heroTitle: 'Судоку без отвлечений'");
  s = s.replace(/benefit1:\s*['"]Полное удаление всех рекламных баннеров и роликов['"]/g, "benefit1: 'Удаление баннеров и межстраничной рекламы'");
  s = s.replace(/buyBtn:\s*['"]Отключить рекламу навсегда \(\{price\}\)['"]/g, "buyBtn: 'Без рекламы ({price})'");
  s = s.replace(/purchaseBtn:\s*['"]Отключить рекламу навсегда \(\{price\}\)['"]/g, "purchaseBtn: 'Убрать рекламу ({price})'");
  s = s.replace(/restoreBtn:\s*['"]Восстановить покупки['"]/g, "restoreBtn: 'Восстановить'");

  // Tutorial
  s = s.replace(/step1Title:\s*['"]🎯 Шаг 1: Выберите клетку и введите число['"]/g, "step1Title: '🎯 Шаг 1: Введите число'");
  s = s.replace(/finishBtn:\s*['"]Начать реальную игру['"]/g, "finishBtn: 'Начать игру'");

  // Settings & Privacy
  s = s.replace(/privacyPolicyBtn:\s*['"]Политика конфиденциальности['"]/g, "privacyPolicyBtn: 'Приватность'");
  s = s.replace(/privacySubtitle:\s*['"]защита данных['"]/g, "privacySubtitle: 'Защита Zero-PII'");
  s = s.replace(/privacyModalTitle:\s*['"]Политика конфиденциальности['"]/g, "privacyModalTitle: 'Конфиденциальность'");
  s = s.replace(/следует принципу \./g, 'следует принципу Zero-PII.');
  s = s.replace(/sec1Title:\s*['"]1\. Ноль сбора персональных данных['"]/g, "sec1Title: '1. Без сбора данных'");
  s = s.replace(/В поиске соперников используются только временные анонимные токены\./g, 'В поиске соперников используются только временные анонимные токены и записи о завершении партий.');
  s = s.replace(/sec4Title:\s*['"]4\. Рекламные сервисы \(Google AdMob\)['"]/g, "sec4Title: '4. Реклама (Google AdMob)'");

  // Stats
  s = s.replace(/rankingHeader:\s*['"]🏆 Мировые рейтинги['"]/g, "rankingHeader: '🏆 Таблица лидеров'");
  s = s.replace(/leaderboardNotice:\s*['"]Смотрите глобальные таблицы лидеров в Google Play Games\.['"]/g, "leaderboardNotice: 'Смотрите глобальные таблицы лидеров в Google Play Играх.'");
  s = s.replace(/leaderboardBtn:\s*['"]🌐 🏆 Открыть мировой рейтинг['"]/g, "leaderboardBtn: '🏆 Таблица лидеров'");
  s = s.replace(/survivalTitle:\s*['"]⏳ Выживание \(На время\)['"]/g, "survivalTitle: '⏳ Режим выживания'");
  s = s.replace(/survivalWinsUnit:\s*['"]Побед: \{count\}['"]/g, "survivalWinsUnit: 'Пройдено: {count}'");
  s = s.replace(/leaderboardTab:\s*['"]Рейтинг['"]/g, "leaderboardTab: 'Лидеры'");
  s = s.replace(/startFirstBtn:\s*['"]Начать 1-е судоку 🚀['"]/g, "startFirstBtn: 'Первое судоку 🚀'");

  // BrainReport
  s = s.replace(/focus:\s*['"]Глубокая концентрация['"]/g, "focus: 'Концентрация'");
  s = s.replace(/durability:\s*['"]Устойчивость внимания['"]/g, "durability: 'Выносливость'");
  s = s.replace(/logic:\s*['"]Логическая дедукция['"]/g, "logic: 'Логика'");
  s = s.replace(/speed:\s*['"]Скорость обработки['"]/g, "speed: 'Скорость'");
  s = s.replace(/shareCardBtn:\s*['"]🔗 Поделиться карточкой IQ['"]/g, "shareCardBtn: '🔗 Поделиться'");
  s = s.replace(/levelAnalysisTitle:\s*['"]Анализ по уровням сложности['"]/g, "levelAnalysisTitle: 'Анализ по сложности'");
  s = s.replace(/shareBtn:\s*['"]Поделиться отчетом['"]/g, "shareBtn: 'Поделиться'");
  s = s.replace(/mensa:\s*['"]🧠 Уровень Mensa['"]/g, "mensa: '🧠 Уровень Менса'");

  // BattleResult & AI Battle
  s = s.replace(/\{opponent\} допустил 3 ошибки и выбыл\. Вы победили!/g, '{opponent} выбывает после 3 ошибок. Вы победили!');
  s = s.replace(/\{opponent\} решил судоку быстрее\./g, '{opponent} решает судоку первым.');
  s = s.replace(/disqualified:\s*['"]💀 Выбыл['"]/g, "disqualified: '💀 Выбывание'");

  // Academy
  s = s.replace(/stageTitles:\s*\{[\s\S]*?\},/g, `stageTitles: {
      stage1: 'Этап 1: Базовые техники (Одиночки и линии)',
      stage2: 'Этап 2: Средние техники (Пары и пересечения)',
      stage3: 'Этап 3: Продвинутые техники (Семейство Wing)',
      stage4: 'Этап 4: Экспертные техники (Рыбы, раскраска и уникальный прямоугольник)',
      stage5: 'Этап 5: Мастерские техники (цепи AIC, ALS и Exocet)'
    },`);

  s = s.replace(/stage1:\s*['"]Этап 1:[^'"]+['"],/g, "stage1: 'Этап 1: Базовые техники (Одиночки и линии)',");
  s = s.replace(/stage2:\s*['"]Этап 2:[^'"]+['"],/g, "stage2: 'Этап 2: Средние техники (Пары и пересечения)',");
  s = s.replace(/stage3:\s*['"]Этап 3:[^'"]+['"],/g, "stage3: 'Этап 3: Продвинутые техники (Семейство Wing)',");
  s = s.replace(/stage4:\s*['"]Этап 4:[^'"]+['"],/g, "stage4: 'Этап 4: Экспертные техники (Рыбы, раскраска и уникальный прямоугольник)',");
  s = s.replace(/stage5:\s*['"]Этап 5:[^'"]+['"],/g, "stage5: 'Этап 5: Мастерские техники (цепи AIC, ALS и Exocet)',");
  s = s.replace(/Внимательно изучите подсказки!/g, 'Внимательно изучите исходные цифры!');

  fs.writeFileSync(scrPath, s, 'utf8');
  console.log('✅ Updated ru/screens.js');
}
