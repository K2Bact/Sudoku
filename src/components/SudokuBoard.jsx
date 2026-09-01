import React from 'react';
import { useTranslation } from '../i18n/i18nContext';

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
  flashCell
}) {
  const { t } = useTranslation();
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
    <div className="sudoku-board-container">
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
              const isRelatedArea = (isSameRow || isSameCol || isSameBox) && !isSelected;

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
                  `}
                  onClick={() => onSelectCell(r, c)}
                >
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
