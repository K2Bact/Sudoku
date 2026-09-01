import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, AlertCircle, RotateCcw, Share2, Home, Medal, Globe } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { playGamesService } from '../services/playGamesService';
import { cloudSyncService } from '../services/cloudSyncService.js';
import { checkAndUnlockAchievements } from '../utils/achievementManager';
import { shareContent } from '../utils/nativeShare';

export function VictoryModal({
  level = 3,
  gameMode = 'classic',
  timerSeconds,
  timeSeconds,
  mistakes = 0,
  onNextGame,
  onRestart,
  onReturnHome,
  onOpenLeaderboard
}) {
  const { t } = useTranslation();
  const [shareToast, setShareToast] = useState(null);
  const actualSeconds = timerSeconds ?? timeSeconds ?? 0;
  const handleNext = onNextGame || onRestart;

  const calculateSpeedrunRank = (lvl, secs) => {
    const thresholds = {
      1: [60, 90, 150, 240],
      2: [90, 150, 240, 360],
      3: [120, 210, 330, 480],
      4: [180, 300, 480, 660],
      5: [240, 420, 660, 900]
    };
    const tArr = thresholds[lvl] || thresholds[3];
    if (secs <= tArr[0]) return { rank: 'S+', color: '#f59e0b', bg: '#fef3c7' };
    if (secs <= tArr[1]) return { rank: 'S', color: '#3b82f6', bg: '#dbeafe' };
    if (secs <= tArr[2]) return { rank: 'A', color: '#10b981', bg: '#d1fae5' };
    if (secs <= tArr[3]) return { rank: 'B', color: '#8b5cf6', bg: '#ede9fe' };
    return { rank: 'C', color: '#6b7280', bg: '#f3f4f6' };
  };

  const totalLimit = DIFFICULTY_CONFIG[level]?.timeLimitSeconds || 480;
  const timeTaken = gameMode === 'timeLimit' ? Math.max(1, totalLimit - actualSeconds) : actualSeconds;
  const rankInfo = calculateSpeedrunRank(level, timeTaken);

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.55 }
    });

    // Auto submit to Google Play Games & Apple Game Center
    playGamesService.submitScore(gameMode, level, actualSeconds);
    checkAndUnlockAchievements({
      level,
      timerSeconds: actualSeconds,
      gameMode,
      mistakes,
      isFlawless: mistakes === 0,
      rank: rankInfo.rank
    });
    // Automatic Cloud Sync
    cloudSyncService.saveToCloud();
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    soundHaptic.playSelectSound();
    const modeLabel = gameMode === 'timeAttack' ? '[⚡Time Attack]' : gameMode === 'timeLimit' ? '[⏳Survival]' : '[Classic]';
    const shareText = t('modals.victory.shareText', {
      mode: modeLabel,
      level,
      name: t(`levels.${level}`),
      time: formatTime(actualSeconds),
      rank: rankInfo.rank,
      mistakes
    });
    const res = await shareContent({
      title: t('modals.victory.title'),
      text: shareText,
      dialogTitle: t('modals.victory.title')
    });
    if (res.method === 'clipboard') {
      setShareToast(t('modals.victory.copiedToast'));
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card victory-card" style={{ maxWidth: '380px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <div className="modal-icon-header victory" style={{ background: '#fef3c7', color: '#d97706' }}>
          <Trophy size={48} />
        </div>

        <h2>{t('modals.victory.title')}</h2>
        <p className="modal-desc" style={{ marginBottom: '12px' }}>{t('modals.victory.desc')}</p>

        {/* Speedrun Rank Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '9px 14px',
          background: rankInfo.bg,
          border: `1.5px solid ${rankInfo.color}`,
          borderRadius: 'var(--border-radius-sm)',
          color: rankInfo.color,
          fontWeight: '900',
          fontSize: '14px',
          width: '100%',
          marginBottom: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
        }}>
          <Medal size={18} />
          <span>{t('modals.victory.rankLabel', { title: t(`modals.victory.ranks.${rankInfo.rank}`) })}</span>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">{t('modals.victory.difficultyLabel')}</span>
            <span className="stat-val">Lv.{level} {t(`levels.${level}`)}</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">
              <Clock size={14} className="inline-icon text-blue" />
              {gameMode === 'timeLimit' ? t('modals.victory.timeRemainingLabel') : t('modals.victory.timeLabel')}
            </span>
            <span className="stat-val fw-bold">{formatTime(actualSeconds)}</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">
              <AlertCircle size={14} className="inline-icon text-red" />
              {t('modals.victory.mistakesLabel')}
            </span>
            <span className="stat-val">{t('modals.victory.mistakesCount', { count: mistakes })}</span>
          </div>
        </div>

        <div className="modal-actions-vertical w-100">
          {/* In-App Global Leaderboard Quick View Button */}
          {onOpenLeaderboard && (
            <button type="button"
              className="btn btn-secondary w-100"
              onClick={() => {
                soundHaptic.playSelectSound();
                onOpenLeaderboard();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '800',
                color: 'var(--text-main)'
              }}
            >
              <Globe size={15} className="text-blue" />
              <span>{t('modals.victory.leaderboardBtn')}</span>
            </button>
          )}

          <div className="modal-actions" style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={handleShare} style={{ flex: 1 }}>
              <Share2 size={16} />
              <span>{t('modals.victory.shareBtn')}</span>
            </button>

            {handleNext && (
              <button type="button" className="btn btn-primary" onClick={handleNext} style={{ flex: 1.4 }}>
                <RotateCcw size={16} />
                <span>{t('modals.victory.nextGame')}</span>
              </button>
            )}
          </div>

          {onReturnHome && (
            <button type="button" className="btn btn-secondary w-100" onClick={onReturnHome}>
              <Home size={16} />
              <span>{t('common.home')}</span>
            </button>
          )}
        </div>

        {shareToast && (
          <div className="theme-toast-banner" style={{ top: 'auto', bottom: '70px' }}>
            {shareToast}
          </div>
        )}
      </div>
    </div>
  );
}
