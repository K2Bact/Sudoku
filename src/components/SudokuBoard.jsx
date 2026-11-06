import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/i18nContext';
import { CageOutline } from './KillerCage';
import { cageLayout } from '../engine/killer/cageLayout';

export function SudokuBoard({
  board,
  initialBoard,
  solutionBoard,
  notes,
  selectedCell,
  activeNumber = null,
  onSelectCell,
  isPaused,
  onResume,
  conflictInfo,
  flashCell,
  cages = null,
  // The first-game walkthrough's cell and the cage or house it is about (KP-18).
  guide = null
}) {
  const { t } = useTranslation();
  // A killer's cages; null for classic, which then draws exactly as before.
  const killer = useMemo(() => (cages ? cageLayout(cages) : null), [cages]);
  const guideCell = guide ? guide.r * 9 + guide.c : -1;
  const guideArea = useMemo(() => new Set((guide?.house || guide?.cage || []).map((p) => p.r * 9 + p.c)), [guide]);
  const selectedRow = selectedCell ? selectedCell[0] : null;
  const selectedCol = selectedCell ? selectedCell[1] : null;
  const selectedValue = (selectedRow !== null && selectedCol !== null && board?.[selectedRow])
    ? board[selectedRow][selectedCol]
    : null;

  const isSelectedCellCorrect = selectedValue && selectedValue !== 0 && solutionBoard && selectedValue === solutionBoard[selectedRow]?.[selectedCol];
  const highlightNumber = activeNumber || (isSelectedCellCorrect ? selectedValue : null);

  if (isPaused) {
    return (
      <div
        className="sudoku-board-container paused"
        onClick={onResume}
        style={{ cursor: 'pointer' }}
        title={t('board.resumeTooltip')}
      >
        <div className="pause-overlay">
          <span className="pause-icon">⏸️</span>
          <p className="fw-bold">{t('board.pausedTitle')}</p>
          <span className="text-blue mt-1" style={{ fontSize: '12px', fontWeight: '800' }}>
            {t('board.tapToResume')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`sudoku-board-container ${killer ? 'killer-board' : ''}`}>
      <div className="sudoku-grid">
        {(board || []).map((rowArr, r) => (
          <div key={r} className="sudoku-row">
            {rowArr.map((value, c) => {
              const isInitial = initialBoard?.[r]?.[c] !== 0;
              const isSelected = selectedRow === r && selectedCol === c;
              
              // Highlighting helpers
              const isSameRow = selectedRow === r;
              const isSameCol = selectedCol === c;
              const isSameBox = selectedRow !== null && selectedCol !== null &&
                Math.floor(r / 3) === Math.floor(selectedRow / 3) &&
                Math.floor(c / 3) === Math.floor(selectedCol / 3);
              const cell = r * 9 + c;
              const isSameCage = Boolean(killer) && selectedRow !== null && selectedCol !== null &&
                killer.cageOf[cell] === killer.cageOf[selectedRow * 9 + selectedCol];
              const isRelatedArea = (isSameRow || isSameCol || isSameBox || isSameCage) && !isSelected;
              const cageSum = killer?.sumAt.get(cell);

              const isSameValue = highlightNumber && highlightNumber !== 0 && value === highlightNumber;
              
              // Conflict / Error check
              const isError = value !== 0 && !isInitial && solutionBoard && value !== solutionBoard[r][c];

              // Conflicting source highlighting (All existing numbers causing rule violation)
              const isConflictingSource = conflictInfo && (
                (conflictInfo.conflictingCells && conflictInfo.conflictingCells.some(([cr, cc]) => cr === r && cc === c)) ||
                (conflictInfo.conflictingCell && conflictInfo.conflictingCell[0] === r && conflictInfo.conflictingCell[1] === c)
              );

              // Target error cell causing conflict
              const isConflictTarget = conflictInfo &&
                conflictInfo.targetCell &&
                conflictInfo.targetCell[0] === r &&
                conflictInfo.targetCell[1] === c;

              // 0.4s Gold Flash on valid input / hint
              const isFlash = flashCell && flashCell[0] === r && flashCell[1] === c;

              // Cell Notes / Candidates
              const cellNotes = notes?.[r]?.[c] || [];

              return (
                <button type="button"
                  key={`${r}-${c}`}
                  className={`sudoku-cell 
                    ${isInitial ? 'given-cell' : 'user-cell'} 
                    ${isSelected ? 'selected' : ''} 
                    ${isRelatedArea ? 'related-area' : ''} 
                    ${isSameValue ? 'same-value' : ''} 
                    ${isFlash ? 'cell-gold-flash' : ''}
                    ${isError || isConflictTarget ? 'error-cell' : ''}
                    ${isConflictingSource ? 'conflicting-source-pulse' : ''}
                    ${value !== 0 && !isInitial ? 'pop-anim' : ''}
                    ${(c + 1) % 3 === 0 && c < 8 ? 'border-right-thick' : ''}
                    ${(r + 1) % 3 === 0 && r < 8 ? 'border-bottom-thick' : ''}
                    ${cageSum !== undefined ? 'has-cage-sum' : ''}
                    ${cell === guideCell ? 'guide-target' : ''}
                    ${guideArea.has(cell) && cell !== guideCell ? 'guide-area' : ''}
                  `}
                  onClick={() => onSelectCell(r, c)}
                >
                  {killer && <CageOutline cell={cell} cageOf={killer.cageOf} />}
                  {cageSum !== undefined && <span className="cage-sum">{cageSum}</span>}
                  {value !== 0 ? (
                    <span className="cell-number">{value}</span>
                  ) : cellNotes.length > 0 ? (
                    <div className="cell-notes-grid">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <span key={num} className="note-digit">
                          {cellNotes.includes(num) ? num : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
