import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { admobService } from '../services/admobService';
import { useTranslation } from '../i18n/i18nContext';

export function AdBanner({ onOpenRemoveAdsModal }) {
  const { t } = useTranslation();
  if (admobService.isAdsRemoved()) {
    return null; // Don't render banner if user purchased Remove Ads
  }

  return (
    <div className="admob-banner-container">
      <div className="banner-content">
        <span className="ad-tag">AdMob</span>
        <span className="ad-text">{t('adBanner.sponsor')}</span>
      </div>
      <button className="remove-ad-badge-btn" onClick={onOpenRemoveAdsModal} title={t('adBanner.removeBtn')}>
        <ShieldCheck size={12} />
        <span>{t('adBanner.removeBtn')}</span>
      </button>
    </div>
  );
}
