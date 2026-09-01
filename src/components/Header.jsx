import React from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Palette, Volume2, VolumeX, Settings, Zap } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';

export function Header({
  level,
  gameMode = 'classic',
  timerSeconds,
  comboCount = 0,
  timeFloatingText,
  isPaused,
  onTogglePause,
  mistakes,
  maxMistakes = 3,
  limitMistakes = true,
  onRestart,
  onOpenNewGame,
  onReturnHome,
  onOpenSettings,
  onCycleTheme,
  soundEnabled,
  onToggleSound
}) {
  const { t } = useTranslation();

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleHomeClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    soundHaptic.playSelectSound();
    if (window.confirm(t('common.confirmLeaveGame'))) {
      if (onReturnHome) {
        onReturnHome();
      }
    }
  };

  const handleRestartConfirm = () => {
    if (window.confirm(t('common.restart') + '?')) {
      if (onRestart) onRestart();
    }
  };

  const isDangerTime = gameMode === 'timeLimit' && timerSeconds < 60 && !isPaused;

  return (
    <header className="game-header">
      <div className="header-top">
        <div className="logo-group">
          {onReturnHome && (
            <button
              type="button"
              className="icon-btn back-home-btn"
              onClick={handleHomeClick}
              title={t('common.home')}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="app-title">{t('home.title')}</h1>
          <span className="version-tag">
            {t(`home.modes.${gameMode}.badge`) || t('home.badge')}
          </span>
        </div>

        <div className="header-actions">
          {/* In-Game Settings Button (Contains Sound, Haptics, Theme & Rules) */}
          {onOpenSettings && (
            <button
              type="button"
              className="icon-btn settings-btn"
              onClick={onOpenSettings}
              title={t('home.nav.settings')}
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 2-Row Header Status & Action Controls */}
      <div className="header-status-container">
        {/* Row 1: 3 Meta Badges (Level, Mistakes, Timer) */}
        <div className="status-badges-row">
          {/* Fixed Difficulty Level Badge */}
          <div className="current-level-badge">
            <span className="lvl-tag">
              {gameMode === 'timeAttack' ? '⚡ ' : gameMode === 'timeLimit' ? '⏳ ' : ''}
              {t('header.levelPrefix', { level })}
            </span>
            <span className="lvl-name">{t(`levels.${level}`)}</span>
          </div>

          {/* Mistakes / Combo Counter */}
          <div className="mistakes-badge">
            {gameMode === 'timeAttack' ? (
              comboCount >= 2 ? (
                <span className="count" style={{ fontSize: '11px', whiteSpace: 'nowrap', color: '#f59e0b', fontWeight: '900' }}>
                  {t('header.combo', { count: comboCount })}
                </span>
              ) : (
                <span className={`count ${mistakes > 0 ? 'has-mistake' : ''}`} style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {t('header.timeAttackMistake', { count: mistakes })}
                </span>
              )
            ) : (
              <span className={`count ${mistakes > 0 ? 'has-mistake' : ''}`} style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                {limitMistakes
                  ? t('header.mistakes', { count: mistakes, max: maxMistakes })
                  : t('header.mistakesUnlimited', { count: mistakes })}
              </span>
            )}
          </div>

          {/* Timer Badge with Floating Bonus/Penalty/Combo and Danger Pulse */}
          <div className={`timer-badge ${isDangerTime ? 'danger-pulse' : ''}`}>
            {timeFloatingText && (
              <div className={`time-floating-indicator ${timeFloatingText.type}`}>
                {timeFloatingText.text}
              </div>
            )}
            <span className="time-display">{formatTime(timerSeconds)}</span>
            <button
              type="button"
              className="pause-btn"
              onClick={onTogglePause}
              title={isPaused ? t('common.resume') : t('common.pause')}
            >
              {isPaused ? <Play size={13} /> : <Pause size={13} />}
            </button>
          </div>
        </div>

        {/* Row 2: 2 Action Buttons (Restart, New Game) */}
        <div className="status-actions-row">
          {/* 1. Restart Current Game Button */}
          <button
            type="button"
            className="restart-btn"
            onClick={handleRestartConfirm}
            title={t('common.restart')}
          >
            <RotateCcw size={13} />
            <span>{t('header.restartShort')}</span>
          </button>

          {/* 2. New Game Level Select Modal Button */}
          <button
            type="button"
            className="new-game-btn"
            onClick={onOpenNewGame}
            title={t('common.newGame')}
          >
            <Zap size={13} />
            <span>{t('header.newGameShort')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
