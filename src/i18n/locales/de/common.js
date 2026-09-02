export const common = {
  common: {
    you: 'Du',
    back: 'Zurück',
    close: 'Schließen',
    confirm: 'OK',
    cancel: 'Abbrechen',
    restart: 'Neustart',
    restartConfirm: 'Dieses Rätsel neu starten?',
    newGame: 'Neues Spiel',
    home: 'Startseite',
    save: 'Speichern',
    pause: 'Pause',
    resume: 'Fortsetzen',
    loading: 'Wird geladen...',
    error: 'Fehler',
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
    pauseTooltip: 'Timer pausieren',
    themeTooltip: 'Design ändern',
    soundOn: 'Ton stummschalten',
    soundOff: 'Ton aktivieren'
  },
  keypad: {
    undo: 'Rückgängig',
    erase: 'Löschen',
    notes: 'Notizen',
    hint: 'Tipp',
    rewardHint: '+1 Tipp',
    fastEntry: 'Schnellmodus',
    fastEntryLocked: 'Fixiert {number}'
  },
  board: {
    pausedTitle: 'Spiel pausiert',
    tapToResume: 'Tippen zum Fortsetzen ▶️',
    resumeTooltip: 'Tippen zum Fortsetzen'
  },
  themes: {
    toast: '🎨 Zu {name} gewechselt',
    clay: '🏺 Warme Keramik & Ton',
    clayDesc: 'Warme Keramiktasten mit fühlbarer 3D-Physik',
    matteDark: '🌌 Mattes Dunkelharz',
    matteDarkDesc: 'Premium-Mattharz mit sanftem Mitternachtsleuchten',
    pureCeramic: '🧊 Reines Claymorphism',
    pureCeramicDesc: 'Glatte, abgerundete weiße Keramiktasten',
    editorial: '📰 Klassisches Zeitungspapier',
    editorialDesc: 'Klares, augenfreundliches Schweizer Zeitungspapier'
  },
  conflicts: {
    boxes: [
      'Oben-Links', 'Oben-Mitte', 'Oben-Rechts',
      'Mitte-Links', 'Zentrum', 'Mitte-Rechts',
      'Unten-Links', 'Unten-Mitte', 'Unten-Rechts'
    ],
    boxDuplicate: '⚠️ Zahl {num} existiert bereits im [3x3-Block {box}]! {suffix}',
    rowDuplicate: '⚠️ Zahl {num} existiert bereits in Zeile {row}! {suffix}',
    colDuplicate: '⚠️ Zahl {num} existiert bereits in Spalte {col}! {suffix}',
    multipleDuplicates: '⚠️ Zahl {num} existiert bereits im selben Block / Zeile / Spalte! {suffix}',
    notSolution: '⚠️ Zahl {num} ist nicht die Lösung für dieses Feld! {suffix}',
    boardFullHasMistakes: '⚠️ Das Spielfeld ist voll, enthält jedoch noch Fehler. Bitte überprüfen!',
    timeAttackSuffix: '(Fehler {count} | +10s Strafe)',
    classicSuffix: '(Fehler {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Großmeister',
      desc: 'Top {percentile}% aller Spieler! Meisterhafte logische Deduktion der besten 1%.'
    },
    mensa: {
      title: '🧠 Mensa-Niveau',
      desc: 'Top {percentile}% aller Spieler! Überragende logische und analytische Denkfähigkeit.'
    },
    superior: {
      title: '⚡ Überlegene Logik',
      desc: 'Top {percentile}% aller Spieler! Scharfe Intuition und außergewöhnliche Kombinationsgabe.'
    },
    aboveAverage: {
      title: '💡 Überdurchschnittlich',
      desc: 'Top {percentile}% aller Spieler! Flexible und robuste Problemlösungsfähigkeiten.'
    },
    balanced: {
      title: '🎯 Ausgeglichener Geist',
      desc: 'Top {percentile}% aller Spieler! Ausgewogene Entwicklung aller Denkfähigkeiten.'
    },
    developing: {
      title: '🌱 Gehirntraining',
      desc: 'Logische Grundlagen im Aufbau mit unbegrenztem Wachstumspotenzial.'
    }
  }
};
