import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage2NakedHiddenPairs({ type, lang = 'ko' }) {
  const [npStep, setNpStep] = useState(1);
  const [hpStep, setHpStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'naked-pair') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${npStep === 1 ? 'active' : ''}`} onClick={() => setNpStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${npStep === 2 ? 'active' : ''}`} onClick={() => setNpStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {npStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3, 8], [3, 8])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([3, 5, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3, 8], [3, 8])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 6])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {npStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3, 8], [3, 8])}
              </div>
              <div className="mini-cell highlight-target">5</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3, 8], [3, 8])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 6])}</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'hidden-pair') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${hpStep === 1 ? 'active' : ''}`} onClick={() => setHpStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${hpStep === 2 ? 'active' : ''}`} onClick={() => setHpStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {hpStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 3, 8, 9], [3, 8])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([3, 5, 7, 8], [3, 8])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 4])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {hpStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3, 8], [3, 8])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3, 8], [3, 8])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 4])}</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Stage2NakedHiddenPairs;
