import React, { useEffect, useState } from 'react';
import { Lightbulb, PlayCircle } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { adsService } from '../services/adsService';
import { useTranslation } from '../i18n/i18nContext';
import { adRewardMessage, watchRewardedAd } from './common/adRewardMessage';

export function HintRewardModal({ isOpen, onClose, onRewardSuccess, adHintsUsed = 0, maxAdHints = 2 }) {
  const { t } = useTranslation();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adFailure, setAdFailure] = useState(null);

  // Closed by the parent too, not only by the Later button.
  useEffect(() => {
    if (!isOpen) setAdFailure(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const remaining = Math.max(0, maxAdHints - adHintsUsed);
  const adMessage = adRewardMessage(adFailure, t);

  // See GameOverModal: the ad itself belongs to adsService, not to this modal,
  // and a failed ad has to say so instead of quietly doing nothing.
  const handleWatchAd = async () => {
    if (remaining <= 0 || isWatchingAd) return;
    soundHaptic.playSelectSound();
    setAdFailure(null);
    setIsWatchingAd(true);
    const result = await watchRewardedAd(adsService);
    setIsWatchingAd(false);
    if (!result.rewarded) {
      setAdFailure(result);
      return;
    }
    soundHaptic.playCompleteChime();
    if (onRewardSuccess) onRewardSuccess();
  };

  const handleClose = () => {
    soundHaptic.playSelectSound();
    // This modal stays mounted while closed, so a failure message would still
    // be sitting there the next time it opens.
    setAdFailure(null);
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
            {/* Say which it is. While the placeholder provider is live there is
                no advertiser, and telling the player otherwise is the same lie
                the banner used to tell. See src/ads/index.js. */}
            <p>{adsService.isReal ? t('modals.hintReward.adWatching') : t('modals.hintReward.adPlaceholder')}</p>
          </div>
        ) : (
          <div className="modal-actions-vertical w-100 mt-2">
            {adMessage && (
              <p className="modal-desc ad-reward-notice" role="status" style={{ whiteSpace: 'pre-line' }}>
                {adMessage}
              </p>
            )}
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
