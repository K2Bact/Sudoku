export const screens = {
  game: {
    ghost: {
      ahead: '{time} d’avance',
      behind: '{time} de retard',
      ghostHintNotice: '💡 Indice utilisé – ce temps ne compte pas comme record personnel.'
    }
  },
  home: {
    scoreLabel: 'Logic Score',
    title: 'Sudoku',
    badge: 'PRO',
    hintTooltip: 'Indices',
    brainReportTitle: 'Analyse de jeu',
    brainPercentileShort: 'Grilles terminées : {won}',
    startSelectedLevel: 'Lancer Lv.{level} {name}',
    modeTabs: { classic: 'Classique', timeAttack: 'Contre-la-montre', timeLimit: 'Survie' },
    rivalModes: {
      standard: '🎯 Normal',
      ghost: '👻 Fantôme',
      delta: '⚡ Écart',
      lockedToast: 'Terminez ce niveau au moins 1 fois pour débloquer ce mode.',
      timeLimitToast: "Le Fantôme et l’Écart de temps ne sont pas disponibles en mode Survie.",
      infoAria: "À propos du Fantôme et de l’Écart de temps",
      infoGhost: "Rejoue la grille du record, contre votre propre partie.",
      infoDelta: "Une nouvelle grille, avec l’avance ou le retard sur votre meilleur rythme.",
    },
    modes: {
      classic: { badge: 'CLASSIQUE', title: 'Solo classique', desc: 'Grille de sudoku traditionnelle, calme et immersive', startBtn: 'Nouvelle partie' },
      timeAttack: { badge: 'CONTRE-LA-MONTRE', title: '⚡ Contre-la-montre', desc: 'Battez le chrono pour établir votre meilleur record !', startBtn: 'Lancer le chrono' },
      timeLimit: { badge: 'SURVIE', title: '⏳ Survie', desc: 'Lv.{level}, limite de {minutes} min ! Tenez jusqu’au bout.', startBtn: 'Lancer Survie' },
      daily: { title: 'Défi quotidien', desc: 'Nouvelle grille chaque jour & badges mensuels', badge: 'QUOTIDIEN' },
      battle: { title: 'Duel 1v1 en ligne', desc: 'Match mondial en direct' },
      aiBattle: { badge: 'VS IA', title: 'Duel contre l’IA', desc: 'Course de vitesse 1v1 contre l’IA' },
      academy: { title: 'Académie Sudoku', desc: 'Apprenez 32 techniques de maître' },
      practice: { title: 'Entraînement libre', desc: 'Erreurs illimitées, jeu relaxant' }
    },
    nav: {brain: 'Analyse', stats: 'Statistiques', academy: 'Académie', settings: 'Paramètres' }
  },
  daily: {
    header: 'Défis quotidiens ({month})',
    badgeTitle: 'Maître {month}',
    badgeDesc: '{completed}/{target} · Obj. 15',
    unlockingAd: '📺 Déverrouillage du défi passé...',
    calendarTitle: '📅 Calendrier 365 jours',
    futureAlert: 'Les défis futurs ne sont pas encore débloqués.',
    pastUnlockNotice: '💡 Les jours manqués (🔒) peuvent être débloqués à tout moment en regardant une courte vidéo.',
    unlockModalTitle: 'Débloquer un défi passé',
    unlockModalDesc: 'Le défi du {date} est un défi quotidien passé.\nRegardez une courte pub pour la débloquer et jouer.\nVoulez-vous regarder ?',
    unlockModalConfirmBtn: '📺 Regarder & débloquer',
    unlockModalCancelBtn: 'Annuler',
    missionCardTitle: '🎯 Mission spéciale du jour',
    missionCompleted: 'Mission du jour réussie ! ✅',
    missionStartBtn: 'Lancer la mission 🚀',
    missionReward: '+1 indice & validation',
    tiers: { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Maître' },
    missions: {
      beginnerLv1Title: '[Lv.1 Initiation] 1 sudoku', beginnerLv1Desc: 'Terminez une grille Lv.1 Initiation pour poser vos bases logiques.',
      beginnerLv2Title: '[Lv.2 Facile] Réussir 1 Sudoku', beginnerLv2Desc: 'Terminez une grille Lv.2 Facile pour pratiquer les bases.',
      medLv3Title: '[Lv.3+ Moyen] Réussir 1 Sudoku', medLv3Desc: 'Terminez une grille Lv.3 Moyen ou supérieur pour tester vos déductions.',
      advLv4Title: '[Lv.4+ Difficile] Réussir 1 Sudoku', advLv4Desc: 'Domptez une grille Lv.4 Difficile et prouvez votre maîtrise.',
      advLv5Title: '[Lv.5 Expert] Réussir 1 sudoku', advLv5Desc: 'Terminez la redoutable grille Lv.5 Expert pour atteindre l’élite.',
      battleTitle: 'Jouer 1 Duel 1v1 / IA', battleDesc: 'Participez à 1 duel en ligne en temps réel ou contre l’IA.',
      speedrunTitle: '⚡ Réussir 1 partie en Contre-la-montre', speedrunDesc: 'Complétez un puzzle en mode Contre-la-montre.'
    }
  },
  removeAds: {
    title: 'Supprimer les pubs & Premium',
    heroTitle: 'Profitez d’un sudoku sans distraction',
    heroDesc: 'Supprimez définitivement la bannière inférieure et les publicités interstitielles de fin de partie.',
    benefitsTitle: '👑 Avantages de l’accès Premium',
    benefit1: 'Suppression définitive de toutes les bannières et publicités interstitielles',
    benefit2: 'Concentration maximale et économie de batterie',
    benefit3: 'Soutenez les développeurs indés et les futures mises à jour',
    buyBtn: 'Sans pub à vie ({price})',
    restoreBtn: 'Restaurer les achats',
    alreadyPurchased: 'Vous possédez déjà l’accès Premium ! 🎉',
    processing: '💳 Traitement en cours...',
    purchaseBtn: 'Supprimer les pubs',
    buySuccess: 'Achat effectué avec succès ! Merci !',
    restoreSuccess: 'Achats restaurés avec succès.',
    restoreFail: 'Aucun achat antérieur trouvé à restaurer.',
    buyFail: 'L’achat n’a pas pu être finalisé. Veuillez réessayer plus tard.'
  },
  tutorialOverlay: {
    exitTooltip: 'Quitter le tutoriel',
    step1Title: '🎯 Étape 1 : Choisir une case & entrer un chiffre',
    step1Desc: 'Touchez la case en surbrillance [Ligne 1, Col 3] et tapez [9] sur le pavé !',
    step2Title: '✏️ Étape 2 : Notes au crayon (Candidats)',
    step2Desc: 'Activez [Notes] dans la barre d’outils et notez le candidat [3] pour cette case !',
    step3Title: '🔒 Étape 3 : Mode saisie rapide',
    step3Desc: 'Verrouillez le chiffre [4] et touchez rapidement les cases vides pour les remplir !',
    step4Title: '🎉 Étape 4 : Tutoriel terminé !',
    step4Desc: 'Bravo ! Vous maîtrisez la saisie, les notes et le mode rapide.',
    finishBtn: 'Commencer à jouer',
    nextBtn: 'Étape suivante'
  },
  settings: {
    title: 'Paramètres',
    themeSection: '🎨 Thème visuel',
    languageSection: '🌐 Langue',
    languages: {
      auto: 'Système'
    },
    gameplaySection: '🎮 Règles de jeu',
    limitMistakes: 'Limite de 3 erreurs (Cœurs)',
    limitMistakesDesc: "Fin de partie après 3 erreurs. Désactivé : les meilleurs temps ne sont pas enregistrés",
    autoCheck: 'Détection des erreurs',
    autoCheckDesc: 'Surligne immédiatement les chiffres incorrects en rouge',
    soundSection: '🔊 Audio & vibrations',
    soundFx: 'Effets sonores',
    soundFxDesc: 'Sons de saisie et d’appui sur les boutons',
    hapticFx: 'Retour haptique',
    hapticFxDesc: 'Vibration lors des saisies correctes et incorrectes',
    adPrivacyBtn: 'Confidentialité des publicités',
    adPrivacyDesc: 'Modifier votre choix sur les publicités personnalisées',
    resetData: 'Réinitialiser les données',
    resetDataDesc: 'Effacer toutes les statistiques et l’historique local',
    resetConfirm: '⚠️ Attention : Tout l’historique, les indices et les données d’analyse de jeu seront définitivement supprimés. Continuer ?',
    resetSuccess: 'Les données ont été réinitialisées avec succès.',
    privacySection: '🛡️ Confidentialité & sécurité',
    privacyPolicyBtn: 'Politique de confidentialité',
    privacySubtitle: 'Protection de la vie privée',
    privacyModalTitle: 'Politique de confidentialité',
    privacy: {
      subtitle: 'Sudoku ne nécessite aucun compte. Voici ce que l\'application stocke et envoie réellement.',
      sec1Title: '1. Stockage et sauvegarde', sec1Desc: "Vos records, indices et réglages sont stockés sur votre appareil. Sans connexion à Play Jeux, ils restent uniquement sur cet appareil. Nous ne collectons jamais votre nom, e-mail, numéro de téléphone, contacts ou position.",
      sec2Title: '2. Google Play Jeux', sec2Desc: 'Tant que vous êtes connecté à Play Jeux, chaque victoire sauvegarde automatiquement votre progression (statistiques, succès, indices, réglages) dans les données de jeu de Play Jeux et envoie votre Logic Score à un classement Play Jeux. Ces données restent dans votre propre compte Google.',
      sec3Title: '3. Duels 1v1', sec3Desc: 'Les duels 1v1 en temps réel utilisent Google Firebase pour envoyer à votre adversaire un identifiant de joueur généré aléatoirement, un pseudo automatique (Player_xxxx) et votre progression. L\'identifiant est stocké sur votre appareil et réutilisé ; il n\'est lié ni à votre nom ni à aucun compte.',
      sec4Title: '4. Publicités et achats', sec4Desc: 'L\'application affiche des publicités via Google AdMob : une bannière, une publicité plein écran après une victoire et des vidéos récompensées facultatives. AdMob peut traiter votre identifiant publicitaire. L\'achat « Supprimer les pubs » est géré par Google Play ; nous ne recevons jamais vos données de paiement.'
    }
  },
  stats: {
    classicBest: 'Meilleur classique',
    speedrunBest: 'Meilleur chrono',
    survivalTitle: '⏳ Mode survie',
    survivalTotalWins: 'Victoires en survie',
    survivalWinsUnit: '{count} victoire(s)',
    summaryTitle: 'Résumé des performances',
    pvpRating: "Classement",
    pvpRecordLabel: "Bilan",
    pvpRecord: "{wins}V · {losses}D",
    totalPlayed: 'Parties jouées',
    totalWon: 'Parties gagnées',
    winRate: 'Taux de victoire'
  },
  brainReport: {
    scoreLabel: 'Logic Score',
    scoreHowTitle: "ⓘ Comment le Logic Score est-il calculé ?",
    scoreHowBody: "Il augmente quand vous remplissez toute la grille et gagnez. Le niveau le plus difficile réussi sans indice compte le plus ; le nombre de victoires et le taux de victoire comptent un peu. Les duels 1v1 et contre l’IA ne comptent ni dans les victoires ni dans le taux de victoire : ils ont leur propre bilan dans Statistiques. Perdre ou abandonner une partie fait baisser le taux de victoire et peut retirer quelques points. Le classement utilise ce score quand vous êtes connecté à Play Jeux.",
    shareText: '[Analyse de jeu Sudoku]\nLogic Score : {iq}\nRang : {tier}\nEssayez Sudoku dès aujourd’hui !',
    copiedToast: 'Analyse copiée dans le presse-papiers.',
    focus: 'Sans faute',
    durability: 'Assiduité',
    accuracy: 'Taux de réussite',
    logic: 'Difficulté',
    speed: 'Vitesse',
    shareCardBtn: '🔗 Partager l’analyse',
    attributesTitle: '📈 5 indicateurs de jeu',
    title: 'Analyse de jeu',
    shareTitle: 'Mon analyse de jeu Sudoku',
    tiers: {
      grandMaster: '👑 Grand maître',
      grandMasterDesc: 'Vous avez atteint le rang le plus élevé.',
      expert: '🧠 Expert',
      expertDesc: 'Vous résolvez régulièrement des grilles difficiles.',
      superior: '⚡ Avancé',
      superiorDesc: 'Vous êtes prêt pour des grilles avancées.',
      aboveAverage: '💡 Intermédiaire',
      aboveAverageDesc: 'Vous progressez régulièrement.',
      balanced: '🎯 Équilibré',
      balancedDesc: 'Vos 5 indicateurs progressent de façon équilibrée.',
      developing: '🌱 Débutant',
      developingDesc: 'Continuez à jouer et votre score montera.'
    }
  },
  battleLobby: {
    title: 'Duel 1v1 en temps réel',
    cancelBtn: 'Annuler le match',
    searching: 'Recherche d’un adversaire...',
    autoMatchTitle: 'Match rapide',
    autoMatchDesc: 'Appariement rapide avec des joueurs du monde entier',
    mmrBadge: 'Votre taux de réussite : {rate}%',
    findOpponentBtn: 'Chercher un duel',
    noOpponentFound: 'Aucun adversaire trouvé. Jouer contre l’IA ?',
    connectFailed: "Connexion au jeu en ligne impossible. Réessayez plus tard. Jouer contre l’IA ?",
    playAiInstead: 'Affronter l’IA'
  },
  battleResult: {
    victoryTitle: 'Victoire en duel 1v1 !',
    defeatTitle: 'Défaite en duel 1v1',
    aiVictoryTitle: 'Victoire contre l’IA !',
    aiDefeatTitle: 'Défaite contre l’IA',
    victoryDesc: 'Vous avez complété la grille en premier et battu {opponent} !',
    victoryMistakeDesc: '{opponent} est hors course après 3 erreurs. Vous gagnez !',
    defeatDesc: '{opponent} a complété la grille en premier.',
    defeatMistakeDesc: 'Vous êtes hors course après 3 erreurs.',
    disqualified: '💀 Hors course',
    finalProgress: 'Progression finale',
    ratingChange: 'Évolution du classement MMR 1v1',
    aiModeLabel: 'Match d’entraînement IA (Lv.{level})',
    aiWonBadge: 'Entraînement gagné',
    aiLostBadge: 'Entraînement terminé',
    you: 'Vous',
    opponent: 'Adversaire',
    lobbyBtn: 'Salon de duel',
    aiLobbyBtn: 'Menu duel IA',
    rematchBtn: 'Revanche',
    aiRematchBtn: 'Rejouer',
    rematchWaitingBtn: 'En attente... ({seconds}s)',
    rematchAcceptedToast: '🎉 Revanche acceptée ! Nouvelle partie.',
    rematchRejectedToast: 'L’adversaire a refusé la revanche.',
    rematchOpponentLeftToast: 'L’adversaire a quitté la salle.',
    homeBtn: 'Accueil'
  },
  rematchToast: {
    title: '{opponent} demande une revanche !',
    countdown: '{seconds}s',
    acceptBtn: 'Accepter',
    declineBtn: 'Refuser'
  },
  battleHeader: {
    aiTag: 'IA',
    confirmLeave: 'Voulez-vous déclarer forfait et retourner à l’accueil ?',
    emptyCellsLeft: 'restantes'
  },
  aiBattleScreen: {
    selectLevelTitle: 'Choisir le niveau de l’IA',
    selectLevelDesc: 'Sélectionnez un adversaire IA adapté à votre niveau de jeu.',
    aiSpeed: 'Vitesse : {speed}',
    level1Desc: 'Robot débutant : résout lentement pour vous aider à maîtriser les bases.',
    level2Desc: 'Robot normal : résout à un rythme régulier avec très peu d’erreurs.',
    level3Desc: 'Robot confirmé : rythme rapide, peu d’erreurs.',
    level4Desc: 'Robot expert : très rapide, erreurs rares.',
    level5Desc: 'Robot grand maître : le robot le plus rapide, avec le moins d’erreurs.',
    startBtn: 'Duel Lv.{level} {name}'
  },
  academy: {
    tabs: { stage1: 'Étape 1', stage2: 'Étape 2', stage3: 'Étape 3', stage4: 'Étape 4', stage5: 'Étape 5' },
    stageTitles: {
      stage1: 'Étape 1 : techniques de base (Singles & lignes)',
      stage2: 'Étape 2 : techniques intermédiaires (paires & intersections)',
      stage3: 'Étape 3 : techniques avancées (famille Wing)',
      stage4: 'Étape 4 : techniques de maître (Fish, coloriage & rectangle unique)',
      stage5: 'Étape 5 : techniques de grand maître (AIC, ALS & Exocet)'
    },
    title: 'Académie Sudoku',
    theoryBoard: {
      patternTab: 'Motif',
      resultTab: 'Résultat',
      patternCaption: 'Les cases colorées forment le motif de cette technique. C\'est la même grille que l\'exemple pratique 1.',
      resultCaption: 'Les candidats marqués en rouge sont retirés par ce motif.',
      placeCaption: 'Ce motif fixe le chiffre mis en évidence comme réponse de cette case.'
    },
    practiceUi: {
      theory: 'Théorie',
      practice1: 'Exercice 1',
      practice2: 'Exercice 2',
      success: 'Correct [{val}] ! Technique maîtrisée avec brio !',
      retry: 'Réessayer',
      error: '[{val}] est incorrect. Réexaminez les chiffres de départ !',
      prompt: '👇 Touchez le chiffre cible (?) sur le pavé numérique ci-dessous.',
      promptEliminated: '👇 Touchez le candidat qui est retiré de la case cible.'
    }
  },
  adBanner: {removeBtn: 'Sans pub' }
};
