// Write the killer practice missions (src/data/academy/practice/killerPractice.js)
// from picks_killer.json and the sentence templates below.
//
// The boards are our own (select.mjs); which pick each mission uses is fixed here by
// seed, so re-running the lab does not move an example. Every sentence is filled from
// the pick itself — the cage sums, cells and answer — never typed in by hand, so a
// sentence cannot name a number its board does not have.
//
// Words: the cage word is the app's own killer word in each language
// (locales/<lang>/killer.js); "Example", "target cell", "Enter" are the classic
// academy's. French puts a no-break space before : ; ! ? (l10n gate 10). Arabic
// sums are wrapped in LRI…PDI so they read left to right (rules/ar §5.2).
//
//   node scripts/academy/killer/write_killer.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMission } from './present.mjs';
import { SETS, HOUSE_SETS, digits } from './kstate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, '../../../src/data/academy/practice/killerPractice.js');
// Every picks file: picks_killer.json (seed prefix kl) and wider searches (picks_killer_<prefix>.json).
const picks = {};
for (const name of fs.readdirSync(here).filter((n) => /^picks_killer(_\w+)?\.json$/.test(n))) {
  for (const [tech, list] of Object.entries(JSON.parse(fs.readFileSync(path.join(here, name), 'utf8')))) {
    picks[tech] = [...(picks[tech] || []), ...list];
  }
}

const rc = (i) => `r${Math.floor(i / 9) + 1}c${(i % 9) + 1}`;
const LRI = '\u2066';
const PDI = '\u2069';
const NB = '\u00a0';

// Korean particles after a number, by how its last digit is read (영 일 이 삼 사 오 육 칠 팔 구).
const BATCHIM = new Set(['0', '1', '3', '6', '7', '8']);
const RIEUL = new Set(['1', '7', '8']);
const last = (x) => String(x).slice(-1);
const ko = {
  i: (x) => `${x}${BATCHIM.has(last(x)) ? '이' : '가'}`,
  eun: (x) => `${x}${BATCHIM.has(last(x)) ? '은' : '는'}`,
  eul: (x) => `${x}${BATCHIM.has(last(x)) ? '을' : '를'}`,
  gwa: (x) => `${x}${BATCHIM.has(last(x)) ? '과' : '와'}`,
  ro: (x) => `${x}${BATCHIM.has(last(x)) && !RIEUL.has(last(x)) ? '으로' : '로'}`,
};

// Italian article before a number: l’ where the number starts with a vowel sound
// (uno, otto, undici, ottanta…), il elsewhere — "con il 22", "con l’8".
const itArt = (n) => (/^(1|8|11|8\d)$/.test(String(n)) ? `l’${n}` : `il ${n}`);

// "a and b", "a, b and c" — the word each language joins its last two items with.
const AND = {
  en: ' and ', ko: ', ', ja: ' と ', 'zh-CN': ' 和 ', 'zh-TW': ' 和 ', 'es-ES': ' y ', de: ' und ', fr: ' et ',
  pt: ' e ', it: ' e ', ru: ' и ', hi: ' और ', ar: ' و',
};
const SEP = { ko: ', ', ja: '・', 'zh-CN': '、', 'zh-TW': '、', ar: ' و' };
const list = (lang, items) => (items.length < 2 ? String(items[0])
  : items.slice(0, -1).join(SEP[lang] || ', ') + AND[lang] + items[items.length - 1]);
// Cells are Latin ("r3c7"); Arabic keeps a space after و before them.
const cells = (lang, items) => (lang === 'ar' ? items.join(' و ') : list(lang, items));
// "45 − 24 − 15" from the cage sums.
const minus = (from, sums) => [from, ...sums].join(' − ');
const signed = (n) => (n < 0 ? `−${-n}` : String(n));

const EXAMPLE = {
  en: (n) => `Example ${n}: `, ko: (n) => `실전 예시 ${n}: `, ja: (n) => `実践例 ${n}: `,
  'zh-CN': (n) => `实战范例 ${n}: `, 'zh-TW': (n) => `實戰範例 ${n}: `, 'es-ES': (n) => `Ejemplo práctico ${n}: `,
  de: (n) => `Praxisbeispiel ${n}: `, fr: (n) => `Exemple pratique ${n}${NB}: `, pt: (n) => `Exemplo prático ${n}: `,
  it: (n) => `Esempio pratico ${n}: `, ru: (n) => `Практический пример ${n}: `, hi: (n) => `व्यावहारिक उदाहरण ${n}: `,
  ar: (n) => `مثال عملي ${n}: `,
};

// ── K1: the last cell of a cage ─────────────────────────────────────────────
const K1 = {
  name: {
    en: 'Last Cell of a Cage', ko: '묶음의 마지막 칸', ja: 'ケージの最後のマス', 'zh-CN': '笼子的最后一格', 'zh-TW': '籠子的最後一格',
    'es-ES': 'Última casilla de la jaula', de: 'Letztes Feld im Käfig', fr: 'Dernière case de la cage', pt: 'Última casa da gaiola',
    it: 'Ultima casella della gabbia', ru: 'Последняя клетка области', hi: 'समूह का आख़िरी सेल', ar: 'آخر خلية في القفص',
  },
  guide: ({ sum, kc, kv, t, a }) => ({
    en: `The cage marked ${sum} has two cells, and ${kc} is already ${kv}. So the target cell ${t} is ${sum} − ${kv} = [${a}]. Enter ${a}.`,
    ko: `합 ${sum}짜리 묶음은 두 칸이고, ${kc}에는 이미 ${ko.i(kv)} 있습니다. 그래서 목표 칸 ${ko.eun(t)} ${sum} − ${kv} = [${a}]입니다. ${ko.eul(a)} 입력하세요.`,
    ja: `「${sum}」のケージは2マスで、${kc} はすでに ${kv} です。だから目標マス ${t} は ${sum} − ${kv} = [${a}] です。${a} を入力してください。`,
    'zh-CN': `标着 ${sum} 的笼子有两格，${kc} 已经是 ${kv}。所以目标格 ${t} 是 ${sum} − ${kv} = [${a}]。请输入 ${a}。`,
    'zh-TW': `標著 ${sum} 的籠子有兩格，${kc} 已經是 ${kv}。所以目標格 ${t} 是 ${sum} − ${kv} = [${a}]。請輸入 ${a}。`,
    'es-ES': `La jaula marcada con ${sum} tiene dos casillas y ${kc} ya es ${kv}. Así que la casilla objetivo ${t} es ${sum} − ${kv} = [${a}]. Introduce ${a}.`,
    de: `Der Käfig mit der ${sum} hat zwei Felder, und ${kc} ist schon ${kv}. Also ist das Zielfeld ${t} = ${sum} − ${kv} = [${a}]. Trage ${a} ein.`,
    fr: `La cage marquée ${sum} a deux cases, et ${kc} vaut déjà ${kv}. La case cible ${t} vaut donc ${sum} − ${kv} = [${a}]. Entrez ${a}.`,
    pt: `A gaiola marcada com ${sum} tem duas casas, e ${kc} já é ${kv}. Então a casa alvo ${t} é ${sum} − ${kv} = [${a}]. Digite ${a}.`,
    it: `La gabbia con ${itArt(sum)} ha due caselle e ${kc} è già ${kv}. Quindi la casella obiettivo ${t} è ${sum} − ${kv} = [${a}]. Inserisci ${a}.`,
    ru: `Область с числом ${sum} состоит из двух клеток, и в ${kc} уже стоит ${kv}. Значит, в целевой клетке ${t}: ${sum} − ${kv} = [${a}]. Введите ${a}.`,
    hi: `${sum} लिखे समूह में दो सेल हैं, और ${kc} में पहले से ${kv} है। इसलिए लक्ष्य सेल ${t} = ${sum} − ${kv} = [${a}]। ${a} दर्ज करें।`,
    ar: `القفص المكتوب عليه ${sum} من خليتين، والخلية ${kc} فيها ${kv} بالفعل. إذن الخلية الهدف ${t} هي ${LRI}${sum} − ${kv} = [${a}]${PDI}. أدخل ${a}.`,
  }),
  facts(p) {
    const f = p.finding;
    const cage = p.cages[f.cage];
    if (cage.cells.length !== 2) throw new Error(`${p.seed}: K1 sentences say two cells`);
    const kc = cage.cells.find((i) => p.val[i]);
    return { sum: cage.sum, kc: rc(kc), kv: p.val[kc], t: rc(f.place[0]), a: f.place[1] };
  },
};

