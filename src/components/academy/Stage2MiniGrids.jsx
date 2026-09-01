import React from 'react';
import { Stage2Pairs } from './Stage2Pairs';
import { Stage2TriplesQuads } from './Stage2TriplesQuads';

export function Stage2MiniGrids({ type, lang = 'ko' }) {
  const pairTypes = ['naked-pair', 'hidden-pair', 'pointing-pairs', 'claiming'];
  if (pairTypes.includes(type)) {
    return <Stage2Pairs type={type} lang={lang} />;
  }
  return <Stage2TriplesQuads type={type} lang={lang} />;
}

export default Stage2MiniGrids;
