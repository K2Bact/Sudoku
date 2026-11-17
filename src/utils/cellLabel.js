/**
 * cellLabel.js — what a screen reader says for one board cell (D47, 2026-11-06).
 *
 * The 81 cells are buttons. With no name, TalkBack read an empty cell as "button" — 39 of them on a
 * Lv.2 board, 27 on a killer — and a filled one as its digit alone, with no place on the board
 * (third stability round, the accessibility tree Chrome computes). Now each says where it is and
 * what is in it: given or entered, or the notes, or empty — and in a killer, its cage's sum, on every
 * cell of the cage (the drawn sum sits on one corner only).
 *
 * The words are each language's own (board.cell*); a number the player entered is just the number.
 */
export function cellLabel(t, { r, c, value, given, notes, cageSum }) {
  let content;
  if (value) content = given ? t('board.cellGiven', { num: value }) : String(value);
  else if (notes && notes.length) content = t('board.cellNotes', { list: [...notes].sort((a, b) => a - b).join(' ') });
  else content = t('board.cellEmpty');
  const vars = { row: r + 1, col: c + 1, content, sum: cageSum };
  return t(cageSum === undefined || cageSum === null ? 'board.cellAria' : 'board.cellAriaCage', vars);
}
