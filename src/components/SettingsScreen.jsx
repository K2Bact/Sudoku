import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Shield,
  Trash2,
  Info,
  ChevronRight,
  AlertTriangle,
  Eye,
  CloudUpload,
  CloudDownload
} from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { PrivacyPolicyModal } from './modals/PrivacyPolicyModal';
import { ThemeSelectorSection } from './settings/ThemeSelectorSection';
import { LanguageSelectorSection } from './settings/LanguageSelectorSection';
import { soundHaptic } from '../utils/soundHaptic';
import { loadSettings, saveSettings, clearGameState } from '../utils/storage';
import { cloudSyncService } from '../services/cloudSyncService';
import { useTranslation } from '../i18n/i18nContext';
import { APP_INFO } from '../config/appInfo';

export function SettingsScreen({
  onBack,
  soundEnabled,
  onToggleSound,
  theme,
  onSelectTheme
}) {
  const { t } = useTranslation();
  const currentSettings = loadSettings();
  const [hapticEnabled, setHapticEnabled] = useState(soundHaptic.hapticEnabled);
  const [limitMistakes, setLimitMistakes] = useState(currentSettings.limitMistakes ?? true);
  const [autoCheckMistakes, setAutoCheckMistakes] = useState(currentSettings.autoCheckMistakes ?? true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const handleToggleHaptic = () => {
    soundHaptic.playSelectSound();
    const next = !hapticEnabled;
    setHapticEnabled(next);
    soundHaptic.setHapticEnabled(next);
  };

  const handleToggleLimitMistakes = () => {
    soundHaptic.playSelectSound();
    const next = !limitMistakes;
    setLimitMistakes(next);
    saveSettings({ ...loadSettings(), limitMistakes: next });
  };

  const handleToggleAutoCheckMistakes = () => {
    soundHaptic.playSelectSound();
    const next = !autoCheckMistakes;
    setAutoCheckMistakes(next);
    saveSettings({ ...loadSettings(), autoCheckMistakes: next });
  };

  const handleCloudBackup = async () => {
    soundHaptic.playSelectSound();
    setSyncStatus('backingUp');
    const res = await cloudSyncService.saveToCloud();
    if (res.success) {
      setSyncStatus('backupSuccess');
      setTimeout(() => setSyncStatus(null), 3500);
    } else {
      setSyncStatus('backupFail');
    }
  };

  const handleCloudRestore = async () => {
    soundHaptic.playSelectSound();
    if (window.confirm(t('cloudSync.restoreConfirm'))) {
      setSyncStatus('restoring');
      const res = await cloudSyncService.restoreFromCloud();
      if (res.success) {
        setSyncStatus('restoreSuccess');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        alert(res.message || t('cloudSync.noData'));
        setSyncStatus(null);
      }
    }
  };

  const handleResetData = () => {
    soundHaptic.playSelectSound();
    if (window.confirm(t('settings.resetConfirm'))) {
      try {
        localStorage.clear();
        clearGameState();
        alert(t('settings.resetSuccess'));
        window.location.reload();
      } catch (e) {
        console.error('Failed to reset data:', e);
      }
    }
  };

  return (
    <div className="settings-screen-container">
      <ScreenHeader
        title={t('settings.title')}
        icon={Settings}
        iconColorClass="text-blue"
        onBack={onBack}
      />

      <div className="screen-scroll-content settings-content-wrap">
        {/* Section 1: Gameplay Rules */}
        <div>
          <div className="settings-section-header">{t('settings.gameplaySection')}</div>
          <div className="settings-card-group">
            <div className="settings-row clickable" onClick={handleToggleLimitMistakes}>
              <div className="settings-row-left">
                <div className="settings-icon-badge red">
                  <AlertTriangle size={18} />
                </div>
                <div className="settings-text-col">
                  <span className="settings-title">{t('settings.limitMistakes')}</span>
                  <p className="settings-subtitle">{t('settings.limitMistakesDesc')}</p>
                </div>
              </div>
              <div className={`settings-toggle-pill ${limitMistakes ? 'on' : 'off'}`}>
                {limitMistakes ? 'ON' : 'OFF'}
              </div>
            </div>

            <div className="settings-row clickable" onClick={handleToggleAutoCheckMistakes}>
              <div className="settings-row-left">
                <div className="settings-icon-badge blue">
                  <Eye size={18} />
                </div>
                <div className="settings-text-col">
                  <span className="settings-title">{t('settings.autoCheck')}</span>
                  <p className="settings-subtitle">{t('settings.autoCheckDesc')}</p>
                </div>
              </div>
              <div className={`settings-toggle-pill ${autoCheckMistakes ? 'on' : 'off'}`}>
                {autoCheckMistakes ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Audio & Haptics */}
        <div>
          <div className="settings-section-header">{t('settings.soundSection')}</div>
          <div className="settings-card-group">
            <div className="settings-row clickable" onClick={onToggleSound}>
              <div className="settings-row-left">
                <div className="settings-icon-badge yellow">
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </div>
                <div className="settings-text-col">
                  <span className="settings-title">{t('settings.soundFx')}</span>
                  <p className="settings-subtitle">{t('settings.soundFxDesc')}</p>
                </div>
              </div>
              <div className={`settings-toggle-pill ${soundEnabled ? 'on' : 'off'}`}>
                {soundEnabled ? 'ON' : 'OFF'}
              </div>
            </div>

            <div className="settings-row clickable" onClick={handleToggleHaptic}>
              <div className="settings-row-left">
                <div className="settings-icon-badge purple">
                  <Smartphone size={18} />
                </div>
                <div className="settings-text-col">
                  <span className="settings-title">{t('settings.hapticFx')}</span>
                  <p className="settings-subtitle">{t('settings.hapticFxDesc')}</p>
                </div>
              </div>
              <div className={`settings-toggle-pill ${hapticEnabled ? 'on' : 'off'}`}>
                {hapticEnabled ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Cloud Save & Account Sync */}
        <div>
          <div className="settings-section-header">{t('cloudSync.sectionTitle')}</div>
          <div className="settings-card-group">
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

        {/* Section 4: Themes */}
        <ThemeSelectorSection theme={theme} onSelectTheme={onSelectTheme} />

        {/* Section 5: Languages */}
        <LanguageSelectorSection />

        {/* Section 6: Data & Privacy */}
        <div>
          <div className="settings-section-header">{t('settings.privacySection')}</div>
          <div className="settings-card-group">
            <div
              className="settings-row clickable"
              onClick={() => {
                soundHaptic.playSelectSound();
                setShowPrivacyModal(true);
              }}
            >
              <div className="settings-row-left">
                <div className="settings-icon-badge green">
                  <Shield size={18} />
                </div>
                <div className="settings-text-col">
                  <span className="settings-title">{t('settings.privacyPolicyBtn')}</span>
                  <p className="settings-subtitle">{t('settings.privacySubtitle')}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>

            <div className="settings-row clickable" onClick={handleResetData}>
              <div className="settings-row-left">
                <div className="settings-icon-badge red">
                  <Trash2 size={18} />
                </div>
                <div className="settings-text-col">
                  <span className="settings-title" style={{ color: '#ef4444' }}>{t('settings.resetData')}</span>
                  <p className="settings-subtitle">{t('settings.resetDataDesc')}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="settings-footer">
          <div className="version-pill">
            <Info size={14} />
            <span>{APP_INFO.name} v{APP_INFO.version} (Build {APP_INFO.buildCode})</span>
          </div>
          <p className="text-muted mt-2" style={{ fontSize: '11px' }}>
            {APP_INFO.copyright}
          </p>
        </div>
      </div>

      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}
    </div>
  );
}
