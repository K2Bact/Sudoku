import React, { useLayoutEffect, useRef, useState } from 'react';
import { BookOpen, Target, CheckCircle2, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';
import { useInteractivePractice } from '../../../hooks/useInteractivePractice.js';
import { PracticeBoardRenderer } from './PracticeBoardRenderer.jsx';
import { PracticeKeypad } from './PracticeKeypad.jsx';
import { useTranslation } from '../../../i18n/i18nContext.jsx';
import { pickLocale } from '../langHelper.js';
import { splitLeadingNotation } from '../../../utils/bidi.js';

// The guide, with its opening solver notation kept as one left-to-right run (utils/bidi.js).
function GuideText({ text }) {
  const parts = splitLeadingNotation(text);
  if (!parts) return text;
  return (
    <>
      <bdi dir="ltr">{parts[0]}</bdi>
      {parts[1]}
      {parts[2]}
    </>
  );
}

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

  // Each card is as tall as ITS tallest tab — theory, practice 1 or practice 2 — so
  // switching tabs does not move the page, and a small technique does not sit in a
  // frame sized for the largest one. (It used to be one min-height for all 32 cards,
  // tuned to a 9x9 board with keypad; Full House's one-row example floated in it.)
  // The three tabs are rendered once, invisibly, measured, and removed before paint —
  // so the page never carries duplicate boards. Measured again when the width
  // changes, because the boards scale with it.
  const slotRef = useRef(null);
  const ghostRef = useRef(null);
  const [measuring, setMeasuring] = useState(true);
  const [minHeight, setMinHeight] = useState(0);
  const widthRef = useRef(0);

  useLayoutEffect(() => {
    if (!measuring || !ghostRef.current) return;
    const heights = [...ghostRef.current.children].map((el) => el.getBoundingClientRect().height);
    setMinHeight(Math.ceil(Math.max(0, ...heights)));
    setMeasuring(false);
  }, [measuring]);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot || typeof ResizeObserver === 'undefined') return undefined;
    widthRef.current = slot.getBoundingClientRect().width;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (Math.abs(w - widthRef.current) > 1) {
        widthRef.current = w;
        setMeasuring(true);
      }
    });
    ro.observe(slot);
    return () => ro.disconnect();
  }, []);

  // One mission tab. `live` is the tab the player is using; the others are drawn
  // only for measuring, with nothing entered.
  const renderMission = (mission, live) => (
    <div className="practice-mission-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="practice-guide-box">
        <strong>{pickLocale(mission.title, lang)}</strong>
        <p style={{ marginTop: '4px', margin: 0 }}>
          <GuideText text={pickLocale(mission.guide, lang)} />
        </p>
      </div>

      <PracticeBoardRenderer
        mission={mission}
        enteredVal={live ? enteredVal : null}
        isSolved={live ? isSolved : false}
        isError={live ? isError : false}
        onTargetCellTap={() => {}}
      />

      <div className="practice-keypad-wrapper">
        <PracticeKeypad
          onInputNumber={live ? handleInputNumber : () => {}}
          correctVal={mission.correctVal}
          enteredVal={live ? enteredVal : null}
          isSolved={live ? isSolved : false}
          isError={live ? isError : false}
        />
      </div>

      {live && isSolved ? (
        <div className="practice-success-badge">
          <CheckCircle2 size={16} />
          <span>{t('academy.practiceUi.success', { val: mission.correctVal })}</span>
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
      ) : live && isError ? (
        <div className="practice-error-badge">
          <AlertCircle size={15} />
          <span>{t('academy.practiceUi.error', { val: enteredVal })}</span>
        </div>
      ) : (
        <div className="practice-hint-prompt">
          <HelpCircle size={14} />
          <span>
            {mission.asks === 'eliminated'
              ? t('academy.practiceUi.promptEliminated')
              : t('academy.practiceUi.prompt')}
          </span>
        </div>
      )}
    </div>
  );


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

      {/* Main Display — at least as tall as this card's tallest tab */}
      <div className="practice-panel-slot" ref={slotRef} style={{ position: 'relative', minHeight: minHeight || undefined }}>
        {activeTab === 'theory' ? (
          <div className="theory-diagram-container">
            {children}
          </div>
        ) : currentMission ? (
          renderMission(currentMission, true)
        ) : null}

        {measuring && (
          <div
            ref={ghostRef}
            aria-hidden="true"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, visibility: 'hidden', pointerEvents: 'none' }}
          >
            <div className="theory-diagram-container">{children}</div>
            {ex1 && <div>{renderMission(ex1, false)}</div>}
            {ex2 && <div>{renderMission(ex2, false)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
