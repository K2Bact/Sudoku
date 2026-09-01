import React from 'react';
import { soundHaptic } from '../../utils/soundHaptic';
import { useTranslation } from '../../i18n/i18nContext';

export function LanguageSelectorSection() {
  const { t, language, setLanguage, supportedLanguages } = useTranslation();

  return (
    <div>
      <div className="settings-section-header">{t('settings.languageSection')}</div>
      <div className="settings-card-group" style={{ padding: '10px' }}>
        <div className="language-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {supportedLanguages.map((lang) => (
            <button type="button"
              key={lang.code}
              className={`language-pill-btn ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                soundHaptic.playSelectSound();
                setLanguage(lang.code);
              }}
            >
              <span className="language-flag-emoji" style={{ fontSize: '15px', lineHeight: 1 }}>
                {lang.flag || '🌐'}
              </span>
              <span>{lang.code === 'auto' ? (t('settings.languages.auto') || 'Auto') : lang.nativeName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
