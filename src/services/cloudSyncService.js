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
   * Save player data bundle to Cloud
   */
  async saveToCloud() {
    const payload = this.compileBackupPayload();
    const now = Date.now();
    const serialized = JSON.stringify(payload);

    // Local copy first: it is what a same-device restore reads, and it keeps
    // working when the player is signed out or offline.
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`suidoku_cloud_save_${payload.userId}`, serialized);
        localStorage.setItem(LAST_SYNC_KEY, String(now));
      }
    } catch (e) {
      console.warn('[CloudSync] local copy failed:', e?.message || e);
    }

    // Real off-device backup: a Play Games saved game, restorable on any device
    // the player signs into. `method` tells the caller which of the two happened
    // — reporting plain success for a device-local write is how this code used to
    // promise a cloud backup it never made.
    const remote = await playGamesService.saveSnapshot(
      SNAPSHOT_NAME,
      serialized,
      `Suidoku • ${payload.stats?.gamesWon || 0} wins`
    );

    return {
      success: true,
      method: remote.success ? 'play_games' : 'local_only',
      remoteReason: remote.success ? null : remote.reason,
      syncedAt: now,
      userId: payload.userId,
      gamesWon: payload.stats?.gamesWon || 0,
      achievementsCount: (payload.achievements || []).length
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

      // Merge stats. Spread both sides first so any field this method does not
      // know about survives — rebuilding the object from a fixed list used to
      // delete timeLimitBestTimes (survival records) on every restore.
      const localStats = loadStats();
      const cloudStats = cloudData.stats || {};
      const mergedStats = {
        ...cloudStats,
        ...localStats,
        gamesPlayed: Math.max(localStats.gamesPlayed || 0, cloudStats.gamesPlayed || 0),
        gamesWon: Math.max(localStats.gamesWon || 0, cloudStats.gamesWon || 0),
        timeLimitSurvivalWins: Math.max(localStats.timeLimitSurvivalWins || 0, cloudStats.timeLimitSurvivalWins || 0)
      };

      // Every best-time table keeps the fastest value on each level
      for (const table of ['bestTimes', 'timeAttackBestTimes', 'timeLimitBestTimes']) {
        const merged = { ...(cloudStats[table] || {}), ...(localStats[table] || {}) };
        [1, 2, 3, 4, 5].forEach((lv) => {
          const c = cloudStats[table]?.[lv];
          const l = localStats[table]?.[lv];
          if (c && l) merged[lv] = Math.min(c, l);
          else if (c) merged[lv] = c;
        });
        if (Object.keys(merged).length > 0) mergedStats[table] = merged;
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(USER_STATS_KEY, JSON.stringify(mergedStats));

        // Restore achievements
        if (cloudData.achievements && typeof cloudData.achievements === 'object') {
          const localAch = loadUnlockedAchievements();
          const mergedAch = { ...localAch, ...cloudData.achievements };
          saveUnlockedAchievements(mergedAch);
        }

        // Wallet: keep the larger hint balance and the longer streak
        if (cloudData.wallet) {
          const localW = readJson(WALLET_STORAGE_KEY) || {};
          localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
            ...cloudData.wallet,
            ...localW,
            hints: Math.max(localW.hints || 0, cloudData.wallet.hints || 0),
            streakDays: Math.max(localW.streakDays || 0, cloudData.wallet.streakDays || 0),
            totalAdsWatched: Math.max(localW.totalAdsWatched || 0, cloudData.wallet.totalAdsWatched || 0)
          }));
        }

        // Daily records and ghost PBs: union, local wins on conflict
        if (cloudData.daily && typeof cloudData.daily === 'object') {
          localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({
            ...cloudData.daily,
            ...(readJson(DAILY_STORAGE_KEY) || {})
          }));
        }
        if (cloudData.ghost && typeof cloudData.ghost === 'object') {
          const localG = readJson(GHOST_STORAGE_KEY) || {};
          localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify({
            classic: { ...(cloudData.ghost.classic || {}), ...(localG.classic || {}) },
            timeAttack: { ...(cloudData.ghost.timeAttack || {}), ...(localG.timeAttack || {}) }
          }));
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
