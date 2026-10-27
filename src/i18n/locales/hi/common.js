export const common = {
  common: {
    you: 'आप',
    back: 'वापस',
    close: 'बंद करें',
    on: 'चालू',
    off: 'बंद',
    confirm: 'ठीक है',
    cancel: 'रद्द करें',
    restart: 'पुनः आरंभ',
    restartConfirm: "इस पहेली को फिर से शुरू करें? मौजूदा खेल हार के रूप में गिना जाएगा।",
    abandonConfirm: "एक खेल चल रहा है। नया शुरू करने पर वह हार के रूप में गिना जाएगा। फिर भी शुरू करें?",
    newGame: 'नया खेल',
    home: 'होम',
    pause: 'रोकें',
    resume: 'जारी रखें',
    exitAppPrompt: 'ऐप से बाहर निकलने के लिए बैक बटन दोबारा दबाएं।',
    confirmLeaveGame: 'क्या आप खेल रोककर होम स्क्रीन पर जाना चाहते हैं?',
    shareUnavailable: 'इस डिवाइस पर साझा करना उपलब्ध नहीं है।'
  },
  calendar: {
    days: {
      sun: 'रवि',
      mon: 'सोम',
      tue: 'मंगल',
      wed: 'बुध',
      thu: 'गुरु',
      fri: 'शुक्र',
      sat: 'शनि'
    }
  },
  levels: {
    1: 'शुरुआती',
    2: 'सरल',
    3: 'मध्यम',
    4: 'कठिन',
    5: 'विशेषज्ञ'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: 'गलतियां {count}/{max}',
    mistakesUnlimited: 'गलतियां {count}',
    timeAttackMistake: 'गलती {count} (+10s)',
    combo: '🔥 {count} कॉम्बो!',
    floatCombo: '-{seconds} सेकंड ({count} कॉम्बो!)',
    floatPenalty: '+{seconds} सेकंड',
    floatBonus: '+{seconds} सेकंड बोनस!',
    restartShort: 'पुनः आरंभ',
    newGameShort: 'नया खेल',
    themeTooltip: 'थीम बदलें',
    soundOn: 'ध्वनि बंद करें',
    soundOff: 'ध्वनि चालू करें'
  },
  keypad: {
    undo: 'पूर्ववत',
    erase: 'मिटाएं',
    notes: 'नोट्स',
    notesOn: 'नोट्स ON',
    notesOff: 'नोट्स OFF',
    hint: 'संकेत',
    rewardHint: '+1 संकेत',
    fastEntry: 'फास्ट एंट्री'
  },
  board: {
    pausedTitle: 'खेल रुका हुआ है',
    tapToResume: 'जारी रखने के लिए टैप करें ▶️',
    resumeTooltip: 'जारी रखें'
  },
  themes: {
    clay: '🏺 सिरेमिक और मिट्टी',
    matteDark: '🌌 मैट नाइट डार्क',
    pureCeramic: '🧊 प्योर क्लेमॉर्फिज्म',
    editorial: '📰 क्लासिक समाचार पत्र'
  },
  conflicts: {
    boxDuplicate: '⚠️ 3x3 वर्ग {box} में संख्या {num} पहले से मौजूद है! {suffix}',
    rowDuplicate: '⚠️ पंक्ति {row} में संख्या {num} पहले से मौजूद है! {suffix}',
    colDuplicate: '⚠️ स्तंभ {col} में संख्या {num} पहले से मौजूद है! {suffix}',
    multipleDuplicates: '⚠️ इस वर्ग/पंक्ति/स्तंभ में संख्या {num} पहले से मौजूद है! {suffix}',
    notSolution: '⚠️ संख्या {num} इस सेल का सही उत्तर नहीं है! {suffix}',
    cageDuplicate: '⚠️ इस समूह में संख्या {num} पहले से मौजूद है! {suffix}',
    cageSum: '⚠️ इस समूह का जोड़ अब {sum} नहीं बनता! {suffix}',
    boardFullHasMistakes: '⚠️ बोर्ड भरा है लेकिन कुछ गलतियां हैं। पुनः जांचें!',
    timeAttackSuffix: '(गलती {count} | +10 सेकंड दंड)',
    classicSuffix: '(गलतियां {count}/3)',
    // Classic with the three-mistake limit switched off: no limit to count to, no time penalty.
    freeSuffix: '(गलतियां {count})'
  },
  tiers: {
    grandMaster: {
      title: '👑 ग्रैंड मास्टर',
      desc: 'आप सबसे ऊंची रैंक पर पहुंच गए हैं।'
    },
    expert: {
      title: '🧠 विशेषज्ञ',
      desc: 'आप कठिन पहेलियां लगातार हल करते हैं।'
    },
    superior: {
      title: '⚡ उन्नत',
      desc: 'आप उन्नत पहेलियों के लिए तैयार हैं।'
    },
    aboveAverage: {
      title: '💡 मध्यम',
      desc: 'आप लगातार बेहतर हो रहे हैं।'
    },
    balanced: {
      title: '🎯 संतुलित',
      desc: 'आपके 5 संकेतक बराबर बढ़ रहे हैं।'
    },
    developing: {
      title: '🌱 शुरुआती',
      desc: 'खेलते रहें, आपका स्कोर बढ़ेगा।'
    }
  }
};
