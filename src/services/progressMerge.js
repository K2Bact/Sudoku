/**
 * progressMerge.js
 * How two copies of a player's progress become one. Pure: reads and writes nothing.
 *
 * ── Why this is its own file ──────────────────────────────────────────────
 * These rules used to live inside restoreFromCloud and nowhere else. Saving did
 * not merge at all: every win called saveToCloud, which wrote this device's
 * local data over the single Play Games snapshot. With one account on two
 * phones, the phone that won last replaced the other's progress in the cloud —
 * a freshly installed phone winning its first game uploaded a near-empty
 * record over months of play. The other phone kept its own copy, so nothing
 * looked wrong until that phone was reset and restored from the cloud.
 *
 * Save now merges with what is already in the cloud before uploading, using
 * exactly the rules restore uses. Two copies of the rules would drift, and a
 * save that merges differently from restore would make the cloud disagree with
 * what a restore puts back. So both call this.
 *
 * ── The rules, unchanged from restore ─────────────────────────────────────
 *   counts (played, won, survival wins)   larger
 *   best times, per level                 faster
 *   other stats fields                    local wins, cloud fills gaps
 *   achievements                          union, cloud wins a shared key
 *   wallet                                hints / streak / ads watched: larger
 *   daily records, ghost PBs              union, local wins a shared key
 *
 * Known limit, recorded rather than fixed here: hints are spendable, and "larger"
 * means a hint spent on one phone reappears after a merge with a phone that still
 * had it. A correct rule needs a per-device ledger, not a max.
 */

const BEST_TIME_TABLES = ['bestTimes', 'timeAttackBestTimes', 'timeLimitBestTimes'];

export function mergeStats(cloudStats = {}, localStats = {}) {
  // Spread both sides first so any field this does not know about survives —
  // rebuilding from a fixed list used to delete timeLimitBestTimes on restore.
  const merged = {
    ...cloudStats,
    ...localStats,
    gamesPlayed: Math.max(localStats.gamesPlayed || 0, cloudStats.gamesPlayed || 0),
    gamesWon: Math.max(localStats.gamesWon || 0, cloudStats.gamesWon || 0),
    timeLimitSurvivalWins: Math.max(localStats.timeLimitSurvivalWins || 0, cloudStats.timeLimitSurvivalWins || 0),
  };
  for (const table of BEST_TIME_TABLES) {
    const out = { ...(cloudStats[table] || {}), ...(localStats[table] || {}) };
    [1, 2, 3, 4, 5].forEach((lv) => {
      const c = cloudStats[table]?.[lv];
      const l = localStats[table]?.[lv];
      if (c && l) out[lv] = Math.min(c, l);
      else if (c) out[lv] = c;
    });
    if (Object.keys(out).length > 0) merged[table] = out;
  }
  return merged;
}

const isObject = (v) => Boolean(v) && typeof v === 'object';

/**
 * Merge a cloud payload into a local one. Returns the merged progress fields;
 * a field the cloud does not carry comes back as the local value untouched.
 *
 * @param cloud  a parsed backup payload (or null)
 * @param local  a payload shaped like CloudSyncService.compileBackupPayload()
 */
export function mergeProgress(cloud, local) {
  const c = cloud || {};
  const l = local || {};

  const achievements = isObject(c.achievements)
    ? { ...(l.achievements || {}), ...c.achievements }
    : l.achievements;

  const wallet = c.wallet
    ? (() => {
        const lw = l.wallet || {};
        return {
          ...c.wallet,
          ...lw,
          hints: Math.max(lw.hints || 0, c.wallet.hints || 0),
          streakDays: Math.max(lw.streakDays || 0, c.wallet.streakDays || 0),
          totalAdsWatched: Math.max(lw.totalAdsWatched || 0, c.wallet.totalAdsWatched || 0),
        };
      })()
    : l.wallet;

  const daily = isObject(c.daily) ? { ...c.daily, ...(l.daily || {}) } : l.daily;

  const ghost = isObject(c.ghost)
    ? {
        classic: { ...(c.ghost.classic || {}), ...((l.ghost || {}).classic || {}) },
        timeAttack: { ...(c.ghost.timeAttack || {}), ...((l.ghost || {}).timeAttack || {}) },
      }
    : l.ghost;

  return {
    stats: mergeStats(c.stats || {}, l.stats || {}),
    achievements,
    wallet,
    daily,
    ghost,
  };
}
