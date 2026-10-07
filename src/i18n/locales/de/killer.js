/**
 * Killer Sudoku (2026-10-01): the puzzle switch, the rules, the record.
 */
export const killer = {
  variants: {
    switchLabel: 'Rätseltyp',
    classic: 'Standard',
    killer: 'Killer',
    comingSoon: 'Für Killer noch in Entwicklung.',
    classicRules: {
      title: 'Sudoku-Regeln',
      grid: 'Fülle jede Zeile, Spalte und jeden 3×3-Block mit den Zahlen 1 bis 9, jede genau einmal.',
      givens: 'Die vorgegebenen Zahlen lassen sich nicht ändern.',
      unique: 'Jedes Rätsel hat genau eine Lösung.'
    }
  },
  killer: {
    badge: 'KILLER',
    rules: {
      title: 'Killer-Sudoku-Regeln',
      sudoku: 'Jede Zeile, Spalte und jeder 3×3-Block enthält 1 bis 9 genau einmal – wie beim normalen Sudoku.',
      sum: 'Die Ziffern in jedem gestrichelten Käfig ergeben zusammen die kleine Zahl in seiner oberen linken Ecke.',
      noRepeat: 'In einem Käfig darf keine Ziffer doppelt vorkommen.',
      example: 'Beispiel: Ein Käfig aus zwei Feldern mit der 3 enthält 1 und 2.',
      start: 'Starten'
    },
    stats: {
      title: 'Killer',
    },
    shareText: '🧩 Sudoku Killer Lv.{level} {name} in [{time}] gelöst! Rang: {rank} ({mistakes} Fehler). Schaffst du es schneller?'
  }
};