// ── K2: a sum made only one way (two-cell cages here) ────────────────────────
const K2 = {
  name: {
    en: 'Unique Combination', ko: '조합이 하나뿐인 묶음', ja: '組み合わせが1通りのケージ', 'zh-CN': '唯一组合', 'zh-TW': '唯一組合',
    'es-ES': 'Combinación única', de: 'Eindeutige Kombination', fr: 'Combinaison unique', pt: 'Combinação única',
    it: 'Combinazione unica', ru: 'Единственная комбинация', hi: 'एकमात्र संयोजन', ar: 'تركيبة وحيدة',
  },
  guide: ({ sum, a, b, t }) => ({
    en: `The cage marked ${sum} has two cells, and ${sum} can only be ${a} + ${b}. Which candidate in the target cell ${t} can never go in this cage?`,
    ko: `합 ${sum}짜리 묶음은 두 칸이고, ${ko.eun(sum)} ${a} + ${ko.ro(b)}만 만들 수 있습니다. 목표 칸 ${t}의 후보 중 이 묶음에 절대 들어갈 수 없는 것은 무엇일까요?`,
    ja: `「${sum}」のケージは2マスで、${sum} は ${a} + ${b} でしか作れません。目標マス ${t} の候補のうち、このケージに入れないのはどれでしょう？`,
    'zh-CN': `标着 ${sum} 的笼子有两格，${sum} 只能是 ${a} + ${b}。目标格 ${t} 的候选数中，哪一个不可能放进这个笼子？`,
    'zh-TW': `標著 ${sum} 的籠子有兩格，${sum} 只能是 ${a} + ${b}。目標格 ${t} 的候選數中，哪一個不可能放進這個籠子？`,
    'es-ES': `La jaula marcada con ${sum} tiene dos casillas, y ${sum} solo puede ser ${a} + ${b}. ¿Qué candidato de la casilla objetivo ${t} nunca puede ir en esta jaula?`,
    de: `Der Käfig mit der ${sum} hat zwei Felder, und ${sum} geht nur als ${a} + ${b}. Welcher Kandidat im Zielfeld ${t} kann nie in diesem Käfig stehen?`,
    fr: `La cage marquée ${sum} a deux cases, et ${sum} ne peut être que ${a} + ${b}. Quel candidat de la case cible ${t} ne peut jamais aller dans cette cage${NB}?`,
    pt: `A gaiola marcada com ${sum} tem duas casas, e ${sum} só pode ser ${a} + ${b}. Qual candidato da casa alvo ${t} nunca pode ficar nesta gaiola?`,
    it: `La gabbia con ${itArt(sum)} ha due caselle e ${sum} si ottiene solo con ${a} + ${b}. Quale candidato della casella obiettivo ${t} non può mai stare in questa gabbia?`,
    ru: `Область с числом ${sum} состоит из двух клеток, а ${sum} получается только как ${a} + ${b}. Какой кандидат в целевой клетке ${t} никогда не может стоять в этой области?`,
    hi: `${sum} लिखे समूह में दो सेल हैं, और ${sum} सिर्फ़ ${a} + ${b} से बनता है। लक्ष्य सेल ${t} का कौन-सा उम्मीदवार इस समूह में कभी नहीं आ सकता?`,
    ar: `القفص المكتوب عليه ${sum} من خليتين، و${sum} لا يكون إلا ${LRI}${a} + ${b}${PDI}. أي مرشح في الخلية الهدف ${t} لا يمكن أن يدخل هذا القفص أبدًا؟`,
  }),
  facts(p) {
    const f = p.finding;
    const cage = p.cages[f.cage];
    if (cage.cells.length !== 2 || f.set.length !== 2) throw new Error(`${p.seed}: K2 sentences say two cells`);
    return { sum: cage.sum, a: f.set[0], b: f.set[1], t: rc(p.question.target) };
  },
};

