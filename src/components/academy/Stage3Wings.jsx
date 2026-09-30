import React from 'react';
import { Stage3YWing } from './Stage3YWing';
import { Stage3XYZWing } from './Stage3XYZWing';

export function Stage3Wings({ type, lang = 'ko' }) {
  if (type === 'y-wing') {
    return <Stage3YWing type={type} lang={lang} />;
  }
  if (type === 'xyz-wing') {
    return <Stage3XYZWing type={type} lang={lang} />;
  }
  return null;
}

export default Stage3Wings;
