import React from 'react';
import { Award, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';

// Which strings each step reads: with a cell to point at, and without one (KP-18).
const TEXT = {
  single: { title: 'singleTitle', desc: 'singleDesc', plain: 'singlePlain' },
  notes: { title: 'notesTitle', desc: 'notesDesc', plain: 'notesPlain' },
  fast: { title: 'fastTitle', desc: 'fastDesc', plain: 'fastDesc' },
  cageLast: { title: 'cageTitle', desc: 'cageDesc', plain: 'cagePlain' },
  rule45: { title: 'rule45Title', desc: 'rule45Desc', plain: 'rule45Plain' },
  done: { title: 'doneTitle', desc: 'doneDesc', plain: 'doneDesc' },
};

/**
 * The first-game walkthrough's card above the board (KP-18). What the step is and
 * when it is done come from useGuidedTutorial; this only says it. A step that has
 * a cell to point at moves on when the player does it, so it shows no Next button —
 * a step without one shows Next, and the last step shows Keep playing.
 */
export function GuidedTutorialOverlay({ guide, kind, onNextStep, onExitTutorial }) {
  const { t } = useTranslation();
  const { id, steps, index, target, ready } = guide;
  const text = TEXT[id] || TEXT.done;
  const isLast = id === 'done';
  const params = target
    ? { row: target.r + 1, col: target.c + 1, num: target.num, sum: target.sum, cands: (target.cands || []).join(' · ') }
    : {};
  const descKey = isLast && kind === 'killer' ? 'doneKillerDesc' : target ? text.desc : text.plain;

  const handleNext = () => {
    soundHaptic.playSelectSound();
    if (isLast) onExitTutorial();
    else onNextStep();
  };
  const handleExit = () => {
    soundHaptic.playSelectSound();
    onExitTutorial();
  };

  return (
    <div className="guided-coaching-banner" role="status" aria-live="polite" data-step={id}>
      <div className="coaching-header">
        <Award className="text-yellow" size={18} />
        <h4>{t(`tutorialOverlay.${text.title}`)}</h4>
        <span className="step-badge">{index + 1} / {steps.length}</span>
        <button type="button" className="icon-btn close-coaching-btn" onClick={handleExit} title={t('tutorialOverlay.exitTooltip')} aria-label={t('tutorialOverlay.exitTooltip')}>
          <X size={16} />
        </button>
      </div>
      <p className="coaching-desc">{ready ? t(`tutorialOverlay.${descKey}`, params) : ''}</p>
      {(isLast || (ready && !target && id !== 'fast')) && (
        <div className="coaching-actions">
          <button type="button" className={`btn ${isLast ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={handleNext}>
            {isLast ? <CheckCircle2 size={16} /> : null}
            <span>{t(isLast ? 'tutorialOverlay.finishBtn' : 'tutorialOverlay.nextBtn')}</span>
            {isLast ? null : <ChevronRight size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
