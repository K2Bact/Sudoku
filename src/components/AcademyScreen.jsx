import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { TutorialMiniGrid } from './TutorialMiniGrid';
import { InteractivePracticeSection } from './academy/practice/InteractivePracticeSection';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { ACADEMY_STAGES } from '../data/academyStrategies';

export function AcademyScreen({ onBack }) {
  const { t, activeLanguage } = useTranslation();
  const lang = (activeLanguage || 'ko').startsWith('ko')
    ? 'ko'
    : (activeLanguage || '').startsWith('ja')
      ? 'ja'
      : (activeLanguage || '').startsWith('zh')
        ? 'zh'
        : (activeLanguage || '').startsWith('es')
          ? 'es'
          : (activeLanguage || '').startsWith('de')
            ? 'de'
            : (activeLanguage || '').startsWith('fr')
              ? 'fr'
              : (activeLanguage || '').startsWith('pt')
                ? 'pt'
                : (activeLanguage || '').startsWith('it')
                  ? 'it'
                  : (activeLanguage || '').startsWith('ru')
                    ? 'ru'
                    : (activeLanguage || '').startsWith('hi')
                      ? 'hi'
                      : (activeLanguage || '').startsWith('ar')
                        ? 'ar'
                        : 'en';
  const [activeTab, setActiveTab] = useState('stage1'); // 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5'

  const handleTabChange = (tabKey) => {
    soundHaptic.playSelectSound();
    setActiveTab(tabKey);
  };

  const currentStage = ACADEMY_STAGES.find((s) => s.id === activeTab) || ACADEMY_STAGES[0];

  return (
    <div className="academy-screen-container">
      {/* Top Mobile App Navigation Bar */}
      <ScreenHeader
        title={t('academy.title')}
        icon={BookOpen}
        iconColorClass="text-blue"
        onBack={onBack}
      />

      {/* Segmented Tab Navigation Bar (Stages 1 ~ 5) */}
      <div className="academy-tab-bar">
        {ACADEMY_STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`seg-tab-btn ${activeTab === s.id ? 'active' : ''}`}
            onClick={() => handleTabChange(s.id)}
          >
            {t(s.tabKey)}
          </button>
        ))}
      </div>

      {/* Main Full-Screen Scrollable Content Area */}
      <div className="academy-scroll-content">
        {currentStage && (
          <div className="tab-pane">
            <div className="stage-banner-card">
              {(() => {
                const titleText = t(currentStage.titleKey);
                const match = titleText.match(/^(.+?)\s*\((.+?)\)$/);
                const mainTitle = match ? match[1] : titleText;
                const subTitle = match ? `(${match[2]})` : null;
                return (
                  <h3 className="tab-section-title">
                    <span className="stage-title-main">{mainTitle}</span>
                    {subTitle && <span className="stage-title-sub">{subTitle}</span>}
                  </h3>
                );
              })()}
            </div>

            <div className="strategy-card-list">
              {currentStage.strategies.map((strat) => (
                <div key={strat.id} className="strategy-item-card">
                  <div className="strategy-header">
                    {(() => {
                      const fullTitle = strat.title[lang] || strat.title.en || '';
                      const match = fullTitle.match(/^(.+?)\s*\((.+?)\)$/);
                      if (match) {
                        return (
                          <h4 className="strategy-title">
                            <span className="strat-main-name">{match[1]}</span>
                            <span className="strat-sub-name">({match[2]})</span>
                          </h4>
                        );
                      }
                      return <h4 className="strategy-title"><span className="strat-main-name">{fullTitle}</span></h4>;
                    })()}
                    <span className={`strategy-badge ${currentStage.badgeClass || 'beginner'}`}>
                      {strat.badge[lang] || strat.badge.en}
                    </span>
                  </div>
                  <p className="strategy-desc">{strat.desc[lang] || strat.desc.en}</p>
                  <div className="strategy-diagram-wrap">
                    <InteractivePracticeSection strategyId={strat.id} lang={lang}>
                      <TutorialMiniGrid type={strat.id} lang={lang} />
                    </InteractivePracticeSection>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
