/**
 * bidi.js — solver notation kept readable inside right-to-left text.
 *
 * Practice guides open with the solver's own notation and then explain it:
 * "Pointing 1: r5c9,r6c9 => r1c9<>1, r3c9<>1. يحذف هذا النمط 1 …". In an
 * Arabic paragraph the notation's closing period has no direction of its own,
 * so it settles on the Arabic side and is drawn at the front of the notation
 * (ChatGPT Saudi review SA-RTL02, 2026-10-01). Isolating the notation as one
 * left-to-right run keeps it as written. Nothing changes for left-to-right
 * languages: the run already reads that way.
 */

// ASCII from the start, up to the first period that is followed by a space and
// then text that is not ASCII — the notation, and only when prose follows it.
const LEADING_NOTATION = /^([\x20-\x7e]+?\.)(\s+)(?=[^\x00-\x7f])/;

/** [notation, gap, rest] when the text opens with notation before prose, else null. */
export function splitLeadingNotation(text) {
  if (typeof text !== 'string') return null;
  const m = text.match(LEADING_NOTATION);
  return m ? [m[1], m[2], text.slice(m[0].length)] : null;
}

// A lesson badge ends with its stage number: "متوسط 2-1". After an Arabic word
// the digits count as Arabic numbers, and a hyphen does not join Arabic numbers
// the way it joins Western ones, so "2-1" was drawn "1-2" (SA-RTL01).
const TRAILING_ID = /^(.*\S)(\s+)(\d+(?:-\d+)+)$/;

/** [label, gap, id] when the text ends with a stage number like 2-1, else null. */
export function splitTrailingId(text) {
  if (typeof text !== 'string') return null;
  const m = text.match(TRAILING_ID);
  return m ? [m[1], m[2], m[3]] : null;
}
