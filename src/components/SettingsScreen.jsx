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
  Eye
} from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { PrivacyPolicyModal } from './modals/PrivacyPolicyModal';
import { ThemeSelectorSection } from './settings/ThemeSelectorSection';
import { LanguageSelectorSection } from './settings/LanguageSelectorSection';
import { soundHaptic } from '../utils/soundHaptic';
import { loadSettings, saveSettings, clearGameState } from '../utils/storage';
import { AccountSection } from './settings/AccountSection';
import { useTranslation } from '../i18n/i18nContext';
import { useConfirm, useNotify } from './common/ConfirmProvider';
import { APP_INFO } from '../config/appInfo';

export function SettingsScreen({
  onBack,
  soundEnabled,
  onToggleSound,
  theme,
  onSelectTheme
}) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const notify = useNotify();
  const currentSettings = loadSettings();
  const [hapticEnabled, setHapticEnabled] = useState(soundHaptic.hapticEnabled);
  const [limitMistakes, setLimitMistakes] = useState(currentSettings.limitMistakes ?? true);
  const [autoCheckMistakes, setAutoCheckMistakes] = useState(currentSettings.autoCheckMistakes ?? true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleToggleHaptic = () => {
    soundHaptic.playSelectSound();
    const next = !hapticEnabled;
    setHapticEnabled(next);
    soundHaptic.setHapticEnabled(next);
    // Persist it. Every other toggle in this file already did; this one only
    // updated React state and the in-memory singleton, so turning vibration off
    // came back on at the next launch.
    saveSettings({ ...loadSettings(), hapticEnabled: next });
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



  const handleResetData = async () => {
    soundHaptic.playSelectSound();
    if (await confirm(t('settings.resetConfirm'))) {
      try {
        localStorage.clear();
        clearGameState();
        await notify(t('settings.resetSuccess'));
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

        {/* Section 3: Play Games account + cloud backup */}
        <AccountSection />

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
          {/* 아랍어 화면에서 이 줄이 `.K2Bact. All rights reserved 2026 ©` 로
              나왔다. 양방향 알고리즘이 RTL 문맥 안의 라틴 문자열을 재배열한
              것으로 데이터는 맞다. 저작권 표기는 언어와 무관하게 항상 좌에서
              우로 읽혀야 하므로 방향을 고정한다. */}
          <p className="text-muted mt-2" dir="ltr" style={{ fontSize: '11px' }}>
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
