export const modals = {
  modals: {
    victory: {
      title: 'Puzzle Solved!',
      desc: 'Congratulations!\nYou solved the puzzle.',
      rankLabel: 'Clear Rank: {title}',
      difficultyLabel: 'Difficulty',
      timeLabel: 'Time',
      timeRemainingLabel: 'Time Remaining',
      mistakesLabel: 'Mistakes',
      mistakesCount: '{count}',
      notRecordedHint: "Hints were used, so this time isn't saved as a best record.",
      notRecordedNoLimit: "Played without the 3-mistake limit, so this time isn't saved as a best record.",
      nextGame: 'Next Puzzle',
      leaderboardBtn: "📊 My Records",
      shareBtn: 'Share',
      copiedToast: '🎉 Clear record copied to clipboard!',
      shareText: '🧩 Sudoku {mode} Lv.{level} {name} cleared in [{time}]! Rank: {rank} (mistakes: {mistakes}). Can you beat it?',
      shareModes: { classic: '[Classic]', timeAttack: '[⚡Speedrun]', timeLimit: '[⏳Survival]' },
      ranks: {
        'S+': '👑 S+ (Godspeed)',
        'S': '⭐️ S (Master)',
        'A': '🥇 A (Pro)',
        'B': '🥈 B (Skilled)',
        'C': '🥉 C (Completed)'
      }
    },
    gameOver: {
      title: 'Game Over',
      desc: 'You\'ve made 3 mistakes.\nWatch an ad to get another life and keep going!',
      descNoRevive: 'You\'re out of mistakes.\n(You\'ve already used your revive.)',
      reviveBtn: 'Revive (+1 life)',
      restartBtn: 'Restart'
    },
    newGame: {
      title: 'Select Difficulty',
      desc: 'Choose a difficulty\nfor your new puzzle.'
    },
    storeReview: {
      title: 'Enjoying Sudoku?',
      desc: 'Your rating and feedback\nhelp us make the game better! 💙',
      submitBtn: 'Leave a Review',
      laterBtn: 'Maybe Later'
    },
    dailyReward: {
      title: 'Daily Check-in Reward!',
      streakBadge: '{days}-Day Streak',
      desc: '{days}-day streak!\nFree hints +{count}',
      confirm: 'Claim Reward'
    },
    adReward: {
      dismissed: 'Watch the ad to the end to receive the reward.',
      unavailable: 'No ad is available right now.\nPlease try again in a moment.'
    },
    hintReward: {
      title: 'Get a Free Hint',
      desc: 'Watch a short ad to\nget 1 free hint right away.',
      watchAd: 'Watch Ad (+1 Hint)',
      adWatching: '📺 Playing ad…',
      adPlaceholder: '📺 Ad placeholder (no ad served)',
      chancesLeft: 'Refills left this game: {remaining}/{max}',
      maxReached: 'You can get up to 2 hints from ads per game.',
      notSaved: 'Your storage is full, so hints can\'t be saved right now. Free up some space and try again.',
      later: 'Later'
    }
  }
};
