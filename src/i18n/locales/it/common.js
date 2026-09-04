export const common = {
  common: {
    you: 'Tu',
    back: 'Indietro',
    close: 'Chiudi',
    confirm: 'OK',
    cancel: 'Annulla',
    restart: 'Ricomincia',
    restartConfirm: 'Ricominciare questo schema?',
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
    boardFullHasMistakes: '⚠️ Lo schema è completo ma contiene degli errori. Ricontrolla!',
    timeAttackSuffix: '(Errore {count} | penalità +10s)',
    classicSuffix: '(Errori {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Gran Maestro',
      desc: 'Top {percentile}% dei giocatori! Deduzione logica magistrale degna dell’élite top 1%.'
    },
    mensa: {
      title: '🧠 Livello Mensa',
      desc: 'Top {percentile}% dei giocatori! Capacità logica e analitica eccezionale.'
    },
    superior: {
      title: '⚡ Logica Superiore',
      desc: 'Top {percentile}% dei giocatori! Intuito acuto e brillante risoluzione dei problemi.'
    },
    aboveAverage: {
      title: '💡 Sopra la Media',
      desc: 'Top {percentile}% dei giocatori! Pensiero analitico flessibile e affidabile.'
    },
    balanced: {
      title: '🎯 Mente Equilibrata',
      desc: 'Top {percentile}% dei giocatori! Sviluppo armonioso di tutte le aree cognitive.'
    },
    developing: {
      title: '🌱 Allenamento Mentale',
      desc: 'Fase iniziale di sviluppo logico con potenziale illimitato.'
    }
  }
};
