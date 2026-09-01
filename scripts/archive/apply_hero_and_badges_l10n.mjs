import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

const localeUpdates = {
  ko: {
    classicBadge: '클래식',
    timeAttackBadge: '스피드런',
    timeLimitBadge: '서바이벌',
    brainPercentileShort: '상위 {percentile}% · 완주 {won}판',
    restartShort: '다시시작',
    newGameShort: '새 게임'
  },
  en: {
    classicBadge: 'CLASSIC',
    timeAttackBadge: 'SPEEDRUN',
    timeLimitBadge: 'SURVIVAL',
    brainPercentileShort: 'Top {percentile}% · {won} Wins',
    restartShort: 'Restart',
    newGameShort: 'New Game'
  },
  ja: {
    classicBadge: 'クラシック',
    timeAttackBadge: 'スピードラン',
    timeLimitBadge: 'サバイバル',
    brainPercentileShort: '上位 {percentile}% · 完走 {won}局',
    restartShort: 'やり直し',
    newGameShort: '新規対局'
  },
  'zh-CN': {
    classicBadge: '经典模式',
    timeAttackBadge: '极速冲榜',
    timeLimitBadge: '限时生存',
    brainPercentileShort: '超越前 {percentile}% · 通关 {won} 局',
    restartShort: '重开本局',
    newGameShort: '开新对局'
  },
  'zh-TW': {
    classicBadge: '經典模式',
    timeAttackBadge: '極速衝榜',
    timeLimitBadge: '限時生存',
    brainPercentileShort: '超越前 {percentile}% · 通關 {won} 局',
    restartShort: '重開本局',
    newGameShort: '開新對局'
  },
  'es-ES': {
    classicBadge: 'CLÁSICO',
    timeAttackBadge: 'CONTRARRELOJ',
    timeLimitBadge: 'SUPERVIVENCIA',
    brainPercentileShort: 'Top {percentile}% · {won} Victorias',
    restartShort: 'Reiniciar',
    newGameShort: 'Nueva partida'
  },
  de: {
    classicBadge: 'KLASSISCH',
    timeAttackBadge: 'SPEEDRUN',
    timeLimitBadge: 'ÜBERLEBEN',
    brainPercentileShort: 'Top {percentile}% · {won} Siege',
    restartShort: 'Neustart',
    newGameShort: 'Neues Spiel'
  },
  fr: {
    classicBadge: 'CLASSIQUE',
    timeAttackBadge: 'CHRONO',
    timeLimitBadge: 'SURVIE',
    brainPercentileShort: 'Top {percentile}% · {won} Victoires',
    restartShort: 'Recommencer',
    newGameShort: 'Nouvelle partie'
  },
  pt: {
    classicBadge: 'CLÁSSICO',
    timeAttackBadge: 'CONTRA O TEMPO',
    timeLimitBadge: 'SOBREVIVÊNCIA',
    brainPercentileShort: 'Top {percentile}% · {won} Vitórias',
    restartShort: 'Reiniciar',
    newGameShort: 'Novo Jogo'
  },
  it: {
    classicBadge: 'CLASSICO',
    timeAttackBadge: 'CRONOMETRO',
    timeLimitBadge: 'SOPRAVVIVENZA',
    brainPercentileShort: 'Top {percentile}% · {won} Vittorie',
    restartShort: 'Riavvia',
    newGameShort: 'Nuova partita'
  },
  ru: {
    classicBadge: 'КЛАССИКА',
    timeAttackBadge: 'СКОРОСТЬ',
    timeLimitBadge: 'ВЫЖИВАНИЕ',
    brainPercentileShort: 'Топ {percentile}% · {won} Побед',
    restartShort: 'Заново',
    newGameShort: 'Новая игра'
  },
  hi: {
    classicBadge: 'क्लासिक',
    timeAttackBadge: 'स्पीडरन',
    timeLimitBadge: 'उत्तरजीविता',
    brainPercentileShort: 'शीर्ष {percentile}% · {won} जीतें',
    restartShort: 'पुनः आरंभ',
    newGameShort: 'नया खेल'
  },
  ar: {
    classicBadge: 'كلاسيكي',
    timeAttackBadge: 'سباق السرعة',
    timeLimitBadge: 'البقاء',
    brainPercentileShort: 'أفضل {percentile}% · {won} انتصارات',
    restartShort: 'إعادة',
    newGameShort: 'لعبة جديدة'
  }
};

for (const [lang, data] of Object.entries(localeUpdates)) {
  const screensPath = path.join(localesDir, lang, 'screens.js');
  const commonPath = path.join(localesDir, lang, 'common.js');

  if (fs.existsSync(screensPath)) {
    let sc = fs.readFileSync(screensPath, 'utf8');

    // Update badges
    sc = sc.replace(/classic:\s*\{\s*badge:\s*['"][^'"]*['"]/g, `classic: { badge: '${data.classicBadge}'`);
    sc = sc.replace(/timeAttack:\s*\{\s*badge:\s*['"][^'"]*['"]/g, `timeAttack: { badge: '${data.timeAttackBadge}'`);
    sc = sc.replace(/timeLimit:\s*\{\s*badge:\s*['"][^'"]*['"]/g, `timeLimit: { badge: '${data.timeLimitBadge}'`);

    // Add brainPercentileShort if missing
    if (!sc.includes('brainPercentileShort:')) {
      sc = sc.replace(/brainPercentile:\s*['"][^'"]*['"],/g, (m) => `${m}\n    brainPercentileShort: '${data.brainPercentileShort}',`);
    } else {
      sc = sc.replace(/brainPercentileShort:\s*['"][^'"]*['"]/g, `brainPercentileShort: '${data.brainPercentileShort}'`);
    }

    fs.writeFileSync(screensPath, sc, 'utf8');
    console.log(`✅ Updated ${lang}/screens.js badges & brainPercentileShort`);
  }

  if (fs.existsSync(commonPath)) {
    let cm = fs.readFileSync(commonPath, 'utf8');
    cm = cm.replace(/restartShort:\s*['"][^'"]*['"]/g, `restartShort: '${data.restartShort}'`);
    cm = cm.replace(/newGameShort:\s*['"][^'"]*['"]/g, `newGameShort: '${data.newGameShort}'`);
    fs.writeFileSync(commonPath, cm, 'utf8');
    console.log(`✅ Updated ${lang}/common.js header button labels`);
  }
}
