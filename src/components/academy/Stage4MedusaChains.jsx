import React from 'react';
import { Stage4MedusaXYChains } from './Stage4MedusaXYChains';
import { Stage4WXYZEmptyRect } from './Stage4WXYZEmptyRect';

export function Stage4MedusaChains({ type, lang = 'ko' }) {
  if (type === '3d-medusa' || type === 'xy-chains') {
    return <Stage4MedusaXYChains type={type} lang={lang} />;
  }
  if (type === 'wxyz-wing' || type === 'empty-rectangles') {
    return <Stage4WXYZEmptyRect type={type} lang={lang} />;
  }
  return null;
}

export default Stage4MedusaChains;
