export const common = {
  common: {
    you: "You",
    back: 'Back',
    close: 'Close',
    confirm: 'OK',
    cancel: 'Cancel',
    restart: 'Restart',
    restartConfirm: 'Restart this puzzle?',
    newGame: 'New Game',
    home: 'Home',
    save: 'Save',
    pause: 'Pause',
    resume: 'Resume',
    loading: 'Loading...',
    error: 'Error',
    exitAppPrompt: 'Press back again to exit the app.',
    confirmLeaveGame: 'Are you sure you want to pause and return to Home?',
    shareUnavailable: "Sharing isn't available on this device."
  },
  calendar: {
    days: {
      sun: 'S',
      mon: 'M',
      tue: 'T',
      wed: 'W',
      thu: 'T',
      fri: 'F',
      sat: 'S'
    }
  },
  levels: {
    1: 'Intro',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Expert'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: 'Mistakes {count}/{max}',
    mistakesUnlimited: 'Mistakes {count}',
    timeAttackMistake: 'Mistake {count} (+10s)',
    combo: '🔥 {count} COMBO!',
    restartShort: 'Restart',
    newGameShort: 'New Game',
    pauseTooltip: 'Pause Timer',
    themeTooltip: 'Change Theme',
    soundOn: 'Mute Sound',
    soundOff: 'Enable Sound'
  },
  keypad: {
    undo: 'Undo',
    erase: 'Erase',
    notes: 'Notes',
    hint: 'Hint',
    rewardHint: '+1 Hint',
    fastEntry: 'Fast Mode',
    fastEntryLocked: 'Locked {number}'
  },
  board: {
    pausedTitle: 'Game is Paused',
    tapToResume: 'Tap screen to resume ▶️',
    resumeTooltip: 'Tap to Resume'
  },
  themes: {
    toast: '🎨 Switched to {name}',
    clay: '🏺 Warm Ceramic & Clay',
    clayDesc: 'Warm ceramic matte keycaps with 3D tactile physics',
    matteDark: '🌌 Soft Matte Resin Dark',
    matteDarkDesc: 'Premium matte resin finish with soft midnight glow',
    pureCeramic: '🧊 Pure Claymorphism',
    pureCeramicDesc: 'Smooth rounded white ceramic cushion keycaps',
    editorial: '📰 Classic Pure Paper',
    editorialDesc: 'Clean, eye-friendly Swiss editorial paper tone'
  },
  conflicts: {
    boxes: [
      'Top-Left', 'Top-Center', 'Top-Right',
      'Middle-Left', 'Center', 'Middle-Right',
      'Bottom-Left', 'Bottom-Center', 'Bottom-Right'
    ],
    boxDuplicate: '⚠️ Number {num} already exists in [{box} 3x3 box]! {suffix}',
    rowDuplicate: '⚠️ Number {num} already exists in row {row}! {suffix}',
    colDuplicate: '⚠️ Number {num} already exists in column {col}! {suffix}',
    multipleDuplicates: '⚠️ Number {num} already exists in the same 3x3 box / row / column! {suffix}',
    notSolution: '⚠️ Number {num} is not the solution for this cell! {suffix}',
    boardFullHasMistakes: '⚠️ The board is full, but some cells have errors. Please review!',
    timeAttackSuffix: '(Mistake {count} | +10s penalty)',
    classicSuffix: '(Mistakes {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Grand Master',
      desc: 'Top {percentile}% of players! Elite 1% master-level deductive reasoning.'
    },
    mensa: {
      title: '🧠 Mensa Level',
      desc: 'Top {percentile}% of players! Superior Mensa-tier logical deduction.'
    },
    superior: {
      title: '⚡ Superior Logic',
      desc: 'Top {percentile}% of players! Sharp and exceptional logical reasoning.'
    },
    aboveAverage: {
      title: '💡 Above Average',
      desc: 'Top {percentile}% of players! Flexible and robust problem solving.'
    },
    balanced: {
      title: '🎯 Balanced Brain',
      desc: 'Top {percentile}% of players! Stable and well-balanced reasoning skills.'
    },
    developing: {
      title: '🌱 Brain Training',
      desc: 'Developing logic foundation with infinite growth potential.'
    }
  }
};
