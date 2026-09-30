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

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { isAllowed } from '../allowlist.js';
import { translationCalls } from '../parse.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Every leaf key of the English dictionary, as the app loads it.
 *
 * This used to read the locale files as text, matching `key: 'value'`. Files
 * written with double quotes (`"ahead": "{time} ahead"`) matched nothing, so it
 * saw 411 of 465 strings and 42 of the 49 that carry a placeholder — the other
 * seven were never checked, and a clean result said nothing about them (external
 * audit V10 follow-up, 2026-09-30). The object the app imports has no quoting
 * to get wrong.
 */
async function englishLeaves() {
  const { default: en } = await import(pathToFileURL(path.join(ROOT, 'src/i18n/locales/en.js')).href);
  const out = new Map();
  const walk = (node, prefix) => {
    for (const [k, v] of Object.entries(node)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
      else if (typeof v === 'string') out.set(key, v);
    }
  };
  walk(en, '');
  return out;
}

const EN = await englishLeaves();

export function scanI18nReach(index) {
  const findings = [];

  const literalSites = new Map(); // key -> [{file, params, paramsKnown}]
  const patterns = [];
  let dynamicCalls = 0;

  for (const [file, { code }] of index.app) {
    for (const call of translationCalls(code)) {
      if (call.type === 'literal') {
        if (!literalSites.has(call.key)) literalSites.set(call.key, []);
        literalSites.get(call.key).push({ file, params: call.params, paramsKnown: call.paramsKnown });
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
    for (const m of code.matchAll(/(['"])([A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_-]+)+)\1/g)) {
      stringKeys.add(m[2]);
    }
  }

  const en = EN;

  for (const [key, value] of en) {
    const sites = literalSites.get(key);
    const reached = Boolean(sites) || stringKeys.has(key) || patterns.some((p) => p.test(key));

    if (!reached) {
      if (isAllowed('orphanI18nKeys', key)) continue;
      findings.push({
        // Inventory, not a defect. An unreferenced string costs a few bytes and
        // may be wanted the moment its feature is built — the billing copy below
        // is waiting on exactly that. Filing these next to a prop nobody
        // receives would bury the things that are actually broken.
        severity: 'NOTE',
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
      // `t(key, params)` passes whatever `params` holds. Reading that as "passed
      // nothing" filed a CONFIRMED defect for a call that may be fine (external
      // audit V10). What cannot be read is said so, one step down.
      if (!site.paramsKnown) {
        findings.push({
          severity: 'SUSPECT',
          kind: 'unresolvedPlaceholders',
          where: `${site.file} -> t('${key}', <변수>)`,
          detail: `params 를 변수로 넘겨 {${placeholders.join('}, {')}} 가 들어가는지 읽을 수 없음 — 직접 확인`
        });
        continue;
      }
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
