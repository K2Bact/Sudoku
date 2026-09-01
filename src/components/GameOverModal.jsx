import React, { useState } from 'react';
import { AlertTriangle, PlayCircle, RotateCcw, Home } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';

export function GameOverModal({ hasRevived = false, onRevive, onRestart, onReturnHome }) {
  const { t } = useTranslation();
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const canRevive = !hasRevived && Boolean(onRevive);

  const handleWatchAd = () => {
    soundHaptic.playSelectSound();
    setIsWatchingAd(true);
    // Simulate watching 3-second AdMob rewarded video ad
    setTimeout(() => {
      setIsWatchingAd(false);
      if (onRevive) onRevive();
    }, 3000);
  };

  const handleRestartClick = () => {
    soundHaptic.playSelectSound();
    onRestart();
  };

  const handleHomeClick = () => {
    soundHaptic.playSelectSound();
    if (onReturnHome) onReturnHome();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card game-over-card">
        <div className="modal-icon-header warning">
          <AlertTriangle size={48} />
        </div>

        <h2>{t('modals.gameOver.title')}</h2>
        <p className="modal-desc">
          {canRevive ? t('modals.gameOver.desc') : t('modals.gameOver.descNoRevive')}
        </p>

        {isWatchingAd ? (
          <div className="inline-ad my-3">
            <div className="spinner"></div>
            <p>📺 Watching rewarded ad... (3s)</p>
          </div>
        ) : (
          <div className="modal-actions-vertical w-100 mt-2">
            {canRevive && (
              <button type="button" className="btn btn-primary btn-lg watch-ad-btn" onClick={handleWatchAd}>
                <PlayCircle size={20} />
                <span>{t('modals.gameOver.reviveBtn')}</span>
              </button>
            )}

            <button type="button" className="btn btn-secondary btn-lg" onClick={handleRestartClick}>
              <RotateCcw size={20} />
              <span>{t('modals.gameOver.restartBtn')}</span>
            </button>

            {onReturnHome && (
              <button type="button" className="btn btn-secondary" onClick={handleHomeClick}>
                <Home size={18} />
                <span>{t('common.home')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
