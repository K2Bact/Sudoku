import React, { useState } from 'react';
import { BarChart3, Clock, Zap, Hourglass, Swords, Trophy } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { loadStats } from '../utils/storage';
import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine';
import { useTranslation } from '../i18n/i18nContext';
import { AchievementsView } from './AchievementsView';
import { loadBattleProfile } from '../utils/battleRating';
import { soundHaptic } from '../utils/soundHaptic';

/**
 * My records: everything here is this phone's own play. The world ranking lives with
 * the score it ranks, on the Play Analysis screen. A third "ranking" tab used to repeat
 * these best times next to an invented table of percentile thresholds (SudokuDiary ㉔, ㉖).
 */
export function StatsScreen({ onBack, initialTab = 'stats' }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab === 'achievements' ? 'achievements' : 'stats');
  const stats = loadStats();
  const battle = loadBattleProfile();
  const battled = (battle.wins || 0) + (battle.losses || 0) > 0;
  const played = stats.gamesPlayed || 0;
  const won = stats.gamesWon || 0;
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
  const bestTimes = stats.bestTimes || {};
  const timeAttackBests = stats.timeAttackBestTimes || {};
  const timeLimitBests = stats.timeLimitBestTimes || {};
  const survivalWins = stats.timeLimitSurvivalWins || 0;

  const formatTime = (secs) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTabClick = (tab) => {
    soundHaptic.playSelectSound();
    setActiveTab(tab);
  };

  const getScreenTitle = () => (activeTab === 'achievements' ? t('achievements.tabTitle') : t('home.nav.stats'));
  const getScreenIcon = () => (activeTab === 'achievements' ? Trophy : BarChart3);

  return (
    <div className="stats-screen-container">
      {/* Top Mobile App Navigation Bar */}
      <ScreenHeader
        title={getScreenTitle()}
        icon={getScreenIcon()}
        iconColorClass="text-yellow"
        onBack={onBack}
      />

      {/* Two tabs: [records] and [achievements] */}
      <div className="stats-tab-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '10px 14px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--board-grid-line)' }}>
        <button type="button"
          className={`seg-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => handleTabClick('stats')}
          style={{
            padding: '8px 4px',
            fontSize: '11.5px',
            fontWeight: '800',
            borderRadius: '8px',
            border: '1px solid var(--board-grid-line)',
            background: activeTab === 'stats' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--btn-bg)',
            color: activeTab === 'stats' ? '#ffffff' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={14} />
          <span>{t('achievements.statsTab')}</span>
        </button>

        <button type="button"
          className={`seg-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => handleTabClick('achievements')}
          style={{
            padding: '8px 4px',
            fontSize: '11.5px',
            fontWeight: '800',
            borderRadius: '8px',
            border: '1px solid var(--board-grid-line)',
            background: activeTab === 'achievements' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'var(--btn-bg)',
            color: activeTab === 'achievements' ? '#ffffff' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <Trophy size={14} />
          <span>{t('achievements.tabTitle')}</span>
        </button>

      </div>

      {/* Main Full-Screen Scrollable Content Area */}
      <div className="screen-scroll-content">
        {activeTab === 'achievements' ? (
          <AchievementsView />
        ) : (
          <>
            {/* Global Summary Stats Card */}
            <div className="stats-card">
              <h4 className="fw-bold mb-3">{t('stats.summaryTitle')}</h4>
              <div className="stats-summary-grid">
                <div className="summary-card">
                  <span className="sum-val">{played}</span>
                  <span className="sum-lbl">{t('stats.totalPlayed')}</span>
                </div>

                <div className="summary-card">
                  <span className="sum-val">{won}</span>
                  <span className="sum-lbl">{t('stats.totalWon')}</span>
                </div>

                <div className="summary-card">
                  <span className="sum-val">{winRate}%</span>
                  <span className="sum-lbl">{t('stats.winRate')}</span>
                </div>
              </div>
            </div>

            {/* 1. Classic Mode Best Times */}
            <div className="stats-card">
              <h4 className="fw-bold mb-3">
                <Clock size={18} className="text-blue inline-icon" /> {t('stats.classicBest')}
              </h4>
              <div className="best-times-list">
                {Object.values(DIFFICULTY_CONFIG).map((cfg) => {
                  const bestSecs = bestTimes[cfg.level];
                  return (
                    <div key={cfg.level} className="best-time-row">
                      <div className="level-info">
                        <span className="lvl-badge">Lv.{cfg.level}</span>
                        <span className="lvl-name">{t(`levels.${cfg.level}`)}</span>
                      </div>
                      <span className="best-time-val fw-bold">{formatTime(bestSecs)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Speedrun Time Attack Best Times */}
            <div className="stats-card">
              <h4 className="fw-bold mb-3">
                <Zap size={18} className="text-yellow inline-icon" /> {t('stats.speedrunBest')}
              </h4>
              <div className="best-times-list">
                {Object.values(DIFFICULTY_CONFIG).map((cfg) => {
                  const bestSecs = timeAttackBests[cfg.level];
                  return (
                    <div key={cfg.level} className="best-time-row">
                      <div className="level-info">
                        <span className="lvl-badge" style={{ background: '#f59e0b', color: '#fff' }}>⚡ Lv.{cfg.level}</span>
                        <span className="lvl-name">{t(`levels.${cfg.level}`)}</span>
                      </div>
                      <span className="best-time-val fw-bold" style={{ color: bestSecs ? '#f59e0b' : 'inherit' }}>
                        {formatTime(bestSecs)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Survival Time Limit Summary */}
            <div className="stats-card">
              <h4 className="fw-bold mb-3">
                <Hourglass size={18} className="text-red inline-icon" /> {t('stats.survivalTitle')}
              </h4>
              <div className="best-times-list">
                {Object.values(DIFFICULTY_CONFIG).map((cfg) => {
                  const bestSecs = timeLimitBests[cfg.level];
                  return (
                    <div key={cfg.level} className="best-time-row">
                      <div className="level-info">
                        <span className="lvl-badge" style={{ background: '#ef4444', color: '#fff' }}>⏳ Lv.{cfg.level}</span>
                        <span className="lvl-name">{t(`levels.${cfg.level}`)}</span>
                      </div>
                      <span className="best-time-val fw-bold" style={{ color: bestSecs ? '#ef4444' : 'inherit' }}>
                        {formatTime(bestSecs)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--board-grid-line)' }}>
                <span className="text-muted" style={{ fontSize: '12.5px' }}>{t('stats.survivalTotalWins')}</span>
                <span className="fw-bold" style={{ fontSize: '15px', color: '#ef4444' }}>{t('stats.survivalWinsUnit', { count: survivalWins })}</span>
              </div>
            </div>

            {/* 4. 1v1 battles — rating and record, kept on this phone only */}
            <div className="stats-card stats-pvp-card">
              <h4 className="fw-bold mb-3">
                <Swords size={18} className="text-red inline-icon" /> {t('leaderboard.pvpTab')}
              </h4>
              <div className="best-times-list">
                <div className="best-time-row">
                  <span className="lvl-name">{t('stats.pvpRating')}</span>
                  <span className="best-time-val fw-bold">{battled ? `${battle.mmr} RP` : '--'}</span>
                </div>
                <div className="best-time-row">
                  <span className="lvl-name">{t('stats.pvpRecordLabel')}</span>
                  <span className="best-time-val fw-bold">
                    {battled ? t('stats.pvpRecord', { wins: battle.wins || 0, losses: battle.losses || 0 }) : '--'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
