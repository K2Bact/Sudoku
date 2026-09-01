import React, { useState } from 'react';
import { renderNoteGrid } from './renderNoteGrid';
import { getDiagramText } from './langHelper';

export function Stage2TriplesQuads({ type, lang = 'ko' }) {
  const [ntStep, setNtStep] = useState(1);
  const [htStep, setHtStep] = useState(1);
  const [nqStep, setNqStep] = useState(1);
  const [hqStep, setHqStep] = useState(1);
  const dt = (key) => getDiagramText(type, key, lang);

  if (type === 'naked-triple') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${ntStep === 1 ? 'active' : ''}`} onClick={() => setNtStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${ntStep === 2 ? 'active' : ''}`} onClick={() => setNtStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {ntStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 3], [2, 3])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 3], [1, 3])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([1, 3, 7])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {ntStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 3], [2, 3])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 3], [1, 3])}</div>
              <div className="mini-cell highlight-target">7</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'hidden-triple') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${htStep === 1 ? 'active' : ''}`} onClick={() => setHtStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${htStep === 2 ? 'active' : ''}`} onClick={() => setHtStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {htStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([1, 2, 5, 9], [2, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([2, 3, 5, 8], [2, 5, 8])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([3, 4, 7])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([1, 5, 8, 9], [5, 8])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {htStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-4">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 5], [2, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 5, 8], [2, 5, 8])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([3, 4, 7])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([5, 8], [5, 8])}</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'naked-quad') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${nqStep === 1 ? 'active' : ''}`} onClick={() => setNqStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${nqStep === 2 ? 'active' : ''}`} onClick={() => setNqStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {nqStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-5">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 3], [2, 3])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([3, 4], [3, 4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 4], [1, 4])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([1, 2, 9])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {nqStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-5">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 2], [1, 2])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([2, 3], [2, 3])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([3, 4], [3, 4])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 4], [1, 4])}</div>
              <div className="mini-cell highlight-target">9</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'hidden-quad') {
    return (
      <div className="mini-grid-container cross-hatching-detailed">
        <span className="mini-grid-label">{dt('label')}</span>
        <div className="cross-step-tabs">
          <button className={`cross-tab-btn ${hqStep === 1 ? 'active' : ''}`} onClick={() => setHqStep(1)}>
            {dt('step1Tab')}
          </button>
          <button className={`cross-tab-btn ${hqStep === 2 ? 'active' : ''}`} onClick={() => setHqStep(2)}>
            {dt('step2Tab')}
          </button>
        </div>
        {hqStep === 1 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-5">
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([1, 2, 4, 9], [1, 4, 9])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 3, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([4, 5, 7, 9], [4, 7, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([1, 3, 7, 8], [1, 7])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#fef08a', borderColor: '#eab308' }}>{renderNoteGrid([1, 4, 7, 9], [1, 4, 7, 9])}</div>
            </div>
            <div className="diagram-caption">{dt('step1Caption')}</div>
          </div>
        )}
        {hqStep === 2 && (
          <div className="cross-step-pane">
            <div className="mini-row-grid flex-5">
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 4, 9], [1, 4, 9])}</div>
              <div className="mini-cell note-grid-cell">{renderNoteGrid([2, 3, 5])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([4, 7, 9], [4, 7, 9])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 7], [1, 7])}</div>
              <div className="mini-cell note-grid-cell" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>{renderNoteGrid([1, 4, 7, 9], [1, 4, 7, 9])}</div>
            </div>
            <div className="diagram-caption">{dt('step2Caption')}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Stage2TriplesQuads;
