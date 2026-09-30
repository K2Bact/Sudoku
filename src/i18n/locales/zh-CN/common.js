/**
 * Simplified Chinese (zh-CN / 简体中文) Common Strings
 */
export const common = {
  common: {
    you: '您',
    back: '返回',
    close: '关闭',
    confirm: '确认',
    cancel: '取消',
    restart: '重新开始',
    restartConfirm: "要重新开始这个谜题吗？当前这局将记为失败。",
    abandonConfirm: "有正在进行的游戏。开始新游戏后，当前这局将记为失败。要开始吗？",
    newGame: '新游戏',
    home: '主页',
    pause: '暂停',
    resume: '继续',
    exitAppPrompt: '再次点击返回键即可退出应用。',
    confirmLeaveGame: '确定要中断游戏并返回主页吗？',
    shareUnavailable: '此设备无法使用分享功能。'
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
    1: '入门',
    2: '初级',
    3: '中级',
    4: '高级',
    5: '大师'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: '失误 {count}/{max}',
    mistakesUnlimited: '失误 {count}次',
    timeAttackMistake: '失误 {count}次 (+10s)',
    combo: '🔥 {count} 连击!',
    restartShort: '重开本局',
    newGameShort: '开新对局',
    themeTooltip: '更换主题',
    soundOn: '静音',
    soundOff: '开启音效'
  },
  keypad: {
    undo: '撤销',
    erase: '擦除',
    notes: '笔记',
    notesOn: '笔记 开',
    notesOff: '笔记 关',
    hint: '提示',
    rewardHint: '+1 提示',
    fastEntry: '快速输入'
  },
  board: {
    pausedTitle: '游戏已暂停',
    tapToResume: '点击屏幕继续游戏 ▶️',
    resumeTooltip: '点击继续'
  },
  themes: {
    clay: '🏺 温润陶瓷与黏土',
    matteDark: '🌌 沉稳暗夜磨砂',
    pureCeramic: '🧊 纯白立体陶瓷',
    editorial: '📰 经典报刊纸韵'
  },
  conflicts: {
    boxDuplicate: '⚠️ [{box} 3x3 九宫格] 内已存在数字 {num}！{suffix}',
    rowDuplicate: '⚠️ 第 {row} 行已存在数字 {num}！{suffix}',
    colDuplicate: '⚠️ 第 {col} 列已存在数字 {num}！{suffix}',
    multipleDuplicates: '⚠️ 相同九宫格与行列中已存在数字 {num}！{suffix}',
    notSolution: '⚠️ 数字 {num} 不是此格的正确答案！{suffix}',
    boardFullHasMistakes: '⚠️ 盘面已填满但有错误，请重新检查！',
    timeAttackSuffix: '(错误 {count}次 | +10秒惩罚)',
    classicSuffix: '(失误 {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 宗师',
      desc: '已达到最高等级。'
    },
    expert: {
      title: '🧠 达人',
      desc: '能稳定解开高难度谜题。'
    },
    superior: {
      title: '⚡ 高手',
      desc: '已具备挑战高级谜题的实力。'
    },
    aboveAverage: {
      title: '💡 进阶',
      desc: '实力正在稳步提升。'
    },
    balanced: {
      title: '🎯 均衡型',
      desc: '5 项游戏指标均衡提升。'
    },
    developing: {
      title: '🌱 新手',
      desc: '玩得越多，分数越高。'
    }
  }
};
