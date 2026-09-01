import fs from 'fs';
import path from 'path';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';

// 1. Comprehensive zh-TW Simplified to Traditional Chinese Dictionary Mapping
const ZH_TW_CHAR_MAP = {
  '选': '選', '观': '觀', '戏': '戲', '广': '廣', '删': '刪',
  '员': '員', '买': '買', '记': '記', '个': '個', '务': '務',
  '钟': '鐘', '历': '曆', '败': '敗', '输': '輸', '则': '則',
  '体': '體', '关': '關', '级': '級', '这': '這', '为': '為',
  '来': '來', '会': '會', '简': '簡', '错': '錯', '短': '短',
  '随': '隨', '并': '並', '补': '補', '签': '簽', '横': '橫',
  '幅': '幅', '与': '與', '后': '後', '插': '插', '页': '頁',
  '误': '誤', '数': '數', '红': '紅',
  '游': '遊', '注': '註',
  '册': '冊', '绝': '絕',
  '达': '達', '第': '第', '阶': '階',
  '高': '高', '巧': '巧', '翼': '翼',
  '鱼': '魚', '类': '類', '法': '法',
  '决': '決', '惜': '惜', '确': '確', '定': '定',
  '认': '認', '对': '對', '难': '難', '题': '題',
  '开': '開', '复': '復', '获': '獲', '击': '擊', '双': '雙',
  '变': '變', '胜': '勝', '图': '圖', '画': '畫', '练': '練',
  '习': '習', '余': '餘', '场': '場', '参': '參', '点': '點',
  '键': '鍵', '盘': '盤', '无': '無', '纯': '純', '择': '擇', '谜': '謎'
};

// Word-level mappings for accurate traditional Chinese expressions
const ZH_TW_WORD_REPLACEMENTS = [
  { from: '分钟', to: '分鐘' },
  { from: '下来', to: '下來' },
  { from: '广告', to: '廣告' },
  { from: '未来的谜題', to: '未來的謎題' },
  { from: '错过的过往谜題', to: '錯過的過往謎題' },
  { from: '通过观看簡短广告随時解鎖并补签', to: '透過觀看簡短廣告隨時解鎖並補簽' },
  { from: '横幅广告與游戏結束后', to: '橫幅廣告與遊戲結束後' },
  { from: '输入錯誤數字時立即以红色警示', to: '輸入錯誤數字時立即以紅色警示' },
  { from: '删除', to: '刪除' },
  { from: '注册，绝不收集个人數據', to: '註冊，絕不收集個人資料' },
  { from: '游戏服务', to: '遊戲服務' },
  { from: '达成', to: '達成' },
  { from: '對決惜败', to: '對決惜敗' },
  { from: '認输并返回主页吗', to: '認輸並返回主頁嗎' },
  { from: '魚類法则', to: '魚類法則' },
  { from: '观察', to: '觀察' },
  { from: '正确', to: '正確' },
  { from: '返回主页', to: '返回主頁' },
  { from: '去广告', to: '去除廣告' },
  { from: '官方赞助广告', to: '官方贊助廣告' },
  { from: '个人', to: '個人' },
  { from: '纯粹數獨體验', to: '純粹數獨體驗' },
  { from: '纪錄', to: '紀錄' },
  { from: '日历', to: '日曆' }
];

function convertToTraditionalZh(content) {
  let res = content;
  for (const item of ZH_TW_WORD_REPLACEMENTS) {
    res = res.replaceAll(item.from, item.to);
  }
  // Single char pass for remaining simplified chars
  for (const [s, t] of Object.entries(ZH_TW_CHAR_MAP)) {
    res = res.replaceAll(s, t);
  }
  return res;
}

