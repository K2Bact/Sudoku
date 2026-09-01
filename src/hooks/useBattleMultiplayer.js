import { useState, useEffect, useRef } from 'react';
import { battleService } from '../firebase/battleService';
import { soundHaptic } from '../utils/soundHaptic';

export function useBattleMultiplayer({ showToast, startNewGame, setActiveScreen, t }) {
  const [activeBattleRoom, setActiveBattleRoom] = useState(null);
  const [showBattleResultModal, setShowBattleResultModal] = useState(false);
  const [incomingRematchRequest, setIncomingRematchRequest] = useState(null);
  const [isRematchWaiting, setIsRematchWaiting] = useState(false);
  const [rematchSecondsLeft, setRematchSecondsLeft] = useState(15);
  const [isOpponentLeft, setIsOpponentLeft] = useState(false);
  const [isMatchSearching, setIsMatchSearching] = useState(false);
  const rematchTimerRef = useRef(null);

  useEffect(() => {
    // 1. Subscribe to Room State Updates
    const unsubRoom = battleService.subscribeRoom((room) => {
      setActiveBattleRoom(room ? { ...room } : null);

      if (room && (room.status === 'completed' || room.status === 'finished')) {
        setShowBattleResultModal(true);
      }

      if (room && room.rematchStatus === 'accepted') {
        setShowBattleResultModal(false);
        setIncomingRematchRequest(null);
        setIsRematchWaiting(false);
        setIsOpponentLeft(false);
        if (rematchTimerRef.current) clearInterval(rematchTimerRef.current);
        showToast(t('battleResult.rematchAcceptedToast'), 2500);
        startNewGame(room.level || 3, 'battle', { board: room.puzzle, solution: room.solution });
      } else if (room && room.rematchStatus === 'declined') {
        setIsRematchWaiting(false);
        if (rematchTimerRef.current) clearInterval(rematchTimerRef.current);
        showToast(t('battleResult.rematchRejectedToast'), 2500);
      }
    });

    // 2. Subscribe to Incoming Rematch Requests (Top Notification Toast)
    const unsubRematch = battleService.subscribeRematch((data) => {
      setIncomingRematchRequest(data);
    });

    // 3. Subscribe to Opponent Left Event
    const unsubOpponentLeft = battleService.subscribeOpponentLeft(() => {
      setIsOpponentLeft(true);
      setIsRematchWaiting(false);
      if (rematchTimerRef.current) clearInterval(rematchTimerRef.current);
      showToast(t('battleResult.rematchOpponentLeftToast'), 2500);
    });

    return () => {
      unsubRoom();
      unsubRematch();
      unsubOpponentLeft();
      if (rematchTimerRef.current) clearInterval(rematchTimerRef.current);
    };
  }, [showToast, startNewGame, t]);

  const handleStartQuickMatch = (lvl, onComplete) => {
    setIsOpponentLeft(false);
    setIsRematchWaiting(false);
    setIncomingRematchRequest(null);
    setIsMatchSearching(true);
    battleService.startQuickMatch(lvl, (room) => {
      setIsMatchSearching(false);
      if (onComplete) onComplete();
      setActiveBattleRoom({ ...room });
      startNewGame(lvl, 'battle', { board: room.puzzle, solution: room.solution });
      setActiveScreen('game');
    });
  };

  const handleCancelQuickMatch = () => {
    soundHaptic.playSelectSound();
    setIsMatchSearching(false);
    try {
      battleService.leaveRoom();
    } catch (_) {}
  };

  const handleRequestRematch = () => {
    const isAIBattle = Boolean(activeBattleRoom?.isAiMatch || activeBattleRoom?.isAIBattle || activeBattleRoom?.opponentName?.includes('AI') || activeBattleRoom?.opponentName?.toLowerCase().includes('bot'));
    if (isAIBattle) {
      soundHaptic.playCompleteChime();
      setShowBattleResultModal(false);
      const lvl = activeBattleRoom?.level || 3;
      battleService.startAIBattle(lvl, (newRoom) => {
        setActiveBattleRoom({ ...newRoom });
        startNewGame(lvl, 'aiBattle', { board: newRoom.puzzle, solution: newRoom.solution });
      });
      return;
    }

    if (isOpponentLeft) {
      showToast(t('battleResult.rematchOpponentLeftToast'), 2500);
      return;
    }
    soundHaptic.playSelectSound();
    setIsRematchWaiting(true);
    setRematchSecondsLeft(15);

    if (rematchTimerRef.current) clearInterval(rematchTimerRef.current);
    rematchTimerRef.current = setInterval(() => {
      setRematchSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(rematchTimerRef.current);
          setIsRematchWaiting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    battleService.requestRematch();
  };

  const handleAcceptRematch = () => {
    soundHaptic.playSelectSound();
    setIncomingRematchRequest(null);
    battleService.acceptRematch();
  };

  const handleDeclineRematch = () => {
    soundHaptic.playSelectSound();
    setIncomingRematchRequest(null);
    battleService.declineRematch();
  };

  const cleanupBattleSession = () => {
    if (rematchTimerRef.current) clearInterval(rematchTimerRef.current);
    setIsRematchWaiting(false);
    setIsMatchSearching(false);
    setIncomingRematchRequest(null);
    setIsOpponentLeft(false);
    try {
      battleService.leaveRoom();
    } catch (_) {}
    setActiveBattleRoom(null);
    setShowBattleResultModal(false);
  };

  const handleCloseBattleResult = () => {
    const isAIBattle = Boolean(activeBattleRoom?.isAiMatch || activeBattleRoom?.isAIBattle || activeBattleRoom?.opponentName?.includes('AI') || activeBattleRoom?.opponentName?.toLowerCase().includes('bot'));
    cleanupBattleSession();
    setActiveScreen(isAIBattle ? 'aiBattle' : 'battleLobby');
  };

  return {
    activeBattleRoom,
    setActiveBattleRoom,
    showBattleResultModal,
    setShowBattleResultModal,
    incomingRematchRequest,
    isRematchWaiting,
    rematchSecondsLeft,
    isOpponentLeft,
    isMatchSearching,
    handleStartQuickMatch,
    handleCancelQuickMatch,
    handleRequestRematch,
    handleAcceptRematch,
    handleDeclineRematch,
    cleanupBattleSession,
    handleCloseBattleResult
  };
}
