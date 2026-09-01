import React from 'react';
import { Stage3Wings } from './Stage3Wings';
import { Stage3Chains } from './Stage3Chains';

export function Stage3MiniGrids({ type, lang = 'ko' }) {
  const wingTypes = ['x-wing', 'y-wing', 'xyz-wing', 'w-wing'];
  if (wingTypes.includes(type)) {
    return <Stage3Wings type={type} lang={lang} />;
  }
  return <Stage3Chains type={type} lang={lang} />;
}

export default Stage3MiniGrids;
