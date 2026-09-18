import React from 'react';

/**
 * Shared 3x3 Pencil-Marks Candidate Grid Renderer
 */
/**
 * `colors` maps a candidate to 'a' or 'b' — the two colours of a colouring chain.
 * Simple Colouring can colour whole cells because it follows one digit; 3D Medusa
 * colours individual candidates, often two different ones in the same cell, so the
 * colour has to live on the candidate.
 */
export function renderNoteGrid(activeCandidates = [], highlightNums = [], erasedNums = [], colors = {}) {
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
          <span
            key={n}
            className={colors[n] ? `candidate-color-${colors[n]}` : isHighlight ? 'candidate-highlight' : ''}
          >
            {n}
          </span>
        );
      })}
    </div>
  );
}
