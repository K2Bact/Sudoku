/**
 * replayStore.js — the 1v1 replays kept on this phone.
 *
 * The last KEEP_RECENT matches, plus up to KEEP_PINNED the player starred. An
 * unpinned replay falls off the end as new matches come in; a pinned one stays
 * until it is unpinned (I-1, user 2026-09-30: "최근 20판 + 즐겨찾기 고정").
 *
 * Only this phone. Every record has a stable id (room + match number), so a
 * later cloud backup can merge replays by id without a new merge rule.
 *
 * Nothing here may break a game: every read tolerates damage (a record that does
 * not normalize is dropped), every write is best effort, and a full storage
 * quota sheds the oldest unpinned replays and tries again.
 */
import { normalizeRecord } from './replayRecord.js';

export const REPLAY_STORAGE_KEY = 'suidoku_replays_v1';
export const KEEP_RECENT = 20;
export const KEEP_PINNED = 20;
/**
 * Replays share localStorage with the game in progress and everything else the
 * app keeps. Typical games are a few KB, but forty very long ones could reach
 * megabytes and crowd out the saved game. Past this, the oldest unpinned go first.
 */
export const REPLAY_BUDGET_CHARS = 2000000;

function readAll() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(REPLAY_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.map(normalizeRecord).filter(Boolean) : [];
  } catch {
    return [];
  }
}

/** Newest first, pinned ones kept past the recent limit. */
function trim(list) {
  const sorted = [...list].sort((a, b) => b.savedAt - a.savedAt);
  const pinned = sorted.filter((r) => r.pinned).slice(0, KEEP_PINNED);
  const recent = sorted.filter((r) => !r.pinned).slice(0, KEEP_RECENT);
  return [...pinned, ...recent].sort((a, b) => b.savedAt - a.savedAt);
}

// Screens that show replays (the result modal's share line, the replay screen)
// hear about every write — the opponent's moves arrive after the match ends.
const listeners = new Set();
export function subscribeReplays(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function announce() {
  for (const cb of listeners) { try { cb(); } catch { /* a listener's fault is its own */ } }
}

function writeAll(list) {
  if (typeof localStorage === 'undefined') return false;
  let keep = trim(list);
  let size = JSON.stringify(keep).length;
  while (size > REPLAY_BUDGET_CHARS) {
    const oldest = [...keep].reverse().find((r) => !r.pinned);
    if (!oldest) break;
    keep = keep.filter((r) => r !== oldest);
    size = JSON.stringify(keep).length;
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      localStorage.setItem(REPLAY_STORAGE_KEY, JSON.stringify(keep));
      announce();
      return true;
    } catch {
      // Most likely the quota. Shed the oldest half of the unpinned replays.
      const unpinned = keep.filter((r) => !r.pinned);
      if (!unpinned.length) return false;
      const drop = new Set(unpinned.slice(Math.ceil(unpinned.length / 2)).map((r) => r.id));
      keep = keep.filter((r) => !drop.has(r.id));
    }
  }
  return false;
}

export function listReplays() {
  return trim(readAll());
}

export function getReplay(id) {
  return readAll().find((r) => r.id === id) || null;
}

/** Insert or replace by id. Returns the stored record, or null if it was not valid. */
export function saveReplay(record) {
  const clean = normalizeRecord(record);
  if (!clean) return null;
  const all = readAll();
  if (all.find((r) => r.id === clean.id)?.pinned) clean.pinned = true;
  const list = all.filter((r) => r.id !== clean.id);
  list.push(clean);
  return writeAll(list) ? clean : null;
}

/** Apply a change to one stored replay (the opponent's moves arriving, a pin). */
export function updateReplay(id, change) {
  const list = readAll();
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) return null;
  const next = normalizeRecord(typeof change === 'function' ? change(list[i]) : { ...list[i], ...change });
  if (!next) return null;
  list[i] = next;
  return writeAll(list) ? next : null;
}

/** Pin or unpin. Pinning past the limit is refused rather than dropping another. */
export function setPinned(id, pinned) {
  if (pinned && readAll().filter((r) => r.pinned && r.id !== id).length >= KEEP_PINNED) return false;
  return Boolean(updateReplay(id, { pinned: Boolean(pinned) }));
}

export function deleteReplay(id) {
  return writeAll(readAll().filter((r) => r.id !== id));
}
