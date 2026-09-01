import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage4RectColouring({ type, lang = 'ko' }) {
  const [urStep, setUrStep] = useState(1);
  const [colouringStep, setColouringStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'unique-rectangles') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${urStep === 1 ? 'active' : ''}`} onClick={() => setUrStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${urStep === 2 ? 'active' : ''}`} onClick={() => setUrStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {urStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 2, 5], [1, 2, 5])}
              </div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {urStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell highlight-target">5</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'simple-colouring') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${colouringStep === 1 ? 'active' : ''}`} onClick={() => setColouringStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${colouringStep === 2 ? 'active' : ''}`} onClick={() => setColouringStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {colouringStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3], [3])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>
                {renderNoteGrid([3], [3])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3], [3])}
              </div>
              <div className="mini-cell note-grid-cell">
                {renderNoteGrid([3, 8])}
              </div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {colouringStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3], [3])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>
                {renderNoteGrid([3], [3])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([3], [3])}
              </div>
              <div className="mini-cell note-grid-cell">
                {renderNoteGrid([8], [], [3])}
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

export default Stage4RectColouring;
