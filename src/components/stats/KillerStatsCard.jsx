import React from 'react';
import { SquareDashed, Zap } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../../engine/SudokuEngine';
import { loadKillerRecord } from '../../utils/killerStats';
import { useTranslation } from '../../i18n/i18nContext';

/**
 * KillerStatsCard — the killer record, on its own card.
 *
 * Killer games are counted apart from the standard ones (killerStats.js), so
 * they get their own games and wins as well as their own best times: folded
 * into the totals at the top, they would change a win rate this screen labels
 * as the one the Logic Score uses. Speedrun best times have their own list, as
 * on the standard side: their clock carries the +10 s penalties.
 *
 * Laid out like the standard record above it — the same summary (games, wins,
 * win rate) with the same words, then the best times — since the two kinds
 * differ in the puzzle only (user, 2026-10-07). It used to end on a line of its
 * own wording ("Played N · Won N") and had no win rate.
 */
export function KillerStatsCard({ formatTime }) {
  const { t } = useTranslation();
  const killer = loadKillerRecord();
  const winRate = killer.gamesPlayed > 0 ? Math.round((killer.gamesWon / killer.gamesPlayed) * 100) : 0;
  return (
    <div className="stats-card killer-stats-card">
      <h4 className="fw-bold mb-3">
        <SquareDashed size={18} className="text-purple inline-icon" /> {t('killer.stats.title')}
      </h4>
      <div className="stats-summary-grid killer-summary-grid">
        <div className="summary-card">
          <span className="sum-val">{killer.gamesPlayed}</span>
          <span className="sum-lbl">{t('stats.totalPlayed')}</span>
        </div>
        <div className="summary-card">
          <span className="sum-val">{killer.gamesWon}</span>
          <span className="sum-lbl">{t('stats.totalWon')}</span>
        </div>
        <div className="summary-card">
          <span className="sum-val">{winRate}%</span>
          <span className="sum-lbl">{t('stats.winRate')}</span>
        </div>
      </div>
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
      <h5 className="fw-bold killer-speedrun-title">
        <Zap size={15} className="text-yellow inline-icon" /> {t('stats.speedrunBest')}
      </h5>
      <div className="best-times-list killer-speedrun-list">
        {Object.values(DIFFICULTY_CONFIG).map((cfg) => {
          const bestSecs = killer.timeAttackBestTimes[cfg.level];
          return (
            <div key={cfg.level} className="best-time-row">
              <div className="level-info">
                <span className="lvl-badge killer-lvl-badge">⚡ Lv.{cfg.level}</span>
                <span className="lvl-name">{t(`levels.${cfg.level}`)}</span>
              </div>
              <span className="best-time-val fw-bold" style={{ color: bestSecs ? '#f59e0b' : 'inherit' }}>{formatTime(bestSecs)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
