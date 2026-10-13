/**
 * Google Play Games Services bridge.
 *
 * Only leaderboards that actually exist in the Play Console are listed here.
 * The previous version carried eleven invented ids ('leaderboard_classic_lv1'
 * and friends); real ids look like 'CgkIsvv_0f4TEAIQAQ', so every one of those
 * submissions could only ever fail. Add an entry here after creating the
 * leaderboard in the console, never before.
 */

import { Capacitor } from '@capacitor/core';

/**
 * The plugin is loaded on demand rather than imported at module scope. It ships
 * no "exports" map, so Node resolves its CommonJS entry and cannot see the
 * `PlayGames` named export — a static import breaks every Node test that reaches
 * this file, while Vite (which picks the ESM entry) works. Loading it lazily also
 * keeps it out of the bundle path taken on web, where it does nothing anyway.
 */
let pluginPromise = null;

/**
 * Resolves to `{ api }`, never to the plugin object itself. A Capacitor plugin is
 * a Proxy that turns *any* property read into a native method call, `then`
 * included — so awaiting one makes JS treat it as a thenable and invoke
 * `PlayGames.then()`, which fails with "not implemented on android". Boxing it
 * keeps the proxy off the await path.
 */
function loadPlugin() {
  if (!pluginPromise) {
    pluginPromise = import('@idleflowgames/capacitor-play-games')
      .then((m) => ({ api: m.PlayGames || m.default?.PlayGames || null }))
      .catch((e) => {
        console.warn('[PlayGames] plugin unavailable:', e?.message || e);
        return { api: null };
      });
  }
  return pluginPromise;
}

// Verified against Play Console → Leaderboards (project 686829862322)
export const LEADERBOARD_IDS = {
  BRAIN_IQ: 'CgkIsvv_0f4TEAIQAQ'
};

// The forty achievements, imported into Play Console on 2026-10-10 (D11) from
// scripts/store/build_pgs_achievements.mjs. The ids come from the console's
// "Get resources" file, kept as store_assets/common/pgs_achievements/games-ids.xml;
// gate 2-30 holds this map to it, by each achievement's English name.
export const ACHIEVEMENT_IDS = {
  first_win: 'CgkIsvv_0f4TEAIQCw',
  win_5: 'CgkIsvv_0f4TEAIQHA',
  win_10: 'CgkIsvv_0f4TEAIQIA',
  win_25: 'CgkIsvv_0f4TEAIQBg',
  win_50: 'CgkIsvv_0f4TEAIQIg',
  win_100: 'CgkIsvv_0f4TEAIQDw',
  win_250: 'CgkIsvv_0f4TEAIQGA',
  visit_30: 'CgkIsvv_0f4TEAIQCQ',
  visit_100: 'CgkIsvv_0f4TEAIQFg',
  visit_365: 'CgkIsvv_0f4TEAIQEg',
  flawless_1: 'CgkIsvv_0f4TEAIQDg',
  flawless_5: 'CgkIsvv_0f4TEAIQHg',
  pure_logic_expert: 'CgkIsvv_0f4TEAIQGg',
  pure_logic_master: 'CgkIsvv_0f4TEAIQKA',
  note_master: 'CgkIsvv_0f4TEAIQDA',
  no_notes: 'CgkIsvv_0f4TEAIQFA',
  fast_entry_fan: 'CgkIsvv_0f4TEAIQGQ',
  rank_s_plus: 'CgkIsvv_0f4TEAIQFQ',
  speed_runner_3m: 'CgkIsvv_0f4TEAIQAw',
  speed_runner_2m: 'CgkIsvv_0f4TEAIQCg',
  combo_streak_5: 'CgkIsvv_0f4TEAIQHQ',
  combo_streak_10: 'CgkIsvv_0f4TEAIQJQ',
  clear_lv1: 'CgkIsvv_0f4TEAIQJw',
  clear_lv2: 'CgkIsvv_0f4TEAIQEw',
  clear_lv3: 'CgkIsvv_0f4TEAIQBQ',
  clear_lv4: 'CgkIsvv_0f4TEAIQKQ',
  clear_lv5: 'CgkIsvv_0f4TEAIQIw',
  survival_hero: 'CgkIsvv_0f4TEAIQKg',
  survival_clutch: 'CgkIsvv_0f4TEAIQEQ',
  killer_first: 'CgkIsvv_0f4TEAIQBA',
  killer_lv3: 'CgkIsvv_0f4TEAIQGw',
  killer_win_25: 'CgkIsvv_0f4TEAIQDQ',
  killer_lv5: 'CgkIsvv_0f4TEAIQFw',
  daily_first: 'CgkIsvv_0f4TEAIQHw',
  daily_streak_7: 'CgkIsvv_0f4TEAIQBw',
  battle_first_win: 'CgkIsvv_0f4TEAIQEA',
  iq_150: 'CgkIsvv_0f4TEAIQJg',
  academy_first_lesson: 'CgkIsvv_0f4TEAIQIQ',
  academy_stage3: 'CgkIsvv_0f4TEAIQCA',
  academy_all: 'CgkIsvv_0f4TEAIQJA',
};

class PlayGamesService {
  constructor() {
    this.isAuthenticated = false;
    this.userGamerTag = null;
    this.initialized = false;
  }

