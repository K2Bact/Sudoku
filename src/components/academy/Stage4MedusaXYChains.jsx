import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage4MedusaXYChains({ type, lang = 'ko' }) {
  const [medusaStep, setMedusaStep] = useState(1);
  const [xychainStep, setXychainStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === '3d-medusa') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${medusaStep === 1 ? 'active' : ''}`} onClick={() => setMedusaStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${medusaStep === 2 ? 'active' : ''}`} onClick={() => setMedusaStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {medusaStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 4], [1])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([4, 9], [4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([9, 1], [9])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([1, 9])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {medusaStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 4], [1])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([4, 9], [4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([9, 1], [9])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([], [], [1, 9])}</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'xy-chains') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${xychainStep === 1 ? 'active' : ''}`} onClick={() => setXychainStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${xychainStep === 2 ? 'active' : ''}`} onClick={() => setXychainStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {xychainStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([1, 2], [1, 2])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 5])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([5, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([8, 1], [8, 1])}
              </div>
            </div>
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 6])}
              </div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {xychainStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([1, 2], [1, 2])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 5])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([5, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([8, 1], [8, 1])}
              </div>
            </div>
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell">
                {renderNoteGrid([6], [], [1])}
              </div>
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

export default Stage4MedusaXYChains;
