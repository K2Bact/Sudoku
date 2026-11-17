export const common = {
  common: {
    you: 'Vous',
    back: 'Retour',
    close: 'Fermer',
    on: 'OUI',
    off: 'NON',
    confirm: 'OK',
    cancel: 'Annuler',
    restart: 'Recommencer',
    restartConfirm: "Recommencer cette grille ? La partie en cours comptera comme une défaite.",
    abandonConfirm: "Une partie est en cours. En commencer une nouvelle la comptera comme une défaite. Commencer quand même ?",
    newGame: 'Nouvelle partie',
    home: 'Accueil',
    pause: 'Pause',
    resume: 'Reprendre',
    exitAppPrompt: 'Appuyez à nouveau sur Retour pour quitter l’application.',
    confirmLeaveGame: 'Voulez-vous mettre en pause et retourner à l’accueil ?',
    shareUnavailable: "Le partage n’est pas disponible sur cet appareil."
  },
  calendar: {
    days: {
      sun: 'D',
      mon: 'L',
      tue: 'M',
      wed: 'M',
      thu: 'J',
      fri: 'V',
      sat: 'S'
    }
  },
  levels: {
    1: 'Initiation',
    2: 'Facile',
    3: 'Moyen',
    4: 'Difficile',
    5: 'Expert'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: 'Erreurs {count}/{max}',
    mistakesUnlimited: 'Erreurs {count}',
    timeAttackMistake: 'Erreur {count} (+10s)',
    combo: '🔥 {count} COMBO !',
    floatCombo: '-{seconds}s ({count} COMBO !)',
    floatPenalty: '+{seconds}s',
    floatBonus: '+{seconds}s de bonus !',
    restartShort: 'Recommencer',
    newGameShort: 'Nouvelle partie',
    themeTooltip: 'Changer de thème',
    soundOn: 'Couper le son',
    soundOff: 'Activer le son'
  },
  keypad: {
    undo: 'Annuler',
    erase: 'Effacer',
    notes: 'Notes',
    notesOn: 'Notes ON',
    notesOff: 'Notes OFF',
    hint: 'Indice',
    rewardHint: '+1 indice',
    fastEntry: 'Mode rapide'
  },
  board: {
    pausedTitle: 'Partie en pause',
    tapToResume: 'Touchez pour reprendre ▶️',
    resumeTooltip: 'Touchez pour reprendre',
    // D47: what a screen reader says for a board cell (utils/cellLabel.js).
    cellAria: 'Ligne {row}, colonne {col} : {content}',
    cellAriaCage: 'Ligne {row}, colonne {col} : {content} ; somme de la cage {sum}',
    cellEmpty: 'vide',
    cellGiven: '{num}, donné',
    cellNotes: 'notes {list}',
    // D44: shown instead of a board under 144px (a split-screen half on a phone).
    tooShort: 'La fenêtre est trop basse pour la grille. Agrandissez-la pour jouer.'
  },
  themes: {
    clay: '🏺 Céramique & Argile',
    matteDark: '🌌 Résine sombre mate',
    pureCeramic: '🧊 Claymorphisme pur',
    editorial: '📰 Papier journal classique'
  },
  conflicts: {
    boxDuplicate: '⚠️ Le chiffre {num} existe déjà dans le [bloc 3x3 {box}] ! {suffix}',
    rowDuplicate: '⚠️ Le chiffre {num} existe déjà dans la ligne {row} ! {suffix}',
    colDuplicate: '⚠️ Le chiffre {num} existe déjà dans la colonne {col} ! {suffix}',
    multipleDuplicates: '⚠️ Le chiffre {num} existe déjà dans le même bloc / ligne / colonne ! {suffix}',
    notSolution: '⚠️ Le chiffre {num} n’est pas la solution de cette case ! {suffix}',
    cageDuplicate: '⚠️ Le chiffre {num} est déjà dans cette cage ! {suffix}',
    cageSum: '⚠️ La somme de cette cage ne correspond plus à {sum} ! {suffix}',
    boardFullHasMistakes: '⚠️ La grille est pleine mais contient des erreurs. Veuillez vérifier !',
    timeAttackSuffix: '(Erreur {count} | +10s de pénalité)',
    classicSuffix: '(Erreurs {count}/3)',
    // Classic with the three-mistake limit switched off: no limit to count to, no time penalty.
    freeSuffix: '(Erreurs {count})'
  },
  tiers: {
    grandMaster: {
      title: '👑 Grand maître',
      desc: 'Vous avez atteint le rang le plus élevé.'
    },
    expert: {
      title: '🧠 Expert',
      desc: 'Vous résolvez régulièrement des grilles difficiles.'
    },
    superior: {
      title: '⚡ Avancé',
      desc: 'Vous êtes prêt pour des grilles avancées.'
    },
    aboveAverage: {
      title: '💡 Intermédiaire',
      desc: 'Vous progressez régulièrement.'
    },
    balanced: {
      title: '🎯 Équilibré',
      desc: 'Vos 5 indicateurs progressent de façon équilibrée.'
    },
    developing: {
      title: '🌱 Débutant',
      desc: 'Continuez à jouer et votre score montera.'
    }
  },
  // D38 (2026-11-06): shown by the page itself, before the app loads, when the WebView is older
  // than the build supports (scripts/build/webviewNotice.js). Read at build time, not by the app.
  webviewUpdate: {
    title: 'Mettez à jour Android System WebView',
    body: 'Ce jeu affiche ses écrans avec Android System WebView, et la version de ce téléphone est trop ancienne pour les afficher. Mettez-la à jour sur Google Play, puis rouvrez le jeu.',
    update: 'Ouvrir Google Play',
    continue: 'Continuer quand même'
  }
};
