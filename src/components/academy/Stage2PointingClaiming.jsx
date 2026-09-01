import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage2PointingClaiming({ type, lang = 'ko' }) {
  const [ppStep, setPpStep] = useState(1);
  const [claimStep, setClaimStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'pointing-pairs') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${ppStep === 1 ? 'active' : ''}`} onClick={() => setPpStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${ppStep === 2 ? 'active' : ''}`} onClick={() => setPpStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {ppStep === 1 && (
          <div className="cross-step-pane">
            <span className="box-section-tag">{dt('step1Tag')}</span>
            <div className="mini-3x3-real-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4, 8], [4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4, 9], [4])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <span className="box-section-tag">{dt('step2Tag')}</span>
            <div className="mini-row-grid">
              <div className="mini-cell note-grid-cell">{renderNoteGrid([4, 6])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {ppStep === 2 && (
          <div className="cross-step-pane">
            <span className="box-section-tag">{dt('step1Tag')}</span>
            <div className="mini-3x3-real-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4, 8], [4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4, 9], [4])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <span className="box-section-tag">{dt('step2Tag')}</span>
            <div className="mini-row-grid">
              <div className="mini-cell highlight-target">6</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

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

export default Stage2PointingClaiming;
