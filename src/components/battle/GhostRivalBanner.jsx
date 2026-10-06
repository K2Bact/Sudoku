import React, { useMemo } from 'react';
import { Zap, TrendingDown, User, Ghost } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';
import { calculateDeltaPace } from '../../utils/ghostManager';

export function GhostRivalBanner({
  rivalMode = 'ghost',
  userFilledCount = 0,
  totalEmptyCount = 40,
  timerSeconds = 0,
  ghostRecord = null
}) {
  const { t } = useTranslation();

  const pace = useMemo(() => {
    return calculateDeltaPace(timerSeconds, userFilledCount, totalEmptyCount, ghostRecord);
  }, [timerSeconds, userFilledCount, totalEmptyCount, ghostRecord]);

  if (!ghostRecord || (rivalMode !== 'ghost' && rivalMode !== 'delta')) {
    return null;
  }

  const formatSecs = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pbTimeStr = formatSecs(ghostRecord.bestSeconds || 0);

  // The record being raced, named as the mode chip names it. Delta used to say "PB" in every
  // language (user 2026-09-30: use the mode's own name). The chip label starts with its emoji;
  // the icon beside it already says that, so the emoji is dropped.
  const rivalLabel = t(`home.rivalModes.${rivalMode}`).replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '');

  return (
    <div className={`ghost-rival-banner-container ${pace.isAhead ? 'ahead' : 'behind'}`}>
      <div className="ghost-rival-top-row">
        {/* User Stats */}
        <div className="rival-col user-col">
          <User size={13} className="rival-icon" />
          <span className="rival-label">{t('common.you') || 'YOU'}</span>
          <span className="rival-count">{userFilledCount}/{totalEmptyCount}</span>
        </div>

        {/* Center Pace Differential Badge */}
        <div className={`rival-pace-badge ${pace.isAhead ? 'pace-ahead' : 'pace-behind'}`}>
          {pace.isAhead ? <Zap size={13} className="pace-icon" /> : <TrendingDown size={13} className="pace-icon" />}
          <span className="pace-text">
            {pace.isAhead ? t('game.ghost.ahead', { time: pace.deltaText }) : t('game.ghost.behind', { time: pace.deltaText })}
          </span>
        </div>

        <div className="rival-col ghost-col">
          {rivalMode === 'ghost' ? <Ghost size={13} className="rival-icon ghost-icon" /> : <Zap size={13} className="rival-icon ghost-icon" />}
          <span className="rival-label">{rivalLabel}</span>
          <span className="rival-count">{pace.ghostFilledCount}/{totalEmptyCount}</span>
        </div>
      </div>

      {/* Dual Progress Bars */}
      <div className="ghost-dual-track">
        {/* User bar */}
        <div
          className="ghost-progress-bar user-bar"
          style={{ width: `${pace.currentPct}%` }}
        />
        {/* Ghost bar indicator mark */}
        <div
          className="ghost-indicator-pin"
          // From the start of the reading direction, like the bar it marks: in
          // Arabic the bar grows from the right, and a pin measured from the left
          // pointed at the wrong end of the track (SA-RTL03).
          style={{ insetInlineStart: `${pace.ghostPct}%` }}
          title={`${rivalLabel} (${pbTimeStr})`}
        >
          <Ghost size={10} className="pin-ghost-icon" />
        </div>
      </div>
    </div>
  );
}
