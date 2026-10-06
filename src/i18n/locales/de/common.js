export const common = {
  common: {
    you: 'Du',
    back: 'Zurück',
    close: 'Schließen',
    confirm: 'OK',
    cancel: 'Abbrechen',
    restart: 'Neustart',
    restartConfirm: "Dieses Rätsel neu starten? Das laufende Spiel zählt als Niederlage.",
    abandonConfirm: "Ein Spiel läuft noch. Wenn du ein neues startest, zählt es als Niederlage. Trotzdem starten?",
    newGame: 'Neues Spiel',
    home: 'Startseite',
    pause: 'Pause',
    resume: 'Fortsetzen',
    exitAppPrompt: 'Drücke erneut Zurück, um die App zu beenden.',
    confirmLeaveGame: 'Möchtest du das Spiel pausieren und zur Startseite zurückkehren?',
    shareUnavailable: 'Teilen ist auf diesem Gerät nicht verfügbar.'
  },
  calendar: {
    days: {
      sun: 'S',
      mon: 'M',
      tue: 'D',
      wed: 'M',
      thu: 'D',
      fri: 'F',
      sat: 'S'
    }
  },
  levels: {
    1: 'Einführung',
    2: 'Einfach',
    3: 'Mittel',
    4: 'Schwer',
    5: 'Experte'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: 'Fehler {count}/{max}',
    mistakesUnlimited: 'Fehler {count}',
    timeAttackMistake: 'Fehler {count} (+10s)',
    combo: '🔥 {count} KOMBO!',
    restartShort: 'Neustart',
    newGameShort: 'Neues Spiel',
    themeTooltip: 'Design ändern',
    soundOn: 'Ton stummschalten',
    soundOff: 'Ton aktivieren'
  },
  keypad: {
    undo: 'Rückgängig',
    erase: 'Löschen',
    notes: 'Notizen',
    notesOn: 'Notizen AN',
    notesOff: 'Notizen AUS',
    hint: 'Tipp',
    rewardHint: '+1 Tipp',
    fastEntry: 'Schnellmodus'
  },
  board: {
    pausedTitle: 'Spiel pausiert',
    tapToResume: 'Tippen zum Fortsetzen ▶️',
    resumeTooltip: 'Tippen zum Fortsetzen'
  },
  themes: {
    clay: '🏺 Warmer Ton',
    matteDark: '🌌 Mattes Dunkelharz',
    pureCeramic: '🧊 Reine Keramik',
    editorial: '📰 Klassisches Zeitungspapier'
  },
  conflicts: {
    boxDuplicate: '⚠️ Zahl {num} existiert bereits im [3x3-Block {box}]! {suffix}',
    rowDuplicate: '⚠️ Zahl {num} existiert bereits in Zeile {row}! {suffix}',
    colDuplicate: '⚠️ Zahl {num} existiert bereits in Spalte {col}! {suffix}',
    multipleDuplicates: '⚠️ Zahl {num} existiert bereits im selben Block, in derselben Zeile oder Spalte! {suffix}',
    notSolution: '⚠️ Zahl {num} ist nicht die Lösung für dieses Feld! {suffix}',
    cageDuplicate: '⚠️ Zahl {num} ist bereits in diesem Käfig! {suffix}',
    cageSum: '⚠️ Dieser Käfig ergibt nicht mehr {sum}! {suffix}',
    boardFullHasMistakes: '⚠️ Das Spielfeld ist voll, enthält jedoch noch Fehler. Bitte überprüfen!',
    timeAttackSuffix: '(Fehler {count} | +10s Strafe)',
    classicSuffix: '(Fehler {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Großmeister',
      desc: 'Du hast den höchsten Rang erreicht.'
    },
    expert: {
      title: '🧠 Experte',
      desc: 'Du löst schwere Rätsel zuverlässig.'
    },
    superior: {
      title: '⚡ Fortgeschritten',
      desc: 'Du bist bereit für fortgeschrittene Rätsel.'
    },
    aboveAverage: {
      title: '💡 Mittelstufe',
      desc: 'Du wirst stetig besser.'
    },
    balanced: {
      title: '🎯 Ausgewogen',
      desc: 'Deine 5 Spielwerte wachsen gleichmäßig.'
    },
    developing: {
      title: '🌱 Einsteiger',
      desc: 'Spiel weiter, dann steigt dein Wert.'
    }
  }
};
