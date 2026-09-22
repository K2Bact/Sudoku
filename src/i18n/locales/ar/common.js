export const common = {
  common: {
    you: 'أنت',
    back: 'رجوع',
    close: 'إغلاق',
    confirm: 'موافق',
    cancel: 'إلغاء',
    restart: 'إعادة البدء',
    restartConfirm: "إعادة هذا اللغز من البداية؟ ستُحتسب اللعبة الحالية خسارة.",
    abandonConfirm: "هناك لعبة جارية. بدء لعبة جديدة سيحتسبها خسارة. هل تريد البدء؟",
    newGame: 'لعبة جديدة',
    home: 'الرئيسية',
    pause: 'إيقاف مؤقت',
    resume: 'استئناف',
    exitAppPrompt: 'اضغط رجوع مرة أخرى للخروج من التطبيق.',
    confirmLeaveGame: 'هل أنت متأكد من رغبتك في إيقاف اللعبة مؤقتاً والعودة إلى الرئيسية؟',
    shareUnavailable: 'المشاركة غير متاحة على هذا الجهاز.'
  },
  calendar: {
    days: {
      sun: 'ح',
      mon: 'ن',
      tue: 'ث',
      wed: 'ر',
      thu: 'خ',
      fri: 'ج',
      sat: 'س'
    }
  },
  levels: {
    1: 'مبتدئ',
    2: 'سهل',
    3: 'متوسط',
    4: 'صعب',
    5: 'خبير'
  },
  header: {
    levelPrefix: 'مستوى {level}',
    mistakes: 'الأخطاء {count}/{max}',
    mistakesUnlimited: 'الأخطاء {count}',
    timeAttackMistake: 'خطأ {count} (+10 ث)',
    combo: '🔥 {count} متتالي!',
    restartShort: 'إعادة',
    newGameShort: 'لعبة جديدة',
    themeTooltip: 'تغيير المظهر',
    soundOn: 'كتم الصوت',
    soundOff: 'تشغيل الصوت'
  },
  keypad: {
    undo: 'تراجع',
    erase: 'مسح',
    notes: 'ملاحظات',
    hint: 'تلميح',
    rewardHint: '+1 تلميح',
    fastEntry: 'الوضع السريع'
  },
  board: {
    pausedTitle: 'اللعبة متوقفة مؤقتاً',
    tapToResume: 'انقر على الشاشة للاستئناف ▶️',
    resumeTooltip: 'انقر للاستئناف'
  },
  themes: {
    clay: '🏺 سيراميك وطين دافئ',
    matteDark: '🌌 راتنج غير لامع داكن',
    pureCeramic: '🧊 كلايمورفيزم نقي',
    editorial: '📰 ورق كلاسيكي نقي'
  },
  conflicts: {
    boxDuplicate: '⚠️ الرقم {num} موجود بالفعل في [مربع 3×3 {box}]! {suffix}',
    rowDuplicate: '⚠️ الرقم {num} موجود بالفعل في الصف {row}! {suffix}',
    colDuplicate: '⚠️ الرقم {num} موجود بالفعل في العمود {col}! {suffix}',
    multipleDuplicates: '⚠️ الرقم {num} موجود بالفعل في نفس المربع أو الصف أو العمود! {suffix}',
    notSolution: '⚠️ الرقم {num} ليس هو الحل الصحيح لهذه الخلية! {suffix}',
    boardFullHasMistakes: '⚠️ اللوحة ممتلئة ولكن بها بعض الأخطاء. يُرجى المراجعة!',
    timeAttackSuffix: '(خطأ {count} | عقوبة +10 ث)',
    classicSuffix: '(الأخطاء {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 الأستاذ الكبير',
      desc: 'لقد وصلت إلى أعلى رتبة.'
    },
    expert: {
      title: '🧠 خبير',
      desc: 'تحل الألغاز الصعبة بثبات.'
    },
    superior: {
      title: '⚡ متقدم',
      desc: 'أنت مستعد للألغاز المتقدمة.'
    },
    aboveAverage: {
      title: '💡 متوسط',
      desc: 'مستواك يتحسن باستمرار.'
    },
    balanced: {
      title: '🎯 متوازن',
      desc: 'مؤشراتك الخمسة تنمو بتوازن.'
    },
    developing: {
      title: '🌱 مبتدئ',
      desc: 'واصل اللعب وسترتفع نتيجتك.'
    }
  }
};
