export const modals = {
  modals: {
    victory: {
      title: 'Grille résolue !',
      desc: 'Félicitations !\nVous avez résolu le puzzle avec succès.',
      rankLabel: 'Rang obtenu : {title}',
      difficultyLabel: 'Difficulté',
      timeLabel: 'Temps écoulé',
      timeRemainingLabel: 'Temps restant',
      mistakesLabel: 'Erreurs',
      mistakesCount: '{count} erreur(s)',
      nextGame: 'Grille suivante',
      leaderboardBtn: '🏆 Classement',
      shareBtn: 'Partager',
      copiedToast: '🎉 Record copié dans le presse-papiers !',
      shareText: '🧩 Sudoku {mode} Lv.{level} {name} résolu en [{time}] ! Rang : {rank} ({mistakes} erreurs). Testez votre QI cérébral !',
      ranks: {
        'S+': '👑 S+ (Divin)',
        'S': '⭐️ S (Maître)',
        'A': '🥇 A (Pro)',
        'B': '🥈 B (Qualifié)',
        'C': '🥉 C (Complété)'
      }
    },
    gameOver: {
      title: 'Partie terminée',
      desc: 'Vous avez épuisé vos 3 erreurs.\nRegardez une pub pour revivre et continuer !',
      descNoRevive: 'Toutes les erreurs ont été utilisées.\n(Chance de réanimation déjà utilisée)',
      reviveBtn: 'Regarder la pub (+1 vie)',
      restartBtn: 'Recommencer'
    },
    newGame: {
      title: 'Choisir la difficulté',
      desc: 'Sélectionnez votre niveau\npour la nouvelle grille.'
    },
    storeReview: {
      title: 'Vous aimez le Sudoku ?',
      desc: 'Votre avis et votre note comptent énormément\npour nous aider à améliorer le jeu ! 💙',
      submitBtn: 'Laisser un avis',
      laterBtn: 'Plus tard'
    },
    dailyReward: {
      title: 'Récompense quotidienne !',
      streakBadge: 'Série de {days} j',
      desc: 'Série de {days} jour(s) atteinte !\n+{count} indice(s) gratuit(s) ajouté(s).',
      confirm: 'Récupérer'
    },
    hintReward: {
      title: 'Recharge d’indices gratuits',
      desc: 'Regardez une courte vidéo pour\nobtenir immédiatement +1 indice.',
      watchAd: 'Regarder la pub (+1 indice)',
      adWatching: '📺 Publicité en cours…',
      adPlaceholder: '📺 Emplacement pub (aucune pub)',
      chancesLeft: 'Recharges restantes : {remaining}/{max}',
      maxReached: 'La recharge d’indices via pub est limitée à 2 par partie.',
      later: 'Plus tard'
    }
  }
};
