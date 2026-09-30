import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage2Claiming({ type, lang = 'ko' }) {
  const [claimStep, setClaimStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'claiming') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${claimStep === 1 ? 'active' : ''}`} onClick={() => setClaimStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${claimStep === 2 ? 'active' : ''}`} onClick={() => setClaimStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {claimStep === 1 && (
          <div className="cross-step-pane">
            <span className="box-section-tag">{dt('step1Tag')}</span>
            <div className="mini-3x3-real-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([8, 2], [8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([8, 5], [8])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([3, 8])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {claimStep === 2 && (
          <div className="cross-step-pane">
            <span className="box-section-tag">{dt('step1Tag')}</span>
            <div className="mini-3x3-real-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([8, 2], [8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([8, 5], [8])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell highlight-target">3</div>
              <div className="mini-cell disabled-cell">.</div>
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

export default Stage2Claiming;
