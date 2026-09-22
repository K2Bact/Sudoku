// Turn a pick (our own puzzle + finding) into app cells, a step line and highlights.
import { digits, bit, rc, pop } from './core.mjs';

const BLUE = { background: 'rgba(59, 130, 246, 0.28)' };
const YELLOW = { background: 'rgba(234, 179, 8, 0.3)' };
const set = (xs) => `{${xs.join(',')}}`;
const cellsTxt = (xs) => xs.map(rc).join(',');
const delTxt = (dels) => {
  const by = new Map();
  for (const [i, d] of dels) (by.get(i) || by.set(i, []).get(i)).push(d);
  return [...by].map(([i, ds]) => `${rc(i)}<>${ds.join('')}`).join(', ');
};

export function describe(p) {
  const { f, state: s } = p;
  const cand = (i) => digits(s.cand[i]);
  const blue = new Set(), yellow = new Set();
  let noteColors = null;
  let step;
  const t = p.tech;
  if (t === 'Pointing') {
    f.pattern.forEach((i) => blue.add(i));
    step = `Pointing ${f.digit}: ${cellsTxt(f.pattern)} => ${delTxt(f.dels)}`;
  } else if (/Wing$|Jellyfish|Swordfish/.test(t) && f.pattern && f.digit && !f.wings && !f.link) {
    f.pattern.forEach((i) => blue.add(i)); (f.fins || []).forEach((i) => yellow.add(i));
    step = `${t} ${f.digit}: ${cellsTxt(f.pattern)}${f.fins ? ` + ${cellsTxt(f.fins)}` : ''} => ${delTxt(f.dels)}`;
  } else if (t === 'XY-Wing' || t === 'XYZ-Wing' || t === 'WXYZ-Wing') {
    f.pattern.forEach((i) => blue.add(i)); f.wings.forEach((i) => yellow.add(i));
    step = `${t}: ${f.pattern.map((i) => rc(i) + set(cand(i))).join(' ')} + ${f.wings.map((i) => rc(i) + set(cand(i))).join(' ')} => ${delTxt(f.dels)}`;
  } else if (t === 'W-Wing') {
    f.pattern.forEach((i) => blue.add(i)); f.link.forEach((i) => yellow.add(i));
    step = `W-Wing: ${cellsTxt(f.pattern)} ${set(cand(f.pattern[0]))} + ${f.linkDigit}: ${f.link.map(rc).join('=')} => ${delTxt(f.dels)}`;
  } else if (t === 'Remote Pair') {
    f.pattern.forEach((i) => (f.colour[i] === 0 ? blue : yellow).add(i));
    step = `Remote Pair ${set(cand(f.pattern[0]))}: ${cellsTxt(f.pattern)} => ${delTxt(f.dels)}`;
  } else if (t === 'Simple Colors') {
    f.pattern.forEach((i) => (f.colour[i] === 0 ? blue : yellow).add(i));
    step = `Simple Coloring ${f.digit}: (${cellsTxt(f.pattern.filter((i) => f.colour[i] === 0))}) / (${cellsTxt(f.pattern.filter((i) => f.colour[i] === 1))}) => ${delTxt(f.dels)}`;
  } else if (t === 'Unique Rectangle Type 1') {
    f.pattern.forEach((i) => blue.add(i));
    step = `Unique Rectangle Type 1 ${set(cand(f.pattern[0]))}: ${cellsTxt([...f.pattern, f.target])} => ${delTxt(f.dels)}`;
  } else if (t === 'BUG+1') {
    step = `BUG+1 => ${rc(f.place[0])}=${f.place[1]}`;
  } else if (t === 'Empty Rectangle') {
    f.pattern.forEach((i) => blue.add(i)); f.link.forEach((i) => yellow.add(i));
    step = `Empty Rectangle ${f.digit}: ${cellsTxt(f.pattern)} + ${f.link.map(rc).join('=')} => ${delTxt(f.dels)}`;
  } else if (t === 'ALS-XZ') {
    f.A.forEach((i) => blue.add(i)); f.B.forEach((i) => yellow.add(i));
    step = `ALS-XZ: A=${cellsTxt(f.A)}, B=${cellsTxt(f.B)}, X=${f.X}, Z=${f.digit} => ${delTxt(f.dels)}`;
  } else if (t === '3D Medusa') {
    noteColors = new Map();
    for (const k of f.comp) noteColors.set(k, f.colour[k] === 0 ? 'a' : 'b');
    step = `3D Medusa => ${delTxt(f.dels.filter(([i]) => i === p.tg.t))}`;
  } else if (t === 'Forcing Chain') {
    blue.add(f.source);
    step = `Forcing Chain: ${rc(f.source)}${set(cand(f.source))} => ${rc(f.place[0])}=${f.place[1]}`;
  } else if (t === 'XY-Chain') {
    f.pattern.forEach((i) => blue.add(i)); [f.pattern[0], f.pattern[f.pattern.length - 1]].forEach((i) => yellow.add(i));
    step = `XY-Chain ${f.digit}: ${f.pattern.map((i) => rc(i) + set(cand(i))).join(' - ')} => ${delTxt(f.dels)}`;
  } else if (t === 'AIC') {
    // strong-link partners alternate: the chain's "true" nodes in colour a, "false" in b
    noteColors = new Map();
    f.nodes.forEach((k, idx) => noteColors.set(k, idx % 2 === 0 ? 'b' : 'a'));
    noteColors.set(f.nodes[0], 'a');
    const nodeTxt = (k) => `${rc(Math.floor(k / 10))}(${k % 10})`;
    step = `AIC ${f.digit}: ${f.nodes.map(nodeTxt).join(' ')} => ${delTxt(f.dels)}`;
  } else if (t === 'Junior Exocet') {
    f.base.forEach((i) => blue.add(i)); f.targets.forEach((i) => yellow.add(i));
    step = `Junior Exocet ${set(f.digits)}: ${cellsTxt(f.base)} → ${cellsTxt(f.targets)} => ${delTxt(f.dels)}`;
  }

  const tg = p.tg;
  const delMap = new Map();
  for (const [i, d] of f.dels) (delMap.get(i) || delMap.set(i, []).get(i)).push(d);
  const digitOfStep = f.digit || null;
  const cells = s.val.map((v, i) => {
    if (v) return { val: v };
    const c = { notes: digits(s.cand[i]) };
    const ds = delMap.get(i) || [];
    if (i === tg.t) {
      c.type = 'target';
      if (tg.type === 'answer') { c.eliminatedNotes = ds; c.notes = c.notes.filter((d) => !ds.includes(d)); c.highlightNotes = [tg.correct]; }
      else if (tg.type === 'place') { c.eliminatedNotes = c.notes.filter((d) => d !== tg.correct); c.notes = [tg.correct]; c.highlightNotes = [tg.correct]; }
      else c.highlightNotes = [];
    } else if (ds.length && tg.type !== 'eliminated') { c.eliminatedNotes = ds; c.notes = c.notes.filter((d) => !ds.includes(d)); }
    if (blue.has(i)) c.style = BLUE;
    if (yellow.has(i)) c.style = YELLOW;
    if (digitOfStep && (blue.has(i) || yellow.has(i)) && i !== tg.t && (s.cand[i] & bit(digitOfStep))) c.highlightNotes = [digitOfStep];
    if (noteColors) {
      const nc = {};
      for (const d of digits(s.cand[i])) { const col = noteColors.get(i * 10 + d); if (col && !(i === tg.t && tg.type === 'eliminated' && d === tg.correct)) nc[d] = col; }
      if (Object.keys(nc).length) c.noteColors = nc;
    }
    return c;
  });
  return { cells, step, targetIndex: tg.t, correctVal: tg.correct, type: tg.type, dels: (delMap.get(tg.t) || []).join(', ') };
}
void pop;
