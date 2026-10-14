import React, { useState } from 'react';
import { Bot, Zap } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { loadSettings, saveSettings } from '../utils/storage';
import { usePuzzleKind } from '../hooks/usePuzzleKind';
import { VariantSwitch } from './home/VariantSwitch';
import { RulesModal } from './home/RulesModal';

export function AIBattleScreen({ onBack, onStartAIBattle }) {
  const { t } = useTranslation();
  const [selectedAiLevel, setSelectedAiLevel] = useState(3);
  // Standard or killer, the choice Home's switch shows (KP-11, user 2026-10-14).
  const [variant, setVariant] = usePuzzleKind();
  const [showKillerRules, setShowKillerRules] = useState(false);

  const startMatch = () => onStartAIBattle(selectedAiLevel, variant);
  // The first killer starts after its rules, here as on Home — one setting, so
  // the rules seen on either screen are seen.
  const handleStartMatch = () => {
    soundHaptic.playSelectSound();
    if (variant === 'killer' && !loadSettings().killerRulesSeen) setShowKillerRules(true);
    else startMatch();
  };

  const levelConfigs = [
    { level: 1, name: t('levels.1'), desc: t('aiBattleScreen.level1Desc'), speed: '★☆☆☆☆' },
    { level: 2, name: t('levels.2'), desc: t('aiBattleScreen.level2Desc'), speed: '★★☆☆☆' },
    { level: 3, name: t('levels.3'), desc: t('aiBattleScreen.level3Desc'), speed: '★★★☆☆' },
    { level: 4, name: t('levels.4'), desc: t('aiBattleScreen.level4Desc'), speed: '★★★★☆' },
    { level: 5, name: t('levels.5'), desc: t('aiBattleScreen.level5Desc'), speed: '★★★★★' }
  ];

  const current = levelConfigs.find(c => c.level === selectedAiLevel) || levelConfigs[2];

  return (
    <div className="battle-lobby-container">
      <ScreenHeader
        title={t('home.modes.aiBattle.title')}
        icon={Bot}
        iconColorClass="text-purple"
        onBack={onBack}
      />

      <div className="screen-scroll-content">
        <div className="match-options-mobile-group">
          {/* AI Banner Card */}
          <div className="battle-mode-card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff' }}>
            <div className="card-header">
              <Bot size={32} className="text-purple" />
              <div>
                <h4 style={{ color: '#fff', fontSize: '17px' }}>{t('home.modes.aiBattle.title')}</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('home.modes.aiBattle.desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Difficulty Level Selection Card — the kind first, as on Home's card */}
          <div className="battle-mode-card">
            <VariantSwitch variant={variant} onChange={setVariant} />
            <div className="card-header">
              <Zap size={22} className="text-yellow" />
              <div>
                <h4>{t('aiBattleScreen.selectLevelTitle')}</h4>
                <p>{t('aiBattleScreen.selectLevelDesc')}</p>
              </div>
            </div>

            <div className="level-chip-group mt-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  className={`level-chip ${selectedAiLevel === lvl ? 'active' : ''}`}
                  onClick={() => {
                    soundHaptic.playSelectSound();
                    setSelectedAiLevel(lvl);
                  }}
                >
                  <span className="chip-num">Lv.{lvl}</span>
                  <span className="chip-name">{t(`levels.${lvl}`)}</span>
                </button>
              ))}
            </div>

            {/* Auto-Equalizing Level Spec Card */}
            <div className="ai-level-spec-card mt-2">
              <div className="spec-top-row">
                <span className="spec-level-title">Lv.{current.level} {current.name}</span>
                <span className="spec-speed-badge">
                  {t('aiBattleScreen.aiSpeed', { speed: current.speed })}
                </span>
              </div>
              <div className="spec-desc-grid-stack">
                {levelConfigs.map((cfg) => (
                  <span
                    key={cfg.level}
                    className={`spec-desc-item ${selectedAiLevel === cfg.level ? 'active' : ''}`}
                    aria-hidden={selectedAiLevel !== cfg.level}
                  >
                    {cfg.desc}
                  </span>
                ))}
              </div>
            </div>

            <button
              className="btn-modern btn-battle-action btn-block mt-3"
              onClick={handleStartMatch}
            >
              <Bot size={18} />
              <span>
                {t('aiBattleScreen.startBtn', {
                  level: selectedAiLevel,
                  name: t(`levels.${selectedAiLevel}`)
                })}
              </span>
            </button>
          </div>
        </div>
      </div>

      {showKillerRules && (
        <RulesModal
          variant="killer"
          onClose={() => setShowKillerRules(false)}
          onStart={() => {
            saveSettings({ ...loadSettings(), killerRulesSeen: true });
            setShowKillerRules(false);
            startMatch();
          }}
        />
      )}
    </div>
  );
}
