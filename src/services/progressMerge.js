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
 *   killer record (stats.killer)          the same rules: its games together,
 *                                         its best times the faster per level
 *   other stats fields                    local wins, cloud fills gaps
 *   achievements                          union, cloud wins a shared key
 *   wallet                                hints / streak / ads watched: larger
 *   daily records, ghost PBs              union, local wins a shared key
 *
 * Known limit, recorded rather than fixed here: hints are spendable, and "larger"
 * means a hint spent on one phone reappears after a merge with a phone that still
 * had it. A correct rule needs a per-device ledger, not a max.
 *
 * ── A value that is not what its field holds counts as missing (RT-6 / F03) ─
 * A backup that parses is not a backup that is valid. Restoring one that carried
 * gamesPlayed 'broken' and bestTimes[5] = -10 succeeded: Math.max over a string
 * gave NaN, NaN became null when saved, and -10 became the fastest time ever set.
 * Every rule above now reads its inputs through the checks below, and a value
 * that fails them is treated as absent — the other side's value stands. A damaged
 * backup can fail to add anything; it cannot take anything away from the phone.
 */

const BEST_TIME_TABLES = ['bestTimes', 'timeAttackBestTimes', 'timeLimitBestTimes'];
const LEVELS = [1, 2, 3, 4, 5];

const isObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
/** A count: a finite whole number, zero or more. Anything else is missing. */
const count = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : null);
/** A solve time: finite seconds above zero. */
const seconds = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
/** The larger of two counts, ignoring whichever is not one. */
const larger = (a, b) => {
  const x = count(a);
  const y = count(b);
  if (x === null) return y ?? 0;
  return y === null ? x : Math.max(x, y);
};
/** Fields holding counts that merge as "local wins, cloud fills a gap". */
const LOCAL_COUNTS = ['flawlessWins', 'maxCombo'];

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
  const played = (s) => count(s.gamesPlayed) ?? 0;
  const won = (s) => Math.min(count(s.gamesWon) ?? 0, played(s));
  const lost = (s) => played(s) - won(s);

  const gamesWon = Math.max(won(localStats), won(cloudStats));
  const gamesPlayed = Math.max(
    played(localStats), played(cloudStats),
    gamesWon + Math.max(lost(localStats), lost(cloudStats))
  );
  return { gamesPlayed, gamesWon };
}

/**
 * The cloud's contribution to "cloud fills gaps": its fields the phone lacks, kept
 * only when they hold what such a field can hold. The app writes counts and tables
 * (objects) into stats and nothing else, so a cloud-only string, array, negative or
 * non-finite number is dropped rather than carried onto the phone.
 */
function cloudGaps(cloudStats, localStats) {
  const out = {};
  for (const [k, v] of Object.entries(cloudStats)) {
    if (k in localStats) continue;
    if (count(v) !== null || isObject(v) || typeof v === 'boolean') out[k] = typeof v === 'number' ? count(v) : v;
  }
  return out;
}

/** Two best-time tables, level by level: the faster time, or whichever side has one. */
function mergeTimes(cloudTable, localTable) {
  const c = isObject(cloudTable) ? cloudTable : {};
  const l = isObject(localTable) ? localTable : {};
  const out = { ...l };
  LEVELS.forEach((lv) => {
    const ct = seconds(c[lv]);
    const lt = seconds(l[lv]);
    if (ct !== null && lt !== null) out[lv] = Math.min(ct, lt);
    else if (ct !== null || lt !== null) out[lv] = ct ?? lt;
    else if (lv in out) out[lv] = null;
  });
  return out;
}

export function mergeStats(cloudStats = {}, localStats = {}) {
  const cloud = isObject(cloudStats) ? cloudStats : {};
  const local = isObject(localStats) ? localStats : {};
  // Spread both sides first so any field this does not know about survives —
  // rebuilding from a fixed list used to delete timeLimitBestTimes on restore.
  const merged = {
    ...cloudGaps(cloud, local),
    ...local,
    ...mergeGameCounts(cloud, local),
    timeLimitSurvivalWins: larger(local.timeLimitSurvivalWins, cloud.timeLimitSurvivalWins),
  };
  // Local wins these, but not with a value that is not a count: the cloud's stands in.
  for (const k of LOCAL_COUNTS) {
    const v = count(local[k]) ?? count(cloud[k]);
    if (v === null) delete merged[k];
    else merged[k] = v;
  }
  for (const table of BEST_TIME_TABLES) {
    const out = mergeTimes(cloud[table], local[table]);
    if (Object.keys(out).length > 0) merged[table] = out;
    else delete merged[table];
  }
  // The killer record sits inside stats as one object. Spread as an unknown
  // field it would come through whole from the local side, and a killer won on
  // the other phone would be lost the next time this phone saved.
  if (isObject(cloud.killer) || isObject(local.killer)) {
    const c = isObject(cloud.killer) ? cloud.killer : {};
    const l = isObject(local.killer) ? local.killer : {};
    merged.killer = { ...mergeGameCounts(c, l), bestTimes: mergeTimes(c.bestTimes, l.bestTimes) };
  }
  // Levels cleared without a hint: a level cleared on either device stays cleared.
  // The app writes `true`; nothing else counts as cleared.
  const cleared = {};
  for (const src of [cloud.clearedLevels, local.clearedLevels]) {
    if (!isObject(src)) continue;
    for (const [lv, v] of Object.entries(src)) if (v === true) cleared[lv] = true;
  }
  if (Object.keys(cleared).length > 0) merged.clearedLevels = cleared;
  else delete merged.clearedLevels;
  return merged;
}

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

  // Only entries shaped like entries: a daily record is an object, a ghost is an
  // object with a real time. An unlock is an object ({ unlockedAt, … }) in every
  // version of the app; `true` or a timestamp still reads as unlocked, so those pass.
  const entries = (src, ok) => (isObject(src) ? Object.fromEntries(Object.entries(src).filter(([, v]) => ok(v))) : {});
  const isGhost = (g) => isObject(g) && seconds(g.bestSeconds) !== null;
  const isUnlock = (v) => isObject(v) || v === true || seconds(v) !== null;

  // Cloud wins a shared key — but only with an unlock, never with a stray value.
  const achievements = isObject(c.achievements)
    ? { ...(l.achievements || {}), ...entries(c.achievements, isUnlock) }
    : l.achievements;

  const wallet = isObject(c.wallet)
    ? (() => {
        const lw = l.wallet || {};
        return {
          ...c.wallet,
          ...lw,
          hints: larger(lw.hints, c.wallet.hints),
          streakDays: larger(lw.streakDays, c.wallet.streakDays),
          totalAdsWatched: larger(lw.totalAdsWatched, c.wallet.totalAdsWatched),
        };
      })()
    : l.wallet;

  const daily = isObject(c.daily) ? { ...entries(c.daily, isObject), ...(l.daily || {}) } : l.daily;

  const ghost = isObject(c.ghost)
    ? {
        classic: { ...entries(c.ghost.classic, isGhost), ...entries((l.ghost || {}).classic, isGhost) },
        timeAttack: { ...entries(c.ghost.timeAttack, isGhost), ...entries((l.ghost || {}).timeAttack, isGhost) },
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
