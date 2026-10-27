import React, { useState, useEffect } from 'react';
import { Swords, Check, X, Clock } from 'lucide-react';
import { soundHaptic } from '../../utils/soundHaptic';
import { useTranslation } from '../../i18n/i18nContext';
import { REMATCH_SECONDS } from './rematchBannerTiming';

export function RematchToastBanner({
  requesterName,
  initialSeconds = REMATCH_SECONDS,
  onAccept,
  onDecline
}) {
  const { t } = useTranslation();
  // Less than 15 when the banner was held behind the Play Games popup (D32).
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    soundHaptic.playWinSound?.();
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onDecline) onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onDecline]);

  const handleAccept = () => {
    soundHaptic.playSelectSound();
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    soundHaptic.playSelectSound();
    if (onDecline) onDecline();
  };

  const progressPercent = (secondsLeft / REMATCH_SECONDS) * 100;

  return (
    <div className="rematch-toast-wrapper">
      <div className="rematch-toast-header">
        <div className="rematch-toast-info">
          <div className="rematch-icon-badge">
            <Swords size={18} />
          </div>
          <h4 className="rematch-toast-title">
            {t('rematchToast.title', { opponent: requesterName || t('battleResult.opponent') })}
          </h4>
        </div>
        <div className="rematch-toast-timer">
          <Clock size={12} />
          <span>{t('rematchToast.countdown', { seconds: secondsLeft })}</span>
        </div>
      </div>

      <div className="rematch-countdown-bar">
        <div
          className="rematch-countdown-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="rematch-toast-actions">
        <button
          type="button"
          className="rematch-btn rematch-btn-decline"
          onClick={handleDecline}
        >
          <X size={15} />
          <span>{t('rematchToast.declineBtn')}</span>
        </button>
        <button
          type="button"
          className="rematch-btn rematch-btn-accept"
          onClick={handleAccept}
        >
          <Check size={16} />
          <span>{t('rematchToast.acceptBtn')}</span>
        </button>
      </div>
    </div>
  );
}

export default RematchToastBanner;
