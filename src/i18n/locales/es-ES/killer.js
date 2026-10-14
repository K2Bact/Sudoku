/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: 'Tipo de puzle',
    classic: 'Estándar',
    killer: 'Killer',
    classicRules: {
      title: 'Reglas del sudoku',
      grid: 'Rellena cada fila, columna y caja de 3×3 con los números del 1 al 9, una vez cada uno.',
      givens: 'Los números dados al principio no se pueden cambiar.',
      unique: 'Cada puzle tiene una única solución.'
    }
  },
  killer: {
    badge: 'KILLER',
    rules: {
      title: 'Reglas del Sudoku Killer',
      sudoku: 'Cada fila, columna y caja de 3×3 contiene del 1 al 9 una sola vez, igual que en el sudoku normal.',
      sum: 'Los números de cada jaula punteada suman la cifra pequeña de su esquina superior izquierda.',
      noRepeat: 'Un número no puede repetirse dentro de la misma jaula.',
      example: 'Ejemplo: una jaula de dos casillas marcada con 3 debe contener 1 y 2.',
      start: 'Empezar'
    },
    stats: {
      title: 'Killer',
    },
    shareText: '🧩 ¡He completado Sudoku Killer Lv.{level} {name} en [{time}]! Rango: {rank} (Fallos: {mistakes}). ¿Te atreves a superarlo?'
  }
};
