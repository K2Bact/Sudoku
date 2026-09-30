import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage5ForcingChains({ type, lang = 'ko' }) {
  const [forcingStep, setForcingStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'forcing-chains') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${forcingStep === 1 ? 'active' : ''}`} onClick={() => setForcingStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${forcingStep === 2 ? 'active' : ''}`} onClick={() => setForcingStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {forcingStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([2, 5], [2, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([5, 9])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([9, 1])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {forcingStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([2, 5], [2, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([5, 9])}</div>
              <div className="mini-cell note-grid-cell">
                {renderNoteGrid([1], [], [9])}
              </div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Stage5ForcingChains;
