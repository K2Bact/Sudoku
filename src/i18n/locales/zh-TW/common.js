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
    restartConfirm: '要重新開始這個謎題嗎？',
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
      title: '👑 宗師級大腦',
      desc: '僅極少數人能達到的頂級極速推理力。'
    },
    expert: {
      title: '🧠 專家級邏輯',
      desc: '在本遊戲中展現出色的推理能力。'
    },
    superior: {
      title: '⚡ 卓越思維',
      desc: '具備敏銳直覺與優異的問題解決力。'
    },
    aboveAverage: {
      title: '💡 優於常人',
      desc: '以穩定靈活的思維破解謎題。'
    },
    balanced: {
      title: '🎯 均衡大腦',
      desc: '五大認知能力均衡發展的理想狀態。'
    },
    developing: {
      title: '🌱 成長潛力',
      desc: '剛展開大腦訓練，持續挑戰將大幅提升邏輯指數！'
    }
  }
};
