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
  // Lv.3 is the ghost's 200 s: a Classic win writes both from one time, and a
  // ghost faster than its best time is read as another mode's (D19). It was 210.
  bestTimes: { 1: 90, 2: 150, 3: 200 },
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

// ── 2b-E. Two saves at once must not send the cloud backwards (RT-4) ──────
//
// A save is read-merge-write against one snapshot slot. Every win calls
// saveToCloud, and useCloudAutoSync calls syncIfNeeded on foreground, on
// reconnect and on sign-in — so two can be in the air together. Interleaved, the
// second reads the slot before the first writes, merges against the stale copy,
// and writes last: the cloud drops back to one win while the phone has two.
//
// The timing is forced here rather than hoped for: the first save is held inside
// its read until the second has been asked for. If the saves run one at a time,
// the second cannot start reading until the first has finished writing, and the
// last thing uploaded is the newer one.
{
  const { playGamesService } = await import('../../../src/services/playGamesService.js');
  const { USER_STATS_KEY: STATS_KEY } = await import('../../../src/utils/storage.js');
  const realLoad = playGamesService.loadSnapshot;
  const realSave = playGamesService.saveSnapshot;
  localStorage.clear();

  let slot = JSON.stringify({ userId: 'pg_race', version: '1.1.2', stats: { gamesPlayed: 1, gamesWon: 1 } });
  const order = [];
  let releaseFirstRead = null;
  let reads = 0;

  playGamesService.loadSnapshot = async () => {
    reads++;
    order.push(`read${reads}`);
    if (reads === 1) await new Promise((r) => { releaseFirstRead = r; });
    return { success: true, snapshot: { data: slot } };
  };
  playGamesService.saveSnapshot = async (_name, data) => {
    order.push(`write(${JSON.parse(data).stats.gamesWon})`);
    slot = data;
    return { success: true };
  };

  try {
    // the win that is being backed up: two wins on this phone
    localStorage.setItem(STATS_KEY, JSON.stringify({ gamesPlayed: 2, gamesWon: 2 }));
    const first = cloudSyncService.saveToCloud();
    await new Promise((r) => setTimeout(r, 0));
    assert.strictEqual(reads, 1, 'the first save should be waiting inside its read');

    // meanwhile the app comes back to the foreground and asks for a backup too
    const second = cloudSyncService.saveToCloud();
    await new Promise((r) => setTimeout(r, 0));
    assert.strictEqual(reads, 1,
      'a second save started reading while the first was still in flight — interleaved, it will '
      + 'merge against the copy the first one is about to replace and then overwrite it (RT-4)');

    releaseFirstRead();
    await Promise.all([first, second]);

    assert.deepStrictEqual(order, ['read1', 'write(2)', 'read2', 'write(2)'],
      `saves must not interleave: read, write, read, write (got ${order.join(' ')})`);
    assert.strictEqual(JSON.parse(slot).stats.gamesWon, 2,
      `the cloud ended with ${JSON.parse(slot).stats.gamesWon} wins after a 2-win save — it went backwards`);
    console.log('  ✅ 2b-E. two overlapping saves run one at a time; the cloud never goes backwards');

    // And the one that runs second has nothing new to send, so it says so
    // instead of uploading the same bytes again.
    const skipped = await cloudSyncService.saveToCloud({ onlyIfChanged: true });
    assert.strictEqual(skipped.skipped, 'up_to_date',
      'a queued save with nothing new must skip rather than re-upload');
    console.log('  ✅ 2b-F. a queued save with nothing new skips the upload');
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

// 2. Backups: only a save that reached Play Games counts, and they catch up by themselves
//
// The records screen used to carry a "back up now" button and a leaderboard tab. Both
// are gone (SudokuDiary ㉖): backups run on their own — after a win, on sign-in, when
// the connection returns, when the app comes back — and the world ranking lives with
// the score on the Play Analysis screen. What must hold:
//   - "last backup" moves only when the save reached Play Games, never for a local copy
//   - anything changed since then is noticed, and nothing unchanged is re-uploaded
//   - a fresh phone is offered an earlier record once, and only one that has wins
const { iqStatsService } = await import('../../../src/services/iqStatsService.js');
{
  const { cloudSyncService: sync } = await import('../../../src/services/cloudSyncService.js');
  const { playGamesService: pg } = await import('../../../src/services/playGamesService.js');
  const real = { load: pg.loadSnapshot, save: pg.saveSnapshot, auth: pg.isAuthenticated, saveToCloud: sync.saveToCloud };
  let cloud = null, saves = 0, failSave = false, failLoad = false;
  pg.loadSnapshot = async () => (failLoad ? { success: false, reason: 'error' } : { success: true, snapshot: { data: cloud } });
  pg.saveSnapshot = async (_n, data) => { if (failSave) return { success: false, reason: 'error' }; cloud = data; saves++; return { success: true }; };
  const setStats = (st) => localStorage.setItem('suidoku_user_stats_v1', JSON.stringify(st));
  try {
    localStorage.clear(); pg.isAuthenticated = true; sync.saveToCloud = real.saveToCloud;
    setStats({ gamesPlayed: 1, gamesWon: 1, bestTimes: { 1: 100 } });

    failSave = true;
    let r = await sync.saveToCloud();
    assert.strictEqual(r.method, 'local_only');
    assert.strictEqual(sync.getLastRemoteBackup(), null, 'a save that never reached Play Games must not show as a backup');
    assert(sync.hasUnsyncedChanges(), 'so the change is still waiting');

    failSave = false;
    r = await sync.syncIfNeeded();
    assert.strictEqual(r.method, 'play_games', `pending change must upload (${JSON.stringify(r)})`);
    assert(sync.getLastRemoteBackup() > 0, 'a save that reached Play Games shows as the last backup');
    assert(!sync.hasUnsyncedChanges(), 'nothing new after a backup');
    const before = saves;
    assert.strictEqual((await sync.syncIfNeeded()).skipped, 'up_to_date');
    assert.strictEqual(saves, before, 'nothing unchanged is re-uploaded');

    setStats({ gamesPlayed: 2, gamesWon: 2, bestTimes: { 1: 90 } });
    assert(sync.hasUnsyncedChanges(), 'a win played since the last backup is noticed');
    pg.isAuthenticated = false;
    assert.strictEqual((await sync.syncIfNeeded()).skipped, 'signed_out');
    pg.isAuthenticated = true;
    const nav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true });
    assert.strictEqual((await sync.syncIfNeeded()).skipped, 'offline');
    if (nav) Object.defineProperty(globalThis, 'navigator', nav); else delete globalThis.navigator;
    assert.strictEqual((await sync.syncIfNeeded()).method, 'play_games', 'back online: the backlog goes up');

    // RT-5: the mark belongs to an account, not to the phone.
    //
    // The snapshot slot is per account. With one mark for the phone, signing in
    // as a second player and backing up was skipped as "up to date" — the local
    // data had not changed since the FIRST player's backup — so the second
    // player's slot stayed empty while the app showed a backup time.
    const realUid = sync.getEffectiveUserId;
    try {
      localStorage.clear();
      setStats({ gamesPlayed: 4, gamesWon: 3, bestTimes: { 1: 80 } });
      sync.getEffectiveUserId = () => 'pg_playerA';
      assert.strictEqual((await sync.syncIfNeeded()).method, 'play_games', 'A backs up');
      assert(!sync.hasUnsyncedChanges(), 'A is up to date');
      const aBackedUpAt = sync.getLastRemoteBackup();
      assert(aBackedUpAt > 0, 'A has a backup time');

      sync.getEffectiveUserId = () => 'pg_playerB';
      assert(sync.hasUnsyncedChanges(),
        "B has never been backed up, but the phone's single mark said otherwise — B's slot stays empty (RT-5)");
      assert.strictEqual(sync.getLastRemoteBackup(), null, "and B must not be shown A's backup time");
      const beforeB = saves;
      assert.strictEqual((await sync.syncIfNeeded()).method, 'play_games', 'B backs up too');
      assert.strictEqual(saves, beforeB + 1, "B's backup really went out");

      sync.getEffectiveUserId = () => 'pg_playerA';
      assert(!sync.hasUnsyncedChanges(), "A's mark survived B's backup");
      assert.strictEqual(sync.getLastRemoteBackup(), aBackedUpAt, "and still shows A's own time");

      // An install updated from before this change holds the old single mark.
      // It belongs to nobody, so the next backup is made rather than skipped.
      localStorage.setItem('suidoku_cloud_remote_sync_v1',
        JSON.stringify({ at: Date.now(), fp: 'whatever-it-was' }));
      assert(sync.hasUnsyncedChanges(), "an old phone-wide mark must not be read as this account's backup");
      assert.strictEqual(sync.getLastRemoteBackup(), null, 'nor shown as a backup time');
      console.log('  ✅ 3b. the backup mark is per account; switching players backs up again (RT-5)');
    } finally {
      sync.getEffectiveUserId = realUid;
      localStorage.clear();
    }

    // Restore offer on a fresh phone
    localStorage.clear();
    cloud = JSON.stringify({ stats: { gamesPlayed: 7, gamesWon: 5 } });
    failLoad = true;
    assert.strictEqual(await sync.findRestoreOffer(), null, 'unreadable cloud: no offer');
    failLoad = false;
    const offer = await sync.findRestoreOffer();
    assert.deepStrictEqual(offer, { gamesWon: 5 }, 'fresh phone + cloud wins → offered once (an unreadable read did not use up the offer)');
    assert.strictEqual(await sync.findRestoreOffer(), null, 'asked once per player on this phone');
    localStorage.clear();
    cloud = JSON.stringify({ stats: { gamesPlayed: 0, gamesWon: 0 } });
    assert.strictEqual(await sync.findRestoreOffer(), null, 'a backup with no wins is not worth asking about');
    localStorage.clear();
    cloud = JSON.stringify({ stats: { gamesPlayed: 7, gamesWon: 5 } });
    setStats({ gamesPlayed: 1, gamesWon: 0 });
    assert.strictEqual(await sync.findRestoreOffer(), null, 'a phone that has played is not fresh — restore stays a Settings choice');
  } finally {
    pg.loadSnapshot = real.load; pg.saveSnapshot = real.save; pg.isAuthenticated = real.auth; sync.saveToCloud = real.saveToCloud;
    localStorage.clear();
  }
}

