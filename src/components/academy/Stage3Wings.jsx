import React from 'react';
import { Stage3XWingYWing } from './Stage3XWingYWing';
import { Stage3XYZWWing } from './Stage3XYZWWing';

export function Stage3Wings({ type, lang = 'ko' }) {
  if (type === 'x-wing' || type === 'y-wing') {
    return <Stage3XWingYWing type={type} lang={lang} />;
  }
  if (type === 'xyz-wing' || type === 'w-wing') {
    return <Stage3XYZWWing type={type} lang={lang} />;
  }
  return null;
}

export default Stage3Wings;
