/**
 * build_pgs_achievements.mjs — the Play Games achievements as one import zip (D11).
 *
 *   node scripts/store/build_pgs_achievements.mjs            # both zips + icons
 *   node scripts/store/build_pgs_achievements.mjs --check    # rules only, no files
 *
 * Play Console can import achievements from a zip (Play Games Services →
 * Achievements → Import achievements; developer.android.com/games/pgs/
 * integrate-achievements, read 2026-10-09):
 *
 *   AchievementsMetadata.csv        Name,Description,Incremental,Steps,Initial State,Points,List Order
 *   AchievementsLocalizations.csv   Name,Localized name,Localized description,locale
 *   AchievementsIconsMappings.csv   Name,icon file
 *   the icons                       512 × 512 PNG, under 1 MB each
 *
 * No header rows, no subdirectories, and no commas inside a name or description —
 * the CSV has no quoting. The metadata file is written in the game's DEFAULT
 * language, and the localisation file may not name that language. Which language
 * is the default is set in the console and is not recorded here, so a zip is
 * written for each likely one (DEFAULTS); the one to upload is the one whose
 * language the console shows as default. Every other language must first be added
 * under the game's translations, or the import refuses its rows.
 *
 * The texts are the app's own (src/i18n/locales/<loc>/achievements.js), so the
 * app and Play Games say the same thing. The icons are drawn here from Lucide
 * glyphs (ISC — the licence is copied next to them) on a disc coloured by
 * category inside a ring coloured by tier: no text (one icon serves every
 * language), colour throughout (Play makes the locked icon grey from it), and
 * nothing outside the circle a toast crops it to.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'store_assets', 'common', 'pgs_achievements');
const ICON_DIR = path.join(OUT, 'icons');

// The app's language → Play's code. The codes follow the store listing's
// (store_assets/<code>). If the import rejects one, this is the one place to
// change it.
export const PLAY_LOCALE = {
  ar: 'ar', de: 'de-DE', en: 'en-US', 'es-ES': 'es-ES', fr: 'fr-FR', hi: 'hi-IN', it: 'it-IT',
  ja: 'ja-JP', ko: 'ko-KR', pt: 'pt-BR', ru: 'ru-RU', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW',
};
const DEFAULTS = ['en', 'ko'];

// One glyph each, all different (Play: "New achievements should have unique icons").
export const GLYPH = {
  first_win: 'sprout', win_5: 'hand', win_10: 'puzzle', win_25: 'star', win_50: 'medal',
  win_100: 'trophy', win_250: 'crown', visit_30: 'calendar-check', visit_100: 'calendar-days', visit_365: 'sun',
  flawless_1: 'target', flawless_5: 'gem', pure_logic_expert: 'brain', pure_logic_master: 'brain-circuit',
  note_master: 'pencil', no_notes: 'eye', fast_entry_fan: 'zap',
  rank_s_plus: 'rocket', speed_runner_3m: 'timer', speed_runner_2m: 'gauge', combo_streak_5: 'flame', combo_streak_10: 'sparkles',
  // The five levels as a climb: first steps, a map, a compass, the flag, the summit.
  clear_lv1: 'footprints', clear_lv2: 'map', clear_lv3: 'compass', clear_lv4: 'flag', clear_lv5: 'mountain-snow',
  survival_hero: 'hourglass', survival_clutch: 'shield',
  killer_first: 'square-dashed', killer_lv3: 'calculator', killer_win_25: 'sword', killer_lv5: 'skull',
  daily_first: 'calendar', daily_streak_7: 'calendar-clock', battle_first_win: 'swords', iq_150: 'dna',
  academy_first_lesson: 'book-open', academy_stage3: 'bird', academy_all: 'graduation-cap',
};

// Disc: the achievement's group (killer has its own, though it sits under
// Difficulty in the app). Ring: the tier — light to dark, so it still reads in grey.
const DISC = {
  progression: ['#15803d', '#22c55e'], logic: ['#1d4ed8', '#3b82f6'], speed: ['#c2410c', '#fb923c'],
  difficulty: ['#b91c1c', '#f87171'], killer: ['#0f766e', '#2dd4bf'], special: ['#4338ca', '#818cf8'],
};
const RING = {
  bronze: ['#7c3f12', '#e7a462'], silver: ['#64748b', '#f1f5f9'], gold: ['#b45309', '#fde047'],
  diamond: ['#0369a1', '#a5f3fc'], master: ['#86198f', '#f5d0fe'],
};

// Play Games' own limits (same page).
const LIMITS = { name: 100, desc: 500, minPoints: 5, maxPoints: 200, totalPoints: 2000, minCount: 10, maxIconBytes: 1024 * 1024 };

export async function loadAchievements() {
  const { ACHIEVEMENTS_LIST, ACHIEVEMENT_TIERS } = await import(pathToFileURL(path.join(ROOT, 'src/data/achievementsData.js')).href);
  const texts = {};
  for (const loc of Object.keys(PLAY_LOCALE)) {
    const mod = await import(pathToFileURL(path.join(ROOT, 'src/i18n/locales', loc, 'achievements.js')).href);
    texts[loc] = mod.achievements.achievements;
  }
  const list = ACHIEVEMENTS_LIST.map((a, i) => ({
    ...a,
    order: i + 1,
    pgsPoints: ACHIEVEMENT_TIERS[a.tier.toUpperCase()].pgsPoints,
    group: a.id.startsWith('killer_') ? 'killer' : a.category,
  }));
  return { list, texts };
}

/** Everything the import and the console refuse, as sentences. Empty = fine. */
export function problems({ list, texts }) {
  const out = [];
  if (list.length < LIMITS.minCount) out.push(`${list.length} achievements — Play wants at least ${LIMITS.minCount}`);
  let total = 0;
  for (const a of list) {
    total += a.pgsPoints;
    if (a.pgsPoints % 5 || a.pgsPoints < LIMITS.minPoints || a.pgsPoints > LIMITS.maxPoints) out.push(`${a.id}: ${a.pgsPoints} points — must be a multiple of 5 from 5 to 200`);
    if (!GLYPH[a.id]) out.push(`${a.id}: no icon glyph`);
    if (!DISC[a.group] || !RING[a.tier]) out.push(`${a.id}: no colour for ${a.group} / ${a.tier}`);
  }
  if (total > LIMITS.totalPoints) out.push(`${total} points in all — Play allows ${LIMITS.totalPoints}`);
  const glyphs = list.map((a) => GLYPH[a.id]);
  const twice = glyphs.filter((g, i) => g && glyphs.indexOf(g) !== i);
  if (twice.length) out.push(`icons used twice: ${[...new Set(twice)].join(', ')}`);
  for (const [loc, t] of Object.entries(texts)) {
    const seen = new Map();
    for (const a of list) {
      const title = t[a.id]?.title; const desc = t[a.id]?.desc;
      if (typeof title !== 'string' || !title.trim()) { out.push(`${loc} ${a.id}: no name`); continue; }
      if (title.length > LIMITS.name) out.push(`${loc} ${a.id}: name longer than ${LIMITS.name}`);
      if ((desc || '').length > LIMITS.desc) out.push(`${loc} ${a.id}: description longer than ${LIMITS.desc}`);
      for (const [k, v] of [['name', title], ['description', desc || '']]) {
        if (/[,\r\n"]/.test(v)) out.push(`${loc} ${a.id}: the ${k} holds a comma, quote or line break, which the unquoted CSV cannot carry — "${v}"`);
      }
      if (seen.has(title)) out.push(`${loc}: "${title}" names both ${seen.get(title)} and ${a.id} — names must differ within a language`);
      seen.set(title, a.id);
    }
  }
  return out;
}

const csv = (rows) => rows.map((r) => r.join(',')).join('\r\n') + '\r\n';
const iconFile = (a) => `${String(a.order).padStart(2, '0')}_${a.id}.png`;

export function csvFiles({ list, texts }, defaultLoc) {
  const t0 = texts[defaultLoc];
  const metadata = csv(list.map((a) => [t0[a.id].title, t0[a.id].desc, 'False', '', 'Revealed', a.pgsPoints, a.order]));
  const localizations = csv(Object.keys(PLAY_LOCALE).filter((loc) => loc !== defaultLoc).flatMap((loc) =>
    list.map((a) => [t0[a.id].title, texts[loc][a.id].title, texts[loc][a.id].desc, PLAY_LOCALE[loc]])));
  const icons = csv(list.map((a) => [t0[a.id].title, iconFile(a)]));
  return {
    'AchievementsMetadata.csv': metadata,
    'AchievementsLocalizations.csv': localizations,
    'AchievementsIconsMappings.csv': icons,
  };
}

// ── icons ───────────────────────────────────────────────────────────────────
function glyphSvg(name) {
  const src = fs.readFileSync(path.join(ROOT, 'node_modules/lucide-react/dist/esm/icons', `${name}.mjs`), 'utf8');
  const node = src.match(/const __iconNode = (\[[\s\S]*?\]);\n/);
  if (!node) throw new Error(`lucide ${name}: icon data not found`);
  // eslint-disable-next-line no-new-func
  const parts = Function(`return ${node[1]}`)();
  return parts.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== 'key')
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`).join(' ')}/>`).join('');
}

