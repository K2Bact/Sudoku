import React, { useMemo, useState } from 'react';
import { Film, Play, Pause, SkipBack, SkipForward, Star } from 'lucide-react';
import { ScreenHeader } from '../common/ScreenHeader';
import { SudokuBoard } from '../SudokuBoard';
import { ReplaySummary } from './ReplaySummary';
import { clock } from './replayFormat';
import { useTranslation } from '../../i18n/i18nContext';
import { useNotify } from '../common/ConfirmProvider';
import { useReplay } from '../../hooks/useReplay';
import { useReplayPlayback } from '../../hooks/useReplayPlayback';
import { gridsAt, progressAt, stringToValues, MAX_EVENTS } from '../../utils/replay/replayRecord';
import { setPinned, KEEP_PINNED } from '../../utils/replay/replayStore';
import { soundHaptic } from '../../utils/soundHaptic';

/**
 * ReplayScreen — a finished 1v1, move by move (I-1, 2026-09-30).
 *
 * Everything drawn here is computed from the stored moves at the moment shown
 * (replayRecord.js): the board, both progress bars, the mistake marks. Nothing
 * about the screen is stored, so a new view needs no new data.
 *
 * The opponent's board is there only when both players shared their moves. When
 * they did not, their side is the progress they reported during the match, and a
 * line says why (declined, an older app, this player's own setting).
 */
const toGrid = (s) => {
  const v = stringToValues(s);
  return Array.from({ length: 9 }, (_, r) => v.slice(r * 9, r * 9 + 9));
};

/** What the opponent had reported by time `at`, when their moves did not come. */
function reportedAt(progress, at) {
  let pct = 0;
  for (const [pt, p] of progress) {
    if (pt > at) break;
    pct = p;
  }
  return pct;
}

function durationOf(record) {
  const lastOf = (list) => (list?.length ? list[list.length - 1][0] : 0);
  return Math.max(1000, lastOf(record.me.events), lastOf(record.opp.events), lastOf(record.opp.progress),
    record.me.elapsedMs || 0, record.opp.elapsedMs || 0);
}

const noop = () => {};

export function ReplayScreen({ id, onBack }) {
  const { t } = useTranslation();
  const { record, shareState } = useReplay(id);
  if (!record) {
    return (
      <div className="replay-layer">
        <div className="replay-screen">
          <ScreenHeader title={t('replay.title')} icon={Film} iconColorClass="text-blue" onBack={onBack} />
          <p className="replay-note">{t('replay.missing')}</p>
        </div>
      </div>
    );
  }
  return <ReplayView record={record} shareState={shareState} onBack={onBack} />;
}