// ── Two phones cannot merge into a record neither of them had (MG-1) ─────
//
// Played and won used to take the larger value one at a time. A phone with
// 10 played / 10 won merged with one that had 10 played / 0 won produced
// 10 played / 10 won: a perfect record assembled from a phone that had never
// won. The win rate feeds the Logic Score that goes to the leaderboard.
{
  const { mergeStats: merge } = await import('../../../src/services/progressMerge.js');
  const rate = (m) => (m.gamesPlayed ? m.gamesWon / m.gamesPlayed : 0);

  const inflated = merge({ gamesPlayed: 10, gamesWon: 10 }, { gamesPlayed: 10, gamesWon: 0 });
  assert.strictEqual(inflated.gamesWon, 10, 'the wins that really happened are kept');
  assert.strictEqual(inflated.gamesPlayed, 20,
    `a phone that won 10 of 10 and one that lost 10 of 10 played 20 games, not ${inflated.gamesPlayed} (MG-1)`);
  assert.strictEqual(rate(inflated), 0.5, 'so the rate is 50%, not 100%');

  // merging a phone with its own older backup must not move anything
  const sameDevice = merge({ gamesPlayed: 18, gamesWon: 9 }, { gamesPlayed: 20, gamesWon: 10 });
  assert.deepStrictEqual([sameDevice.gamesPlayed, sameDevice.gamesWon], [20, 10],
    'a device merging with its own older copy must come out unchanged');

  // and saving repeatedly must not drift: every save merges cloud with local
  const again = merge(inflated, { gamesPlayed: 10, gamesWon: 10 });
  assert.deepStrictEqual([again.gamesPlayed, again.gamesWon], [20, 10],
    'merging the result again must give the same answer, or every save inflates a little more');

  // never a rate better than the better phone actually had
  for (const [a, b] of [[{ gamesPlayed: 30, gamesWon: 5 }, { gamesPlayed: 10, gamesWon: 10 }],
                        [{ gamesPlayed: 7, gamesWon: 3 }, { gamesPlayed: 100, gamesWon: 40 }],
                        [{ gamesPlayed: 0, gamesWon: 0 }, { gamesPlayed: 5, gamesWon: 5 }]]) {
    const m = merge(a, b);
    assert(rate(m) <= Math.max(rate(a), rate(b)) + 1e-9,
      `merged rate ${rate(m)} beats both phones (${rate(a)}, ${rate(b)})`);
    assert(m.gamesWon >= Math.max(a.gamesWon, b.gamesWon), 'and no win may be lost');
  }
  console.log('  ✅ 6b. merging two phones never invents a win rate neither of them had (MG-1)');
}

