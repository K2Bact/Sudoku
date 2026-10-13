export const screens = {
  game: {
    ghost: {
      ahead: '领先 {time}',
      behind: '落后 {time}',
      ghostHintNotice: '💡 由于使用了提示，本局将不计入个人最佳记录。'
    }
  },
  home: {
    scoreLabel: 'Logic Score',
    title: 'Sudoku',
    badge: 'PRO',
    hintTooltip: '剩余提示',
    brainReportTitle: '游戏分析',
    brainPercentileShort: '已通关 {won} 局',
    startSelectedLevel: '开始 Lv.{level} {name}',
    modeTabs: { classic: '经典', timeAttack: '计时竞速', timeLimit: '极限生存' },
    rivalModes: {
      standard: '🎯 一般',
      ghost: '👻 幽灵',
      delta: '⚡ 时间差',
      lockedToast: '至少通关此难度 1 次后解锁。',
      timeLimitToast: "极限生存模式不支持幽灵和时间差。",
      infoAria: "关于幽灵和时间差",
      infoGhost: "重玩创造纪录的那一局，与当时的自己较量。",
      infoDelta: "换一局新的，用±秒显示比自己最佳节奏快多少。",
    },
    modes: {
      classic: { badge: '经典模式', title: '经典单人', desc: '沉浸于逻辑思考的纯粹数独体验', startBtn: '开始新游戏' },
      timeAttack: { badge: '计时竞速', title: '⚡ 计时竞速', desc: '分秒必争！挑战你的极速通关纪录', startBtn: '开始竞速' },
      timeLimit: { badge: '极限生存', title: '⏳ 极限生存', desc: 'Lv.{level} 限时 {minutes} 分钟！在倒计时结束前生存下来', startBtn: '开始生存' },
      daily: { title: '每日挑战', desc: '每日专属谜题与月度大师徽章', badge: '每日' },
      battle: { title: '1v1 在线对决', desc: '全球玩家即时对战' },
      aiBattle: { badge: '人机对战', title: 'AI 机器人对战', desc: '1:1 AI 速度对决' },
      academy: { title: '数独学院', desc: '学习 32 种实战解题策略' },
      practice: { title: '自由练习模式', desc: '无失误限制，轻松畅玩' }
    },
    nav: {brain: '分析', stats: '个人统计', academy: '数独学院', settings: '设置' }
  },
  daily: {
    header: '每日挑战目标 ({month})',
    badgeTitle: '{month}数独大师徽章',
    badgeDesc: '{completed}/{target} 局 · 目标 15',
    unlockingAd: '📺 正在观看广告... 解锁过往谜题',
    calendarTitle: '📅 365 日历',
    futureAlert: '未来的谜题尚未开放挑战。',
    pastUnlockNotice: '💡 错过的过往谜题 (🔒) 可通过观看简短广告随时解锁并补签。',
    unlockModalTitle: '解锁过往每日谜题',
    unlockModalDesc: '{date} 的谜题为过往挑战。\n观看简短广告即可立即解锁进行挑战。\n是否观看广告？',
    unlockModalConfirmBtn: '📺 观看广告解锁',
    unlockModalCancelBtn: '取消',
    missionCardTitle: '🎯 今日专属任务',
    missionCompleted: '今日任务已完成！✅',
    missionStartBtn: '开始任务 🚀',
    missionReward: '+1 免费提示与签到',
    tiers: { beginner: '初学·新秀', intermediate: '中级', advanced: '大师' },
    missions: {
      beginnerLv1Title: '【Lv.1 入门】通关 1 局数独', beginnerLv1Desc: '完成 Lv.1 入门难度，建立基础逻辑思维。',
      beginnerLv2Title: '【Lv.2 初级】通关 1 局数独', beginnerLv2Desc: '完成 Lv.2 初级谜题，巩固数独基本功。',
      medLv3Title: '【Lv.3 中级以上】通关 1 局数独', medLv3Desc: '完成 Lv.3 中级以上谜题，检验进阶推理力。',
      advLv4Title: '【Lv.4 高级以上】通关 1 局数独', advLv4Desc: '击破 Lv.4 以上高难度谜题，证明大师实力。',
      advLv5Title: '【Lv.5 大师】通关 1 局数独', advLv5Desc: '挑战 Lv.5 大师极限难度，冲击最高段位。',
      battleTitle: '参加 1 场 1v1 在线或 AI 对决', battleDesc: '参与 1 场即时对战或 AI 练习赛。',
      speedrunTitle: '⚡ 完成 1 局计时竞速', speedrunDesc: '在计时竞速模式中完成一局。'
    }
  },
  removeAds: {
    title: '移除广告与高级会员',
    heroTitle: '享受纯净无干扰的数独体验',
    heroDesc: '永久移除底部横幅广告与游戏结束后的插页广告。',
    benefitsTitle: '👑 高级版特权',
    benefit1: '永久移除横幅与插页广告',
    benefit2: '极致专注体验并节省设备电量',
    benefit3: '支持独立开发团队与持续更新',
    buyBtn: '永久无广告 ({price})',
    restoreBtn: '恢复购买记录',
    alreadyPurchased: '您已拥有高级版！ 🎉',
    processing: '💳 处理中...',
    purchaseBtn: '永久去除广告',
    buySuccess: '购买成功！感谢您的支持。',
    restoreSuccess: '购买记录已成功恢复。',
    restoreFail: '未找到可恢复的购买记录。',
    buyFail: '无法完成购买，请稍后再试。'
  },
  tutorialOverlay: {
    exitTooltip: '退出教学',
    step1Title: '🎯 第 1 步：选择格子并输入数字',
    step1Desc: '点击高亮的 [第 1 行第 3 格] 空格，并在键盘上输入 [9]！',
    step2Title: '✏️ 第 2 步：铅笔笔记（填写候选数）',
    step2Desc: '在工具栏开启 [笔记] 切换为候选数模式，并为该格标记 [3]！',
    step3Title: '🔒 第 3 步：快速输入模式',
    step3Desc: '点击快速输入锁定数字 [4]，连续点击空格即可快速填入！',
    step4Title: '🎉 第 4 步：新手教学完成！',
    step4Desc: '恭喜！您已掌握格子填写、笔记标记与快速输入模式。',
    finishBtn: '开始实战游戏',
    nextBtn: '下一步'
  },
  settings: {
    title: '设置',
    themeSection: '🎨 视觉主题',
    languageSection: '🌐 语言设置',
    languages: {
      auto: '系统'
    },
    gameplaySection: '🎮 游戏规则',
    limitMistakes: '失误 3 次限制 (❤️)',
    limitMistakesDesc: "犯错 3 次则游戏结束。关闭后不记录最佳成绩",
    autoCheck: '即时自动检查错误',
    autoCheckDesc: '输入错误数字时立即以红色警示',
    soundSection: '🔊 声音与震动',
    soundFx: '音效',
    soundFxDesc: '数字输入与按钮点击音效',
    hapticFx: '触觉震动反馈',
    hapticFxDesc: '填入正确或错误时的手指震动',
    adPrivacyBtn: '广告隐私设置',
    adPrivacyDesc: '重新选择个性化广告同意',
    resetData: '重置所有本地数据',
    resetDataDesc: '重置所有本地游戏统计与记录',
    resetConfirm: '⚠️ 警告：所有游玩记录、持有提示、游戏分析记录将被永久删除。是否确定重置？',
    resetSuccess: '数据已成功重置。',
    privacySection: '🛡️ 隐私保护',
    privacyPolicyBtn: '查看完整隐私政策',
    privacySubtitle: '隐私保护',
    privacyModalTitle: '隐私政策',
    privacy: {
      subtitle: 'Sudoku 无需账号。以下是本应用实际保存和发送的信息。',
      sec1Title: '1. 本机存储与备份', sec1Desc: "您的记录、提示和设置保存在本机。未登录 Play 游戏时，这些数据只保留在本机。我们从不收集您的姓名、邮箱、电话号码、通讯录或位置。",
      sec2Title: '2. Google Play 游戏', sec2Desc: '登录 Play 游戏后，每次获胜都会把您的进度（统计、成就、提示、设置）自动备份到 Play 游戏存档，并把您的 Logic Score提交到 Play 游戏排行榜。您获得的成就也会记录到 Play 游戏中，包括登录前获得的成就。这些数据保存在您自己的 Google 账号中。',
      sec3Title: '3. 1v1 对战', sec3Desc: '实时 1v1 对战通过 Google Firebase 向对手发送随机生成的玩家 ID、自动昵称（Player_xxxx）和您的解题进度。该 ID 保存在本机并重复使用，不与您的姓名或任何账号关联。 如果双方都开启了“对战记录共享”，对战结束后还会向对手发送本局的步骤和时间，用于复盘（默认开启，可在设置中关闭）。',
      sec4Title: '4. 广告与购买', sec4Desc: '本应用通过 Google AdMob 展示广告：横幅广告、获胜后的全屏广告以及自愿观看的激励视频。AdMob 可能会处理您的广告 ID。“移除广告”的购买由 Google Play 处理，我们不会收到您的支付信息。'
    }
  },
  stats: {
    classicBest: '经典最高纪录',
    speedrunBest: '竞速最高纪录',
    survivalTitle: '⏳ 极限生存模式',
    survivalTotalWins: '极限生存成功',
    survivalWinsUnit: '{count}次 成功',
    summaryTitle: '总体战绩摘要',
    pvpRating: "积分",
    pvpRecordLabel: "战绩",
    pvpRecord: "{wins}胜 · {losses}负",
    totalPlayed: '总游玩局数',
    totalWon: '总通关局数',
    winRate: '胜率'
  },
  brainReport: {
    scoreLabel: 'Logic Score',
    scoreHowTitle: "ⓘ Logic Score 是怎么决定的？",
    scoreHowBody: "填满整个棋盘获胜时会上升。标准和杀手都会计入。不用提示通关的最高难度影响最大，获胜局数和胜率也有少量影响。1v1 对决和 AI 机器人对战不计入获胜局数和胜率，会单独记在个人统计的战绩里。游戏结束或中途放弃会降低胜率，分数可能略微下降。登录 Play 游戏后，排行榜按这个分数排名。",
    shareText: '[Sudoku 游戏分析]\nLogic Score: {iq}分\n等级: {tier}\n快来挑战 Sudoku 吧！',
    copiedToast: '游戏分析已复制到剪贴板。',
    focus: '零失误',
    durability: '投入度',
    accuracy: '通关率',
    logic: '难度',
    speed: '速度',
    shareCardBtn: '🔗 分享游戏分析',
    attributesTitle: '📈 5 项游戏指标',
    title: '游戏分析',
    shareTitle: '我的 Sudoku 游戏分析',
    tiers: {
      grandMaster: '👑 宗师',
      grandMasterDesc: '已达到最高等级。',
      expert: '🧠 达人',
      expertDesc: '能稳定解开高难度谜题。',
      superior: '⚡ 高手',
      superiorDesc: '已具备挑战高级谜题的实力。',
      aboveAverage: '💡 进阶',
      aboveAverageDesc: '实力正在稳步提升。',
      balanced: '🎯 均衡型',
      balancedDesc: '5 项游戏指标均衡提升。',
      developing: '🌱 新手',
      developingDesc: '玩得越多，分数越高。'
    }
  },
  battleLobby: {
    title: '1v1 即时对决',
    cancelBtn: '取消匹配',
    searching: '正在寻找对手...',
    autoMatchTitle: '快速匹配',
    autoMatchDesc: '与全球玩家进行 1:1 极速对决',
    mmrBadge: '我的通关率 {rate}%',
    findOpponentBtn: '寻找对手',
    noOpponentFound: '找不到对手。',
    searchAgain: '再次寻找',
    connectFailed: "无法连接在线对战。请稍后再试。要改与 AI 对战吗?",
    playAiInstead: '与 AI 对战'
  },
  battleResult: {
    victoryTitle: '1v1 对决胜利！',
    defeatTitle: '1v1 对决惜败',
    aiVictoryTitle: 'AI 对决胜利！',
    aiDefeatTitle: 'AI 对决惜败',
    victoryDesc: '在与 {opponent} 的对决中先完成谜题获胜！',
    victoryMistakeDesc: '{opponent} 因 3 次失误出局，您获得了胜利！',
    defeatDesc: '{opponent} 先完成了谜题。',
    defeatMistakeDesc: '因 3 次失误（爱心耗尽）遗憾淘汰。',
    disqualified: '💀 淘汰',
    finalProgress: '最终进度',
    ratingChange: '1v1 MMR 积分变动',
    aiModeLabel: 'AI 机器人练习对决 (Lv.{level})',
    aiWonBadge: '练习获胜',
    aiLostBadge: '练习完成',
    you: '我方',
    opponent: '对手',
    lobbyBtn: '对战大厅',
    aiLobbyBtn: 'AI 对决列表',
    rematchBtn: '申请再战',
    aiRematchBtn: '再次挑战',
    rematchWaitingBtn: '申请中... ({seconds}s)',
    rematchAcceptedToast: '🎉 对手已接受再战！即将开始新游戏。',
    rematchRejectedToast: '对手拒绝了再战申请。',
    rematchOpponentLeftToast: '对手已离开对战房间。',
    homeBtn: '返回主页'
  },
  rematchToast: {
    title: '{opponent} 向您发起了再战请求！',
    countdown: '{seconds}s',
    acceptBtn: '接受',
    declineBtn: '婉拒'
  },
  battleHeader: {
    aiTag: 'AI',
    confirmLeave: '确定要认输并返回主页吗？',
    emptyCellsLeft: '剩余'
  },
  aiBattleScreen: {
    selectLevelTitle: '选择 AI 对决难度',
    selectLevelDesc: '挑选符合自己实力的 AI 对手进行练习。',
    aiSpeed: '解题速度：{speed}',
    level1Desc: '初级机器人：步调较慢，适合建立解题信心。',
    level2Desc: '普通机器人：稳定解题且失误极少。',
    level3Desc: '熟练机器人：速度快，失误少。',
    level4Desc: '大师机器人：速度极快，很少失误。',
    level5Desc: '阿尔法数独：最快、失误最少的机器人。',
    startBtn: '开始 Lv.{level} {name} AI 对决'
  },
  academy: {
    tabs: { stage1: '第1阶段', stage2: '第2阶段', stage3: '第3阶段', stage4: '第4阶段', stage5: '第5阶段' },
    stageTitles: {
      stage1: '第1阶段: 基础技巧 (基本单数与行列)',
      stage2: '第2阶段: 中级技巧 (区块数对与交集排除)',
      stage3: '第3阶段: 高级技巧 (翼系列)',
      stage4: '第4阶段: 大师技巧 (鱼类、着色法与唯一矩形)',
      stage5: '第5阶段: 宗师技巧 (AIC、ALS 与 Exocet)'
    },
    title: '数独学院',
    theoryBoard: {
      patternTab: '模式',
      resultTab: '结果',
      patternCaption: '着色的格组成该技巧的模式。这是与实战范例 1 相同的盘面。',
      resultCaption: '标成红色的候选数会因这个模式被排除。',
      placeCaption: '这个模式把高亮的数字确定为该格的答案。'
    },
    practiceUi: {
      theory: '理论讲解',
      practice1: '实战练习 1',
      practice2: '实战练习 2',
      success: '答案 [{val}] 正确！您已完全掌握此技巧！',
      retry: '重新作答',
      error: '[{val}] 不是正确答案，请再次观察已给出的数字！',
      prompt: '👇 请在下方数字键盘点击目标空格 (?) 应填入的数字。',
      promptEliminated: '👇 请点击将从目标格中排除的候选数。'
    }
  },
  adBanner: {removeBtn: '去广告' }
};
