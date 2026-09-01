import { useState, useEffect, useRef } from 'react';
import { DIFFICULTY_CONFIG } from '../engine/SudokuEngine';
import { soundHaptic } from '../utils/soundHaptic';

/**
 * useGameTimer.js
 * Manages game timer, 3.5s combo streaks, and floating time bonus/penalty indicators.
 */
export function useGameTimer({
  gameMode,
  level,
  isPaused,
  isGameOver,
  isVictory,
  onTimeLimitExpire
}) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [timeFloatingText, setTimeFloatingText] = useState(null);

  const lastSuccessTimeRef = useRef(0);
  const comboTimeoutRef = useRef(null);
  const floatTimeoutRef = useRef(null);

  // Main Timer Interval
  useEffect(() => {
    let interval = null;
    if (!isPaused && !isGameOver && !isVictory) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (gameMode === 'timeLimit') {
            if (prev <= 1) {
              clearInterval(interval);
              if (onTimeLimitExpire) onTimeLimitExpire();
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, isGameOver, isVictory, gameMode, onTimeLimitExpire]);

  // Combo reset timeout
  const resetComboTimer = () => {
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => {
      setComboCount(0);
    }, 3500);
  };

  // Show floating text indicator (+15s, -3s combo, etc.)
  const showFloatingIndicator = (type, text) => {
    setTimeFloatingText({ type, text });
    if (floatTimeoutRef.current) clearTimeout(floatTimeoutRef.current);
    floatTimeoutRef.current = setTimeout(() => setTimeFloatingText(null), 1500);
  };

  // Trigger combo success in Speedrun mode
  const handleComboSuccess = () => {
    const now = Date.now();
    const diff = (now - lastSuccessTimeRef.current) / 1000;
    lastSuccessTimeRef.current = now;

    if (diff <= 3.5) {
      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);
      soundHaptic.playComboSound(nextCombo);

      const bonusReduction = nextCombo >= 4 ? 2 : 1;
      setTimerSeconds(prev => Math.max(0, prev - bonusReduction));
      showFloatingIndicator('bonus', `-${bonusReduction}s (${nextCombo} COMBO!)`);
    } else {
      setComboCount(1);
    }
    resetComboTimer();
  };

  // Trigger time penalty (+10s in speedrun)
  const handleTimePenalty = (penaltySeconds = 10) => {
    setComboCount(0);
    lastSuccessTimeRef.current = 0;
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);

    setTimerSeconds(prev => prev + penaltySeconds);
    showFloatingIndicator('penalty', `+${penaltySeconds}s`);
  };

  // Add bonus time in Survival mode (+7s per correct cell, balanced)
  const addSurvivalBonusTime = (bonusSeconds = 7) => {
    setTimerSeconds(prev => prev + bonusSeconds);
    showFloatingIndicator('bonus', `+${bonusSeconds}s Bonus!`);
  };

  // Reset timer for new game
  const resetTimer = (newLevel = level, newMode = gameMode) => {
    const tailoredLimit = DIFFICULTY_CONFIG[newLevel]?.timeLimitSeconds || 480;
    setTimerSeconds(newMode === 'timeLimit' ? tailoredLimit : 0);
    setComboCount(0);
    lastSuccessTimeRef.current = 0;
    setTimeFloatingText(null);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    if (floatTimeoutRef.current) clearTimeout(floatTimeoutRef.current);
  };

  return {
    timerSeconds,
    setTimerSeconds,
    comboCount,
    setComboCount,
    timeFloatingText,
    setTimeFloatingText,
    handleComboSuccess,
    handleTimePenalty,
    addSurvivalBonusTime,
    resetTimer
  };
}
