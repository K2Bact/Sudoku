/**
 * soundHaptic.js
 * Synthesizer coordinator and mobile haptics manager.
 */
import {
  synthSelectSound,
  synthPlaceNumberSound,
  synthComboSound,
  synthNoteSound,
  synthEraseSound,
  synthBlockedInput,
  synthUndoSound,
  synthHintSound,
  synthErrorSound,
  synthGameOverChord,
  synthCompleteChime,
  synthVictorySound
} from './audioSynthesizers.js';

class SoundHapticManager {
  constructor() {
    this.soundEnabled = true;
    this.hapticEnabled = true;
    this.audioCtx = null;

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('suidoku_settings_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.soundEnabled === 'boolean') this.soundEnabled = parsed.soundEnabled;
          if (parsed && typeof parsed.hapticEnabled === 'boolean') this.hapticEnabled = parsed.hapticEnabled;
        }
      } catch (e) {}
    }
  }

  setSoundEnabled(enabled) { this.soundEnabled = Boolean(enabled); }
  setHapticEnabled(enabled) { this.hapticEnabled = Boolean(enabled); }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try { this.audioCtx.resume().catch(() => {}); } catch (_) {}
    }
    return this.audioCtx;
  }

  suspend() {
    if (this.audioCtx && this.audioCtx.state === 'running') {
      try { this.audioCtx.suspend().catch(() => {}); } catch (e) {}
    }
  }

  resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try { this.audioCtx.resume().catch(() => {}); } catch (e) {}
    }
  }

  vibrate(pattern) {
    if (!this.hapticEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  _play(synthFn, hapticPattern) {
    if (hapticPattern) this.vibrate(hapticPattern);
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (ctx) synthFn(ctx);
    } catch (e) {}
  }

  playSelectSound() { this._play(synthSelectSound, 10); }
  playPlaceNumberSound() { this._play(synthPlaceNumberSound, 15); }
  playPopSound() { this.playPlaceNumberSound(); }
  playComboSound(combo = 2) { this._play((ctx) => synthComboSound(ctx, combo), [15, 30, 20]); }
  playNoteSound() { this._play(synthNoteSound, 8); }
  playEraseSound() { this._play(synthEraseSound, 15); }
  playBlockedInput() { this._play(synthBlockedInput, 28); }
  playUndoSound() { this._play(synthUndoSound, 12); }
  playHintSound() { this._play(synthHintSound, [20, 20, 40]); }
  playErrorSound() { this._play(synthErrorSound, [40, 30, 60]); }
  playGameOverSound() { this._play(synthGameOverChord, [80, 50, 120]); }
  playCompleteChime() { this._play(synthCompleteChime, [30, 40, 30, 40, 50]); }
  playVictorySound() { this._play(synthVictorySound, [100, 50, 100, 50, 200]); }
  triggerSuccessHaptic() { this.vibrate([100, 50, 100]); }
  triggerErrorHaptic() { this.vibrate([40, 30, 60]); }
}

export const soundHaptic = new SoundHapticManager();
