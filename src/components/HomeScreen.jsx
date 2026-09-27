import React, { useState } from 'react';
import { isResumableGame } from '../utils/savedGame';
import { Play, BarChart3, Brain, BookOpen, ChevronRight, Zap, RefreshCw, Hourglass } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine';
import { loadStats, loadGameState } from '../utils/storage';
import { loadWallet } from '../utils/wallet';
import { iqStatsService } from '../services/iqStatsService';
import { useTranslation } from '../i18n/i18nContext';
import { soundHaptic } from '../utils/soundHaptic';
import { HomeTopHeader } from './home/HomeTopHeader';
import { HomeHeroCard } from './home/HomeHeroCard';
import { RivalModeChips } from './home/RivalModeChips';
import { HomeBottomBanners } from './home/HomeBottomBanners';

export function HomeScreen({
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

  
  const savedGame = loadGameState();
  const hasSavedGame = isResumableGame(savedGame);
  const isCurrentTabSaved = hasSavedGame && (savedGame.gameMode || 'classic') === currentSelectedMode;

  const stats = loadStats();
  const won = stats.gamesWon || 0;
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
          {/* Top 3-Mode Selector Tabs */}
          <div className="mode-tab-group">
            <button type="button"
              className={`mode-tab-btn ${currentSelectedMode === 'classic' ? 'active' : ''}`}
              onClick={() => {
                soundHaptic.playSelectSound();
                setMode('classic');
              }}
            >
              <Play size={13} />
              <span>{t('home.modeTabs.classic')}</span>
            </button>

            <button type="button"
              className={`mode-tab-btn time-attack-tab ${currentSelectedMode === 'timeAttack' ? 'active' : ''}`}
              onClick={() => {
                soundHaptic.playSelectSound();
                setMode('timeAttack');
              }}
            >
              <Zap size={13} />
              <span>{t('home.modeTabs.timeAttack')}</span>
            </button>

            <button type="button"
              className={`mode-tab-btn time-limit-tab ${currentSelectedMode === 'timeLimit' ? 'active' : ''}`}
              onClick={() => {
                soundHaptic.playSelectSound();
                setMode('timeLimit');
              }}
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
                  setLockedToast(null);
                }}
              >
                <span className="chip-num">Lv.{cfg.level}</span>
                <span className="chip-name">{t(`levels.${cfg.level}`)}</span>
              </button>
            ))}
          </div>

          {/* Row 3: Rival Race Mode Selector Chips (Standard on Top, Ghost & Delta on Bottom) */}
          <RivalModeChips
            selectedMode={currentSelectedMode}
            selectedLevel={selectedLevel}
            onChange={setEffectiveRivalMode}
          />

          {/* Full-Width Mobile Action Buttons */}
          <div className="action-btn-row">
            {isCurrentTabSaved && (
              <button type="button"
                className="btn-modern btn-resume"
                onClick={() => handleStart && handleStart(savedGame.level || selectedLevel, true, savedGame.gameMode || currentSelectedMode)}
              >
                <RefreshCw size={16} />
                <span>{t('common.resume')}</span>
              </button>
            )}

            {currentSelectedMode === 'classic' ? (
              <button type="button"
                className="btn-modern btn-play-new"
                onClick={() => handleStart && handleStart(selectedLevel, false, 'classic', effectiveRivalMode)}
              >
                <Play size={16} />
                <span>{t('common.newGame')}</span>
                <ChevronRight size={16} className="arrow-icon" />
              </button>
            ) : currentSelectedMode === 'timeAttack' ? (
              <button type="button"
                className="btn-modern btn-play-new"
                onClick={() => handleStart && handleStart(selectedLevel, false, 'timeAttack', effectiveRivalMode)}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <Zap size={16} />
                <span>{t('home.modes.timeAttack.startBtn')}</span>
                <ChevronRight size={16} className="arrow-icon" />
              </button>
            ) : (
              <button type="button"
                className="btn-modern btn-play-new"
                onClick={() => handleStart && handleStart(selectedLevel, false, 'timeLimit')}
                style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
              >
                <Hourglass size={16} />
                <span>{t('home.modes.timeLimit.startBtn')}</span>
                <ChevronRight size={16} className="arrow-icon" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Banner Cards: Online PvP, AI Battle & Daily Challenge */}
        <HomeBottomBanners
          onOpenBattleMatch={onOpenBattleMatch}
          onOpenAIBattle={onOpenAIBattle}
          onOpenDailyChallenge={onOpenDailyChallenge}
        />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="home-bottom-nav">
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