// ── K3: the rule of 45, one cell in or out of a box ──────────────────────────
const K3 = {
  name: {
    inside: {
      en: 'Rule of 45 (Cell Left Inside)', ko: '45 규칙 (남은 한 칸)', ja: '45の法則 (残り1マス)', 'zh-CN': '45 法则 (剩下一格)', 'zh-TW': '45 法則 (剩下一格)',
      'es-ES': 'Regla del 45 (casilla que falta)', de: '45er-Regel (fehlendes Feld)', fr: 'Règle des 45 (case restante)', pt: 'Regra do 45 (casa que falta)',
      it: 'Regola del 45 (casella mancante)', ru: 'Правило 45 (оставшаяся клетка)', hi: '45 का नियम (बचा हुआ सेल)', ar: 'قاعدة 45 (الخلية المتبقية)',
    },
    outside: {
      en: 'Rule of 45 (Cell Sticking Out)', ko: '45 규칙 (삐져나간 한 칸)', ja: '45の法則 (はみ出し1マス)', 'zh-CN': '45 法则 (多出一格)', 'zh-TW': '45 法則 (多出一格)',
      'es-ES': 'Regla del 45 (casilla que sobresale)', de: '45er-Regel (überstehendes Feld)', fr: 'Règle des 45 (case qui dépasse)', pt: 'Regra do 45 (casa que sobra)',
      it: 'Regola del 45 (casella sporgente)', ru: 'Правило 45 (выступающая клетка)', hi: '45 का नियम (बाहर निकला सेल)', ar: 'قاعدة 45 (الخلية البارزة)',
    },
  },
  guide: ({ inside, c1, c2, total, t, a }) => (inside ? {
    en: `The cages marked ${c1} and ${c2} fill the colored box except for the target cell ${t}. A box adds up to 45, so ${t} = 45 − ${c1} − ${c2} = [${a}]. Enter ${a}.`,
    ko: `합 ${ko.gwa(c1)} ${c2}인 두 묶음이 색칠된 박스를 목표 칸 ${t} 하나만 남기고 채웁니다. 박스의 합은 45이므로 ${t} = 45 − ${c1} − ${c2} = [${a}]입니다. ${ko.eul(a)} 입력하세요.`,
    ja: `「${c1}」と「${c2}」のケージが、目標マス ${t} 以外の色付きブロックを埋めています。ブロックの合計は45なので、${t} = 45 − ${c1} − ${c2} = [${a}] です。${a} を入力してください。`,
    'zh-CN': `标着 ${c1} 和 ${c2} 的笼子填满了着色的九宫格，只剩目标格 ${t}。九宫格的总和是 45，所以 ${t} = 45 − ${c1} − ${c2} = [${a}]。请输入 ${a}。`,
    'zh-TW': `標著 ${c1} 和 ${c2} 的籠子填滿了著色的九宮格，只剩目標格 ${t}。九宮格的總和是 45，所以 ${t} = 45 − ${c1} − ${c2} = [${a}]。請輸入 ${a}。`,
    'es-ES': `Las jaulas marcadas con ${c1} y ${c2} llenan el bloque resaltado salvo la casilla objetivo ${t}. Un bloque suma 45, así que ${t} = 45 − ${c1} − ${c2} = [${a}]. Introduce ${a}.`,
    de: `Die Käfige mit ${c1} und ${c2} füllen den markierten Block bis auf das Zielfeld ${t}. Ein Block ergibt 45, also ist ${t} = 45 − ${c1} − ${c2} = [${a}]. Trage ${a} ein.`,
    fr: `Les cages marquées ${c1} et ${c2} remplissent le bloc en couleur, sauf la case cible ${t}. Un bloc fait 45, donc ${t} = 45 − ${c1} − ${c2} = [${a}]. Entrez ${a}.`,
    pt: `As gaiolas marcadas com ${c1} e ${c2} preenchem o bloco destacado, exceto a casa alvo ${t}. Um bloco soma 45, então ${t} = 45 − ${c1} − ${c2} = [${a}]. Digite ${a}.`,
    it: `Le gabbie con ${c1} e ${c2} riempiono il blocco evidenziato tranne la casella obiettivo ${t}. Un blocco somma 45, quindi ${t} = 45 − ${c1} − ${c2} = [${a}]. Inserisci ${a}.`,
    ru: `Области с числами ${c1} и ${c2} заполняют выделенный блок, кроме целевой клетки ${t}. Сумма блока — 45, поэтому ${t} = 45 − ${c1} − ${c2} = [${a}]. Введите ${a}.`,
    hi: `${c1} और ${c2} लिखे समूह रंगीन बॉक्स को लक्ष्य सेल ${t} छोड़कर भर देते हैं। बॉक्स का जोड़ 45 है, इसलिए ${t} = 45 − ${c1} − ${c2} = [${a}]। ${a} दर्ज करें।`,
    ar: `القفصان المكتوب عليهما ${c1} و${c2} يملآن المربع الملوّن ما عدا الخلية الهدف ${t}. مجموع المربع 45، إذن ${LRI}${t} = 45 − ${c1} − ${c2} = [${a}]${PDI}. أدخل ${a}.`,
  } : {
    en: `The cages marked ${c1} and ${c2} cover the whole colored box, and one of their cells, the target cell ${t}, sticks out of it. They add up to ${total} and the box to 45, so ${t} = ${total} − 45 = [${a}]. Enter ${a}.`,
    ko: `합 ${ko.gwa(c1)} ${c2}인 두 묶음이 색칠된 박스를 다 덮고, 그중 한 칸인 목표 칸 ${t}${BATCHIM.has(last(t)) ? '이' : '가'} 박스 밖으로 삐져나와 있습니다. 두 묶음의 합은 ${total}, 박스의 합은 45이므로 ${t} = ${total} − 45 = [${a}]입니다. ${ko.eul(a)} 입력하세요.`,
    ja: `「${c1}」と「${c2}」のケージは色付きブロックを全部覆い、そのうち1マス（目標マス ${t}）がブロックの外にはみ出しています。ケージの合計は ${total}、ブロックは45なので、${t} = ${total} − 45 = [${a}] です。${a} を入力してください。`,
    'zh-CN': `标着 ${c1} 和 ${c2} 的笼子盖满了着色的九宫格，其中一格（目标格 ${t}）伸出了九宫格。笼子的总和是 ${total}，九宫格是 45，所以 ${t} = ${total} − 45 = [${a}]。请输入 ${a}。`,
    'zh-TW': `標著 ${c1} 和 ${c2} 的籠子蓋滿了著色的九宮格，其中一格（目標格 ${t}）伸出了九宮格。籠子的總和是 ${total}，九宮格是 45，所以 ${t} = ${total} − 45 = [${a}]。請輸入 ${a}。`,
    'es-ES': `Las jaulas marcadas con ${c1} y ${c2} cubren todo el bloque resaltado, y una de sus casillas, la casilla objetivo ${t}, sobresale. Suman ${total} y el bloque 45, así que ${t} = ${total} − 45 = [${a}]. Introduce ${a}.`,
    de: `Die Käfige mit ${c1} und ${c2} decken den ganzen markierten Block ab, und eines ihrer Felder, das Zielfeld ${t}, ragt hinaus. Sie ergeben ${total}, der Block 45, also ist ${t} = ${total} − 45 = [${a}]. Trage ${a} ein.`,
    fr: `Les cages marquées ${c1} et ${c2} couvrent tout le bloc en couleur, et l’une de leurs cases, la case cible ${t}, en dépasse. Elles font ${total} et le bloc 45, donc ${t} = ${total} − 45 = [${a}]. Entrez ${a}.`,
    pt: `As gaiolas marcadas com ${c1} e ${c2} cobrem todo o bloco destacado, e uma das casas delas, a casa alvo ${t}, fica para fora. Elas somam ${total} e o bloco 45, então ${t} = ${total} − 45 = [${a}]. Digite ${a}.`,
    it: `Le gabbie con ${c1} e ${c2} coprono tutto il blocco evidenziato, e una delle loro caselle, la casella obiettivo ${t}, sporge fuori. Sommano ${total} e il blocco 45, quindi ${t} = ${total} − 45 = [${a}]. Inserisci ${a}.`,
    ru: `Области с числами ${c1} и ${c2} закрывают весь выделенный блок, и одна их клетка, целевая клетка ${t}, выступает наружу. Их сумма ${total}, сумма блока 45, поэтому ${t} = ${total} − 45 = [${a}]. Введите ${a}.`,
    hi: `${c1} और ${c2} लिखे समूह पूरा रंगीन बॉक्स ढक लेते हैं, और उनका एक सेल, लक्ष्य सेल ${t}, बॉक्स से बाहर निकला है। उनका जोड़ ${total} और बॉक्स का 45 है, इसलिए ${t} = ${total} − 45 = [${a}]। ${a} दर्ज करें।`,
    ar: `القفصان المكتوب عليهما ${c1} و${c2} يغطيان المربع الملوّن كله، وإحدى خلاياهما، الخلية الهدف ${t}، تبرز خارجه. مجموعهما ${total} ومجموع المربع 45، إذن ${LRI}${t} = ${total} − 45 = [${a}]${PDI}. أدخل ${a}.`,
  }),
  facts(p) {
    const f = p.finding;
    if (!f.house.startsWith('b') || f.cages.length !== 2) throw new Error(`${p.seed}: K3 sentences say two cages and a box`);
    const [c1, c2] = f.cages.map((k) => p.cages[k].sum);
    const inside = f.innies.length === 1;
    return { inside, c1, c2, total: c1 + c2, t: rc(f.place[0]), a: f.place[1] };
  },
  title(facts) { return facts.inside ? this.name.inside : this.name.outside; },
};

