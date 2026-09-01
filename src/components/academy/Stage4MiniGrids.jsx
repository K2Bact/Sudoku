import React from 'react';
import { Stage4Fish } from './Stage4Fish';
import { Stage4MedusaChains } from './Stage4MedusaChains';

export function Stage4MiniGrids({ type, lang = 'ko' }) {
  const fishTypes = ['swordfish', 'jellyfish', 'unique-rectangles', 'simple-colouring'];
  if (fishTypes.includes(type)) {
    return <Stage4Fish type={type} lang={lang} />;
  }
  return <Stage4MedusaChains type={type} lang={lang} />;
}

export default Stage4MiniGrids;
