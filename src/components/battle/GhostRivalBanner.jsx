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

        {/* Ghost PB Stats */}
        <div className="rival-col ghost-col">
          <Ghost size={13} className="rival-icon ghost-icon" />
          <span className="rival-label">{rivalMode === 'ghost' ? (t('home.rivalModes.ghost') || 'GHOST') : 'PB'}</span>
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
          style={{ left: `${pace.ghostPct}%` }}
          title={`Ghost PB (${pbTimeStr})`}
        >
          <Ghost size={10} className="pin-ghost-icon" />
        </div>
      </div>
    </div>
  );
}
