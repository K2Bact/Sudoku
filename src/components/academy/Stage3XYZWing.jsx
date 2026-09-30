import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage3XYZWing({ type, lang = 'ko' }) {
  const [xyzwingStep, setXyzwingStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'xyz-wing') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${xyzwingStep === 1 ? 'active' : ''}`} onClick={() => setXyzwingStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${xyzwingStep === 2 ? 'active' : ''}`} onClick={() => setXyzwingStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {xyzwingStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 2, 5], [1, 2, 5])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([1, 5], [1, 5])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([2, 5], [2, 5])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([5, 8])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {xyzwingStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 2, 5], [1, 2, 5])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([1, 5], [1, 5])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([2, 5], [2, 5])}
              </div>
              <div className="mini-cell highlight-target">8</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Stage3XYZWing;
