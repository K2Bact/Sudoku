import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { Stage5Exocet } from './Stage5Exocet';
import { getDiagramText } from './langHelper';

export function Stage5MiniGrids({ type, lang = 'ko' }) {
  const [finnedStep, setFinnedStep] = useState(1);
  const [aicStep, setAicStep] = useState(1);
  const [alsStep, setAlsStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'forcing-chains' || type === 'exocet') {
    return <Stage5Exocet type={type} lang={lang} />;
  }

  if (type === 'finned-xwing') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${finnedStep === 1 ? 'active' : ''}`} onClick={() => setFinnedStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${finnedStep === 2 ? 'active' : ''}`} onClick={() => setFinnedStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {finnedStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-4x4-xwing-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4], [4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }} title="Fin">{renderNoteGrid([4], [4])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4], [4])}</div>

              <div className="mini-cell x-vline">┃</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell x-vline">┃</div>

              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4], [4])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4], [4])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {finnedStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-4x4-xwing-board">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4], [4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([4], [4])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4], [4])}</div>

              <div className="mini-cell x-vline">┃</div>
              <div className="mini-cell note-grid-cell" title="Eliminated">{renderNoteGrid([9], [], [4])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell x-vline">┃</div>

              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4], [4])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4], [4])}</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'aic') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${aicStep === 1 ? 'active' : ''}`} onClick={() => setAicStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${aicStep === 2 ? 'active' : ''}`} onClick={() => setAicStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {aicStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([2, 7], [2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([2, 7], [7])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            </div>
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([7, 9])}</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
              <div className="mini-cell disabled-cell">.</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {aicStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([2, 7], [2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([2, 7], [7])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([7], [7])}</div>
            </div>
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell">
                {renderNoteGrid([9], [], [7])}
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

  if (type === 'als') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${alsStep === 1 ? 'active' : ''}`} onClick={() => setAlsStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${alsStep === 2 ? 'active' : ''}`} onClick={() => setAlsStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {alsStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2, 3], [1, 2, 3])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([3], [3])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([3, 4, 5], [3, 4, 5])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([5, 8])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {alsStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2, 3], [1, 2, 3])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([3], [3])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dcfce7', borderColor: '#22c55e' }}>{renderNoteGrid([3, 4, 5], [3, 4, 5])}</div>
              <div className="mini-cell note-grid-cell">
                {renderNoteGrid([8], [], [5])}
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

export default Stage5MiniGrids;
