export const modals = {
  modals: {
    victory: {
      title: 'Puzzle Solved!',
      desc: 'Congratulations!\nYou successfully solved the puzzle.',
      rankLabel: 'Clear Rank: {title}',
      difficultyLabel: 'Difficulty',
      timeLabel: 'Time Elapsed',
      timeRemainingLabel: 'Time Remaining',
      mistakesLabel: 'Mistakes',
      mistakesCount: '{count} Mistakes',
      nextGame: 'Next Puzzle',
      leaderboardBtn: '🏆 Leaderboard',
      shareBtn: 'Share',
      copiedToast: '🎉 Clear record copied to clipboard!',
      shareText: '🧩 Sudoku {mode} Lv.{level} {name} cleared in [{time}]! Rank: {rank} ({mistakes} mistakes). Test your brain IQ!',
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
      desc: 'You have used all 3 mistakes.\nWatch an ad to revive and continue!',
      descNoRevive: 'You have used all mistakes.\n(Revive chance already used)',
      reviveBtn: 'Revive (+1 life)',
      restartBtn: 'Restart'
    },
    newGame: {
      title: 'Select Difficulty',
      desc: 'Choose your challenge level\nfor the new puzzle.'
    },
    storeReview: {
      title: 'Enjoying Sudoku?',
      desc: 'Your honest rating and feedback mean\nthe world in helping us improve the game! 💙',
      submitBtn: 'Leave a Review',
      laterBtn: 'Maybe Later'
    },
    dailyReward: {
      title: 'Daily Attendance Reward!',
      streakBadge: 'Day {days} Streak',
      desc: 'Day {days} streak achieved!\n+{count} Free Hints added.',
      confirm: 'Claim Reward'
    },
    hintReward: {
      title: 'Free Hint Recharge',
      desc: 'Watch a short ad to\nreceive +1 Free Hint immediately.',
      watchAd: 'Watch Ad (+1 Hint)',
      adWatching: '📺 Playing ad…',
      adPlaceholder: '📺 Ad placeholder (no ad served)',
      chancesLeft: 'Refills left this game: {remaining}/{max}',
      maxReached: 'Hint refills via ads are limited to 2 per game.',
      later: 'Later'
    }
  }
};
