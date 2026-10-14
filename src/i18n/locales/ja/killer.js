/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: 'パズルの種類',
    classic: 'スタンダード',
    killer: 'キラー',
    classicRules: {
      title: 'ナンプレのルール',
      grid: '各行・各列・3×3のブロックに1〜9を1つずつ入れます。',
      givens: '最初から入っている数字は変えられません。',
      unique: 'どのパズルも答えは1つだけです。'
    }
  },
  killer: {
    badge: 'キラー',
    rules: {
      title: 'キラーナンプレのルール',
      sudoku: '各行・各列・3×3のブロックに1〜9が1つずつ入ります。通常のナンプレと同じです。',
      sum: '点線で囲まれたケージ内の数字を足すと、ケージ左上の小さな数字になります。',
      noRepeat: '同じケージの中に同じ数字は入りません。',
      example: '例：2マスのケージに「3」とあれば、その2マスは1と2です。',
      start: 'はじめる'
    },
    stats: {
      title: 'キラー',
    },
    shareText: '🧩 ナンプレ キラー Lv.{level} {name}を[{time}]でクリア！ ランク: {rank} (ミス {mistakes}回)。あなたも挑戦してみよう！'
  }
};
