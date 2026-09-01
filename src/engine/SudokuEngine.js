/**
 * SudokuEngine.js
 * Backtracking solver, generator, and puzzle logic for 5 difficulty levels.
 */

// Helper to clone 9x9 grid
export function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

// Create empty 9x9 grid
export function createEmptyGrid() {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

// Check if placing num at grid[row][col] is valid
export function isValidPlacement(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    // Check row
    if (grid[row][i] === num && i !== col) return false;
    // Check column
    if (grid[i][col] === num && i !== row) return false;
    // Check 3x3 box
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (grid[boxRow][boxCol] === num && (boxRow !== row || boxCol !== col)) return false;
  }
  return true;
}

// Deterministic Pseudo-Random Number Generator (Mulberry32)
export function createPRNG(seed) {
  let s = typeof seed === 'string'
    ? seed.split('').reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0)
    : (Number(seed) || 123456789);
  return function() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Shuffle array helper with optional deterministic RNG
export function shuffle(array, rng = Math.random) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Find empty cell with fewest legal candidates (MRV heuristic - 50x speedup)
function findBestEmptyCell(grid) {
  let minCount = 10;
  let best = null;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        let count = 0;
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, r, c, num)) count++;
        }
        if (count < minCount) {
          minCount = count;
          best = { r, c, count };
          if (count <= 1) return best; // Immediate Naked Single prune
        }
      }
    }
  }
  return best;
}

// Solve Sudoku grid (fills grid in-place, returns true if solvable)
export function solveSudoku(grid, isRandom = false, rng = Math.random) {
  const best = findBestEmptyCell(grid);
  if (!best) return true; // Solved

  const { r, c } = best;
  const nums = isRandom ? shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const num of nums) {
    if (isValidPlacement(grid, r, c, num)) {
      grid[r][c] = num;
      if (solveSudoku(grid, isRandom, rng)) return true;
      grid[r][c] = 0;
    }
  }
  return false;
}

// Count number of solutions for a grid (up to 2 to verify uniqueness)
export function countSolutions(grid, limit = 2) {
  let count = 0;

  function backtrack(g) {
    const best = findBestEmptyCell(g);
    if (!best) {
      count++;
      return;
    }
    const { r, c } = best;
    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(g, r, c, num)) {
        g[r][c] = num;
        backtrack(g);
        g[r][c] = 0;
        if (count >= limit) return;
      }
    }
  }

  backtrack(cloneGrid(grid));
  return count;
}

// Generate a complete solved 9x9 grid with optional deterministic RNG
export function generateFullSolution(rng = Math.random) {
  const grid = createEmptyGrid();
  const firstRow = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
  for (let c = 0; c < 9; c++) {
    grid[0][c] = firstRow[c];
  }
  solveSudoku(grid, true, rng);
  return grid;
}

// Target clues and tailored countdown time limits per difficulty level (1~5)
export const DIFFICULTY_CONFIG = {
  1: { name: 'Very Easy', level: 1, clues: 50, label: 'Level 1', timeLimitSeconds: 240, timeLimitMinutes: 4 },
  2: { name: 'Easy', level: 2, clues: 42, label: 'Level 2', timeLimitSeconds: 360, timeLimitMinutes: 6 },
  3: { name: 'Medium', level: 3, clues: 34, label: 'Level 3', timeLimitSeconds: 480, timeLimitMinutes: 8 },
  4: { name: 'Hard', level: 4, clues: 28, label: 'Level 4', timeLimitSeconds: 720, timeLimitMinutes: 12 },
  5: { name: 'Expert', level: 5, clues: 24, label: 'Level 5', timeLimitSeconds: 1080, timeLimitMinutes: 18 },
};

