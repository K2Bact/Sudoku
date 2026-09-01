export const common = {
  common: {
    you: 'आप',
    back: 'पीछे',
    close: 'बंद करें',
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',
    restart: 'पुनः प्रारंभ',
    newGame: 'नया खेल',
    home: 'होम',
    save: 'सहेजें',
    pause: 'रोकें',
    resume: 'जारी रखें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    exitAppPrompt: 'ऐप से बाहर निकलने के लिए बैक बटन दोबारा दबाएं।',
    confirmLeaveGame: 'क्या आप खेल रोककर होम स्क्रीन पर जाना चाहते हैं?'
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
    levelPrefix: 'स्तर {level}',
    mistakes: 'गलतियां {count}/{max}',
    mistakesUnlimited: 'गलतियां {count}',
    timeAttackMistake: 'गलती {count} (+10s)',
    combo: '🔥 {count} कॉम्बो!',
    restartShort: 'पुनः आरंभ',
    newGameShort: 'नया खेल',
    pauseTooltip: 'टाइमर रोकें',
    themeTooltip: 'थीम बदलें',
    soundOn: 'ध्वनि म्यूट',
    soundOff: 'ध्वनि चालू'
  },
  keypad: {
    undo: 'पूर्ववत',
    erase: 'मिटाएं',
    notes: 'नोट्स',
    hint: 'संकेत',
    fastEntry: 'फास्ट एंट्री',
    fastEntryLocked: 'लॉक {number}'
  },
  board: {
    pausedTitle: 'खेल रुका हुआ है',
    tapToResume: 'जारी रखने के लिए टैप करें ▶️',
    resumeTooltip: 'जारी रखें'
  },
  themes: {
    toast: '🎨 {name} थीम लागू',
    clay: '🏺 सिरेमिक और मिट्टी',
    clayDesc: 'मैट सिरेमिक कीज़ और स्पर्श 3D अहसास',
    matteDark: '🌌 मैट नाइट डार्क',
    matteDarkDesc: 'आंखों के लिए आरामदायक प्रीमियम डार्क लुक',
    pureCeramic: '🧊 प्योर क्लेमॉर्फिज्म',
    pureCeramicDesc: 'सफेद सिरेमिक कीज के साथ 3D स्पर्श',
    editorial: '📰 क्लासिक समाचार पत्र',
    editorialDesc: 'स्विस टाइपोग्राफी और आरामदायक पेपर टोन'
  },
  conflicts: {
    boxes: [
      'ऊपरी बायां', 'ऊपरी केंद्र', 'ऊपरी दायां',
      'मध्य बायां', 'केंद्र', 'मध्य दायां',
      'निचला बायां', 'निचला केंद्र', 'निचला दायां'
    ],
    boxDuplicate: '⚠️ [{box} 3x3 ब्लॉक] में संख्या {num} पहले से मौजूद है! {suffix}',
    rowDuplicate: '⚠️ पंक्ति {row} में संख्या {num} पहले से मौजूद है! {suffix}',
    colDuplicate: '⚠️ स्तंभ {col} में संख्या {num} पहले से मौजूद है! {suffix}',
    multipleDuplicates: '⚠️ इस ब्लॉक/पंक्ति/स्तंभ में संख्या {num} पहले से मौजूद है! {suffix}',
    notSolution: '⚠️ संख्या {num} इस सेल का सही उत्तर नहीं है! {suffix}',
    boardFullHasMistakes: '⚠️ बोर्ड भरा है लेकिन कुछ गलतियां हैं। पुनः जांचें!',
    timeAttackSuffix: '(गलती {count} | +10 सेकंड दंड)',
    classicSuffix: '(गलतियां {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 ग्रैंडमास्टर',
      desc: 'शीर्ष {percentile}% खिलाड़ी! शीर्ष 1% की अद्वितीय तार्किक क्षमता।'
    },
    mensa: {
      title: '🧠 मेंसा स्तर',
      desc: 'शीर्ष {percentile}% खिलाड़ी! उत्कृष्ट विश्लेषणात्मक व तार्किक बुद्धि।'
    },
    superior: {
      title: '⚡ उच्च बुद्धि',
      desc: 'शीर्ष {percentile}% खिलाड़ी! तेज अंतर्ज्ञान और समस्या सुलझाने की अद्भुत क्षमता।'
    },
    aboveAverage: {
      title: '💡 औसत से ऊपर',
      desc: 'शीर्ष {percentile}% खिलाड़ी! लचीली और स्थिर तार्किक सोच।'
    },
    balanced: {
      title: '🎯 संतुलित मस्तिष्क',
      desc: 'शीर्ष {percentile}% खिलाड़ी! सभी 5 संज्ञानात्मक क्षेत्रों का संतुलित विकास।'
    },
    developing: {
      title: '🌱 मस्तिष्क प्रशिक्षण',
      desc: 'प्रारंभिक अभ्यास चरण, निरंतर खेल से आईक्यू तेजी से बढ़ेगा!'
    }
  }
};
