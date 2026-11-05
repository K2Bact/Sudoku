import { generatePuzzle, getSmartHint } from '../../../src/engine/SudokuEngine.js';
import { loadWallet, consumeHint, spendHint, addHints, claimDailyAttendance, subscribeToWallet } from '../../../src/utils/wallet.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'src');

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

// The clock on the phone, set to noon of a given local day while fn runs.
// getTodayDateKey() reads `new Date()` at the call, so swapping Date is enough.
function onDay(key, fn) {
  const RealDate = Date;
  const fixed = new RealDate(`${key}T12:00:00`).getTime();
  globalThis.Date = class extends RealDate {
    constructor(...args) { if (args.length) super(...args); else super(fixed); }
    static now() { return fixed; }
  };
  try { return fn(); } finally { globalThis.Date = RealDate; }
}

// D46 (2026-10-29, emulator): with the clock moved back a day the claim read as
// a missed day — another hint and the streak back to 1, again on every move.
runTest('D46: moving the clock back pays nothing and keeps the streak', () => {
  localStorage.clear();
  onDay('2026-10-30', claimDailyAttendance);
  onDay('2026-10-31', claimDailyAttendance);
  const before = loadWallet();
  if (before.streakDays !== 2 || before.hints !== 5) throw new Error(`setup: streak ${before.streakDays}, hints ${before.hints}`);

  const back = onDay('2026-10-30', claimDailyAttendance);
  const after = loadWallet();
  if (back !== null || after.hints !== 5 || after.streakDays !== 2) {
    throw new Error(`Moving the clock back paid again: returned ${JSON.stringify(back)}, hints ${after.hints}, streak ${after.streakDays}`);
  }
  if (after.lastDailyClaimDate !== '2026-10-31') throw new Error(`Moving the clock back rewrote the last claim to ${after.lastDailyClaimDate}`);
  if (onDay('2026-10-31', claimDailyAttendance) !== null) throw new Error('Moving the clock back and forward paid the same day twice');

  const next = onDay('2026-11-01', claimDailyAttendance);
  if (!next || next.streakDays !== 3) throw new Error(`The day after should continue the streak to 3, got ${JSON.stringify(next)}`);
});

runTest('D46: a claim more than a week ahead is a wrong clock put right — moved to today, nothing paid', () => {
  localStorage.clear();
  onDay('2026-11-08', claimDailyAttendance);
  const fixed = onDay('2026-10-31', claimDailyAttendance);
  const w = loadWallet();
  if (fixed !== null || w.hints !== 4 || w.streakDays !== 1) {
    throw new Error(`Putting a wrong clock right paid or reset: returned ${JSON.stringify(fixed)}, hints ${w.hints}, streak ${w.streakDays}`);
  }
  if (w.lastDailyClaimDate !== '2026-10-31') {
    throw new Error(`A wrong clock put right left the claim on ${w.lastDailyClaimDate} — attendance would wait for that day`);
  }
  const next = onDay('2026-11-01', claimDailyAttendance);
  if (!next || next.streakDays !== 2) throw new Error(`The day after a wrong clock was put right should pay, got ${JSON.stringify(next)}`);

  // Exactly a week back is still the strict case: nothing paid, the claim stays.
  localStorage.clear();
  onDay('2026-11-07', claimDailyAttendance);
  onDay('2026-10-31', claimDailyAttendance);
  if (loadWallet().lastDailyClaimDate !== '2026-11-07') {
    throw new Error(`Seven days back already counted as a wrong clock (claim moved to ${loadWallet().lastDailyClaimDate})`);
  }
});

// 6. The exact sequence a player reported: home said 9, the game said 10.
//    This runs before the broader broadcast test on purpose. runTest rethrows,
//    so whichever case fails first is the only one that ever reports; putting
//    the narrow reproduction second meant no mutation could ever prove it.
runTest('Reported bug: the home screen count must not lag a claim made after mount', () => {
  localStorage.clear();

  // useSudokuGame reads the wallet once, in a useState initialiser, and holds
  // the number as React state. This variable stands in for that state.
  let onScreen = loadWallet().hints;
  const stop = subscribeToWallet((hints) => { onScreen = hints; });

  // useAppModals then claims attendance in a mount effect, which runs after
  // that initialiser. Nothing between the two hooks passes the new balance
  // along, so before the wallet announced its own changes the screen kept the
  // stale number until an unrelated action happened to refresh it.
  claimDailyAttendance();

  const inWallet = loadWallet().hints;
  if (onScreen !== inWallet) {
    throw new Error(
      `The screen shows ${onScreen} while the wallet holds ${inWallet}. The displayed count is a hand-refreshed copy again — the daily attendance claim happens after useSudokuGame reads the wallet, so the copy has to follow subscribeToWallet rather than wait for the next manual refresh.`
    );
  }
  stop();
});

