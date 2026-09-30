import React from 'react';
import { Swords, Bot, AlertCircle, ArrowLeft, Timer } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useConfirm } from './common/ConfirmProvider';
import { useTranslation } from '../i18n/i18nContext';

export function BattleHeader({
  room,
  timerSeconds = 0,
  mistakes = 0,
  level = 3,
  remainingCounts = {},
  onLeaveBattle
}) {
  const { t } = useTranslation();
  const confirm = useConfirm();

  const isAIBattle = room?.isAIBattle || room?.opponentName?.includes('AI') || room?.opponentName?.toLowerCase().includes('bot');
  const actualOpponentName = room?.opponentName || (isAIBattle ? t('home.modes.aiBattle.title') : t('battleResult.opponent'));
  const actualOpponentProgress = room?.opponentProgress ?? 0;
  const actualMyMistakes = room?.myMistakes ?? mistakes ?? 0;

  // Calculate remaining empty cells
  const currentMyEmpty = Object.values(remainingCounts || {}).reduce((acc, c) => acc + c, 0);
  const totalEmptyAtStart = room?.initialEmptyCount || currentMyEmpty || 45;
  const currentOppEmpty = Math.max(0, Math.round(totalEmptyAtStart * (1 - actualOpponentProgress / 100)));

  const myProgressPct = Math.min(100, Math.max(0, Math.round(((totalEmptyAtStart - currentMyEmpty) / totalEmptyAtStart) * 100)));
  const oppProgressPct = Math.min(100, actualOpponentProgress);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // window.confirm here drew a native dialog with hardcoded English OK/Cancel
  // buttons under a Korean question. See common/ConfirmProvider.jsx.
  const handleLeaveClick = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    soundHaptic.playSelectSound();
    if (await confirm(t('battleHeader.confirmLeave'))) {
      if (onLeaveBattle) onLeaveBattle();
    }
  };

  return (
    <div className="battle-header-card">
      {/* Row 1: Top Navigation Bar & Meta Badges (Removed Redundant Right Exit Icon) */}
      <div className="battle-top-nav-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="icon-btn back-home-btn"
            onClick={handleLeaveClick}
            title={t('common.home')}
            style={{ width: '32px', height: '32px' }}
          >
            <ArrowLeft size={16} />
          </button>
          <span className={`battle-meta-pill ${isAIBattle ? 'text-purple' : 'text-blue'}`}>
            {isAIBattle ? <Bot size={13} /> : <Swords size={13} />}
            <span>{isAIBattle ? t('battleHeader.aiTag') : 'PVP'}</span>
          </span>
        </div>

        {/* Center Meta: Level, Mistakes, Timer */}
        <div className="battle-meta-pills">
          <span className="battle-meta-pill">Lv.{room?.level || level}</span>
          <span className="battle-meta-pill mistake-pill">
            <AlertCircle size={12} />
            <span>{actualMyMistakes}/3</span>
          </span>
          <span className="battle-meta-pill">
            <Timer size={12} />
            <span>{formatTimer(timerSeconds)}</span>
          </span>
        </div>
      </div>

      {/* Row 2: Dual Countdown Remaining Cells Bar */}
      <div className="battle-countdown-row">
        {/* Left: Player (Me) */}
        <div className="player-countdown-box my-box">
          <span className="player-name-label">{t('battleResult.you')}</span>
          <span className="countdown-number-val">{currentMyEmpty} {t('battleHeader.emptyCellsLeft')}</span>
          <div className="countdown-gauge-bar">
            <div className="countdown-gauge-fill my-gauge-fill" style={{ width: `${myProgressPct}%` }} />
          </div>
        </div>

        {/* Center: VS Badge */}
        <div className="battle-vs-badge">VS</div>

        {/* Right: Opponent / AI Bot */}
        <div className="player-countdown-box opp-box">
          <span className="player-name-label">{actualOpponentName}</span>
          <span className="countdown-number-val">{currentOppEmpty} {t('battleHeader.emptyCellsLeft')}</span>
          <div className="countdown-gauge-bar">
            <div className="countdown-gauge-fill opp-gauge-fill" style={{ width: `${oppProgressPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
