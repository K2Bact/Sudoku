/**
 * ghostManager.js
 * Storage manager, pace calculator, and ghost board registry for Ghost Mode & Delta Time.
 *
 * One table for both kinds of puzzle (2026-10-14, BACKLOG KP-3):
 *
 *   { classic: { [level]: ghost }, timeAttack: { … },             ← classic, as always
 *     killer:  { classic: { [level]: ghost }, timeAttack: { … } } }
 *
 * The classic slots stay at the top where every earlier version wrote them, so a
 * ghost already on a phone or in a cloud backup is found where it was. A killer
 * keeps the same two slots one level down. The kind only chooses the slot
 * (ghostSlot); everything else — the record rule, the pace — is the same code.
 * Until then a killer had no slot at all: its run would have raced classic players.
 */

import { loadStats, recordOf } from './storage.js';
import { isValidCageSet } from '../engine/variants.js';

// Exported so sync/backup code cannot drift onto a different key string.
export const GHOST_STORAGE_KEY = 'suidoku_ghost_records_v1';

const table = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

// The modes that race a ghost: the two slots each kind keeps. Survival races its
// clock instead (RivalModeChips), and that clock is the time LEFT; a duel is
// raced against someone and keeps no best time (storage.js, BT-1). Neither has a
// slot, and neither borrows Classic's. Every mode that was not Speedrun used to
// land there, so a Survival win wrote its time left, and a 1v1 its duel time,
// over the Classic ghost (BACKLOG D19, 2026-10-14).
const GHOST_MODES = new Set(['classic', 'timeAttack']);

/** Every slot present, whatever the stored copy holds (or lacks). */
function normalise(parsed) {
  const p = table(parsed);
  const killer = table(p.killer);
  return {
    classic: table(p.classic),
    timeAttack: table(p.timeAttack),
    killer: { classic: table(killer.classic), timeAttack: table(killer.timeAttack) }
  };
}

/**
 * A Classic ghost no Classic win wrote (D19). Until 2026-10-14 every mode that
 * was not Speedrun landed in this slot, so a phone or a backup can hold a
 * Survival win's time LEFT here, or a duel's time. Told apart by two things a
 * Classic win cannot produce:
 *  - It is faster than the Classic best time of its level, or the level has
 *    none. A Classic win writes both from one time by one rule (gameCompletion
 *    → recordGameWin, then recordGhostRun), so its ghost is never the faster.
 *  - Its pace goes back in time. A Classic clock only counts up; Survival's
 *    loses the seconds between cells and gains 7 s for each.
 * Only Classic's slot: nothing else was ever written into the wrong place, and a
 * Speedrun clock does go down (a combo takes seconds off).
 */
function isStrayClassicGhost(ghost, bestTime) {
  if (!ghost || typeof ghost.bestSeconds !== 'number') return false;
  if (!(typeof bestTime === 'number' && bestTime > 0) || ghost.bestSeconds < bestTime) return true;
  const times = Array.isArray(ghost.timeline) ? ghost.timeline.map((e) => e?.time) : [];
  return times.some((time, i) => i > 0 && time < times[i - 1]);
}

/**
 * Read as no ghost, never deleted on purpose (user, 2026-10-14: "읽을 때 버림").
 * The chip and Time Gap fall back to the Classic best time, and the next Classic
 * win at that level is a new record and writes over it. A copy can sit in the
 * cloud until then — the merge hands it back, and this drops it again.
 */
function withoutStrayClassicGhosts(records) {
  const bestTimes = loadStats().bestTimes || {};
  for (const level of Object.keys(records.classic)) {
    if (isStrayClassicGhost(records.classic[level], bestTimes[level])) delete records.classic[level];
  }
  return records;
}

export function loadGhostRecords() {
  try {
    const raw = localStorage.getItem(GHOST_STORAGE_KEY);
    return withoutStrayClassicGhosts(normalise(raw ? JSON.parse(raw) : null));
  } catch (e) {
    console.error('Failed to load ghost records:', e);
    return normalise(null);
  }
}

/**
 * The table one kind and mode keep their ghosts in, by level — null for a mode
 * that keeps none (GHOST_MODES), whichever the kind: killer Survival (KP-2) is
 * turned away here like classic's. Reads and writes the given records object
 * (it is the caller's loaded copy).
 */
export function ghostSlot(records, variant = 'classic', mode = 'classic') {
  if (!GHOST_MODES.has(mode)) return null;
  const kind = variant === 'killer' ? records.killer : records;
  return kind[mode];
}

export function saveGhostRecords(data) {
  try {
    localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save ghost records:', e);
  }
}

/**
 * Get ghost record for a specific mode and level, of the given kind of puzzle.
 */
export function getGhostForModeLevel(mode = 'classic', level = 3, variant = 'classic') {
  const slot = ghostSlot(loadGhostRecords(), variant, mode);
  if (!slot) return null;
  const ghost = slot[level];

  if (ghost && typeof ghost.bestSeconds === 'number') {
    return ghost;
  }

  // Fallback check against the best times of the same kind (storage.js recordOf).
  const stats = recordOf(loadStats(), variant);
  const fallbackTime = mode === 'timeAttack'
    ? stats.timeAttackBestTimes?.[level]
    : stats.bestTimes?.[level];

  if (fallbackTime && typeof fallbackTime === 'number') {
    return {
      bestSeconds: fallbackTime,
      seed: null,
      puzzle: null,
      solution: null,
      totalEmptyCells: 40,
      timeline: []
    };
  }

  return null;
}