// 7. Every balance change reaches every subscriber, and unsubscribe stops it
runTest('Broadcast: every balance change reaches subscribers, and unsubscribe stops it', () => {
  localStorage.clear();
  const seen = [];
  const stop = subscribeToWallet((hints) => seen.push(hints));

  addHints(2, 'reward');          // 3 -> 5
  consumeHint();                  // 5 -> 4
  claimDailyAttendance();         // 4 -> 5

  const expected = [5, 4, 5];
  if (seen.join(",") !== expected.join(",")) {
    throw new Error(`Subscriber saw [${seen}] but the balance went [${expected}]`);
  }
  if (seen[seen.length - 1] !== loadWallet().hints) {
    throw new Error(`Subscriber ended on ${seen[seen.length - 1]}, wallet holds ${loadWallet().hints}`);
  }

  stop();
  addHints(1, 'reward');
  if (seen.length !== expected.length) throw new Error('Unsubscribe did not stop the notifications');

  // A listener that throws must not silence the others.
  const survivors = [];
  // The listener below throws on purpose; wallet.js logs it. Muted so a green
  // pipeline stays free of stack traces that are not failures.
  const realError = console.error;
  console.error = () => {};
  const stopA = subscribeToWallet(() => { throw new Error('deliberately broken listener'); });
  const stopB = subscribeToWallet((h) => survivors.push(h));
  addHints(1, 'reward');
  console.error = realError;
  stopA(); stopB();
  if (survivors.length !== 1) throw new Error('A throwing listener stopped the others from being told');
});

