import React, { useEffect } from 'react';
import { celebrate } from '../utils/celebrate';
import { Trophy, Skull, Swords, Flame, Home, Bot } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { recordDailyCompletion, getDailyMission, getTodayDateKey, loadDailyRecords } from '../utils/dailyChallenge';
import { variantOf } from '../engine/variants';
import { addHints } from '../utils/wallet';

import { ratingDeltaFor } from '../utils/battleRating';
import { ReplayEntry } from './replay/ReplayEntry';
import { isAIRoom, opponentDisplayName } from '../firebase/aiBattleSession';

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
  const isAIBattle = isAIRoom(room);
  const actualWinner = room?.winner ?? winner ?? 'opponent';
  const actualOpponentName = opponentDisplayName(room, t, opponentName);
  const actualMyProgress = room?.myProgress ?? myProgress ?? 0;
  const actualOpponentProgress = room?.opponentProgress ?? opponentProgress ?? 0;
  const actualMyMistakes = room?.myMistakes ?? 0;
  const actualOpponentMistakes = room?.opponentMistakes ?? 0;
  const winnerReason = room?.winnerReason;

  const isIWon = actualWinner === 'me';

  const getResultSubtitle = () => {
    if (isIWon) {
      // Won because they gave up (BT-3) — not because this side finished first.
      if (winnerReason === 'opponent_left') {
        return t('battleResult.victoryForfeitDesc', { opponent: actualOpponentName });
      }
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
      celebrate({ spread: 80, origin: { y: 0.5 } });
    }
    try {
      const todayKey = getTodayDateKey();
      const dailyRecords = loadDailyRecords();
      const mission = getDailyMission(todayKey);
      if (mission.type === 'play_battle' && !dailyRecords[todayKey]?.completed) {
        recordDailyCompletion(todayKey, 0, 0, variantOf(room));
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
            {/* Only a signed number, beside its label: no " MMR" unit, which every locale read
                in English (2026-10-07, as the stats rating since 09-30). Left-to-right so Arabic
                draws +12, not 12+ (gate 2-29's rule). */}
            <div className={`mmr-val-pill ${isIWon ? 'positive' : 'negative'}`} dir="ltr">
              {lastRatingChange
                ? `${lastRatingChange.delta >= 0 ? '+' : ''}${lastRatingChange.delta}`
                : `${isIWon ? '+' : ''}${ratingDeltaFor(isIWon, room?.level || 3)}`}
            </div>
          </div>
        )}

        {/* Final Progress Comparison with Space-Between Rows & Badges & Hearts */}
        {/*
          카드에 제목을 붙인다. 이 카드는 "87%" 를 라벨 없이 보여주고 있었고,
          그 숫자가 진행률인지 정답률인지 점수인지 화면이 말하지 않았다.
          각 행에 라벨을 붙이면 좁은 폭에 이름·하트·값이 겹치므로 제목 하나로 덮는다.
        */}
        <div className="final-comparison-card">
          <div className="comp-card-title">{t('battleResult.finalProgress')}</div>
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

        {!isAIBattle && <ReplayEntry room={room} />}

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
