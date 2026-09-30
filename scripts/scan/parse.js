/**
 * parse.js
 * The small amount of JS-shaped reading the checks need, done once and right.
 *
 * The first version of this scan reported ten broken props and six unresolved
 * placeholders. Exactly one was real. It could not read `icon: Icon` in a
 * destructure, `{ level }` shorthand in a params object, or a params object
 * that spanned more than one line — so it accused nine correct call sites.
 *
 * That is the failure mode a scan has to avoid above all others. A gate that
 * cries wolf gets fixed because it blocks the build; a scan that cries wolf
 * gets ignored, and then it reports success in the same voice a working one
 * would use. Reading the code properly is cheaper than the trust it costs.
 */

/** Scan from an opening bracket to its match, respecting strings. */
export function matchBracket(src, openIndex) {
  const open = src[openIndex];
  const close = { '(': ')', '{': '}', '[': ']' }[open];
  let depth = 0;
  let quote = null;
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if ('({['.includes(ch)) depth++;
    else if (')}]'.includes(ch)) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Split on commas that are not inside brackets or strings. */
export function splitTopLevel(body) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let token = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quote) {
      token += ch;
      if (ch === '\\') { token += body[++i] ?? ''; }
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; token += ch; continue; }
    if ('({['.includes(ch)) depth++;
    else if (')}]'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { parts.push(token); token = ''; continue; }
    token += ch;
  }
  parts.push(token);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Property names of an object pattern or literal, as the CALLER writes them.
 * `{ title, icon: Icon, cls = '' }` -> title, icon, cls
 * The left of the colon is what was passed; the right is only a local alias.
 */
export function objectKeys(body) {
  return splitTopLevel(body)
    .map((part) => part.replace(/^\.\.\./, '').split(':')[0].split('=')[0].trim())
    .filter((n) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(n));
}

/**
 * Every `t(...)` call: its key when the key is a literal, the params object's
 * keys, and the pattern when the key is a template literal such as
 * `t(\`levels.${lvl}\`)` — those reach a whole family of keys at once.
 */
export function translationCalls(code) {
  const out = [];
  for (const m of code.matchAll(/\bt\(/g)) {
    const openParen = m.index + m[0].length - 1;
    const closeParen = matchBracket(code, openParen);
    if (closeParen < 0) continue;
    const args = splitTopLevel(code.slice(openParen + 1, closeParen));
    if (!args.length) continue;

    const first = args[0].trim();
    // Params are known only when written out as an object literal with no spread.
    // `t('k', params)` or `{ ...rest }` could carry anything, so such a call is
    // marked unknown instead of read as passing nothing (external audit V10).
    let params = [];
    let paramsKnown = true;
    if (args[1]) {
      const second = args[1].trim();
      const inner = second.startsWith('{') ? matchBracket(second, 0) : -1;
      const body = inner > 0 ? second.slice(1, inner) : '';
      if (inner > 0 && !splitTopLevel(body).some((p) => p.trim().startsWith('...'))) params = objectKeys(body);
      else paramsKnown = false;
    }

    // Either quote. t("price") used to fall through to 'dynamic', so a key reached
    // only that way looked unused and its placeholders were never checked.
    const literal = first.match(/^'((?:[^'\\]|\\.)*)'$/) || first.match(/^"((?:[^"\\]|\\.)*)"$/);
    if (literal) { out.push({ type: 'literal', key: literal[1], params, paramsKnown }); continue; }

    const template = first.match(/^`([^`]*)`$/);
    if (template) {
      const pattern = '^' + template[1]
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\\\$\\\{[^}]*\\\}/g, '[^.]+') + '$';
      out.push({ type: 'pattern', pattern, params });
      continue;
    }

    out.push({ type: 'dynamic', params });
  }
  return out;
}

/**
 * Like objectKeys, but says whether each entry carries a default.
 * A prop with a default survives never being passed; one without it does not,
 * and if the component then calls it, that is a guaranteed TypeError.
 */
export function objectEntries(body) {
  return splitTopLevel(body)
    .filter((part) => !part.startsWith('...'))
    .map((part) => {
      const name = part.split(':')[0].split('=')[0].trim();
      return { name, hasDefault: /=/.test(part) };
    })
    .filter((e) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(e.name));
}

/**
 * The full opening tag of a JSX element, from `<Name` to its real `>`.
 *
 * A regex that stops at the first `>` is wrong here and quietly so: an arrow
 * function in a prop (`onX={() => ...}`) contains a `>`, so the prop list gets
 * truncated at the arrow and every prop after it looks as though it was never
 * passed. That mistake accused thirteen correct call sites of a crash.
 */
export function jsxOpenTag(code, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '>' && depth === 0) return code.slice(start, i);
  }
  return null;
}