function iconSvg(a) {
  const [d0, d1] = DISC[a.group];
  const [r0, r1] = RING[a.tier];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#1e293b"/><stop offset="1" stop-color="#020617"/></radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${r1}"/><stop offset="0.55" stop-color="${r0}"/><stop offset="1" stop-color="${r1}"/></linearGradient>
    <radialGradient id="disc" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="${d1}"/><stop offset="1" stop-color="${d0}"/></radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.35"/></filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="236" fill="url(#ring)"/>
  <circle cx="256" cy="256" r="204" fill="url(#disc)"/>
  <ellipse cx="226" cy="150" rx="150" ry="70" fill="#ffffff" opacity="0.10"/>
  <g filter="url(#shadow)" transform="translate(256 256) scale(10.5) translate(-12 -12)" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${glyphSvg(GLYPH[a.id])}</g>
</svg>`;
}

async function drawIcons(list) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  fs.rmSync(ICON_DIR, { recursive: true, force: true });
  fs.mkdirSync(ICON_DIR, { recursive: true });
  for (const a of list) {
    await page.setContent(`<html><body style="margin:0">${iconSvg(a)}</body></html>`);
    const file = path.join(ICON_DIR, iconFile(a));
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 512, height: 512 } });
    const size = fs.statSync(file).size;
    if (size >= LIMITS.maxIconBytes) throw new Error(`${iconFile(a)} is ${size} bytes — Play takes under 1 MB`);
  }
  // A sheet of all forty, in colour and in the grey Play shows before unlock.
  const cells = list.map((a) => `<figure><img src="data:image/png;base64,${fs.readFileSync(path.join(ICON_DIR, iconFile(a))).toString('base64')}"><figcaption>${a.order}. ${a.id}</figcaption></figure>`).join('');
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.setContent(`<html><head><style>
    body{margin:0;padding:16px;background:#0b1120;color:#cbd5e1;font:12px system-ui}
    .grid{display:grid;grid-template-columns:repeat(10,1fr);gap:10px} figure{margin:0;text-align:center}
    img{width:100%;border-radius:50%} .grey img{filter:grayscale(1)} h2{font-size:14px;margin:14px 0 8px}
  </style></head><body><h2>unlocked</h2><div class="grid">${cells}</div><h2>locked (Play greys the same icon)</h2><div class="grid grey">${cells}</div></body></html>`);
  await page.screenshot({ path: path.join(OUT, 'contact_sheet.png'), fullPage: true });
  await browser.close();
}

// ── zip (stored, no compression — the PNGs are compressed already) ──────────
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

function zip(entries) {
  const locals = []; const centrals = []; let offset = 0;
  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name, 'utf8'); const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, data); centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + data.length;
  }
  const dir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, dir, end]);
}

async function main() {
  const data = await loadAchievements();
  const bad = problems(data);
  if (bad.length) {
    console.error('❌ Play would refuse these:\n  ' + bad.join('\n  '));
    process.exit(1);
  }
  const total = data.list.reduce((n, a) => n + a.pgsPoints, 0);
  console.log(`✅ ${data.list.length} achievements · ${total} / ${LIMITS.totalPoints} points · ${Object.keys(PLAY_LOCALE).length} languages · names, lengths, commas fine`);
  if (process.argv.includes('--check')) return;

  await drawIcons(data.list);
  console.log(`✅ ${data.list.length} icons → ${path.relative(ROOT, ICON_DIR)} · contact_sheet.png`);
  fs.copyFileSync(path.join(ROOT, 'node_modules/lucide-react/LICENSE'), path.join(OUT, 'LICENSE-lucide.txt'));

  for (const def of DEFAULTS) {
    const files = csvFiles(data, def);
    const entries = [
      ...Object.entries(files).map(([n, s]) => [n, Buffer.from(s, 'utf8')]),
      ...data.list.map((a) => [iconFile(a), fs.readFileSync(path.join(ICON_DIR, iconFile(a)))]),
    ];
    const name = `pgs_achievements_default_${PLAY_LOCALE[def]}.zip`;
    fs.writeFileSync(path.join(OUT, name), zip(entries));
    for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(OUT, `${PLAY_LOCALE[def]}_${n}`), s);
    console.log(`✅ ${name} — ${entries.length} files (default language ${PLAY_LOCALE[def]})`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
