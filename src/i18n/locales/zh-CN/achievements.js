/**
 * Simplified Chinese (zh-CN / 简体中文) Achievement Strings
 */
export const achievements = {
  achievements: {
    categories: {
      all: '全部',
      progression: '通关・成长',
      logic: '逻辑・无瑕',
      speed: '极速・排位',
      difficulty: '难度・生存',
      special: '每日・对决'
    },
    unlockedToast: '成就达成！',
    tabTitle: '成就',
    statsTab: '统计',
    unlockedCount: '已达成 {unlocked} / {total} ({pct}%)',
    lockedBadge: '未解锁',
    unlockedAt: '达成日：{date}',

    // 1 ~ 7. 通关与进度
    first_win: { title: '初试身手', desc: '不限难度完成生涯第一局数独' },
    win_5: { title: '青铜解题家', desc: '累计通关 5 局数独' },
    win_10: { title: '数独爱好者', desc: '累计通关 10 局数独' },
    win_25: { title: '白银解题家', desc: '累计通关 25 局数独' },
    win_50: { title: '黄金老手', desc: '累计通关 50 局数独' },
    win_100: { title: '百局俱乐部', desc: '累计通关 100 局数独' },
    win_250: { title: '数独传奇', desc: '累计通关 250 局数独' },

    // 8 ~ 14. 逻辑与完美
    flawless_1: { title: '完美无瑕', desc: '零失误（0 次错误）通关 1 局数独' },
    flawless_5: { title: '完美主义者', desc: '达成 5 次零失误完美通关' },
    pure_logic_expert: { title: '纯粹逻辑境界', desc: '未使用任何提示通关 Lv.4 高级难度' },
    pure_logic_master: { title: '终极心智', desc: '零失误且无提示通关 Lv.5 大师难度' },
    note_master: { title: '笔记达人', desc: '累计使用笔记功能超过 50 次' },
    no_notes: { title: '直觉之眼', desc: '完全不使用笔记通关 Lv.3 中级以上难度' },
    fast_entry_fan: { title: '极速闪电', desc: '使用快速固定输入模式通关 1 局' },

    // 15 ~ 19. 竞速与连击
    rank_s_plus: { title: '神速之境', desc: '首次取得极速 👑 S+ 评级' },
    speed_runner_3m: { title: '3 分钟内通关', desc: '于 3 分钟 (180秒) 内通关数独' },
    speed_runner_2m: { title: '雷霆快手', desc: '于 2 分钟 (120秒) 内超速通关' },
    combo_streak_5: { title: '连击艺术家', desc: '在竞速模式中达成 5 连击' },
    combo_streak_10: { title: '连击大师', desc: '在竞速模式中达成 10 连击' },

    // 20 ~ 26. 难度征服与生存
    clear_lv1: { title: '入门征服者', desc: '通关 Lv.1 入门难度' },
    clear_lv2: { title: '初级大师', desc: '通关 Lv.2 初级难度' },
    clear_lv3: { title: '中级晋阶', desc: '通关 Lv.3 中级难度' },
    clear_lv4: { title: '高级征服者', desc: '通关 Lv.4 高级难度' },
    clear_lv5: { title: '宗师', desc: '通关 Lv.5 大师最高难度' },
    survival_hero: { title: '极限生存者', desc: '成功通关极限生存模式' },
    survival_clutch: { title: '绝处逢生', desc: '在剩余时间 5 秒以内惊险通关' },

    // 27 ~ 30. 每日挑战、对决与大脑智力
    daily_first: { title: '每日探索者', desc: '首次完成今日的每日挑战' },
    daily_streak_7: { title: '七日奇迹', desc: '连续 7 天签到并完成每日挑战' },
    battle_first_win: { title: '竞技场首胜', desc: '在 1v1 在线或 AI 对决中取得首胜' },
    iq_150: { title: '门萨级大脑', desc: '大脑活性指数 Sudoku IQ 达到 150 以上' }
  }
};