// ── A damaged backup cannot damage the phone (RT-6 / F03) ────────────────
//
// The red team restored a backup carrying gamesPlayed 'broken', gamesWon 'broken'
// and bestTimes[5] = -10 onto a phone with 3 wins in 5 games. The restore reported
// success; the two counts were stored as null (NaN does not survive JSON) and -10
// became the fastest level-5 time. Parsing succeeded, so nothing asked whether the
// values were values. Every field is fed something it cannot hold, here.
{
  const { mergeStats: merge, mergeProgress } = await import('../../../src/services/progressMerge.js');
  const finiteCounts = (o) => Object.entries(o).every(([, v]) => typeof v !== 'number' || (Number.isFinite(v) && v >= 0));

  const local = { gamesPlayed: 5, gamesWon: 3, bestTimes: { 3: 400, 5: 300 }, timeLimitSurvivalWins: 2, maxCombo: 4 };
  const cloud = {
    gamesPlayed: 'broken', gamesWon: 'broken', bestTimes: { 2: 200, 3: 'fast', 5: -10 },
    timeLimitSurvivalWins: 'x', maxCombo: Infinity, flawlessWins: -3,
    timeAttackBestTimes: 'not a table', clearedLevels: { 1: true, 2: 'yes' }, junk: 'text',
  };
  const m = merge(cloud, local);
  assert.deepStrictEqual([m.gamesPlayed, m.gamesWon], [5, 3], `unreadable cloud counts must leave the phone's 3/5, got ${m.gamesWon}/${m.gamesPlayed}`);
  assert.strictEqual(m.bestTimes[5], 300, `a negative cloud time must not become the record (got ${m.bestTimes[5]})`);
  assert.strictEqual(m.bestTimes[3], 400, 'a cloud time that is not a number must not replace a real one');
  assert.strictEqual(m.bestTimes[2], 200, 'while a real cloud time for a level the phone lacks still comes through');
  assert.strictEqual(m.timeLimitSurvivalWins, 2, 'survival wins keep the phone\'s count');
  assert.strictEqual(m.maxCombo, 4, 'the phone\'s combo stands against an infinite one');
  assert(!('flawlessWins' in m), 'a negative count the phone never had is not carried over');
  assert(!('junk' in m) && !('timeAttackBestTimes' in m), 'a text field and a table that is not a table are dropped');
  assert.deepStrictEqual(m.clearedLevels, { 1: true }, 'only a real "cleared" mark counts');
  assert(finiteCounts(m) && !JSON.stringify(m).includes('null,') && JSON.parse(JSON.stringify(m)).gamesPlayed === 5,
    'nothing in the merged stats may turn into null when saved');

  const p = mergeProgress(
    { stats: cloud, wallet: { hints: 'x', streakDays: -5, totalAdsWatched: Infinity },
      achievements: { first_win: 'x', win_5: { unlockedAt: '2026-09-01' } },
      daily: { '2026-09-01': 'x', '2026-09-02': { completed: true } },
      ghost: { classic: { 3: { bestSeconds: -1 }, 4: { bestSeconds: 120 } }, timeAttack: 'x' } },
    { stats: local, wallet: { hints: 2, streakDays: 1, totalAdsWatched: 0, history: [] },
      achievements: { first_win: { unlockedAt: '2026-08-01' } }, daily: {}, ghost: { classic: {}, timeAttack: {} } });
  assert.deepStrictEqual([p.wallet.hints, p.wallet.streakDays, p.wallet.totalAdsWatched], [2, 1, 0],
    `a broken cloud wallet must leave the phone's hints, streak and ad count (got ${[p.wallet.hints, p.wallet.streakDays, p.wallet.totalAdsWatched]})`);
  assert.deepStrictEqual(p.achievements.first_win, { unlockedAt: '2026-08-01' }, 'a stray cloud value must not overwrite a real unlock');
  assert(p.achievements.win_5, 'a real unlock from the cloud still arrives');
  assert.deepStrictEqual(Object.keys(p.daily), ['2026-09-02'], 'only daily records that are records');
  assert.deepStrictEqual(Object.keys(p.ghost.classic), ['4'], 'only ghosts with a real time');
  assert.deepStrictEqual(mergeProgress({ wallet: 'x' }, { wallet: { hints: 2 } }).wallet, { hints: 2 }, 'a wallet that is not an object is ignored');

  // and the red team's own restore, end to end
  const { cloudSyncService: sync } = await import('../../../src/services/cloudSyncService.js');
  const { playGamesService: pg } = await import('../../../src/services/playGamesService.js');
  const { USER_STATS_KEY: STATS } = await import('../../../src/utils/storage.js');
  const realLoad = pg.loadSnapshot;
  localStorage.clear();
  localStorage.setItem(STATS, JSON.stringify({ gamesPlayed: 5, gamesWon: 3, bestTimes: { 5: 300 } }));
  pg.loadSnapshot = async () => ({ success: true, snapshot: { data: JSON.stringify({
    userId: 'pg_f03', version: '1.3.1', stats: { gamesPlayed: 'broken', gamesWon: 'broken', bestTimes: { 5: -10 } } }) } });
  try {
    const r = await sync.restoreFromCloud();
    const stored = JSON.parse(localStorage.getItem(STATS));
    assert.strictEqual(r.success, true, 'the restore itself still goes through');
    assert.deepStrictEqual([stored.gamesPlayed, stored.gamesWon, stored.bestTimes[5]], [5, 3, 300],
      `after restoring the damaged backup the phone must still say 3/5 and 300s, got ${JSON.stringify(stored)} (RT-6 / F03)`);
    console.log('  ✅ 6c. a damaged backup cannot damage the phone — every field fed what it cannot hold (RT-6 / F03)');
  } finally {
    pg.loadSnapshot = realLoad;
    localStorage.clear();
  }
}

