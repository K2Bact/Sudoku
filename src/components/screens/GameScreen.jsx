import React from 'react';
import { Header } from '../Header';
import { SudokuBoard } from '../SudokuBoard';
import { Keypad } from '../Keypad';
import { BattleHeader } from '../BattleHeader';
import { GhostRivalBanner } from '../battle/GhostRivalBanner';
import { GuidedTutorialOverlay } from '../GuidedTutorialOverlay';
import { AdBanner } from '../AdBanner';
import { loadSettings } from '../../utils/storage';

export function GameScreen({
  activeBattleRoom,
  timerSeconds,
  onLeaveBattle,
  level,
  gameMode,
  mistakes,
  comboCount,
  timeFloatingText,
  isPaused,
  onTogglePause,
  onRestart,
  onOpenNewGame,
  onReturnHome,
  onOpenSettings,
  theme,
  onCycleTheme,
  soundEnabled,
  onToggleSound,
  isGuidedTutorial,
  guidedStep,
  onNextGuidedStep,
  onExitGuidedTutorial,
  board,
  initialBoard,
  solutionBoard,
  notes,
  selectedCell,
  activeNumber,
  onSelectCell,
  onResume,
  conflictInfo,
  flashCell,
  remainingCounts,
  onInputNumber,
  onErase,
  onUndo,
  canUndo,
  isNoteMode,
  onToggleNoteMode,
  isFastEntryMode,
  onToggleFastEntryMode,
  lockedNumber,
  onGetHint,
  hintsRemaining,
  onOpenRemoveAds,
  adRefreshTrigger,
  rivalMode,
  ghostRecord,
  userFilledCount,
  totalEmptyCount
}) {
  return (
    <div className="game-screen-wrapper">
      {activeBattleRoom ? (
        <BattleHeader
          room={activeBattleRoom}
          timerSeconds={timerSeconds}
          mistakes={mistakes}
          level={level}
          remainingCounts={remainingCounts}
          onLeaveBattle={onLeaveBattle}
        />
      ) : (
        <Header
          level={level}
          gameMode={gameMode}
          mistakes={mistakes}
          limitMistakes={loadSettings().limitMistakes ?? true}
          timerSeconds={timerSeconds}
          comboCount={comboCount}
          timeFloatingText={timeFloatingText}
          isPaused={isPaused}
          onTogglePause={onTogglePause}
          onRestart={onRestart}
          onOpenNewGame={onOpenNewGame}
          onReturnHome={onReturnHome}
          onOpenSettings={onOpenSettings}
          theme={theme}
          onCycleTheme={onCycleTheme}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      )}

      {isGuidedTutorial && (
        <GuidedTutorialOverlay
          step={guidedStep}
          onNextStep={onNextGuidedStep}
          onExitTutorial={onExitGuidedTutorial}
        />
      )}

      <main className="game-main">
        {rivalMode && (rivalMode === 'ghost' || rivalMode === 'delta') && ghostRecord && (
          <GhostRivalBanner
            rivalMode={rivalMode}
            userFilledCount={userFilledCount}
            totalEmptyCount={totalEmptyCount}
            timerSeconds={timerSeconds}
            ghostRecord={ghostRecord}
          />
        )}

        <SudokuBoard
          board={board}
          initialBoard={initialBoard}
          solutionBoard={solutionBoard}
          notes={notes}
          selectedCell={selectedCell}
          activeNumber={activeNumber}
          onSelectCell={onSelectCell}
          isPaused={isPaused}
          onResume={onResume}
          conflictInfo={conflictInfo}
          flashCell={flashCell}
        />

        <Keypad
          remainingCounts={remainingCounts}
          activeNumber={activeNumber}
          onInputNumber={onInputNumber}
          onErase={onErase}
          onUndo={onUndo}
          canUndo={canUndo}
          isNoteMode={isNoteMode}
          onToggleNoteMode={onToggleNoteMode}
          isFastEntryMode={isFastEntryMode}
          onToggleFastEntryMode={onToggleFastEntryMode}
          lockedNumber={lockedNumber}
          onGetHint={onGetHint}
          hintsRemaining={hintsRemaining}
          isBattle={Boolean(activeBattleRoom)}
          isSpeedrun={gameMode === 'timeAttack'}
        />
      </main>

      <AdBanner onOpenRemoveAds={onOpenRemoveAds} refreshTrigger={adRefreshTrigger} />
    </div>
  );
}
