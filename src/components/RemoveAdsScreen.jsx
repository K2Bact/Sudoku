import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ShoppingBag } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { adsService } from '../services/adsService';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { useNotify } from './common/ConfirmProvider';

export function RemoveAdsScreen({ onBack, onPurchaseSuccess }) {
  const { t } = useTranslation();
  const notify = useNotify();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = () => {
    soundHaptic.playSelectSound();
    setIsProcessing(true);
    setTimeout(() => {
      adsService.purchaseRemoveAds();
      setIsProcessing(false);
      notify(t('removeAds.successToast'));
      // This called onAdsRemovedPurchased, a prop the router never passes (it
      // passes onPurchaseSuccess). The TypeError was thrown inside this timeout
      // where no error boundary could catch it, so the entitlement was granted
      // and then nothing else ran: no message, no navigation, player stranded.
      //
      // onPurchaseSuccess navigates home itself, so onBack must NOT also run —
      // two returns would pop past the screen the player came from. onBack stays
      // on the header arrow for players who leave without buying.
      if (onPurchaseSuccess) onPurchaseSuccess();
      else onBack();
    }, 1500);
  };

  return (
    <div className="remove-ads-screen-container">
      {/* Top Mobile App Navigation Bar */}
      <ScreenHeader
        title={t('removeAds.title')}
        icon={ShieldCheck}
        iconColorClass="text-yellow"
        onBack={onBack}
      />

      {/* Main Full-Screen Scrollable Content Area */}
      <div className="screen-scroll-content">
        <div className="remove-ads-hero text-center">
          <div className="hero-icon-circle mx-auto mb-3">
            <ShieldCheck size={42} className="text-yellow" />
          </div>
          <h3 className="fw-bold">{t('removeAds.heroTitle')}</h3>
          <p className="hero-desc text-muted mt-2">{t('removeAds.heroDesc')}</p>
        </div>

        <div className="stats-card">
          <h4 className="fw-bold mb-3">{t('removeAds.benefitsTitle')}</h4>
          <div className="benefits-list">
            <div className="benefit-item">
              <CheckCircle2 size={18} className="text-green" />
              <span>{t('removeAds.benefit1')}</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={18} className="text-green" />
              <span>{t('removeAds.benefit2')}</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={18} className="text-green" />
              <span>{t('removeAds.benefit3')}</span>
            </div>
          </div>
        </div>

        {isProcessing ? (
          <div className="inline-ad mt-4">
            <div className="spinner"></div>
            <p>{t('removeAds.processing')}</p>
          </div>
        ) : (
          <button type="button" className="btn-modern btn-play-new btn-block purchase-btn mt-4" onClick={handlePurchase}>
            <ShoppingBag size={18} />
            <span>{t('removeAds.purchaseBtn')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