// Generate puzzle with guaranteed unique solution for difficulty level (1-5) and optional deterministic seed
export function generatePuzzle(level = 3, seed = null) {
  const rng = seed ? createPRNG(seed) : Math.random;
  const solution = generateFullSolution(rng);
  const puzzle = cloneGrid(solution);
  
  const config = DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG[3];
  const targetClues = config.clues;
  
  // All 81 cell coordinates
  const positions = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions, rng);
  
  let currentClues = 81;
  
  for (const [r, c] of shuffledPositions) {
    if (currentClues <= targetClues) break;

    const temp = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check if puzzle still has a unique solution
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[r][c] = temp; // Restore if multiple solutions exist
    } else {
      currentClues--;
    }
  }

  return {
    solution,
    board: puzzle,
    puzzle: puzzle,
    initialGrid: cloneGrid(puzzle),
    level: config.level,
    difficultyName: config.name,
    seed: seed || null
  };
}

// Find a smart hint (1st: user selected cell, 2nd: corrects wrong entries, 3rd: reveals empty cell)
export function getSmartHint(currentBoard, solutionBoard, selectedCell = null) {
  if (!currentBoard || !solutionBoard || !Array.isArray(currentBoard) || !Array.isArray(solutionBoard) || solutionBoard.length < 9) {
    return null;
  }

  // 1. Highest Priority: If the user currently selected an empty or wrong cell, hint that specific cell!
  if (selectedCell && Array.isArray(selectedCell) && selectedCell.length === 2) {
    const [sr, sc] = selectedCell;
    if (sr >= 0 && sr < 9 && sc >= 0 && sc < 9) {
      if (currentBoard[sr][sc] === 0 || currentBoard[sr][sc] !== solutionBoard[sr][sc]) {
        return { row: sr, col: sc, num: solutionBoard[sr][sc], isSelectedCell: true };
      }
    }
  }

  // 2. Second Priority: Find any cell that currently contains a wrong number
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = currentBoard[r][c];
      if (val !== 0 && val !== solutionBoard[r][c]) {
        return { row: r, col: c, num: solutionBoard[r][c], isCorrection: true };
      }
    }
  }

  // 3. Third Priority: Find empty cells
  const emptyCells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentBoard[r][c] === 0) {
        emptyCells.push({ row: r, col: c, num: solutionBoard[r][c] });
      }
    }
  }
  if (emptyCells.length === 0) return null;

  // Select an empty cell to hint
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Calculate remaining counts for numbers 1..9 (clamped to min 0)
export function calculateRemainingCounts(board) {
  const counts = { 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 9, 7: 9, 8: 9, 9: 9 };
  if (!board || !Array.isArray(board)) return counts;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r]?.[c];
      if (val >= 1 && val <= 9) {
        counts[val]--;
      }
    }
  }
  for (let i = 1; i <= 9; i++) {
    counts[i] = Math.max(0, counts[i]);
  }
  return counts;
}

// Find the next incomplete number (1..9) cyclically starting from currentNum
export function findNextIncompleteNumber(currentNum, remainingCounts) {
  if (!remainingCounts) return null;
  const start = currentNum || 1;
  for (let i = 1; i <= 9; i++) {
    const candidate = ((start - 1 + i) % 9) + 1;
    if (remainingCounts[candidate] > 0) {
      return candidate;
    }
  }
  return null; // All completed
}

// Automatically remove entered number from notes in same row, column, and 3x3 box
export function autoRemoveNotes(notesGrid, row, col, num) {
  const updatedNotes = notesGrid.map(r => r.map(cellNotes => [...cellNotes]));
  
  for (let i = 0; i < 9; i++) {
    // Clear in row
    updatedNotes[row][i] = updatedNotes[row][i].filter(n => n !== num);
    // Clear in col
    updatedNotes[i][col] = updatedNotes[i][col].filter(n => n !== num);
    // Clear in 3x3 box
    const bRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const bCol = 3 * Math.floor(col / 3) + (i % 3);
    updatedNotes[bRow][bCol] = updatedNotes[bRow][bCol].filter(n => n !== num);
  }
  
  return updatedNotes;
}
