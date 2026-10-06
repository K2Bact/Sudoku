/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: '謎題類型',
    classic: '標準',
    killer: '殺手',
    comingSoon: '殺手數獨暫不支援，仍在開發中。',
    classicRules: {
      title: '數獨規則',
      grid: '每個橫行、直列和 3×3 宮格都填入 1 到 9，每個數字只出現一次。',
      givens: '一開始給出的數字不能更改。',
      unique: '每道題都只有唯一解。'
    }
  },
  killer: {
    badge: '殺手數獨',
    rules: {
      title: '殺手數獨規則',
      sudoku: '每個橫行、直列和 3×3 宮格中，1 到 9 各出現一次——和一般數獨一樣。',
      sum: '虛線圍成的籠子裡，數字總和等於籠子左上角的小數字。',
      noRepeat: '同一個籠子裡不能出現重複的數字。',
      example: '例如：兩格的籠子標著 3，那兩格就是 1 和 2。',
      start: '開始'
    },
    stats: {
      title: '殺手數獨',
      played: '已玩 {count} 局',
      won: '通關 {count} 局'
    },
    shareText: '🧩 我以 [{time}] 破解了 Sudoku 殺手 Lv.{level} {name}！（失誤 {mistakes} 次）。你也來挑戰吧！'
  }
};