// ── A restore either happens or it does not (RT-7 / F04) ─────────────────
//
// The restore is five separate writes and storage can refuse partway through —
// a full quota is the ordinary way. It used to write what it could and then
// report failure, leaving the player told "restore failed" while their stats had
// already been replaced by the cloud copy and the wallet, achievements, daily
// records and ghost times were still the local ones: a mixture neither device
// ever had. The failure is injected here rather than hoped for.
{
  const { cloudSyncService: sync } = await import('../../../src/services/cloudSyncService.js');
  const { playGamesService: pg } = await import('../../../src/services/playGamesService.js');
  const { WALLET_STORAGE_KEY } = await import('../../../src/utils/wallet.js');
  const { USER_STATS_KEY: STATS } = await import('../../../src/utils/storage.js');
  const realLoad = pg.loadSnapshot;
  const realSet = localStorage.setItem.bind(localStorage);
  localStorage.clear();

  // what this phone has before the restore
  const localStats = { gamesPlayed: 2, gamesWon: 1, bestTimes: { 1: 300 } };
  localStorage.setItem(STATS, JSON.stringify(localStats));
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ hints: 2, history: [] }));

  pg.loadSnapshot = async () => ({ success: true, snapshot: { data: JSON.stringify({
    userId: 'pg_restore', version: '1.1.2',
    stats: { gamesPlayed: 90, gamesWon: 70, bestTimes: { 1: 80 } },
    wallet: { hints: 40, history: [] },
    achievements: { first_win: 1700000000000 }
  }) } });

  try {
    // storage refuses the wallet write — the second one, so the stats write has
    // already gone in when it throws
    localStorage.setItem = (k, v) => {
      if (k === WALLET_STORAGE_KEY) throw new Error('QuotaExceededError');
      return realSet(k, v);
    };
    const failed = await sync.restoreFromCloud();
    localStorage.setItem = realSet;

    assert.strictEqual(failed.success, false, 'a restore that could not finish must report failure');
    assert.deepStrictEqual(JSON.parse(localStorage.getItem(STATS)), localStats,
      'the restore failed, so the stats must be exactly what they were — not the cloud copy (RT-7 / F04)');
    assert.strictEqual(JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY)).hints, 2,
      'and the wallet must be untouched');

    // and with storage working, the same restore goes through
    const ok = await sync.restoreFromCloud();
    assert.strictEqual(ok.success, true, 'the same restore must succeed once storage works');
    assert.strictEqual(JSON.parse(localStorage.getItem(STATS)).gamesWon, 70, 'and really restore');
    console.log('  ✅ 7. a restore that cannot finish changes nothing at all (RT-7 / F04)');
  } finally {
    localStorage.setItem = realSet;
    pg.loadSnapshot = realLoad;
    localStorage.clear();
  }
}

