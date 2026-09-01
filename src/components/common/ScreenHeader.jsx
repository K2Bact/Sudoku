import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { soundHaptic } from '../../utils/soundHaptic';
import { useTranslation } from '../../i18n/i18nContext';

/**
 * ScreenHeader
 * Unified navigation header for all full-screen views (Daily, Stats, Brain, Battle, Academy, Store).
 */
export function ScreenHeader({ title, icon: Icon, iconColorClass = '', onBack, rightAction }) {
  const { t } = useTranslation();
  const handleBackClick = () => {
    soundHaptic.playSelectSound();
    if (onBack) onBack();
  };

  return (
    <div className="screen-top-bar">
      <button type="button"
        className="icon-btn back-btn"
        onClick={handleBackClick}
        title={t('common.back')}
      >
        <ArrowLeft size={18} />
      </button>

      <div className="bar-title">
        {Icon && <Icon className={iconColorClass} size={20} />}
        <h2>{title}</h2>
      </div>

      <div className="bar-right-area">
        {rightAction || <div style={{ width: 36 }} />}
      </div>
    </div>
  );
}