// The common closing question of a "which candidate goes?" practice.
const ASK = {
  en: (t) => `Which candidate goes from the target cell ${t}?`,
  ko: (t) => `목표 칸 ${t}에서 지워지는 후보는 무엇일까요?`,
  ja: (t) => `目標マス ${t} から消える候補はどれでしょう？`,
  'zh-CN': (t) => `目标格 ${t} 中会被删去的候选数是哪个？`,
  'zh-TW': (t) => `目標格 ${t} 中會被刪去的候選數是哪個？`,
  'es-ES': (t) => `¿Qué candidato sale de la casilla objetivo ${t}?`,
  de: (t) => `Welcher Kandidat fällt im Zielfeld ${t} weg?`,
  fr: (t) => `Quel candidat quitte la case cible ${t}${NB}?`,
  pt: (t) => `Qual candidato sai da casa alvo ${t}?`,
  it: (t) => `Quale candidato esce dalla casella obiettivo ${t}?`,
  ru: (t) => `Какой кандидат уходит из целевой клетки ${t}?`,
  hi: (t) => `लक्ष्य सेल ${t} से कौन-सा उम्मीदवार हटता है?`,
  ar: (t) => `أي مرشح يُحذف من الخلية الهدف ${t}؟`,
};
// Chinese and Japanese run sentences together after 。 — no space between them.
const NO_SPACE = new Set(['ja', 'zh-CN', 'zh-TW']);
const withAsk = (t, texts) => Object.fromEntries(Object.entries(texts).map(([l, s]) => [l, `${s}${NO_SPACE.has(l) ? '' : ' '}${ASK[l](t)}`]));

// Why a digit cannot be in a group of two different cells adding up to S.
function pairReason(S, a) {
  if (2 * a === S) return 'half';
  if (a > S - 1) return 'big';
  throw new Error(`no sentence for removing ${a} from a pair adding up to ${S}`);
}

// ── K14: two-cell arithmetic ─────────────────────────────────────────────────
const K14 = {
  name: {
    en: 'Two-Cell Sums', ko: '두 칸 묶음의 합', ja: '2マスのケージの合計', 'zh-CN': '两格笼子的总和', 'zh-TW': '兩格籠子的總和',
    'es-ES': 'Sumas de dos casillas', de: 'Summen aus zwei Feldern', fr: 'Sommes de deux cases', pt: 'Somas de duas casas',
    it: 'Somme di due caselle', ru: 'Суммы двух клеток', hi: 'दो सेल का जोड़', ar: 'مجموع خليتين',
  },
  guide: ({ sum, t, why }) => withAsk(t, why === 'half' ? {
    en: `The cage marked ${sum} has two cells with different digits that add up to ${sum}. So it can never use half of ${sum}: that would need the same digit twice.`,
    ko: `합 ${sum}짜리 두 칸 묶음에는 더해서 ${ko.i(sum)} 되는 서로 다른 두 숫자가 들어갑니다. 그래서 ${sum}의 절반은 쓸 수 없습니다. 같은 숫자가 두 번 필요하기 때문입니다.`,
    ja: `「${sum}」の2マスのケージには、足して${sum}になる異なる2つの数字が入ります。だから${sum}の半分は使えません。同じ数字が2つ必要になるからです。`,
    'zh-CN': `标着 ${sum} 的两格笼子里是相加为 ${sum} 的两个不同数字，所以不能用 ${sum} 的一半：那需要同一个数字两次。`,
    'zh-TW': `標著 ${sum} 的兩格籠子裡是相加為 ${sum} 的兩個不同數字，所以不能用 ${sum} 的一半：那需要同一個數字兩次。`,
    'es-ES': `La jaula marcada con ${sum} tiene dos casillas con cifras distintas que suman ${sum}, así que nunca puede usar la mitad de ${sum}: haría falta la misma cifra dos veces.`,
    de: `Der Käfig mit der ${sum} hat zwei Felder mit verschiedenen Ziffern, die zusammen ${sum} ergeben. Die Hälfte von ${sum} geht also nie, dafür bräuchte es dieselbe Ziffer zweimal.`,
    fr: `La cage marquée ${sum} a deux cases aux chiffres différents dont la somme fait ${sum}. Elle ne peut donc jamais utiliser la moitié de ${sum}${NB}: il faudrait deux fois le même chiffre.`,
    pt: `A gaiola marcada com ${sum} tem duas casas com números diferentes que somam ${sum}, então nunca pode usar a metade de ${sum}: seria preciso o mesmo número duas vezes.`,
    it: `La gabbia con ${itArt(sum)} ha due caselle con cifre diverse che sommano ${sum}, quindi non può mai usare la metà di ${sum}: servirebbe due volte la stessa cifra.`,
    ru: `В области с числом ${sum} две клетки с разными цифрами, которые в сумме дают ${sum}. Поэтому половина ${sum} невозможна: понадобилась бы одна цифра дважды.`,
    hi: `${sum} लिखे दो सेल के समूह में दो अलग अंक हैं जिनका जोड़ ${sum} है, इसलिए ${sum} का आधा कभी नहीं आ सकता: उसके लिए वही अंक दो बार चाहिए।`,
    ar: `القفص المكتوب عليه ${sum} من خليتين فيهما رقمان مختلفان مجموعهما ${sum}، فلا يمكن أبدًا استعمال نصف ${sum}: سيحتاج الرقم نفسه مرتين.`,
  } : {
    en: `In the two-cell cage marked ${sum}, the other cell is at least 1, so no digit bigger than ${sum - 1} fits.`,
    ko: `합 ${sum}짜리 두 칸 묶음에서 다른 칸은 아무리 작아도 1입니다. 그래서 ${sum - 1}보다 큰 숫자는 들어갈 수 없습니다.`,
    ja: `「${sum}」の2マスのケージでは、もう1マスはどんなに小さくても1です。だから${sum - 1}より大きい数字は入りません。`,
    'zh-CN': `标着 ${sum} 的两格笼子里，另一格最小也是 1，所以大于 ${sum - 1} 的数字放不进去。`,
    'zh-TW': `標著 ${sum} 的兩格籠子裡，另一格最小也是 1，所以大於 ${sum - 1} 的數字放不進去。`,
    'es-ES': `En la jaula de dos casillas marcada con ${sum}, la otra casilla vale como mínimo 1, así que no cabe ninguna cifra mayor que ${sum - 1}.`,
    de: `Im Käfig mit der ${sum} aus zwei Feldern ist das andere Feld mindestens 1, also passt keine Ziffer größer als ${sum - 1}.`,
    fr: `Dans la cage de deux cases marquée ${sum}, l’autre case vaut au moins 1${NB}: aucun chiffre supérieur à ${sum - 1} n’y entre.`,
    pt: `Na gaiola de duas casas marcada com ${sum}, a outra casa vale no mínimo 1, então nenhum número maior que ${sum - 1} cabe.`,
    it: `Nella gabbia di due caselle con ${itArt(sum)}, l’altra casella vale almeno 1, quindi nessuna cifra maggiore di ${sum - 1} ci sta.`,
    ru: `В области из двух клеток с числом ${sum} другая клетка не меньше 1, поэтому цифра больше ${sum - 1} не подходит.`,
    hi: `${sum} लिखे दो सेल के समूह में दूसरा सेल कम से कम 1 है, इसलिए ${sum - 1} से बड़ा कोई अंक नहीं आ सकता।`,
    ar: `في القفص المكتوب عليه ${sum} من خليتين، الخلية الأخرى 1 على الأقل، فلا يدخل أي رقم أكبر من ${sum - 1}.`,
  }),
  facts(p) {
    const cage = p.cages[p.finding.cage];
    if (cage.cells.length !== 2) throw new Error(`${p.seed}: K14 sentences say two cells`);
    const a = p.question.answer;
    return { sum: cage.sum, t: rc(p.question.target), why: pairReason(cage.sum, a) };
  },
};