// ── A hint that did not persist was not spent (RT-7 / F11) ───────────────
{
  const wallet = await import('../../../src/utils/wallet.js');
  const realSet = localStorage.setItem.bind(localStorage);
  localStorage.clear();
  wallet.addHints(3, 'reward');
  const before = wallet.loadWallet().hints;
  try {
    localStorage.setItem = (k) => { if (k === wallet.WALLET_STORAGE_KEY) throw new Error('QuotaExceededError'); };
    assert.strictEqual(wallet.consumeHint(), false,
      'a hint whose spend never reached storage must not be reported as spent: the player gets the hint '
      + 'and the balance is back on the next load (RT-7 / F11)');
    assert.strictEqual(wallet.addHints(5, 'ad_reward'), before,
      'and a reward that did not persist must report the balance that really is stored');
    localStorage.setItem = realSet;
    assert.strictEqual(wallet.loadWallet().hints, before, 'storage still holds what it held');
    assert.strictEqual(wallet.consumeHint(), true, 'with storage working the spend goes through');
    assert.strictEqual(wallet.loadWallet().hints, before - 1, 'and it really is one fewer');
    console.log('  ✅ 8. a hint that could not be saved is not spent, and an unsaved reward is not promised (RT-7 / F11)');
  } finally {
    localStorage.setItem = realSet;
    localStorage.clear();
  }
}

