/**
 * deadCode.js — "did the player who signed up actually turn up?"
 *
 * Two questions the gates never ask, because a gate is handed a feature and
 * checks whether it clears the bar. Neither of these is about clearing a bar.
 *
 *   unusedExports    something is exported and nothing anywhere calls it
 *   unreadHookValues a hook computes and returns a value no consumer reads
 *
 * Both shipped in this project. `admobService.showRewardedAd` and
 * `showInterstitialAd` had zero callers while four ad placements each ran their
 * own setTimeout, so the whole ad service was decoration. `canMatchRealPlayers`
 * — the one flag standing between the UI and advertising opponents it cannot
 * reach — is returned by useBattleMultiplayer and destructured by nobody.
 *
 * Neither is a broken function. Both are functions nobody invited to the game.
 */

import { referencesTo } from '../sourceIndex.js';
import { isAllowed } from '../allowlist.js';

function exportedNames(code) {
  const names = new Set();
  for (const m of code.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)) names.add(m[1]);
  for (const m of code.matchAll(/export\s+const\s+([A-Za-z0-9_]+)/g)) names.add(m[1]);
  for (const m of code.matchAll(/export\s+class\s+([A-Za-z0-9_]+)/g)) names.add(m[1]);
  return [...names];
}

/** Keys of the object a hook hands back, from its final `return { ... }`. */
function returnedKeys(code) {
  const start = code.lastIndexOf('return {');
  if (start < 0) return [];
  let depth = 0;
  let end = -1;
  for (let i = start + 'return '.length; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end < 0) return [];

  const body = code.slice(start + 'return {'.length, end);
  const keys = [];
  let level = 0;
  let token = '';
  const push = () => {
    const name = token.split(':')[0].trim().replace(/^\.\.\./, '');
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) keys.push(name);
    token = '';
  };
  for (const ch of body) {
    if ('{(['.includes(ch)) level++;
    else if ('})]'.includes(ch)) level--;
    if (ch === ',' && level === 0) push();
    else token += ch;
  }
  push();
  return keys;
}

export function scanDeadCode(index) {
  const findings = [];

  // ── exported, and nobody calls it ────────────────────────────────────────
  for (const [file, { code }] of index.app) {
    for (const name of exportedNames(code)) {
      if (isAllowed('unusedExports', name)) continue;
      const { app, tests } = referencesTo(name, index, file);
      if (app.length) continue;
      findings.push({
        severity: tests.length ? 'SUSPECT' : 'SUSPECT',
        kind: 'unusedExports',
        where: `${file} -> ${name}`,
        // The wording matters. This check only knows that nothing OUTSIDE the
        // file references the name — the module may well call it on every
        // frame. Reading "unused" as "deletable" cost a broken daily-challenge
        // gate: getUserSkillTier had no outside consumer and one inside caller.
        // The fix for most of these is to drop `export`, not the function.
        detail: (tests.length
          ? `파일 밖에서는 테스트(${tests[0]})만 씀`
          : '파일 밖에서 아무도 안 씀') +
          ' — 같은 파일 안에서는 쓰일 수 있다. 보통 함수를 지우는 게 아니라 export 를 떼는 것이 답이다.'
      });
    }
  }

  // ── a hook returns it, no consumer destructures it ───────────────────────
  for (const [file, { code }] of index.app) {
    const hook = file.match(/\/(use[A-Z][A-Za-z0-9_]*)\.js$/);
    if (!hook) continue;
    const hookName = hook[1];
    const consumers = [...index.app.entries()]
      .filter(([f, v]) => f !== file && new RegExp(`\\b${hookName}\\s*\\(`).test(v.code))
      .map(([f]) => f);
    if (!consumers.length) continue;

    // The result may be handed on whole rather than picked apart: App.jsx does
    // `const gameProps = useGameProps(...)`, passes `gameProps={gameProps}` to
    // the router, and the router spreads it into the screen. Every key is read,
    // just not in the file that called the hook — so the search has to follow
    // the variable across files. Reporting these would bury the handful that
    // are genuinely dropped under sixty that are not, and a scan nobody finishes
    // reading is a scan nobody reads.
    const carriedWhole = consumers.some((f) => {
      const m = index.app.get(f).code.match(
        new RegExp(`const\\s+([A-Za-z0-9_]+)\\s*=\\s*${hookName}\\s*\\(`)
      );
      if (!m) return false;
      const v = m[1];
      const spread = new RegExp(`\\{\\s*\\.\\.\\.\\s*${v}\\b`);
      const handedOn = new RegExp(`\\b[A-Za-z0-9_]+=\\{\\s*${v}\\s*\\}`);
      // ...or handed to another function whole, the way App.jsx does
      // `const game = useSudokuGame(...)` then `useGameProps(game, { ... })`.
      const passedAsArg = new RegExp(`\\w\\(\\s*${v}\\s*[,)]`);
      return [...index.app.values()].some(({ code: c }) =>
        spread.test(c) || handedOn.test(c) || passedAsArg.test(c));
    });
    if (carriedWhole) continue;

    for (const key of returnedKeys(code)) {
      if (isAllowed('unreadHookValues', key)) continue;
      const read = consumers.some((f) => new RegExp(`\\b${key}\\b`).test(index.app.get(f).code));
      if (read) continue;
      findings.push({
        severity: 'SUSPECT',
        kind: 'unreadHookValues',
        where: `${file} -> ${hookName}() returns ${key}`,
        detail: `이 훅을 쓰는 ${consumers.join(', ')} 어디서도 ${key} 를 꺼내 쓰지 않음`
      });
    }
  }

  return findings;
}
