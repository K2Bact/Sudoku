import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';

export function ThemeSelectorSection({ theme, onSelectTheme }) {
  const { t } = useTranslation();

  const themeList = [
    { id: 'clay', nameKey: 'themes.clay', dotColor: '#f97316' },
    { id: 'matte-dark', nameKey: 'themes.matteDark', dotColor: '#0f172a' },
    { id: 'pure-ceramic', nameKey: 'themes.pureCeramic', dotColor: '#3b82f6' },
    { id: 'editorial', nameKey: 'themes.editorial', dotColor: '#44403c' }
  ];

  return (
    <div>
      <div className="settings-section-header">{t('settings.themeSection')}</div>
      <div className="settings-card-group">
        {themeList.map((item) => {
          const isSelected = theme === item.id;
          return (
            <div
              key={item.id}
              className={`settings-row clickable ${isSelected ? 'active-theme' : ''}`}
              onClick={() => onSelectTheme(item.id)}
            >
              <div className="settings-row-left">
                <span className="theme-dot" style={{ backgroundColor: item.dotColor }} />
                <span className="settings-title">{t(item.nameKey)}</span>
              </div>
              {isSelected && <Check size={18} className="text-blue" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
