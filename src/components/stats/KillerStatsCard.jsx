import React from 'react';
import { SquareDashed } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../../engine/SudokuEngine';
import { loadKillerRecord } from '../../utils/killerStats';
import { useTranslation } from '../../i18n/i18nContext';

/**
 * KillerStatsCard — the killer record, on its own card.
 *
 * Killer games are counted apart from the standard ones (killerStats.js), so
 * they get their own games and wins as well as their own best times: folded
 * into the totals at the top, they would change a win rate this screen labels
 * as the one the Logic Score uses.
 */
export function KillerStatsCard({ formatTime }) {
  const { t } = useTranslation();
  const killer = loadKillerRecord();
  return (
    <div className="stats-card killer-stats-card">
      <h4 className="fw-bold mb-3">
        <SquareDashed size={18} className="text-purple inline-icon" /> {t('killer.stats.title')}
      </h4>
      <div className="best-times-list">
        {Object.values(DIFFICULTY_CONFIG).map((cfg) => (
          <div key={cfg.level} className="best-time-row">
            <div className="level-info">
              <span className="lvl-badge killer-lvl-badge">Lv.{cfg.level}</span>
              <span className="lvl-name">{t(`levels.${cfg.level}`)}</span>
            </div>
            <span className="best-time-val fw-bold">{formatTime(killer.bestTimes[cfg.level])}</span>
          </div>
        ))}
      </div>
      <div className="killer-stats-totals">
        <span className="text-muted">{t('killer.stats.played', { count: killer.gamesPlayed })}</span>
        <span className="fw-bold">{t('killer.stats.won', { count: killer.gamesWon })}</span>
      </div>
    </div>
  );
}
