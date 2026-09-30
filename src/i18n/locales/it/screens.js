export const screens = {
  game: {
    ghost: {
      ahead: '{time} avanti',
      behind: '{time} indietro',
      ghostHintNotice: '💡 Suggerimento usato – questo tempo non conta come record personale.'
    }
  },
  home: {
    scoreLabel: 'Logic Score',
    title: 'Sudoku',
    badge: 'PRO',
    hintTooltip: 'Suggerimenti',
    brainReportTitle: 'Analisi di gioco',
    brainPercentileShort: 'Puzzle completati: {won}',
    startSelectedLevel: 'Avvia Lv.{level} {name}',
    modeTabs: { classic: 'Classico', timeAttack: 'Cronometro', timeLimit: 'Sopravvivenza' },
    rivalModes: {
      standard: '🎯 Normale',
      ghost: '👻 Fantasma',
      delta: '⚡ Distacco',
      lockedToast: 'Completa questa difficoltà almeno 1 volta per sbloccarla.',
      timeLimitToast: "Fantasma e Scarto di tempo non sono disponibili in modalità Sopravvivenza.",
      infoAria: "Informazioni su Fantasma e Scarto di tempo",
      infoGhost: "Rigioca lo schema del record, contro la tua stessa partita.",
      infoDelta: "Uno schema nuovo, con il vantaggio o il ritardo sul tuo ritmo migliore.",
    },
    modes: {
      classic: { badge: 'CLASSICO', title: 'Singolo Classico', desc: 'Sudoku tradizionale, calmo e coinvolgente', startBtn: 'Nuova Partita' },
      timeAttack: { badge: 'CRONOMETRO', title: '⚡ Cronometro', desc: 'Gareggia contro il tempo per il miglior record!', startBtn: 'Avvia Cronometro' },
      timeLimit: { badge: 'SOPRAVVIVENZA', title: '⏳ Sopravvivenza', desc: 'Lv.{level} con {minutes} min! Sopravvivi prima dello 0s.', startBtn: 'Avvia' },
      daily: { title: 'Sfida Giornaliera', desc: 'Nuovo schema ogni giorno & stemmi mensili', badge: 'GIORNALIERO' },
      battle: { title: 'Duello 1v1 Online', desc: 'Partite in tempo reale' },
      aiBattle: { badge: 'VS IA', title: 'Duello contro l’IA', desc: 'Sfida 1:1 di velocità' },
      academy: { title: 'Accademia Sudoku', desc: 'Impara 32 tecniche dei maestri' },
      practice: { title: 'Allenamento Libero', desc: 'Errori illimitati, gioco rilassante' }
    },
    nav: {brain: 'Analisi', stats: 'Stats', academy: 'Accademia', settings: 'Opzioni' }
  },
  daily: {
    header: 'Sfide Giornaliere ({month})',
    badgeTitle: 'Maestro {month}',
    badgeDesc: '{completed}/{target} · Obiettivo 15',
    unlockingAd: '📺 Sblocco schema passato...',
    calendarTitle: '📅 Calendario 365 Giorni',
    futureAlert: 'Gli schemi futuri non sono ancora sbloccati.',
    pastUnlockNotice: '💡 I giorni passati persi (🔒) possono essere sbloccati guardando un breve video.',
    unlockModalTitle: 'Sblocca Schema Passato',
    unlockModalDesc: 'Lo schema del {date} è una sfida passata.\nGuarda un breve annuncio per sbloccarlo e giocare.\nVuoi guardare il video?',
    unlockModalConfirmBtn: '📺 Guarda & Sblocca',
    unlockModalCancelBtn: 'Annulla',
    missionCardTitle: '🎯 Missione Speciale di Oggi',
    missionCompleted: 'Missione di oggi completata! ✅',
    missionStartBtn: 'Avvia Missione 🚀',
    missionReward: '+1 Suggerimento & Presenza',
    tiers: { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Maestro' },
    missions: {
      beginnerLv1Title: '[Lv.1 Iniziazione] 1 Sudoku', beginnerLv1Desc: 'Completa uno schema Lv.1 Iniziazione per acquisire le basi logiche.',
      beginnerLv2Title: '[Lv.2 Facile] 1 Sudoku', beginnerLv2Desc: 'Completa uno schema Lv.2 Facile per praticare le tecniche di base.',
      medLv3Title: '[Lv.3+ Medio] 1 Sudoku', medLv3Desc: 'Completa uno schema Lv.3 Medio o superiore per testare le tue deduzioni.',
      advLv4Title: '[Lv.4+ Difficile] 1 Sudoku', advLv4Desc: 'Supera uno schema Lv.4 Difficile e dimostra abilità da maestro.',
      advLv5Title: '[Lv.5 Esperto] 1 Sudoku', advLv5Desc: 'Completa il difficilissimo Lv.5 Esperto per raggiungere l’élite.',
      battleTitle: 'Gioca 1 Duello 1v1 o IA', battleDesc: 'Partecipa a 1 duello in tempo reale o partita contro l’IA.',
      speedrunTitle: '⚡ Completa 1 puzzle in modalità Cronometro', speedrunDesc: 'Completa un puzzle in modalità Cronometro.'
    }
  },
  removeAds: {
    title: 'Rimuovi Pubblicità & Premium',
    heroTitle: 'Sudoku senza distrazioni',
    heroDesc: 'Rimuovi per sempre i banner inferiori e gli annunci a schermo intero.',
    benefitsTitle: '👑 Vantaggi Premium',
    benefit1: 'Rimozione permanente di banner e annunci interstiziali',
    benefit2: 'Massima concentrazione e risparmio di batteria',
    benefit3: 'Supporta gli sviluppatori indipendenti e i futuri aggiornamenti',
    buyBtn: 'Senza Pubblicità ({price})',
    restoreBtn: 'Ripristina',
    alreadyPurchased: 'Hai già l’accesso Premium! 🎉',
    processing: '💳 Elaborazione in corso...',
    purchaseBtn: 'Rimuovi Pubblicità',
    buySuccess: 'Acquisto completato con successo! Grazie per il supporto.',
    restoreSuccess: 'Acquisti ripristinati con successo.',
    restoreFail: 'Nessun acquisto precedente trovato da ripristinare.',
    buyFail: 'Non è stato possibile completare l’acquisto. Riprova più tardi.'
  },
  tutorialOverlay: {
    exitTooltip: 'Esci dal tutorial',
    step1Title: '🎯 Passo 1: Inserisci un numero',
    step1Desc: 'Tocca la casella evidenziata [Riga 1, Col 3] e digita [9] sul tastierino!',
    step2Title: '✏️ Passo 2: Note a matita (Candidati)',
    step2Desc: 'Attiva [Note] nella barra e scrivi il candidato [3] in questa casella!',
    step3Title: '🔒 Passo 3: Modo Rapido (Numero prima)',
    step3Desc: 'Fissa il numero [4] e tocca rapidamente le caselle vuote per riempirle!',
    step4Title: '🎉 Passo 4: Tutorial Completato!',
    step4Desc: 'Congratulazioni! Hai imparato a inserire numeri, prendere note e usare il modo rapido.',
    finishBtn: 'Inizia a giocare',
    nextBtn: 'Passo Successivo'
  },
  settings: {
    title: 'Impostazioni',
    themeSection: '🎨 Tema Visivo',
    languageSection: '🌐 Lingua',
    languages: {
      auto: 'Sistema'
    },
    gameplaySection: '🎮 Regole di Gioco',
    limitMistakes: 'Limite di 3 Errori (Cuori)',
    limitMistakesDesc: "Game Over dopo 3 errori. Disattivato: i tempi migliori non vengono salvati",
    autoCheck: 'Controllo Automatico degli Errori',
    autoCheckDesc: 'Evidenzia subito i numeri errati in rosso',
    soundSection: '🔊 Audio & Vibrazione',
    soundFx: 'Effetti Sonori',
    soundFxDesc: 'Suoni alla digitazione dei numeri e dei tasti',
    hapticFx: 'Risposta Tattile',
    hapticFxDesc: 'Vibra quando inserisci numeri corretti o errati',
    adPrivacyBtn: 'Privacy degli annunci',
    adPrivacyDesc: 'Modifica la scelta sugli annunci personalizzati',
    resetData: 'Ripristina Tutti i Dati Locali',
    resetDataDesc: 'Cancella tutte le statistiche e la cronologia locale',
    resetConfirm: '⚠️ Attenzione: Tutta la cronologia, i suggerimenti e i dati dell’analisi di gioco verranno cancellati per sempre. Continuare?',
    resetSuccess: 'Dati ripristinati con successo.',
    privacySection: '🛡️ Privacy & Sicurezza',
    privacyPolicyBtn: 'Privacy',
    privacySubtitle: 'Protezione della privacy',
    privacyModalTitle: 'Informativa sulla Privacy',
    privacy: {
      subtitle: 'Sudoku non richiede un account. Ecco cosa l\'app salva e invia davvero.',
      sec1Title: '1. Archiviazione e backup', sec1Desc: "Record, suggerimenti e impostazioni sono salvati sul tuo dispositivo. Senza accesso a Play Giochi restano solo su questo dispositivo. Non raccogliamo mai nome, email, numero di telefono, contatti o posizione.",
      sec2Title: '2. Google Play Giochi', sec2Desc: 'Finché hai eseguito l\'accesso a Play Giochi, ogni vittoria salva automaticamente i tuoi progressi (statistiche, obiettivi, suggerimenti, impostazioni) nei dati salvati di Play Giochi e invia il tuo Logic Score a una classifica di Play Giochi. Questi dati restano nel tuo account Google.',
      sec3Title: '3. Duelli 1v1', sec3Desc: 'I duelli 1v1 in tempo reale usano Google Firebase per inviare all\'avversario un ID giocatore generato casualmente, un soprannome automatico (Player_xxxx) e i tuoi progressi nel sudoku. L\'ID è salvato sul dispositivo e riutilizzato; non è collegato al tuo nome né ad alcun account.',
      sec4Title: '4. Pubblicità e acquisti', sec4Desc: 'L\'app mostra annunci tramite Google AdMob: un banner, un annuncio a schermo intero dopo una vittoria e video con premio facoltativi. AdMob può trattare il tuo ID pubblicità. L\'acquisto Rimuovi pubblicità è gestito da Google Play; non riceviamo mai i tuoi dati di pagamento.'
    }
  },
  stats: {
    classicBest: 'Miglior Classico',
    speedrunBest: 'Miglior Cronometro',
    survivalTitle: '⏳ Modalità Sopravvivenza',
    survivalTotalWins: 'Vittorie in Sopravvivenza',
    survivalWinsUnit: '{count}',
    summaryTitle: 'Riepilogo Prestazioni',
    pvpRating: "Punteggio",
    pvpRecordLabel: "Bilancio",
    pvpRecord: "{wins}V · {losses}S",
    totalPlayed: 'Partite Giocate',
    totalWon: 'Partite Vinte',
    winRate: 'Percentuale Vittorie'
  },
  brainReport: {
    scoreLabel: 'Logic Score',
    scoreHowTitle: "ⓘ Come si calcola il Logic Score?",
    scoreHowBody: "Sale quando completi tutta la griglia e vinci. Conta di più il livello più difficile superato senza suggerimenti; il numero di vittorie e la percentuale di vittorie contano un po’. I duelli 1v1 e contro l’IA non contano nelle vittorie né nella percentuale di vittorie: hanno un bilancio a parte nelle Stats. Game over e partite abbandonate abbassano la percentuale di vittorie e possono togliere qualche punto. La classifica usa questo punteggio quando hai eseguito l’accesso a Play Giochi.",
    shareText: '[Analisi di gioco Sudoku]\nLogic Score: {iq}\nLivello: {tier}\nProva Sudoku oggi stesso!',
    copiedToast: 'Analisi copiata negli appunti.',
    focus: 'Senza errori',
    durability: 'Costanza',
    accuracy: 'Tasso di completamento',
    logic: 'Difficoltà',
    speed: 'Velocità',
    shareCardBtn: '🔗 Condividi',
    attributesTitle: '📈 5 indicatori di gioco',
    title: 'Analisi di gioco',
    shareTitle: 'La mia analisi di gioco Sudoku',
    tiers: {
      grandMaster: '👑 Gran Maestro',
      grandMasterDesc: 'Hai raggiunto il grado più alto.',
      expert: '🧠 Esperto',
      expertDesc: 'Risolvi con costanza puzzle difficili.',
      superior: '⚡ Avanzato',
      superiorDesc: 'Sei pronto per puzzle avanzati.',
      aboveAverage: '💡 Intermedio',
      aboveAverageDesc: 'Stai migliorando costantemente.',
      balanced: '🎯 Equilibrato',
      balancedDesc: 'I tuoi 5 indicatori crescono in modo equilibrato.',
      developing: '🌱 Principiante',
      developingDesc: 'Continua a giocare e il punteggio salirà.'
    }
  },
  battleLobby: {
    title: 'Duello 1v1 in Tempo Reale',
    cancelBtn: 'Annulla Ricerca',
    searching: 'Ricerca di un avversario...',
    autoMatchTitle: 'Partita Rapida',
    autoMatchDesc: 'Matchmaking veloce con giocatori di tutto il mondo',
    mmrBadge: 'Completamento: {rate}%',
    findOpponentBtn: 'Cerca Avversario',
    noOpponentFound: 'Nessun avversario trovato. Giocare contro l’IA?',
    connectFailed: "Impossibile connettersi al gioco online. Riprova più tardi. Giocare contro l’IA?",
    playAiInstead: 'Sfida l’IA'
  },
  battleResult: {
    victoryTitle: 'Vittoria nel Duello 1v1!',
    defeatTitle: 'Sconfitta nel Duello 1v1',
    aiVictoryTitle: 'Vittoria contro l’IA!',
    aiDefeatTitle: 'Sconfitta contro l’IA',
    victoryDesc: 'Hai completato lo schema per primo e battuto {opponent}!',
    victoryMistakeDesc: '{opponent} è fuori gara dopo 3 errori. Hai vinto!',
    defeatDesc: '{opponent} ha completato lo schema per primo.',
    defeatMistakeDesc: 'Sei fuori gara dopo aver commesso 3 errori.',
    disqualified: '💀 Fuori',
    finalProgress: 'Progresso finale',
    ratingChange: 'Variazione Punteggio MMR 1v1',
    aiModeLabel: 'Partita di Allenamento IA (Lv.{level})',
    aiWonBadge: 'Allenamento Vinto',
    aiLostBadge: 'Allenamento Concluso',
    you: 'Tu',
    opponent: 'Avversario',
    lobbyBtn: 'Stanza Duelli',
    aiLobbyBtn: 'Menu Duelli IA',
    rematchBtn: 'Chiedi Rivincita',
    aiRematchBtn: 'Gioca Ancora',
    rematchWaitingBtn: 'In attesa... ({seconds}s)',
    rematchAcceptedToast: '🎉 Rivincita accettata! Inizio nuova partita.',
    rematchRejectedToast: 'L’avversario ha rifiutato la rivincita.',
    rematchOpponentLeftToast: 'L’avversario ha lasciato la stanza.',
    homeBtn: 'Home'
  },
  rematchToast: {
    title: '{opponent} ha richiesto una rivincita!',
    countdown: '{seconds}s',
    acceptBtn: 'Accetta',
    declineBtn: 'Rifiuta'
  },
  battleHeader: {
    aiTag: 'IA',
    confirmLeave: 'Vuoi dichiarare forfait e tornare alla home?',
    emptyCellsLeft: 'rimasti'
  },
  aiBattleScreen: {
    selectLevelTitle: 'Difficoltà IA',
    selectLevelDesc: 'Seleziona un avversario IA adatto al tuo livello di abilità.',
    aiSpeed: 'Velocità: {speed}',
    level1Desc: 'Bot Principiante: Risolve con calma per aiutarti a imparare le basi.',
    level2Desc: 'Bot Normale: Risolutore costante con pochissimi errori.',
    level3Desc: 'Bot Esperto: Ritmo veloce e pochi errori.',
    level4Desc: 'Bot Maestro: Molto veloce, errori rari.',
    level5Desc: 'Bot Gran Maestro: Il bot più veloce e con meno errori.',
    startBtn: 'Avvia Duello IA Lv.{level} {name}'
  },
  academy: {
    tabs: { stage1: 'Fase 1', stage2: 'Fase 2', stage3: 'Fase 3', stage4: 'Fase 4', stage5: 'Fase 5' },
    stageTitles: {
      stage1: 'Fase 1: Tecniche Base (Singles & Linee)',
      stage2: 'Fase 2: Tecniche Intermedie (Coppie & Intersezioni)',
      stage3: 'Fase 3: Tecniche Avanzate (Famiglia Wing)',
      stage4: 'Fase 4: Tecniche da Maestro (Fish, Colorazione & Rettangolo Unico)',
      stage5: 'Fase 5: Tecniche da Gran Maestro (AIC, ALS & Exocet)'
    },
    title: 'Accademia Sudoku',
    theoryBoard: {
      patternTab: 'Schema',
      resultTab: 'Risultato',
      patternCaption: 'Le caselle colorate formano lo schema di questa tecnica. È la stessa griglia dell\'Esempio pratico 1.',
      resultCaption: 'I candidati segnati in rosso vengono eliminati da questo schema.',
      placeCaption: 'Questo schema fissa la cifra evidenziata come risposta di quella casella.'
    },
    practiceUi: {
      theory: 'Teoria',
      practice1: 'Esercizio 1',
      practice2: 'Esercizio 2',
      success: 'Corretto [{val}]! Tecnica padroneggiata alla perfezione!',
      retry: 'Riprova',
      error: '[{val}] non è corretto. Ricontrolla i numeri iniziali!',
      prompt: '👇 Tocca il numero corrispondente (?) sul tastierino qui sotto.',
      promptEliminated: '👇 Tocca il candidato che viene eliminato dalla casella obiettivo.'
    }
  },
  adBanner: {removeBtn: 'Senza Pubblicità' }
};
