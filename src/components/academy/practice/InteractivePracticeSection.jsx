import React from 'react';
import { BookOpen, Target, CheckCircle2, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';
import { useInteractivePractice } from '../../../hooks/useInteractivePractice.js';
import { PracticeBoardRenderer } from './PracticeBoardRenderer.jsx';
import { PracticeKeypad } from './PracticeKeypad.jsx';
import { useTranslation } from '../../../i18n/i18nContext.jsx';
import { pickLocale } from '../langHelper.js';

export function InteractivePracticeSection({
  strategyId,
  lang = 'ko',
  children
}) {
  const { t } = useTranslation();
  const {
    activeTab,
    handleTabChange,
    currentMission,
    ex1,
    ex2,
    enteredVal,
    isSolved,
    isError,
    handleInputNumber,
    handleReset
  } = useInteractivePractice(strategyId);

  return (
    <div className="interactive-practice-card">
      {/* 3-Way Mode Toggle Tabs */}
      <div className="practice-mode-tabs">
        <button
          type="button"
          className={`practice-tab-btn tab-theory ${activeTab === 'theory' ? 'active' : ''}`}
          onClick={() => handleTabChange('theory')}
        >
          <BookOpen size={14} />
          <span>{t('academy.practiceUi.theory')}</span>
        </button>

        {ex1 && (
          <button
            type="button"
            className={`practice-tab-btn ${activeTab === 'ex1' ? 'active' : ''}`}
            onClick={() => handleTabChange('ex1')}
          >
            <Target size={14} />
            <span>{t('academy.practiceUi.practice1')}</span>
          </button>
        )}

        {ex2 && (
          <button
            type="button"
            className={`practice-tab-btn ${activeTab === 'ex2' ? 'active' : ''}`}
            onClick={() => handleTabChange('ex2')}
          >
            <Target size={14} />
            <span>{t('academy.practiceUi.practice2')}</span>
          </button>
        )}
      </div>

      {/* Main Display: Theory Diagram vs Practice Mission Board */}
      {activeTab === 'theory' ? (
        <div className="theory-diagram-container">
          {children}
        </div>
      ) : currentMission ? (
        <div className="practice-mission-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Guide Instruction Box */}
          <div className="practice-guide-box">
            <strong>{pickLocale(currentMission.title, lang)}</strong>
            <p style={{ marginTop: '4px', margin: 0 }}>
              {pickLocale(currentMission.guide, lang)}
            </p>
          </div>

          {/* Interactive Board Renderer */}
          <PracticeBoardRenderer
            mission={currentMission}
            enteredVal={enteredVal}
            isSolved={isSolved}
            isError={isError}
            onTargetCellTap={() => {
              try { soundHaptic.playSelectSound(); } catch (_) {}
            }}
          />

          {/* Persistent Tactile Keypad */}
          <div className="practice-keypad-wrapper">
            <PracticeKeypad
              onInputNumber={handleInputNumber}
              correctVal={currentMission.correctVal}
              enteredVal={enteredVal}
              isSolved={isSolved}
              isError={isError}
            />
          </div>

          {/* Real-Time Contextual Feedback Banner */}
          {isSolved ? (
            <div className="practice-success-badge">
              <CheckCircle2 size={16} />
              <span>{t('academy.practiceUi.success', { val: currentMission.correctVal })}</span>
              <button
                type="button"
                className="practice-retry-btn"
                onClick={handleReset}
                title={t('academy.practiceUi.retry')}
              >
                <RotateCcw size={14} />
                <span>{t('academy.practiceUi.retry')}</span>
              </button>
            </div>
          ) : isError ? (
            <div className="practice-error-badge">
              <AlertCircle size={15} />
              <span>{t('academy.practiceUi.error', { val: enteredVal })}</span>
            </div>
          ) : (
            <div className="practice-hint-prompt">
              <HelpCircle size={14} />
              <span>
                {currentMission.asks === 'eliminated'
                  ? t('academy.practiceUi.promptEliminated')
                  : t('academy.practiceUi.prompt')}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
