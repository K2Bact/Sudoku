import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage4WXYZEmptyRect({ type, lang = 'ko' }) {
  const [wxyzwingStep, setWxyzwingStep] = useState(1);
  const [emptyrectStep, setEmptyrectStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'wxyz-wing') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${wxyzwingStep === 1 ? 'active' : ''}`} onClick={() => setWxyzwingStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${wxyzwingStep === 2 ? 'active' : ''}`} onClick={() => setWxyzwingStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {wxyzwingStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([1, 2, 3, 4], [1, 2, 3, 4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 4], [1, 4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 4], [2, 4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([3, 4], [3, 4])}</div>
            </div>
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([4, 7])}
              </div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {wxyzwingStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([1, 2, 3, 4], [1, 2, 3, 4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 4], [1, 4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 4], [2, 4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([3, 4], [3, 4])}</div>
            </div>
            <div className="mini-row-grid flex-4">
              <div className="mini-cell highlight-target">7</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'empty-rectangles') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${emptyrectStep === 1 ? 'active' : ''}`} onClick={() => setEmptyrectStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${emptyrectStep === 2 ? 'active' : ''}`} onClick={() => setEmptyrectStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {emptyrectStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-3x3-real-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a' }}>{renderNoteGrid([5], [5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a' }}>{renderNoteGrid([5], [5])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a' }}>{renderNoteGrid([5], [5])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {emptyrectStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-3x3-real-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a' }}>{renderNoteGrid([5], [5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a' }}>{renderNoteGrid([5], [5])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a' }}>{renderNoteGrid([5], [5])}</div>
              <div className="mini-cell highlight-target">2</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Stage4WXYZEmptyRect;
