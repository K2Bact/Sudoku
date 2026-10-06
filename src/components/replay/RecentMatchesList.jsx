import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';
import { useNotify } from '../common/ConfirmProvider';
import { listReplays, setPinned, subscribeReplays, KEEP_PINNED } from '../../utils/replay/replayStore';
import { openReplay } from './replayViewer';
import { soundHaptic } from '../../utils/soundHaptic';

/**
 * The 1v1 matches kept on this phone: the last twenty, and the starred ones kept
 * past that. A row opens the replay; the star keeps it.
 */
export function RecentMatchesList() {
  const { t, activeLanguage } = useTranslation();
  const notify = useNotify();
  const [list, setList] = useState(() => listReplays());
  useEffect(() => subscribeReplays(() => setList(listReplays())), []);

  if (!list.length) return <p className="replay-list-empty">{t('replay.listEmpty')}</p>;

  const day = (ms) => {
    try {
      return new Date(ms).toLocaleDateString(activeLanguage, { month: 'short', day: 'numeric' });
    } catch {
      return new Date(ms).toLocaleDateString();
    }
  };

  const togglePin = async (r) => {
    soundHaptic.playSelectSound();
    if (!setPinned(r.id, !r.pinned)) await notify(t('replay.pinFull', { count: KEEP_PINNED }));
  };

  return (
    <ul className="replay-list">
      {list.map((r) => (
        <li key={r.id} className="replay-list-row">
          <button type="button" className={`replay-pin ${r.pinned ? 'on' : ''}`} onClick={() => togglePin(r)}
            aria-pressed={r.pinned} title={r.pinned ? t('replay.unpin') : t('replay.pin')}>
            <Star size={16} fill={r.pinned ? 'currentColor' : 'none'} />
          </button>
          <button type="button" className="replay-list-open" onClick={() => { soundHaptic.playSelectSound(); openReplay(r.id); }}>
            <span className={`replay-result ${r.winner === 'me' ? 'won' : 'lost'}`}>
              {r.winner === 'me' ? t('replay.won') : t('replay.lost')}
            </span>
            <span className="replay-list-name">{r.opp.name || t('battleResult.opponent')}</span>
            <span className="replay-list-meta">{t(`levels.${r.level}`)} · {day(r.savedAt)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
