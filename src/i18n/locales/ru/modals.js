export const modals = {
  modals: {
    victory: {
      title: 'Судоку решено!',
      desc: 'Поздравляем!\nВы успешно завершили эту головоломку.',
      rankLabel: 'Оценка: {title}',
      difficultyLabel: 'Сложность',
      timeLabel: 'Время',
      timeRemainingLabel: 'Осталось времени',
      mistakesLabel: 'Ошибки',
      mistakesCount: 'Ошибки: {count}',
      nextGame: 'Следующая игра',
      leaderboardBtn: '🏆 Таблица лидеров',
      shareBtn: 'Поделиться',
      copiedToast: '🎉 Результат скопирован в буфер обмена!',
      shareText: '🧩 Решил Судоку {mode} Ур.{level} {name} за [{time}]! Ранг: {rank} ({mistakes} ошибок). Проверь свой IQ!',
      ranks: {
        'S+': '👑 S+ (Божественно)',
        'S': '⭐️ S (Мастер)',
        'A': '🥇 A (Эксперт)',
        'B': '🥈 B (Уверенно)',
        'C': '🥉 C (Пройдено)'
      }
    },
    gameOver: {
      title: 'Игра окончена',
      desc: 'Вы совершили 3 ошибки.\nПосмотрите рекламу, чтобы продолжить игру!',
      descNoRevive: 'Все попытки исчерпаны.\n(Возможность возрождения уже использована)',
      reviveBtn: 'Воскреснуть (+1)',
      restartBtn: 'Начать заново'
    },
    newGame: {
      title: 'Выбор сложности',
      desc: 'Выберите уровень\nдля новой игры.'
    },
    storeReview: {
      title: 'Нравится Sudoku?',
      desc: 'Ваш искренний отзыв помогает нам\nделать игру еще лучше! 💙',
      submitBtn: 'Оставить отзыв',
      laterBtn: 'Позже'
    },
    dailyReward: {
      title: 'Ежедневная награда!',
      streakBadge: 'Серия: {days} дн.',
      desc: 'Серия: {days}-й день подряд!\nПолучено бесплатных подсказок: +{count}.',
      confirm: 'Забрать награду'
    },
    hintReward: {
      title: 'Бесплатные подсказки',
      desc: 'Посмотрите короткое видео,\nчтобы получить +1 подсказку.',
      watchAd: 'Смотреть видео (+1 подсказка)',
      adWatching: '📺 Воспроизведение рекламы…',
      adPlaceholder: '📺 Рекламное место (без рекламы)',
      chancesLeft: 'Осталось пополнений в этой игре: {remaining}/{max}',
      maxReached: 'Максимум 2 пополнения подсказок за игру.',
      later: 'Позже'
    }
  }
};
