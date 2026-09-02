import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Brain, Swords, Globe, RefreshCw } from 'lucide-react';
import { playGamesService } from '../services/playGamesService';
import { leaderboardService, LEADERBOARD_CATEGORIES } from '../services/leaderboardService.js';
import { useTranslation } from '../i18n/i18nContext';
import { soundHaptic } from '../utils/soundHaptic';

export function GlobalLeaderboardView() {
  const { t } = useTranslation();
  const [category, setCategory] = useState(LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC);
  const [subKey, setSubKey] = useState('lv3');
  const [rankings, setRankings] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async (cat, sub) => {
    setLoading(true);
    soundHaptic.playSelectSound();
    try {
      await new Promise((r) => setTimeout(r, 250));
      const data = await leaderboardService.fetchTopRanks(cat, sub);
      const me = leaderboardService.getMyRank(cat, sub);
      setRankings(data);
      setMyRank(me);
    } catch (e) {
      console.warn('[Leaderboard] Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(category, subKey);
  }, [category, subKey]);

  const handleCategoryChange = (cat) => {
    soundHaptic.playSelectSound();
    setCategory(cat);
  };

  const handleSubKeyChange = (sub) => {
    soundHaptic.playSelectSound();
    setSubKey(sub);
  };

  const formatScore = (item) => {
    if (item.score === null || item.score === undefined) return '--';
    if (item.isTime) {
      const m = Math.floor(item.score / 60);
      const s = item.score % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    if (category === LEADERBOARD_CATEGORIES.BRAIN_IQ) return `IQ ${item.score}`;
    if (category === LEADERBOARD_CATEGORIES.PVP_MMR) return `${item.score} RP`;
    return String(item.score);
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="global-leaderboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Category 2x2 Grid Control */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <button type="button"
          onClick={() => handleCategoryChange(LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC)}
          className="btn-modern"
          style={{
            padding: '9px 6px',
            fontSize: '12px',
            fontWeight: '800',
            background: category === LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'var(--btn-bg)',
            color: category === LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC ? '#ffffff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Trophy size={14} />
          <span>{t('leaderboard.classicTab')}</span>
        </button>

        <button type="button"
          onClick={() => handleCategoryChange(LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK)}
          className="btn-modern"
          style={{
            padding: '9px 6px',
            fontSize: '12px',
            fontWeight: '800',
            background: category === LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--btn-bg)',
            color: category === LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK ? '#ffffff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Zap size={14} />
          <span>{t('leaderboard.speedrunTab')}</span>
        </button>

        <button type="button"
          onClick={() => handleCategoryChange(LEADERBOARD_CATEGORIES.PVP_MMR)}
          className="btn-modern"
          style={{
            padding: '9px 6px',
            fontSize: '12px',
            fontWeight: '800',
            background: category === LEADERBOARD_CATEGORIES.PVP_MMR ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'var(--btn-bg)',
            color: category === LEADERBOARD_CATEGORIES.PVP_MMR ? '#ffffff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Swords size={14} />
          <span>{t('leaderboard.pvpTab')}</span>
        </button>

        <button type="button"
          onClick={() => handleCategoryChange(LEADERBOARD_CATEGORIES.BRAIN_IQ)}
          className="btn-modern"
          style={{
            padding: '9px 6px',
            fontSize: '12px',
            fontWeight: '800',
            background: category === LEADERBOARD_CATEGORIES.BRAIN_IQ ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'var(--btn-bg)',
            color: category === LEADERBOARD_CATEGORIES.BRAIN_IQ ? '#ffffff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Brain size={14} />
          <span>{t('leaderboard.iqTab')}</span>
        </button>
      </div>

      {/* Level Subkey Selector for Classic & Speedrun */}
      {(category === LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC || category === LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].map((sub, idx) => {
            const isSelected = subKey === sub;
            return (
              <button type="button"
                key={sub}
                onClick={() => handleSubKeyChange(sub)}
                className="btn-modern"
                style={{
                  padding: '7px 2px',
                  fontSize: '11px',
                  fontWeight: '800',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isSelected ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'var(--btn-bg)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  border: isSelected ? '1.5px solid #2563eb' : '1px solid var(--board-grid-line)',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none'
                }}
              >
                Lv.{idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* My Current Standing Highlight Banner */}
      {myRank && (
        <div className="stats-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: '800', textTransform: 'uppercase' }}>
                {t('leaderboard.myStanding')}
              </span>
              <h4 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: '900', color: '#ffffff' }}>
                {myRank.rank === '-' ? t('leaderboard.unranked') : `#${myRank.rank} (${myRank.percentile})`}
              </h4>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('leaderboard.record')}</span>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#fef08a' }}>
                {formatScore(myRank)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings List Container */}
      <div className="leaderboard-list-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--board-grid-line)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--board-grid-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} className="text-yellow" />
            {t('leaderboard.topSolvers')}
          </span>
          <button type="button"
            onClick={() => loadData(category, subKey)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>

        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {rankings.map((item) => (
            <div
              key={`${item.rank}_${item.name}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr auto',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid var(--board-grid-line)',
                background: item.isMe ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                fontWeight: item.isMe ? '800' : '500'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '900', textAlign: 'center' }}>
                {getMedalIcon(item.rank)}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', paddingRight: '8px' }}>
                <span style={{ fontSize: '13px' }}>{item.flag || '🌐'}</span>
                <span style={{ fontSize: '12.5px', color: item.isMe ? '#60a5fa' : 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
              </div>

              <span style={{ fontSize: '13px', fontWeight: '800', color: item.rank <= 3 ? '#eab308' : 'var(--text-main)' }}>
                {formatScore(item)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
