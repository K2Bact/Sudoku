import React, { useState } from 'react';
import { isResumableGame } from '../utils/savedGame';
import { Play, BarChart3, Brain, BookOpen, ChevronRight, Zap, RefreshCw, Hourglass } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine';
import { loadStats, loadGameState, loadSettings, saveSettings } from '../utils/storage';
import { modesOf, variantOf } from '../engine/variants';
import { loadWallet } from '../utils/wallet';
import { iqStatsService, combinedRecord } from '../services/iqStatsService';
import { useTranslation } from '../i18n/i18nContext';
import { soundHaptic } from '../utils/soundHaptic';
import { HomeTopHeader } from './home/HomeTopHeader';
import { HomeHeroCard } from './home/HomeHeroCard';
import { RivalModeChips } from './home/RivalModeChips';
import { HomeBottomBanners } from './home/HomeBottomBanners';
import { VariantSwitch } from './home/VariantSwitch';
import { RulesModal } from './home/RulesModal';
import { usePuzzleKind } from '../hooks/usePuzzleKind';
import { useConfirm } from './common/ConfirmProvider';
import { shouldOfferWalkthrough, markWalkthroughOffered } from '../utils/guidedOffer';
import { useBottomNavRoom } from '../hooks/useBottomNavRoom';

// The start button in each mode, the same on either kind of puzzle.
const START_LOOK = {
  classic: { Icon: Play, label: 'common.newGame' },
  timeAttack: { Icon: Zap, label: 'home.modes.timeAttack.startBtn', style: { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } },
  timeLimit: { Icon: Hourglass, label: 'home.modes.timeLimit.startBtn', style: { background: 'linear-gradient(135deg, #ef4444, #b91c1c)' } },
};

