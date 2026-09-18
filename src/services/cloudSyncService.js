/**
 * cloudSyncService.js
 * Cross-device Cloud Save & Restore Manager.
 * 
 * Securely synchronizes user progress, Brain IQ, achievements, best times,
 * and wallet state across devices using Play Games Player ID or Anonymous UID.
 */

import { loadStats, loadSettings, getPlayGamesUser, USER_STATS_KEY } from '../utils/storage.js';
import { loadUnlockedAchievements, saveUnlockedAchievements } from '../utils/achievementManager.js';
import { WALLET_STORAGE_KEY } from '../utils/wallet.js';
import { DAILY_STORAGE_KEY } from '../utils/dailyChallenge.js';
import { GHOST_STORAGE_KEY } from '../utils/ghostManager.js';
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
// Play Games saved-game slot. Stable: changing it orphans every existing backup.
const SNAPSHOT_NAME = 'suidoku_progress_v1';

class CloudSyncService {
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
      ghost
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
  async saveToCloud() {
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
          `Suidoku • ${upload.stats?.gamesWon || 0} wins`
        );

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

        localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
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
   * Throttled auto sync triggered on game wins or milestone achievements
   */
}

export const cloudSyncService = new CloudSyncService();
