import { generatePuzzle, getSmartHint } from '../../../src/engine/SudokuEngine.js';
import { loadWallet, consumeHint, addHints, claimDailyAttendance } from '../../../src/utils/wallet.js';

// Polyfill localStorage for Node test runner
const storageMap = new Map();
globalThis.localStorage = {
  getItem: (k) => storageMap.get(k) || null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear()
};

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

console.log('======================================================');
console.log('🧪 Testing Wallet State, Hint Engine & Reward Balance');
console.log('======================================================\n');

// 1. Fresh Install Wallet State
runTest('Fresh Install: Wallet initializes with exactly 3 initial welcome hints', () => {
  localStorage.clear();
  const wallet = loadWallet();
  if (wallet.hints !== 3) throw new Error(`Expected initial hints to be 3, got ${wallet.hints}`);
  if (wallet.streakDays !== 0) throw new Error(`Expected streakDays to be 0, got ${wallet.streakDays}`);
});

// 2. Hint Consumption & Balance Protection
runTest('Hint Consumption: Consuming hint deducts balance and protects zero-floor', () => {
  localStorage.clear();
  const success1 = consumeHint();
  if (!success1) throw new Error('Failed to consume first hint');
  if (loadWallet().hints !== 2) throw new Error(`Expected 2 hints, got ${loadWallet().hints}`);

  const success2 = consumeHint();
  const success3 = consumeHint();
  if (!success2 || !success3) throw new Error('Failed to consume remaining initial hints');
  if (loadWallet().hints !== 0) throw new Error(`Expected 0 hints, got ${loadWallet().hints}`);

  // When balance is 0, consumeHint MUST return false
  const success4 = consumeHint();
  if (success4) throw new Error('consumeHint succeeded even with 0 balance');
  if (loadWallet().hints < 0) throw new Error(`Balance went below 0: ${loadWallet().hints}`);
});

// 3. Smart Hint Calculation & Placement
runTest('Smart Hint Engine: Returns valid solution number for selected empty/wrong cell', () => {
  const puzzle = generatePuzzle(3);
  const solution = puzzle.solution;
  if (!solution || !Array.isArray(solution)) throw new Error('Failed to obtain valid puzzle solution');

  // Empty board cell hint
  const hint1 = getSmartHint(puzzle.board || puzzle.puzzle, solution, null);
  if (!hint1) throw new Error('getSmartHint returned null on valid puzzle');
  if (hint1.num !== solution[hint1.row][hint1.col]) {
    throw new Error(`Hint number ${hint1.num} does not match solution ${solution[hint1.row][hint1.col]}`);
  }

  // User selected cell hint
  const grid = puzzle.board || puzzle.puzzle;
  let emptyR = -1, emptyC = -1;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        emptyR = r; emptyC = c; break;
      }
    }
    if (emptyR !== -1) break;
  }

  const hint2 = getSmartHint(grid, solution, [emptyR, emptyC]);
  if (!hint2) throw new Error('getSmartHint returned null for selected empty cell');
  if (hint2.row !== emptyR || hint2.col !== emptyC) {
    throw new Error(`Hint did not prioritize user selected cell [${emptyR}, ${emptyC}]`);
  }
  if (hint2.num !== solution[emptyR][emptyC]) {
    throw new Error('Hint number incorrect for selected cell');
  }
});

// 4. Rewarded Ad Hint Addition
runTest('Ad Reward: addHints(+1) increments balance and registers transaction', () => {
  localStorage.clear();
  consumeHint(); consumeHint(); consumeHint();
  if (loadWallet().hints !== 0) throw new Error('Wallet not drained');

  const newBalance = addHints(1, 'ad_reward');
  if (newBalance !== 1) throw new Error(`Expected balance 1, got ${newBalance}`);
  if (loadWallet().totalAdsWatched !== 1) throw new Error('totalAdsWatched not incremented');

  const canConsume = consumeHint();
  if (!canConsume) throw new Error('Failed to consume rewarded hint');
  if (loadWallet().hints !== 0) throw new Error('Balance mismatch after rewarded hint consumption');
});

// 5. Daily Attendance Hint Claim
runTest('Daily Attendance: Claiming attendance grants bonus hint and sets streak', () => {
  localStorage.clear();
  const res1 = claimDailyAttendance();
  if (!res1 || !res1.claimed) throw new Error('Daily attendance claim failed');
  if (res1.streakDays !== 1) throw new Error(`Expected streak 1, got ${res1.streakDays}`);
  if (loadWallet().hints !== 4) throw new Error(`Expected 4 hints (3 + 1), got ${loadWallet().hints}`);

  const res2 = claimDailyAttendance();
  if (res2 !== null) throw new Error('Duplicate claim allowed on same day');
});

console.log('\n🎉 [PASS] Wallet, Hint Engine & Attendance Streak 100% Verified!\n');
