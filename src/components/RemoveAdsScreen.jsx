import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, ShoppingBag, RotateCcw } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { adsService } from '../services/adsService';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { useNotify } from './common/ConfirmProvider';

export function RemoveAdsScreen({ onBack, onPurchaseSuccess }) {
  const { t } = useTranslation();
  const notify = useNotify();
  const [isProcessing, setIsProcessing] = useState(false);
  const [product, setProduct] = useState(null);
  const [owned, setOwned] = useState(() => adsService.isAdsRemoved());

  // The price is whatever the store says for the account being charged —
  // "₩3,300", "$2.49", "2,49 €". Symbol, separators and placement all differ by
  // country, and formatting it here is how the button came to read
  // "영구 제거하기 ({price})" in every language.
  useEffect(() => {
    let alive = true;
    adsService.getRemoveAdsProduct().then((p) => {
      if (!alive) return;
      setProduct(p);
      if (p?.owned) setOwned(true);
    });
    return () => { alive = false; };
  }, []);

  /**
   * No timer and no simulated wait: the screen is busy exactly as long as the
   * store takes, and adsService writes the entitlement only after the store
   * confirms ownership.
   *
   * What this replaced ran a 1.5-second setTimeout, granted Remove Ads, and
   * announced success — with no store, no product and no charge. It also called
   * a prop the router never passes, so the TypeError landed inside the timeout
   * where no error boundary catches it and the player was left on the screen
   * having "bought" something.
   */
  const handlePurchase = async () => {
    soundHaptic.playSelectSound();
    setIsProcessing(true);
    const res = await adsService.purchaseRemoveAds();
    setIsProcessing(false);

    if (res.success) {
      setOwned(true);
      await notify(t('removeAds.buySuccess'));
      // onPurchaseSuccess navigates home itself, so onBack must not also run —
      // two returns would pop past the screen the player came from.
      if (onPurchaseSuccess) onPurchaseSuccess();
      else onBack();
      return;
    }
    // Backing out of the store dialog is a choice, not an error to report.
    if (res.reason === 'cancelled') return;
    // A failed purchase used to show the restore message, "no past purchases
    // found", which answers a question the player did not ask.
    await notify(t('removeAds.buyFail'));
  };

  const handleRestore = async () => {
    soundHaptic.playSelectSound();
    setIsProcessing(true);
    const res = await adsService.restoreRemoveAds();
    setIsProcessing(false);

    if (res.owned) {
      setOwned(true);
      await notify(t('removeAds.restoreSuccess'));
      if (onPurchaseSuccess) onPurchaseSuccess();
      else onBack();
      return;
    }
    await notify(t('removeAds.restoreFail'));
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
        ) : owned ? (
          <div className="inline-ad mt-4">
            <CheckCircle2 size={18} className="text-green" />
            <p>{t('removeAds.alreadyPurchased')}</p>
          </div>
        ) : (
          <>
            <button type="button" className="btn-modern btn-play-new btn-block purchase-btn mt-4" onClick={handlePurchase}>
              <ShoppingBag size={18} />
              {/* The store's own price string when it is known. Never one we
                  format — that is how "({price})" reached the screen. */}
              <span>{product?.price
                ? t('removeAds.buyBtn', { price: product.price })
                : t('removeAds.purchaseBtn')}</span>
            </button>
            {/* A permanent product has to survive a reinstall or a new phone,
                and our localStorage flag does not. The store is the record. */}
            <button type="button" className="btn btn-secondary btn-block mt-2 restore-btn" onClick={handleRestore}>
              <RotateCcw size={16} />
              <span>{t('removeAds.restoreBtn')}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
