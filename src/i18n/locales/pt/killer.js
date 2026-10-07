/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: 'Tipo de quebra-cabeça',
    classic: 'Padrão',
    killer: 'Killer',
    comingSoon: 'Ainda em desenvolvimento no Killer.',
    classicRules: {
      title: 'Regras do sudoku',
      grid: 'Preencha cada linha, coluna e caixa 3×3 com os números de 1 a 9, uma vez cada.',
      givens: 'Os números dados no início não podem ser alterados.',
      unique: 'Cada quebra-cabeça tem uma única solução.'
    }
  },
  killer: {
    badge: 'KILLER',
    rules: {
      title: 'Regras do Sudoku Killer',
      sudoku: 'Cada linha, coluna e caixa 3×3 tem os números de 1 a 9 uma única vez, como no sudoku comum.',
      sum: 'Os números de cada gaiola pontilhada somam o número pequeno no canto superior esquerdo dela.',
      noRepeat: 'Um número não pode se repetir na mesma gaiola.',
      example: 'Exemplo: uma gaiola de duas casas marcada com 3 tem 1 e 2.',
      start: 'Começar'
    },
    stats: {
      title: 'Killer',
    },
    shareText: '🧩 Resolvi o Sudoku Killer Lv.{level} {name} em [{time}]! Classificação: {rank} (erros: {mistakes}). Consegue fazer melhor?'
  }
};
