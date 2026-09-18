import React from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';

/**
 * Covers the board between the winning tap and the post-game interstitial.
 *
 * It exists to absorb taps. Sudoku is played by tapping quickly, and the last
 * tap is the one that wins; without a moment in between, the next tap can land
 * on the ad as it appears. AdMob asks for exactly this kind of short "please
 * wait" step for apps with frequent tapping. See hooks/useVictoryAd.js.
 *
 * Reuses the victory title rather than adding a string, so nothing new needs
 * translating into thirteen languages.
 */
export function VictoryPauseOverlay() {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay victory-pause-overlay" role="status" aria-live="polite">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#fde68a' }}>
        <Trophy size={56} />
        <h2 style={{ margin: 0, color: '#ffffff' }}>{t('modals.victory.title')}</h2>
      </div>
    </div>
  );
}
