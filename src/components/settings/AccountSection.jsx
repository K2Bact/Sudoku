import React, { useState, useEffect } from 'react';
import { CloudUpload, CloudDownload, ChevronRight, Gamepad2, Check } from 'lucide-react';
import { soundHaptic } from '../../utils/soundHaptic';
import { cloudSyncService } from '../../services/cloudSyncService';
import { playGamesService } from '../../services/playGamesService';
import { attemptSilentSignIn, allowAutoSignIn } from '../../utils/playGamesBridge';
import { getPlayGamesUser } from '../../utils/storage';
import { useTranslation } from '../../i18n/i18nContext';
import { useConfirm } from '../common/ConfirmProvider';

/**
 * Play Games connection + cloud backup, split out of SettingsScreen so that
 * screen keeps to one job (rendering settings rows) and this one owns the
 * account lifecycle.
 *
 * The connect row exists because the app could only ever attempt a SILENT
 * sign-in, which succeeds only for a player who has already authorised this game
 * on this device. A new install, or anyone who declined once, had no way back in
 * — and Play Games gates both the leaderboard and the cloud backup, so those
 * features were permanently unreachable for them with no visible reason.
 */
export function AccountSection() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [syncStatus, setSyncStatus] = useState(null);
  const [player, setPlayer] = useState(() => getPlayGamesUser());
  const [connecting, setConnecting] = useState(false);

  // Silent sign-in runs shortly after launch; pick up its result if it lands
  // while this screen is open.
  useEffect(() => {
    const onSignedIn = () => setPlayer(getPlayGamesUser());
    window.addEventListener('playGamesSignedIn', onSignedIn);
    return () => window.removeEventListener('playGamesSignedIn', onSignedIn);
  }, []);

  const handleConnect = async () => {
    if (connecting || player) return;
    soundHaptic.playSelectSound();
    setConnecting(true);
    setSyncStatus(null);
    // Interactive: shows Google's sign-in UI. Only ever from a real tap.
    const res = await playGamesService.signIn(true);
    if (res.success) {
      // 직접 켰으니 자동 로그인 차단을 푼다. 다음 실행부터 세션이 조용히 복원된다.
      allowAutoSignIn();
      await attemptSilentSignIn();       // re-emits the event so the bridge stores the profile
      setPlayer(getPlayGamesUser());
    } else {
      setSyncStatus('playGamesFailed');
      setTimeout(() => setSyncStatus(null), 3500);
    }
    setConnecting(false);
  };

  const handleCloudBackup = async () => {
    soundHaptic.playSelectSound();
    setSyncStatus('backingUp');
    const res = await cloudSyncService.saveToCloud();
    // `success` is true even for a device-local write, so `method` is the honest
    // signal — only 'play_games' actually left the device.
    setSyncStatus(res.success && res.method === 'play_games' ? 'backupSuccess' : 'backupFail');
    setTimeout(() => setSyncStatus(null), 3500);
  };

  const handleCloudRestore = async () => {
    soundHaptic.playSelectSound();
    // Native confirm shows hardcoded English buttons; see ConfirmProvider.
    if (!(await confirm(t('cloudSync.restoreConfirm')))) return;
    setSyncStatus('restoring');
    const res = await cloudSyncService.restoreFromCloud();
    if (res.success) {
      setSyncStatus('restoreSuccess');
      setTimeout(() => window.location.reload(), 1200);
    } else {
      window.alert(res.message || t('cloudSync.noData'));
      setSyncStatus(null);
    }
  };

  const connectSubtitle = player
    ? t('cloudSync.playGamesConnected', { name: player.displayName })
    : (syncStatus === 'playGamesFailed' ? t('cloudSync.playGamesFailed') : t('cloudSync.playGamesConnectDesc'));

  return (
    <div>
      <div className="settings-section-header">{t('cloudSync.sectionTitle')}</div>
      <div className="settings-card-group">
        <div
          className={`settings-row ${player ? '' : 'clickable'}`}
          onClick={player ? undefined : handleConnect}
        >
          <div className="settings-row-left">
            <div className={`settings-icon-badge ${player ? 'green' : 'blue'}`}>
              {player ? <Check size={18} /> : <Gamepad2 size={18} />}
            </div>
            <div className="settings-text-col">
              <span className="settings-title">{t('cloudSync.playGamesConnect')}</span>
              <p className="settings-subtitle">{connectSubtitle}</p>
            </div>
          </div>
          {!player && <ChevronRight size={18} className="text-muted" />}
        </div>

        <div className="settings-row clickable" onClick={handleCloudBackup}>
          <div className="settings-row-left">
            <div className="settings-icon-badge blue">
              <CloudUpload size={18} />
            </div>
            <div className="settings-text-col">
              <span className="settings-title">{t('cloudSync.backupTitle')}</span>
              <p className="settings-subtitle">
                {syncStatus === 'backupSuccess' ? t('cloudSync.backupSuccess') : t('cloudSync.backupDesc')}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </div>

        <div className="settings-row clickable" onClick={handleCloudRestore}>
          <div className="settings-row-left">
            <div className="settings-icon-badge purple">
              <CloudDownload size={18} />
            </div>
            <div className="settings-text-col">
              <span className="settings-title">{t('cloudSync.restoreTitle')}</span>
              <p className="settings-subtitle">{t('cloudSync.restoreDesc')}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </div>
      </div>
      <p className="settings-section-hint">{t('cloudSync.autoSyncNotice')}</p>
    </div>
  );
}
