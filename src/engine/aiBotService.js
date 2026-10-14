import { KILLER_TIME_RATIO } from './killer/killerTimes.js';

const AI_LEVEL_PROFILES = {
  1: { tickMs: 9000, mistakeRate: 0.14, minGain: 3, maxGain: 5 }, // Lv.1 Beginner: ~4m 20s
  2: { tickMs: 7100, mistakeRate: 0.10, minGain: 3, maxGain: 5 }, // Lv.2 Intermediate: ~3m 20s
  3: { tickMs: 5900, mistakeRate: 0.08, minGain: 3, maxGain: 5 }, // Lv.3 Advanced: ~2m 40s
  4: { tickMs: 4200, mistakeRate: 0.05, minGain: 3, maxGain: 5 }, // Lv.4 Expert: ~1m 50s
  5: { tickMs: 2900, mistakeRate: 0.03, minGain: 3, maxGain: 5 }  // Lv.5 Master: ~1m 15s
};

/**
 * The bot at `level` on this kind of puzzle (KP-11, 2026-10-14). On a killer it
 * is the classic bot slowed by the killer time ratio — each step takes ratio ×
 * as long, so a match takes ratio × as long (median finish 7m 10s, 6m 46s,
 * 6m 18s, 5m 46s, 4m 01s against classic 4m 03s … 1m 15s, 20000 runs a level)
 * — and makes the same mistakes per match. The ratio is killerTimes.js's, the one
 * the grade and the Survival limits read, so the bot cannot be timed on its own
 * numbers.
 */
export function botProfile(level, variant = 'classic') {
  const classic = AI_LEVEL_PROFILES[level] || AI_LEVEL_PROFILES[3];
  if (variant !== 'killer') return classic;
  const ratio = KILLER_TIME_RATIO[level] ?? KILLER_TIME_RATIO[3];
  return { ...classic, tickMs: Math.round(classic.tickMs * ratio) };
}

export class AIBotService {
  constructor() {
    this.intervalId = null;
    this.onUpdateCallback = null;
    this.onFinishCallback = null;
    this.botState = { name: 'AI Grandmaster', progress: 0, mistakes: 0, status: 'idle' };
  }

  startMatch(level = 3, onUpdate, onFinish, variant = 'classic') {
    this.onUpdateCallback = onUpdate;
    this.onFinishCallback = onFinish;

    const botNames = ['AI Grandmaster', 'AI Solver', 'AI Logic', 'AI Swift'];
    const randomName = botNames[Math.floor(Math.random() * botNames.length)];
    const profile = botProfile(level, variant);

    this.botState = {
      name: randomName,
      progress: 0,
      mistakes: 0,
      status: 'playing'
    };

    if (this.onUpdateCallback) this.onUpdateCallback({ ...this.botState });

    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (this.botState.status !== 'playing') {
        clearInterval(this.intervalId);
        this.intervalId = null;
        return;
      }

      // Check mistake roll based on level profile
      if (Math.random() < profile.mistakeRate) {
        this.botState.mistakes += 1;
        if (this.botState.mistakes >= 3) {
          this.botState.status = 'finished';
          clearInterval(this.intervalId);
          this.intervalId = null;
          if (this.onUpdateCallback) this.onUpdateCallback({ ...this.botState });
          if (this.onFinishCallback) this.onFinishCallback({ ...this.botState });
          return;
        }
      } else {
        const gain = Math.floor(Math.random() * (profile.maxGain - profile.minGain + 1)) + profile.minGain;
        this.botState.progress = Math.min(100, this.botState.progress + gain);
      }

      if (this.onUpdateCallback) this.onUpdateCallback({ ...this.botState });

      if (this.botState.progress >= 100) {
        this.botState.status = 'finished';
        clearInterval(this.intervalId);
        this.intervalId = null;
        if (this.onFinishCallback) this.onFinishCallback({ ...this.botState });
      }
    }, profile.tickMs);
  }

  stopMatch() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.botState.status = 'idle';
  }
}

export const aiBotService = new AIBotService();