/**
 * Record a game completion for Ghost & PB tracking
 * Strictly enforces 0-hint policy for official PB records.
 *
 * variant: the kind of puzzle — it chooses the slot and nothing else. A killer
 * ghost also keeps its cages: its givens (often none) are not a puzzle without them.
 */
export function recordGhostRun(mode = 'classic', level = 3, runData = {}, variant = 'classic') {
  const {
    timeSeconds,
    hintsUsed = 0,
    countsAsRecord = true,
    seed = null,
    puzzle = null,
    solution = null,
    cages = null,
    totalEmptyCells = 40,
    timeline = []
  } = runData;

  if (typeof timeSeconds !== 'number' || timeSeconds <= 0) {
    return { isNewRecord: false, reason: 'invalid_time' };
  }

  // Pure logic policy: 0 hints required for PB record
  if (hintsUsed > 0) {
    return { isNewRecord: false, reason: 'hint_used' };
  }
  if (!countsAsRecord) {
    return { isNewRecord: false, reason: 'not_eligible' };
  }

  const records = loadGhostRecords();
  const slot = ghostSlot(records, variant, mode);
  // Survival and duels: a win, but no ghost to race (D19).
  if (!slot) {
    return { isNewRecord: false, reason: 'no_ghost_for_mode' };
  }

  const currentGhost = slot[level];
  const isNewRecord = !currentGhost || timeSeconds < currentGhost.bestSeconds;

  if (isNewRecord) {
    const newGhost = {
      bestSeconds: timeSeconds,
      seed,
      puzzle,
      solution,
      // Only a killer's: a classic ghost keeps the shape it always had.
      ...(variant === 'killer' ? { variant: 'killer', cages } : {}),
      totalEmptyCells,
      timeline,
      recordedAt: new Date().toISOString()
    };
    slot[level] = newGhost;
    saveGhostRecords(records);
    return { isNewRecord: true, oldRecord: currentGhost, newRecord: newGhost };
  }

  return { isNewRecord: false, currentRecord: currentGhost };
}

/**
 * The puzzle a Ghost race deals: the one the record was set on, in the form
 * startNewGame takes a puzzle handed in (puzzleSetup.js startingPuzzle) — for a
 * killer with its kind and cages, or it would come back as a classic board of
 * almost no givens. null when there is nothing to replay: a time read from the
 * stats has no board, and a killer whose cages did not survive (a damaged backup)
 * cannot be drawn. The caller then deals a new puzzle and races the time alone.
 */
export function ghostPuzzle(ghost, variant = 'classic') {
  const board = ghost?.puzzle || ghost?.board;
  if (!board) return null;
  const puzzle = { board, solution: ghost.solution, seed: ghost.seed };
  if (variant !== 'killer') return puzzle;
  return isValidCageSet(ghost.cages) ? { ...puzzle, variant: 'killer', cages: ghost.cages } : null;
}

/**
 * Calculate Delta Time and live Pace against Ghost PB
 */
export function calculateDeltaPace(elapsedSeconds = 0, filledCount = 0, totalEmptyCount = 40, ghostRecord = null) {
  if (!ghostRecord || typeof ghostRecord.bestSeconds !== 'number' || ghostRecord.bestSeconds <= 0) {
    return {
      isAhead: true,
      deltaSeconds: 0,
      deltaText: '0.0s',
      currentPct: 0,
      ghostPct: 0,
      ghostFilledCount: 0,
      pbSeconds: 0
    };
  }

  const safeTotal = totalEmptyCount > 0 ? totalEmptyCount : 40;
  const currentPct = Math.min(100, Math.max(0, (filledCount / safeTotal) * 100));
  const pbSeconds = ghostRecord.bestSeconds;

  // Expected seconds needed to reach current progress percentage
  const expectedSeconds = (currentPct / 100) * pbSeconds;
  const deltaSeconds = elapsedSeconds - expectedSeconds;
  const isAhead = deltaSeconds <= 0;
  const absDelta = Math.abs(deltaSeconds);

  let deltaText = '0.0s';
  if (absDelta >= 0.1) {
    deltaText = `${isAhead ? '+' : '-'}${absDelta.toFixed(1)}s`;
  }

  const ghostPct = Math.min(100, (elapsedSeconds / pbSeconds) * 100);
  let ghostFilledCount = Math.min(safeTotal, Math.floor((elapsedSeconds / pbSeconds) * safeTotal));

  if (Array.isArray(ghostRecord.timeline) && ghostRecord.timeline.length > 0) {
    const pastEntries = ghostRecord.timeline.filter(e => e.time <= elapsedSeconds);
    if (pastEntries.length > 0) {
      ghostFilledCount = Math.min(safeTotal, pastEntries[pastEntries.length - 1].count || ghostFilledCount);
    }
  }

  return {
    isAhead,
    deltaSeconds,
    deltaText,
    currentPct,
    ghostPct,
    ghostFilledCount,
    pbSeconds
  };
}
