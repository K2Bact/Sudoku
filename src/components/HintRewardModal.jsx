import React, { useState } from 'react';
import { Lightbulb, PlayCircle } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';

export function HintRewardModal({ isOpen, onClose, onRewardSuccess, adHintsUsed = 0, maxAdHints = 2 }) {
  const { t } = useTranslation();
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  if (!isOpen) return null;

  const remaining = Math.max(0, maxAdHints - adHintsUsed);

  const handleWatchAd = () => {
    if (remaining <= 0) return;
    soundHaptic.playSelectSound();
    setIsWatchingAd(true);
    // Simulate 3-second AdMob rewarded video ad
    setTimeout(() => {
      setIsWatchingAd(false);
      soundHaptic.playCompleteChime();
      if (onRewardSuccess) onRewardSuccess();
    }, 3000);
  };

  const handleClose = () => {
    soundHaptic.playSelectSound();
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon-header" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Lightbulb size={44} />
        </div>

        <h2>{t('modals.hintReward.title')}</h2>
        <p className="modal-desc" style={{ marginBottom: '8px' }}>
          {t('modals.hintReward.desc')}
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(217, 119, 6, 0.12)',
          color: '#d97706',
          padding: '5px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '800',
          marginBottom: '12px'
        }}>
          {t('modals.hintReward.chancesLeft', { remaining, max: maxAdHints })}
        </div>

        {isWatchingAd ? (
          <div className="inline-ad my-3">
            <div className="spinner"></div>
            <p>📺 Watching rewarded ad... (3s)</p>
          </div>
        ) : (
          <div className="modal-actions-vertical w-100 mt-2">
            <button type="button"
              className="btn btn-primary btn-lg watch-ad-btn"
              onClick={handleWatchAd}
              disabled={remaining <= 0}
            >
              <PlayCircle size={20} />
              <span>{t('modals.hintReward.watchAd')}</span>
            </button>

            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              <span>{t('modals.hintReward.later')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
