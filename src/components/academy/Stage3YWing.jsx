import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage3YWing({ type, lang = 'ko' }) {
  const [ywingStep, setYwingStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'y-wing') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${ywingStep === 1 ? 'active' : ''}`} onClick={() => setYwingStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${ywingStep === 2 ? 'active' : ''}`} onClick={() => setYwingStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {ywingStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 2], [1, 2])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([1, 3], [1, 3])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([2, 3], [2, 3])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([3, 7])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {ywingStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 2], [1, 2])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([1, 3], [1, 3])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([2, 3], [2, 3])}
              </div>
              <div className="mini-cell highlight-target">7</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Stage3YWing;
