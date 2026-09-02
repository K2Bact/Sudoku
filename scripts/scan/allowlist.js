/**
 * allowlist.js
 * Things the scan would flag that are fine, each with the reason it is fine.
 *
 * The reason is not decoration. A bare list of names rots into "whatever was
 * noisy that week", and once a scan cries wolf people stop reading it — which
 * is exactly how the hardcoded-text gate came to report "0 hardcoded strings"
 * while four English literals shipped to thirteen locales. An entry nobody can
 * justify in one line should be deleted from here and fixed in the code.
 *
 * Add an entry ONLY when the finding is genuinely not a defect. Never add one
 * to quiet a finding you have not understood yet.
 */

export const ALLOW = {
  /** Exported symbols with no consumer outside their own file. */
  unusedExports: [
    { name: 'default', reason: 'default re-exports mirror a named export the app already uses' }
  ],

  /** Keys present in every locale that no component reads. */
  orphanI18nKeys: [],

  /** Values a hook returns that nothing destructures. */
  unreadHookValues: [],

  /**
   * Placeholders deliberately left in the string because the caller fills them
   * somewhere the scan cannot see. There should be almost none of these.
   */
  unresolvedPlaceholders: [],

  /** Props passed to a component that it does not declare. */
  propMismatches: [
    { name: 'children', reason: 'React passes children implicitly; components need not declare it' },
    { name: 'key', reason: 'React list identity, never reaches the component' },
    { name: 'ref', reason: 'forwarded by React, not a normal prop' },
    { name: 'className', reason: 'commonly spread onto a root element' },
    { name: 'style', reason: 'commonly spread onto a root element' }
  ]
};

export function isAllowed(kind, name) {
  return (ALLOW[kind] || []).some((e) => e.name === name);
}

export function reasonFor(kind, name) {
  const hit = (ALLOW[kind] || []).find((e) => e.name === name);
  return hit ? hit.reason : null;
}
