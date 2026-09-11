/**
 * Simplified Chinese (zh-CN / 简体中文) Modal Strings
 */
export const modals = {
  modals: {
    victory: {
      title: '解题成功！',
      desc: '恭喜！\n您已顺利完成这道数独谜题。',
      rankLabel: '通关评级：{title}',
      difficultyLabel: '难度',
      timeLabel: '通关时间',
      timeRemainingLabel: '剩余时间',
      mistakesLabel: '失误次数',
      mistakesCount: '失误 {count} 次',
      nextGame: '挑战下一局',
      leaderboardBtn: '🏆 查看全球排行',
      shareBtn: '分享战绩',
      copiedToast: '🎉 通关记录已复制至剪贴板！',
      shareText: '🧩 我以 [{time}] 破解了 Sudoku {mode} Lv.{level} {name}！评级：{rank}（失误 {mistakes} 次）。快来挑战你的逻辑极限！',
      ranks: {
        'S+': '👑 S+ (神速之境)',
        'S': '⭐️ S (宗师级)',
        'A': '🥇 A (熟练者)',
        'B': '🥈 B (沉稳老练)',
        'C': '🥉 C (成功通关)'
      }
    },
    gameOver: {
      title: '游戏结束',
      desc: '3 次失误已全部用尽。\n您可以观看广告以获得复活机会。',
      descNoRevive: '3 次失误已全部用尽。\n（复活机会已使用完毕）',
      reviveBtn: '观看广告复活 (+1 次机会)',
      restartBtn: '重新开始本局'
    },
    newGame: {
      title: '选择难度',
      desc: '请选择想要挑战的\n数独难度。'
    },
    storeReview: {
      title: '喜欢 Sudoku 吗？',
      desc: '留下宝贵的评价与真心评语，\n是支持我们持续优化游戏的最大动力！💙',
      submitBtn: '前往商店评价',
      laterBtn: '稍后再说'
    },
    dailyReward: {
      title: '每日签到奖励已送达！',
      streakBadge: '连续 {days} 天',
      desc: '连续第 {days} 天签到完成！\n已获得免费提示 +{count}。',
      confirm: '领取奖励'
    },
    hintReward: {
      title: '领取免费提示',
      desc: '观看简短广告即可立即获得\n免费提示 1 个。',
      watchAd: '观看广告领取 (+1)',
      adWatching: '📺 广告播放中…',
      adPlaceholder: '📺 广告位（未投放）',
      chancesLeft: '本局剩余补充次数: {remaining}/{max}',
      maxReached: '每局通过广告补充提示最多 2 次。',
      later: '稍后'
    }
  }
};
