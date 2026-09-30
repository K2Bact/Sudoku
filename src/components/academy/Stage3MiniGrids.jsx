import React from 'react';
import { Stage3Wings } from './Stage3Wings';

// Only Y-Wing and XYZ-Wing are still drawn by hand; the other four stage-3
// techniques draw a verified 9x9 board (TheoryBoardDiagram, BACKLOG A-1).
export function Stage3MiniGrids({ type, lang = 'ko' }) {
  return <Stage3Wings type={type} lang={lang} />;
}

export default Stage3MiniGrids;
