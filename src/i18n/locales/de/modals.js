export const modals = {
  modals: {
    victory: {
      title: 'Rätsel gelöst!',
      desc: 'Herzlichen Glückwunsch!\nDu hast das Rätsel erfolgreich gemeistert.',
      rankLabel: 'Abschluss-Rang: {title}',
      difficultyLabel: 'Schwierigkeit',
      timeLabel: 'Benötigte Zeit',
      timeRemainingLabel: 'Verbleibende Zeit',
      mistakesLabel: 'Fehler',
      mistakesCount: '{count} Fehler',
      notRecordedHint: "Es wurden Tipps genutzt, daher zählt diese Zeit nicht als Bestzeit.",
      notRecordedNoLimit: "Ohne 3-Fehler-Limit gespielt, daher zählt diese Zeit nicht als Bestzeit.",
      nextGame: 'Nächstes Rätsel',
      leaderboardBtn: "📊 Meine Rekorde",
      shareBtn: 'Teilen',
      copiedToast: '🎉 Ergebnis in die Zwischenablage kopiert!',
      shareText: '🧩 Sudoku {mode} Lv.{level} {name} in [{time}] gelöst! Rang: {rank} ({mistakes} Fehler). Schaffst du es schneller?',
      ranks: {
        'S+': '👑 S+ (Göttlich)',
        'S': '⭐️ S (Meister)',
        'A': '🥇 A (Profi)',
        'B': '🥈 B (Geübt)',
        'C': '🥉 C (Abgeschlossen)'
      }
    },
    gameOver: {
      title: 'Spiel vorbei',
      desc: 'Du hast 3 Fehler gemacht.\nSieh dir eine Werbung an, um ein weiteres Leben zu erhalten und weiterzuspielen!',
      descNoRevive: 'Du hast das Fehlerlimit erreicht.\n(Du hast deine Chance zur Wiederbelebung bereits genutzt.)',
      reviveBtn: 'Wiederbeleben (+1)',
      restartBtn: 'Neustart'
    },
    newGame: {
      title: 'Schwierigkeit wählen',
      desc: 'Wähle deine Stufe\nfür das neue Rätsel.'
    },
    storeReview: {
      title: 'Gefällt dir Sudoku?',
      desc: 'Deine ehrliche Bewertung hilft uns sehr,\ndas Spiel kontinuierlich zu verbessern! 💙',
      submitBtn: 'Bewerten',
      laterBtn: 'Später'
    },
    dailyReward: {
      title: 'Tägliche Belohnung!',
      streakBadge: '{days} Tag(e) in Folge',
      desc: '{days} Tag(e) in Folge erreicht!\nKostenlose Tipps: +{count}',
      confirm: 'Abholen'
    },
    adReward: {
      dismissed: 'Werbung bis zum Ende ansehen, um die Belohnung zu erhalten.',
      unavailable: 'Gerade ist keine Werbung verfügbar.\nBitte später erneut versuchen.'
    },
    hintReward: {
      title: 'Kostenlose Tipps aufladen',
      desc: 'Kurze Werbung ansehen,\num sofort +1 Tipp zu erhalten.',
      watchAd: 'Werbung ansehen (+1 Tipp)',
      adWatching: '📺 Werbung läuft…',
      adPlaceholder: '📺 Werbeplatzhalter (keine Werbung)',
      chancesLeft: 'Verbleibende Aufladungen: {remaining}/{max}',
      maxReached: 'Tipp-Aufladungen per Werbung sind auf 2 pro Spiel begrenzt.',
      later: 'Später'
    }
  }
};
