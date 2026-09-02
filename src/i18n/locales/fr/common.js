export const common = {
  common: {
    you: 'Vous',
    back: 'Retour',
    close: 'Fermer',
    confirm: 'OK',
    cancel: 'Annuler',
    restart: 'Recommencer',
    restartConfirm: 'Recommencer cette grille ?',
    newGame: 'Nouvelle partie',
    home: 'Accueil',
    save: 'Enregistrer',
    pause: 'Pause',
    resume: 'Reprendre',
    loading: 'Chargement...',
    error: 'Erreur',
    exitAppPrompt: 'Appuyez à nouveau sur Retour pour quitter l’application.',
    confirmLeaveGame: 'Voulez-vous mettre en pause et retourner à l’accueil ?',
    shareUnavailable: "Le partage n'est pas disponible sur cet appareil."
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
    combo: '🔥 {count} COMBO !',
    restartShort: 'Recommencer',
    newGameShort: 'Nouvelle partie',
    pauseTooltip: 'Mettre en pause',
    themeTooltip: 'Changer de thème',
    soundOn: 'Couper le son',
    soundOff: 'Activer le son'
  },
  keypad: {
    undo: 'Annuler',
    erase: 'Effacer',
    notes: 'Notes',
    hint: 'Indice',
    rewardHint: '+1 indice',
    fastEntry: 'Mode rapide',
    fastEntryLocked: 'Verrouillé {number}'
  },
  board: {
    pausedTitle: 'Partie en pause',
    tapToResume: 'Touchez pour reprendre ▶️',
    resumeTooltip: 'Touchez pour reprendre'
  },
  themes: {
    toast: '🎨 Thème {name} activé',
    clay: '🏺 Céramique & Argile',
    clayDesc: 'Touches céramiques mates avec physique tactile 3D',
    matteDark: '🌌 Résine sombre mate',
    matteDarkDesc: 'Finition résine mate premium avec doux éclat nocturne',
    pureCeramic: '🧊 Claymorphisme pur',
    pureCeramicDesc: 'Touches coussinées blanches lisses et arrondies',
    editorial: '📰 Papier journal classique',
    editorialDesc: 'Ton papier éditorial suisse, clair et reposant pour les yeux'
  },
  conflicts: {
    boxes: [
      'Haut-Gauche', 'Haut-Centre', 'Haut-Droite',
      'Milieu-Gauche', 'Centre', 'Milieu-Droite',
      'Bas-Gauche', 'Bas-Centre', 'Bas-Droite'
    ],
    boxDuplicate: '⚠️ Le chiffre {num} existe déjà dans le [bloc 3x3 {box}] ! {suffix}',
    rowDuplicate: '⚠️ Le chiffre {num} existe déjà dans la ligne {row} ! {suffix}',
    colDuplicate: '⚠️ Le chiffre {num} existe déjà dans la colonne {col} ! {suffix}',
    multipleDuplicates: '⚠️ Le chiffre {num} existe déjà dans le même bloc / ligne / colonne ! {suffix}',
    notSolution: '⚠️ Le chiffre {num} n’est pas la solution de cette case ! {suffix}',
    boardFullHasMistakes: '⚠️ La grille est pleine mais contient des erreurs. Veuillez vérifier !',
    timeAttackSuffix: '(Erreur {count} | +10s de pénalité)',
    classicSuffix: '(Erreurs {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Grand Maître',
      desc: 'Top {percentile}% des joueurs ! Déduction magistrale digne du top 1% de l’élite.'
    },
    mensa: {
      title: '🧠 Niveau Mensa',
      desc: 'Top {percentile}% des joueurs ! Esprit logique et capacité d’analyse exceptionnels.'
    },
    superior: {
      title: '⚡ Logique supérieure',
      desc: 'Top {percentile}% des joueurs ! Intuition affûtée et brillante résolution de problèmes.'
    },
    aboveAverage: {
      title: '💡 Au-dessus de la moyenne',
      desc: 'Top {percentile}% des joueurs ! Esprit analytique souple et robuste.'
    },
    balanced: {
      title: '🎯 Esprit équilibré',
      desc: 'Top {percentile}% des joueurs ! Développement harmonieux des 5 piliers cognitifs.'
    },
    developing: {
      title: '🌱 Entraînement cérébral',
      desc: 'Développement des fondations logiques au potentiel infini.'
    }
  }
};
