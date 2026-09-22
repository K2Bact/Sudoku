import { useEffect } from 'react';
import { cloudSyncService } from '../services/cloudSyncService';
import { useConfirm } from '../components/common/ConfirmProvider';
import { useTranslation } from '../i18n/i18nContext';

/**
 * Backs up to Play Games whenever there is something new and a way to send it, and
 * offers a fresh phone its earlier record once.
 *
 * Backups used to be tried only at a win. Wins played offline then waited for the
 * next win, and a player who stopped winning never uploaded them. Now also:
 *   - on sign-in (launch)  — first the restore offer, then any backlog
 *   - when the connection comes back
 *   - when the app returns to the foreground
 * cloudSyncService.syncIfNeeded() does nothing when nothing changed.
 */
export function useCloudAutoSync() {
  const confirm = useConfirm();
  const { t } = useTranslation();

  useEffect(() => {
    const sync = () => { cloudSyncService.syncIfNeeded().catch(() => {}); };

    const onSignedIn = async () => {
      try {
        const offer = await cloudSyncService.findRestoreOffer();
        if (offer && (await confirm(t('cloudSync.restorePrompt', { won: offer.gamesWon })))) {
          const res = await cloudSyncService.restoreFromCloud();
          if (res.success) { window.location.reload(); return; }
        }
      } catch (e) {
        console.warn('[CloudAutoSync] restore offer failed:', e?.message || e);
      }
      sync();
    };
    const onVisible = () => { if (document.visibilityState === 'visible') sync(); };

    window.addEventListener('playGamesSignedIn', onSignedIn);
    window.addEventListener('online', sync);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('playGamesSignedIn', onSignedIn);
      window.removeEventListener('online', sync);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [confirm, t]);
}
