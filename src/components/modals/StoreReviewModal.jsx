import React from 'react';
import { Star, Heart } from 'lucide-react';
import { soundHaptic } from '../../utils/soundHaptic';
import { useTranslation } from '../../i18n/i18nContext';
import { APP_INFO } from '../../config/appInfo';

/**
 * StoreReviewModal
 * Dopamine-timed 5-star review prompt for store ranking growth.
 * Directly routes users to the Google Play Store review page.
 */
export function StoreReviewModal({ isOpen, onClose, onReviewSuccess }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const handleReviewClick = () => {
    soundHaptic.playCompleteChime();
    try {
      localStorage.setItem('suidoku_review_prompted', 'done');
    } catch (e) {}

    // Launch Google Play Store directly on Android device or browser
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '');
    const isNative = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());

    if (isNative || isAndroid) {
      try {
        window.location.href = APP_INFO.marketUri;
      } catch (_) {
        window.open(APP_INFO.playStoreUrl, '_system');
      }
    } else {
      window.open(APP_INFO.playStoreUrl, '_blank', 'noopener,noreferrer');
    }

    if (onReviewSuccess) onReviewSuccess();
    if (onClose) onClose();
  };

  const handlePostpone = () => {
    soundHaptic.playSelectSound();
    try {
      localStorage.setItem('suidoku_review_prompted', 'postponed');
    } catch (e) {}
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '360px', position: 'relative' }}>
        <div className="modal-icon-header victory" style={{ background: '#fef3c7', color: '#d97706' }}>
          <Heart size={44} style={{ fill: '#ef4444', color: '#ef4444' }} />
        </div>

        <h2>{t('modals.storeReview.title')}</h2>
        <p className="modal-desc" style={{ marginBottom: '14px', whiteSpace: 'pre-line' }}>
          {t('modals.storeReview.desc')}
        </p>

        {/* 5 Golden Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={28} style={{ fill: '#f59e0b', color: '#f59e0b', filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))' }} />
          ))}
        </div>

        <div className="modal-actions-vertical w-100">
          <button type="button"
            className="btn btn-primary btn-lg"
            onClick={handleReviewClick}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff', fontWeight: '800' }}
          >
            <Star size={18} style={{ fill: '#ffffff' }} />
            <span>{t('modals.storeReview.submitBtn')}</span>
          </button>

          <button type="button" className="btn btn-secondary mt-1" onClick={handlePostpone}>
            <span>{t('modals.storeReview.laterBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
