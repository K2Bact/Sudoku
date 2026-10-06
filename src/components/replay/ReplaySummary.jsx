import React, { useMemo } from 'react';
import { useTranslation } from '../../i18n/i18nContext';
import { summarize } from '../../utils/replay/replayRecord';
import { clock } from './replayFormat';

/**
 * The two games side by side, in numbers. Time and mistakes are what the match
 * itself counted, so they are there for the opponent even when their moves are
 * not; the rest is read from the moves and shows a dash without them.
 */
export function ReplaySummary({ record, hasOpp, oppName }) {
  const { t } = useTranslation();
  const mine = useMemo(() => summarize(record, 'me'), [record]);
  const theirs = useMemo(() => (hasOpp ? summarize(record, 'opp') : null), [record, hasOpp]);
  const dash = '—';
  const time = (side) => (Number.isFinite(record[side].elapsedMs) ? clock(record[side].elapsedMs) : dash);
  const fromMoves = (s, pick) => (s ? pick(s) : dash);

  const rows = [
    { key: 'time', label: t('replay.sumTime'), me: time('me'), opp: time('opp') },
    { key: 'mistakes', label: t('replay.sumMistakes'), me: record.me.mistakes, opp: record.opp.mistakes },
    { key: 'moves', label: t('replay.sumMoves'), me: fromMoves(mine, (s) => s.moves), opp: fromMoves(theirs, (s) => s.moves) },
    { key: 'pace', label: t('replay.sumPace'), me: fromMoves(mine, (s) => s.movesPerMinute), opp: fromMoves(theirs, (s) => s.movesPerMinute) },
    { key: 'pause', label: t('replay.sumLongestPause'), me: fromMoves(mine, (s) => clock(s.longestPauseMs)), opp: fromMoves(theirs, (s) => clock(s.longestPauseMs)) },
    { key: 'notes', label: t('replay.sumNotes'), me: fromMoves(mine, (s) => s.noteToggles), opp: fromMoves(theirs, (s) => s.noteToggles) },
    { key: 'undos', label: t('replay.sumUndos'), me: fromMoves(mine, (s) => s.undos), opp: fromMoves(theirs, (s) => s.undos) },
  ];

  return (
    <div className="stats-card replay-summary">
      <div className="replay-sum-row replay-sum-head">
        <span />
        <span>{t('battleResult.you')}</span>
        <span className="replay-sum-opp-name">{oppName}</span>
      </div>
      {rows.map((r) => (
        <div key={r.key} className="replay-sum-row">
          <span className="replay-sum-label">{r.label}</span>
          <span className="replay-sum-val">{r.me}</span>
          <span className="replay-sum-val">{r.opp}</span>
        </div>
      ))}
    </div>
  );
}
