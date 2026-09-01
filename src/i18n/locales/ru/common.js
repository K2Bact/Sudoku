export const common = {
  common: {
    you: 'Вы',
    back: 'Назад',
    close: 'Закрыть',
    confirm: 'OK',
    cancel: 'Отмена',
    restart: 'Заново',
    newGame: 'Новая игра',
    home: 'Главная',
    save: 'Сохранить',
    pause: 'Пауза',
    resume: 'Продолжить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    exitAppPrompt: 'Нажмите «Назад» еще раз для выхода из игры.',
    confirmLeaveGame: 'Приостановить игру и вернуться на главную?'
  },
  calendar: {
    days: {
      sun: 'Вс',
      mon: 'Пн',
      tue: 'Вт',
      wed: 'Ср',
      thu: 'Чт',
      fri: 'Пт',
      sat: 'Сб'
    }
  },
  levels: {
    1: 'Начальный',
    2: 'Простой',
    3: 'Средний',
    4: 'Сложный',
    5: 'Эксперт'
  },
  header: {
    levelPrefix: 'Ур.{level}',
    mistakes: 'Ошибки {count}/{max}',
    mistakesUnlimited: 'Ошибок: {count}',
    timeAttackMistake: 'Ошибка {count} (+10с)',
    combo: '🔥 {count} КОМБО!',
    restartShort: 'Заново',
    newGameShort: 'Новая игра',
    pauseTooltip: 'Пауза таймера',
    themeTooltip: 'Сменить тему',
    soundOn: 'Выкл. звук',
    soundOff: 'Вкл. звук'
  },
  keypad: {
    undo: 'Отмена',
    erase: 'Стереть',
    notes: 'Заметки',
    hint: 'Подсказка',
    fastEntry: 'Быстрый ввод',
    fastEntryLocked: 'Фикс {number}'
  },
  board: {
    pausedTitle: 'Игра на паузе',
    tapToResume: 'Нажмите для продолжения ▶️',
    resumeTooltip: 'Нажмите для продолжения'
  },
  themes: {
    toast: '🎨 Тема: {name}',
    clay: '🏺 Керамика и глина',
    clayDesc: 'Матовые клавиши из глины с тактильным 3D-эффектом',
    matteDark: '🌌 Матовая ночь',
    matteDarkDesc: 'Глубокий темный оттенок с мягким ночным свечением',
    pureCeramic: '🧊 Чистый клейморфизм',
    pureCeramicDesc: 'Скругленные гладкие клавиши из белой керамики',
    editorial: '📰 Газетная бумага',
    editorialDesc: 'Швейцарская типографика и комфортный для глаз бумажный тон'
  },
  conflicts: {
    boxes: [
      'Верхний левый', 'Верхний центр', 'Верхний правый',
      'Средний левый', 'Центр', 'Средний правый',
      'Нижний левый', 'Нижний центр', 'Нижний правый'
    ],
    boxDuplicate: '⚠️ Число {num} уже есть в [блоке 3x3 {box}]! {suffix}',
    rowDuplicate: '⚠️ Число {num} уже есть в строке {row}! {suffix}',
    colDuplicate: '⚠️ Число {num} уже есть в столбце {col}! {suffix}',
    multipleDuplicates: '⚠️ Число {num} уже есть в этом блоке/строке/столбце! {suffix}',
    notSolution: '⚠️ Число {num} не подходит для этой клетки! {suffix}',
    boardFullHasMistakes: '⚠️ Поле заполнено, но содержит ошибки. Проверьте еще раз!',
    timeAttackSuffix: '(Ошибка {count} | штраф +10с)',
    classicSuffix: '(Ошибки {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Гроссмейстер',
      desc: 'Топ {percentile}% игроков! Элитная логика и дедукция на уровне лучших 1%.'
    },
    mensa: {
      title: '🧠 Уровень Mensa',
      desc: 'Топ {percentile}% игроков! Выдающиеся аналитические и логические способности.'
    },
    superior: {
      title: '⚡ Высокий интеллект',
      desc: 'Топ {percentile}% игроков! Острая интуиция и быстрое решение сложных задач.'
    },
    aboveAverage: {
      title: '💡 Выше среднего',
      desc: 'Топ {percentile}% игроков! Гибкое и стабильное логическое мышление.'
    },
    balanced: {
      title: '🎯 Сбалансированный ум',
      desc: 'Топ {percentile}% игроков! Гармоничное развитие всех ключевых когнитивных зон.'
    },
    developing: {
      title: '🌱 Тренировка ума',
      desc: 'Начальный этап тренировок с огромным потенциалом для роста.'
    }
  }
};