// ── K4: a digit every combination shares, cage inside one house ──────────────
const UNIT = {
  box: { en: 'box', ko: '박스', ja: 'ブロック', 'zh-CN': '九宫格', 'zh-TW': '九宮格', 'es-ES': 'un mismo bloque', de: 'einem Block', fr: 'un seul bloc', pt: 'num só bloco', it: 'in un solo blocco', ru: 'одном блоке', hi: 'बॉक्स', ar: 'مربع' },
  col: { en: 'column', ko: '세로줄', ja: '列', 'zh-CN': '列', 'zh-TW': '列', 'es-ES': 'una misma columna', de: 'einer Spalte', fr: 'une seule colonne', pt: 'numa só coluna', it: 'in una sola colonna', ru: 'одном столбце', hi: 'स्तंभ', ar: 'عمود' },
  row: { en: 'row', ko: '가로줄', ja: '行', 'zh-CN': '行', 'zh-TW': '行', 'es-ES': 'una misma fila', de: 'einer Zeile', fr: 'une seule ligne', pt: 'numa só linha', it: 'in una sola riga', ru: 'одной строке', hi: 'पंक्ति', ar: 'صف' },
};
const OR = {
  en: ' or ', ko: ' 또는 ', ja: ' か ', 'zh-CN': ' 或 ', 'zh-TW': ' 或 ', 'es-ES': ' o ', de: ' oder ', fr: ' ou ',
  pt: ' ou ', it: ' o ', ru: ' или ', hi: ' या ', ar: ' أو ',
};
const K4 = {
  name: {
    en: 'Must-Contain Digit', ko: '꼭 들어가는 숫자', ja: '必ず入る数字', 'zh-CN': '必含数字', 'zh-TW': '必含數字',
    'es-ES': 'Cifra obligada', de: 'Pflichtziffer', fr: 'Chiffre obligé', pt: 'Número obrigatório',
    it: 'Cifra obbligata', ru: 'Обязательная цифра', hi: 'ज़रूरी अंक', ar: 'رقم إلزامي',
  },
  guide: ({ sum, n, combos, unit, t }) => {
    const c = (lang) => combos.map((x) => (lang === 'ar' ? `${LRI}${x}${PDI}` : x)).join(OR[lang]);
    const u = UNIT[unit];
    return withAsk(t, {
      en: `The cage marked ${sum} has ${n} cells and can only be ${c('en')}. Both ways share one digit, and the whole cage lies in one ${u.en}.`,
      ko: `합 ${sum}짜리 ${n}칸 묶음은 ${c('ko')}뿐입니다. 두 경우 모두 같은 숫자가 하나 들어 있고, 묶음 전체가 한 ${u.ko} 안에 있습니다.`,
      ja: `「${sum}」の${n}マスのケージは ${c('ja')} しかありません。どちらにも共通の数字が1つあり、ケージ全体が1つの${u.ja}に入っています。`,
      'zh-CN': `标着 ${sum} 的 ${n} 格笼子只能是 ${c('zh-CN')}。两种都含有同一个数字，而且整个笼子在同一个${u['zh-CN']}里。`,
      'zh-TW': `標著 ${sum} 的 ${n} 格籠子只能是 ${c('zh-TW')}。兩種都含有同一個數字，而且整個籠子在同一個${u['zh-TW']}裡。`,
      'es-ES': `La jaula marcada con ${sum} tiene ${n} casillas y solo puede ser ${c('es-ES')}. Las dos opciones comparten una cifra, y toda la jaula está en ${u['es-ES']}.`,
      de: `Der Käfig mit der ${sum} hat ${n} Felder und kann nur ${c('de')} sein. Beide haben eine Ziffer gemeinsam, und der ganze Käfig liegt in ${u.de}.`,
      fr: `La cage marquée ${sum} a ${n} cases et ne peut être que ${c('fr')}. Les deux ont un chiffre en commun, et toute la cage est dans ${u.fr}.`,
      pt: `A gaiola marcada com ${sum} tem ${n} casas e só pode ser ${c('pt')}. As duas têm um número em comum, e a gaiola inteira está ${u.pt}.`,
      it: `La gabbia con ${itArt(sum)} ha ${n} caselle e può essere solo ${c('it')}. Le due hanno una cifra in comune, e tutta la gabbia sta ${u.it}.`,
      ru: `Область с числом ${sum} из ${n} клеток может быть только ${c('ru')}. В обоих вариантах есть общая цифра, и вся область лежит в ${u.ru}.`,
      hi: `${sum} लिखे ${n} सेल के समूह में सिर्फ़ ${c('hi')} हो सकता है। दोनों में एक अंक साझा है, और पूरा समूह एक ही ${u.hi} में है।`,
      ar: `القفص المكتوب عليه ${sum} من ${n} خلايا لا يكون إلا ${c('ar')}. في الحالتين رقم مشترك، والقفص كله في ${u.ar} واحد.`,
    });
  },
  facts(p) {
    const f = p.finding;
    const cage = p.cages[f.cage];
    if (cage.cells.some((i) => p.val[i])) throw new Error(`${p.seed}: K4 sentences read the whole cage — it must be empty`);
    const combos = SETS[cage.cells.length][cage.sum].map((m) => digits(m).join('+')).sort();
    if (combos.length !== 2) throw new Error(`${p.seed}: K4 sentences say two ways`);
    const unit = f.unit.replace(/\d+$/, '');
    return { sum: cage.sum, n: cage.cells.length, combos, unit, t: rc(p.question.target) };
  },
};

// The cages a 45-rule finding counts, checked against the board: no digit already
// placed takes part, so the sentence "45 − the cages" is the whole story.
function relation(p) {
  const f = p.finding;
  const H = HOUSE_SETS.find((h) => h.name === f.house);
  if (H.k !== 1 || !f.house.startsWith('b')) throw new Error(`${p.seed}: sentences say one box`);
  const q = new Set(f.cages.flatMap((k) => p.cages[k].cells));
  const touched = [...H.cells.filter((i) => !q.has(i)), ...[...q].filter((i) => !H.set.has(i))];
  if (touched.some((i) => p.val[i])) throw new Error(`${p.seed}: a placed digit takes part — "45 − the cages" would be wrong`);
  return { H, sums: f.cages.map((k) => p.cages[k].sum) };
}

