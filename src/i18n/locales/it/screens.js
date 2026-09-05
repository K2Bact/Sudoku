export const screens = {
  game: {
    ghost: {
      ahead: '{time} avanti',
      behind: '{time} indietro',
      ghostHintNotice: '💡 L’uso dei suggerimenti esclude l’aggiornamento del record PB.'
    }
  },
  home: {
    title: 'Sudoku',
    badge: 'PRO',
    hintTooltip: 'Suggerimenti',
    brainReportTitle: 'Analisi Cerebrale',
    brainPercentileShort: 'Top {percentile}% · {won} Vittorie',
    startSelectedLevel: 'Avvia Lv.{level} {name}',
    modeTabs: { classic: 'Classico', timeAttack: 'Cronometro', timeLimit: 'Sopravvivenza' },
    rivalModes: {
      standard: '🎯 Normale',
      ghost: '👻 Fantasma',
      delta: '⚡ Distacco',
      lockedToast: 'Completa questa difficoltà almeno 1 volta per sbloccarla.'
    },
    modes: {
      classic: { badge: 'CLASSICO', title: 'Singolo Classico', desc: 'Sudoku tradizionale, calmo e coinvolgente', startBtn: 'Nuova Partita' },
      timeAttack: { badge: 'CRONOMETRO', title: '⚡ Cronometro', desc: 'Gareggia contro il tempo per il miglior record!', startBtn: 'Avvia Cronometro' },
      timeLimit: { badge: 'SOPRAVVIVENZA', title: '⏳ Sopravvivenza', desc: 'Lv.{level} con {minutes} min! Sopravvivi prima dello 0s.', startBtn: 'Avvia' },
      daily: { title: 'Sfida Giornaliera', desc: 'Nuovo schema ogni giorno & stemmi mensili', badge: 'NUOVO' },
      battle: { title: 'Duello 1v1 Online', desc: 'Partite in tempo reale' },
      aiBattle: { title: 'Duello contro l’IA', desc: 'Sfida 1:1 di velocità' },
      academy: { title: 'Accademia Sudoku', desc: 'Impara 32 tecniche dei maestri' },
      practice: { title: 'Allenamento Libero', desc: 'Errori illimitati, gioco rilassante' }
    },
    nav: {brain: 'QI', stats: 'Stats', academy: 'Accademia', settings: 'Opzioni' }
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
      beginnerLv1Title: '[Lv.1 Molto Facile] 1 Sudoku', beginnerLv1Desc: 'Completa uno schema Lv.1 Molto Facile per acquisire le basi logiche.',
      beginnerLv2Title: '[Lv.2 Facile] 1 Sudoku', beginnerLv2Desc: 'Completa uno schema Lv.2 Facile per praticare le tecniche di base.',
      medLv3Title: '[Lv.3+ Medio] 1 Sudoku', medLv3Desc: 'Completa uno schema Lv.3 Medio o superiore per testare le tue deduzioni.',
      advLv4Title: '[Lv.4+ Difficile] 1 Sudoku', advLv4Desc: 'Supera uno schema Lv.4 Difficile e dimostra abilità da maestro.',
      advLv5Title: '[Lv.5 Maestro] 1 Sudoku', advLv5Desc: 'Completa il difficilissimo Lv.5 Maestro per raggiungere l’élite.',
      battleTitle: 'Gioca 1 Duello 1v1 o IA', battleDesc: 'Partecipa a 1 duello in tempo reale o partita contro l’IA.',
      speedrunTitle: '⚡ Completa 1 modalità Cronometro', speedrunDesc: 'Completa un puzzle in modalità Cronometro sfruttando le combo.'
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
    restoreFail: 'Nessun acquisto precedente trovato da ripristinare.'
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
      auto: 'Predefinita di Sistema'
    },
    gameplaySection: '🎮 Regole di Gioco',
    limitMistakes: 'Limite di 3 Errori (Cuori)',
    limitMistakesDesc: 'Game Over dopo 3 errori commessi',
    autoCheck: 'Controllo Automatico degli Errori',
    autoCheckDesc: 'Evidenzia subito i numeri errati in rosso',
    soundSection: '🔊 Audio & Vibrazione',
    soundFx: 'Effetti Sonori',
    soundFxDesc: 'Suoni alla digitazione dei numeri e dei tasti',
    hapticFx: 'Risposta Tattile',
    hapticFxDesc: 'Vibra quando inserisci numeri corretti o errati',
    resetData: 'Ripristina Tutti i Dati Locali',
    resetDataDesc: 'Cancella tutte le statistiche e la cronologia locale',
    resetConfirm: '⚠️ Attenzione: Tutta la cronologia, i suggerimenti e le statistiche cerebrali verranno cancellati per sempre. Continuare?',
    resetSuccess: 'Dati ripristinati con successo.',
    privacySection: '🛡️ Privacy & Sicurezza',
    privacyPolicyBtn: 'Privacy',
    privacySubtitle: 'Protezione della privacy',
    privacyModalTitle: 'Informativa sulla Privacy',
    privacy: {
      subtitle: 'Sudoku non richiede un account e non raccoglie nome, email o recapiti.',
      sec1Title: '1. Nessuna registrazione', sec1Desc: 'Questa app non richiede registrazione e non raccoglie nome, email, numero di telefono, contatti o posizione. Le funzioni online — sfide 1v1 e backup cloud — inviano soltanto un identificatore generato casualmente.',
      sec2Title: '2. Dati locali & cancellazione', sec2Desc: 'I progressi, i suggerimenti e i temi sono salvati in sicurezza solo sul tuo dispositivo.',
      sec3Title: '3. Duelli 1v1 & Indice Mentale', sec3Desc: 'Le sfide 1v1 in tempo reale inviano un identificatore giocatore generato casualmente e registri di completamento. L’identificatore è salvato sul dispositivo e riutilizzato, e non è collegato al tuo nome né a un account.',
      sec4Title: '4. Pubblicità (Google AdMob)', sec4Desc: 'Per mantenere il gioco gratuito, questa app può mostrare annunci tramite lo SDK Google AdMob. Quando la pubblicità è attiva, AdMob può raccogliere un identificatore pubblicitario. La versione attuale non mostra annunci.'
    }
  },
  stats: {
    classicBest: 'Miglior Classico',
    speedrunBest: 'Miglior Cronometro',
    survivalTitle: '⏳ Modalità Sopravvivenza',
    survivalTotalWins: 'Vittorie in Sopravvivenza',
    survivalWinsUnit: '{count} Completati',
    leaderboardTab: 'Classifica',
    summaryTitle: 'Riepilogo Prestazioni',
    totalPlayed: 'Partite Giocate',
    totalWon: 'Partite Vinte',
    winRate: 'Percentuale Vittorie'
  },
  brainReport: {
    totalPlayed: 'Partite Totali',
    totalWon: 'Schemi Risolti',
    winRate: 'Percentuale Vittorie',
    shareText: '[Report QI Sudoku]\nIl mio QI Sudoku: {iq} ({percentile})\nLivello: {tier}\nMettiti alla prova con Sudoku oggi stesso!',
    copiedToast: 'Report di analisi cerebrale copiato negli appunti.',
    focus: 'Concentrazione',
    durability: 'Resistenza',
    accuracy: 'Precisione',
    logic: 'Logica',
    speed: 'Velocità',
    shareCardBtn: '🔗 Condividi',
    overallStats: '📊 Statistiche Cumulative Globali',
    attributesTitle: '🧠 5 Pilastri Cognitivi',
    title: 'Report QI',
    percentilePrefix: 'Top ',
    shareTitle: 'Il Mio Report QI Sudoku',
    tiers: {
      grandMaster: '👑 Gran Maestro',
      grandMasterDesc: 'Top {percentile}% di tutti i giocatori! Ragionamento deduttivo magistrale degno dell’élite top 1%.',
      mensa: '🧠 Livello Mensa',
      mensaDesc: 'Top {percentile}% di tutti i giocatori! Capacità logica e analitica eccezionale.',
      superior: '⚡ Mente Superiore',
      superiorDesc: 'Top {percentile}% di tutti i giocatori! Intuito acuto e brillante risoluzione dei problemi.',
      aboveAverage: '💡 Sopra la Media',
      aboveAverageDesc: 'Top {percentile}% di tutti i giocatori! Pensiero analitico flessibile e stabile.',
      balanced: '🎯 Mente Equilibrata',
      balancedDesc: 'Top {percentile}% di tutti i giocatori! Sviluppo armonioso di tutte le 5 aree cognitive.',
      developing: '🌱 Mente in Sviluppo',
      developingDesc: 'Fase iniziale di allenamento. Il tuo indice cognitivo crescerà a ogni partita!'
    }
  },
  battleLobby: {
    title: 'Duello 1v1 in Tempo Reale',
    cancelBtn: 'Annulla Ricerca',
    searching: 'Ricerca di un degno avversario...',
    autoMatchTitle: 'Partita Rapida',
    autoMatchDesc: 'Matchmaking veloce con giocatori di tutto il mondo',
    mmrBadge: 'Match per abilità · Vittorie: {rate}%',
    findOpponentBtn: 'Cerca Avversario',
    noOpponentFound: 'Nessun avversario trovato. Giocare contro l’IA?',
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
    confirmLeave: 'Vuoi dichiarare forfait e tornare alla home?',
    emptyCellsLeft: 'rimasti'
  },
  aiBattleScreen: {
    selectLevelTitle: 'Difficoltà IA',
    selectLevelDesc: 'Seleziona un avversario IA adatto al tuo livello di abilità.',
    aiSpeed: 'Velocità: {speed}',
    level1Desc: 'Bot Principiante: Risolve con calma per aiutarti a imparare le basi.',
    level2Desc: 'Bot Normale: Risolutore costante con pochissimi errori.',
    level3Desc: 'Bot Esperto: Ritmo veloce utilizzando tattiche intermedie.',
    level4Desc: 'Bot Maestro: Molto veloce nell’applicare strategie avanzate.',
    level5Desc: 'AlphaDoku: IA Gran Maestro con velocità di risoluzione estrema.',
    startBtn: 'Avvia Duello IA Lv.{level} {name}'
  },
  academy: {
    tabs: { stage1: 'Fase 1', stage2: 'Fase 2', stage3: 'Fase 3', stage4: 'Fase 4', stage5: 'Fase 5' },
    stageTitles: {
      stage1: 'Fase 1: Tecniche Base (Singles & Linee)',
      stage2: 'Fase 2: Tecniche Intermedie (Coppie & Intersezioni)',
      stage3: 'Fase 3: Tecniche Avanzate (Famiglia Wing)',
      stage4: 'Fase 4: Tecniche Esperti (Fish, Colorazione & Rettangolo Unico)',
      stage5: 'Fase 5: Tecniche Maestro (Catene AIC, ALS & Exocet)'
    },
    title: 'Accademia Sudoku',
    practiceUi: {
      theory: 'Teoria',
      practice1: 'Esercizio 1',
      practice2: 'Esercizio 2',
      success: 'Corretto [{val}]! Tecnica padroneggiata alla perfezione!',
      retry: 'Riprova',
      error: '[{val}] non è corretto. Ricontrolla i numeri iniziali!',
      prompt: '👇 Tocca il numero corrispondente (?) sul tastierino qui sotto.'
    }
  },
  adBanner: {removeBtn: 'Senza Pubblicità' }
};
