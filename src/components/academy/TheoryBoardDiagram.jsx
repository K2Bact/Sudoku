import React, { useState } from 'react';
import { ALL_PRACTICE_MISSIONS } from '../../data/academy/practice/index.js';
import { PracticeBoardRenderer } from './practice/PracticeBoardRenderer.jsx';
import { useTranslation } from '../../i18n/i18nContext.jsx';

/**
 * Theory diagram drawn from the technique's first practice example.
 *
 * These techniques used to have hand-drawn one- or two-row diagrams, and 17 of 32
 * were wrong by the rules (BACKLOG A-1, 2026-09-19): cells "seeing" cells they
 * cannot see, rows holding the same pair four times, eliminations inside the
 * base rows. A drawing that small cannot hold a chain or a fish honestly.
 *
 * So the theory tab shows a real board — example 1, which gate 2-5 re-solves
 * against its unique solution, including the `eliminations` / `placements` this
 * draws in the second frame. Nothing here is a fact of its own.
 */
export const BOARD_THEORY = new Set([
  'pointing-pairs', 'x-wing', 'w-wing', 'bug', 'remote-pairs',
  'swordfish', 'jellyfish', 'unique-rectangles', 'simple-colouring', '3d-medusa', 'xy-chains', 'wxyz-wing', 'empty-rectangles',
  'finned-xwing', 'aic', 'als', 'exocet',
]);

const allNotes = (c) => [...new Set([...(c.notes || []), ...(c.eliminatedNotes || [])])].sort((a, b) => a - b);

const TARGET_STYLE = { background: 'rgba(234, 179, 8, 0.3)' };

/** Frame 1: the pattern, every candidate back in place, nothing struck. */
function patternCells(m) {
  // BUG+1 has no coloured cells — its pattern is the one cell with three
  // candidates — so the caption "the coloured cells form the pattern" would point
  // at nothing. Colour the target when the example colours nothing else.
  const uncoloured = !m.cells.some((c) => c.style);
  return m.cells.map((c, i) => {
    if (!c.notes) return c;
    const { type: _type, ...rest } = c;
    const cell = { ...rest, notes: allNotes(c), eliminatedNotes: [] };
    if (i === m.targetIndex) {
      // The target's highlight is the answer; showing it here would give it away.
      cell.highlightNotes = [];
      if (uncoloured) cell.style = TARGET_STYLE;
    }
    return cell;
  });
}

/** Frame 2: what the pattern removes (struck through) or fixes. */
function resultCells(m) {
  const elim = new Map(m.eliminations || []);
  const place = new Map(m.placements || []);
  return patternCells(m).map((c, i) => {
    if (!c.notes) return c;
    if (place.has(i)) {
      const d = place.get(i);
      return { ...c, notes: [d], eliminatedNotes: c.notes.filter((x) => x !== d), highlightNotes: [d] };
    }
    if (elim.has(i)) {
      const ds = elim.get(i);
      return { ...c, notes: c.notes.filter((x) => !ds.includes(x)), eliminatedNotes: ds };
    }
    return c;
  });
}

export function TheoryBoardDiagram({ type }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const m = ALL_PRACTICE_MISSIONS[type]?.[0];
  if (!m || m.layoutType !== 'grid9x9') return null;

  const cells = step === 1 ? patternCells(m) : resultCells(m);
  const places = (m.placements || []).length > 0;

  return (
    <div className="mini-grid-container theory-board-diagram" data-theory-board={type}>
      <div className="cross-step-tabs">
        <button type="button" className={`cross-tab-btn ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
          {t('academy.theoryBoard.patternTab')}
        </button>
        <button type="button" className={`cross-tab-btn ${step === 2 ? 'active' : ''}`} onClick={() => setStep(2)}>
          {t('academy.theoryBoard.resultTab')}
        </button>
      </div>
      <div className="cross-step-pane">
        <PracticeBoardRenderer mission={{ layoutType: 'grid9x9', cells, targetIndex: -1 }} />
        <div className="diagram-caption">
          {step === 1
            ? t('academy.theoryBoard.patternCaption')
            : t(places ? 'academy.theoryBoard.placeCaption' : 'academy.theoryBoard.resultCaption')}
        </div>
      </div>
    </div>
  );
}
