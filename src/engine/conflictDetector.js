/**
 * conflictDetector.js
 * Pure utility function to diagnose Sudoku rule violations across Box, Row, and Column simultaneously.
 * In a killer (`cages` given) also the cage: a digit it already holds, or a sum it can no longer make.
 */

export function detectSudokuConflict(board, r, c, num, newMistakes, isUnlimited = false, t = null, cages = null) {
  const tr = typeof t === 'function' ? t : (k, p = {}) => {
    if (k === 'conflicts.timeAttackSuffix') return `(Mistake ${p.count} | +10s)`;
    if (k === 'conflicts.classicSuffix') return `(Mistakes ${p.count}/3)`;
    if (k === 'conflicts.boxDuplicate') return `⚠️ Number ${p.num} already exists in [Box ${p.box}]! ${p.suffix}`;
    if (k === 'conflicts.rowDuplicate') return `⚠️ Number ${p.num} already exists in row ${p.row}! ${p.suffix}`;
    if (k === 'conflicts.colDuplicate') return `⚠️ Number ${p.num} already exists in column ${p.col}! ${p.suffix}`;
    if (k === 'conflicts.multipleDuplicates') return `⚠️ Number ${p.num} already exists in the same box/row/col! ${p.suffix}`;
    if (k === 'conflicts.notSolution') return `⚠️ Number ${p.num} is not the solution for this cell! ${p.suffix}`;
    if (k === 'conflicts.cageDuplicate') return `⚠️ Number ${p.num} is already in this cage! ${p.suffix}`;
    if (k === 'conflicts.cageSum') return `⚠️ This cage no longer adds up to ${p.sum}! ${p.suffix}`;
    return k;
  };

  const mistakeSuffix = isUnlimited
    ? tr('conflicts.timeAttackSuffix', { count: newMistakes })
    : tr('conflicts.classicSuffix', { count: newMistakes });

  const conflictingCells = [];
  const conflictingKeys = new Set();

  const addConflict = (row, col) => {
    const key = `${row}-${col}`;
    if (!conflictingKeys.has(key)) {
      conflictingKeys.add(key);
      conflictingCells.push([row, col]);
    }
  };

  let hasBoxConflict = false;
  let boxName = '';
  let hasRowConflict = false;
  let hasColConflict = false;

  // 1. Check 3x3 Box Conflict
  const bRowStart = 3 * Math.floor(r / 3);
  const bColStart = 3 * Math.floor(c / 3);
  for (let br = bRowStart; br < bRowStart + 3; br++) {
    for (let bc = bColStart; bc < bColStart + 3; bc++) {
      if ((br !== r || bc !== c) && board[br][bc] === num) {
        addConflict(br, bc);
        hasBoxConflict = true;
        const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        boxName = tr(`conflicts.boxes.${boxIdx}`) || `${boxIdx + 1}`;
      }
    }
  }

  // 2. Check Row Conflict
  for (let ic = 0; ic < 9; ic++) {
    if (ic !== c && board[r][ic] === num) {
      addConflict(r, ic);
      hasRowConflict = true;
    }
  }

  // 3. Check Column Conflict
  for (let ir = 0; ir < 9; ir++) {
    if (ir !== r && board[ir][c] === num) {
      addConflict(ir, c);
      hasColConflict = true;
    }
  }

  // 4. Killer cage: the same digit already inside it, or a total that has gone
  //    past its sum (or, with every cell filled, missed it).
  let hasCageConflict = false;
  let brokenSum = null;
  const cage = cages?.find((k) => k.cells.includes(r * 9 + c));
  if (cage) {
    let total = 0;
    let filled = 0;
    for (const cell of cage.cells) {
      const cr = Math.floor(cell / 9);
      const cc = cell % 9;
      const v = cr === r && cc === c ? num : board[cr][cc];
      if (v) { total += v; filled++; }
      if ((cr !== r || cc !== c) && board[cr][cc] === num) {
        addConflict(cr, cc);
        hasCageConflict = true;
      }
    }
    if (total > cage.sum || (filled === cage.cells.length && total !== cage.sum)) brokenSum = cage.sum;
  }

  if (conflictingCells.length > 0) {
    let type = 'box';
    let message = '';

    const conflictCount = (hasBoxConflict ? 1 : 0) + (hasRowConflict ? 1 : 0) + (hasColConflict ? 1 : 0) + (hasCageConflict ? 1 : 0);
    if (hasCageConflict && conflictCount === 1) {
      type = 'cage';
      message = tr('conflicts.cageDuplicate', { num, suffix: mistakeSuffix });
    } else if (conflictCount > 1) {
      type = 'multiple';
      message = tr('conflicts.multipleDuplicates', { num, suffix: mistakeSuffix });
    } else if (hasBoxConflict) {
      type = 'box';
      message = tr('conflicts.boxDuplicate', { box: boxName, num, suffix: mistakeSuffix });
    } else if (hasRowConflict) {
      type = 'row';
      message = tr('conflicts.rowDuplicate', { row: r + 1, num, suffix: mistakeSuffix });
    } else {
      type = 'col';
      message = tr('conflicts.colDuplicate', { col: c + 1, num, suffix: mistakeSuffix });
    }

    return {
      type,
      num,
      targetCell: [r, c],
      conflictingCells,
      conflictingCell: conflictingCells[0],
      message
    };
  }

  if (brokenSum !== null) {
    return {
      type: 'cageSum',
      num,
      targetCell: [r, c],
      conflictingCells: cage.cells
        .filter((cell) => cell !== r * 9 + c && board[Math.floor(cell / 9)][cell % 9])
        .map((cell) => [Math.floor(cell / 9), cell % 9]),
      conflictingCell: null,
      message: tr('conflicts.cageSum', { sum: brokenSum, suffix: mistakeSuffix })
    };
  }

  // 5. Mismatch Solution Rule (Logic / Candidate mismatch)
  return {
    type: 'logic',
    num,
    targetCell: [r, c],
    conflictingCells: [],
    conflictingCell: null,
    message: tr('conflicts.notSolution', { num, suffix: mistakeSuffix })
  };
}
