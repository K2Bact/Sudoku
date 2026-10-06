/**
 * replayViewer.js — which replay is on screen, if any.
 *
 * A replay opens over whatever is showing instead of being a screen of its own
 * (I-1, 2026-09-30). From the 1v1 result it has to leave the room alive — the
 * rematch countdown and the opponent's request keep running under it — and from
 * the records screen it has to come back to the same place. So it is a layer:
 * ReplayHost draws it, the back button closes it first (useBackStack), and a new
 * match starting under it closes it (ReplayHost).
 */
let openId = null;
const listeners = new Set();

export const openReplayId = () => openId;

export function subscribeViewer(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function openReplay(id) {
  openId = id || null;
  for (const cb of listeners) cb();
}

export function closeReplay() {
  if (openId !== null) openReplay(null);
}
