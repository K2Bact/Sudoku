export const common = {
  common: {
    you: "You",
    back: 'Back',
    close: 'Close',
    confirm: 'OK',
    cancel: 'Cancel',
    restart: 'Restart',
    restartConfirm: "Restart this puzzle? The current game will count as a loss.",
    abandonConfirm: "A game is in progress. Starting a new one counts it as a loss. Start anyway?",
    newGame: 'New Game',
    home: 'Home',
    pause: 'Pause',
    resume: 'Resume',
    exitAppPrompt: 'Press back again to exit the app.',
    confirmLeaveGame: 'Pause and go back to Home?',
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
    themeTooltip: 'Change Theme',
    soundOn: 'Mute Sound',
    soundOff: 'Enable Sound'
  },
  keypad: {
    undo: 'Undo',
    erase: 'Erase',
    notes: 'Notes',
    notesOn: 'Notes ON',
    notesOff: 'Notes OFF',
    hint: 'Hint',
    rewardHint: '+1 Hint',
    fastEntry: 'Fast Entry'
  },
  board: {
    pausedTitle: 'Paused',
    tapToResume: 'Tap to resume ▶️',
    resumeTooltip: 'Tap to Resume'
  },
  themes: {
    clay: '🏺 Warm Clay',
    matteDark: '🌌 Matte Dark',
    pureCeramic: '🧊 Pure Ceramic',
    editorial: '📰 Classic Paper'
  },
  conflicts: {
    boxDuplicate: '⚠️ Number {num} already exists in [{box} 3x3 box]! {suffix}',
    rowDuplicate: '⚠️ Number {num} already exists in row {row}! {suffix}',
    colDuplicate: '⚠️ Number {num} already exists in column {col}! {suffix}',
    multipleDuplicates: '⚠️ Number {num} already exists in the same 3x3 box / row / column! {suffix}',
    notSolution: '⚠️ Number {num} is not the solution for this cell! {suffix}',
    boardFullHasMistakes: '⚠️ The board is full, but some numbers are wrong. Take another look!',
    timeAttackSuffix: '(Mistake {count} | +10s penalty)',
    classicSuffix: '(Mistakes {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Grand Master',
      desc: "You've reached the top rank."
    },
    expert: {
      title: '🧠 Expert',
      desc: 'You solve hard puzzles consistently.'
    },
    superior: {
      title: '⚡ Advanced',
      desc: "You're ready for advanced puzzles."
    },
    aboveAverage: {
      title: '💡 Intermediate',
      desc: "You're improving steadily."
    },
    balanced: {
      title: '🎯 Balanced',
      desc: 'Your 5 play metrics are growing evenly.'
    },
    developing: {
      title: '🌱 Beginner',
      desc: 'Keep playing and your score will go up.'
    }
  }
};
