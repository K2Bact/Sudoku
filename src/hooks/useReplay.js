import { useEffect, useState } from 'react';
import { getReplay, subscribeReplays } from '../utils/replay/replayStore.js';
import { shownShareState, SHARE_ANSWER_MS } from '../utils/replay/replayRecord.js';

/**
 * One stored replay, kept current: the opponent's answer and moves arrive after
 * the match ends, and are written to the store, not to React state.
 */
export function useReplay(id) {
  const [record, setRecord] = useState(() => (id ? getReplay(id) : null));
  const [, redraw] = useState(0);

  useEffect(() => {
    setRecord(id ? getReplay(id) : null);
    if (!id) return undefined;
    return subscribeReplays(() => setRecord(getReplay(id)));
  }, [id]);

  // 'pending' and 'agreed' change by the clock alone (shownShareState), with no
  // write to announce it — draw again when the wait is over.
  const pending = record?.opp?.shareState === 'pending' || record?.opp?.shareState === 'agreed';
  const savedAt = record?.savedAt || 0;
  useEffect(() => {
    if (!pending) return undefined;
    const wait = Math.max(0, SHARE_ANSWER_MS - (Date.now() - savedAt)) + 50;
    const timer = setTimeout(() => redraw((n) => n + 1), wait);
    return () => clearTimeout(timer);
  }, [pending, savedAt]);

  return { record, shareState: record ? shownShareState(record) : null };
}
