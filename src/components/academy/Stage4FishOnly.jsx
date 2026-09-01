import React from 'react';
import { Stage4Swordfish } from './Stage4Swordfish';
import { Stage4Jellyfish } from './Stage4Jellyfish';

export function Stage4FishOnly({ type, lang = 'ko' }) {
  if (type === 'swordfish') {
    return <Stage4Swordfish lang={lang} />;
  }
  if (type === 'jellyfish') {
    return <Stage4Jellyfish lang={lang} />;
  }
  return null;
}

export default Stage4FishOnly;
