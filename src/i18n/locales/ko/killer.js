/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: '퍼즐 종류',
    classic: '표준',
    killer: '킬러',
    comingSoon: '킬러에서는 아직 개발 중이에요.',
    classicRules: {
      title: '스도쿠 규칙',
      grid: '가로줄, 세로줄, 3×3 상자마다 1부터 9까지 한 번씩 넣어요.',
      givens: '처음부터 있던 숫자는 바꿀 수 없어요.',
      unique: '모든 퍼즐은 답이 하나뿐이에요.'
    }
  },
  killer: {
    badge: '킬러',
    rules: {
      title: '킬러 스도쿠 규칙',
      sudoku: '가로줄, 세로줄, 3×3 상자마다 1부터 9까지 한 번씩 — 보통 스도쿠와 같아요.',
      sum: '점선으로 묶인 칸들(묶음)의 숫자를 모두 더하면, 묶음 왼쪽 위의 작은 숫자가 돼요.',
      noRepeat: '한 묶음 안에서는 같은 숫자를 두 번 쓸 수 없어요.',
      example: '예: 두 칸짜리 묶음에 3이 적혀 있으면, 그 두 칸은 1과 2예요.',
      start: '시작하기'
    },
    stats: {
      title: '킬러',
    },
    shareText: '🧩 Sudoku 킬러 Lv.{level} {name}를 [{time}]만에 클리어! 등급: {rank} (실수 {mistakes}회). 당신도 도전해 보세요!'
  }
};
