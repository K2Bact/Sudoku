/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: '谜题类型',
    classic: '标准',
    killer: '杀手',
    comingSoon: '杀手数独暂不支持，仍在开发中。',
    classicRules: {
      title: '数独规则',
      grid: '每行、每列和每个 3×3 宫都填入 1 到 9，每个数字只出现一次。',
      givens: '一开始给出的数字不能更改。',
      unique: '每道题都只有唯一解。'
    }
  },
  killer: {
    badge: '杀手数独',
    rules: {
      title: '杀手数独规则',
      sudoku: '每行、每列和每个 3×3 宫中，1 到 9 各出现一次——和普通数独一样。',
      sum: '虚线围成的笼子里，数字之和等于笼子左上角的小数字。',
      noRepeat: '同一个笼子里不能出现重复的数字。',
      example: '例如：两格的笼子标着 3，那两格就是 1 和 2。',
      start: '开始'
    },
    stats: {
      title: '杀手数独',
    },
    shareText: '🧩 我以 [{time}] 破解了 Sudoku 杀手 Lv.{level} {name}！评级：{rank}（失误 {mistakes} 次）。你也来挑战吧！'
  }
};