  isNative() {
    try {
      return Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }

  /** Initialize the native SDK once. Safe to call repeatedly. */
  async init() {
    if (this.initialized || !this.isNative()) return;
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return;
      await pg.initialize();
      this.initialized = true;
    } catch (e) {
      console.warn('[PlayGames] initialize failed:', e?.message || e);
    }
  }

  /**
   * @param {boolean} interactive pass true only from an explicit user gesture
   */
  async signIn(interactive = false) {
    if (!this.isNative()) return { success: false, reason: 'not_native' };
    await this.init();
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return { success: false, reason: 'no_plugin' };
      const res = await pg.signIn({ silent: !interactive });
      this.isAuthenticated = Boolean(res?.signedIn);
      this.userGamerTag = res?.player?.displayName || null;
      return {
        success: this.isAuthenticated,
        gamerTag: this.userGamerTag,
        playerId: res?.player?.playerId || null
      };
    } catch (e) {
      console.warn('[PlayGames] signIn failed:', e?.message || e);
      this.isAuthenticated = false;
      return { success: false, reason: 'error', error: e?.message };
    }
  }

  async isSignedIn() {
    if (!this.isNative()) return false;
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return false;
      const res = await pg.isSignedIn();
      this.isAuthenticated = Boolean(res?.signedIn);
      return this.isAuthenticated;
    } catch {
      return false;
    }
  }

  async getPlayer() {
    if (!this.isNative() || !this.isAuthenticated) return null;
    try {
      const { api: pg } = await loadPlugin();
      return pg ? await pg.getPlayer() : null;
    } catch {
      return null;
    }
  }

  /**
   * Submit a Brain IQ score. Returns why it was skipped rather than pretending
   * to succeed — the old version always reported success, so a broken
   * integration was indistinguishable from a working one.
   */
  async submitBrainIQ(iqScore) {
    const score = Math.round(Number(iqScore) || 100);
    if (!this.isNative()) return { success: false, reason: 'not_native' };
    if (!this.isAuthenticated) return { success: false, reason: 'signed_out' };
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return { success: false, reason: 'no_plugin' };
      await pg.submitScore({ leaderboardId: LEADERBOARD_IDS.BRAIN_IQ, score });
      return { success: true, leaderboardId: LEADERBOARD_IDS.BRAIN_IQ, score };
    } catch (e) {
      console.warn('[PlayGames] submitBrainIQ failed:', e?.message || e);
      return { success: false, reason: 'error', error: e?.message };
    }
  }

  /**
   * Per-mode speedrun boards do not exist in the console yet, so there is
   * nothing to submit to. Kept as a named no-op so callers stay unchanged.
   */
  async submitScore(mode, level, scoreSeconds) {
    return { success: false, reason: 'no_leaderboard_for_mode', mode, level, scoreSeconds };
  }

  async unlockAchievement(achievementKey) {
    const achievementId = ACHIEVEMENT_IDS[achievementKey];
    if (!achievementId) return { success: false, reason: 'not_configured', achievementKey };
    if (!this.isNative() || !this.isAuthenticated) return { success: false, reason: 'signed_out' };
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return { success: false, reason: 'no_plugin' };
      await pg.unlockAchievement({ id: achievementId });
      return { success: true, achievementId };
    } catch (e) {
      console.warn('[PlayGames] unlockAchievement failed:', e?.message || e);
      return { success: false, reason: 'error', error: e?.message };
    }
  }

  /** Google's own achievements screen — what Play Games shows the player. */
  async showAchievements() {
    if (!this.isNative() || !this.isAuthenticated) return { success: false, reason: 'signed_out' };
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return { success: false, reason: 'no_plugin' };
      await pg.showAchievements();
      return { success: true };
    } catch (e) {
      console.warn('[PlayGames] showAchievements failed:', e?.message || e);
      return { success: false, reason: 'error' };
    }
  }

  async showLeaderboards() {
    if (!this.isNative() || !this.isAuthenticated) return { success: false, reason: 'signed_out' };
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return { success: false, reason: 'no_plugin' };
      await pg.showAllLeaderboards();
      return { success: true };
    } catch (e) {
      console.warn('[PlayGames] showLeaderboards failed:', e?.message || e);
      return { success: false, reason: 'error' };
    }
  }

  // ---- Saved Games (cloud backup) ----

  async saveSnapshot(name, data, description = '') {
    if (!this.isNative()) return { success: false, reason: 'not_native' };
    if (!this.isAuthenticated) return { success: false, reason: 'signed_out' };
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return { success: false, reason: 'no_plugin' };
      await pg.saveSnapshot({ name, data, description });
      return { success: true };
    } catch (e) {
      console.warn('[PlayGames] saveSnapshot failed:', e?.message || e);
      return { success: false, reason: 'error', error: e?.message };
    }
  }

  async loadSnapshot(name) {
    if (!this.isNative()) return { success: false, reason: 'not_native' };
    if (!this.isAuthenticated) return { success: false, reason: 'signed_out' };
    try {
      const { api: pg } = await loadPlugin();
      if (!pg) return { success: false, reason: 'no_plugin' };
      const res = await pg.loadSnapshot({ name });
      return { success: true, snapshot: res?.snapshot || null };
    } catch (e) {
      console.warn('[PlayGames] loadSnapshot failed:', e?.message || e);
      return { success: false, reason: 'error', error: e?.message };
    }
  }
}

export const playGamesService = new PlayGamesService();