// ── K5: two cells left in a box form a hidden cage ───────────────────────────
const K5 = {
  name: {
    en: 'Hidden Cage', ko: '숨은 묶음', ja: '見えざるケージ', 'zh-CN': '隐藏的笼子', 'zh-TW': '隱藏的籠子',
    'es-ES': 'Jaula oculta', de: 'Versteckter Käfig', fr: 'Cage cachée', pt: 'Gaiola oculta',
    it: 'Gabbia nascosta', ru: 'Скрытая область', hi: 'छिपा समूह', ar: 'قفص مخفي',
  },
  guide: ({ sums, g, S, t, why }) => {
    const m = minus(45, sums);
    const half = why === 'half';
    return withAsk(t, {
      en: `The cages marked ${list('en', sums)} cover the colored box except ${cells('en', g)}. So those two cells add up to ${m} = ${S}, like a hidden cage of two cells. ${half ? 'They are in the same box, so their digits differ.' : 'The other cell is at least 1.'}`,
      ko: `합 ${list('ko', sums)}인 묶음들이 색칠된 박스를 ${cells('ko', g)} 두 칸만 남기고 덮습니다. 그래서 두 칸의 합은 ${m} = ${S}이고, 두 칸짜리 숨은 묶음과 같습니다. ${half ? '두 칸은 같은 박스에 있어 서로 다른 숫자입니다.' : '다른 칸은 아무리 작아도 1입니다.'}`,
      ja: `「${sums.join('」と「')}」のケージが、${cells('ja', g)} を残して色付きブロックを覆っています。だからこの2マスの合計は ${m} = ${S} で、2マスの見えざるケージと同じです。${half ? '2マスは同じブロックにあるので数字は異なります。' : 'もう1マスはどんなに小さくても1です。'}`,
      'zh-CN': `标着 ${list('zh-CN', sums)} 的笼子盖住了着色的九宫格，只剩 ${cells('zh-CN', g)}。所以这两格的总和是 ${m} = ${S}，就像一个两格的隐藏笼子。${half ? '这两格在同一个九宫格里，数字不同。' : '另一格最小也是 1。'}`,
      'zh-TW': `標著 ${list('zh-TW', sums)} 的籠子蓋住了著色的九宮格，只剩 ${cells('zh-TW', g)}。所以這兩格的總和是 ${m} = ${S}，就像一個兩格的隱藏籠子。${half ? '這兩格在同一個九宮格裡，數字不同。' : '另一格最小也是 1。'}`,
      'es-ES': `Las jaulas marcadas con ${list('es-ES', sums)} cubren el bloque resaltado salvo ${cells('es-ES', g)}. Esas dos casillas suman ${m} = ${S}, como una jaula oculta de dos casillas. ${half ? 'Están en el mismo bloque, así que sus cifras son distintas.' : 'La otra casilla vale como mínimo 1.'}`,
      de: `Die Käfige mit ${list('de', sums)} decken den markierten Block bis auf ${cells('de', g)} ab. Diese zwei Felder ergeben also ${m} = ${S}, wie ein versteckter Käfig aus zwei Feldern. ${half ? 'Sie liegen im selben Block, ihre Ziffern sind also verschieden.' : 'Das andere Feld ist mindestens 1.'}`,
      fr: `Les cages marquées ${list('fr', sums)} couvrent le bloc en couleur sauf ${cells('fr', g)}. Ces deux cases font donc ${m} = ${S}, comme une cage cachée de deux cases. ${half ? 'Elles sont dans le même bloc, donc leurs chiffres diffèrent.' : 'L’autre case vaut au moins 1.'}`,
      pt: `As gaiolas marcadas com ${list('pt', sums)} cobrem o bloco destacado, exceto ${cells('pt', g)}. Essas duas casas somam ${m} = ${S}, como uma gaiola oculta de duas casas. ${half ? 'Elas estão no mesmo bloco, então têm números diferentes.' : 'A outra casa vale no mínimo 1.'}`,
      it: `Le gabbie con ${list('it', sums)} coprono il blocco evidenziato tranne ${cells('it', g)}. Queste due caselle sommano quindi ${m} = ${S}, come una gabbia nascosta di due caselle. ${half ? 'Stanno nello stesso blocco, quindi hanno cifre diverse.' : 'L’altra casella vale almeno 1.'}`,
      ru: `Области с числами ${list('ru', sums)} закрывают выделенный блок, кроме ${cells('ru', g)}. Значит, эти две клетки дают ${m} = ${S}, как скрытая область из двух клеток. ${half ? 'Они в одном блоке, поэтому цифры в них разные.' : 'Другая клетка не меньше 1.'}`,
      hi: `${list('hi', sums)} लिखे समूह रंगीन बॉक्स को ${cells('hi', g)} छोड़कर ढकते हैं। इसलिए इन दो सेलों का जोड़ ${m} = ${S} है, जैसे दो सेल का छिपा समूह। ${half ? 'दोनों एक ही बॉक्स में हैं, इसलिए उनके अंक अलग हैं।' : 'दूसरा सेल कम से कम 1 है।'}`,
      ar: `${sums.length === 2 ? 'القفصان المكتوب عليهما' : 'الأقفاص المكتوب عليها'} ${list('ar', sums)} ${sums.length === 2 ? 'يغطيان' : 'تغطي'} المربع الملوّن ما عدا ${cells('ar', g)}. إذن مجموع هاتين الخليتين ${LRI}${m} = ${S}${PDI}، كقفص مخفي من خليتين. ${half ? 'هما في المربع نفسه، فرقماهما مختلفان.' : 'الخلية الأخرى 1 على الأقل.'}`,
    });
  },
  facts(p) {
    const f = p.finding;
    const { sums } = relation(p);
    if (f.outies.length || f.innies.length !== 2) throw new Error(`${p.seed}: K5 sentences say two cells left inside`);
    const S = f.diff;
    if (S !== 45 - sums.reduce((x, y) => x + y, 0)) throw new Error(`${p.seed}: 45 − cages is not the pair's sum`);
    return { sums, g: f.innies.map(rc), S, t: rc(p.question.target), why: pairReason(S, p.question.answer) };
  },
};

