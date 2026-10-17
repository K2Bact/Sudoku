/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: 'Tipo di schema',
    classic: 'Standard',
    killer: 'Killer',
    classicRules: {
      title: 'Regole del sudoku',
      grid: 'Riempi ogni riga, colonna e blocco 3×3 con i numeri da 1 a 9, una volta ciascuno.',
      givens: 'I numeri dati all’inizio non si possono cambiare.',
      unique: 'Ogni schema ha una sola soluzione.'
    }
  },
  killer: {
    badge: 'KILLER',
    rules: {
      title: 'Regole del Sudoku Killer',
      sudoku: 'Ogni riga, colonna e blocco 3×3 contiene i numeri da 1 a 9 una sola volta, come nel sudoku normale.',
      sum: 'La somma dei numeri di ogni gabbia tratteggiata è il numero piccolo nel suo angolo in alto a sinistra.',
      noRepeat: 'Un numero non può ripetersi nella stessa gabbia.',
      example: 'Esempio: una gabbia di due caselle con il 3 contiene 1 e 2.',
      start: 'Inizia'
    },
    stats: {
      title: 'Killer',
    },
    shareText: '🧩 Ho risolto Sudoku Killer Lv.{level} {name} in [{time}]! Valutazione: {rank} (errori: {mistakes}). Riesci a fare meglio?'
  }
};
