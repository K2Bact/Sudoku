import React from 'react';

/**
 * Shared 3x3 Pencil-Marks Candidate Grid Renderer
 */
export function renderNoteGrid(activeCandidates = [], highlightNums = [], erasedNums = []) {
  return (
    <div className="mini-note-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const isActive = activeCandidates.includes(n);
        const isHighlight = highlightNums.includes(n);
        const isErased = erasedNums.includes(n);

        if (!isActive && !isErased) return <span key={n}></span>;

        if (isErased) {
          return (
            <span key={n} className="candidate-erased" title={`✕${n}`}>
              {n}
            </span>
          );
        }

        return (
          <span key={n} className={isHighlight ? 'candidate-highlight' : ''}>
            {n}
          </span>
        );
      })}
    </div>
  );
}