// The invented percentile table must not come back anywhere in the app.
{
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : /\.(js|jsx)$/.test(e.name) && !d.includes('locales') ? [path.join(d, e.name)] : []);
  for (const file of walk(path.join(rootDir, 'src'))) {
    const code = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    assert(!/['"`]TOP\s*\d|isBenchmark|getMockRanks/i.test(code), `${path.relative(rootDir, file)}: invented ranking thresholds are back`);
  }
}

// Test Realistic Single-Clear IQ Calculation (1 game on Lv1 should not exceed 106)
const singleClearStats = { gamesPlayed: 1, gamesWon: 1, bestTimes: { 1: 59 } };
const singleClearIQ = iqStatsService.calculateBrainIQ(singleClearStats);
assert(singleClearIQ >= 101 && singleClearIQ <= 106, `1 game Lv1 clear IQ must be realistically ~103 (got: ${singleClearIQ})`);

console.log('  ✅ 3. backups: only Play Games saves count, changes catch up, a fresh phone is offered its record once');

// 3. Verify i18n translation completeness across all 13 languages
const languages = LOCALES; // 목록을 여기 적지 않는다 — scripts/tests/lib/locales.js 가 앱에서 읽어온다
const requiredLeaderboardKeys = ['pvpTab', 'openPlayGames'];
const requiredCloudSyncKeys = [
  'sectionTitle', 'autoSyncNotice', 'lastBackup', 'notBackedUp', 'restorePrompt',
  'restoreTitle', 'restoreDesc', 'restoreConfirm', 'noData'
];

for (const lang of languages) {
  const screensPath = path.join(rootDir, 'src', 'i18n', 'locales', lang, 'screens.js');
  const screensContent = fs.readFileSync(screensPath, 'utf8');
  for (const key of ['pvpRating', 'pvpRecordLabel', 'pvpRecord']) {
    assert(screensContent.includes(`${key}:`), `Language [${lang}] missing stats.${key}`);
  }

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
console.log('  ✅ 4. i18n completeness & ☁️ icon verified for records, Play Games and cloud backup (13 languages)');

// 4. Verify Component Integrations & Clean Line Architecture
const statsScreen = fs.readFileSync(path.join(rootDir, 'src', 'components', 'StatsScreen.jsx'), 'utf8');
assert(!/activeTab === 'leaderboard'|GlobalLeaderboardView/.test(statsScreen), 'the records screen has two tabs — the leaderboard tab repeated its best times');
assert(statsScreen.includes('loadBattleProfile'), 'the records screen shows the 1v1 rating and record');
const brainScreen = fs.readFileSync(path.join(rootDir, 'src', 'components', 'BrainReportScreen.jsx'), 'utf8');
assert(brainScreen.includes('showLeaderboards') && brainScreen.includes('connectPlayGames'),
  'the world ranking (Play Games) sits with the Logic Score, with a sign-in button when signed out');
assert(!brainScreen.includes('overallStats'), 'the play analysis screen does not repeat the totals from the records screen');
const accountSectionNow = fs.readFileSync(path.join(rootDir, 'src', 'components', 'settings', 'AccountSection.jsx'), 'utf8');
assert(!accountSectionNow.includes('saveToCloud') && accountSectionNow.includes('getLastRemoteBackup'),
  'Settings shows when the last backup reached Play Games instead of a manual backup button');
const appCode = fs.readFileSync(path.join(rootDir, 'src', 'App.jsx'), 'utf8');
assert(appCode.includes('useCloudAutoSync()'), 'the app runs the automatic backup and the restore offer');

const keypadCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Keypad.jsx'), 'utf8');
assert(keypadCode.includes('isSpeedrun'), 'Keypad must accept isSpeedrun prop');
assert(keypadCode.includes('!isNoHint'), 'Keypad must completely disable hints in Speedrun');

const keypadCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'keypad.css'), 'utf8');
assert(keypadCss.includes('repeat(9, minmax(0, 1fr))'), 'keypad.css must use minmax(0, 1fr) for 100% overflow-free grid');
assert(keypadCss.includes('overflow: hidden'), 'keypad.css must enforce overflow: hidden on container');
assert(keypadCss.includes('min-width: 0'), 'keypad.css must enforce min-width: 0 on num-btn');

