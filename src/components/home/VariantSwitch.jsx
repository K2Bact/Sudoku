import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { VARIANTS } from '../../engine/variants';
import { soundHaptic } from '../../utils/soundHaptic';
import { useTranslation } from '../../i18n/i18nContext';
import { RulesModal } from './RulesModal';

// Each kind's name, written out so every key is findable (gate 2-15).
const NAME_KEY = { classic: 'variants.classic', killer: 'variants.killer' };

/**
 * VariantSwitch — which kind of puzzle the home card starts: standard or killer.
 *
 * It sits at the top of the card because it decides what the rest of the card
 * offers (engine/variants.js). Named "standard", not "classic": Classic is
 * already the name of a mode, and "Classic killer" would read as a contradiction.
 *
 * The ⓘ beside it shows the rules of the selected kind, and is there for both:
 * shown for killer only, the switch changed width when the kind changed and
 * the card jumped (user, 2026-10-01).
 */
export function VariantSwitch({ variant, onChange }) {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);
  return (
    <>
      <div className="variant-switch-row">
        <div className="variant-switch" role="radiogroup" aria-label={t('variants.switchLabel')}>
          {VARIANTS.map(({ id }) => (
            <button key={id} type="button" role="radio" aria-checked={variant === id}
              className={`variant-option ${variant === id ? 'active' : ''}`}
              data-variant={id}
              onClick={() => {
                soundHaptic.playSelectSound();
                onChange(id);
              }}
            >
              {t(NAME_KEY[id])}
            </button>
          ))}
        </div>
        <button type="button" className="rival-info-btn variant-rules-btn"
          aria-label={variant === 'killer' ? t('killer.rules.title') : t('variants.classicRules.title')}
          onClick={() => {
            soundHaptic.playSelectSound();
            setShowRules(true);
          }}
        >
          <Info size={15} />
        </button>
      </div>
      {showRules && <RulesModal variant={variant} onClose={() => setShowRules(false)} />}
    </>
  );
}
