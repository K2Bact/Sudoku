/**
 * Traditional Chinese (zh-TW / 繁體中文 - 台灣/香港) Modal Strings
 */
export const modals = {
  modals: {
    victory: {
      title: '解題成功！',
      desc: '恭喜！\n您已順利完成這道數獨謎題。',
      rankLabel: '通關評級：{title}',
      difficultyLabel: '難度',
      timeLabel: '通關時間',
      timeRemainingLabel: '剩餘時間',
      mistakesLabel: '失誤次數',
      mistakesCount: '失誤 {count} 次',
      notRecordedHint: "使用了提示，本次成績不計入最佳記錄。",
      notRecordedNoLimit: "未開啟 3 次失誤限制，本次成績不計入最佳記錄。",
      nextGame: '挑戰下一局',
      leaderboardBtn: "📊 我的紀錄",
      shareBtn: '分享戰績',
      copiedToast: '🎉 通關紀錄已複製至剪貼簿！',
      shareText: '🧩 我以 [{time}] 破解了 Sudoku {mode} Lv.{level} {name}！評級：{rank}（失誤 {mistakes} 次）。你也來挑戰吧！',
      shareModes: { classic: '[經典模式]', timeAttack: '[⚡計時競速]', timeLimit: '[⏳極限生存]' },
      ranks: {
        'S+': '👑 S+ (神速之境)',
        'S': '⭐️ S (宗師級)',
        'A': '🥇 A (熟練者)',
        'B': '🥈 B (沉穩老練)',
        'C': '🥉 C (成功通關)'
      }
    },
    gameOver: {
      title: '遊戲結束',
      desc: '3 次失誤已全部用盡。\n您可以觀看廣告以獲得復活機會。',
      descNoRevive: '3 次失誤已全部用盡。\n（復活機會已使用完畢）',
      reviveBtn: '觀看廣告復活 (+1 次機會)',
      restartBtn: '重新開始本局'
    },
    newGame: {
      title: '選擇難度',
      desc: '請選擇想要挑戰的\n數獨難度。'
    },
    storeReview: {
      title: '喜歡 Sudoku 嗎？',
      desc: '留下寶貴的評價與真心評語，\n是支持我們持續改善遊戲的最大動力！💙',
      submitBtn: '前往商店評價',
      laterBtn: '稍後再說'
    },
    dailyReward: {
      title: '每日簽到獎勵已送達！',
      streakBadge: '連續 {days} 天',
      desc: '連續第 {days} 天簽到完成！\n已獲得免費提示 +{count}。',
      confirm: '領取獎勵'
    },
    adReward: {
      dismissed: '需要看完廣告才能獲得獎勵。',
      unavailable: '暫時無法載入廣告，\n請稍後再試。'
    },
    hintReward: {
      title: '領取免費提示',
      desc: '觀看簡短廣告即可立即獲得\n免費提示 1 個。',
      watchAd: '觀看廣告領取 (+1)',
      adWatching: '📺 廣告播放中…',
      adPlaceholder: '📺 廣告版位（未投放）',
      chancesLeft: '本局剩餘補充次數: {remaining}/{max}',
      maxReached: '每局透過廣告補充提示最多 2 次。',
      notSaved: '儲存空間已滿，暫時無法儲存提示。請釋放空間後再試。',
      later: '稍後'
    }
  }
};
