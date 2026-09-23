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
 *   games played / won                    together, never a rate neither phone had
 *   survival wins                         larger
 *   best times, per level                 faster
 *   levels cleared without a hint         union
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

/**
 * Games played and games won, which cannot be merged one at a time.
 *
 * Both used to take the larger value separately. Phone A with 10 played / 10 won
 * and phone B with 10 played / 0 won merged to 10 played / 10 won — a perfect
 * record built out of a phone that had never won (MG-1). The win rate is part of
 * the Logic Score that goes to the leaderboard, so the inflation is visible to
 * everyone.
 *
 * The honest merge needs a per-device ledger, which this file's header already
 * records as missing for hints; the same is true here. What can be done without
 * one is to stop the total from contradicting itself. Losses are known per side
 * (played − won), and however the two histories overlap, the merged history must
 * contain at least the wins of the better side AND at least the losses of the
 * side that lost most. So:
 *
 *   won    = the larger of the two
 *   played = at least the larger of the two, and at least won + the larger loss count
 *
 * A(10/10) + B(10/0) now gives 20 played / 10 won — 50%, which is what actually
 * happened. Merging a device with its own older backup changes nothing, and
 * merging the result again gives the same answer, so repeated saves do not drift.
 */
function mergeGameCounts(cloudStats = {}, localStats = {}) {
  const played = (s) => Math.max(0, Number(s.gamesPlayed) || 0);
  const won = (s) => Math.max(0, Number(s.gamesWon) || 0);
  const lost = (s) => Math.max(0, played(s) - won(s));

  const gamesWon = Math.max(won(localStats), won(cloudStats));
  const gamesPlayed = Math.max(
    played(localStats), played(cloudStats),
    gamesWon + Math.max(lost(localStats), lost(cloudStats))
  );
  return { gamesPlayed, gamesWon };
}

export function mergeStats(cloudStats = {}, localStats = {}) {
  // Spread both sides first so any field this does not know about survives —
  // rebuilding from a fixed list used to delete timeLimitBestTimes on restore.
  const merged = {
    ...cloudStats,
    ...localStats,
    ...mergeGameCounts(cloudStats, localStats),
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
  // Levels cleared without a hint: a level cleared on either device stays cleared.
  const cleared = { ...(cloudStats.clearedLevels || {}), ...(localStats.clearedLevels || {}) };
  if (Object.keys(cleared).length > 0) merged.clearedLevels = cleared;
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
