import React, { useState, useEffect } from 'react';
import { Lock, X, Info } from 'lucide-react';
import { getGhostForModeLevel } from '../../utils/ghostManager';
import { soundHaptic } from '../../utils/soundHaptic';
import { useTranslation } from '../../i18n/i18nContext';

/**
 * RivalModeChips — who you are racing on the home screen.
 *
 * Split out of HomeScreen.jsx when that file went over its 280-code-line budget
 * (gate 0-1). One subject: the three chips, the ⓘ that explains them, and the
 * two popups that belong to them.
 *
 * Reporting up: the parent only needs the mode a game would start with, which is
 * not always the chip that looks selected. Ghost and Time Gap fall back to
 * Standard whenever they are unavailable, so `onChange` is given the EFFECTIVE
 * mode — never a value the game cannot honour.
 *
 * variant: the kind of puzzle on the switch. Each kind races its own record —
 * a killer's ghost is never a classic time (2026-10-14). Until then the chips
 * were "coming" on killer, which had no ghost table.
 *
 * One note at a time: the locked note and the ⓘ close each other. Home had a note
 * of its own in the same spot, for a mode the kind did not have yet, and the two
 * sides closed each other's (homeNoteOpen / onNote, 2026-10-14). It went when
 * killer got Survival, the last such mode, the same day (Diary 132).
 */
export function RivalModeChips({ selectedMode, selectedLevel, onChange, variant = 'classic' }) {
  const { t } = useTranslation();
  const [rivalMode, setRivalMode] = useState('standard');
  const [lockedToast, setLockedToast] = useState(null);
  const [showRivalInfo, setShowRivalInfo] = useState(false);

  // Survival races the clock already; a second pace to chase is one clock too
  // many, so both rivals are off there whatever record exists.
  const isTimeLimit = selectedMode === 'timeLimit';
  const ghost = getGhostForModeLevel(isTimeLimit ? 'timeAttack' : selectedMode, selectedLevel, variant);
  const isGhostAvailable = Boolean(ghost && typeof ghost.bestSeconds === 'number' && ghost.bestSeconds > 0);
  const canSelectGhost = !isTimeLimit && isGhostAvailable;
  const effectiveRivalMode = canSelectGhost ? rivalMode : 'standard';

  // The parent has to follow even when nothing was clicked. Pick Ghost in
  // Classic, switch the tab to Survival, and the effective mode becomes Standard
  // on its own — without this the parent would still start the game as Ghost.
  useEffect(() => {
    if (onChange) onChange(effectiveRivalMode);
  }, [effectiveRivalMode, onChange]);

  const formatSecs = (s) => {
    if (!s) return '00:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  const ghostTimeDisplay = canSelectGhost ? formatSecs(ghost.bestSeconds) : '--:--';

  const pick = (mode) => {
    soundHaptic.playSelectSound();
    setRivalMode(mode);
    setLockedToast(null);
    if (onChange) onChange(mode === 'standard' || canSelectGhost ? mode : 'standard');
  };

  /**
   * Say WHY the chip is off, not just that it is.
   *
   * Both reasons showed the same line — "clear this difficulty once to unlock" —
   * so in Survival, where these are off by design, the game told the player to go
   * and earn something that was never coming (user report, 2026-09-26).
   */
  const triggerLockedToast = () => {
    soundHaptic.playErrorSound();
    setShowRivalInfo(false);
    setLockedToast(t(isTimeLimit ? 'home.rivalModes.timeLimitToast' : 'home.rivalModes.lockedToast'));
  };

  const lockedChip = (mode, label) => (
    <button type="button"
      className={`rival-chip ${mode}-chip ${effectiveRivalMode === mode ? 'active' : ''} ${!canSelectGhost ? 'disabled' : ''}`}
      onClick={() => {
        if (!canSelectGhost) {
          triggerLockedToast();
          return;
        }
        pick(mode);
      }}
    >
      <span>{label}</span>
      {!canSelectGhost && <Lock size={10} className="lock-icon" />}
    </button>
  );

  return (
    <>
      <div className="rival-mode-chip-group">
        {/* Standard, with the explainer beside it. Ghost and Time Gap differ in
            one way that decides everything — Ghost deals the puzzle the record
            was set on, Time Gap deals a new one — and nothing on the chips said
            so. The ⓘ sits with the group so its scope is obvious. */}
        <div className="rival-top-row">
          <button type="button"
            className={`rival-chip standard-chip ${effectiveRivalMode === 'standard' ? 'active' : ''}`}
            onClick={() => pick('standard')}
          >
            <span>{t('home.rivalModes.standard')}</span>
          </button>

          <button type="button"
            className={`rival-info-btn ${showRivalInfo ? 'active' : ''}`}
            aria-label={t('home.rivalModes.infoAria')}
            aria-expanded={showRivalInfo}
            onClick={() => {
              soundHaptic.playSelectSound();
              setLockedToast(null);
              setShowRivalInfo(!showRivalInfo);
            }}
          >
            <Info size={15} />
          </button>
        </div>

        <div className="rival-bottom-chips">
          {lockedChip('ghost', `${t('home.rivalModes.ghost')} (${ghostTimeDisplay})`)}
          {lockedChip('delta', t('home.rivalModes.delta'))}
        </div>
      </div>

      {/* What the two modes actually differ in. Closed by the ⓘ again, the popup
          itself, or its close button — the same three ways the locked one closes. */}
      {showRivalInfo && (
        <div className="locked-mode-popup rival-info-popup" role="dialog"
             aria-label={t('home.rivalModes.infoAria')}
             onClick={() => setShowRivalInfo(false)}>
          <div className="rival-info-lines">
            <p className="rival-info-line">
              <span className="rival-info-name">{t('home.rivalModes.ghost')}</span>
              <span className="rival-info-desc">{t('home.rivalModes.infoGhost')}</span>
            </p>
            <p className="rival-info-line">
              <span className="rival-info-name">{t('home.rivalModes.delta')}</span>
              <span className="rival-info-desc">{t('home.rivalModes.infoDelta')}</span>
            </p>
          </div>
          <button type="button" className="locked-popup-close-btn"
            onClick={(e) => { e.stopPropagation(); setShowRivalInfo(false); }}
            aria-label={t('common.close')}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Stays until dismissed. An auto-dismissing explanation is one the player
          can miss entirely (gate 2-6 forbids the setTimeout). */}
      {lockedToast && (
        <div className="locked-mode-popup" role="alert" onClick={() => setLockedToast(null)}>
          <Lock size={12} className="locked-popup-icon" />
          <span className="locked-popup-text">{lockedToast}</span>
          <button type="button" className="locked-popup-close-btn"
            onClick={(e) => { e.stopPropagation(); setLockedToast(null); }}
            aria-label={t('common.close')}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </>
  );
}
