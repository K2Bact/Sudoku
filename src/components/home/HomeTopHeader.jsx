import React from 'react';
import { Lightbulb, Palette, Volume2, VolumeX, Settings } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';

export function HomeTopHeader({
  hintsRemaining,
  onCycleTheme,
  soundEnabled,
  onToggleSound,
  onOpenSettings
}) {
  const { t } = useTranslation();

  return (
    <div className="home-header">
      <div className="logo-brand">
        <span className="brand-icon">🧩</span>
        <div className="brand-text">
          <h1>{t('home.title')}</h1>
          <span className="badge-pro">{t('home.badge')}</span>
        </div>
      </div>

      <div className="home-top-actions">
        <div className="hint-pill-badge" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          background: 'var(--btn-bg)',
          border: '1px solid var(--board-grid-line)',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '800',
          color: 'var(--text-main)'
        }} title={t('home.hintTooltip')}>
          <Lightbulb size={15} style={{ color: '#f59e0b' }} />
          <span>{hintsRemaining}</span>
        </div>

        <button type="button" className="icon-btn" onClick={onCycleTheme} title={t('header.themeTooltip')}>
          <Palette size={18} />
        </button>
        <button type="button" className="icon-btn" onClick={onToggleSound} title={soundEnabled ? t('header.soundOn') : t('header.soundOff')}>
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="muted" />}
        </button>
        <button type="button" className="icon-btn" onClick={onOpenSettings} title={t('home.nav.settings')}>
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
