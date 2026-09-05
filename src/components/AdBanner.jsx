import React, { useEffect } from 'react';
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

  const removed = adsService.isAdsRemoved();
  const shouldShow = !removed && adsService.isReal;

  // The banner is a native overlay, not part of this subtree, so it does not
  // disappear when this component unmounts. Leaving the game screen would
  // otherwise leave an ad pinned over the home screen.
  useEffect(() => {
    if (!shouldShow) return undefined;
    adsService.showBanner().catch((e) => {
      console.warn('[ads] could not place the banner:', e?.message || e);
    });
    return () => {
      adsService.hideBanner().catch(() => { /* nothing left to hide */ });
    };
  }, [shouldShow, refreshTrigger]);

  if (removed) {
    return null;
  }

  // No advertiser, no slot.
  //
  // This used to draw a grey box reading "테스트 | 광고 자리 (실제 광고 없음)"
  // whenever the placeholder provider was live. That was the right answer when
  // the fix was stopping the banner from naming an advertiser it never served —
  // but in a shipped build it reads as an unfinished app rather than an honest
  // one, to reviewers and players alike.
  //
  // The slot comes back on its own the moment a real provider is configured;
  // nothing here needs touching then.
  if (!adsService.isReal) {
    return null;
  }

  // Reserved height, nothing drawn. The native overlay sits here; without the
  // space it would cover the keypad.

  return (
    <div className="ad-slot-container" data-ad-provider={adsService.providerId} data-refresh={refreshTrigger}>
      <div className="banner-content" />
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
