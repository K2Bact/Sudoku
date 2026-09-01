import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

// Language specific comprehensive dictionary replacements
const replacements = {
  fr: {
    'Speedrun': 'Contre-la-montre',
    'speedrun': 'contre-la-montre',
    'Lancer Speedrun': 'Lancer Contre-la-montre',
    'Mode Speedrun': 'Mode Contre-la-montre',
    '🎯 Standard': '🎯 Normal',
    'Standard': 'Normal',
    'Rank Clásico': 'Classement Classique',
    'Rank Speedrun': 'Classement Contre-la-montre',
    'Rank': 'Rang',
    'Ranking': 'Classement',
    'Combo': 'Série'
  },
  de: {
    'Speedrun': 'Zeitrennen',
    'speedrun': 'zeitrennen',
    'Lancer Speedrun': 'Zeitrennen starten',
    'Starte Speedrun': 'Zeitrennen starten',
    'Mode Speedrun': 'Zeitrennen-Modus',
    '🎯 Standard': '🎯 Normal',
    'Standard': 'Normal',
    'Rank': 'Rang',
    'Ranking': 'Bestenliste',
    'Bestenlisten & Ränge': 'Bestenlisten & Ränge'
  },
  pt: {
    'Speedrun': 'Contra o Tempo',
    'speedrun': 'contra o tempo',
    'Iniciar Speedrun': 'Iniciar Contra o Tempo',
    'Modo Speedrun': 'Modo Contra o Tempo',
    '🎯 Standard': '🎯 Normal',
    'Standard': 'Normal',
    'Rank Clássico': 'Classificação Clássica',
    'Rank Speedrun': 'Classificação Contra o Tempo',
    'Ranking Global': 'Classificação Global',
    'Ver Ranking': 'Ver Classificação',
    'Rank': 'Classificação',
    'Ranking': 'Classificação'
  },
  it: {
    'Speedrun': 'Cronometro',
    'speedrun': 'cronometro',
    'Avvia Speedrun': 'Avvia Cronometro',
    'Modalità Speedrun': 'Modalità Cronometro',
    '🎯 Standard': '🎯 Standard',
    'Rank': 'Classifica',
    'Ranking': 'Classifica'
  },
  esES: {
    'Speedrun': 'Contrarreloj',
    'speedrun': 'contrarreloj',
    'Iniciar Speedrun': 'Iniciar Contrarreloj',
    'Modo Speedrun': 'Modo Contrarreloj',
    '🎯 Standard': '🎯 Estándar',
    'Standard': 'Estándar',
    'Ránking': 'Clasificación',
    'Ranking': 'Clasificación'
  },
  ja: {
    'Standard': '通常',
    '🎯 Standard': '🎯 通常',
    'Speedrun': 'タイムアタック',
    'speedrun': 'タイムアタック',
    'スピードラン': 'タイムアタック',
    'TOP 10': 'TOP 10',
    'COMBO': '連続'
  },
  'zh-CN': {
    'Standard': '标准',
    '🎯 Standard': '🎯 标准',
    'Speedrun': '极速冲榜',
    'speedrun': '极速冲榜',
    'TOP 10': 'TOP 10',
    'COMBO': '连击'
  },
  'zh-TW': {
    'Standard': '標準',
    '🎯 Standard': '🎯 標準',
    'Speedrun': '極速衝榜',
    'speedrun': '極速衝榜',
    'TOP 10': 'TOP 10',
    'COMBO': '連擊'
  },
  ko: {
    'Standard': '기본',
    '🎯 Standard': '🎯 기본',
    'Speedrun': '스피드런',
    'speedrun': '스피드런'
  },
  ru: {
    'Speedrun': 'Гонка на время',
    'speedrun': 'гонка на время',
    'Standard': 'Стандарт',
    '🎯 Standard': '🎯 Стандарт',
    'Серии Wing и метод Fish': 'Крылья и Рыбные методы'
  },
  hi: {
    'Speedrun': 'स्पीडरन',
    'Standard': 'मानक',
    '🎯 Standard': '🎯 मानक'
  },
  ar: {
    'Speedrun': 'سباق السرعة',
    'Standard': 'قياسي',
    '🎯 Standard': '🎯 قياسي'
  }
};

for (const [lang, map] of Object.entries(replacements)) {
  const dirName = lang === 'esES' ? 'es-ES' : lang;
  const dirPath = path.join(localesDir, dirName);
  if (!fs.existsSync(dirPath)) continue;

  for (const f of fs.readdirSync(dirPath)) {
    if (!f.endsWith('.js')) continue;
    const file = path.join(dirPath, f);
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    for (const [from, to] of Object.entries(map)) {
      if (content.includes(from)) {
        content = content.replaceAll(from, to);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Fully localized ${dirName}/${f}`);
    }
  }
}
