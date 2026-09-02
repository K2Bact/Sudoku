import React, { useState } from 'react';
import { AlertTriangle, PlayCircle, RotateCcw, Home } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { adsService } from '../services/adsService';
import { useTranslation } from '../i18n/i18nContext';

export function GameOverModal({ hasRevived = false, onRevive, onRestart, onReturnHome }) {
  const { t } = useTranslation();
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const canRevive = !hasRevived && Boolean(onRevive);

  // Goes through adsService so this placement works the same whether the fake
  // provider or AdMob is live. It used to run its own setTimeout and grant the
  // revive unconditionally, which meant the ad service was never consulted and
  // a player who closed a real ad early would still be revived.
  const handleWatchAd = async () => {
    soundHaptic.playSelectSound();
    setIsWatchingAd(true);
    const { rewarded } = await adsService.showRewarded();
    setIsWatchingAd(false);
    if (rewarded && onRevive) onRevive();
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
            {/* Say which it is. While the placeholder provider is live there is
                no advertiser, and telling the player otherwise is the same lie
                the banner used to tell. See src/ads/index.js. */}
            <p>{adsService.isReal ? t('modals.hintReward.adWatching') : t('modals.hintReward.adPlaceholder')}</p>
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
