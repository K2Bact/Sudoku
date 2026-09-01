import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage3Chains({ type, lang = 'ko' }) {
  const [bugStep, setBugStep] = useState(1);
  const [remoteStep, setRemoteStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'bug') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${bugStep === 1 ? 'active' : ''}`} onClick={() => setBugStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${bugStep === 2 ? 'active' : ''}`} onClick={() => setBugStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {bugStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-3x3-real-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([5, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([2, 5, 8], [5])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([5, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 5])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {bugStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-3x3-real-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([5, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 5])}</div>
              <div className="mini-cell highlight-target">5</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([5, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 8])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe' }}>{renderNoteGrid([2, 5])}</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'remote-pairs') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${remoteStep === 1 ? 'active' : ''}`} onClick={() => setRemoteStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${remoteStep === 2 ? 'active' : ''}`} onClick={() => setRemoteStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {remoteStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 9], [2, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([2, 9], [2, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 9], [2, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([2, 9], [2, 9])}</div>
            </div>
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([2, 9, 6])}
              </div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {remoteStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 9], [2, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([2, 9], [2, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 9], [2, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([2, 9], [2, 9])}</div>
            </div>
            <div className="mini-row-grid flex-4">
              <div className="mini-cell highlight-target">6</div>
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

export default Stage3Chains;
