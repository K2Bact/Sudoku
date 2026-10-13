// Write the XY-Chain and AIC examples (picks_chains.json) into the academy data.
// Templates copied from the original writer so all 13 languages match the other in-house examples.
import fs from 'fs';
import { describe } from './present.mjs';
import { rc } from './core.mjs';
// French needs a no-break space before : ; ! ? — the l10n engine's gate 10 checks it, and its fixer writes it.
import { fixFrenchTypography } from '../../../../../app_common/l10n_engine/core/gate10_french_typography.mjs';

const P = new URL('../../../src/data/academy/practice/', import.meta.url);
const LOCALES = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es-ES', 'de', 'fr', 'pt', 'it', 'ru', 'hi', 'ar'];
const picks = JSON.parse(fs.readFileSync(new URL('./picks_chains.json', import.meta.url), 'utf8'));
const jobs = [];
picks['XY-Chain'].forEach((p, k) => jobs.push({ id: `xy_chains_ex${k + 1}`, i: k + 1, name: 'XY-Chain', p }));
picks.AIC.forEach((p, k) => jobs.push({ id: `aic_ex${k + 1}`, i: k + 1, name: 'AIC', p }));

const TITLE = {
  ko: (x) => `실전 예시 ${x.i}: ${x.tech}`, en: (x) => `Example ${x.i}: ${x.tech}`, ja: (x) => `実践例 ${x.i}: ${x.tech}`,
  'zh-CN': (x) => `实战范例 ${x.i}: ${x.tech}`, 'zh-TW': (x) => `實戰範例 ${x.i}: ${x.tech}`, 'es-ES': (x) => `Ejemplo práctico ${x.i}: ${x.tech}`,
  de: (x) => `Praxisbeispiel ${x.i}: ${x.tech}`, fr: (x) => `Exemple pratique ${x.i}: ${x.tech}`, pt: (x) => `Exemplo prático ${x.i}: ${x.tech}`,
  it: (x) => `Esempio pratico ${x.i}: ${x.tech}`, ru: (x) => `Практический пример ${x.i}: ${x.tech}`, hi: (x) => `व्यावहारिक उदाहरण ${x.i}: ${x.tech}`,
  ar: (x) => `مثال عملي ${x.i}: ${x.tech}`,
};
const ANSWER = {
  ko: (x) => `${x.step}. 이 패턴 때문에 목표 칸 ${x.cell}에서 ${x.dels}이(가) 지워지고 [${x.ans}]만 남습니다. ${x.ans}을(를) 입력하세요.`,
  en: (x) => `${x.step}. This pattern removes ${x.dels} from the target cell ${x.cell}, leaving only [${x.ans}]. Enter ${x.ans}.`,
  ja: (x) => `${x.step}。このパターンにより目標マス ${x.cell} から ${x.dels} が消え、[${x.ans}] だけが残ります。${x.ans} を入力してください。`,
  'zh-CN': (x) => `${x.step}。该模式从目标格 ${x.cell} 中排除 ${x.dels}，只剩下 [${x.ans}]。请输入 ${x.ans}。`,
  'zh-TW': (x) => `${x.step}。該模式從目標格 ${x.cell} 中排除 ${x.dels}，只剩下 [${x.ans}]。請輸入 ${x.ans}。`,
  'es-ES': (x) => `${x.step}. Este patrón elimina ${x.dels} de la casilla objetivo ${x.cell} y solo queda [${x.ans}]. Introduce ${x.ans}.`,
  de: (x) => `${x.step}. Dieses Muster streicht ${x.dels} aus dem Zielfeld ${x.cell}, übrig bleibt nur [${x.ans}]. Trage ${x.ans} ein.`,
  fr: (x) => `${x.step}. Ce motif retire ${x.dels} de la case cible ${x.cell} ; il ne reste que [${x.ans}]. Entrez ${x.ans}.`,
  pt: (x) => `${x.step}. Este padrão remove ${x.dels} da casa alvo ${x.cell}, restando apenas [${x.ans}]. Digite ${x.ans}.`,
  it: (x) => `${x.step}. Questo schema elimina ${x.dels} dalla casella obiettivo ${x.cell}, resta solo [${x.ans}]. Inserisci ${x.ans}.`,
  ru: (x) => `${x.step}. Этот узор исключает ${x.dels} из целевой клетки ${x.cell}, остаётся только [${x.ans}]. Введите ${x.ans}.`,
  hi: (x) => `${x.step}। यह पैटर्न लक्ष्य सेल ${x.cell} से ${x.dels} हटाता है, केवल [${x.ans}] बचता है। ${x.ans} दर्ज करें।`,
  ar: (x) => `${x.step}. يحذف هذا النمط ${x.dels} من الخلية الهدف ${x.cell}، فيبقى [${x.ans}] فقط. أدخل ${x.ans}.`,
};
const PLACE = {
  ko: (x) => `${x.step}. 목표 칸 ${x.cell}은 [${x.ans}]로 정해집니다. ${x.ans}을(를) 입력하세요.`,
  en: (x) => `${x.step}. The target cell ${x.cell} is fixed as [${x.ans}]. Enter ${x.ans}.`,
  ja: (x) => `${x.step}。目標マス ${x.cell} は [${x.ans}] に確定します。${x.ans} を入力してください。`,
  'zh-CN': (x) => `${x.step}。目标格 ${x.cell} 确定为 [${x.ans}]。请输入 ${x.ans}。`,
  'zh-TW': (x) => `${x.step}。目標格 ${x.cell} 確定為 [${x.ans}]。請輸入 ${x.ans}。`,
  'es-ES': (x) => `${x.step}. La casilla objetivo ${x.cell} queda fijada en [${x.ans}]. Introduce ${x.ans}.`,
  de: (x) => `${x.step}. Das Zielfeld ${x.cell} steht damit fest: [${x.ans}]. Trage ${x.ans} ein.`,
  fr: (x) => `${x.step}. La case cible ${x.cell} vaut [${x.ans}]. Entrez ${x.ans}.`,
  pt: (x) => `${x.step}. A casa alvo ${x.cell} fica definida como [${x.ans}]. Digite ${x.ans}.`,
  it: (x) => `${x.step}. La casella obiettivo ${x.cell} è fissata a [${x.ans}]. Inserisci ${x.ans}.`,
  ru: (x) => `${x.step}. Целевая клетка ${x.cell} определяется как [${x.ans}]. Введите ${x.ans}.`,
  hi: (x) => `${x.step}। लक्ष्य सेल ${x.cell} का मान [${x.ans}] तय होता है। ${x.ans} दर्ज करें।`,
  ar: (x) => `${x.step}. تتحدد الخلية الهدف ${x.cell} بالقيمة [${x.ans}]. أدخل ${x.ans}.`,
};
const ASK = {
  ko: (x) => `색이 칠해진 칸이 ${x.tech} 패턴입니다. 이 패턴 때문에 목표 칸 ${x.cell}에서 지워지는 후보는 무엇일까요?`,
  en: (x) => `The highlighted cells form the ${x.tech} pattern. Which candidate does it remove from the target cell ${x.cell}?`,
  ja: (x) => `色付きのマスが ${x.tech} のパターンです。このパターンで目標マス ${x.cell} から消える候補はどれでしょう？`,
  'zh-CN': (x) => `着色的格组成 ${x.tech} 模式。这个模式会从目标格 ${x.cell} 中排除哪个候选数？`,
  'zh-TW': (x) => `著色的格組成 ${x.tech} 模式。這個模式會從目標格 ${x.cell} 中排除哪個候選數？`,
  'es-ES': (x) => `Las casillas resaltadas forman el patrón ${x.tech}. ¿Qué candidato elimina de la casilla objetivo ${x.cell}?`,
  de: (x) => `Die markierten Felder bilden das Muster ${x.tech}. Welchen Kandidaten streicht es aus dem Zielfeld ${x.cell}?`,
  fr: (x) => `Les cases en couleur forment le motif ${x.tech}. Quel candidat retire-t-il de la case cible ${x.cell} ?`,
  pt: (x) => `As casas destacadas formam o padrão ${x.tech}. Qual candidato ele remove da casa alvo ${x.cell}?`,
  it: (x) => `Le caselle evidenziate formano lo schema ${x.tech}. Quale candidato elimina dalla casella obiettivo ${x.cell}?`,
  ru: (x) => `Выделенные клетки образуют узор ${x.tech}. Какого кандидата он исключает из целевой клетки ${x.cell}?`,
  hi: (x) => `रंगीन सेल ${x.tech} पैटर्न बनाती हैं। यह लक्ष्य सेल ${x.cell} से कौन-सा उम्मीदवार हटाता है?`,
  ar: (x) => `تشكّل الخلايا الملوّنة نمط ${x.tech}. أي مرشح يحذفه هذا النمط من الخلية الهدف ${x.cell}؟`,
};

