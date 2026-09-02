import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { adsService } from '../services/adsService';
import { useTranslation } from '../i18n/i18nContext';

/**
 * The bottom ad slot.
 *
 * What it draws depends on whether an advertiser is actually being served:
 *
 *   ads removed      nothing at all
 *   no real provider a slot labelled as a placeholder — no sponsor, no vendor
 *   real provider    an empty reserved slot; the SDK paints its own banner over
 *                    the WebView, so drawing our own text here would sit on top
 *                    of the real ad
 *
 * The middle case used to print "Official Google AdMob Sponsored Ad" beside an
 * "AdMob" tag in thirteen languages while no AdMob SDK existed in the project.
 * Never label this slot with a vendor or a sponsor unless adsService.isReal
 * says one is really there.
 *
 * `refreshTrigger` is bumped by the parent after a Remove Ads purchase so this
 * re-reads the entitlement; it is not otherwise used.
 */
export function AdBanner({ onOpenRemoveAdsModal, refreshTrigger }) {
  const { t } = useTranslation();

  if (adsService.isAdsRemoved()) {
    return null;
  }

  const isReal = adsService.isReal;

  return (
    <div className="ad-slot-container" data-ad-provider={adsService.providerId} data-refresh={refreshTrigger}>
      <div className="banner-content">
        {!isReal && (
          <>
            <span className="ad-tag">{t('adBanner.placeholderTag')}</span>
            <span className="ad-text">{t('adBanner.placeholderText')}</span>
          </>
        )}
      </div>
      {/* No entry point unless a purchase can actually be completed. A button
          leading to a store that cannot charge is worse than no button: the
          player comes back believing they bought something. */}
      {adsService.canPurchase && (
        <button className="remove-ad-badge-btn" onClick={onOpenRemoveAdsModal} title={t('adBanner.removeBtn')}>
          <ShieldCheck size={12} />
          <span>{t('adBanner.removeBtn')}</span>
        </button>
      )}
    </div>
  );
}
