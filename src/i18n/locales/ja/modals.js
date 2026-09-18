export const modals = {
  modals: {
    victory: {
      title: 'パズル完成！',
      desc: 'おめでとうございます！\nナンプレパズルを見事にクリアしました。',
      rankLabel: 'クリアランク: {title}',
      difficultyLabel: '難易度',
      timeLabel: '所要時間',
      timeRemainingLabel: '残り時間',
      mistakesLabel: 'ミス回数',
      mistakesCount: 'ミス {count}回',
      nextGame: '次のパズルに挑戦',
      leaderboardBtn: '🏆 ランキングを見る',
      shareBtn: '記録を共有',
      copiedToast: '🎉 クリア記録がクリップボードにコピーされました！',
      shareText: '🧩 Sudoku {mode} Lv.{level} {name}を[{time}]でクリア！ ランク: {rank} (ミス {mistakes}回)。あなたの脳力に挑戦してみよう！',
      ranks: {
        'S+': '👑 S+ (神速の境地)',
        'S': '⭐️ S (マスター)',
        'A': '🥇 A (熟練者)',
        'B': '🥈 B (上級者)',
        'C': '🥉 C (クリア達成)'
      }
    },
    gameOver: {
      title: 'ゲームオーバー',
      desc: 'ミスの制限回数（3回）に達しました。\n広告を視聴して復活できます。',
      descNoRevive: 'ミスの制限回数（3回）に達しました。\n(復活のチャンスは使用済みです)',
      reviveBtn: '広告を見て復活 (+1回)',
      restartBtn: '最初からやり直す'
    },
    newGame: {
      title: '難易度選択',
      desc: '挑戦するナンプレの難易度を\n選択してください。'
    },
    storeReview: {
      title: 'Sudokuはお楽しみいただけていますか？',
      desc: '率直な評価とレビューを残していただけると、\n今後の改善とアップデートの大きな励みになります！ 💙',
      submitBtn: 'ストアでレビューを書く',
      laterBtn: '後で'
    },
    dailyReward: {
      title: 'デイリーログインボーナス！',
      streakBadge: '{days}日連続',
      desc: '連続 {days}日目のログイン達成！\n無料ヒント +{count}個 が付与されました。',
      confirm: 'ボーナスを受け取る'
    },
    adReward: {
      dismissed: '報酬を受け取るには、広告を最後まで視聴してください。',
      unavailable: '現在、広告を読み込めません。\nしばらくしてから再度お試しください。'
    },
    hintReward: {
      title: '無料ヒントの補充',
      desc: '短い広告を視聴すると、\n無料ヒントが1個補充されます。',
      watchAd: '広告を見てヒント獲得 (+1個)',
      adWatching: '📺 広告を再生中…',
      adPlaceholder: '📺 広告スペース（配信なし）',
      chancesLeft: 'このゲームの残り補充: {remaining}/{max}回',
      maxReached: '広告によるヒント補充は1ゲームあたり最大2回までです。',
      later: '後で'
    }
  }
};