function ReplayView({ record, shareState, onBack }) {
  const { t } = useTranslation();
  const notify = useNotify();
  const hasOpp = Array.isArray(record.opp.events);
  const [side, setSide] = useState('me');
  const viewing = side === 'opp' && hasOpp ? 'opp' : 'me';
  const duration = useMemo(() => durationOf(record), [record]);
  const { at, playing, speed, seek, togglePlay, cycleSpeed, pause } = useReplayPlayback(duration);
  const events = record[viewing].events;
  const puzzleGrid = useMemo(() => toGrid(record.puzzle), [record.puzzle]);
  const solutionGrid = useMemo(() => toGrid(record.solution), [record.solution]);
  const times = useMemo(() => [...new Set(events.map((e) => e[0]))], [events]);
  const wrongAt = useMemo(
    () => events.filter(([, kind, cell, value, cause]) => kind === 'v' && value !== 0 && cause !== 'u'
      && String(value) !== record.solution[cell]).map((e) => e[0]),
    [events, record.solution]
  );
  const { board, notes, last } = gridsAt(record.puzzle, events, at);
  const lastCell = last ? [Math.floor(last[2] / 9), last[2] % 9] : null;
  const oppName = record.opp.name || t('battleResult.opponent');
  const bars = [
    { key: 'me', name: t('battleResult.you'), pct: progressAt(record, 'me', at) },
    { key: 'opp', name: oppName, pct: hasOpp ? progressAt(record, 'opp', at) : reportedAt(record.opp.progress, at) },
  ];

  const step = (dir) => {
    soundHaptic.playSelectSound();
    pause();
    if (dir > 0) seek(times.find((x) => x > at) ?? duration);
    else seek([...times].reverse().find((x) => x < at) ?? 0);
  };

  const togglePin = async () => {
    soundHaptic.playSelectSound();
    if (!setPinned(record.id, !record.pinned)) await notify(t('replay.pinFull', { count: KEEP_PINNED }));
  };

  const pinButton = (
    <button type="button" className={`icon-btn replay-pin ${record.pinned ? 'on' : ''}`} onClick={togglePin}
      aria-pressed={record.pinned} title={record.pinned ? t('replay.unpin') : t('replay.pin')}>
      <Star size={18} fill={record.pinned ? 'currentColor' : 'none'} />
    </button>
  );

  return (
    <div className="replay-layer">
      <div className="replay-screen">
        <ScreenHeader title={t('replay.title')} icon={Film} iconColorClass="text-blue" onBack={onBack} rightAction={pinButton} />

        <div className="replay-body">
          <p className="replay-match-line">
            <span className={`replay-result ${record.winner === 'me' ? 'won' : 'lost'}`}>
              {record.winner === 'me' ? t('replay.won') : t('replay.lost')}
            </span>
            <span className="replay-match-text">{t('replay.vs', { name: oppName })} · {t(`levels.${record.level}`)}</span>
          </p>

          <div className="replay-sides" role="group">
            <button type="button" className={`seg-tab-btn ${viewing === 'me' ? 'active' : ''}`} onClick={() => setSide('me')}>
              {t('replay.myBoard')}
            </button>
            <button type="button" className={`seg-tab-btn ${viewing === 'opp' ? 'active' : ''}`} onClick={() => setSide('opp')} disabled={!hasOpp}>
              {t('replay.theirBoard')}
            </button>
          </div>
          {!hasOpp && <p className="replay-note">{t(`replay.share.${shareState}`)}</p>}
          {record[viewing].truncated && <p className="replay-note">{t('replay.truncated', { count: MAX_EVENTS })}</p>}

          <div className="replay-board">
            <SudokuBoard board={board} initialBoard={puzzleGrid} solutionBoard={solutionGrid} notes={notes}
              selectedCell={lastCell} onSelectCell={noop} cages={record.cages || null} />
          </div>

          <div className="replay-bars">
            {bars.map((b) => (
              <div key={b.key} className={`replay-bar-row ${b.key}`}>
                <span className="replay-bar-name">{b.name}</span>
                <span className="replay-bar-track"><span className="replay-bar-fill" style={{ width: `${b.pct}%` }} /></span>
                <span className="replay-bar-pct">{b.pct}%</span>
              </div>
            ))}
          </div>

          <div className="replay-timeline">
            <input type="range" min={0} max={duration} step={100} value={at} aria-label={t('replay.timeline')}
              onChange={(e) => { pause(); seek(Number(e.target.value)); }} />
            <div className="replay-marks" aria-hidden="true">
              {wrongAt.map((mt, i) => <span key={i} style={{ left: `${(mt / duration) * 100}%` }} />)}
            </div>
          </div>

          <div className="replay-controls">
            <button type="button" className="icon-btn" onClick={() => step(-1)} title={t('replay.prevMove')}><SkipBack size={18} /></button>
            <button type="button" className="icon-btn replay-play" onClick={() => { soundHaptic.playSelectSound(); togglePlay(); }}
              title={playing ? t('replay.pause') : t('replay.play')}>
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button type="button" className="icon-btn" onClick={() => step(1)} title={t('replay.nextMove')}><SkipForward size={18} /></button>
            <button type="button" className="replay-speed" onClick={cycleSpeed} title={t('replay.speed')}>{speed}×</button>
            <span className="replay-clock">{clock(at)} / {clock(duration)}</span>
          </div>

          <ReplaySummary record={record} hasOpp={hasOpp} oppName={oppName} />
        </div>
      </div>
    </div>
  );
}
