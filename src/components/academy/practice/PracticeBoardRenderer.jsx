import React from 'react';
import { renderNoteGrid } from '../renderNoteGrid';
import { CageOutline } from '../../KillerCage';
import { cageLayout } from '../../../engine/killer/cageLayout';

export function PracticeBoardRenderer({
  mission,
  enteredVal,
  isSolved,
  isError,
  onTargetCellTap
}) {
  if (!mission) return null;

  const { layoutType, cells, targetIndex } = mission;
  // A killer lesson's board carries its cages, drawn by the game's own pieces —
  // the dashed outline and the sum in the top-left cell — so it looks like the
  // killer the player will meet. Only full 9x9 boards: the outline reads cell
  // numbers as row * 9 + column.
  const killer = mission.cages && layoutType === 'grid9x9' ? cageLayout(mission.cages) : null;
  const cageParts = (idx) => {
    if (!killer) return null;
    const sum = killer.sumAt.get(idx);
    return (
      <>
        <CageOutline cell={idx} cageOf={killer.cageOf} />
        {sum !== undefined && <span className="cage-sum">{sum}</span>}
      </>
    );
  };

  const renderCell = (cell, idx) => {
    const isTarget = idx === targetIndex;
    let cellVal = cell.val;

    let cellClass = 'mini-cell';
    if (killer && killer.sumAt.has(idx)) cellClass += ' has-cage-sum';
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
          {cageParts(idx)}
          {renderNoteGrid(
            cell.notes,
            cell.highlightNotes || (isTarget ? cell.notes : []),
            cell.eliminatedNotes || [],
            cell.noteColors || {}
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
        {cageParts(idx)}
        {killer ? <span className="mini-cell-value">{cellVal}</span> : cellVal}
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

  if (layoutType === 'grid9x9') {
    return (
      <div className={`mini-9x9-full-board${killer ? ' killer-mini' : ''}`}>
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
