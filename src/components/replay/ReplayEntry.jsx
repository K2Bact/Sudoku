import React from 'react';
import { Film } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';
import { useReplay } from '../../hooks/useReplay';
import { replayKeyFor } from '../../utils/replay/matchRecorder';
import { openReplay } from './replayViewer';
import { soundHaptic } from '../../utils/soundHaptic';

/**
 * On the 1v1 result: open this match's replay, and say whether the opponent's
 * moves came — they arrive a moment after the result, so the line updates.
 */
export function ReplayEntry({ room }) {
  const { t } = useTranslation();
  const id = room && !room.isAiMatch ? replayKeyFor(room) : null;
  const { record, shareState } = useReplay(id);
  if (!record) return null;

  return (
    <div className="replay-entry">
      <button type="button" className="btn btn-secondary replay-entry-btn" onClick={() => { soundHaptic.playSelectSound(); openReplay(id); }}>
        <Film size={16} />
        <span>{t('replay.open')}</span>
      </button>
      <p className="replay-entry-note">{t(`replay.share.${shareState}`)}</p>
    </div>
  );
}