// 8. The subscription itself, so deleting it fails here instead of on a phone
runTest('Wiring: useSudokuGame subscribes to the wallet rather than only copying it', () => {
  const hook = fs.readFileSync(path.join(SRC, 'hooks', 'useSudokuGame.js'), 'utf8');

  // Strip comments before looking for the wiring. Reading the file as raw text
  // means a commented-out line still matches — this check passed against
  // `// useEffect(() => subscribeToWallet(...))` until that was caught by
  // deliberately breaking the fix and watching the gate stay green.
  const live = hook
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  if (!/subscribeToWallet/.test(live)) {
    throw new Error(
      'useSudokuGame no longer subscribes to the wallet. hintsRemaining is then a copy refreshed by hand at each call site, and any writer that forgets leaves a stale count on the home screen — which is exactly how the attendance claim and the battle mission reward got missed.'
    );
  }
  if (!/useEffect\(\s*\(\)\s*=>\s*subscribeToWallet/.test(live)) {
    throw new Error(
      'useSudokuGame imports subscribeToWallet but does not register it in a useEffect that returns the unsubscribe function.'
    );
  }
});

// 9. A full storage is not an empty wallet (D30, Flip5 2026-10-22). Both used to be one
//    `false`, and the hint button answered both with an ad offer — to a player holding hints,
//    for a reward the phone could not store either.
runTest('D30: spendHint tells "none" from "not_saved"', () => {
  localStorage.clear();
  const start = loadWallet().hints;
  const realSet = globalThis.localStorage.setItem;
  globalThis.localStorage.setItem = (k, v) => {
    if (k === 'suidoku_user_wallet_v1') throw new Error('QuotaExceededError');
    return realSet(k, v);
  };
  try {
    const r = spendHint();
    if (r !== 'not_saved') throw new Error(`with ${start} hints and a storage that refuses the write, spendHint said "${r}" — the button would offer an ad`);
    if (consumeHint() !== false) throw new Error('consumeHint reported a spend the storage refused');
  } finally {
    globalThis.localStorage.setItem = realSet;
  }
  if (loadWallet().hints !== start) throw new Error(`a refused spend changed the stored balance ${start} -> ${loadWallet().hints}`);
  if (spendHint() !== 'spent') throw new Error('with storage working again, a hint was not spent');
  while (loadWallet().hints > 0) spendHint();
  const empty = spendHint();
  if (empty !== 'none') throw new Error(`with 0 hints spendHint said "${empty}", not "none"`);
});

runTest('D30 wiring: the hint button and the ad reward say storage is full instead of offering an ad', () => {
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const keypad = strip(fs.readFileSync(path.join(SRC, 'hooks', 'useKeypadActions.js'), 'utf8'));
  const body = keypad.slice(keypad.indexOf('const handleGetHint'));
  const branch = body.indexOf("=== 'not_saved'");
  const toast = body.indexOf("t('modals.hintReward.notSaved')");
  const offer = body.indexOf('setShowHintRewardModal(true)');
  if (branch < 0 || toast < branch || offer < 0 || toast > offer || !/return;/.test(body.slice(toast, offer))) {
    throw new Error('useKeypadActions.handleGetHint does not answer a refused spend with the notSaved toast and return before the ad offer');
  }
  const reward = strip(fs.readFileSync(path.join(SRC, 'hooks', 'useRewardHint.js'), 'utf8'));
  const guard = reward.search(/if \(newCount <= before\)/);
  const handOn = reward.indexOf('handleGetHint()');
  const counted = reward.indexOf('setAdHintsUsedThisGame(');
  if (guard < 0 || handOn < guard || counted < guard || !reward.slice(guard, handOn).includes("t('modals.hintReward.notSaved')")) {
    throw new Error('useRewardHint hands a reward the storage refused on to the hint button (or counts it toward the two a game)');
  }
});

// D45 (2026-10-29, emulator): attendance was claimed only at app start. It is now
// claimed on Home and on the way back to the app, through one function that also
// checks the achievements and — on the way back — asks for a backup, because the
// backup useCloudAutoSync starts on the same event looks before the claim.
// Imported here, after the localStorage stand-in exists.
const { claimAttendanceNow } = await import('../../../src/utils/attendanceClaim.js');
const { cloudSyncService } = await import('../../../src/services/cloudSyncService.js');
let syncCalls = 0;
const realSync = cloudSyncService.syncIfNeeded;
cloudSyncService.syncIfNeeded = async () => { syncCalls += 1; return { skipped: 'test' }; };

runTest('D45: a claim on the way back asks for one backup; the same day claims nothing more', () => {
  localStorage.clear();
  syncCalls = 0;
  const back = onDay('2026-10-30', () => claimAttendanceNow({ sync: true }));
  if (!back || back.streakDays !== 1 || syncCalls !== 1) {
    throw new Error(`A claim on the way back should pay and back up once: ${JSON.stringify(back)}, backups asked ${syncCalls}`);
  }
  const again = onDay('2026-10-30', () => claimAttendanceNow({ sync: true }));
  if (again !== null || syncCalls !== 1) throw new Error(`The same day claimed again or backed up again: ${JSON.stringify(again)}, backups asked ${syncCalls}`);
  const onHome = onDay('2026-10-31', () => claimAttendanceNow());
  if (!onHome || onHome.streakDays !== 2 || syncCalls !== 1) {
    throw new Error(`A claim at start or on arriving Home pays without a backup of its own: ${JSON.stringify(onHome)}, backups asked ${syncCalls}`);
  }
});
cloudSyncService.syncIfNeeded = realSync;

runTest('D45 wiring: Home claims on arrival and on the way back, not in a game', () => {
  const src = fs.readFileSync(path.join(SRC, 'hooks', 'useAppModals.js'), 'utf8');
  if (!/if \(activeScreen !== 'home'\) return;\s*const reward = claimAttendanceNow\(\);/.test(src)) {
    throw new Error('useAppModals does not claim when Home is reached');
  }
  if (!/visibilityState !== 'visible' \|\| screenRef\.current !== 'home'\) return;\s*const reward = claimAttendanceNow\(\{ sync: true \}\);/.test(src)) {
    throw new Error('useAppModals does not claim on the way back to the app on Home (with a backup)');
  }
  if (!/useAppModals\(isVictory, activeScreen\)/.test(fs.readFileSync(path.join(SRC, 'App.jsx'), 'utf8'))) {
    throw new Error('App does not hand useAppModals the screen, so Home cannot be told from a game');
  }
});

console.log('\n🎉 [PASS] Wallet, Hint Engine & Attendance Streak 100% Verified!\n');
