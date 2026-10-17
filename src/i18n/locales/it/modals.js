export const modals = {
  modals: {
    victory: {
      title: 'Schema risolto!',
      desc: 'Congratulazioni!\nHai completato il sudoku con successo.',
      rankLabel: 'Valutazione: {title}',
      difficultyLabel: 'Difficoltà',
      timeLabel: 'Tempo impiegato',
      timeRemainingLabel: 'Tempo rimanente',
      mistakesLabel: 'Errori',
      mistakesCount: '{count}',
      notRecordedHint: "Hai usato dei suggerimenti, quindi questo tempo non conta come record.",
      notRecordedNoLimit: "Hai giocato senza il limite di 3 errori, quindi questo tempo non conta come record.",
      nextGame: 'Prossima partita',
      leaderboardBtn: "📊 I miei record",
      shareBtn: 'Condividi',
      copiedToast: '🎉 Record copiato negli appunti!',
      shareText: '🧩 Ho risolto Sudoku {mode} Lv.{level} {name} in [{time}]! Valutazione: {rank} (errori: {mistakes}). Riesci a fare meglio?',
      ranks: {
        'S+': '👑 S+ (Divino)',
        'S': '⭐️ S (Maestro)',
        'A': '🥇 A (Esperto)',
        'B': '🥈 B (Abile)',
        'C': '🥉 C (Completato)'
      }
    },
    gameOver: {
      title: 'Partita terminata',
      desc: 'Hai commesso 3 errori.\nGuarda un annuncio per rivivere e continuare!',
      descNoRevive: 'Tutti gli errori sono stati esauriti.\n(Opportunità di rivincita già utilizzata)',
      reviveBtn: 'Rivivi (+1 vita)',
      restartBtn: 'Ricomincia'
    },
    newGame: {
      title: 'Seleziona difficoltà',
      desc: 'Scegli il tuo livello\nper il nuovo schema.'
    },
    storeReview: {
      title: 'Ti piace Sudoku?',
      desc: 'La tua recensione sincera ci aiuta\nmoltissimo a migliorare costantemente il gioco! 💙',
      submitBtn: 'Lascia recensione',
      laterBtn: 'Forse più tardi'
    },
    dailyReward: {
      title: 'Ricompensa giornaliera!',
      streakBadge: 'Serie di {days} giorno/i',
      desc: 'Serie di {days} giorno/i raggiunta!\n+{count} suggerimento/i gratuito/i aggiunto/i.',
      confirm: 'Riscatta'
    },
    adReward: {
      dismissed: 'Guarda l’annuncio fino alla fine per ottenere la ricompensa.',
      unavailable: 'Al momento non ci sono annunci disponibili.\nRiprova tra poco.'
    },
    hintReward: {
      title: 'Ricarica suggerimenti gratis',
      desc: 'Guarda un breve annuncio per\nottenere subito +1 suggerimento.',
      watchAd: 'Guarda annuncio (+1 suggerimento)',
      adWatching: '📺 Annuncio in riproduzione…',
      adPlaceholder: '📺 Spazio annuncio (nessun annuncio)',
      chancesLeft: 'Ricariche rimaste in questa partita: {remaining}/{max}',
      maxReached: 'Le ricariche tramite annunci sono limitate a 2 per partita.',
      later: 'Più tardi'
    }
  }
};
