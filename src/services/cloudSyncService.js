/**
 * cloudSyncService.js
 * Cross-device Cloud Save & Restore Manager.
 * 
 * Securely synchronizes user progress, Brain IQ, achievements, best times,
 * and wallet state across devices using Play Games Player ID or Anonymous UID.
 */

import { loadStats, loadSettings, getPlayGamesUser, USER_STATS_KEY } from '../utils/storage.js';
import { loadUnlockedAchievements, saveUnlockedAchievements, ACHIEVEMENTS_STORAGE_KEY } from '../utils/achievementManager.js';
import { WALLET_STORAGE_KEY } from '../utils/wallet.js';
import { DAILY_STORAGE_KEY } from '../utils/dailyChallenge.js';
import { GHOST_STORAGE_KEY } from '../utils/ghostManager.js';
import { ACADEMY_PROGRESS_KEY } from '../utils/academyProgress.js';
import { iqStatsService } from './iqStatsService.js';
import { playGamesService } from './playGamesService.js';
import { mergeProgress } from './progressMerge.js';

// Keys are imported from the modules that own them. They used to be re-typed here
// and two of the three were wrong ('suidoku_wallet_state_v1', 'suidoku_daily_challenge_v1'),
// so the wallet and the daily records were silently never backed up at all.

const readJson = (key) => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const LAST_SYNC_KEY = 'suidoku_last_cloud_sync_v1';
// The last save that actually reached Play Games, PER ACCOUNT:
// { [userId]: { at, fp } }. LAST_SYNC_KEY above is also written by a local-only
// save, so it cannot say whether anything left the phone.
//
// Per account, because the snapshot slot is per account. It used to be one
// { at, fp } for the phone: sign in as A and back up, switch to B, and the
// fingerprint of the local data still matched A's mark — so "nothing new to back
// up" and B's slot never received anything, though B had never been backed up at
// all (RT-5). Keyed the same way as RESTORE_OFFERED_KEY below, which had the
// problem in mind already.
const REMOTE_SYNC_KEY = 'suidoku_cloud_remote_sync_v1';
// Players already asked "load your earlier record?" on this device, by user id.
const RESTORE_OFFERED_KEY = 'suidoku_cloud_restore_offered_v1';

