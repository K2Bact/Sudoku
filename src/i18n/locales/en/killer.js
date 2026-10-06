/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: 'Puzzle type',
    classic: 'Standard',
    killer: 'Killer',
    comingSoon: 'Not in Killer yet — still in development.',
    classicRules: {
      title: 'Sudoku rules',
      grid: 'Fill every row, column and 3×3 box with 1 to 9, each digit once.',
      givens: 'The numbers given at the start cannot be changed.',
      unique: 'Every puzzle has exactly one solution.'
    }
  },
  killer: {
    badge: 'KILLER',
    rules: {
      title: 'Killer Sudoku rules',
      sudoku: 'Every row, column and 3×3 box holds 1 to 9 once — just like regular sudoku.',
      sum: 'The digits in each dashed cage add up to the small number in its top-left corner.',
      noRepeat: 'A digit cannot appear twice in the same cage.',
      example: 'Example: a two-cell cage marked 3 must hold 1 and 2.',
      start: 'Start'
    },
    stats: {
      title: 'Killer',
      played: 'Played {count}',
      won: 'Won {count}'
    },
    shareText: '🧩 Sudoku Killer Lv.{level} {name} cleared in [{time}]! (mistakes: {mistakes}). Can you beat it?'
  }
};
