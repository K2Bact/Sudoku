import React, { useState } from 'react';
import { Zap, Check } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';

export function NewGameModal({ isOpen, currentLevel = 3, onClose, onStartGame }) {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);

  if (!isOpen) return null;

  const handleLevelSelect = (lvl) => {
    soundHaptic.playSelectSound();
    setSelectedLevel(lvl);
  };

  const handleStart = () => {
    soundHaptic.playCompleteChime();
    onStartGame(selectedLevel);
  };

  const handleClose = () => {
    soundHaptic.playSelectSound();
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon-header" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
          <Zap size={44} />
        </div>

        <h2>{t('modals.newGame.title')}</h2>
        <p className="modal-desc">
          {t('modals.newGame.desc')}
        </p>

        {/* Level Selection Grid */}
        <div className="difficulty-modal-list my-3" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <button type="button"
                key={lvl}
                onClick={() => handleLevelSelect(lvl)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: isSelected ? '2px solid #3b82f6' : '1px solid var(--board-grid-line)',
                  background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--btn-bg)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? '800' : '600',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '900',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isSelected ? '#3b82f6' : 'var(--board-grid-line)',
                    color: isSelected ? '#fff' : 'var(--text-muted)'
                  }}>
                    Lv.{lvl}
                  </span>
                  <span style={{ fontSize: '14px' }}>{t(`levels.${lvl}`)}</span>
                </div>
                {isSelected && <Check size={18} style={{ color: '#3b82f6' }} />}
              </button>
            );
          })}
        </div>

        <div className="modal-actions-vertical w-100 mt-2">
          <button type="button" className="btn btn-primary btn-lg" onClick={handleStart} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <Zap size={20} />
            <span>{t('home.startSelectedLevel', { level: selectedLevel, name: t(`levels.${selectedLevel}`) })}</span>
          </button>

          {onClose && (
            <button type="button" className="btn btn-secondary mt-1" onClick={handleClose}>
              <span>{t('common.cancel')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
