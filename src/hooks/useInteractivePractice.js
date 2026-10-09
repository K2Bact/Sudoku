import { useState, useMemo } from 'react';
import { soundHaptic } from '../utils/soundHaptic.js';
import { getPracticeMissions } from '../data/academy/practice/index.js';
import { markPracticeSolved } from '../utils/academyProgress.js';
import { checkAndUnlockAchievements } from '../utils/achievementManager.js';

export function useInteractivePractice(strategyId) {
  const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'ex1' | 'ex2'
  const [enteredVal, setEnteredVal] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [isError, setIsError] = useState(false);

  const missions = useMemo(() => getPracticeMissions(strategyId), [strategyId]);
  const ex1 = missions[0] || null;
  const ex2 = missions[1] || null;

  const currentMission = activeTab === 'ex1' ? ex1 : activeTab === 'ex2' ? ex2 : null;

  const handleTabChange = (tabKey) => {
    try {
      soundHaptic.playSelectSound();
    } catch (_) {}
    setActiveTab(tabKey);
    setEnteredVal(null);
    setIsSolved(false);
    setIsError(false);
  };

  const handleInputNumber = (num) => {
    if (!currentMission || isSolved) return;

    setEnteredVal(num);

    if (num === currentMission.correctVal) {
      try {
        soundHaptic.playVictorySound();
      } catch (_) {}
      setIsSolved(true);
      setIsError(false);
      // The academy achievements (D11). A technique counts once.
      if (markPracticeSolved(strategyId)) checkAndUnlockAchievements();
    } else {
      try {
        soundHaptic.playErrorSound();
      } catch (_) {}
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
        setEnteredVal(null);
      }, 700);
    }
  };

  const handleReset = () => {
    try {
      soundHaptic.playEraseSound();
    } catch (_) {}
    setEnteredVal(null);
    setIsSolved(false);
    setIsError(false);
  };

  return {
    activeTab,
    handleTabChange,
    currentMission,
    ex1,
    ex2,
    enteredVal,
    isSolved,
    isError,
    handleInputNumber,
    handleReset
  };
}
