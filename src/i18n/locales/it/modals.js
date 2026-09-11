export const modals = {
  modals: {
    victory: {
      title: 'Schema Risolto!',
      desc: 'Congratulazioni!\nHai completato il sudoku con successo.',
      rankLabel: 'Valutazione: {title}',
      difficultyLabel: 'Difficoltà',
      timeLabel: 'Tempo Impiegato',
      timeRemainingLabel: 'Tempo Rimanente',
      mistakesLabel: 'Errori',
      mistakesCount: '{count} Errori',
      nextGame: 'Prossima Partita',
      leaderboardBtn: '🏆 Classifica',
      shareBtn: 'Condividi',
      copiedToast: '🎉 Record copiato negli appunti!',
      shareText: '🧩 Ho risolto Sudoku {mode} Lv.{level} {name} in [{time}]! Valutazione: {rank} ({mistakes} errori). Metti alla prova il tuo QI!',
      ranks: {
        'S+': '👑 S+ (Divino)',
        'S': '⭐️ S (Maestro)',
        'A': '🥇 A (Esperto)',
        'B': '🥈 B (Abile)',
        'C': '🥉 C (Completato)'
      }
    },
    gameOver: {
      title: 'Partita Terminata',
      desc: 'Hai commesso 3 errori.\nGuarda un annuncio per rivivere e continuare!',
      descNoRevive: 'Tutti gli errori sono stati esauriti.\n(Opportunità di rivincita già utilizzata)',
      reviveBtn: 'Rivivi (+1 vita)',
      restartBtn: 'Ricomincia'
    },
    newGame: {
      title: 'Seleziona Difficoltà',
      desc: 'Scegli il tuo livello\nper il nuovo schema.'
    },
    storeReview: {
      title: 'Ti piace Sudoku?',
      desc: 'La tua recensione sincera ci aiuta\nmoltissimo a migliorare costantemente il gioco! 💙',
      submitBtn: 'Lascia recensione',
      laterBtn: 'Forse più tardi'
    },
    dailyReward: {
      title: 'Ricompensa Giornaliera!',
      streakBadge: 'Serie di {days} giorni',
      desc: 'Serie di {days} giorni raggiunta!\n+{count} suggerimento/i gratuito/i aggiunto/i.',
      confirm: 'Riscatta'
    },
    hintReward: {
      title: 'Ricarica Suggerimenti Gratis',
      desc: 'Guarda un breve annuncio per\nottenere subito +1 suggerimento.',
      watchAd: 'Guarda Annuncio (+1 Suggerimento)',
      adWatching: '📺 Annuncio in riproduzione…',
      adPlaceholder: '📺 Spazio annuncio (nessun annuncio)',
      chancesLeft: 'Ricariche rimaste in questa partita: {remaining}/{max}',
      maxReached: 'Le ricariche tramite annunci sono limitate a 2 per partita.',
      later: 'Più tardi'
    }
  }
};
