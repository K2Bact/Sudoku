import React from 'react';
import { Stage1MiniGrids } from './academy/Stage1MiniGrids';
import { Stage2MiniGrids } from './academy/Stage2MiniGrids';
import { Stage3MiniGrids } from './academy/Stage3MiniGrids';
import { Stage5MiniGrids } from './academy/Stage5MiniGrids';
import { TheoryBoardDiagram, BOARD_THEORY } from './academy/TheoryBoardDiagram';

/**
 * TutorialMiniGrid
 * Clean Stage Router Component (Modular Academy Architecture)
 */
export function TutorialMiniGrid({ type, lang = 'ko' }) {
  // Techniques whose hand-drawn diagram was wrong draw a verified 9x9 board instead
  // (BACKLOG A-1). Checked first so the old drawings below are never reached for them.
  if (BOARD_THEORY.has(type)) {
    return <TheoryBoardDiagram type={type} />;
  }

  // Stage 1 (기초 5종)
  const stage1Types = ['full-house', 'last-free-cell', 'cross-hatching', 'naked-single', 'hidden-single'];
  if (stage1Types.includes(type)) {
    return <Stage1MiniGrids type={type} lang={lang} />;
  }

  // Stage 2 — drawn by hand: 7 of 8 (Pointing draws a board)
  const stage2Types = ['naked-pair', 'hidden-pair', 'claiming', 'naked-triple', 'hidden-triple', 'naked-quad', 'hidden-quad'];
  if (stage2Types.includes(type)) {
    return <Stage2MiniGrids type={type} lang={lang} />;
  }

  // Stage 3 — drawn by hand: Y-Wing and XYZ-Wing
  const stage3Types = ['y-wing', 'xyz-wing'];
  if (stage3Types.includes(type)) {
    return <Stage3MiniGrids type={type} lang={lang} />;
  }

  // Stage 4: all eight draw a verified 9x9 board — see BOARD_THEORY above.

  // Stage 5 — drawn by hand: Forcing Chains
  const stage5Types = ['forcing-chains'];
  if (stage5Types.includes(type)) {
    return <Stage5MiniGrids type={type} lang={lang} />;
  }

  return null;
}
