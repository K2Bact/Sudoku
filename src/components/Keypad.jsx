import React from 'react';
import { Undo2, Eraser, Pencil, Lightbulb, Lock, Unlock, PlayCircle } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

export function Keypad({
  remainingCounts,
  activeNumber = null,
  onInputNumber,
  onErase,
  onUndo,
  canUndo,
  isNoteMode,
  onToggleNoteMode,
  isFastEntryMode,
  onToggleFastEntryMode,
  lockedNumber,
  onGetHint,
  hintsRemaining = 3,
  isBattle = false,
  isSpeedrun = false
}) {
  const { t } = useTranslation();
  const isNoHint = isBattle || isSpeedrun;

  return (
    <div className="keypad-container">
      {/* Action Toolbar (4-cols in Battle/Speedrun mode, 5-cols in Single player) */}
      <div className={`action-toolbar ${isNoHint ? 'battle-toolbar' : ''}`}>
        <button type="button"
          className={`action-btn ${canUndo ? '' : 'disabled'}`}
          onClick={onUndo}
          disabled={!canUndo}
          title={t('keypad.undo')}
        >
          <Undo2 size={20} />
          <span>{t('keypad.undo')}</span>
        </button>

        <button type="button" className="action-btn" onClick={onErase} title={t('keypad.erase')}>
          <Eraser size={20} />
          <span>{t('keypad.erase')}</span>
        </button>

        <button type="button"
          className={`action-btn ${isNoteMode ? 'active' : ''}`}
          onClick={onToggleNoteMode}
          title={t('keypad.notes')}
        >
          <Pencil size={20} />
          <span>{t('keypad.notes')} {isNoteMode ? 'ON' : 'OFF'}</span>
        </button>

        <button type="button"
          className={`action-btn ${isFastEntryMode ? 'active' : ''}`}
          onClick={onToggleFastEntryMode}
          title={t('keypad.fastEntry')}
        >
          {isFastEntryMode ? <Lock size={20} className="text-active" /> : <Unlock size={20} />}
          <span>{t('keypad.fastEntry')}</span>
        </button>

        {/* Hints are completely disabled during competitive 1v1 Battle & Speedrun mode */}
        {!isNoHint && (
          hintsRemaining > 0 ? (
            <button type="button" className="action-btn hint-btn" onClick={onGetHint} title={`${t('keypad.hint')} (${hintsRemaining})`}>
              <Lightbulb size={20} className="text-yellow" />
              <span>{t('keypad.hint')} ({hintsRemaining})</span>
            </button>
          ) : (
            <button type="button" className="action-btn hint-btn reward-ad-hint" onClick={onGetHint} title={t('modals.hintReward.watchAd')}>
              <PlayCircle size={20} style={{ color: '#3b82f6' }} />
              <span style={{ color: '#3b82f6', fontWeight: '800' }}>{t('keypad.rewardHint')}</span>
            </button>
          )
        )}
      </div>

      {/* Number Pad (1-9) with Visual Focus Hierarchy */}
      {(() => {
        const currentActive = isFastEntryMode ? (lockedNumber || activeNumber) : activeNumber;
        const hasSelection = currentActive !== null && currentActive !== undefined;
        const isFastModeWaiting = isFastEntryMode && !hasSelection;

        return (
          <div className={`number-pad ${hasSelection ? 'has-active' : ''} ${isFastModeWaiting ? 'fast-mode-waiting' : ''}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const remaining = remainingCounts[num] !== undefined ? remainingCounts[num] : 9;
              const isComplete = remaining <= 0;
              const isSelected = currentActive === num;

              return (
                <button type="button"
                  key={num}
                  className={`num-btn ${isComplete ? 'completed' : ''} ${isSelected ? 'active-selected' : ''}`}
                  onClick={() => onInputNumber(num)}
                >
                  <span className="num-val">{num}</span>
                  <span className="num-count">{isComplete ? '✓' : remaining}</span>
                </button>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
