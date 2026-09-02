import { useState, useEffect, useRef } from 'react';
import { battleService } from '../firebase/battleService';
import { soundHaptic } from '../utils/soundHaptic';
import { applyBattleResult } from '../utils/battleRating';

export function useBattleMultiplayer({ showToast, startNewGame, setActiveScreen, t }) {
  const [activeBattleRoom, setActiveBattleRoom] = useState(null);
  const [showBattleResultModal, setShowBattleResultModal] = useState(false);
  const [incomingRematchRequest, setIncomingRematchRequest] = useState(null);
  const [isRematchWaiting, setIsRematchWaiting] = useState(false);
  const [rematchSecondsLeft, setRematchSecondsLeft] = useState(15);
  const [isOpponentLeft, setIsOpponentLeft] = useState(false);
  const [isMatchSearching, setIsMatchSearching] = useState(false);
  const rematchTimerRef = useRef(null);
  // Rating is applied once per finished match; the room subscription fires
  // repeatedly while the result screen is up.
  const ratedMatchRef = useRef(null);
  // Same hazard, and it bit harder: rematchStatus is a state that STAYS
  // 'accepted', while this subscription runs on every notifyListeners(). Acting
  // on the value instead of the transition re-ran startNewGame on every update.
  const handledRematchRef = useRef('idle');
  const searchTimeoutRef = useRef(null);
  const [matchTimedOut, setMatchTimedOut] = useState(false);
  const [lastRatingChange, setLastRatingChange] = useState(null);

  useEffect(() => {
    // 1. Subscribe to Room State Updates
    const unsubRoom = battleService.subscribeRoom((room) => {
      setActiveBattleRoom(room ? { ...room } : null);

      if (room && (room.status === 'completed' || room.status === 'finished')) {
        setShowBattleResultModal(true);
        // Record the rating once. This subscription fires repeatedly while the
        // result screen is open, and the room code identifies the match.
        if (room.winner && ratedMatchRef.current !== room.code) {
          ratedMatchRef.current = room.code;
          setLastRatingChange(applyBattleResult(room.winner === 'me', room.level || 3));
        }
      }

      // Act on the CHANGE, not on the value. rematchStatus stays 'accepted'
      // for the rest of the match, so running this branch whenever the value
      // happens to be 'accepted' called startNewGame on every notifyListeners()
      // — including the one sendProgress fires on each entry. The fresh board
      // landed in the same React commit as the digit, so every input on a
      // rematch board was silently discarded and the match was unplayable.
      const rematchStatus = (room && room.rematchStatus) || 'idle';
      // status alone is not enough: accepting two rematches in a row sets
      // 'accepted' both times, which would look like no change at all.
      const rematchKey = `${rematchStatus}:${(room && room.rematchSeq) || 0}`;
      if (rematchKey !== handledRematchRef.current) {
        handledRematchRef.current = rematchKey;

        if (rematchStatus === 'accepted') {
          setShowBattleResultModal(false);
          setIncomingRematchRequest(null);
          setIsRematchWaiting(false);
          setIsOpponentLeft(false);
          ratedMatchRef.current = null;
          setLastRatingChange(null);
          if (rematchTimerRef.current) clearInterval(rematchTimerRef.current);
          showToast(t('battleResult.rematchAcceptedToast'), 2500);
          startNewGame(room.level || 3, 'battle', { board: room.puzzle, solution: room.solution });
        } else if (rematchStatus === 'declined') {
          setIsRematchWaiting(false);
          if (rematchTimerRef.current) clearInterval(rematchTimerRef.current);
          showToast(t('battleResult.rematchRejectedToast'), 2500);
        }
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

  // How long to look before admitting nobody is coming. The search used to run
  // forever: on the local transport no peer can ever appear, so the player sat on
  // "searching for an opponent" until they backed out.
  const SEARCH_TIMEOUT_MS = 12000;

  const startAIFallback = (lvl) => {
    setMatchTimedOut(false);
    setIsMatchSearching(false);
    battleService.leaveRoom();
    battleService.startAIBattle(lvl, (room) => {
      setActiveBattleRoom({ ...room });
      startNewGame(lvl, 'aiBattle', { board: room.puzzle, solution: room.solution });
      setActiveScreen('game');
    });
  };

  const handleStartQuickMatch = (lvl, onComplete) => {
    setIsOpponentLeft(false);
    setIsRematchWaiting(false);
    setIncomingRematchRequest(null);
    setMatchTimedOut(false);

    // The transport contract says to branch on this rather than assume (see
    // firebase/transport/index.js). A build without Firebase config falls back
    // to the same-device transport, where no opponent can ever arrive — so the
    // radar would spin for twelve seconds against nobody and then say it found
    // no one, which is true but arrived the slow way. Say it immediately, and
    // offer the AI match the timeout path already offers.
    if (!battleService.canMatchRealPlayers) {
      setIsMatchSearching(false);
      setMatchTimedOut(true);
      if (onComplete) onComplete();
      return;
    }

    setIsMatchSearching(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setIsMatchSearching(false);
      setMatchTimedOut(true);
      battleService.leaveRoom();
    }, SEARCH_TIMEOUT_MS);

    battleService.startQuickMatch(lvl, (room) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      setIsMatchSearching(false);
      setMatchTimedOut(false);
      if (onComplete) onComplete();
      setActiveBattleRoom({ ...room });
      startNewGame(lvl, 'battle', { board: room.puzzle, solution: room.solution });
      setActiveScreen('game');
    });
  };

  const handleCancelQuickMatch = () => {
    soundHaptic.playSelectSound();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setMatchTimedOut(false);
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
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setMatchTimedOut(false);
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
    lastRatingChange,
    matchTimedOut,
    startAIFallback,
    handleStartQuickMatch,
    handleCancelQuickMatch,
    handleRequestRematch,
    handleAcceptRematch,
    handleDeclineRematch,
    cleanupBattleSession,
    handleCloseBattleResult
  };
}
