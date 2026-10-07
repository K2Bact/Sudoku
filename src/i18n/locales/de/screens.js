export const screens = {
  game: {
    ghost: {
      ahead: '{time} Vorsprung',
      behind: '{time} Rückstand',
      ghostHintNotice: '💡 Tipp genutzt – diese Zeit zählt nicht als persönliche Bestzeit.'
    }
  },
  home: {
    scoreLabel: 'Logic Score',
    title: 'Sudoku',
    badge: 'PRO',
    hintTooltip: 'Tipps',
    brainReportTitle: 'Spielanalyse',
    brainPercentileShort: 'Gelöste Rätsel: {won}',
    startSelectedLevel: 'Lv.{level} {name} starten',
    modeTabs: { classic: 'Klassik', timeAttack: 'Zeitrennen', timeLimit: 'Überleben' },
    rivalModes: {
      standard: '🎯 Normal',
      ghost: '👻 Geist',
      delta: '⚡ Zeitdiff.',
      lockedToast: 'Schließe diesen Schwierigkeitsgrad mindestens 1 Mal ab, um ihn freizuschalten.',
      timeLimitToast: "Geist und Zeitabstand sind im Überlebensmodus nicht verfügbar.",
      infoAria: "Über Geist und Zeitabstand",
      infoGhost: "Spielt das Rätsel erneut, auf dem der Rekord entstand — gegen den eigenen Lauf.",
      infoDelta: "Ein neues Rätsel. Du siehst, wie weit du vor oder hinter dem Tempo deiner persönlichen Bestzeit liegst.",
    },
    modes: {
      classic: { badge: 'KLASSISCH', title: 'Klassisches Einzelspiel', desc: 'Ruhiges und fokussiertes traditionelles Sudoku-Rätsel', startBtn: 'Neues Spiel' },
      timeAttack: { badge: 'ZEITRENNEN', title: '⚡ Zeitrennen', desc: 'Kämpfe gegen die Uhr um die schnellste Bestzeit!', startBtn: 'Zeitrennen starten' },
      timeLimit: { badge: 'ÜBERLEBEN', title: '⏳ Überleben', desc: 'Lv.{level} mit {minutes} Min. Limit! Überlebe bis zum Schluss.', startBtn: 'Überleben starten' },
      daily: { title: 'Tages-Challenge', desc: 'Jeden Tag ein neues Rätsel & Monatsabzeichen', badge: 'TÄGLICH' },
      battle: { title: '1v1 Online-Duell', desc: 'Echtzeit-Match weltweit' },
      aiBattle: { badge: 'GEGEN KI', title: 'KI-Bot-Duell', desc: '1:1 Zeitrennen gegen KI' },
      academy: { title: 'Sudoku-Akademie', desc: '32 Meistertechniken Schritt für Schritt lernen' },
      practice: { title: 'Freies Training', desc: 'Unbegrenzte Fehler, entspanntes Spielen' }
    },
    nav: {brain: 'Analyse', stats: 'Statistik', academy: 'Akademie', settings: 'Einstellungen' }
  },
  daily: {
    header: 'Tägliche Herausforderungen ({month})',
    badgeTitle: 'Meister im {month}',
    badgeDesc: '{completed} / {target} gelöst (Ziel: 15+)',
    unlockingAd: '📺 Altes Rätsel wird freigeschaltet...',
    calendarTitle: '📅 365-Tage-Kalender',
    futureAlert: 'Zukünftige Rätsel sind noch nicht freigeschaltet.',
    pastUnlockNotice: '💡 Einen Tag verpasst (🔒)? Schalte ihn jederzeit mit einem kurzen Werbevideo frei.',
    unlockModalTitle: 'Vergangenes Rätsel freischalten',
    unlockModalDesc: 'Das Rätsel vom {date} ist eine vergangene Challenge.\nKurze Werbung ansehen, um sofort freizuschalten.\nWerbung ansehen?',
    unlockModalConfirmBtn: '📺 Ansehen & freischalten',
    unlockModalCancelBtn: 'Abbrechen',
    missionCardTitle: '🎯 Heutige Mission',
    missionCompleted: 'Heutige Mission abgeschlossen! ✅',
    missionStartBtn: 'Mission starten 🚀',
    missionReward: '+1 Tipp & Eintrag',
    tiers: { beginner: 'Anfänger', intermediate: 'Fortgeschritten', advanced: 'Meister' },
    missions: {
      beginnerLv1Title: '[Lv.1 Einführung] 1 Sudoku lösen', beginnerLv1Desc: 'Löse ein Rätsel der Stufe Lv.1 Einführung für logische Grundlagen.',
      beginnerLv2Title: '[Lv.2 Einfach] 1 Sudoku lösen', beginnerLv2Desc: 'Löse ein Rätsel der Stufe Lv.2 Einfach zur Vertiefung der Basistechniken.',
      medLv3Title: '[Lv.3+ Mittel] 1 Sudoku lösen', medLv3Desc: 'Löse ein Lv.3 Mittel oder höheres Rätsel für echte Deduktion.',
      advLv4Title: '[Lv.4+ Schwer] 1 Sudoku lösen', advLv4Desc: 'Löse ein Rätsel auf Lv.4 Schwer oder höher.',
      advLv5Title: '[Lv.5 Experte] 1 Sudoku lösen', advLv5Desc: 'Löse ein Rätsel der höchsten Stufe Lv.5 Experte.',
      battleTitle: 'Ein Online-1v1-Duell oder KI-Duell spielen', battleDesc: 'Spiele ein Online-1v1-Duell oder ein Match gegen die KI.',
      speedrunTitle: '⚡ 1 Rätsel im Zeitrennen-Modus lösen', speedrunDesc: 'Löse ein Rätsel im Zeitrennen-Modus.'
    }
  },
  removeAds: {
    title: 'Werbung entfernen & Premium',
    heroTitle: 'Reines Sudoku-Erlebnis genießen',
    heroDesc: 'Entferne dauerhaft die untere Banner- und die Zwischenwerbung nach dem Spiel.',
    benefitsTitle: '👑 Vorteile des Premium-Zugangs',
    benefit1: 'Alle Banner und Werbeunterbrechungen dauerhaft entfernen',
    benefit2: 'Konzentriere dich ganz auf das Rätsel',
    benefit3: 'Unterstütze Indie-Entwickler und zukünftige Updates',
    buyBtn: 'Werbefrei ({price})',
    restoreBtn: 'Wiederherstellen',
    alreadyPurchased: 'Du besitzt den Premium-Zugang bereits! 🎉',
    processing: '💳 Wird verarbeitet...',
    purchaseBtn: 'Werbung entfernen',
    buySuccess: 'Kauf erfolgreich abgeschlossen! Vielen Dank.',
    restoreSuccess: 'Käufe erfolgreich wiederhergestellt.',
    restoreFail: 'Keine früheren Käufe zur Wiederherstellung gefunden.',
    buyFail: 'Der Kauf konnte nicht abgeschlossen werden. Bitte versuche es später erneut.'
  },
  tutorialOverlay: {
    exitTooltip: 'Tutorial beenden',
    step1Title: '🎯 Schritt 1: Feld wählen & Zahl eingeben',
    step1Desc: 'Tippe auf das hervorgehobene Feld [Zeile 1, Spalte 3] und gib [9] ein!',
    step2Title: '✏️ Schritt 2: Bleistift-Notizen (Kandidaten)',
    step2Desc: 'Aktiviere [Notizen] in der Leiste und notiere den Kandidaten [3] in diesem Feld!',
    step3Title: '🔒 Schritt 3: Schnellmodus (Zahl-Zuerst)',
    step3Desc: 'Fixiere Zahl [4] und tippe zügig auf leere Felder!',
    step4Title: '🎉 Schritt 4: Tutorial abgeschlossen!',
    step4Desc: 'Glückwunsch! Du beherrschst Eingabe, Notizen und Schnellmodus perfekt.',
    finishBtn: "Los geht's",
    nextBtn: 'Nächster Schritt'
  },
  settings: {
    title: 'Einstellungen',
    themeSection: '🎨 Erscheinungsbild',
    languageSection: '🌐 Sprache',
    languages: {
      auto: 'System'
    },
    gameplaySection: '🎮 Spielregeln',
    limitMistakes: 'Fehlerlimit (3 Herzen)',
    limitMistakesDesc: "Spiel vorbei bei 3 Fehlern. Aus: Bestzeiten werden nicht gespeichert",
    autoCheck: 'Fehler automatisch prüfen',
    autoCheckDesc: 'Falsche Zahlen sofort rot hervorheben',
    soundSection: '🔊 Audio & Feedback',
    soundFx: 'Soundeffekte',
    soundFxDesc: 'Töne bei Zahleneingabe und Schaltflächen',
    hapticFx: 'Haptisches Feedback',
    hapticFxDesc: 'Vibrieren bei richtigen und falschen Eingaben',
    adPrivacyBtn: 'Datenschutz für Werbung',
    adPrivacyDesc: 'Einwilligung zu personalisierter Werbung ändern',
    resetData: 'Alle lokalen Daten zurücksetzen',
    resetDataDesc: 'Alle Spielstatistiken und lokalen Verlauf löschen',
    resetConfirm: '⚠️ Warnung: Alle Spielhistorien, Tipps und Daten der Spielanalyse werden unwiderruflich gelöscht. Fortfahren?',
    resetSuccess: 'Daten wurden erfolgreich zurückgesetzt.',
    privacySection: '🛡️ Datenschutz & Sicherheit',
    privacyPolicyBtn: 'Datenschutz',
    privacySubtitle: 'Datenschutz',
    privacyModalTitle: 'Datenschutzerklärung',
    privacy: {
      subtitle: 'Sudoku benötigt kein Konto. Hier steht, was die App tatsächlich speichert und sendet.',
      sec1Title: '1. Speicherung und Sicherung', sec1Desc: "Deine Ergebnisse, Tipps und Einstellungen werden auf deinem Gerät gespeichert. Ohne Anmeldung bei Play Spiele bleiben sie nur auf diesem Gerät. Name, E-Mail, Telefonnummer, Kontakte und Standort werden nie erfasst.",
      sec2Title: '2. Google Play Spiele', sec2Desc: 'Solange du bei Play Spiele angemeldet bist, wird nach jedem Sieg dein Fortschritt (Statistiken, Erfolge, Tipps, Einstellungen) automatisch in den gespeicherten Play-Spiele-Daten gesichert und dein Logic Score an eine Play-Spiele-Bestenliste übermittelt. Diese Daten liegen in deinem eigenen Google-Konto.',
      sec3Title: '3. 1v1-Duelle', sec3Desc: 'Echtzeit-1v1-Duelle senden über Google Firebase eine zufällig erzeugte Spieler-ID, einen automatischen Spitznamen (Player_xxxx) und deinen Rätselfortschritt an den Gegner. Die ID wird auf deinem Gerät gespeichert und wiederverwendet; sie ist weder mit deinem Namen noch mit einem Konto verknüpft. Haben beide Spieler „Züge teilen“ eingeschaltet, werden nach der Partie außerdem die Züge dieser Partie samt Zeitpunkt für den Rückblick an den Gegner gesendet (standardmäßig an, in den Einstellungen abschaltbar).',
      sec4Title: '4. Werbung und Käufe', sec4Desc: 'Die App zeigt Werbung über Google AdMob: ein Banner, eine Vollbildanzeige nach einem Sieg und freiwillige Videos mit Belohnung. AdMob kann deine Werbe-ID verarbeiten. Der Kauf „Werbung entfernen“ wird von Google Play abgewickelt; wir erhalten keine Zahlungsdaten.'
    }
  },
  stats: {
    classicBest: 'Klassik-Bestzeit',
    speedrunBest: 'Zeitrennen-Bestzeit',
    survivalTitle: '⏳ Überleben (Zeitlimit)',
    survivalTotalWins: 'Überlebens-Erfolge',
    survivalWinsUnit: '{count} geschafft',
    summaryTitle: 'Leistungsübersicht',
    pvpRating: "Wertung",
    pvpRecordLabel: "Bilanz",
    pvpRecord: "{wins}S · {losses}N",
    totalPlayed: 'Gespielte Spiele',
    totalWon: 'Gewonnene Spiele',
    winRate: 'Gewinnrate'
  },
  brainReport: {
    scoreLabel: 'Logic Score',
    scoreHowTitle: "ⓘ Wie wird der Logic Score bestimmt?",
    scoreHowBody: "Er steigt, wenn du das ganze Brett füllst und gewinnst. Standard- und Killer-Spiele zählen beide. Am meisten zählt die schwierigste Stufe, die du ohne Tipps geschafft hast; Anzahl der Siege und Siegquote zählen ein wenig. 1v1- und KI-Duelle zählen nicht zu Siegen und Siegquote – sie haben eine eigene Bilanz in der Statistik. Game Over und abgebrochene Spiele senken die Siegquote und können ein paar Punkte kosten. Die Rangliste nutzt diesen Wert, wenn du bei Play Spiele angemeldet bist.",
    shareText: '[Sudoku-Spielanalyse]\nLogic Score: {iq}\nRang: {tier}\nProbier Sudoku jetzt aus!',
    copiedToast: 'Spielanalyse in die Zwischenablage kopiert.',
    focus: 'Fehlerfrei',
    durability: 'Ausdauer',
    accuracy: 'Lösungsquote',
    logic: 'Schwierigkeit',
    speed: 'Tempo',
    shareCardBtn: '🔗 Bericht teilen',
    attributesTitle: '📈 5 Spielwerte',
    title: 'Spielanalyse',
    shareTitle: 'Meine Sudoku-Spielanalyse',
    tiers: {
      grandMaster: '👑 Großmeister',
      grandMasterDesc: 'Du hast den höchsten Rang erreicht.',
      expert: '🧠 Experte',
      expertDesc: 'Du löst schwere Rätsel zuverlässig.',
      superior: '⚡ Fortgeschritten',
      superiorDesc: 'Du bist bereit für fortgeschrittene Rätsel.',
      aboveAverage: '💡 Mittelstufe',
      aboveAverageDesc: 'Du wirst stetig besser.',
      balanced: '🎯 Ausgewogen',
      balancedDesc: 'Deine 5 Spielwerte wachsen gleichmäßig.',
      developing: '🌱 Einsteiger',
      developingDesc: 'Spiel weiter, dann steigt dein Wert.'
    }
  },
  battleLobby: {
    title: '1v1 Echtzeit-Duell',
    cancelBtn: 'Match abbrechen',
    searching: 'Suche nach einem Gegner...',
    autoMatchTitle: 'Schnellduell',
    autoMatchDesc: 'Schnelles Matchmaking mit weltweiten Spielern',
    mmrBadge: 'Deine Lösungsquote: {rate}%',
    findOpponentBtn: 'Gegner suchen',
    noOpponentFound: 'Kein Gegner gefunden.',
    searchAgain: 'Erneut suchen',
    connectFailed: "Keine Verbindung zum Online-Spiel. Versuch es später noch einmal. Stattdessen gegen die KI spielen?",
    playAiInstead: 'Gegen die KI'
  },
  battleResult: {
    victoryTitle: '1v1 Duell-Sieg!',
    defeatTitle: '1v1 Duell-Niederlage',
    aiVictoryTitle: 'KI-Duell-Sieg!',
    aiDefeatTitle: 'KI-Duell-Niederlage',
    victoryDesc: 'Du hast das Rätsel zuerst gelöst und {opponent} besiegt!',
    victoryMistakeDesc: '{opponent} wurde wegen 3 Fehlern disqualifiziert. Du gewinnst!',
    defeatDesc: '{opponent} hat das Rätsel zuerst gelöst.',
    defeatMistakeDesc: 'Du wurdest wegen 3 Fehlern disqualifiziert.',
    disqualified: '💀 Raus',
    finalProgress: 'Endstand',
    ratingChange: '1v1 MMR-Wertungsänderung',
    aiModeLabel: 'KI-Bot-Übungsmatch (Lv.{level})',
    aiWonBadge: 'Übung gewonnen',
    aiLostBadge: 'Übung beendet',
    you: 'Du',
    opponent: 'Gegner',
    lobbyBtn: 'Duell-Lobby',
    aiLobbyBtn: 'KI-Duell-Menü',
    rematchBtn: 'Revanche',
    aiRematchBtn: 'Erneut spielen',
    rematchWaitingBtn: 'Warte... ({seconds}s)',
    rematchAcceptedToast: '🎉 Revanche angenommen! Neues Spiel startet.',
    rematchRejectedToast: 'Gegner hat die Revanche abgelehnt.',
    rematchOpponentLeftToast: 'Gegner hat den Raum verlassen.',
    homeBtn: 'Startseite'
  },
  rematchToast: {
    title: '{opponent} fordert eine Revanche!',
    countdown: '{seconds}s',
    acceptBtn: 'Annehmen',
    declineBtn: 'Ablehnen'
  },
  battleHeader: {
    aiTag: 'KI',
    confirmLeave: 'Möchtest du aufgeben und zum Hauptmenü zurückkehren?',
    emptyCellsLeft: 'übrig'
  },
  aiBattleScreen: {
    selectLevelTitle: 'KI-Schwierigkeit wählen',
    selectLevelDesc: 'Wähle einen KI-Gegner passend zu deinem Können.',
    aiSpeed: 'Geschwindigkeit: {speed}',
    level1Desc: 'Anfänger-Bot: Löst gemächlich, um dir die Grundlagen beizubringen.',
    level2Desc: 'Normal-Bot: Löst zuverlässig mit wenigen Fehlern.',
    level3Desc: 'Fortgeschritten-Bot: Flottes Tempo, wenige Fehler.',
    level4Desc: 'Experten-Bot: Sehr schnell, selten Fehler.',
    level5Desc: 'Großmeister-Bot: Der schnellste Bot mit den wenigsten Fehlern.',
    startBtn: 'KI-Duell Lv.{level} {name} starten'
  },
  academy: {
    tabs: { stage1: 'Stufe 1', stage2: 'Stufe 2', stage3: 'Stufe 3', stage4: 'Stufe 4', stage5: 'Stufe 5' },
    stageTitles: {
      stage1: 'Stufe 1: Grundtechniken (Singles & Linien)',
      stage2: 'Stufe 2: Mittlere Techniken (Paare & Schnittmengen)',
      stage3: 'Stufe 3: Fortgeschrittene Techniken (Wing-Familie)',
      stage4: 'Stufe 4: Meister-Techniken (Fish, Coloring & Unique Rectangle)',
      stage5: 'Stufe 5: Großmeister-Techniken (AIC, ALS & Exocet)'
    },
    title: 'Sudoku-Akademie',
    theoryBoard: {
      patternTab: 'Muster',
      resultTab: 'Ergebnis',
      patternCaption: 'Die farbigen Felder bilden das Muster dieser Technik. Es ist dasselbe Gitter wie im Praxisbeispiel 1.',
      resultCaption: 'Die rot markierten Kandidaten streicht dieses Muster.',
      placeCaption: 'Dieses Muster legt die hervorgehobene Ziffer als Lösung des Feldes fest.'
    },
    practiceUi: {
      theory: 'Theorie',
      practice1: 'Übung 1',
      practice2: 'Übung 2',
      success: 'Richtig [{val}]! Technik perfekt gemeistert!',
      retry: 'Erneut versuchen',
      error: '[{val}] ist nicht korrekt. Überprüfe die vorgegebenen Zahlen!',
      prompt: '👇 Tippe die gesuchte Zahl (?) auf dem Tastenfeld unten ein.',
      promptEliminated: '👇 Tippe den Kandidaten an, der aus dem Zielfeld gestrichen wird.'
    }
  },
  adBanner: {removeBtn: 'Werbung entfernen' }
};
