import React from 'react';
import { Stage5ForcingChains } from './Stage5ForcingChains';

// Forcing Chains is the one stage-5 technique still drawn by hand; the other four
// draw a verified 9x9 board (TheoryBoardDiagram, BACKLOG A-1).
export function Stage5MiniGrids({ type, lang = 'ko' }) {
  if (type === 'forcing-chains') return <Stage5ForcingChains type={type} lang={lang} />;
  return null;
}

export default Stage5MiniGrids;
