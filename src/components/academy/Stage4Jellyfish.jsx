import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage4Jellyfish({ lang = 'ko' }) {
  const [jellyfishStep, setJellyfishStep] = useState(1);
  const dt = (key) => getDiagramText('jellyfish', key, lang);

  return (
    <div className="mini-grid-container cross-hatching-detailed">
      <span className="mini-grid-label">{dt('label')}</span>
      <div className="cross-step-tabs">
        <button className={`cross-tab-btn ${jellyfishStep === 1 ? 'active' : ''}`} onClick={() => setJellyfishStep(1)}>
          {dt('step1Tab')}
        </button>
        <button className={`cross-tab-btn ${jellyfishStep === 2 ? 'active' : ''}`} onClick={() => setJellyfishStep(2)}>
          {dt('step2Tab')}
        </button>
        <button className={`cross-tab-btn ${jellyfishStep === 3 ? 'active' : ''}`} onClick={() => setJellyfishStep(3)}>
          {dt('step3Tab')}
        </button>
        <button className={`cross-tab-btn ${jellyfishStep === 4 ? 'active' : ''}`} onClick={() => setJellyfishStep(4)}>
          {dt('step4Tab')}
        </button>
      </div>

      {jellyfishStep === 1 && (
        <div className="cross-step-pane">
          <div className="mini-4x4-xwing-board">
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>

            <div className="mini-cell disabled-cell">.</div>
            <div className="mini-cell note-grid-cell">{renderNoteGrid([7, 9])}</div>
            <div className="mini-cell note-grid-cell">{renderNoteGrid([7, 3])}</div>
            <div className="mini-cell disabled-cell">.</div>

            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell disabled-cell">.</div>
            <div className="mini-cell note-grid-cell">{renderNoteGrid([7, 5])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>

            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
          </div>
          <div className="diagram-caption">{dt('step1Caption')}</div>
        </div>
      )}

      {jellyfishStep === 2 && (
        <div className="cross-step-pane">
          <div className="mini-4x4-xwing-board">
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>

            <div className="mini-cell x-vline">┃</div>
            <div className="mini-cell x-vline">┃</div>
            <div className="mini-cell x-vline">┃</div>
            <div className="mini-cell x-vline">┃</div>

            <div className="mini-cell x-vline">┃</div>
            <div className="mini-cell disabled-cell">.</div>
            <div className="mini-cell x-vline">┃</div>
            <div className="mini-cell x-vline">┃</div>

            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
          </div>
          <div className="diagram-caption">{dt('step2Caption')}</div>
        </div>
      )}

      {jellyfishStep === 3 && (
        <div className="cross-step-pane">
          <div className="mini-4x4-xwing-board">
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>

            <div className="mini-cell x-line">━</div>
            <div className="mini-cell x-line">━</div>
            <div className="mini-cell x-line">━</div>
            <div className="mini-cell x-line">━</div>

            <div className="mini-cell x-line">━</div>
            <div className="mini-cell disabled-cell">.</div>
            <div className="mini-cell x-line">━</div>
            <div className="mini-cell x-line">━</div>

            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
          </div>
          <div className="diagram-caption">{dt('step3Caption')}</div>
        </div>
      )}

      {jellyfishStep === 4 && (
        <div className="cross-step-pane">
          <div className="mini-4x4-xwing-board">
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>

            <div className="mini-cell x-vline">┃</div>
            <div className="mini-cell note-grid-cell">{renderNoteGrid([9], [], [7])}</div>
            <div className="mini-cell note-grid-cell">{renderNoteGrid([3], [], [7])}</div>
            <div className="mini-cell x-vline">┃</div>

            <div className="mini-cell x-vline">┃</div>
            <div className="mini-cell disabled-cell">.</div>
            <div className="mini-cell note-grid-cell">{renderNoteGrid([5], [], [7])}</div>
            <div className="mini-cell x-vline">┃</div>

            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
          </div>
          <div className="diagram-caption">{dt('step4Caption')}</div>
        </div>
      )}
    </div>
  );
}

export default Stage4Jellyfish;
