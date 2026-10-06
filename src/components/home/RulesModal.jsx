import React from 'react';
import { useTranslation } from '../../i18n/i18nContext';

// What each kind of puzzle asks of the player. Keys are written out so every
// one is findable (gate 2-15).
const RULES = {
  classic: {
    title: 'variants.classicRules.title',
    lines: ['variants.classicRules.grid', 'variants.classicRules.givens', 'variants.classicRules.unique'],
    example: null,
  },
  killer: {
    title: 'killer.rules.title',
    lines: ['killer.rules.sudoku', 'killer.rules.sum', 'killer.rules.noRepeat'],
    example: 'killer.rules.example',
  },
};

/**
 * RulesModal — the rules of a puzzle kind, in three lines.
 *
 * Opened by the ⓘ beside the puzzle switch, for whichever kind is selected —
 * the ⓘ is there for both, so the switch keeps one shape whatever is chosen.
 * Also shown before the first killer a player starts: a player who has only
 * played standard sudoku sees dashed cages and small numbers and has no way
 * to guess that the numbers are sums.
 *
 * onStart: given on that first start, so the button starts the game; without
 * it the button only closes.
 */
export function RulesModal({ variant = 'classic', onClose, onStart }) {
  const { t } = useTranslation();
  const rules = RULES[variant] || RULES.classic;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card variant-rules-card" data-variant={variant} role="dialog" aria-label={t(rules.title)}
           onClick={(e) => e.stopPropagation()}>
        <h2>{t(rules.title)}</h2>
        <ol className="variant-rules-list">
          {rules.lines.map((key) => <li key={key}>{t(key)}</li>)}
        </ol>
        {rules.example && <p className="variant-rules-example">{t(rules.example)}</p>}
        <div className="modal-actions-vertical w-100">
          <button type="button" className="btn-modern btn-play-new" onClick={onStart || onClose}>
            <span>{onStart ? t('killer.rules.start') : t('common.close')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
