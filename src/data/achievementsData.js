/**
 * The achievements — 40 since 2026-10-08 (D11).
 * The first 30 were calibrated from global benchmark titles (Easybrain, Microsoft,
 * Good Sudoku). The ten added with the Play Games set: days the app was opened
 * (progression), killer (difficulty) and the academy (special). The order here is
 * the order on screen; the ids are saved keys and, once registered, Play Games
 * achievements — never rename one.
 */
// The tier's name is translated (achievements.tiers.*). It used to be an English label
// here, so every locale read "Silver" and "Diamond" (SudokuAITalk DE29-12, 2026-09-30).
//
// points: what the app's achievement screen adds up. pgsPoints: what each is worth
// in Play Games, which allows 2,000 in all and 200 at most, in fives — 40 at these
// values come to 1,480, leaving room for later ones (D11, 2026-10-07).
export const ACHIEVEMENT_TIERS = {
  BRONZE: { id: 'bronze', emoji: '🥉', labelKey: 'achievements.tiers.bronze', color: '#cd7f32', points: 10, pgsPoints: 10 },
  SILVER: { id: 'silver', emoji: '🥈', labelKey: 'achievements.tiers.silver', color: '#94a3b8', points: 25, pgsPoints: 20 },
  GOLD: { id: 'gold', emoji: '🥇', labelKey: 'achievements.tiers.gold', color: '#f59e0b', points: 50, pgsPoints: 35 },
  DIAMOND: { id: 'diamond', emoji: '💎', labelKey: 'achievements.tiers.diamond', color: '#38bdf8', points: 100, pgsPoints: 60 },
  MASTER: { id: 'master', emoji: '👑', labelKey: 'achievements.tiers.master', color: '#a855f7', points: 200, pgsPoints: 120 }
};

