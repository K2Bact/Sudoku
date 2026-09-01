# Multilingual Zero-Layout-Shift & Auto-Equalizing UI Rules

## 1. Core Principle
When developing UI cards, info badges, or description boxes where text changes dynamically based on user selection (tabs, chips, levels, dates, tiers), the height of the container MUST remain 100% stable (Delta Height = 0px) within the active language.

## 2. Dynamic Auto-Equalizer Pattern (Grid Stack)
For dynamic option switching (e.g. AIBattleScreen.jsx Lv.1~Lv.5 chips):
- Use the CSS Grid Stack pattern (grid-area: 1 / 1) containing all option descriptions in the active language.
- This allows the browser to automatically measure the longest option in ANY language (whether Korean 2 lines, Spanish 2 lines, Vietnamese 3 lines, or German 4 lines).
- The container naturally and dynamically sizes to the maximum height for that specific language.
- Switching options only toggles visibility/opacity and NEVER causes Cumulative Layout Shift (CLS).

## 3. Mandatory Word-Break & Overflow Safeguards
All text containers in multilingual cards MUST include:
word-break: keep-all;        /* Natural word wrapping for CJK (KO, JA, ZH) */
overflow-wrap: break-word;   /* Prevents overflow for long Western words (EN, ES, DE, FR) */
box-sizing: border-box;      /* Stable container box model */

## 4. Bottom Action Buttons Protection
- All primary call-to-action buttons below dynamic description boxes must have flex-shrink: 0; to guarantee they are never distorted, squished, or clipped when longer languages are selected.

## 5. Adding New Foreign Languages Workflow
When adding a new language (e.g., Vietnamese, German, French, Arabic):
1. Complete the full translation dictionary in src/i18n/locales/<lang>/.
2. Run npm run qa (Playwright automated UI scanner).
3. Verify that all dynamic chips and tabs maintain Delta Height = 0px across all mobile viewports (360x800px+).
