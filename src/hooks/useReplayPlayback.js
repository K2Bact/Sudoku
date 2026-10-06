import { useCallback, useEffect, useState } from 'react';

export const REPLAY_SPEEDS = [1, 2, 4, 8];
const TICK_MS = 100;

/**
 * The clock of a replay: where in the match it is, whether it is moving, and how
 * fast. The board only changes at a move, so ten ticks a second is smooth enough
 * and keeps a 3000-move replay from redrawing 81 cells sixty times a second.
 */
export function useReplayPlayback(duration) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => {
      setAt((cur) => Math.min(duration, cur + TICK_MS * speed));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, speed, duration]);

  useEffect(() => {
    if (playing && at >= duration) setPlaying(false);
  }, [playing, at, duration]);

  const seek = useCallback((ms) => {
    setAt(Math.max(0, Math.min(duration, Math.round(ms))));
  }, [duration]);

  const togglePlay = useCallback(() => {
    if (!playing && at >= duration) setAt(0);
    setPlaying((p) => !p);
  }, [playing, at, duration]);

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => REPLAY_SPEEDS[(REPLAY_SPEEDS.indexOf(s) + 1) % REPLAY_SPEEDS.length]);
  }, []);

  return { at, playing, speed, seek, togglePlay, cycleSpeed, pause: () => setPlaying(false) };
}
