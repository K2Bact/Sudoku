export const common = {
  common: {
    you: 'Tu',
    back: 'Indietro',
    close: 'Chiudi',
    on: 'SÌ',
    off: 'NO',
    confirm: 'OK',
    cancel: 'Annulla',
    restart: 'Ricomincia',
    restartConfirm: "Ricominciare questo puzzle? La partita in corso conterà come sconfitta.",
    abandonConfirm: "C’è una partita in corso. Iniziandone una nuova, conterà come sconfitta. Iniziare comunque?",
    newGame: 'Nuova Partita',
    home: 'Home',
    pause: 'Pausa',
    resume: 'Riprendi',
    exitAppPrompt: 'Premi di nuovo Indietro per uscire dall’applicazione.',
    confirmLeaveGame: 'Vuoi mettere in pausa e tornare alla Home?',
    shareUnavailable: 'La condivisione non è disponibile su questo dispositivo.'
  },
  calendar: {
    days: {
      sun: 'D',
      mon: 'L',
      tue: 'M',
      wed: 'M',
      thu: 'G',
      fri: 'V',
      sat: 'S'
    }
  },
  levels: {
    1: 'Iniziazione',
    2: 'Facile',
    3: 'Medio',
    4: 'Difficile',
    5: 'Esperto'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: 'Errori {count}/{max}',
    mistakesUnlimited: 'Errori {count}',
    timeAttackMistake: 'Errore {count} (+10s)',
    combo: '🔥 {count} COMBO!',
    restartShort: 'Riavvia',
    newGameShort: 'Nuova partita',
    themeTooltip: 'Cambia tema',
    soundOn: 'Disattiva audio',
    soundOff: 'Attiva audio'
  },
  keypad: {
    undo: 'Annulla',
    erase: 'Cancella',
    notes: 'Note',
    notesOn: 'Note ON',
    notesOff: 'Note OFF',
    hint: 'Suggerimento',
    rewardHint: '+1 aiuto',
    fastEntry: 'Modo Rapido'
  },
  board: {
    pausedTitle: 'Partita in Pausa',
    tapToResume: 'Tocca per riprendere ▶️',
    resumeTooltip: 'Tocca per riprendere'
  },
  themes: {
    clay: '🏺 Ceramica & Argilla',
    matteDark: '🌌 Resina Scura Opaca',
    pureCeramic: '🧊 Claymorphism Puro',
    editorial: '📰 Carta di Giornale Classica'
  },
  conflicts: {
    boxDuplicate: '⚠️ Il numero {num} esiste già nel [quadrante 3x3 {box}]! {suffix}',
    rowDuplicate: '⚠️ Il numero {num} esiste già nella riga {row}! {suffix}',
    colDuplicate: '⚠️ Il numero {num} esiste già nella colonna {col}! {suffix}',
    multipleDuplicates: '⚠️ Il numero {num} esiste già nello stesso quadrante / riga / colonna! {suffix}',
    notSolution: '⚠️ Il numero {num} non è la soluzione di questa casella! {suffix}',
    cageDuplicate: '⚠️ Il numero {num} è già in questa gabbia! {suffix}',
    cageSum: '⚠️ Questa gabbia non somma più {sum}! {suffix}',
    boardFullHasMistakes: '⚠️ Lo schema è completo ma contiene degli errori. Ricontrolla!',
    timeAttackSuffix: '(Errore {count} | penalità +10s)',
    classicSuffix: '(Errori {count}/3)',
    // Classic with the three-mistake limit switched off: no limit to count to, no time penalty.
    freeSuffix: '(Errori {count})'
  },
  tiers: {
    grandMaster: {
      title: '👑 Gran Maestro',
      desc: 'Hai raggiunto il grado più alto.'
    },
    expert: {
      title: '🧠 Esperto',
      desc: 'Risolvi con costanza puzzle difficili.'
    },
    superior: {
      title: '⚡ Avanzato',
      desc: 'Sei pronto per puzzle avanzati.'
    },
    aboveAverage: {
      title: '💡 Intermedio',
      desc: 'Stai migliorando costantemente.'
    },
    balanced: {
      title: '🎯 Equilibrato',
      desc: 'I tuoi 5 indicatori crescono in modo equilibrato.'
    },
    developing: {
      title: '🌱 Principiante',
      desc: 'Continua a giocare e il punteggio salirà.'
    }
  }
};
