/**
 * Traditional Chinese (zh-TW / 繁體中文 - 台灣/香港) Achievement Strings
 */
export const achievements = {
  achievements: {
    categories: {
      all: '全部',
      progression: '通關・成長',
      logic: '邏輯・無瑕',
      speed: '極速・排位',
      difficulty: '難度・生存',
      special: '每日・對決'
    },
    unlockedToast: '成就達成！',
    tabTitle: '成就',
    statsTab: '統計',
    unlockedCount: '已達成 {unlocked} / {total} ({pct}%)',
    lockedBadge: '未解鎖',
    pointsTotal: '{count} 分',
    tiers: { bronze: '青銅', silver: '白銀', gold: '黃金', diamond: '鑽石', master: '大師' },
    unlockedAt: '達成日：{date}',

    // 1 ~ 7. 通關與進度
    first_win: { title: '初試身手', desc: '不限難度完成生涯第一局數獨' },
    win_5: { title: '青銅解題家', desc: '累計通關 5 局數獨' },
    win_10: { title: '數獨愛好者', desc: '累計通關 10 局數獨' },
    win_25: { title: '白銀解題家', desc: '累計通關 25 局數獨' },
    win_50: { title: '黃金老手', desc: '累計通關 50 局數獨' },
    win_100: { title: '百局俱樂部', desc: '累計通關 100 局數獨' },
    win_250: { title: '數獨傳奇', desc: '累計通關 250 局數獨' },

    // Days checked in, in all (2026-10-08, D11)
    visit_30: { title: '常客', desc: '累計簽到 30 天' },
    visit_100: { title: '百日堅持', desc: '累計簽到 100 天' },
    visit_365: { title: '數獨一整年', desc: '累計簽到 365 天' },

    // 8 ~ 14. 邏輯與完美
    flawless_1: { title: '完美無瑕', desc: '零失誤（0 次錯誤）通關 1 局數獨' },
    flawless_5: { title: '完美主義者', desc: '達成 5 次零失誤完美通關' },
    pure_logic_expert: { title: '純粹邏輯境界', desc: '未使用任何提示通關 Lv.4 高級難度' },
    pure_logic_master: { title: '終極心智', desc: '零失誤且無提示通關 Lv.5 大師難度' },
    note_master: { title: '筆記達人', desc: '累計使用筆記功能超過 50 次' },
    no_notes: { title: '直覺之眼', desc: '完全不使用筆記通關 Lv.3 中級以上難度' },
    fast_entry_fan: { title: '極速閃電', desc: '使用快速固定輸入模式通關 1 局' },

    // 15 ~ 19. 競速與連擊
    rank_s_plus: { title: '神速之境', desc: '首次取得極速 👑 S+ 評級' },
    speed_runner_3m: { title: '三分鐘速破', desc: '於 3 分鐘 (180秒) 內通關數獨' },
    speed_runner_2m: { title: '雷霆快手', desc: '於 2 分鐘 (120秒) 內超速通關' },
    combo_streak_5: { title: '連擊藝術家', desc: '在競速模式中達成 5 連擊' },
    combo_streak_10: { title: '連擊大師', desc: '在競速模式中達成 10 連擊' },

    // 20 ~ 26. 難度征服與生存
    clear_lv1: { title: '入門征服者', desc: '通關 Lv.1 入門難度' },
    clear_lv2: { title: '初級專家', desc: '通關 Lv.2 初級難度' },
    clear_lv3: { title: '中級晉階', desc: '通關 Lv.3 中級難度' },
    clear_lv4: { title: '高級征服者', desc: '通關 Lv.4 高級難度' },
    clear_lv5: { title: '大師宗師', desc: '通關 Lv.5 大師最高難度' },
    survival_hero: { title: '極限生還者', desc: '成功通關極限生存模式' },
    survival_clutch: { title: '絕處逢生', desc: '在剩餘時間 5 秒以內驚險通關' },

    // Killer (2026-10-08, D11)
    killer_first: { title: '初入籠中', desc: '首次通關殺手數獨' },
    killer_lv3: { title: '求和能手', desc: '通關 Lv.3 中級難度的殺手數獨' },
    killer_win_25: { title: '破籠者', desc: '累計通關 25 局殺手數獨' },
    killer_lv5: { title: '殺手大師', desc: '通關 Lv.5 大師最高難度的殺手數獨' },

    // 27 ~ 30. 每日挑戰、對決與大腦智力
    daily_first: { title: '每日探索者', desc: '首次完成今日的每日挑戰' },
    daily_streak_7: { title: '七日奇蹟', desc: '連續 7 天簽到' },
    battle_first_win: { title: '競技場首勝', desc: '在 1v1 線上或 AI 對決中取得首勝' },
    iq_150: { title: '邏輯達人', desc: 'Logic Score 達到 135 以上' },

    // The academy (2026-10-08, D11)
    academy_first_lesson: { title: '第一課', desc: '完成數獨學院中任一實戰練習' },
    academy_stage3: { title: '翼系列大師', desc: '完成第3階段所有技巧的實戰練習' },
    academy_all: { title: '學院畢業', desc: '完成數獨學院所有技巧的實戰練習' }
  }
};