// ── K6: one cell in, one cell out — their difference ─────────────────────────
const K6 = {
  name: {
    en: 'Innie-Outie Difference', ko: '들어감·나감 차이', ja: '内側と外側の差', 'zh-CN': '里外之差', 'zh-TW': '裡外之差',
    'es-ES': 'Diferencia dentro-fuera', de: 'Innen-Außen-Differenz', fr: 'Différence dedans-dehors', pt: 'Diferença dentro-fora',
    it: 'Differenza dentro-fuori', ru: 'Разность внутри и снаружи', hi: 'अंदर-बाहर का अंतर', ar: 'فرق الداخل والخارج',
  },
  guide: ({ sums, i, o, D, t }) => {
    const eq = `${i} − ${o} = ${minus(45, sums)} = ${signed(D)}`;
    const n = Math.abs(D);
    const more = D > 0;
    return withAsk(t, {
      en: `The cages marked ${list('en', sums)} cover the colored box except ${i}, and one of their cells, ${o}, sticks out of it. So ${eq}: ${i} is always ${n} ${more ? 'more' : 'less'} than ${o}.`,
      ko: `합 ${list('ko', sums)}인 묶음들이 색칠된 박스를 ${i} 한 칸만 남기고 덮고, 그중 한 칸인 ${ko.eun(o)} 박스 밖으로 삐져나와 있습니다. 그래서 ${eq}, 즉 ${ko.eun(i)} 언제나 ${o}보다 ${n} ${more ? '큽니다' : '작습니다'}.`,
      ja: `「${sums.join('」「')}」のケージが ${i} を残して色付きブロックを覆い、そのうち1マス ${o} がブロックの外にはみ出しています。だから ${eq}、つまり ${i} はいつも ${o} より ${n} ${more ? '大きい' : '小さい'}です。`,
      'zh-CN': `标着 ${list('zh-CN', sums)} 的笼子盖住了着色的九宫格，只剩 ${i}，其中一格 ${o} 伸到了九宫格外面。所以 ${eq}，也就是 ${i} 总是比 ${o} ${more ? '大' : '小'} ${n}。`,
      'zh-TW': `標著 ${list('zh-TW', sums)} 的籠子蓋住了著色的九宮格，只剩 ${i}，其中一格 ${o} 伸到了九宮格外面。所以 ${eq}，也就是 ${i} 總是比 ${o} ${more ? '大' : '小'} ${n}。`,
      'es-ES': `Las jaulas marcadas con ${list('es-ES', sums)} cubren el bloque resaltado salvo ${i}, y una de sus casillas, ${o}, sobresale. Así que ${eq}: ${i} siempre vale ${n} ${more ? 'más' : 'menos'} que ${o}.`,
      de: `Die Käfige mit ${list('de', sums)} decken den markierten Block bis auf ${i} ab, und eines ihrer Felder, ${o}, ragt hinaus. Also ist ${eq}: ${i} ist immer um ${n} ${more ? 'größer' : 'kleiner'} als ${o}.`,
      fr: `Les cages marquées ${list('fr', sums)} couvrent le bloc en couleur sauf ${i}, et l’une de leurs cases, ${o}, en dépasse. Donc ${eq}${NB}: ${i} vaut toujours ${n} de ${more ? 'plus' : 'moins'} que ${o}.`,
      pt: `As gaiolas marcadas com ${list('pt', sums)} cobrem o bloco destacado, exceto ${i}, e uma das casas delas, ${o}, fica para fora. Então ${eq}: ${i} vale sempre ${n} a ${more ? 'mais' : 'menos'} que ${o}.`,
      it: `Le gabbie con ${list('it', sums)} coprono il blocco evidenziato tranne ${i}, e una delle loro caselle, ${o}, sporge fuori. Quindi ${eq}: ${i} vale sempre ${n} in ${more ? 'più' : 'meno'} di ${o}.`,
      ru: `Области с числами ${list('ru', sums)} закрывают выделенный блок, кроме ${i}, а одна их клетка, ${o}, выступает наружу. Значит, ${eq}: в ${i} всегда на ${n} ${more ? 'больше' : 'меньше'}, чем в ${o}.`,
      hi: `${list('hi', sums)} लिखे समूह रंगीन बॉक्स को ${i} छोड़कर ढकते हैं, और उनका एक सेल ${o} बॉक्स से बाहर निकला है। इसलिए ${eq}, यानी ${i} हमेशा ${o} से ${n} ${more ? 'ज़्यादा' : 'कम'} है।`,
      ar: `${sums.length === 2 ? 'القفصان المكتوب عليهما' : 'الأقفاص المكتوب عليها'} ${list('ar', sums)} ${sums.length === 2 ? 'يغطيان' : 'تغطي'} المربع الملوّن ما عدا ${i}، وإحدى خلاياها ${o} تبرز خارجه. إذن ${LRI}${eq}${PDI}، أي أن ${i} دائمًا ${more ? 'أكبر' : 'أصغر'} من ${o} بمقدار ${n}.`,
    });
  },
  facts(p) {
    const f = p.finding;
    const { sums } = relation(p);
    if (f.innies.length !== 1 || f.outies.length !== 1) throw new Error(`${p.seed}: K6 sentences say one in, one out`);
    const D = f.diff;
    if (D !== 45 - sums.reduce((x, y) => x + y, 0)) throw new Error(`${p.seed}: 45 − cages is not the difference`);
    return { sums, i: rc(f.innies[0]), o: rc(f.outies[0]), D, t: rc(p.question.target) };
  },
};

