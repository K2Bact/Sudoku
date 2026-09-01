import React, { useState } from 'react';
import { Play, BarChart3, Brain, BookOpen, ChevronRight, Zap, RefreshCw, Hourglass, Lock, X } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine';
import { loadStats, loadGameState } from '../utils/storage';
import { loadWallet } from '../utils/wallet';
import { getGhostForModeLevel } from '../utils/ghostManager';
import { iqStatsService } from '../services/iqStatsService';
import { useTranslation } from '../i18n/i18nContext';
import { soundHaptic } from '../utils/soundHaptic';
import { HomeTopHeader } from './home/HomeTopHeader';
import { HomeHeroCard } from './home/HomeHeroCard';
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
  const [rivalMode, setRivalMode] = useState('standard');
  const [lockedToast, setLockedToast] = useState(null);

  const currentSelectedMode = onSelectMode ? selectedMode : localMode;
  const setMode = (m) => {
    if (onSelectMode) onSelectMode(m);
    setLocalMode(m);
    setLockedToast(null);
  };

  const isTimeLimit = currentSelectedMode === 'timeLimit';
  const ghost = getGhostForModeLevel(isTimeLimit ? 'timeAttack' : currentSelectedMode, selectedLevel);
  const isGhostAvailable = Boolean(ghost && typeof ghost.bestSeconds === 'number' && ghost.bestSeconds > 0);
  const canSelectGhost = !isTimeLimit && isGhostAvailable;
  const effectiveRivalMode = (isTimeLimit || !canSelectGhost) ? 'standard' : rivalMode;

  const formatSecs = (s) => {
    if (!s) return '00:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const ghostTimeDisplay = (!isTimeLimit && isGhostAvailable) ? formatSecs(ghost.bestSeconds) : '--:--';

  const triggerLockedToast = () => {
    soundHaptic.playErrorSound();
    setLockedToast(t('home.rivalModes.lockedToast'));
  };
  
  const savedGame = loadGameState();
  const hasSavedGame = savedGame && savedGame.board && !savedGame.isGameOver && (savedGame.mistakes || 0) < 3;
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
          <div className="rival-mode-chip-group">
            {/* Top Row: Standard Mode (Full Width) */}
            <button type="button"
              className={`rival-chip standard-chip ${effectiveRivalMode === 'standard' ? 'active' : ''}`}
              onClick={() => {
                soundHaptic.playSelectSound();
                setRivalMode('standard');
                setLockedToast(null);
              }}
            >
              <span>{t('home.rivalModes.standard')}</span>
            </button>

            {/* Bottom Row: Ghost PB (Left) & Delta Pace (Right) */}
            <div className="rival-bottom-chips">
              <button type="button"
                className={`rival-chip ghost-chip ${effectiveRivalMode === 'ghost' ? 'active' : ''} ${!canSelectGhost ? 'disabled' : ''}`}
                onClick={() => {
                  if (!canSelectGhost) {
                    triggerLockedToast();
                    return;
                  }
                  soundHaptic.playSelectSound();
                  setRivalMode('ghost');
                }}
              >
                <span>{t('home.rivalModes.ghost')} ({ghostTimeDisplay})</span>
                {!canSelectGhost && <Lock size={10} className="lock-icon" />}
              </button>

              <button type="button"
                className={`rival-chip delta-chip ${effectiveRivalMode === 'delta' ? 'active' : ''} ${!canSelectGhost ? 'disabled' : ''}`}
                onClick={() => {
                  if (!canSelectGhost) {
                    triggerLockedToast();
                    return;
                  }
                  soundHaptic.playSelectSound();
                  setRivalMode('delta');
                }}
              >
                <span>{t('home.rivalModes.delta')}</span>
                {!canSelectGhost && <Lock size={10} className="lock-icon" />}
              </button>
            </div>
          </div>

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

        {/* Locked Rival Mode Notification Popup (Sized to Message) */}
        {lockedToast && (
          <div className="locked-mode-popup" role="alert" onClick={() => setLockedToast(null)}>
            <Lock size={12} className="locked-popup-icon" />
            <span className="locked-popup-text">{lockedToast}</span>
            <button
              type="button"
              className="locked-popup-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setLockedToast(null);
              }}
              aria-label={t('common.close')}
            >
              <X size={12} />
            </button>
          </div>
        )}

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
