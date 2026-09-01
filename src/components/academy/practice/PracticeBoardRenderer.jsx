import React from 'react';
import { renderNoteGrid } from '../renderNoteGrid';

export function PracticeBoardRenderer({
  mission,
  enteredVal,
  isSolved,
  isError,
  onTargetCellTap
}) {
  if (!mission) return null;

  const { layoutType, cells, targetIndex } = mission;

  const renderCell = (cell, idx) => {
    const isTarget = idx === targetIndex;
    let cellVal = cell.val;

    let cellClass = 'mini-cell';
    if (cell.type === 'cause') cellClass += ' cause-cell';
    if (cell.type === 'blocked') cellClass += ' disabled-cell';
    if (cell.type === 'pivot') cellClass += ' pivot-cell';
    if (cell.type === 'pincer') cellClass += ' pincer-cell';

    if (isTarget) {
      if (isSolved) {
        cellVal = enteredVal;
        cellClass += ' target-solved';
      } else if (isError) {
        cellVal = enteredVal;
        cellClass += ' target-error shake-error';
      } else {
        cellClass += ' target-interactive';
        if (!cell.notes) cellVal = '?';
      }
    }

    // Render 3x3 Candidate Notes if cell contains notes array
    if (cell.notes && (!isTarget || (!isSolved && !isError))) {
      cellClass += ' note-grid-cell';
      return (
        <div
          key={idx}
          className={cellClass}
          onClick={isTarget && !isSolved && onTargetCellTap ? onTargetCellTap : undefined}
          style={cell.style || undefined}
        >
          {renderNoteGrid(
            cell.notes,
            cell.highlightNotes || (isTarget ? cell.notes : []),
            cell.eliminatedNotes || []
          )}
        </div>
      );
    }

    return (
      <div
        key={idx}
        className={cellClass}
        onClick={isTarget && !isSolved && onTargetCellTap ? onTargetCellTap : undefined}
        style={cell.style || undefined}
      >
        {cellVal}
      </div>
    );
  };

  if (layoutType === 'row') {
    return (
      <div className={`mini-row-grid ${cells.length <= 4 ? 'flex-4' : cells.length <= 3 ? 'flex-3' : ''}`}>
        {cells.map((cell, idx) => renderCell(cell, idx))}
      </div>
    );
  }

  if (layoutType === 'grid4x4') {
    return (
      <div className="mini-4x4-xwing-board">
        {cells.map((cell, idx) => renderCell(cell, idx))}
      </div>
    );
  }

  if (layoutType === 'grid6x6') {
    return (
      <div className="mini-6x6-compact-board">
        {cells.map((cell, idx) => renderCell(cell, idx))}
      </div>
    );
  }

  if (layoutType === 'twoBoxes') {
    return (
      <div className="mini-3x6-column-board">
        {cells.map((cell, idx) => renderCell(cell, idx))}
      </div>
    );
  }

  if (layoutType === 'twoBoxesRow' || layoutType === 'grid6x3') {
    return (
      <div className="mini-6x3-horizontal-board">
        {cells.map((cell, idx) => renderCell(cell, idx))}
      </div>
    );
  }

  // Default: box3x3
  return (
    <div className="mini-3x3-real-board">
      {cells.map((cell, idx) => renderCell(cell, idx))}
    </div>
  );
}
