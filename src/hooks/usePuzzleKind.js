import { useState } from 'react';
import { loadSettings, saveSettings } from '../utils/storage';
import { variantOf } from '../engine/variants';

/**
 * The kind of puzzle the player has picked — standard or killer — and the way to
 * change it, for every screen with the switch: Home's card, the AI battle lobby
 * (KP-11, user 2026-10-14: a switch on the AI screen, one remembered choice) and
 * the 1v1 lobby (KP-10, 2026-11-06).
 *
 * One setting, `homeVariant`, for both. Each screen reads it when it opens, so a
 * killer picked in the AI lobby is the kind Home shows on the way back, and the
 * other way round; two settings would be two answers to "which kind am I playing".
 * The name is older than the second screen and stays: it is a saved key.
 */
export function usePuzzleKind() {
  const [variant, setVariantState] = useState(() => variantOf({ variant: loadSettings().homeVariant }));
  const setVariant = (v) => {
    setVariantState(v);
    saveSettings({ ...loadSettings(), homeVariant: v });
  };
  return [variant, setVariant];
}
