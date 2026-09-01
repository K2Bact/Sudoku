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
    newGame: '新游戏',
    home: '主页',
    save: '保存',
    pause: '暂停',
    resume: '继续',
    loading: '加载中...',
    error: '错误',
    exitAppPrompt: '再次点击返回键即可退出应用。',
    confirmLeaveGame: '确定要中断游戏并返回主页吗？'
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
    pauseTooltip: '暂停计时',
    themeTooltip: '更换主题',
    soundOn: '静音',
    soundOff: '开启音效'
  },
  keypad: {
    undo: '撤销',
    erase: '擦除',
    notes: '笔记',
    hint: '提示',
    fastEntry: '快速输入',
    fastEntryLocked: '固定 {number}'
  },
  board: {
    pausedTitle: '游戏已暂停',
    tapToResume: '点击屏幕继续游戏 ▶️',
    resumeTooltip: '点击继续'
  },
  themes: {
    toast: '🎨 已切换为 {name}',
    clay: '🏺 温润陶瓷与黏土',
    clayDesc: '温润陶土磨砂键帽与 3D 触觉质感',
    matteDark: '🌌 沉稳暗夜磨砂',
    matteDarkDesc: '舒适护眼的深邃夜色与高级磨砂质感',
    pureCeramic: '🧊 纯白立体陶瓷',
    pureCeramicDesc: '透明流畅的 3D 白瓷气垫键帽',
    editorial: '📰 经典报刊纸韵',
    editorialDesc: '典雅舒适的瑞士排版与自然纸质色调'
  },
  conflicts: {
    boxes: [
      '左上', '中上', '右上',
      '左中', '正中', '右中',
      '左下', '中下', '右下'
    ],
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
      title: '👑 宗师级大脑',
      desc: '超越全体玩家前 {percentile}%！仅极少数人能达到的顶级极速推理力。'
    },
    mensa: {
      title: '🧠 门萨级高智商',
      desc: '超越全体玩家前 {percentile}%！展现门萨级别的卓越逻辑分析力。'
    },
    superior: {
      title: '⚡ 卓越思维',
      desc: '超越全体玩家前 {percentile}%！具备敏锐直觉与优异的问题解决力。'
    },
    aboveAverage: {
      title: '💡 优于常人',
      desc: '超越全体玩家前 {percentile}%！以稳定灵活的思维破解谜题。'
    },
    balanced: {
      title: '🎯 均衡大脑',
      desc: '超越全体玩家前 {percentile}%！五大认知能力均衡发展的理想状态。'
    },
    developing: {
      title: '🌱 成长潜力',
      desc: '刚展开大脑训练，持续挑战将大幅提升逻辑指数！'
    }
  }
};
