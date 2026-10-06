/**
 * cageLayout.js — where a killer's cages sit, for drawing them.
 *
 * For every cell, the index of its cage; and the cells that carry a sum — each
 * cage's top-left cell, the lowest index, which is where every killer puts it.
 */
export function cageLayout(cages) {
  const cageOf = new Int16Array(81).fill(-1);
  const sumAt = new Map();
  cages.forEach((cage, k) => {
    cage.cells.forEach((cell) => { cageOf[cell] = k; });
    sumAt.set(Math.min(...cage.cells), cage.sum);
  });
  return { cageOf, sumAt };
}
