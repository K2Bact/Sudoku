export const achievements = {
  achievements: {
    categories: {
      all: 'الكل',
      progression: 'التقدم',
      logic: 'بلا أخطاء',
      speed: 'السرعة',
      difficulty: 'الصعوبة',
      special: 'اليومي والمبارزة'
    },
    unlockedToast: 'تم فتح إنجاز جديد!',
    tabTitle: 'الإنجازات',
    openPlayGames: 'عرض إنجازاتي في ألعاب Play',
    statsTab: 'الإحصائيات',
    unlockedCount: 'تم فتح \u2066{unlocked} / {total}\u2069 ({pct}%)',
    lockedBadge: 'مغلق',
    pointsTotal: 'النقاط: {count}',
    tiers: { bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', diamond: 'ماسي', master: 'أستاذ' },
    unlockedAt: 'تاريخ الفتح: {date}',

    // 1 ~ 7. Progression & Wins
    first_win: { title: 'الخطوة الأولى', desc: 'حل أول لغز سودوكو لك بأي مستوى صعوبة' },
    win_5: { title: 'الخمسة الرائعة', desc: 'إكمال 5 ألغاز سودوكو بنجاح' },
    win_10: { title: 'عاشق الألغاز', desc: 'إكمال 10 ألغاز سودوكو بنجاح' },
    win_25: { title: 'لاعب فضي', desc: 'إكمال 25 لغزاً من ألغاز السودوكو' },
    win_50: { title: 'مخضرم ذهبي', desc: 'إكمال 50 لغزاً من ألغاز السودوكو' },
    win_100: { title: 'نادي المئة', desc: 'إكمال 100 لغز سودوكو بنجاح' },
    win_250: { title: 'أسطورة السودوكو', desc: 'إكمال 250 لغزاً من ألغاز السودوكو' },

    // Days checked in, in all (2026-10-08, D11)
    visit_30: { title: 'المواظبة', desc: 'سجّل حضورك اليومي 30 يوماً في المجموع' },
    visit_100: { title: 'مئة يوم', desc: 'سجّل حضورك اليومي 100 يوم في المجموع' },
    visit_365: { title: 'عام مع السودوكو', desc: 'سجّل حضورك اليومي 365 يوماً في المجموع' },

    // 8 ~ 14. Logic & Perfection
    flawless_1: { title: 'خبير بلا أخطاء', desc: 'حل لغز كامل دون ارتكاب أي خطأ (0 أخطاء)' },
    flawless_5: { title: 'المثالي', desc: 'حل 5 ألغاز كاملة دون ارتكاب أي خطأ' },
    pure_logic_expert: { title: 'منطق خالص', desc: 'حل لغز Lv.4 الصعب دون استخدام أي تلميحات' },
    pure_logic_master: { title: 'العقل الخارق', desc: 'حل لغز Lv.5 الخبير بـ 0 أخطاء و 0 تلميحات' },
    note_master: { title: 'سيد الملاحظات', desc: 'استخدام تدوين الملاحظات بالقلم أكثر من 50 مرة' },
    no_notes: { title: 'عين بديهية', desc: 'حل لغز Lv.3 متوسط فأعلى دون استخدام أي ملاحظات' },
    fast_entry_fan: { title: 'سرعة البرق', desc: 'حل لغز باستخدام وضع الإدخال السريع (الرقم أولاً)' },

    // 15 ~ 19. Speed & Combos
    rank_s_plus: { title: 'السرعة الإلهية', desc: 'تحقيق التقييم 👑 \u2066S+\u2069' },
    speed_runner_3m: { title: 'أقل من 3 دقائق', desc: 'حل اللغز في أقل من 3 دقائق (180 ثانية)' },
    speed_runner_2m: { title: 'صاروخ السرعة', desc: 'حل اللغز في أقل من دقيقتين (120 ثانية)' },
    combo_streak_5: { title: 'فنان السلاسل', desc: 'تحقيق سلسلة من 5 إدخالات صحيحة متتالية في وضع سباق الزمن' },
    combo_streak_10: { title: 'سيد السلاسل', desc: 'تحقيق سلسلة من 10 إدخالات صحيحة متتالية في وضع سباق الزمن' },

    // 20 ~ 26. Difficulty & Survival
    clear_lv1: { title: 'قاهر المبتدئين', desc: 'حل لغز Lv.1 (مبتدئ)' },
    clear_lv2: { title: 'متقن المستوى السهل', desc: 'حل لغز Lv.2 (سهل)' },
    clear_lv3: { title: 'قاهر المتوسط', desc: 'حل لغز Lv.3 (متوسط)' },
    clear_lv4: { title: 'استنتاج احترافي', desc: 'حل لغز Lv.4 (صعب)' },
    clear_lv5: { title: 'أستاذ كبير', desc: 'حل لغز Lv.5 (خبير — أعلى صعوبة)' },
    survival_hero: { title: 'بطل التحدي الزمني', desc: 'إكمال لغز في وضع النجاة' },
    survival_clutch: { title: 'هروب في اللحظة الأخيرة', desc: 'إكمال اللغز مع تبقي 5 ثوانٍ أو أقل على المؤقت' },

    // Killer (2026-10-08, D11)
    killer_first: { title: 'القفص الأول', desc: 'حل أول لغز سودوكو كيلر لك' },
    killer_lv3: { title: 'بارع في الجمع', desc: 'حل لغز سودوكو كيلر Lv.3 (متوسط)' },
    killer_win_25: { title: 'محطم الأقفاص', desc: 'إكمال 25 لغزاً من ألغاز سودوكو كيلر' },
    killer_lv5: { title: 'سيد الكيلر', desc: 'حل لغز سودوكو كيلر Lv.5 (خبير — أعلى صعوبة)' },

    // 27 ~ 30. Daily, Battle & Brain IQ
    daily_first: { title: 'مستكشف التحدي اليومي', desc: 'حل أول لغز لك في التحدي اليومي' },
    daily_streak_7: { title: 'معجزة الـ 7 أيام', desc: 'سجّل حضورك اليومي 7 أيام متتالية' },
    battle_first_win: { title: 'انتصار المحارب', desc: 'الفوز بأول مباراة مبارزة 1 ضد 1 أو ضد روبوت الذكاء الاصطناعي' },
    iq_150: { title: 'سيد المنطق', desc: 'الوصول إلى Logic Score بقيمة 135 أو أكثر' },

    // The academy (2026-10-08, D11)
    academy_first_lesson: { title: 'الدرس الأول', desc: 'حل تدريباً عملياً واحداً في أكاديمية السودوكو' },
    academy_stage3: { title: 'سيد الأجنحة', desc: 'حل تدريباً عملياً لكل تقنية في المرحلة 3' },
    academy_all: { title: 'التخرج من الأكاديمية', desc: 'حل تدريباً عملياً لكل تقنية في أكاديمية السودوكو' }
  }
};
