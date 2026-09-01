import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage3XWingYWing({ type, lang = 'ko' }) {
  const [xwingStep, setXwingStep] = useState(1);
  const [ywingStep, setYwingStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'x-wing') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${xwingStep === 1 ? 'active' : ''}`} onClick={() => setXwingStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${xwingStep === 2 ? 'active' : ''}`} onClick={() => setXwingStep(2)}>
            {dt('step2Tab')}
          </button>
          <button className={`cross-tab-btn ${xwingStep === 3 ? 'active' : ''}`} onClick={() => setXwingStep(3)}>
            {dt('step3Tab')}
          </button>
        </div>

        {xwingStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-4x4-xwing-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>

              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([7, 4])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([7, 2])}</div>
              <div className="mini-cell disabled-cell">.</div>

              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7], [7])}</div>

              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}

        {xwingStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-4x4-xwing-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
              <div className="mini-cell x-line">━</div>
              <div className="mini-cell x-line">━</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>

              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([7, 4])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([7, 2])}</div>
              <div className="mini-cell disabled-cell">.</div>

              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
              <div className="mini-cell x-line">━</div>
              <div className="mini-cell x-line">━</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>

              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}

        {xwingStep === 3 && (
          <div className="cross-step-pane">
            <div className="mini-4x4-xwing-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
              <div className="mini-cell x-line">━</div>
              <div className="mini-cell x-line">━</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>

              <div className="mini-cell x-vline">┃</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([4], [], [7])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2], [], [7])}</div>
              <div className="mini-cell x-vline">┃</div>

              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
              <div className="mini-cell x-line">━</div>
              <div className="mini-cell x-line">━</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>

              <div className="mini-cell x-vline">┃</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell x-vline">┃</div>
            </div>
            <div className="diagram-caption">{dt('step3Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'y-wing') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${ywingStep === 1 ? 'active' : ''}`} onClick={() => setYwingStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${ywingStep === 2 ? 'active' : ''}`} onClick={() => setYwingStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {ywingStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 2], [1, 2])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([1, 3], [1, 3])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([2, 3], [2, 3])}
              </div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([3, 7])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {ywingStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>
                {renderNoteGrid([1, 2], [1, 2])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([1, 3], [1, 3])}
              </div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
                {renderNoteGrid([2, 3], [2, 3])}
              </div>
              <div className="mini-cell highlight-target">7</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Stage3XWingYWing;
