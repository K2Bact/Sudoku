import React from 'react';
import { Stage1MiniGrids } from './academy/Stage1MiniGrids';
import { Stage2MiniGrids } from './academy/Stage2MiniGrids';
import { Stage3MiniGrids } from './academy/Stage3MiniGrids';
import { Stage4MiniGrids } from './academy/Stage4MiniGrids';
import { Stage5MiniGrids } from './academy/Stage5MiniGrids';

/**
 * TutorialMiniGrid
 * Clean Stage Router Component (Modular Academy Architecture)
 */
export function TutorialMiniGrid({ type, lang = 'ko' }) {
  // Stage 1 (기초 5종)
  const stage1Types = ['full-house', 'last-free-cell', 'cross-hatching', 'naked-single', 'hidden-single'];
  if (stage1Types.includes(type)) {
    return <Stage1MiniGrids type={type} lang={lang} />;
  }

  // Stage 2 (초중급 8종)
  const stage2Types = ['naked-pair', 'hidden-pair', 'pointing-pairs', 'claiming', 'naked-triple', 'hidden-triple', 'naked-quad', 'hidden-quad'];
  if (stage2Types.includes(type)) {
    return <Stage2MiniGrids type={type} lang={lang} />;
  }

  // Stage 3 (고급 6종)
  const stage3Types = ['x-wing', 'y-wing', 'xyz-wing', 'w-wing', 'bug', 'remote-pairs'];
  if (stage3Types.includes(type)) {
    return <Stage3MiniGrids type={type} lang={lang} />;
  }

  // Stage 4 (상급 8종)
  const stage4Types = ['swordfish', 'jellyfish', 'unique-rectangles', 'simple-colouring', '3d-medusa', 'xy-chains', 'wxyz-wing', 'empty-rectangles'];
  if (stage4Types.includes(type)) {
    return <Stage4MiniGrids type={type} lang={lang} />;
  }

  // Stage 5 (마스터 5종)
  const stage5Types = ['finned-xwing', 'aic', 'als', 'forcing-chains', 'exocet'];
  if (stage5Types.includes(type)) {
    return <Stage5MiniGrids type={type} lang={lang} />;
  }

  return null;
}
