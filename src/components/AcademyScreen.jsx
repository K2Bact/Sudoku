import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { TutorialMiniGrid } from './TutorialMiniGrid';
import { InteractivePracticeSection } from './academy/practice/InteractivePracticeSection';
import { VariantSwitch } from './home/VariantSwitch';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { usePuzzleKind } from '../hooks/usePuzzleKind';
import { variantOf } from '../engine/variants';
import { ACADEMY_STAGES } from '../data/academyStrategies';
import { pickLocale } from './academy/langHelper';
import { splitTrailingId } from '../utils/bidi';

// The badge with its stage number (2-1) kept left-to-right in Arabic (utils/bidi.js).
function BadgeText({ text }) {
  const parts = splitTrailingId(text);
  if (!parts) return text;
  return (
    <>
      {parts[0]}
      {parts[1]}
      <bdi dir="ltr">{parts[2]}</bdi>
    </>
  );
}

export function AcademyScreen({ onBack }) {
  const { t, activeLanguage } = useTranslation();
  // The locale code goes straight through. It used to be squashed here into a
  // shorter set (zh-CN and zh-TW both became 'zh', es-ES became 'es') because the
  // academy data was keyed that way — a second code scheme, private to this
  // screen. Two Chinese locales sharing one key meant Traditional readers were
  // served Simplified, and nothing could report that because both codes resolved
  // to a key that existed. The data now uses the app's own codes.
  const lang = activeLanguage || 'ko';

  /*
   * Which kind of puzzle is being studied, then which stage (D34, user 2026-10-27:
   * "킬러랑 클래식 나열이 바보 같이 되어 있어"). The tab bar used to read 「1단계 … 5단계 ·
   * 킬러」: a difficulty and a kind of puzzle in one row, so killer looked like a sixth
   * stage after grandmaster — while its first technique is a beginner's.
   *
   * The kind is the one remembered choice Home, the AI lobby and the daily share
   * (usePuzzleKind): a killer player opens a killer academy, and a kind picked here
   * is the kind Home shows on the way back. The classic stage tab is kept while the
   * other kind is looked at.
   */
  const [variant, setVariant] = usePuzzleKind();
  const stages = ACADEMY_STAGES.filter((s) => variantOf(s) === variant);
  const [activeTab, setActiveTab] = useState('stage1');

  const handleTabChange = (tabKey) => {
    soundHaptic.playSelectSound();
    setActiveTab(tabKey);
  };

  const currentStage = stages.find((s) => s.id === activeTab) || stages[0];
  // A kind with one stage (killer) shows its techniques straight away, with no tab bar.
  const showTabs = stages.length > 1;

  return (
    <div className="academy-screen-container">
      {/* Top Mobile App Navigation Bar */}
      <ScreenHeader
        title={t('academy.title')}
        icon={BookOpen}
        iconColorClass="text-blue"
        onBack={onBack}
      />

      {/* Kind first: 정통 | 킬러, the same switch (and ⓘ rules) as Home */}
      <div className={`academy-kind-bar ${showTabs ? '' : 'alone'}`}>
        <VariantSwitch variant={variant} onChange={setVariant} />
      </div>

      {/* Then the stage, when the kind has more than one (classic: 1 ~ 5) */}
      {showTabs && (
        <div className="academy-tab-bar">
          {stages.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`seg-tab-btn ${currentStage.id === s.id ? 'active' : ''}`}
              onClick={() => handleTabChange(s.id)}
            >
              {t(s.tabKey)}
            </button>
          ))}
        </div>
      )}

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
                      const fullTitle = pickLocale(strat.title, lang);
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
                      <BadgeText text={pickLocale(strat.badge, lang)} />
                    </span>
                  </div>
                  <p className="strategy-desc">{pickLocale(strat.desc, lang)}</p>
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
