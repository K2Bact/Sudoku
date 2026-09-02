import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, Swords, Flame, Home, Bot } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { recordDailyCompletion, getDailyMission, getTodayDateKey, loadDailyRecords } from '../utils/dailyChallenge';
import { addHints } from '../utils/wallet';

import { ratingDeltaFor } from '../utils/battleRating';

export function BattleResultModal({
  lastRatingChange,
  room,
  winner,
  opponentName,
  myProgress,
  opponentProgress,
  isRematchWaiting = false,
  rematchSecondsLeft = 15,
  isOpponentLeft = false,
  onRematch,
  onClose,
  onReturnHome
}) {
  const { t } = useTranslation();
  const isAIBattle = Boolean(room?.isAiMatch || room?.isAIBattle || room?.opponentName?.includes('AI') || room?.opponentName?.toLowerCase().includes('bot'));
  const actualWinner = room?.winner ?? winner ?? 'opponent';
  const actualOpponentName = room?.opponentName ?? opponentName ?? (isAIBattle ? t('home.modes.aiBattle.title') : t('battleResult.opponent'));
  const actualMyProgress = room?.myProgress ?? myProgress ?? 0;
  const actualOpponentProgress = room?.opponentProgress ?? opponentProgress ?? 0;
  const actualMyMistakes = room?.myMistakes ?? 0;
  const actualOpponentMistakes = room?.opponentMistakes ?? 0;
  const winnerReason = room?.winnerReason;

  const isIWon = actualWinner === 'me';

  const getResultSubtitle = () => {
    if (isIWon) {
      if (winnerReason === 'opponent_mistakes' || actualOpponentMistakes >= 3) {
        return t('battleResult.victoryMistakeDesc', { opponent: actualOpponentName });
      }
      return t('battleResult.victoryDesc', { opponent: actualOpponentName });
    }
    if (winnerReason === 'my_mistakes' || actualMyMistakes >= 3) {
      return t('battleResult.defeatMistakeDesc');
    }
    return t('battleResult.defeatDesc', { opponent: actualOpponentName });
  };

  useEffect(() => {
    if (isIWon) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }
    try {
      const todayKey = getTodayDateKey();
      const dailyRecords = loadDailyRecords();
      const mission = getDailyMission(todayKey);
      if (mission.type === 'play_battle' && !dailyRecords[todayKey]?.completed) {
        recordDailyCompletion(todayKey, 0, 0);
        addHints(1, 'daily_battle_mission');
      }
    } catch (e) {}
  }, [isIWon]);

  const handleRematchClick = () => {
    soundHaptic.playSelectSound();
    if (onRematch) onRematch();
  };

  const handleCloseClick = () => {
    soundHaptic.playSelectSound();
    if (onClose) onClose();
  };

  const handleHomeClick = () => {
    soundHaptic.playSelectSound();
    if (onReturnHome) onReturnHome();
    else if (onClose) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card battle-result-card">
        <div className={`modal-icon-header ${isIWon ? 'victory' : 'warning'}`}>
          {isIWon ? <Trophy size={50} /> : <Skull size={50} />}
        </div>

        <h2>
          {isAIBattle
            ? (isIWon ? t('battleResult.aiVictoryTitle') : t('battleResult.aiDefeatTitle'))
            : (isIWon ? t('battleResult.victoryTitle') : t('battleResult.defeatTitle'))}
        </h2>
        
        {/* Descriptive Line-Broken Subtitle with Clear Win/Loss Reason */}
        <p className="modal-subtitle">
          {getResultSubtitle()}
        </p>

        {/* MMR Rating Card (1v1 PvP) or Practice Info Banner (AI Bot Match) */}
        {isAIBattle ? (
          <div className="mmr-banner-card ai-banner-card">
            <div className="mmr-banner-header">
              <Bot size={16} className="text-purple" />
              <span className="mmr-label">{t('battleResult.aiModeLabel', { level: room?.level || 3 })}</span>
            </div>
            <div className="mmr-val-pill ai-val-pill">
              {isIWon ? t('battleResult.aiWonBadge') : t('battleResult.aiLostBadge')}
            </div>
          </div>
        ) : (
          <div className="mmr-banner-card">
            <div className="mmr-banner-header">
              <Flame size={16} className={isIWon ? 'text-yellow' : 'text-muted'} />
              <span className="mmr-label">{t('battleResult.ratingChange')}</span>
            </div>
            <div className={`mmr-val-pill ${isIWon ? 'positive' : 'negative'}`}>
              {lastRatingChange
                ? `${lastRatingChange.delta >= 0 ? '+' : ''}${lastRatingChange.delta} MMR`
                : `${isIWon ? '+' : ''}${ratingDeltaFor(isIWon, room?.level || 3)} MMR`}
            </div>
          </div>
        )}

        {/* Final Progress Comparison with Space-Between Rows & Badges & Hearts */}
        <div className="final-comparison-card">
          <div className="comp-row">
            <div className="comp-player-info">
              <span className="comp-name">{t('battleResult.you')}</span>
              <span className={`comp-hearts ${actualMyMistakes >= 3 ? 'dead' : ''}`}>
                {actualMyMistakes >= 3 ? t('battleResult.disqualified') : `❤️ ${Math.max(0, 3 - actualMyMistakes)}`}
              </span>
            </div>
            <span className="comp-badge my-comp">{actualMyProgress}%</span>
          </div>
          <div className="comp-divider" />
          <div className="comp-row">
            <div className="comp-player-info">
              <span className="comp-name">{actualOpponentName}</span>
              <span className={`comp-hearts ${actualOpponentMistakes >= 3 ? 'dead' : ''}`}>
                {actualOpponentMistakes >= 3 ? t('battleResult.disqualified') : `❤️ ${Math.max(0, 3 - actualOpponentMistakes)}`}
              </span>
            </div>
            <span className="comp-badge opp-comp">{actualOpponentProgress}%</span>
          </div>
        </div>

        <div className="modal-actions-vertical w-100 mt-2">
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseClick}>
              {isAIBattle ? t('battleResult.aiLobbyBtn') : t('battleResult.lobbyBtn')}
            </button>
            <button type="button"
              className="btn btn-primary"
              onClick={handleRematchClick}
              disabled={!isAIBattle && (isRematchWaiting || isOpponentLeft)}
              style={!isAIBattle && (isRematchWaiting || isOpponentLeft) ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
            >
              <Swords size={17} />
              <span>
                {isAIBattle
                  ? t('battleResult.aiRematchBtn')
                  : isOpponentLeft
                  ? t('battleResult.rematchOpponentLeftToast')
                  : isRematchWaiting
                  ? t('battleResult.rematchWaitingBtn', { seconds: rematchSecondsLeft })
                  : t('battleResult.rematchBtn')}
              </span>
            </button>
          </div>

          <button type="button" className="btn btn-secondary mt-1" onClick={handleHomeClick}>
            <Home size={16} />
            <span>{t('battleResult.homeBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
