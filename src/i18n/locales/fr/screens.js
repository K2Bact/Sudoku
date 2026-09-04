export const screens = {
  game: {
    ghost: {
      ahead: '{time} d’avance',
      behind: '{time} de retard',
      ghostHintNotice: '💡 L’utilisation d’un indice exclut la mise à jour du record PB.'
    }
  },
  home: {
    title: 'Sudoku',
    badge: 'PRO',
    hintTooltip: 'Indices',
    brainReportTitle: 'Analyse cérébrale',
    brainPercentileShort: 'Top {percentile}% · {won} victoire(s)',
    startSelectedLevel: 'Lancer Lv.{level} {name}',
    modeTabs: { classic: 'Classique', timeAttack: 'Contre-la-montre', timeLimit: 'Survie' },
    rivalModes: {
      standard: '🎯 Normal',
      ghost: '👻 Fantôme',
      delta: '⚡ Écart',
      lockedToast: 'Terminez ce niveau au moins 1 fois pour débloquer ce mode.'
    },
    modes: {
      classic: { badge: 'CLASSIQUE', title: 'Solo classique', desc: 'Grille de sudoku traditionnelle, calme et immersive', startBtn: 'Nouvelle partie' },
      timeAttack: { badge: 'CHRONO', title: '⚡ Contre-la-montre', desc: 'Battez le chrono pour établir votre meilleur record !', startBtn: 'Lancer le chrono' },
      timeLimit: { badge: 'SURVIE', title: '⏳ Survie', desc: 'Lv.{level}, limite de {minutes} min ! Tenez jusqu’au bout.', startBtn: 'Lancer Survie' },
      daily: { title: 'Défi quotidien', desc: 'Nouvelle grille chaque jour & badges mensuels', badge: 'NOUVEAU' },
      battle: { title: 'Duel 1v1 en ligne', desc: 'Match mondial en direct' },
      aiBattle: { title: 'Duel contre l’IA', desc: 'Course de vitesse 1v1 contre l’IA' },
      academy: { title: 'Académie Sudoku', desc: 'Apprenez 32 techniques de maître' },
      practice: { title: 'Entraînement libre', desc: 'Erreurs illimitées, jeu relaxant' }
    },
    nav: {brain: 'QI cérébral', stats: 'Statistiques', academy: 'Académie', settings: 'Paramètres' }
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
      beginnerLv1Title: '[Lv.1 Très facile] 1 sudoku', beginnerLv1Desc: 'Terminez une grille Lv.1 Très Facile pour poser vos bases logiques.',
      beginnerLv2Title: '[Lv.2 Facile] Réussir 1 Sudoku', beginnerLv2Desc: 'Terminez une grille Lv.2 Facile pour pratiquer les bases.',
      medLv3Title: '[Lv.3+ Moyen] Réussir 1 Sudoku', medLv3Desc: 'Terminez une grille Lv.3 Moyen ou supérieur pour tester vos déductions.',
      advLv4Title: '[Lv.4+ Difficile] Réussir 1 Sudoku', advLv4Desc: 'Domptez une grille Lv.4 Difficile et prouvez votre maîtrise.',
      advLv5Title: '[Lv.5 Maître] Réussir 1 sudoku', advLv5Desc: 'Terminez la redoutable grille Lv.5 Maître pour atteindre l’élite.',
      battleTitle: 'Jouer 1 Duel 1v1 / IA', battleDesc: 'Participez à 1 duel en ligne en temps réel ou contre l’IA.',
      speedrunTitle: '⚡ Réussir 1 partie chrono', speedrunDesc: 'Complétez un puzzle en mode Contre-la-montre avec accélération de combo.'
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
    restoreFail: 'Aucun achat antérieur trouvé à restaurer.'
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
    limitMistakesDesc: 'Fin de partie après 3 erreurs',
    autoCheck: 'Détection des erreurs',
    autoCheckDesc: 'Surligne immédiatement les chiffres incorrects en rouge',
    soundSection: '🔊 Audio & vibrations',
    soundFx: 'Effets sonores',
    soundFxDesc: 'Sons de saisie et d’appui sur les boutons',
    hapticFx: 'Retour haptique',
    hapticFxDesc: 'Vibration lors des saisies correctes et incorrectes',
    resetData: 'Réinitialiser les données',
    resetDataDesc: 'Effacer toutes les statistiques et l’historique local',
    resetConfirm: '⚠️ Attention : Tout l’historique, les indices et les statistiques cérébrales seront définitivement supprimés. Continuer ?',
    resetSuccess: 'Les données ont été réinitialisées avec succès.',
    privacySection: '🛡️ Confidentialité & sécurité',
    privacyPolicyBtn: 'Politique de confidentialité',
    privacySubtitle: 'Protection de la vie privée',
    privacyModalTitle: 'Politique de confidentialité',
    privacy: {
      subtitle: 'Sudoku ne nécessite aucun compte et ne collecte ni nom, ni e-mail, ni coordonnées.',
      sec1Title: '1. Aucune inscription requise', sec1Desc: 'Cette application ne nécessite aucune inscription et ne collecte ni votre nom, ni votre e-mail, ni votre numéro de téléphone, ni vos contacts, ni votre position. Les fonctions en ligne — duels 1c1 et sauvegarde cloud — transmettent uniquement un identifiant généré aléatoirement.',
      sec2Title: '2. Stockage local & droits de suppression', sec2Desc: 'Progression, indices et thèmes sont stockés en sécurité uniquement sur votre appareil.',
      sec3Title: '3. Duels 1v1 & indice cérébral', sec3Desc: 'Les duels 1c1 en temps réel transmettent un identifiant de joueur généré aléatoirement, conservé sur votre appareil et réutilisé, ainsi que votre progression. Il n’est lié ni à votre nom ni à un compte.',
      sec4Title: '4. Publicité (Google AdMob)', sec4Desc: 'Pour garder le jeu gratuit, cette application peut afficher des publicités via le SDK Google AdMob. Lorsque la publicité est active, AdMob peut collecter un identifiant publicitaire. Les versions de test affichent un emplacement signalé, sans publicité réelle.'
    }
  },
  stats: {
    classicBest: 'Meilleur classique',
    speedrunBest: 'Meilleur chrono',
    survivalTitle: '⏳ Mode survie',
    survivalTotalWins: 'Victoires en survie',
    survivalWinsUnit: '{count} victoire(s)',
    leaderboardTab: 'Classement',
    summaryTitle: 'Résumé des performances',
    totalPlayed: 'Parties jouées',
    totalWon: 'Parties gagnées',
    winRate: 'Taux de victoire'
  },
  brainReport: {
    totalPlayed: 'Parties jouées',
    totalWon: 'Grilles résolues',
    winRate: 'Taux de victoire',
    shareText: '[Rapport QI Sudoku]\nMon QI Sudoku : {iq} ({percentile})\nRang : {tier}\nRelevez le défi cérébral avec Sudoku aujourd’hui !',
    copiedToast: 'Rapport d’analyse cérébrale copié dans le presse-papiers.',
    focus: 'Concentration profonde',
    durability: 'Endurance mentale',
    accuracy: 'Précision',
    logic: 'Déduction logique',
    speed: 'Vitesse de traitement',
    shareCardBtn: '🔗 Partager l’analyse',
    overallStats: '📊 Statistiques cumulées globales',
    attributesTitle: '🧠 5 piliers cognitifs',
    title: 'Rapport de QI cérébral',
    percentilePrefix: 'Top ',
    shareTitle: 'Mon rapport de QI Sudoku',
    tiers: {
      grandMaster: '👑 Grand Maître',
      grandMasterDesc: 'Top {percentile}% de tous les joueurs ! Déduction magistrale digne du top 1%.',
      mensa: '🧠 Niveau Mensa',
      mensaDesc: 'Top {percentile}% de tous les joueurs ! Esprit logique et analytique d’exception.',
      superior: '⚡ Esprit supérieur',
      superiorDesc: 'Top {percentile}% de tous les joueurs ! Intuition vive et excellente résolution de problèmes.',
      aboveAverage: '💡 Au-dessus de la moyenne',
      aboveAverageDesc: 'Top {percentile}% de tous les joueurs ! Esprit analytique stable et flexible.',
      balanced: '🎯 Esprit équilibré',
      balancedDesc: 'Top {percentile}% de tous les joueurs ! Développement harmonieux des 5 piliers cognitifs.',
      developing: '🌱 Esprit en évolution',
      developingDesc: 'Phase d’entraînement initial. Votre indice cognitif progressera à chaque partie !'
    }
  },
  battleLobby: {
    title: 'Duel 1v1 en temps réel',
    cancelBtn: 'Annuler le match',
    searching: 'Recherche d’un adversaire à votre hauteur...',
    autoMatchTitle: 'Match rapide',
    autoMatchDesc: 'Appariement rapide avec des joueurs du monde entier',
    mmrBadge: 'Match équilibré · Victoires : {rate}%',
    findOpponentBtn: 'Chercher un duel',
    noOpponentFound: 'Aucun adversaire trouvé. Jouer contre l’IA ?',
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
    confirmLeave: 'Voulez-vous déclarer forfait et retourner à l’accueil ?',
    emptyCellsLeft: 'restantes'
  },
  aiBattleScreen: {
    selectLevelTitle: 'Choisir le niveau de l’IA',
    selectLevelDesc: 'Sélectionnez un adversaire IA adapté à votre niveau de jeu.',
    aiSpeed: 'Vitesse : {speed}',
    level1Desc: 'Robot débutant : résout lentement pour vous aider à maîtriser les bases.',
    level2Desc: 'Robot normal : résout à un rythme régulier avec très peu d’erreurs.',
    level3Desc: 'Robot confirmé : rythme rapide utilisant des tactiques intermédiaires.',
    level4Desc: 'Robot expert : résolveur très rapide appliquant des stratégies avancées.',
    level5Desc: 'AlphaDoku : IA Grand Maître résolvant à une vitesse extrême.',
    startBtn: 'Duel Lv.{level} {name}'
  },
  academy: {
    tabs: { stage1: 'Étape 1', stage2: 'Étape 2', stage3: 'Étape 3', stage4: 'Étape 4', stage5: 'Étape 5' },
    stageTitles: {
      stage1: 'Étape 1 : techniques de base (Singles & lignes)',
      stage2: 'Étape 2 : techniques intermédiaires (paires & intersections)',
      stage3: 'Étape 3 : techniques avancées (famille Wing)',
      stage4: 'Étape 4 : techniques expertes (Fish, coloriage & rectangle unique)',
      stage5: 'Étape 5 : techniques maître (chaînes AIC, ALS & Exocet)'
    },
    title: 'Académie Sudoku',
    practiceUi: {
      theory: 'Théorie',
      practice1: 'Exercice 1',
      practice2: 'Exercice 2',
      success: 'Correct [{val}] ! Technique maîtrisée avec brio !',
      retry: 'Réessayer',
      error: '[{val}] est incorrect. Réexaminez les chiffres de départ !',
      prompt: '👇 Touchez le chiffre cible (?) sur le pavé numérique ci-dessous.'
    }
  },
  adBanner: { placeholderTag: 'TEST', placeholderText: 'Emplacement pub (aucune pub)', removeBtn: 'Sans pub' }
};
