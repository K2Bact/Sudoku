import React from 'react';
import { Stage2NakedHiddenPairs } from './Stage2NakedHiddenPairs';
import { Stage2Claiming } from './Stage2Claiming';

export function Stage2Pairs({ type, lang = 'ko' }) {
  if (type === 'naked-pair' || type === 'hidden-pair') {
    return <Stage2NakedHiddenPairs type={type} lang={lang} />;
  }
  if (type === 'claiming') {
    return <Stage2Claiming type={type} lang={lang} />;
  }
  return null;
}

export default Stage2Pairs;
