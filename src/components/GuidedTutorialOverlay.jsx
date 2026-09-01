import React from 'react';
import { Award, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';

export function GuidedTutorialOverlay({
  step,
  currentStep,
  onNextStep,
  onExitTutorial,
  onFinishTutorial
}) {
  const { t } = useTranslation();
  const actualStep = step ?? currentStep ?? 0;
  const handleFinish = onExitTutorial || onFinishTutorial;

  const steps = [
    {
      title: t('tutorialOverlay.step1Title'),
      desc: t('tutorialOverlay.step1Desc'),
      targetCell: [0, 2],
      expectedNum: 9
    },
    {
      title: t('tutorialOverlay.step2Title'),
      desc: t('tutorialOverlay.step2Desc'),
      targetCell: [1, 4],
      expectedNum: 3
    },
    {
      title: t('tutorialOverlay.step3Title'),
      desc: t('tutorialOverlay.step3Desc'),
      targetCell: [2, 6],
      expectedNum: 4
    },
    {
      title: t('tutorialOverlay.step4Title'),
      desc: t('tutorialOverlay.step4Desc'),
      isComplete: true
    }
  ];

  const activeStep = steps[actualStep] || steps[0];
  const isLast = actualStep >= steps.length - 1;

  const handleNextClick = () => {
    soundHaptic.playSelectSound();
    if (isLast) {
      if (handleFinish) handleFinish();
    } else {
      if (onNextStep) onNextStep();
    }
  };

  const handleExitClick = () => {
    soundHaptic.playSelectSound();
    if (handleFinish) handleFinish();
  };

  return (
    <div className="guided-coaching-banner">
      <div className="coaching-header">
        <Award className="text-yellow" size={20} />
        <h4>{activeStep.title}</h4>
        <span className="step-badge">{actualStep + 1} / {steps.length}</span>
        <button type="button" className="icon-btn close-coaching-btn ml-auto" onClick={handleExitClick} title={t('tutorialOverlay.exitTooltip')}>
          <X size={16} />
        </button>
      </div>

      <p className="coaching-desc">{activeStep.desc}</p>

      <div className="coaching-actions mt-2">
        {isLast ? (
          <button type="button" className="btn btn-primary btn-block" onClick={handleNextClick}>
            <CheckCircle2 size={18} />
            <span>{t('tutorialOverlay.finishBtn')}</span>
          </button>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleNextClick}>
            <span>{t('tutorialOverlay.nextBtn')}</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