// What a backup carries, without the fields that change on every call (time, id),
// reduced to a short hash (FNV-1a, 32-bit) — storing the whole payload again as the
// marker doubled ~15KB of local storage for a comparison. Equal hashes mean nothing
// new to back up; a collision would only delay one backup to the next change.
const fingerprint = (p) => {
  const text = JSON.stringify([p.stats, p.settings, p.achievements, p.wallet, p.daily, p.ghost, p.academy]);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${text.length}:${h.toString(16)}`;
};
// Play Games saved-game slot. Stable: changing it orphans every existing backup.
const SNAPSHOT_NAME = 'suidoku_progress_v1';

class CloudSyncService {
  /**
   * Cloud saves run one at a time, in the order they were asked for.
   *
   * A save is read-merge-write against a single snapshot slot, and two of them
   * could be in the air at once: every win calls saveToCloud, while
   * useCloudAutoSync calls syncIfNeeded when the app comes back to the
   * foreground, the connection returns, or Play Games signs in. Interleaved,
   * the second one reads the slot BEFORE the first one writes, so it merges
   * against a stale copy and then writes last — the cloud goes back to one win
   * while this phone has two (RT-4, from ChatGPT's red team). The local copy is
   * untouched, so the next successful backup repairs it; a player who switches
   * phones in between loses the wins that were only ever in that lost write.
   *
   * `_syncing` in syncIfNeeded was not enough: the win path does not go through
   * it. So the queue lives here, where the read and the write are, and it is the
   * same shape as the banner queue in ads/admobProvider.js — a promise chain
   * whose rejections cannot poison what is behind it.
   */
  constructor() {
    this._saveQueue = Promise.resolve();
  }

  getEffectiveUserId() {
    try {
      const playUser = getPlayGamesUser();
      if (playUser && (playUser.playerId || playUser.id)) {
        return `pg_${playUser.playerId || playUser.id}`;
      }
      return iqStatsService.getOrCreateAnonUid();
    } catch {
      return 'anon_fallback_user';
    }
  }

  getLastSyncTime() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const ts = localStorage.getItem(LAST_SYNC_KEY);
      return ts ? Number(ts) : null;
    } catch {
      return null;
    }
  }

  compileBackupPayload() {
    const stats = loadStats();
    const settings = loadSettings();
    const achievements = loadUnlockedAchievements();
    const userId = this.getEffectiveUserId();

    const wallet = readJson(WALLET_STORAGE_KEY);
    const daily = readJson(DAILY_STORAGE_KEY);
    const ghost = readJson(GHOST_STORAGE_KEY);
    // The techniques practised (2026-10-08): two academy achievements count them,
    // and a phone change must not send the player back through them.
    const academy = readJson(ACADEMY_PROGRESS_KEY);

    return {
      userId,
      version: '1.1.2',
      season: 'season_0',
      syncedAt: Date.now(),
      stats,
      settings,
      achievements,
      wallet,
      daily,
      ghost,
      academy
    };
  }

  /**
   * Save player data bundle to Cloud — merged with what the cloud already holds.
   *
   * This used to upload this device's local data as-is. The snapshot is one slot
   * per account, so with the same account on two phones the phone that won last
   * replaced the other's progress; a freshly installed phone uploaded a near-empty
   * record on its first win. Now the snapshot is read first and merged with the
   * same rules restore uses (progressMerge.js).
   *
   * What the read can say, and what each means for the write:
   *
   *   empty data     no backup yet — the plugin opens with createIfNotFound, so a
   *                  missing slot comes back empty, not as an error. Upload local.
   *   data           merge, upload the merge.
   *   unparseable    nothing in it can be recovered. Upload local rather than let
   *                  one corrupt blob block every future backup.
   *   read failed    DO NOT upload. Writing over a slot we could not read is the
   *                  overwrite this exists to prevent. The local copy is still kept.
   *   not signed in / not native / no plugin — the write fails the same way anyway.
   *
   * Local game data is not changed by a save. Pulling the other phone's progress
   * into this one is restore's job, which the player chooses.
   */
  saveToCloud({ onlyIfChanged = false } = {}) {
    const task = async () => {
      // Re-read here, not at the call site: by the time this reaches the front of
      // the queue the save in front may already have uploaded these very changes.
      if (onlyIfChanged && !this.hasUnsyncedChanges()) {
        return { success: true, method: 'skipped', skipped: 'up_to_date' };
      }
      return this._saveToCloudNow();
    };
    const pending = this._saveQueue.then(task, task);
    this._saveQueue = pending.catch(() => { /* one failed save must not block the next */ });
    return pending;
  }

  async _saveToCloudNow() {
    const local = this.compileBackupPayload();
    const now = Date.now();

    let upload = local;
    let merged = false;
    let skipRemote = null;
    const remote = await playGamesService.loadSnapshot(SNAPSHOT_NAME);
    if (remote.success) {
      const raw = remote.snapshot?.data;
      if (raw) {
        try {
          upload = { ...local, ...mergeProgress(JSON.parse(raw), local), syncedAt: now };
          merged = true;
        } catch (e) {
          console.warn('[CloudSync] cloud snapshot unreadable, replacing it:', e?.message || e);
        }
      }
    } else if (remote.reason === 'error') {
      skipRemote = 'remote_unreadable';
    }
    const serialized = JSON.stringify(upload);

    // Local copy first: it is what a same-device restore reads, and it keeps
    // working when the player is signed out or offline.
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`suidoku_cloud_save_${local.userId}`, serialized);
        localStorage.setItem(LAST_SYNC_KEY, String(now));
      }
    } catch (e) {
      console.warn('[CloudSync] local copy failed:', e?.message || e);
    }

    // Real off-device backup: a Play Games saved game, restorable on any device
    // the player signs into. `method` tells the caller which of the two happened
    // — reporting plain success for a device-local write is how this code used to
    // promise a cloud backup it never made.
    const remoteSave = skipRemote
      ? { success: false, reason: skipRemote }
      : await playGamesService.saveSnapshot(
          SNAPSHOT_NAME,
          serialized,
          // No app name: the save is already listed under this game, and in Japan
          // 「Sudoku」 is Nikoli's mark (the app says ナンプレ there) — Diary 129.
          `${upload.stats?.gamesWon || 0} wins`
        );
    if (remoteSave.success) {
      try {
        const stored = readJson(REMOTE_SYNC_KEY);
        // the old single-mark shape belongs to no account; it is replaced, not merged
        const marks = stored && typeof stored === 'object' && !stored.fp && !stored.at ? stored : {};
        marks[local.userId] = { at: now, fp: fingerprint(local) };
        localStorage.setItem(REMOTE_SYNC_KEY, JSON.stringify(marks));
      } catch { /* the backup happened; only the marker is lost, so the next check re-uploads */ }
    }

    return {
      success: true,
      method: remoteSave.success ? 'play_games' : 'local_only',
      remoteReason: remoteSave.success ? null : remoteSave.reason,
      merged,
      syncedAt: now,
      userId: local.userId,
      gamesWon: upload.stats?.gamesWon || 0,
      achievementsCount: Object.keys(upload.achievements || {}).length
    };
  }

  /**
   * Restore player data from Cloud
   */
  async restoreFromCloud() {
    const userId = this.getEffectiveUserId();
    try {
      let cloudData = null;
      let source = null;

      // Play Games first — on a new device it is the only copy that exists.
      const remote = await playGamesService.loadSnapshot(SNAPSHOT_NAME);
      if (remote.success && remote.snapshot?.data) {
        try {
          cloudData = JSON.parse(remote.snapshot.data);
          source = 'play_games';
        } catch (e) {
          console.warn('[CloudSync] snapshot parse failed:', e?.message || e);
        }
      }

      if (!cloudData && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(`suidoku_cloud_save_${userId}`);
        if (raw) {
          cloudData = JSON.parse(raw);
          source = 'local_only';
        }
      }

      if (!cloudData) {
        return {
          success: false,
          error: 'NO_CLOUD_DATA',
          message: 'No existing cloud backup found for this account.'
        };
      }

      // Same rules as saveToCloud, from one place — see progressMerge.js.
      const merged = mergeProgress(cloudData, this.compileBackupPayload());
      const mergedStats = merged.stats;

      if (typeof localStorage !== 'undefined') {
        /*
         * All of it, or none of it.
         *
         * These are five separate writes, and storage can refuse partway through
         * (a full quota is the ordinary way). It used to write what it could and
         * then report failure: the player was told the restore failed while
         * their stats had already been replaced by the cloud's, with the wallet,
         * achievements, daily records and ghost times still local — a mixture
         * neither device ever had (RT-7 / F04).
         *
         * localStorage has no transaction, so this keeps the old values and puts
         * them back if any write throws. Restoring a key that was absent means
         * removing it again, which is why null is kept apart from a stored value.
         */
        const touched = [USER_STATS_KEY, WALLET_STORAGE_KEY, DAILY_STORAGE_KEY, GHOST_STORAGE_KEY,
                         ACHIEVEMENTS_STORAGE_KEY, ACADEMY_PROGRESS_KEY, LAST_SYNC_KEY];
        const before = new Map(touched.map((k) => [k, localStorage.getItem(k)]));
        try {
          localStorage.setItem(USER_STATS_KEY, JSON.stringify(mergedStats));

          // Each part is written only when the cloud carries it, so a backup that
          // predates a field does not overwrite the local value with nothing.
          if (cloudData.achievements && typeof cloudData.achievements === 'object') {
            saveUnlockedAchievements(merged.achievements);
          }
          if (cloudData.wallet) {
            localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(merged.wallet));
          }
          if (cloudData.daily && typeof cloudData.daily === 'object') {
            localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(merged.daily));
          }
          if (cloudData.ghost && typeof cloudData.ghost === 'object') {
            localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(merged.ghost));
          }
          if (cloudData.academy && typeof cloudData.academy === 'object') {
            localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(merged.academy));
          }

          localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
        } catch (e) {
          for (const [k, v] of before) {
            try {
              if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
            } catch { /* nothing else can be done; the next line reports the failure */ }
          }
          console.error('[CloudSync] restore rolled back:', e?.message || e);
          return { success: false, error: 'RESTORE_FAILED', message: e?.message || String(e) };
        }
      }

      return {
        success: true,
        source,
        restoredAt: cloudData.syncedAt,
        gamesWon: mergedStats.gamesWon,
        bestTimes: mergedStats.bestTimes
      };
    } catch (error) {
      console.error('[CloudSync] restoreFromCloud error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * The mark this account left when its last backup reached Play Games, or null.
   *
   * Installs updated from before the per-account change hold a bare { at, fp }.
   * That is read as belonging to nobody: the first backup after the update is
   * made again rather than skipped, which costs one upload and cannot lose a
   * save. The old shape is replaced the moment any backup succeeds.
   */
  _remoteMark() {
    const stored = readJson(REMOTE_SYNC_KEY);
    if (!stored || typeof stored !== 'object' || stored.fp || stored.at) return null;
    const mark = stored[this.getEffectiveUserId()];
    return mark && mark.fp ? mark : null;
  }

  /** When a backup last reached Play Games for this account, or null. Shown in Settings. */
  getLastRemoteBackup() {
    const mark = this._remoteMark();
    return mark && mark.at ? Number(mark.at) : null;
  }

  /** Has anything changed on this phone since this account's last backup? */
  hasUnsyncedChanges() {
    const mark = this._remoteMark();
    return !mark || mark.fp !== fingerprint(this.compileBackupPayload());
  }

  /**
   * Back up if there is something new and a way to send it. Called on sign-in, when
   * the connection comes back and when the app returns to the foreground — a win is
   * no longer the only moment a backup is tried, so wins played offline catch up
   * without waiting for the next win. One at a time.
   */
  async syncIfNeeded() {
    if (!playGamesService.isAuthenticated) return { skipped: 'signed_out' };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return { skipped: 'offline' };
    if (!this.hasUnsyncedChanges()) return { skipped: 'up_to_date' };
    // No in-flight flag of its own any more: the queue in saveToCloud is what
    // keeps two saves from overlapping, and it covers the win path too, which a
    // flag here never did.
    return this.saveToCloud({ onlyIfChanged: true });
  }

  /**
   * A cloud record worth offering to a phone that has none: only when this phone is
   * fresh (no game played, no achievement), the player has not been asked before on
   * this phone, and the backup holds at least one win. Returns { gamesWon } or null.
   * The question itself is the caller's — restoring silently would pull in another
   * phone's record without the player knowing where it came from.
   */
  async findRestoreOffer() {
    if (!playGamesService.isAuthenticated) return null;
    const stats = loadStats();
    const fresh = !(stats.gamesPlayed > 0) && Object.keys(loadUnlockedAchievements() || {}).length === 0;
    if (!fresh) return null;
    const userId = this.getEffectiveUserId();
    const offered = readJson(RESTORE_OFFERED_KEY) || {};
    if (offered[userId]) return null;
    const remote = await playGamesService.loadSnapshot(SNAPSHOT_NAME);
    if (!remote.success) return null;            // could not read: ask another time
    let won = 0;
    try { won = Number(JSON.parse(remote.snapshot?.data || '{}')?.stats?.gamesWon) || 0; } catch { won = 0; }
    this.markRestoreOffered();                     // read fine: this answer holds for this phone
    return won > 0 ? { gamesWon: won } : null;
  }

  markRestoreOffered() {
    try {
      const offered = readJson(RESTORE_OFFERED_KEY) || {};
      offered[this.getEffectiveUserId()] = Date.now();
      localStorage.setItem(RESTORE_OFFERED_KEY, JSON.stringify(offered));
    } catch { /* worst case the player is asked again */ }
  }
}

export const cloudSyncService = new CloudSyncService();