const files = fs.readdirSync(P).filter((f) => f.endsWith('Practice.js'));
let n = 0;
for (const job of jobs) {
  const d = describe(job.p);
  const x = { i: job.i, tech: job.name, step: d.step, cell: rc(d.targetIndex), ans: d.correctVal, dels: d.dels };
  const tpl = d.type === 'answer' ? ANSWER : d.type === 'place' ? PLACE : ASK;
  const title = Object.fromEntries(LOCALES.map((l) => [l, TITLE[l](x)]));
  const guide = Object.fromEntries(LOCALES.map((l) => [l, tpl[l](x)]));
  title.fr = fixFrenchTypography(title.fr);
  guide.fr = fixFrenchTypography(guide.fr);
  const seed = `chain-${job.p.n}`;
  const body = [
    `      // Generated in-house: SudokuEngine full grid + minimiser, seed "${seed}". No external puzzle or text.`,
    `      // Step: ${d.step}`,
    `      title: ${JSON.stringify(title)},`,
    `      guide: ${JSON.stringify(guide)},`,
    '      layoutType: "grid9x9",',
    ...(d.type === 'eliminated' ? ['      asks: "eliminated",'] : []),
    `      targetIndex: ${d.targetIndex},`,
    `      correctVal: ${d.correctVal},`,
    `      cells: ${JSON.stringify(d.cells)}`,
  ].join('\n');
  const file = files.find((f) => fs.readFileSync(new URL(f, P), 'utf8').includes(`id: "${job.id}",`));
  if (!file) throw new Error(`${job.id}: no file`);
  const raw = fs.readFileSync(new URL(file, P), 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.replace(/\r\n/g, '\n');
  const re = new RegExp(`(\\n      id: "${job.id}",\\n)[\\s\\S]*?(\\n    \\})`);
  if (!re.test(s)) throw new Error(`${job.id}: entry not found`);
  s = s.replace(re, (m, h, t) => h + body + t);
  fs.writeFileSync(new URL(file, P), crlf ? s.replace(/\n/g, '\r\n') : s);
  n++;
}
console.log(`${n} in-house examples written`);
