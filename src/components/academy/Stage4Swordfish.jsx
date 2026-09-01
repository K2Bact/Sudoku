import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage4Swordfish({ lang = 'ko' }) {
  const [swordfishStep, setSwordfishStep] = useState(1);
  const dt = (key) => getDiagramText('swordfish', key, lang);

  return (
    <div className="mini-grid-container cross-hatching-detailed">
      <span className="mini-grid-label">{dt('label')}</span>
      <div className="cross-step-tabs">
        <button className={`cross-tab-btn ${swordfishStep === 1 ? 'active' : ''}`} onClick={() => setSwordfishStep(1)}>
          {dt('step1Tab')}
        </button>
        <button className={`cross-tab-btn ${swordfishStep === 2 ? 'active' : ''}`} onClick={() => setSwordfishStep(2)}>
          {dt('step2Tab')}
        </button>
        <button className={`cross-tab-btn ${swordfishStep === 3 ? 'active' : ''}`} onClick={() => setSwordfishStep(3)}>
          {dt('step3Tab')}
        </button>
      </div>

      {swordfishStep === 1 && (
        <div className="cross-step-pane">
          <div className="mini-3x3-real-board">
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell disabled-cell">.</div>

            <div className="mini-cell disabled-cell">.</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([6], [6])}</div>

            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell note-grid-cell">{renderNoteGrid([6, 5])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([6], [6])}</div>
          </div>
          <div className="diagram-caption">{dt('step1Caption')}</div>
        </div>
      )}

      {swordfishStep === 2 && (
        <div className="cross-step-pane">
          <div className="mini-3x3-real-board">
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell disabled-cell">.</div>

            <div className="mini-cell disabled-cell">.</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>

            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell note-grid-cell">{renderNoteGrid([6, 5])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
          </div>
          <div className="diagram-caption">{dt('step2Caption')}</div>
        </div>
      )}

      {swordfishStep === 3 && (
        <div className="cross-step-pane">
          <div className="mini-3x3-real-board">
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell disabled-cell">.</div>

            <div className="mini-cell disabled-cell">.</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>

            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
            <div className="mini-cell highlight-target">5</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([6], [6])}</div>
          </div>
          <div className="diagram-caption">{dt('step3Caption')}</div>
        </div>
      )}
    </div>
  );
}

export default Stage4Swordfish;
