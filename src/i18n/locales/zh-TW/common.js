/**
 * Traditional Chinese (zh-TW / 繁體中文 - 台灣/香港) Common Strings
 */
export const common = {
  common: {
    you: "您",
    back: '返回',
    close: '關閉',
    confirm: '確認',
    cancel: '取消',
    restart: '重新開始',
    restartConfirm: "要重新開始這個謎題嗎？目前這局會記為失敗。",
    abandonConfirm: "有正在進行的遊戲。開始新遊戲後，目前這局會記為失敗。要開始嗎？",
    newGame: '新遊戲',
    home: '主畫面',
    pause: '暫停',
    resume: '繼續',
    exitAppPrompt: '再次點擊返回鍵即可退出應用程式。',
    confirmLeaveGame: '確定要中斷遊戲並返回主畫面嗎？',
    shareUnavailable: '此裝置無法使用分享功能。'
  },
  calendar: {
    days: {
      sun: '日',
      mon: '一',
      tue: '二',
      wed: '三',
      thu: '四',
      fri: '五',
      sat: '六'
    }
  },
  levels: {
    1: '入門',
    2: '初級',
    3: '中級',
    4: '高級',
    5: '大師'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: '失誤 {count}/{max}',
    mistakesUnlimited: '失誤 {count}次',
    timeAttackMistake: '失誤 {count}次 (+10s)',
    combo: '🔥 {count} 連擊!',
    restartShort: '重開本局',
    newGameShort: '開新對局',
    themeTooltip: '更換主題',
    soundOn: '靜音',
    soundOff: '開啟音效'
  },
  keypad: {
    undo: '復原',
    erase: '清除',
    notes: '筆記',
    hint: '提示',
    rewardHint: '+1 提示',
    fastEntry: '快速輸入'
  },
  board: {
    pausedTitle: '遊戲已暫停',
    tapToResume: '點擊螢幕繼續遊戲 ▶️',
    resumeTooltip: '點擊繼續'
  },
  themes: {
    clay: '🏺 溫潤陶瓷與黏土',
    matteDark: '🌌 沉穩暗夜消光',
    pureCeramic: '🧊 純白立體陶瓷',
    editorial: '📰 經典報刊紙韻'
  },
  conflicts: {
    boxDuplicate: '⚠️ [{box} 3x3 九宮格] 內已存在數字 {num}！{suffix}',
    rowDuplicate: '⚠️ 第 {row} 橫行已存在數字 {num}！{suffix}',
    colDuplicate: '⚠️ 第 {col} 直列已存在數字 {num}！{suffix}',
    multipleDuplicates: '⚠️ 相同九宮格與行列中已存在數字 {num}！{suffix}',
    notSolution: '⚠️ 數字 {num} 不是此格的正確答案！{suffix}',
    boardFullHasMistakes: '⚠️ 盤面已填滿但有錯誤，請重新檢查！',
    timeAttackSuffix: '(錯誤 {count}次 | +10秒懲罰)',
    classicSuffix: '(失誤 {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 宗師',
      desc: '已達到最高等級。'
    },
    expert: {
      title: '🧠 達人',
      desc: '能穩定解開高難度謎題。'
    },
    superior: {
      title: '⚡ 高手',
      desc: '已具備挑戰高級謎題的實力。'
    },
    aboveAverage: {
      title: '💡 進階',
      desc: '實力正在穩步提升。'
    },
    balanced: {
      title: '🎯 均衡型',
      desc: '5 項遊戲指標均衡提升。'
    },
    developing: {
      title: '🌱 新手',
      desc: '玩得越多，分數越高。'
    }
  }
};