// 2. es-ES fixes
function fixEsES(content) {
  return content
    .replace('Contrarrelojner relámpago', 'Demonio del contrarreloj')
    .replace('Puzlero de plata', 'Experto en puzles de plata')
    .replace('Sincronizar Google / Apple Play', 'Sincronizar Google Play y Game Center')
    .replace('cumple estrictamente con el principio .', 'cumple estrictamente con el principio Zero-PII (cero datos personales).')
    .replace(/Acumula 5 victorias en Sudoku/g, 'Completa un total de 5 sudokus')
    .replace(/Acumula 10 victorias en Sudoku/g, 'Completa un total de 10 sudokus')
    .replace(/Acumula 25 victorias en Sudoku/g, 'Completa un total de 25 sudokus')
    .replace(/Acumula 50 victorias en Sudoku/g, 'Completa un total de 50 sudokus')
    .replace(/Acumula 100 victorias en Sudoku/g, 'Completa un total de 100 sudokus')
    .replace(/Acumula 250 victorias en Sudoku/g, 'Completa un total de 250 sudokus');
}

// 3. German (de) du tone fixes
function fixDe(content) {
  return content
    .replace('Trophäen und Erfolge werden automatisch mit Ihrem globalen Profil synchronisiert.', 'Trophäen und Erfolge werden automatisch mit deinem globalen Profil synchronisiert.')
    .replace('Lösen Sie Ihr allererstes Sudoku-Rätsel auf beliebiger Stufe', 'Löse dein allererstes Sudoku-Rätsel auf beliebiger Stufe')
    .replace(/Schließen Sie insgesamt (\d+) Sudoku-Rätsel ab/g, 'Löse insgesamt $1 Sudoku-Rätsel')
    .replace('Lösen Sie ein Rätsel mit 0 Fehlern', 'Löse ein Rätsel mit 0 Fehlern')
    .replace('Lösen Sie 5 Rätsel mit jeweils 0 Fehlern', 'Löse 5 Rätsel mit jeweils 0 Fehlern')
    .replace('Lösen Sie Ihr erstes Tages-Challenge-Rätsel', 'Löse dein erstes tägliches Rätsel')
    .replace('Sie haben das Rätsel erfolgreich gemeistert.', 'Du hast das Rätsel erfolgreich gemeistert.')
    .replace('Sie haben alle 3 Fehler aufgebraucht.', 'Du hast alle 3 Fehler aufgebraucht.')
    .replace('Sie haben alle Fehler aufgebraucht.', 'Du hast alle Fehler aufgebraucht.')
    .replace('Schließen Sie diesen Schwierigkeitsgrad mindestens 1 Mal ab, um ihn freizuschalten.', 'Schließe diesen Schwierigkeitsgrad mindestens 1 Mal ab, um ihn freizuschalten.')
    .replace('Lösen Sie ein Lv.1 Sehr Leicht Rätsel für logische Grundlagen.', 'Löse ein Lv.1 Sehr Leicht Rätsel für logische Grundlagen.')
    .replace('Lösen Sie ein Lv.2 Leicht Rätsel zur Vertiefung der Basistechniken.', 'Löse ein Lv.2 Leicht Rätsel zur Vertiefung der Basistechniken.')
    .replace('Lösen Sie ein Lv.3 Mittel oder höheres Rätsel für echte Deduktion.', 'Löse ein Lv.3 Mittel oder höheres Rätsel für echte Deduktion.')
    .replace('Lösen Sie das anspruchsvollste Lv.5 Experten-Rätsel der Eliteklasse.', 'Löse das anspruchsvollste Lv.5 Experten-Rätsel der Eliteklasse.')
    .replace('Schließen Sie ein Zeitrennen-Rätsel mit Kombo-Beschleunigung ab.', 'Schließe ein Zeitrennen-Rätsel mit Kombo-Beschleunigung ab.')
    .replace('Starten Sie ein neues Spiel und feiern Sie Ihren ersten Sieg!', 'Starte ein neues Spiel und feiere deinen ersten Sieg!')
    .replace('Lösen Sie Rätsel der Stufen 1~5, um Ihr kognitives Gehirnprofil zu verfeinern.', 'Löse Rätsel der Stufen 1~5, um dein kognitives Gehirnprofil zu verfeinern.')
    .replace('Sie haben das Rätsel zuerst gelöst und {opponent} besiegt!', 'Du hast das Rätsel zuerst gelöst und {opponent} besiegt!')
    .replace('Wählen Sie einen KI-Gegner passend zu Ihrem Können.', 'Wähle einen KI-Gegner passend zu deinem Können.')
    .replace('Haben Sie Fragen oder Feedback?', 'Hast du Fragen oder Feedback?')
    .replace('Sie haben noch keine Spiele abgeschlossen.', 'Du hast noch keine Spiele abgeschlossen.')
    .replace('Sie haben die App neu installiert', 'Du hast die App neu installiert')
    .replace('hält sich strikt an das Zero-PII-Prinzip', 'hält sich strikt an das Zero-PII-Prinzip (keine Erfassung persönlicher Daten)');
}

