/**
 * i18nReach.js — "does the text that reaches the screen still make sense?"
 *
 * The L10N gate asks whether every locale has every key. That is completeness,
 * and it passes happily while the screen shows nonsense:
 *
 *   unresolvedPlaceholders  the string says `{price}` and the call site passes
 *                           no price, so the player reads a literal `{price}`.
 *                           Live in closed testing right now, in all thirteen
 *                           languages: `영구 제거하기 ({price})`.
 *
 *   orphanI18nKeys          a key translated into thirteen languages that no
 *                           code asks for — the fossil of a button that was
 *                           never built ("Play 게임즈 전체 순위 보기").
 *
 * A key counts as reached three ways, and all three had to be handled before
 * this check was worth reading: a literal `t('a.b')`; a template such as
 * `t(\`levels.${lvl}\`)` that reaches a whole family; and a plain string
 * `'achievements.first_win.title'` sitting in a data file, because achievements
 * are rendered with `t(ach.titleKey)` and the key never appears next to a `t(`.
 */

import { isAllowed } from '../allowlist.js';
import { translationCalls } from '../parse.js';

/** Every leaf key path in a locale file, e.g. removeAds.purchaseBtn */
function leafKeys(raw) {
  const out = new Map();
  const stack = [];
  for (const line of raw.split('\n')) {
    const inline = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*\{(.+)\}\s*,?\s*$/);
    if (inline) {
      for (const m of inline[2].matchAll(/([A-Za-z0-9_-]+)\s*:\s*'((?:[^'\\]|\\.)*)'/g)) {
        out.set([...stack, inline[1], m[1]].join('.'), m[2]);
      }
      continue;
    }
    const open = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*\{\s*$/);
    if (open) { stack.push(open[1]); continue; }
    if (/^\s*\}[,;]?\s*$/.test(line)) { stack.pop(); continue; }
    for (const m of line.matchAll(/([A-Za-z0-9_-]+)\s*:\s*'((?:[^'\\]|\\.)*)'/g)) {
      out.set([...stack, m[1]].join('.'), m[2]);
    }
  }
  return out;
}

export function scanI18nReach(index) {
  const findings = [];

  const literalSites = new Map(); // key -> [{file, params}]
  const patterns = [];
  let dynamicCalls = 0;

  for (const [file, { code }] of index.app) {
    for (const call of translationCalls(code)) {
      if (call.type === 'literal') {
        if (!literalSites.has(call.key)) literalSites.set(call.key, []);
        literalSites.get(call.key).push({ file, params: call.params });
      } else if (call.type === 'pattern') {
        patterns.push(new RegExp(call.pattern));
      } else {
        dynamicCalls++;
      }
    }
  }

  // A dotted string anywhere in app code is a key reference too — that is how
  // achievements name theirs, in a data file rather than at the call site.
  const stringKeys = new Set();
  for (const [, { code }] of index.app) {
    for (const m of code.matchAll(/'([A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_-]+)+)'/g)) {
      stringKeys.add(m[1]);
    }
  }

  const en = new Map();
  for (const f of [...index.locales.keys()].filter((f) => f.startsWith('src/i18n/locales/en/'))) {
    for (const [k, v] of leafKeys(index.locales.get(f))) en.set(k, v);
  }

  for (const [key, value] of en) {
    const sites = literalSites.get(key);
    const reached = Boolean(sites) || stringKeys.has(key) || patterns.some((p) => p.test(key));

    if (!reached) {
      if (isAllowed('orphanI18nKeys', key)) continue;
      findings.push({
        severity: 'SUSPECT',
        kind: 'orphanI18nKeys',
        where: key,
        detail: `13개 언어에 번역돼 있는데 부르는 곳이 없음 — "${value.slice(0, 48)}"`
      });
      continue;
    }

    const placeholders = [...value.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]);
    if (!placeholders.length || !sites) continue;
    if (isAllowed('unresolvedPlaceholders', key)) continue;

    for (const site of sites) {
      const missing = placeholders.filter((p) => !site.params.includes(p));
      if (!missing.length) continue;
      findings.push({
        severity: 'CONFIRMED',
        kind: 'unresolvedPlaceholders',
        where: `${site.file} -> t('${key}')`,
        detail: `{${missing.join('}, {')}} 를 안 넘김 — 화면에 "${value}" 가 그대로 찍힘`
      });
    }
  }

  if (dynamicCalls) {
    findings.push({
      severity: 'NOTE',
      kind: 'orphanI18nKeys',
      where: `t(<변수>) 형태 호출 ${dynamicCalls}건`,
      detail: '키를 정적으로 알 수 없어 고아 키 판정이 완전하지 않음 — 위 목록은 참고용'
    });
  }

  return findings;
}
