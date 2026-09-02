export const common = {
  common: {
    you: 'أنت',
    back: 'رجوع',
    close: 'إغلاق',
    confirm: 'موافق',
    cancel: 'إلغاء',
    restart: 'إعادة البدء',
    restartConfirm: 'إعادة تشغيل هذه الأحجية؟',
    newGame: 'لعبة جديدة',
    home: 'الرئيسية',
    save: 'حفظ',
    pause: 'إيقاف مؤقت',
    resume: 'استئناف',
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
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
    pauseTooltip: 'إيقاف المؤقت مؤقتاً',
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
    fastEntry: 'الوضع السريع',
    fastEntryLocked: 'مغلق {number}'
  },
  board: {
    pausedTitle: 'اللعبة متوقفة مؤقتاً',
    tapToResume: 'انقر على الشاشة للاستئناف ▶️',
    resumeTooltip: 'انقر للاستئناف'
  },
  themes: {
    toast: '🎨 تم التبديل إلى {name}',
    clay: '🏺 سيراميك وطين دافئ',
    clayDesc: 'أزرار سيراميكية غير لامعة مع تأثير ثلاثي الأبعاد ملموس',
    matteDark: '🌌 راتنج غير لامع داكن',
    matteDarkDesc: 'تصميم فاخر من الراتنج غير اللامع مع إضاءة ليلية هادئة',
    pureCeramic: '🧊 كلايمورفيزم نقي',
    pureCeramicDesc: 'أزرار وسائدية ناعمة ودائرية من السيراميك الأبيض',
    editorial: '📰 ورق كلاسيكي نقي',
    editorialDesc: 'مظهر ورقي أنيق ومريح للعين بنمط تحريري سويسري'
  },
  conflicts: {
    boxes: [
      'أعلى اليمين', 'أعلى الوسط', 'أعلى اليسار',
      'وسط اليمين', 'المركز', 'وسط اليسار',
      'أسفل اليمين', 'أسفل الوسط', 'أسفل اليسار'
    ],
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
      title: '👑 أستاذ كبير',
      desc: 'أفضل {percentile}% من اللاعبين! تفكير استنتاجي نخبوي لأعلى 1% من العباقرة.'
    },
    mensa: {
      title: '🧠 مستوى مينسا (Mensa)',
      desc: 'أفضل {percentile}% من اللاعبين! استنتاج منطقي استثنائي من فئة مينسا.'
    },
    superior: {
      title: '⚡ منطق فائق',
      desc: 'أفضل {percentile}% من اللاعبين! تفكير منطقي حاد ومتميز.'
    },
    aboveAverage: {
      title: '💡 فوق المتوسط',
      desc: 'أفضل {percentile}% من اللاعبين! قدرة مرنة وقوية على حل المشكلات.'
    },
    balanced: {
      title: '🎯 عقل متزن',
      desc: 'أفضل {percentile}% من اللاعبين! مهارات استنتاج منطقية متزنة ومستقرة.'
    },
    developing: {
      title: '🌱 تدريب ذهني',
      desc: 'بناء الأساس المنطقي مع إمكانيات نمو ذهني لا نهائية.'
    }
  }
};