const storageCode = fs.readFileSync(path.join(rootDir, 'src', 'utils', 'storage.js'), 'utf8');
// Survival's best per level is the fastest clear, seconds played (D16, 2026-10-09);
// the old time-left table is no longer written. Gate 2-21 holds the rule itself.
assert(storageCode.includes('stats.survivalBestTimes[level] = timeInSeconds'), 'storage.js must record survivalBestTimes per difficulty level');

assert(statsScreen.includes('timeLimitBests'), 'StatsScreen must render 5 difficulty levels for Time Limit Survival');

const victoryModalCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'VictoryModal.jsx'), 'utf8');
assert(victoryModalCode.includes('onOpenLeaderboard'), 'VictoryModal must accept onOpenLeaderboard prop');
assert(!victoryModalCode.includes('playGamesService.showLeaderboards()'), 'VictoryModal must not call dead playGamesService.showLeaderboards()');

const timerCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useGameTimer.js'), 'utf8');
assert(timerCode.includes('bonusReduction = nextCombo >= 4 ? 2 : 1'), 'Speedrun combo reduction must be strictly balanced');
// Survival's bonus a cell is the kind's since killer Survival (KP-2, 2026-10-14):
// 7 s on classic, kept in one place (survivalClock.js); gate 2-28 holds the killer one.
const { survivalCellBonusSeconds } = await import('../../../src/engine/survivalClock.js');
for (let lv = 1; lv <= 5; lv++) assert.strictEqual(survivalCellBonusSeconds('classic', lv), 7, `classic Survival Lv.${lv} must stay at 7 s a cell`);

const inputCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useGameInput.js'), 'utf8');
assert(inputCode.includes('addSurvivalBonusTime(survivalCellBonusSeconds(variant, level))'), 'useGameInput must pay the Survival bonus of the kind and level being played');

const keypadActionsCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useKeypadActions.js'), 'utf8');
assert(keypadActionsCode.includes('adHintsUsedThisGame >= 2'), 'useKeypadActions must enforce 2-hint ad limit per game');
assert(keypadActionsCode.includes("gameMode === 'timeAttack'"), 'useKeypadActions must strictly prevent hints in Time Attack');
assert(keypadActionsCode.includes('activeBattleRoom'), 'useKeypadActions must strictly prevent hints in Battle mode');

const sudokuGameCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useSudokuGame.js'), 'utf8');
// The ad-reward hint moved out of useSudokuGame.js on 2026-10-18 (gate 0-1, its code-line budget).
const rewardHintCode = fs.readFileSync(path.join(rootDir, 'src', 'hooks', 'useRewardHint.js'), 'utf8');
assert(rewardHintCode.includes('adHintsUsedThisGame >= 2'), 'useRewardHint (handleRewardHint) must cap at 2 ad hints');
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
assert(accountSection.includes('restoreFromCloud'), 'AccountSection must still offer restore from Settings');
// The interactive sign-in moved to playGamesBridge.connectPlayGames so Settings and
// the Play Analysis screen share it.
const bridgeCode = fs.readFileSync(path.join(rootDir, 'src', 'utils', 'playGamesBridge.js'), 'utf8');
assert(accountSection.includes('connectPlayGames') && /signIn\(\s*true\s*\)/.test(bridgeCode),
  'AccountSection must offer an INTERACTIVE Play Games sign-in; silent-only leaves new installs permanently locked out of leaderboards and cloud backup');
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
