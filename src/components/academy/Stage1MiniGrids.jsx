import React from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage1MiniGrids({ type, lang = 'ko' }) {
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'full-house') {
    return (
      <div className="mini-grid-container">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="mini-row-grid">
          <div className="mini-cell">1</div>
          <div className="mini-cell">2</div>
          <div className="mini-cell">3</div>
          <div className="mini-cell">4</div>
          <div className="mini-cell">5</div>
          <div className="mini-cell">6</div>
          <div className="mini-cell">7</div>
          <div className="mini-cell">8</div>
          <div className="mini-cell highlight-target">9</div>
        </div>
        <div className="diagram-caption">{dt('caption')}</div>
      </div>
    );
  }

  if (type === 'last-free-cell') {
    return (
      <div className="mini-grid-container">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="mini-3x3-real-board">
          <div className="mini-cell">1</div>
          <div className="mini-cell">2</div>
          <div className="mini-cell">3</div>
          <div className="mini-cell">4</div>
          <div className="mini-cell">5</div>
          <div className="mini-cell">6</div>
          <div className="mini-cell">7</div>
          <div className="mini-cell">8</div>
          <div className="mini-cell highlight-target">9</div>
        </div>
        <div className="diagram-caption">{dt('caption')}</div>
      </div>
    );
  }

  if (type === 'cross-hatching') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="mini-3x3-real-board">
          <div className="mini-cell cross-blocked">✕</div>
          <div className="mini-cell cross-blocked">✕</div>
          <div className="mini-cell cross-blocked">✕</div>
          <div className="mini-cell">1</div>
          <div className="mini-cell cross-blocked">✕</div>
          <div className="mini-cell highlight-target">5</div>
          <div className="mini-cell">2</div>
          <div className="mini-cell">3</div>
          <div className="mini-cell cross-blocked">✕</div>
        </div>
        <div className="diagram-caption">{dt('caption')}</div>
      </div>
    );
  }

  if (type === 'naked-single') {
    return (
      <div className="mini-grid-container">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="mini-3x3-real-board">
          <div className="mini-cell">1</div>
          <div className="mini-cell">2</div>
          <div className="mini-cell">4</div>
          <div className="mini-cell">5</div>
          <div className="mini-cell highlight-target">3</div>
          <div className="mini-cell">6</div>
          <div className="mini-cell">7</div>
          <div className="mini-cell">8</div>
          <div className="mini-cell">9</div>
        </div>
        <div className="diagram-caption">{dt('caption')}</div>
      </div>
    );
  }

  if (type === 'hidden-single') {
    return (
      <div className="mini-grid-container">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="mini-3x3-real-board">
          <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 9])}</div>
          <div className="mini-cell">1</div>
          <div className="mini-cell">3</div>
          <div className="mini-cell">4</div>
          <div className="mini-cell note-grid-cell highlight-target">{renderNoteGrid([2, 7, 9], [7])}</div>
          <div className="mini-cell">5</div>
          <div className="mini-cell">6</div>
          <div className="mini-cell">8</div>
          <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 9])}</div>
        </div>
        <div className="diagram-caption">{dt('caption')}</div>
      </div>
    );
  }

  return null;
}

export default Stage1MiniGrids;