export function HomeScreen({
  onStartGuided,
  onStartSingleGame,
  onStartGame,
  onOpenDailyChallenge,
  onOpenBattleMatch,
  onOpenAIBattle,
  onOpenStats,
  onOpenBrainReport,
  onOpenTutorial,
  onOpenSettings,
  onCycleTheme,
  soundEnabled,
  onToggleSound,
  hintsRemaining: propHints,
  selectedMode = 'classic',
  onSelectMode
}) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const wallet = loadWallet();
  const hintsRemaining = typeof propHints === 'number' ? propHints : (wallet.hints || 0);
  const handleStart = onStartSingleGame || onStartGame;
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [localMode, setLocalMode] = useState(selectedMode);
  // The mode a game would actually start with. RivalModeChips owns the choice
  // and reports the EFFECTIVE value, which is not always the chip that looks
  // selected — Ghost and Time Gap fall back to Standard where they are off.
  const [effectiveRivalMode, setEffectiveRivalMode] = useState('standard');

  const currentSelectedMode = onSelectMode ? selectedMode : localMode;
  const setMode = (m) => {
    if (onSelectMode) onSelectMode(m);
    setLocalMode(m);
  };

  // Standard or killer. Remembered across launches, so a killer player opens the
  // app on their own puzzle (and its Resume button) — the one choice the AI lobby's
  // switch shares (usePuzzleKind.js, KP-11).
  const [variant, setVariant] = usePuzzleKind();
  // Every kind shows the same tabs, so the card keeps one shape (user, 2026-10-01),
  // and since killer Survival (2026-10-14, KP-2) every kind has every mode. A kind
  // without the chosen mode would play its first. Until then a mode the killer
  // lacked was dimmed and said "coming"; with none left, that note went (Diary 132).
  const modes = modesOf(variant);
  const mode = modes.includes(currentSelectedMode) ? currentSelectedMode : modes[0];
  const [showKillerRules, setShowKillerRules] = useState(false);
  // The nav floats over the page; this leaves its height free under the last card (D50).
  const navRef = useBottomNavRoom();
  const pickMode = (m) => {
    soundHaptic.playSelectSound();
    if (modes.includes(m)) setMode(m);
  };
  // One start button for every kind and mode: the kinds differ in the puzzle only
  // (user, 2026-10-07). The first killer starts after its rules.
  const startGame = () => handleStart && handleStart(selectedLevel, false, mode, effectiveRivalMode, variant);
  // The first game of a kind offers the walkthrough once (KP-18, utils/guidedOffer.js).
  const startOrOffer = async () => {
    if (onStartGuided && shouldOfferWalkthrough(variant, mode)) {
      markWalkthroughOffered(variant);
      const yes = await confirm(t(variant === 'killer' ? 'tutorialOverlay.offerKiller' : 'tutorialOverlay.offerClassic'),
        { confirmLabel: t('tutorialOverlay.offerYes'), cancelLabel: t('tutorialOverlay.offerNo') });
      if (yes) { onStartGuided(variant); return; }
    }
    startGame();
  };
  const onPlayNew = () => (variant === 'killer' && !loadSettings().killerRulesSeen ? setShowKillerRules(true) : startOrOffer());
  const StartIcon = START_LOOK[mode].Icon;

  const savedGame = loadGameState();
  const hasSavedGame = isResumableGame(savedGame);
  const isCurrentTabSaved = hasSavedGame && (savedGame.gameMode || 'classic') === mode && variantOf(savedGame) === variant;

  const stats = loadStats();
  // Puzzles cleared, either kind — the count beside the Logic Score, which counts both.
  const won = combinedRecord(stats).gamesWon;
  const brainIQ = iqStatsService.calculateBrainIQ(stats);
  const iqReport = iqStatsService.getPercentileReport(brainIQ);

  return (
    <div className="home-screen-container">
      {/* Top Bar Header */}
      <HomeTopHeader
        hintsRemaining={hintsRemaining}
        onCycleTheme={onCycleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onOpenSettings={onOpenSettings}
      />

      {/* Hero IQ Banner Card */}
      <HomeHeroCard iqReport={iqReport} won={won} />

      {/* Main Game Modes */}
      <div className="home-menu-group">
        {/* Card 1: Single Player (Classic / Time Attack / Time Limit) */}
        <div className="modern-game-card single-card">
          <VariantSwitch variant={variant} onChange={setVariant} />

          {/* Top 3-Mode Selector Tabs — the same three on every kind (variants.js). */}
          <div className="mode-tab-group">
            <button type="button"
              className={`mode-tab-btn ${mode === 'classic' ? 'active' : ''}`}
              onClick={() => pickMode('classic')}
            >
              <Play size={13} />
              <span>{t('home.modeTabs.classic')}</span>
            </button>

            <button type="button"
              className={`mode-tab-btn time-attack-tab ${mode === 'timeAttack' ? 'active' : ''}`}
              onClick={() => pickMode('timeAttack')}
            >
              <Zap size={13} />
              <span>{t('home.modeTabs.timeAttack')}</span>
            </button>

            <button type="button"
              className={`mode-tab-btn time-limit-tab ${mode === 'timeLimit' ? 'active' : ''}`}
              onClick={() => pickMode('timeLimit')}
            >
              <Hourglass size={13} />
              <span>{t('home.modeTabs.timeLimit')}</span>
            </button>
          </div>

          {/* Difficulty Level Selector Chips */}
          <div className="level-chip-group">
            {Object.values(DIFFICULTY_CONFIG).map((cfg) => (
              <button type="button"
                key={cfg.level}
                className={`level-chip ${selectedLevel === cfg.level ? 'active' : ''}`}
                onClick={() => {
                  soundHaptic.playSelectSound();
                  setSelectedLevel(cfg.level);
                }}
              >
                <span className="chip-num">Lv.{cfg.level}</span>
                <span className="chip-name">{t(`levels.${cfg.level}`)}</span>
              </button>
            ))}
          </div>

          {/* Row 3: Rival Race Mode Selector Chips (Standard on Top, Ghost & Delta on Bottom).
              Each kind races its own record (ghostManager.js ghostSlot, 2026-10-14) — a
              killer's ghost is a killer time. */}
          <RivalModeChips
            selectedMode={mode}
            selectedLevel={selectedLevel}
            onChange={setEffectiveRivalMode}
            variant={variant}
          />

          {/* Full-Width Mobile Action Buttons */}
          <div className="action-btn-row">
            {isCurrentTabSaved && (
              <button type="button"
                className="btn-modern btn-resume"
                onClick={() => handleStart && handleStart(savedGame.level || selectedLevel, true, savedGame.gameMode || mode, 'standard', variant)}
              >
                <RefreshCw size={16} />
                <span>{t('common.resume')}</span>
              </button>
            )}

            <button type="button"
              className="btn-modern btn-play-new"
              onClick={onPlayNew}
              style={START_LOOK[mode].style}
            >
              <StartIcon size={16} />
              <span>{t(START_LOOK[mode].label)}</span>
              <ChevronRight size={16} className="arrow-icon" />
            </button>
          </div>
        </div>

        {/* The first killer starts after its rules; the ⓘ by the switch shows them again. */}
        {showKillerRules && (
          <RulesModal
            variant="killer"
            onClose={() => setShowKillerRules(false)}
            onStart={() => {
              saveSettings({ ...loadSettings(), killerRulesSeen: true });
              setShowKillerRules(false);
              startOrOffer();
            }}
          />
        )}

        {/* Bottom Banner Cards: Online PvP, AI Battle & Daily Challenge */}
        <HomeBottomBanners
          onOpenBattleMatch={onOpenBattleMatch}
          onOpenAIBattle={onOpenAIBattle}
          onOpenDailyChallenge={onOpenDailyChallenge}
        />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="home-bottom-nav" ref={navRef}>
        <button type="button" className="nav-item" onClick={onOpenStats}>
          <BarChart3 size={18} className="text-yellow" />
          <span>{t('home.nav.stats')}</span>
        </button>

        <button type="button" className="nav-item" onClick={onOpenBrainReport}>
          <Brain size={18} className="text-purple" />
          <span>{t('home.nav.brain')}</span>
        </button>

        <button type="button" className="nav-item" onClick={onOpenTutorial}>
          <BookOpen size={18} className="text-blue" />
          <span>{t('home.nav.academy')}</span>
        </button>
      </div>
    </div>
  );
}
