import React, { useState } from 'react';
import { Type, Contrast } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';
import { loadSettings, saveSettings } from '../../utils/storage';
import { TEXT_STEPS, applyDisplaySettings } from '../../utils/textScale';
import { soundHaptic } from '../../utils/soundHaptic';

// One row of a real board, drawn with the board's own classes so the preview is
// what the game will show: a given, an entry, notes, and the box line (D9).
const PREVIEW = [
  { given: 5 }, { value: 3 }, { notes: [1, 2, 4, 7, 9] },
  { given: 8 }, {}, { value: 6 },
  { notes: [3, 5, 6] }, { given: 1 }, { value: 9 },
];

function BoardPreview({ label }) {
  return (
    <div className="sudoku-board-container display-preview" role="img" aria-label={label}>
      <div className="sudoku-grid">
        <div className="sudoku-row">
          {PREVIEW.map((cell, c) => (
            <div
              key={c}
              aria-hidden="true"
              className={`sudoku-cell ${cell.given ? 'given-cell' : 'user-cell'} ${c === 2 || c === 5 ? 'border-right-thick' : ''}`}
            >
              {cell.given || cell.value ? (
                <span className="cell-number">{cell.given || cell.value}</span>
              ) : cell.notes ? (
                <div className="cell-notes-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <span key={n} className="note-digit">{cell.notes.includes(n) ? n : ''}</span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Settings → Display: text size steps, high contrast and a preview (D9, utils/textScale.js). */
export function DisplaySection() {
  const { t } = useTranslation();
  const initial = loadSettings();
  const [textSize, setTextSize] = useState(initial.textSize || 'normal');
  const [highContrast, setHighContrast] = useState(Boolean(initial.highContrast));

  const apply = (change) => {
    const next = { ...loadSettings(), ...change };
    saveSettings(next);
    applyDisplaySettings(next);
  };
  const pickSize = (id) => {
    soundHaptic.playSelectSound();
    setTextSize(id);
    apply({ textSize: id });
  };
  const toggleContrast = () => {
    soundHaptic.playSelectSound();
    const next = !highContrast;
    setHighContrast(next);
    apply({ highContrast: next });
  };

  return (
    <div>
      <div className="settings-section-header">{t('settings.displaySection')}</div>
      <div className="settings-card-group">
        <div className="settings-row display-text-size">
          <div className="settings-row-left">
            <div className="settings-icon-badge blue"><Type size={18} /></div>
            <div className="settings-text-col">
              <span className="settings-title">{t('settings.textSize')}</span>
              <p className="settings-subtitle">{t('settings.textSizeDesc')}</p>
            </div>
          </div>
        </div>
        <div className="text-size-steps" role="radiogroup" aria-label={t('settings.textSize')}>
          {TEXT_STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              role="radio"
              aria-checked={textSize === step.id}
              className={`text-size-step ${textSize === step.id ? 'active' : ''}`}
              onClick={() => pickSize(step.id)}
            >
              {t(`settings.textSizes.${step.id}`)}
            </button>
          ))}
        </div>
        <BoardPreview label={t('settings.previewLabel')} />
        <div className="settings-row clickable" onClick={toggleContrast} role="switch" aria-checked={highContrast}>
          <div className="settings-row-left">
            <div className="settings-icon-badge purple"><Contrast size={18} /></div>
            <div className="settings-text-col">
              <span className="settings-title">{t('settings.highContrast')}</span>
              <p className="settings-subtitle">{t('settings.highContrastDesc')}</p>
            </div>
          </div>
          <div className={`settings-toggle-pill ${highContrast ? 'on' : 'off'}`}>
            {highContrast ? t('common.on') : t('common.off')}
          </div>
        </div>
      </div>
    </div>
  );
}