export const ACHIEVEMENTS_LIST = [
  // 1 ~ 7. Progression & Total Wins
  {
    id: 'first_win',
    icon: '🌱',
    tier: 'bronze',
    category: 'progression',
    titleKey: 'achievements.first_win.title',
    descKey: 'achievements.first_win.desc',
    target: 1
  },
  {
    id: 'win_5',
    icon: '🥉',
    tier: 'bronze',
    category: 'progression',
    titleKey: 'achievements.win_5.title',
    descKey: 'achievements.win_5.desc',
    target: 5
  },
  {
    id: 'win_10',
    icon: '⭐',
    tier: 'silver',
    category: 'progression',
    titleKey: 'achievements.win_10.title',
    descKey: 'achievements.win_10.desc',
    target: 10
  },
  {
    id: 'win_25',
    icon: '🌟',
    tier: 'silver',
    category: 'progression',
    titleKey: 'achievements.win_25.title',
    descKey: 'achievements.win_25.desc',
    target: 25
  },
  {
    id: 'win_50',
    icon: '🏅',
    tier: 'gold',
    category: 'progression',
    titleKey: 'achievements.win_50.title',
    descKey: 'achievements.win_50.desc',
    target: 50
  },
  {
    id: 'win_100',
    icon: '🏆',
    tier: 'diamond',
    category: 'progression',
    titleKey: 'achievements.win_100.title',
    descKey: 'achievements.win_100.desc',
    target: 100
  },
  {
    id: 'win_250',
    icon: '👑',
    tier: 'master',
    category: 'progression',
    titleKey: 'achievements.win_250.title',
    descKey: 'achievements.win_250.desc',
    target: 250
  },
  {
    id: 'visit_30',
    icon: '🗓️',
    tier: 'silver',
    category: 'progression',
    titleKey: 'achievements.visit_30.title',
    descKey: 'achievements.visit_30.desc',
    target: 30
  },
  {
    id: 'visit_100',
    icon: '💯',
    tier: 'gold',
    category: 'progression',
    titleKey: 'achievements.visit_100.title',
    descKey: 'achievements.visit_100.desc',
    target: 100
  },
  {
    id: 'visit_365',
    icon: '🌏',
    tier: 'master',
    category: 'progression',
    titleKey: 'achievements.visit_365.title',
    descKey: 'achievements.visit_365.desc',
    target: 365
  },

  // 8 ~ 14. Perfection & Logic Mastery
  {
    id: 'flawless_1',
    icon: '🎯',
    tier: 'silver',
    category: 'logic',
    titleKey: 'achievements.flawless_1.title',
    descKey: 'achievements.flawless_1.desc',
    target: 1
  },
  {
    id: 'flawless_5',
    icon: '💎',
    tier: 'gold',
    category: 'logic',
    titleKey: 'achievements.flawless_5.title',
    descKey: 'achievements.flawless_5.desc',
    target: 5
  },
  {
    id: 'pure_logic_expert',
    icon: '🧠',
    tier: 'gold',
    category: 'logic',
    titleKey: 'achievements.pure_logic_expert.title',
    descKey: 'achievements.pure_logic_expert.desc',
    target: 1
  },
  {
    id: 'pure_logic_master',
    icon: '🔱',
    tier: 'diamond',
    category: 'logic',
    titleKey: 'achievements.pure_logic_master.title',
    descKey: 'achievements.pure_logic_master.desc',
    target: 1
  },
  {
    id: 'note_master',
    icon: '✏️',
    tier: 'bronze',
    category: 'logic',
    titleKey: 'achievements.note_master.title',
    descKey: 'achievements.note_master.desc',
    target: 1
  },
  {
    id: 'no_notes',
    icon: '👁️',
    tier: 'silver',
    category: 'logic',
    titleKey: 'achievements.no_notes.title',
    descKey: 'achievements.no_notes.desc',
    target: 1
  },
  {
    id: 'fast_entry_fan',
    icon: '⚡',
    tier: 'bronze',
    category: 'logic',
    titleKey: 'achievements.fast_entry_fan.title',
    descKey: 'achievements.fast_entry_fan.desc',
    target: 1
  },

  // 15 ~ 19. Speed & Combo Ranks
  {
    id: 'rank_s_plus',
    icon: '🚀',
    tier: 'gold',
    category: 'speed',
    titleKey: 'achievements.rank_s_plus.title',
    descKey: 'achievements.rank_s_plus.desc',
    target: 1
  },
  {
    id: 'speed_runner_3m',
    icon: '⏱️',
    tier: 'silver',
    category: 'speed',
    titleKey: 'achievements.speed_runner_3m.title',
    descKey: 'achievements.speed_runner_3m.desc',
    target: 1
  },
  {
    id: 'speed_runner_2m',
    icon: '⚡',
    tier: 'diamond',
    category: 'speed',
    titleKey: 'achievements.speed_runner_2m.title',
    descKey: 'achievements.speed_runner_2m.desc',
    target: 1
  },
  {
    id: 'combo_streak_5',
    icon: '🔥',
    tier: 'silver',
    category: 'speed',
    titleKey: 'achievements.combo_streak_5.title',
    descKey: 'achievements.combo_streak_5.desc',
    target: 5
  },
  {
    id: 'combo_streak_10',
    icon: '💥',
    tier: 'diamond',
    category: 'speed',
    titleKey: 'achievements.combo_streak_10.title',
    descKey: 'achievements.combo_streak_10.desc',
    target: 10
  },

  // 20 ~ 26. Difficulty Conquering & Survival
  {
    id: 'clear_lv1',
    icon: '🟢',
    tier: 'bronze',
    category: 'difficulty',
    titleKey: 'achievements.clear_lv1.title',
    descKey: 'achievements.clear_lv1.desc',
    target: 1
  },
  {
    id: 'clear_lv2',
    icon: '🟡',
    tier: 'bronze',
    category: 'difficulty',
    titleKey: 'achievements.clear_lv2.title',
    descKey: 'achievements.clear_lv2.desc',
    target: 1
  },
  {
    id: 'clear_lv3',
    icon: '🟠',
    tier: 'silver',
    category: 'difficulty',
    titleKey: 'achievements.clear_lv3.title',
    descKey: 'achievements.clear_lv3.desc',
    target: 1
  },
  {
    id: 'clear_lv4',
    icon: '🔴',
    tier: 'gold',
    category: 'difficulty',
    titleKey: 'achievements.clear_lv4.title',
    descKey: 'achievements.clear_lv4.desc',
    target: 1
  },
  {
    id: 'clear_lv5',
    icon: '🟣',
    tier: 'diamond',
    category: 'difficulty',
    titleKey: 'achievements.clear_lv5.title',
    descKey: 'achievements.clear_lv5.desc',
    target: 1
  },
  {
    id: 'survival_hero',
    icon: '⏳',
    tier: 'gold',
    category: 'difficulty',
    titleKey: 'achievements.survival_hero.title',
    descKey: 'achievements.survival_hero.desc',
    target: 1
  },
  {
    id: 'survival_clutch',
    icon: '🛡️',
    tier: 'diamond',
    category: 'difficulty',
    titleKey: 'achievements.survival_clutch.title',
    descKey: 'achievements.survival_clutch.desc',
    target: 1
  },
  {
    id: 'killer_first',
    icon: '➕',
    tier: 'bronze',
    category: 'difficulty',
    titleKey: 'achievements.killer_first.title',
    descKey: 'achievements.killer_first.desc',
    target: 1
  },
  {
    id: 'killer_lv3',
    icon: '🔶',
    tier: 'silver',
    category: 'difficulty',
    titleKey: 'achievements.killer_lv3.title',
    descKey: 'achievements.killer_lv3.desc',
    target: 1
  },
  {
    id: 'killer_win_25',
    icon: '🗡️',
    tier: 'gold',
    category: 'difficulty',
    titleKey: 'achievements.killer_win_25.title',
    descKey: 'achievements.killer_win_25.desc',
    target: 25
  },
  {
    id: 'killer_lv5',
    icon: '🐉',
    tier: 'diamond',
    category: 'difficulty',
    titleKey: 'achievements.killer_lv5.title',
    descKey: 'achievements.killer_lv5.desc',
    target: 1
  },

  // 27 ~ 30. Daily Dedication, Battle & Brain IQ
  {
    id: 'daily_first',
    icon: '📅',
    tier: 'bronze',
    category: 'special',
    titleKey: 'achievements.daily_first.title',
    descKey: 'achievements.daily_first.desc',
    target: 1
  },
  {
    id: 'daily_streak_7',
    icon: '🔥',
    tier: 'gold',
    category: 'special',
    titleKey: 'achievements.daily_streak_7.title',
    descKey: 'achievements.daily_streak_7.desc',
    target: 7
  },
  {
    id: 'battle_first_win',
    icon: '⚔️',
    tier: 'silver',
    category: 'special',
    titleKey: 'achievements.battle_first_win.title',
    descKey: 'achievements.battle_first_win.desc',
    target: 1
  },
  {
    id: 'iq_150',
    icon: '🧬',
    tier: 'master',
    category: 'special',
    titleKey: 'achievements.iq_150.title',
    descKey: 'achievements.iq_150.desc',
    target: 1
  },
  {
    id: 'academy_first_lesson',
    icon: '📖',
    tier: 'bronze',
    category: 'special',
    titleKey: 'achievements.academy_first_lesson.title',
    descKey: 'achievements.academy_first_lesson.desc',
    target: 1
  },
  {
    id: 'academy_stage3',
    icon: '🎓',
    tier: 'gold',
    category: 'special',
    titleKey: 'achievements.academy_stage3.title',
    descKey: 'achievements.academy_stage3.desc',
    target: 6
  },
  {
    id: 'academy_all',
    icon: '🏛️',
    tier: 'diamond',
    category: 'special',
    titleKey: 'achievements.academy_all.title',
    descKey: 'achievements.academy_all.desc',
    target: 32
  }
];
