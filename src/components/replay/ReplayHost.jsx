import React, { useEffect, useSyncExternalStore } from 'react';
import { ReplayScreen } from './ReplayScreen';
import { openReplayId, subscribeViewer, closeReplay } from './replayViewer';

/**
 * Draws the open replay over everything else. A match that starts under it — the
 * opponent's rematch request accepted from the toast above it — closes it, so a
 * live board is never hidden behind a replay.
 */
export function ReplayHost({ matchLive }) {
  const id = useSyncExternalStore(subscribeViewer, openReplayId);
  useEffect(() => {
    if (matchLive) closeReplay();
  }, [matchLive]);
  if (!id || matchLive) return null;
  return <ReplayScreen id={id} onBack={closeReplay} />;
}
