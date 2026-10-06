import React from 'react';
import { Header } from '../Header';
import { SudokuBoard } from '../SudokuBoard';
import { Keypad } from '../Keypad';
import { BattleHeader } from '../BattleHeader';
import { GhostRivalBanner } from '../battle/GhostRivalBanner';
import { GuidedTutorialOverlay } from '../GuidedTutorialOverlay';
import { AdBanner } from '../AdBanner';
import { loadSettings } from '../../utils/storage';
import { useBoardFit } from '../../hooks/useBoardFit';

export function GameScreen({
  activeBattleRoom,
  timerSeconds,
  onLeaveBattle,
  level,
  gameMode,
  variant,
  cages,
  mistakes,
  comboCount,
  timeFloatingText,
  isPaused,
  isFinished,
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
  const boardFitRef = useBoardFit();
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
          variant={variant}
          mistakes={mistakes}
          limitMistakes={loadSettings().limitMistakes ?? true}
          timerSeconds={timerSeconds}
          comboCount={comboCount}
          timeFloatingText={timeFloatingText}
          isPaused={isPaused}
          isFinished={isFinished}
          onTogglePause={onTogglePause}
          onRestart={onRestart}
          onOpenNewGame={onOpenNewGame}
          onReturnHome={onReturnHome}
          onOpenSettings={onOpenSettings}
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

      <main className="game-main" ref={boardFitRef}>
        {rivalMode && (rivalMode === 'ghost' || rivalMode === 'delta') && ghostRecord && (
          <GhostRivalBanner
            rivalMode={rivalMode}
            userFilledCount={userFilledCount}
            totalEmptyCount={totalEmptyCount}
            timerSeconds={timerSeconds}
            ghostRecord={ghostRecord}
          />
        )}

        {/* The board takes whatever height the header and keypad leave. Without
            this zone it was a full-width square, and on a short screen or a large
            system font the keypad was pushed under the ad (BACKLOG U-1). */}
        <div className="board-zone">
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
          cages={cages}
        />
        </div>

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

      <AdBanner onOpenRemoveAdsModal={onOpenRemoveAds} refreshTrigger={adRefreshTrigger} />
    </div>
  );
}
