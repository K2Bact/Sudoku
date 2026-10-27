export const common = {
  common: {
    you: 'Вы',
    back: 'Назад',
    close: 'Закрыть',
    on: 'ВКЛ',
    off: 'ВЫКЛ',
    confirm: 'OK',
    cancel: 'Отмена',
    restart: 'Заново',
    restartConfirm: "Начать эту головоломку заново? Текущая игра будет засчитана как поражение.",
    abandonConfirm: "Есть незаконченная игра. Если начать новую, она будет засчитана как поражение. Всё равно начать?",
    newGame: 'Новая игра',
    home: 'Главная',
    pause: 'Пауза',
    resume: 'Продолжить',
    exitAppPrompt: 'Нажмите «Назад» еще раз для выхода из игры.',
    confirmLeaveGame: 'Приостановить игру и вернуться на главную?',
    shareUnavailable: 'Поделиться с этого устройства нельзя.'
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
    levelPrefix: 'Lv.{level}',
    mistakes: 'Ошибки {count}/{max}',
    mistakesUnlimited: 'Ошибок: {count}',
    timeAttackMistake: 'Ошибка {count} (+10с)',
    combo: '🔥 {count} КОМБО!',
    floatCombo: '-{seconds}с ({count} КОМБО!)',
    floatPenalty: '+{seconds}с',
    floatBonus: 'Бонус +{seconds}с!',
    restartShort: 'Заново',
    newGameShort: 'Новая игра',
    themeTooltip: 'Сменить тему',
    soundOn: 'Выкл. звук',
    soundOff: 'Вкл. звук'
  },
  keypad: {
    undo: 'Отмена',
    erase: 'Стереть',
    notes: 'Заметки',
    notesOn: 'Заметки ВКЛ',
    notesOff: 'Заметки ВЫКЛ',
    hint: 'Подсказка',
    rewardHint: '+1 подсказка',
    fastEntry: 'Быстрый ввод'
  },
  board: {
    pausedTitle: 'Игра на паузе',
    tapToResume: 'Нажмите для продолжения ▶️',
    resumeTooltip: 'Нажмите для продолжения'
  },
  themes: {
    clay: '🏺 Керамика и глина',
    matteDark: '🌌 Матовая ночь',
    pureCeramic: '🧊 Чистый клейморфизм',
    editorial: '📰 Газетная бумага'
  },
  conflicts: {
    boxDuplicate: '⚠️ Число {num} уже есть в [блоке 3x3 {box}]! {suffix}',
    rowDuplicate: '⚠️ Число {num} уже есть в строке {row}! {suffix}',
    colDuplicate: '⚠️ Число {num} уже есть в столбце {col}! {suffix}',
    multipleDuplicates: '⚠️ Число {num} уже есть в этом блоке/строке/столбце! {suffix}',
    notSolution: '⚠️ Число {num} не подходит для этой клетки! {suffix}',
    cageDuplicate: '⚠️ Число {num} уже есть в этой области! {suffix}',
    cageSum: '⚠️ Сумма этой области уже не равна {sum}! {suffix}',
    boardFullHasMistakes: '⚠️ Поле заполнено, но содержит ошибки. Проверьте еще раз!',
    timeAttackSuffix: '(Ошибка {count} | штраф +10с)',
    classicSuffix: '(Ошибки {count}/3)',
    // Classic with the three-mistake limit switched off: no limit to count to, no time penalty.
    freeSuffix: '(Ошибки {count})'
  },
  tiers: {
    grandMaster: {
      title: '👑 Гроссмейстер',
      desc: 'Вы достигли высшего ранга.'
    },
    expert: {
      title: '🧠 Эксперт',
      desc: 'Вы уверенно решаете сложные головоломки.'
    },
    superior: {
      title: '⚡ Продвинутый',
      desc: 'Вы готовы к сложным головоломкам.'
    },
    aboveAverage: {
      title: '💡 Средний уровень',
      desc: 'Вы стабильно растёте.'
    },
    balanced: {
      title: '🎯 Сбалансированный',
      desc: 'Ваши 5 показателей растут равномерно.'
    },
    developing: {
      title: '🌱 Новичок',
      desc: 'Играйте дальше — и счёт вырастет.'
    }
  }
};
