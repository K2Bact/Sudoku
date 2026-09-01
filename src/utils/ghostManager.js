/**
 * ghostManager.js
 * Storage manager, pace calculator, and ghost board registry for Ghost Mode & Delta Time.
 */

import { loadStats } from './storage.js';

const GHOST_STORAGE_KEY = 'suidoku_ghost_records_v1';

export function loadGhostRecords() {
  try {
    const raw = localStorage.getItem(GHOST_STORAGE_KEY);
    if (!raw) return { classic: {}, timeAttack: {} };
    const parsed = JSON.parse(raw);
    return {
      classic: parsed.classic || {},
      timeAttack: parsed.timeAttack || {}
    };
  } catch (e) {
    console.error('Failed to load ghost records:', e);
    return { classic: {}, timeAttack: {} };
  }
}

export function saveGhostRecords(data) {
  try {
    localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save ghost records:', e);
  }
}

/**
 * Get ghost record for a specific mode and level
 */
export function getGhostForModeLevel(mode = 'classic', level = 3) {
  const records = loadGhostRecords();
  const modeKey = mode === 'timeAttack' ? 'timeAttack' : 'classic';
  const ghost = records[modeKey]?.[level];
  
  if (ghost && typeof ghost.bestSeconds === 'number') {
    return ghost;
  }

  // Fallback check against user stats bestTimes
  const stats = loadStats();
  const fallbackTime = modeKey === 'timeAttack'
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
 */
export function recordGhostRun(mode = 'classic', level = 3, runData = {}) {
  const {
    timeSeconds,
    hintsUsed = 0,
    seed = null,
    puzzle = null,
    solution = null,
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

  const records = loadGhostRecords();
  const modeKey = mode === 'timeAttack' ? 'timeAttack' : 'classic';
  if (!records[modeKey]) records[modeKey] = {};

  const currentGhost = records[modeKey][level];
  const isNewRecord = !currentGhost || timeSeconds < currentGhost.bestSeconds;

  if (isNewRecord) {
    const newGhost = {
      bestSeconds: timeSeconds,
      seed,
      puzzle,
      solution,
      totalEmptyCells,
      timeline,
      recordedAt: new Date().toISOString()
    };
    records[modeKey][level] = newGhost;
    saveGhostRecords(records);
    return { isNewRecord: true, oldRecord: currentGhost, newRecord: newGhost };
  }

  return { isNewRecord: false, currentRecord: currentGhost };
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
