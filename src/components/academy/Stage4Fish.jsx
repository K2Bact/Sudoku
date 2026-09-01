import React from 'react';
import { Stage4FishOnly } from './Stage4FishOnly';
import { Stage4RectColouring } from './Stage4RectColouring';

export function Stage4Fish({ type, lang = 'ko' }) {
  if (type === 'swordfish' || type === 'jellyfish') {
    return <Stage4FishOnly type={type} lang={lang} />;
  }
  return <Stage4RectColouring type={type} lang={lang} />;
}

export default Stage4Fish;
