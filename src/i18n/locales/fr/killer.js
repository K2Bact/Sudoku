/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: 'Type de grille',
    classic: 'Standard',
    killer: 'Killer',
    classicRules: {
      title: 'Règles du sudoku',
      grid: 'Remplissez chaque ligne, colonne et bloc 3×3 avec les chiffres de 1 à 9, une seule fois chacun.',
      givens: 'Les chiffres donnés au départ ne peuvent pas être modifiés.',
      unique: 'Chaque grille a une seule solution.'
    }
  },
  killer: {
    badge: 'KILLER',
    rules: {
      title: 'Règles du Sudoku Killer',
      sudoku: 'Chaque ligne, colonne et bloc 3×3 contient les chiffres de 1 à 9 une seule fois, comme au sudoku habituel.',
      sum: 'Les chiffres de chaque cage en pointillés ont pour somme la valeur indiquée dans son coin supérieur gauche.',
      noRepeat: 'Un chiffre ne peut pas apparaître deux fois dans la même cage.',
      example: 'Exemple : une cage de deux cases marquée 3 contient forcément 1 et 2.',
      start: 'Commencer'
    },
    stats: {
      title: 'Killer',
    },
    shareText: '🧩 Sudoku Killer Lv.{level} {name} résolu en [{time}] ! Rang : {rank} (erreurs : {mistakes}). Saurez-vous faire mieux ?'
  }
};