// ── K7: the cage that crosses the edge, cut in two ───────────────────────────
const K7 = {
  name: {
    en: 'Cage Splitting', ko: '묶음 쪼개기', ja: 'ケージの分割', 'zh-CN': '拆分笼子', 'zh-TW': '拆分籠子',
    'es-ES': 'Dividir la jaula', de: 'Käfig teilen', fr: 'Couper la cage', pt: 'Dividir a gaiola',
    it: 'Dividere la gabbia', ru: 'Разделение области', hi: 'समूह को बाँटना', ar: 'تقسيم القفص',
  },
  guide: ({ sums, X, xin, xout, sIn, sOut, t }) => {
    const inEq = `${minus(45, sums)} = ${sIn}`;
    const outEq = `${X} − ${sIn} = ${sOut}`;
    return withAsk(t, {
      en: `The cages marked ${list('en', sums)} fill the colored box except ${cells('en', xin)}, which belong to the cage marked ${X} that crosses the edge. Inside part: ${inEq}. Outside part: ${outEq}, so ${cells('en', xout)} add up to ${sOut}.`,
      ko: `합 ${list('ko', sums)}인 묶음들이 색칠된 박스를 ${cells('ko', xin)}만 남기고 채우는데, 이 두 칸은 경계를 넘는 합 ${X}짜리 묶음의 일부입니다. 안쪽 부분: ${inEq}. 바깥 부분: ${outEq}이므로 ${cells('ko', xout)}의 합은 ${sOut}입니다.`,
      ja: `「${sums.join('」「')}」のケージが ${cells('ja', xin)} を残して色付きブロックを埋めています。この2マスは境界をまたぐ「${X}」のケージの一部です。内側の部分は ${inEq}、外側の部分は ${outEq} なので、${cells('ja', xout)} の合計は ${sOut} です。`,
      'zh-CN': `标着 ${list('zh-CN', sums)} 的笼子填满了着色的九宫格，只剩 ${cells('zh-CN', xin)}，这两格属于跨过边界、标着 ${X} 的笼子。里面部分：${inEq}。外面部分：${outEq}，所以 ${cells('zh-CN', xout)} 的总和是 ${sOut}。`,
      'zh-TW': `標著 ${list('zh-TW', sums)} 的籠子填滿了著色的九宮格，只剩 ${cells('zh-TW', xin)}，這兩格屬於跨過邊界、標著 ${X} 的籠子。裡面部分：${inEq}。外面部分：${outEq}，所以 ${cells('zh-TW', xout)} 的總和是 ${sOut}。`,
      'es-ES': `Las jaulas marcadas con ${list('es-ES', sums)} llenan el bloque resaltado salvo ${cells('es-ES', xin)}, que son parte de la jaula marcada con ${X} que cruza el borde. Parte de dentro: ${inEq}. Parte de fuera: ${outEq}, así que ${cells('es-ES', xout)} suman ${sOut}.`,
      de: `Die Käfige mit ${list('de', sums)} füllen den markierten Block bis auf ${cells('de', xin)}; diese gehören zum Käfig mit der ${X}, der über den Rand reicht. Innerer Teil: ${inEq}. Äußerer Teil: ${outEq}, also ergeben ${cells('de', xout)} zusammen ${sOut}.`,
      fr: `Les cages marquées ${list('fr', sums)} remplissent le bloc en couleur sauf ${cells('fr', xin)}, qui font partie de la cage marquée ${X} qui franchit le bord. Partie dedans${NB}: ${inEq}. Partie dehors${NB}: ${outEq}, donc ${cells('fr', xout)} font ${sOut} à elles deux.`,
      pt: `As gaiolas marcadas com ${list('pt', sums)} preenchem o bloco destacado, exceto ${cells('pt', xin)}, que fazem parte da gaiola marcada com ${X} que cruza a borda. Parte de dentro: ${inEq}. Parte de fora: ${outEq}, então ${cells('pt', xout)} somam ${sOut}.`,
      it: `Le gabbie con ${list('it', sums)} riempiono il blocco evidenziato tranne ${cells('it', xin)}, che fanno parte della gabbia con ${itArt(X)} che attraversa il bordo. Parte dentro: ${inEq}. Parte fuori: ${outEq}, quindi ${cells('it', xout)} sommano ${sOut}.`,
      ru: `Области с числами ${list('ru', sums)} заполняют выделенный блок, кроме ${cells('ru', xin)}, а эти клетки входят в область с числом ${X}, которая выходит за границу. Внутренняя часть: ${inEq}. Внешняя часть: ${outEq}, значит, ${cells('ru', xout)} вместе дают ${sOut}.`,
      hi: `${list('hi', sums)} लिखे समूह रंगीन बॉक्स को ${cells('hi', xin)} छोड़कर भरते हैं, और ये सेल सीमा पार करने वाले ${X} लिखे समूह का हिस्सा हैं। अंदर का हिस्सा: ${inEq}। बाहर का हिस्सा: ${outEq}, इसलिए ${cells('hi', xout)} का जोड़ ${sOut} है।`,
      ar: `${sums.length === 2 ? 'القفصان المكتوب عليهما' : 'الأقفاص المكتوب عليها'} ${list('ar', sums)} ${sums.length === 2 ? 'يملآن' : 'تملأ'} المربع الملوّن ما عدا ${cells('ar', xin)}، وهاتان الخليتان جزء من القفص المكتوب عليه ${X} الذي يعبر الحد. الجزء الداخلي: ${LRI}${inEq}${PDI}. الجزء الخارجي: ${LRI}${outEq}${PDI}، إذن مجموع ${cells('ar', xout)} هو ${sOut}.`,
    });
  },
  facts(p) {
    const f = p.finding;
    relation(p);
    if (f.innies.length || f.outies.length !== 2) throw new Error(`${p.seed}: K7 sentences say two cells outside`);
    const xk = p.cageOf ? p.cageOf[f.outies[0]] : f.cages.find((k) => p.cages[k].cells.includes(f.outies[0]));
    const X = p.cages[xk];
    const H = HOUSE_SETS.find((h) => h.name === f.house);
    const xin = X.cells.filter((i) => H.set.has(i));
    if (xin.length !== 2 || X.cells.some((i) => p.val[i])) throw new Error(`${p.seed}: K7 sentences say two empty cells inside`);
    const inside = f.cages.filter((k) => k !== xk).map((k) => p.cages[k].sum);
    // "The cages marked 14 and 18 … belong to the cage marked 18" reads as one cage.
    if (inside.includes(X.sum)) throw new Error(`${p.seed}: the crossing cage has the same sum as a cage inside`);
    const sIn = 45 - inside.reduce((x, y) => x + y, 0);
    const sOut = X.sum - sIn;
    if (-sOut !== f.diff) throw new Error(`${p.seed}: the split does not match the finding`);
    return { sums: inside, X: X.sum, xin: xin.map(rc), xout: f.outies.map(rc), sIn, sOut, t: rc(p.question.target) };
  },
};

// Which pick each mission uses — by seed, so re-running the lab does not move it.
const MISSIONS = [
  ['killer-cage-remainder', K1, 'K1', ['kl-5-35', 'kl-5-122']],
  ['killer-unique-combination', K2, 'K2', ['kl-4-54', 'kl-4-60']],
  ['killer-two-cell-sums', K14, 'K14', ['kl-5-12', 'kl-5-10']],
  ['killer-rule-45', K3, 'K3', ['kl-5-128', 'kl-5-85']],
  ['killer-must-contain', K4, 'K4', ['kl-5-157', 'kl-5-133']],
  ['killer-hidden-cage', K5, 'K5', ['kl-5-169', 'kl-5-189']],
  ['killer-innie-outie-difference', K6, 'K6', ['kl-5-80', 'kl-5-5']],
  ['killer-cage-splitting', K7, 'K7', ['kx-5-2332', 'kx-5-2270']],
];

const out = {};
for (const [strategyId, T, tech, seeds] of MISSIONS) {
  out[strategyId] = seeds.map((seed, j) => {
    const pick = picks[tech].find((p) => p.seed === seed);
    if (!pick) throw new Error(`${tech} ${seed} is not in picks_killer.json — re-run select.mjs`);
    const facts = T.facts(pick);
    const names = T.title ? T.title(facts) : T.name;
    const guide = T.guide(facts);
    const title = Object.fromEntries(Object.keys(EXAMPLE).map((l) => [l, EXAMPLE[l](j + 1) + names[l]]));
    const id = `${strategyId.replace(/-/g, '_')}_ex${j + 1}`;
    const m = toMission(pick, id);
    return { id, title, guide, ...Object.fromEntries(Object.entries(m).filter(([k]) => k !== 'id')) };
  });
}

const header = `/**
 * killerPractice.js — practice boards for the killer stage (stageKiller.js).
 *
 * WRITTEN BY scripts/academy/killer/write_killer.mjs — change the sentences there
 * and run it again; an edit here is lost the next time it runs.
 *
 * Each board is one of our own killers at a moment where the technique is needed
 * (nothing easier finds anything), with its cages. Gate 2-5 solves every board from
 * its cages and digits and checks the answer and every removal against that solution.
 */

export const KILLER_PRACTICE = {
${Object.entries(out).map(([id, ms]) => `  '${id}': [\n${ms.map((m) => `    ${JSON.stringify(m)}`).join(',\n')}\n  ]`).join(',\n')}
};
`;
fs.writeFileSync(OUT, header);
console.log(`wrote ${path.relative(process.cwd(), OUT)} — ${Object.values(out).flat().length} missions`);