// 4. pt fixes
function fixPt(content) {
  return content
    .replace('🏆 Classificaçãoings Globais', '🏆 Classificações Globais')
    .replace('🌐 🏆 Ver Classificaçãos Globais', '🌐 🏆 Ver Classificações Globais')
    .replace('trofu', 'troféu')
    .replace('screens.home.nav.stats: "Stats"', 'screens.home.nav.stats: "Estatísticas"')
    .replace("stats: 'Stats'", "stats: 'Estatísticas'")
    .replace('estritamente com o princípio .', 'estritamente com o princípio Zero-PII (zero coleta de dados pessoais).')
    .replace(/⚡ (Speedrun|Contra o Tempo) \(Contra o Tempo\)/g, '⚡ Contra o Tempo')
    .replace(/Conclua um total de (\d+) tabuleiros/g, 'Conclua um total de $1 quebra-cabeças');
}

// 5. fr fixes
function fixFr(content) {
  return content
    .replace('respecte le principe .', 'respecte strictement le principe Zero-PII (aucune collecte de données personnelles).')
    .replace(/⚡ (Speedrun|Contre-la-montre) \(Contre-la-Montre\)/gi, '⚡ Contre-la-montre')
    .replace("statsTab: 'Aperçu des stats'", "statsTab: 'Aperçu des statistiques'")
    .replace("stats: 'Stats'", "stats: 'Statistiques'")
    .replace("Vous aimez Sudoku ?", "Vous aimez le Sudoku ?");
}

// 6. ja fixes
function fixJa(content) {
  return content
    .replace('AI 봇対戦 勝利！', 'AIボット戦 勝利！')
    .replace('AI 봇対戦 敗北', 'AIボット戦 敗北')
    .replace('AI 봇 練習対戦 (Lv.{level})', 'AIボット練習対戦 (Lv.{level})')
    .replace('厳格に準拠しています。', 'Zero-PII（個人情報ゼロ収集）原則に厳格に準拠しています。')
    .replace('メモ(Notes)機能', 'メモ機能');
}

// 7. zh-CN fixes
function fixZhCN(content) {
  return content
    .replace('并严格遵循 原则。', '并严格遵循 Zero-PII（零个人隐私数据收集）原则。')
    .replace('累计使用笔记 (Notes) 功能', '累计使用笔记功能')
    .replace('👑 特级大师 (Grand Master)', '👑 特级大师');
}

// 8. ar fixes
function fixAr(content) {
  return content
    .replace('👑 أستاذ كبير (Grand Master)', '👑 أستاذ كبير')
    .replace('ويخضع لمبدأ .', 'ويخضع بدقة لمبدأ Zero-PII (عدم جمع أي بيانات شخصية).');
}

// 9. Process all files in locales
const targetLocales = ['zh-TW', 'es-ES', 'de', 'pt', 'fr', 'ja', 'zh-CN', 'ar', 'it', 'ru', 'hi'];

for (const loc of targetLocales) {
  const dir = path.join(localesDir, loc);
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const f of files) {
    const full = path.join(dir, f);
    let content = fs.readFileSync(full, 'utf8');

    if (loc === 'zh-TW') content = convertToTraditionalZh(content);
    if (loc === 'es-ES') content = fixEsES(content);
    if (loc === 'de') content = fixDe(content);
    if (loc === 'pt') content = fixPt(content);
    if (loc === 'fr') content = fixFr(content);
    if (loc === 'ja') content = fixJa(content);
    if (loc === 'zh-CN') content = fixZhCN(content);
    if (loc === 'ar') content = fixAr(content);

    fs.writeFileSync(full, content, 'utf8');
  }
}

console.log('✅ All 11 non-English locale dictionaries patched successfully!');
