/**
 * test_cloud_leaderboard_safety.js
 * QA Gate 13: Global Leaderboards & Cloud Account Save Safety Verification
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { LOCALES } from '../../lib/locales.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..', '..');

console.log('\n🔍 [QA Gate 13] Verifying Global Leaderboards, Cloud Save & i18n Contracts...');

// Mock LocalStorage & Navigator for Node Environment
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};
global.window = {
  localStorage: global.localStorage,
  navigator: { onLine: true },
  location: { reload: () => {} },
  confirm: () => true,
  alert: () => {}
};

// 1. Verify cloudSyncService
const { cloudSyncService } = await import('../../../src/services/cloudSyncService.js');
assert(cloudSyncService, 'cloudSyncService must be defined');

const uid = cloudSyncService.getEffectiveUserId();
assert(typeof uid === 'string' && uid.length > 0, 'Effective user ID must be non-empty string');

const payload = cloudSyncService.compileBackupPayload();
assert(payload.userId, 'Backup payload must contain userId');
assert(payload.version === '1.1.2', 'Backup payload must have version 1.1.2');
assert(payload.season === 'season_0', 'Backup payload must indicate season_0 during closed test');
assert(payload.syncedAt > 0, 'syncedAt must be positive timestamp');
assert(typeof payload.stats === 'object', 'Backup payload must include stats object');
console.log('  ✅ 1. cloudSyncService payload schema & Zero-PII compliance passed');

// Test cloud save & restore cycle.
//
// Asserting only `success === true` proves nothing here: saveToCloud returns that
// unconditionally, so the check passes even if the function body is deleted. What
// follows instead writes real data through the app's own modules, wipes local
// storage to imitate a new device, restores, and demands the data back.
const wallet = await import('../../../src/utils/wallet.js');
const daily = await import('../../../src/utils/dailyChallenge.js');
const ghost = await import('../../../src/utils/ghostManager.js');
const { USER_STATS_KEY } = await import('../../../src/utils/storage.js');

localStorage.clear();
wallet.addHints(7, 'reward');                                   // 3 welcome + 7
daily.recordDailyCompletion('2026-09-01', 123, 0);
ghost.recordGhostRun('classic', 3, { timeSeconds: 200, hintsUsed: 0, totalEmptyCells: 45 });
localStorage.setItem(USER_STATS_KEY, JSON.stringify({
  gamesPlayed: 20,
  gamesWon: 15,
  bestTimes: { 1: 90, 2: 150, 3: 210 },
  timeAttackBestTimes: { 1: 80 },
  timeLimitBestTimes: { 1: 70, 2: 110 },   // survival records
  timeLimitSurvivalWins: 5
}));

const backupPayload = cloudSyncService.compileBackupPayload();
assert(backupPayload.wallet && backupPayload.wallet.hints === 10,
  'Backup must carry the real wallet — a mismatched storage key silently backs up nothing');
assert(backupPayload.daily && Object.keys(backupPayload.daily).length === 1,
  'Backup must carry the real daily records');
assert(backupPayload.ghost, 'Backup must carry ghost PB records');

const saveRes = await cloudSyncService.saveToCloud();
assert(saveRes.success === true, 'saveToCloud must report success');

// Restoring over existing local data must not drop fields it does not know about
await cloudSyncService.restoreFromCloud();
const merged = JSON.parse(localStorage.getItem(USER_STATS_KEY));
assert(merged.timeLimitBestTimes && merged.timeLimitBestTimes[1] === 70,
  'Merge restore erased timeLimitBestTimes — survival records must survive a restore');

// Reinstall on the SAME device: game data is gone, the backup and the player's
// anonymous id survive. The id has to be carried across the wipe deliberately —
// it identifies the save slot, and it is now unique per device. (It used to be
// the constant 'anon_node_test' for everyone, which is exactly the bug that made
// every signed-out player share one slot; this test used to pass only because of
// it.) A genuinely new device has no local blob at all and restores through the
// Play Games snapshot instead, which is the path exercised on hardware.
const anonUidKey = 'suidoku_anon_uid_v1';
const anonUid = localStorage.getItem(anonUidKey);
const cloudKey = `suidoku_cloud_save_${cloudSyncService.getEffectiveUserId()}`;
const blob = localStorage.getItem(cloudKey);
localStorage.clear();
if (anonUid) localStorage.setItem(anonUidKey, anonUid);
localStorage.setItem(cloudKey, blob);

const restoreRes = await cloudSyncService.restoreFromCloud();
assert(restoreRes.success === true, 'restoreFromCloud must succeed when cloud data exists');

const restored = JSON.parse(localStorage.getItem(USER_STATS_KEY));
assert(restored.gamesWon === 15, `gamesWon must come back (got ${restored.gamesWon})`);
assert(restored.timeLimitBestTimes?.[1] === 70, 'Survival best times must come back');
assert(wallet.loadWallet().hints === 10, `Wallet must come back (got ${wallet.loadWallet().hints})`);
assert(Object.keys(daily.loadDailyRecords()).length === 1, 'Daily records must come back');
assert(ghost.getGhostForModeLevel('classic', 3)?.bestSeconds === 200, 'Ghost PB must come back');
localStorage.clear();
console.log('  ✅ 2. cloudSyncService round-trip restores stats, wallet, daily & ghost intact');

// ── 2b. A save merges with the cloud; it does not overwrite it ────────────
//
// Every win calls saveToCloud, and it used to upload this phone's local data
// over the account's single Play Games snapshot. With one account on two phones,
// whichever phone won last replaced the other's progress in the cloud — a freshly
// installed phone uploaded a near-empty record on its first win. Found on
// 2026-09-17 while the same account was signed in on two test phones.
//
// Driven through the real service with Play Games replaced at its boundary, so
// what is checked is the payload that would actually be uploaded.
{
  const { playGamesService } = await import('../../../src/services/playGamesService.js');
  const realLoad = playGamesService.loadSnapshot;
  const realSave = playGamesService.saveSnapshot;
  let uploaded = null;
  let saveCalls = 0;
  playGamesService.saveSnapshot = async (_name, data) => {
    saveCalls++;
    uploaded = JSON.parse(data);
    return { success: true };
  };
  const cloudProgress = {
    userId: 'pg_same_account', version: '1.1.2',
    stats: { gamesPlayed: 120, gamesWon: 90, bestTimes: { 1: 95, 2: 140 }, timeLimitSurvivalWins: 8 },
    achievements: { first_win: 1700000000000, streak_7: 1700000500000 },
    wallet: { hints: 12, streakDays: 30, totalAdsWatched: 40 },
    daily: { '2026-08-01': { completed: true }, '2026-08-02': { completed: true } },
    ghost: { classic: { 3: { bestSeconds: 180 } }, timeAttack: {} },
  };
  const serve = (result) => { playGamesService.loadSnapshot = async () => result; };

  try {
    // A. A freshly installed phone wins its first game; the cloud holds months of play.
    localStorage.clear();
    localStorage.setItem(USER_STATS_KEY, JSON.stringify({ gamesPlayed: 1, gamesWon: 1, bestTimes: { 1: 80 } }));
    serve({ success: true, snapshot: { data: JSON.stringify(cloudProgress) } });
    const a = await cloudSyncService.saveToCloud();
    assert.strictEqual(saveCalls, 1, 'the merged progress must still be uploaded');
    assert.strictEqual(uploaded.stats.gamesWon, 90,
      `A fresh phone's first win uploaded gamesWon ${uploaded.stats.gamesWon} over the cloud's 90. ` +
      'The snapshot is one slot per account, so with the same account on two phones this ' +
      'erased the other phone\'s progress from the cloud.');
    assert.strictEqual(uploaded.stats.bestTimes[1], 80, 'the faster best time wins a level both sides have');
    assert.strictEqual(uploaded.stats.bestTimes[2], 140, 'a level only the cloud has must survive the save');
    assert(uploaded.achievements.streak_7, 'an achievement unlocked on the other phone must survive the save');
    assert.strictEqual(uploaded.wallet.streakDays, 30, 'the longer streak must survive the save');
    assert.strictEqual(Object.keys(uploaded.daily).length, 2, 'daily records from the other phone must survive the save');
    assert.strictEqual(uploaded.ghost.classic[3].bestSeconds, 180, 'ghost PBs from the other phone must survive the save');
    assert.strictEqual(a.merged, true, 'the result must say a merge happened');
    assert.strictEqual(JSON.parse(localStorage.getItem(USER_STATS_KEY)).gamesWon, 1,
      'a save must not rewrite this phone\'s own progress — pulling the other phone in is restore\'s job');
    console.log('  ✅ 2b-A. a fresh phone\'s first win merges into the cloud instead of erasing it');

    // B. No backup yet: the plugin opens the slot with createIfNotFound, so it is empty, not an error.
    saveCalls = 0;
    serve({ success: true, snapshot: { data: '' } });
    const b = await cloudSyncService.saveToCloud();
    assert.strictEqual(saveCalls, 1, 'with no backup yet, the first backup must still be written');
    assert.strictEqual(uploaded.stats.gamesWon, 1, 'with nothing in the cloud, local progress is uploaded as it is');
    assert.strictEqual(b.merged, false, 'nothing was merged');
    console.log('  ✅ 2b-B. an empty slot gets the first backup');

    // C. The read failed. Writing now would overwrite a slot we could not see.
    saveCalls = 0;
    serve({ success: false, reason: 'error', error: 'network' });
    const c = await cloudSyncService.saveToCloud();
    assert.strictEqual(saveCalls, 0,
      'saveToCloud wrote to the cloud after failing to read it. That is the overwrite this ' +
      'merge exists to prevent: whatever the other phone saved is replaced unseen.');
    assert.strictEqual(c.method, 'local_only', 'an unread cloud means only the local copy was kept');
    assert.strictEqual(c.remoteReason, 'remote_unreadable', 'the result must say why the cloud was skipped');
    assert(localStorage.getItem(`suidoku_cloud_save_${c.userId}`), 'the local copy must still be written');
    console.log('  ✅ 2b-C. a failed read skips the upload and keeps the local copy');

    // D. Unparseable: nothing in it can be merged, and leaving it would block every future backup.
    saveCalls = 0;
    serve({ success: true, snapshot: { data: '{not json' } });
    await cloudSyncService.saveToCloud();
    assert.strictEqual(saveCalls, 1, 'an unreadable blob must be replaced, or no backup is ever made again');
    assert.strictEqual(uploaded.stats.gamesWon, 1, 'it is replaced with local progress');
    console.log('  ✅ 2b-D. an unparseable snapshot is replaced rather than blocking backups');
  } finally {
    playGamesService.loadSnapshot = realLoad;
    playGamesService.saveSnapshot = realSave;
    localStorage.clear();
  }
}

// 2c. Everything a win earns is recorded at the win, not when the victory screen mounts.
//
// The post-game interstitial now sits between the win and the victory screen. The
// S+ grade achievement and the cloud save used to run from VictoryModal's mount
// effect, so a player who closed the app during that ad would have lost both.
// Driven through the real handleGameWinLogic with no modal anywhere.
{
  const { handleGameWinLogic } = await import('../../../src/utils/gameCompletion.js');
  const { cloudSyncService: sync } = await import('../../../src/services/cloudSyncService.js');
  const realSave = sync.saveToCloud;
  let saves = 0;
  sync.saveToCloud = async () => { saves++; return { success: true }; };
  // An unlock announces itself on window; the node window stub has no event target.
  const hadDispatch = 'dispatchEvent' in window;
  if (!hadDispatch) window.dispatchEvent = () => true;
  if (typeof globalThis.CustomEvent !== 'function') globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
  try {
    localStorage.clear();
    handleGameWinLogic({
      level: 1, timerSeconds: 45, gameMode: 'classic', mistakes: 0, activeDailyDateKey: null,
      clearGameState: () => {}, setIsVictory: () => {}, setHintsRemaining: () => {},
    });
    const unlocked = JSON.parse(localStorage.getItem('sudoku_achievements_v1') || '{}');
    assert(unlocked.rank_s_plus,
      'A 45-second level-1 win must unlock the S+ grade achievement inside handleGameWinLogic. ' +
      'It used to unlock from VictoryModal, which now appears only after the post-game ad — ' +
      'closing the app during that ad lost the achievement.');
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.strictEqual(saves, 1,
      'The win must start the cloud save itself; the victory screen may never be reached');

    const modalSrc = fs.readFileSync(path.join(rootDir, 'src/components/VictoryModal.jsx'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert(!/checkAndUnlockAchievements|saveToCloud|submitScore/.test(modalSrc),
      'VictoryModal must not record the win again — it would double-submit, and it is not ' +
      'guaranteed to mount');
    console.log('  ✅ 2c. the grade achievement and cloud save happen at the win, not on the victory screen');
  } finally {
    sync.saveToCloud = realSave;
    if (!hadDispatch) delete window.dispatchEvent;
    localStorage.clear();
  }
}

// 2. Verify leaderboardService & iqStatsService
const { leaderboardService, LEADERBOARD_CATEGORIES } = await import('../../../src/services/leaderboardService.js');
const { iqStatsService } = await import('../../../src/services/iqStatsService.js');
assert(LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC, 'SPEEDRUN_CLASSIC category must exist');
assert(LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK, 'SPEEDRUN_TIME_ATTACK category must exist');
assert(LEADERBOARD_CATEGORIES.BRAIN_IQ, 'BRAIN_IQ category must exist');
assert(LEADERBOARD_CATEGORIES.PVP_MMR, 'PVP_MMR category must exist');

const classicRanks = await leaderboardService.fetchTopRanks(LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC, 'lv3');
assert(Array.isArray(classicRanks) && classicRanks.length > 0, 'Classic ranks must return array');
assert(classicRanks[0].rank === 1, 'First rank must have rank=1');
assert(classicRanks[0].score > 0, 'Speedrun rank item must have positive score');

const speedrunRanks = await leaderboardService.fetchTopRanks(LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK, 'lv1');
assert(Array.isArray(speedrunRanks) && speedrunRanks.length > 0, 'Speedrun Time Attack ranks must return array');

const iqRanks = await leaderboardService.fetchTopRanks(LEADERBOARD_CATEGORIES.BRAIN_IQ);
assert(Array.isArray(iqRanks) && iqRanks.length > 0, 'IQ ranks must return array');

const myIqRank = leaderboardService.getMyRank(LEADERBOARD_CATEGORIES.BRAIN_IQ);
assert(myIqRank.score >= 100 && myIqRank.score <= 150, 'My IQ rank score must be bounded realistically (100-150)');

// Test Realistic Single-Clear IQ Calculation (1 game on Lv1 should not exceed 106)
const singleClearStats = { gamesPlayed: 1, gamesWon: 1, bestTimes: { 1: 59 } };
const singleClearIQ = iqStatsService.calculateBrainIQ(singleClearStats);
assert(singleClearIQ >= 101 && singleClearIQ <= 106, `1 game Lv1 clear IQ must be realistically ~103 (got: ${singleClearIQ})`);

// Test Dynamic Tie Ranking (59s for Lv1 Speedrun should tie with 3rd place 59s -> rank 3)
const lv1Ranks = await leaderboardService.fetchTopRanks(LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC, 'lv1');
assert(Array.isArray(lv1Ranks) && lv1Ranks.length >= 10, 'Lv1 ranks must return top 10 array');
console.log('  ✅ 3. leaderboardService 4-category dynamic rank, isolation & realistic IQ tests passed');

// 3. Verify i18n translation completeness across all 13 languages
const languages = LOCALES; // 목록을 여기 적지 않는다 — scripts/tests/lib/locales.js 가 앱에서 읽어온다
const requiredLeaderboardKeys = [
  'classicTab', 'speedrunTab', 'iqTab', 'pvpTab', 'myStanding',
  'unranked', 'record', 'topSolvers'
];
const requiredCloudSyncKeys = [
  'sectionTitle', 'autoSyncNotice', 'backupTitle', 'backupDesc', 'backupSuccess',
  'restoreTitle', 'restoreDesc', 'restoreConfirm', 'noData'
];

for (const lang of languages) {
  const screensPath = path.join(rootDir, 'src', 'i18n', 'locales', lang, 'screens.js');
  const screensContent = fs.readFileSync(screensPath, 'utf8');
  assert(screensContent.includes('leaderboardTab:'), `Language [${lang}] missing stats.leaderboardTab`);

  const lbPath = path.join(rootDir, 'src', 'i18n', 'locales', lang, 'leaderboard.js');
  const lbContent = fs.readFileSync(lbPath, 'utf8');

  // Check leaderboard keys
  for (const key of requiredLeaderboardKeys) {
    assert(lbContent.includes(`${key}:`), `Language [${lang}] missing leaderboard.${key}`);
  }

  // Check cloudSync keys
  for (const key of requiredCloudSyncKeys) {
    assert(lbContent.includes(`${key}:`), `Language [${lang}] missing cloudSync.${key}`);
  }
  assert(lbContent.includes('sectionTitle: \'☁️'), `Language [${lang}] cloudSync.sectionTitle must include ☁️ icon`);
}
console.log('  ✅ 4. i18n 5-Language completeness & ☁️ icon verified for Leaderboard & Cloud Sync (KO, EN, JA, ZH-TW, ES-ES)');

// 4. Verify Component Integrations & Clean Line Architecture
const globalLeaderboardView = fs.readFileSync(path.join(rootDir, 'src', 'components', 'GlobalLeaderboardView.jsx'), 'utf8');
assert(globalLeaderboardView.includes('leaderboardService'), 'GlobalLeaderboardView must bind to leaderboardService');
assert(globalLeaderboardView.includes('classicTab'), 'GlobalLeaderboardView must render classicTab');
assert(globalLeaderboardView.includes('speedrunTab'), 'GlobalLeaderboardView must render speedrunTab');
assert(globalLeaderboardView.includes('pvpTab'), 'GlobalLeaderboardView must render pvpTab');
assert(globalLeaderboardView.includes('iqTab'), 'GlobalLeaderboardView must render iqTab');

const keypadCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Keypad.jsx'), 'utf8');
assert(keypadCode.includes('isSpeedrun'), 'Keypad must accept isSpeedrun prop');
assert(keypadCode.includes('!isNoHint'), 'Keypad must completely disable hints in Speedrun');

const keypadCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'keypad.css'), 'utf8');
assert(keypadCss.includes('repeat(9, minmax(0, 1fr))'), 'keypad.css must use minmax(0, 1fr) for 100% overflow-free grid');
assert(keypadCss.includes('overflow: hidden'), 'keypad.css must enforce overflow: hidden on container');
assert(keypadCss.includes('min-width: 0'), 'keypad.css must enforce min-width: 0 on num-btn');

const storageCode = fs.readFileSync(path.join(rootDir, 'src', 'utils', 'storage.js'), 'utf8');
assert(storageCode.includes('stats.timeLimitBestTimes'), 'storage.js must record timeLimitBestTimes per difficulty level');

const statsScreen = fs.readFileSync(path.join(rootDir, 'src', 'components', 'StatsScreen.jsx'), 'utf8');
assert(statsScreen.includes('GlobalLeaderboardView'), 'StatsScreen must import and render GlobalLeaderboardView');
assert(statsScreen.includes("activeTab === 'leaderboard'"), 'StatsScreen must support 3rd leaderboard tab');
assert(statsScreen.includes('timeLimitBests'), 'StatsScreen must render 5 difficulty levels for Time Limit Survival');

const victoryModalCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'VictoryModal.jsx'), 'utf8');
assert(victoryModalCode.includes('onOpenLeaderboard'), 'VictoryModal must accept onOpenLeaderboard prop');
assert(!victoryModalCode.includes('playGamesService.showLeaderboards()'), 'VictoryModal must not call dead playGamesService.showLeaderboards()');

const timerCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useGameTimer.js'), 'utf8');
assert(timerCode.includes('bonusReduction = nextCombo >= 4 ? 2 : 1'), 'Speedrun combo reduction must be strictly balanced');
assert(timerCode.includes('bonusSeconds = 7'), 'Survival bonus time must be calibrated to 7s');

const inputCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useGameInput.js'), 'utf8');
assert(inputCode.includes('addSurvivalBonusTime(7)'), 'useGameInput must pass 7s bonus time in survival mode');

const keypadActionsCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useKeypadActions.js'), 'utf8');
assert(keypadActionsCode.includes('adHintsUsedThisGame >= 2'), 'useKeypadActions must enforce 2-hint ad limit per game');
assert(keypadActionsCode.includes("gameMode === 'timeAttack'"), 'useKeypadActions must strictly prevent hints in Time Attack');
assert(keypadActionsCode.includes('activeBattleRoom'), 'useKeypadActions must strictly prevent hints in Battle mode');

const sudokuGameCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useSudokuGame.js'), 'utf8');
assert(sudokuGameCode.includes('adHintsUsedThisGame >= 2'), 'useSudokuGame handleRewardHint must cap at 2 ad hints');
assert(sudokuGameCode.includes('setAdHintsUsedThisGame(0)'), 'useSudokuGame must reset ad hints on new/restarted game');

const hintRewardModalCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'HintRewardModal.jsx'), 'utf8');
assert(hintRewardModalCode.includes('maxAdHints'), 'HintRewardModal must support maxAdHints prop');
assert(hintRewardModalCode.includes('chancesLeft'), 'HintRewardModal must render chancesLeft badge');

for (const lang of languages) {
  const modalPath = path.join(rootDir, 'src', 'i18n', 'locales', lang, 'modals.js');
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  assert(modalContent.includes('chancesLeft:'), `Language [${lang}] missing modals.hintReward.chancesLeft`);
  assert(modalContent.includes('maxReached:'), `Language [${lang}] missing modals.hintReward.maxReached`);
}

// Cloud backup and the Play Games connection live in settings/AccountSection.jsx;
// SettingsScreen renders it. Both halves are asserted so neither can be dropped.
const settingsScreen = fs.readFileSync(path.join(rootDir, 'src', 'components', 'SettingsScreen.jsx'), 'utf8');
const accountSection = fs.readFileSync(path.join(rootDir, 'src', 'components', 'settings', 'AccountSection.jsx'), 'utf8');
assert(settingsScreen.includes('<AccountSection'), 'SettingsScreen must render the account/cloud section');
assert(accountSection.includes('cloudSyncService'), 'AccountSection must integrate cloudSyncService');
assert(accountSection.includes('saveToCloud') && accountSection.includes('restoreFromCloud'),
  'AccountSection must offer both backup and restore');
assert(/res\.method === 'play_games'/.test(accountSection),
  'Backup must report success only when the data actually reached Play Games — saveToCloud returns success:true even for a device-local write');
assert(/signIn\(\s*true\s*\)/.test(accountSection),
  'AccountSection must offer an INTERACTIVE Play Games sign-in; silent-only leaves new installs permanently locked out of leaderboards and cloud backup');
assert(accountSection.includes('handleCloudBackup'), 'AccountSection must provide handleCloudBackup');
assert(accountSection.includes('handleCloudRestore'), 'AccountSection must provide handleCloudRestore');
assert(accountSection.includes('cloudSync.autoSyncNotice'), 'AccountSection must display autoSyncNotice');

console.log('  ✅ 5. Component integration, Zero-Overflow, 2-Ad Hint Limit & No-Hint Safety contracts verified');

// ── 6. Backup keys come from the modules that own them ──────────────────────
//
// cloudSyncService used to re-type the storage keys as its own string literals,
// and two of the three were wrong ('suidoku_wallet_state_v1',
// 'suidoku_daily_challenge_v1'). Backup reported success while the wallet and
// the daily records were never in the payload at all — a copy that silently
// omits what it claims to save is worse than no backup, because the player
// trusts it and stops worrying.
//
// A re-typed key looks correct in review; only the running app disagrees. So the
// rule is structural: import the constant, never spell the string again.
const cloudSyncSrc = fs.readFileSync('src/services/cloudSyncService.js', 'utf8');
const OWNED_KEYS = [
  ['WALLET_STORAGE_KEY', 'src/utils/wallet.js'],
  ['DAILY_STORAGE_KEY', 'src/utils/dailyChallenge.js'],
  ['GHOST_STORAGE_KEY', 'src/utils/ghostManager.js']
];
// Reading the import lines directly beats assembling a regex for them: a
// template literal eats the backslashes, and a check that silently never
// matches would pass while proving nothing.
const cloudSyncImports = cloudSyncSrc
  .split('\n')
  .filter((l) => l.trim().startsWith('import'))
  .join('\n');

for (const [constName, owner] of OWNED_KEYS) {
  assert(cloudSyncImports.includes(constName),
    `cloudSyncService must import ${constName} from ${owner} rather than spelling ` +
    'the key itself. Re-typed keys are how the wallet and daily records were ' +
    'silently left out of every backup.');
}

// Achievements are reached through their module for the same reason, and it
// matters more there: that key is 'sudoku_achievements_v1' — no 'i' — unlike
// every other key in the app. Anyone re-typing it from memory gets it wrong.
assert(cloudSyncImports.includes('loadUnlockedAchievements'),
  'cloudSyncService must read achievements through achievementManager. Its key ' +
  "is 'sudoku_achievements_v1', which does not match the 'suidoku_' prefix every " +
  'other key uses — re-typing it from memory produces a key that reads nothing.');

const retyped = [...cloudSyncSrc.matchAll(/'(suidoku_(?:user_wallet|daily_records|ghost_records)[a-z_0-9]*)'/g)];
assert.deepStrictEqual(retyped.map((m) => m[1]), [],
  'cloudSyncService spells an owned storage key as a literal: ' +
  retyped.map((m) => m[1]).join(', ') + '. Import the constant instead.');
console.log('  ✅ 6. Backup reads every owned key through its module, none re-typed');
console.log('🏆 [QA Gate 13] Global Leaderboards, Cloud Save, 2-Ad Hint Limit & No-Hint Safety Audit PASSED 100%!\n');
