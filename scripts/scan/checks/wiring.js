/**
 * wiring.js — "are the two ends actually joined?"
 *
 * Both halves of a connection can be correct on their own and still not meet.
 * Nothing type-checks here, so a mismatch is invisible until someone presses
 * the button. These are the joins that broke in this project:
 *
 *   unsuppliedCallbacks  RemoveAdsScreen destructured `onAdsRemovedPurchased`;
 *                        the router passed `onPurchaseSuccess`. The component
 *                        then CALLED the undefined prop, inside a setTimeout
 *                        where no error boundary catches it — so the purchase
 *                        was recorded and then the success message and the
 *                        navigation never ran. The player "bought" something
 *                        and was left sitting on the screen with no feedback.
 *
 *   missingMethods       the same file called `admobService.setAdsRemoved(true)`,
 *                        a method the class never defined — a second landmine
 *                        directly behind the first.
 *
 *   unusedProps          a prop handed to a component that does not declare it.
 *                        Harmless on its own, which is why it is only SUSPECT:
 *                        the value is ignored, nothing throws. It matters as a
 *                        smell — usually one half of a rename that stopped
 *                        halfway, and the other half is the dangerous one.
 *
 * The asymmetry is the point. An EXTRA prop is ignored; a MISSING one that gets
 * called is a guaranteed crash. Reporting both at the same severity would bury
 * the second under the first.
 */

import { isAllowed } from '../allowlist.js';
import { matchBracket, objectEntries, jsxOpenTag } from '../parse.js';

/** Components defined as `export function Name({ ... })`, with their props. */
function declaredProps(index) {
  const map = new Map();
  for (const [file, { code }] of index.app) {
    for (const m of code.matchAll(/export\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)) {
      const open = m.index + m[0].length - 1;
      const close = matchBracket(code, open);
      if (close < 0) continue;
      const args = code.slice(open + 1, close).trim();
      if (!args.startsWith('{')) continue;
      const inner = matchBracket(args, 0);
      if (inner < 0) continue;
      // `icon: Icon` is passed as `icon`; the alias is only a local name.
      map.set(m[1], { file, code, entries: objectEntries(args.slice(1, inner)) });
    }
  }
  return map;
}

/** Every place a component is rendered, and what it was handed. */
function renderSites(index, components) {
  const sites = new Map();
  for (const name of components.keys()) sites.set(name, []);
  for (const [file, { code }] of index.app) {
    for (const m of code.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)) {
      if (!sites.has(m[1])) continue;
      if (components.get(m[1]).file === file) continue;
      const tag = jsxOpenTag(code, m.index);
      if (tag === null) continue;
      const attrs = tag.slice(m[0].length);
      sites.get(m[1]).push({
        file,
        spread: /\{\s*\.\.\./.test(attrs),
        props: [...attrs.matchAll(/(?:^|\s)([a-zA-Z][A-Za-z0-9_]*)\s*=/g)].map((p) => p[1])
      });
    }
  }
  return sites;
}

/** Classes and the methods they define, keyed by the singleton they export. */
function serviceMethods(index) {
  const map = new Map();
  for (const [file, { code }] of index.app) {
    const cls = code.match(/class\s+([A-Za-z0-9_]+)\s*\{/);
    const singleton = code.match(/export\s+const\s+([A-Za-z0-9_]+)\s*=\s*new\s+([A-Za-z0-9_]+)\s*\(/);
    if (!cls || !singleton || singleton[2] !== cls[1]) continue;
    const methods = new Set();
    for (const m of code.matchAll(/^\s{2}(?:async\s+|get\s+|set\s+)?([a-zA-Z_][A-Za-z0-9_]*)\s*\(/gm)) methods.add(m[1]);
    for (const m of code.matchAll(/^\s{2}([a-zA-Z_][A-Za-z0-9_]*)\s*=/gm)) methods.add(m[1]);
    map.set(singleton[1], { file, methods });
  }
  return map;
}

export function scanWiring(index) {
  const findings = [];
  const components = declaredProps(index);
  const sites = renderSites(index, components);

  for (const [name, comp] of components) {
    const rendered = sites.get(name) || [];
    if (!rendered.length) continue;
    const visible = rendered.filter((s) => !s.spread);
    const supplied = new Set(visible.flatMap((s) => s.props));

    // ── declared, never supplied, and then called ─────────────────────────
    if (visible.length) {
      const parents = visible.map((s) => s.file).join(', ');
      for (const { name: prop, hasDefault } of comp.entries) {
        if (hasDefault || supplied.has(prop)) continue;
        if (!new RegExp(`\\b${prop}\\s*(\\?\\.)?\\(`).test(comp.code)) continue;

        // `if (onX) onX()` and `onX?.()` survive a missing prop; they just do
        // nothing. That is not a crash, but it is not harmless either: the
        // branch can never run, so whatever it was for silently does not
        // happen. A crash gets found; a branch that quietly no-ops does not.
        const guarded = new RegExp(
          `if\\s*\\(\\s*${prop}\\s*\\)|${prop}\\s*&&|${prop}\\s*\\?\\.\\(`
        ).test(comp.code);

        findings.push(guarded
          ? {
            severity: 'SUSPECT',
            kind: 'deadCallbackBranch',
            where: `${comp.file} -> <${name}> 의 ${prop}`,
            detail: `${parents} 어디서도 ${prop} 를 안 넘김 — 가드가 있어 터지진 않지만 ` +
                    `그 분기는 영원히 실행되지 않음`
          }
          : {
            severity: 'CONFIRMED',
            kind: 'unsuppliedCallbacks',
            where: `${comp.file} -> <${name}> 의 ${prop}`,
            detail: `${parents} 어디서도 ${prop} 를 안 넘기는데 가드 없이 ${prop}() 로 ` +
                    `호출함 — 그 경로가 실행되면 TypeError`
          });
      }
    }

    // ── supplied, never declared ──────────────────────────────────────────
    const declared = new Set(comp.entries.map((e) => e.name));
    for (const site of visible) {
      for (const prop of site.props) {
        if (isAllowed('propMismatches', prop) || declared.has(prop)) continue;
        findings.push({
          severity: 'SUSPECT',
          kind: 'unusedProps',
          where: `${site.file} -> <${name} ${prop}={...}>`,
          detail: `${comp.file} 의 ${name} 은 ${prop} 를 선언하지 않음 — 값이 그냥 버려짐`
        });
      }
    }
  }

  // ── methods called on a service that does not define them ────────────────
  const services = serviceMethods(index);
  for (const [file, { code }] of index.app) {
    for (const [name, svc] of services) {
      if (svc.file === file) continue;
      for (const m of code.matchAll(new RegExp(`\\b${name}\\.([a-zA-Z_][A-Za-z0-9_]*)\\s*\\(`, 'g'))) {
        if (svc.methods.has(m[1])) continue;
        findings.push({
          severity: 'CONFIRMED',
          kind: 'missingMethods',
          where: `${file} -> ${name}.${m[1]}()`,
          detail: `${svc.file} 에 ${m[1]} 이 정의돼 있지 않음 — 호출 시 TypeError`
        });
      }
    }
  }

  return findings;
}
