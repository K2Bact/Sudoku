import fs from 'fs';
import path from 'path';

// 1. Common Traditional Chinese characters that should NEVER appear in Simplified Chinese (zh-CN)
const TRADITIONAL_CHARS = new Set([
  '數', '獨', '體', '點', '說', '為', '個', '難', '經', '過', '選', '開', '關', '劃', '組', '學', '題', '機', '器',
  '雲', '樂', '專', '愛', '進', '當', '與', '從', '僅', '這', '樣', '處', '對', '時', '間', '實', '戰', '策', '略',
  '導', '彈', '線', '網', '絡', '獲', '確', '餘', '雙', '顯', '隱', '區', '塊', '階', '規', '則', '變', '換', '設',
  '置', '儲', '存', '連', '總', '結', '報', '告', '錯', '誤', '標', '記', '提', '示', '獎', '勵', '廣', '簽', '徽',
  '章', '競', '榜', '單', '登', '端', '步', '備', '份', '還', '原', '刪', '重', '始', '暫', '停', '繼', '續', '離',
  '認', '輸', '匹', '配', '創', '建', '房', '號', '複', '製', '滿', '束', '觀', '看', '嗎', '將', '會', '遺', '失',
  '操', '作', '檔', '蓋', '帳', '號', '語', '言', '繁', '簡', '義', '歷', '史', '記', '錄', '載', '入', '動', '態',
  '圖', '解', '練', '習', '測', '驗', '標', '準', '技', '巧', '宮', '內', '排', '除', '法', '矩', '形', '美', '杜',
  '莎', '兩', '面', '神', '飛', '魚', '交', '替', '推', '理', '鏈', '熱', '血', '騰', '即', '隨', '盤', '展', '速',
  '度', '豐', '富', '成', '就', '達', '極', '限', '護', '眼', '紙', '韻', '打', '擊', '手', '感', '盛', '宴', '質',
  '調', '校', '算', '唯'
]);

// 2. English words detection regex in non-English text (excluding technical tokens like {0}, Lv.1, MMR, IQ, X-Wing, etc.)
const COMMON_ENGLISH_WORDS = [
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'cell', 'cells',
  'row', 'rows', 'column', 'columns', 'box', 'boxes', 'grid', 'board', 'digit', 'digits',
  'number', 'numbers', 'candidate', 'candidates', 'eliminate', 'eliminates', 'eliminating',
  'lock', 'locked', 'locks', 'leave', 'leaves', 'leaving', 'solve', 'solved', 'solves',
  'naked', 'hidden', 'single', 'pair', 'triple', 'quad', 'swordfish', 'jellyfish',
  'pivot', 'pincer', 'pincers', 'wing', 'wings', 'chain', 'chains', 'link', 'links',
  'strong', 'weak', 'rectangle', 'rectangles', 'fin', 'finned', 'intersection',
  'confirm', 'confirmed', 'confirms', 'verify', 'verified', 'reveals', 'revealed',
  'watch', 'short', 'receive', 'free', 'hint', 'hints', 'recharge', 'refill', 'refills',
  'restart', 'later', 'maybe', 'game', 'over', 'victory', 'defeat', 'level', 'difficulty',
  'easy', 'medium', 'hard', 'expert', 'master', 'score', 'best', 'average', 'time',
  'mistake', 'mistakes', 'streak', 'today', 'daily', 'challenge', 'mission', 'reward',
  'review', 'feedback', 'settings', 'sound', 'haptic', 'theme', 'privacy', 'cloud', 'sync'
];

const ENGLISH_WORD_REGEX = new RegExp(`\\b(${COMMON_ENGLISH_WORDS.join('|')})\\b`, 'i');

const rootDir = path.resolve('.');

// Function to deeply inspect a dictionary object
function inspectDict(dict, prefix, lang, issues) {
  if (!dict || typeof dict !== 'object') return;
  for (const [key, val] of Object.entries(dict)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      checkString(val, fullKey, lang, issues);
    } else if (typeof val === 'object' && val !== null) {
      inspectDict(val, fullKey, lang, issues);
    }
  }
}

function checkString(str, keyPath, lang, issues) {
  if (!str || typeof str !== 'string') return;

  // 1. Check for Traditional Chinese in zh-CN
  if (lang === 'zh-CN') {
    const foundTrad = [];
    for (const ch of str) {
      // Ignore some false positives or check specific Traditional characters
      if (['數', '獨', '體', '點', '說', '為', '個', '難', '經', '過', '選', '開', '關', '劃', '組', '學', '題', '機', '器',
  '雲', '樂', '專', '愛', '進', '當', '與', '從', '僅', '這', '樣', '處', '對', '時', '間', '實', '戰', '策', '略',
  '導', '彈', '線', '網', '絡', '獲', '確', '餘', '雙', '顯', '隱', '區', '塊', '階', '規', '則', '變', '換', '設',
  '置', '儲', '存', '連', '總', '結', '報', '告', '錯', '誤', '標', '記', '提', '示', '獎', '勵', '廣', '簽', '徽',
  '章', '競', '榜', '單', '登', '端', '步', '備', '份', '還', '原', '刪', '重', '始', '暫', '停', '繼', '續', '離',
  '認', '輸', '匹', '配', '創', '建', '房', '號', '複', '製', '滿', '束', '觀', '看', '嗎', '將', '會', '遺', '失',
  '操', '作', '檔', '蓋', '帳', '號', '語', '言', '繁', '簡', '義', '歷', '史', '記', '錄', '載', '入', '動', '態',
  '圖', '解', '練', '習', '測', '驗', '標', '準', '技', '巧', '宮', '內', '排', '除', '法', '矩', '形', '美', '杜',
  '莎', '兩', '面', '神', '飛', '魚', '交', '替', '推', '理', '鏈', '熱', '血', '騰', '即', '隨', '盤', '展', '速',
  '度', '豐', '富', '成', '就', '達', '極', '限', '護', '眼', '紙', '韻', '打', '擊', '手', '感', '盛', '宴', '質',
  '調', '校', '算'].includes(ch)) {
        foundTrad.push(ch);
      }
    }
    if (foundTrad.length > 0) {
      issues.push({
        type: 'TRADITIONAL_CHINESE_IN_SIMPLIFIED',
        lang,
        key: keyPath,
        chars: [...new Set(foundTrad)],
        text: str
      });
    }
  }

  // 2. Check for untranslated English words in non-English locales
  if (lang !== 'en') {
    // Strip allowed acronyms and placeholders
    const cleanStr = str
      .replace(/\{[a-zA-Z0-9_]+\}/g, '')
      .replace(/Lv\.\d+/g, '')
      .replace(/\b(MMR|IQ|AI|URL|UI|ID|3D|X-Wing|Y-Wing|XYZ-Wing|W-Wing|WXYZ-Wing|AIC|ALS|BUG\+1|UR|SDC)\b/gi, '')
      .replace(/https?:\/\/[^\s]+/g, '');

    const match = cleanStr.match(ENGLISH_WORD_REGEX);
    if (match) {
      issues.push({
        type: 'ENGLISH_LEAK',
        lang,
        key: keyPath,
        matchedWord: match[0],
        text: str
      });
    }
  }
}

async function runAudit() {
  const issues = [];
  const { DICTIONARIES } = await import(`file://${path.resolve('src/i18n/dictionaries.js')}`);

  console.log('🔍 [1/3] Auditing all 13 DICTIONARIES (src/i18n/locales/*)...');
  for (const [lang, dict] of Object.entries(DICTIONARIES)) {
    inspectDict(dict, '', lang, issues);
  }

  console.log('🔍 [2/3] Auditing Academy Stage Strategy Data (src/data/academy/stage*.js)...');
  const stageFiles = ['stage1.js', 'stage2.js', 'stage3.js', 'stage4.js', 'stage5.js'];
  for (const sf of stageFiles) {
    const mod = await import(`file://${path.resolve('src/data/academy', sf)}`);
    const strats = Object.values(mod)[0];
    if (Array.isArray(strats)) {
      for (const strat of strats) {
        for (const [field, langObj] of Object.entries(strat)) {
          if (typeof langObj === 'object' && langObj !== null && field !== 'id') {
            for (const [lang, text] of Object.entries(langObj)) {
              checkString(text, `${sf}:${strat.id}.${field}`, lang, issues);
            }
          }
        }
      }
    }
  }

  console.log('🔍 [3/3] Auditing Academy Diagrams & Practice Missions...');
  const diagramFiles = [
    'stage1Diagrams.js', 'stage2PairsDiagrams.js', 'stage2TuplesDiagrams.js',
    'stage3Diagrams.js', 'stage4FishDiagrams.js', 'stage4ChainsDiagrams.js', 'stage5Diagrams.js'
  ];
  for (const df of diagramFiles) {
    const mod = await import(`file://${path.resolve('src/data/academy/diagrams', df)}`);
    const exportKey = Object.keys(mod)[0];
    const data = mod[exportKey];
    for (const [stratId, dict] of Object.entries(data)) {
      for (const [propKey, langObj] of Object.entries(dict)) {
        if (typeof langObj === 'object' && langObj !== null) {
          for (const [lang, text] of Object.entries(langObj)) {
            checkString(text, `${df}:${stratId}.${propKey}`, lang, issues);
          }
        }
      }
    }
  }

  const practiceFiles = [
    'stage1Practice.js', 'stage2PairsPractice.js', 'stage2TuplesPractice.js',
    'stage3WingsPractice.js', 'stage3ChainsPractice.js', 'stage4FishPractice.js',
    'stage4ChainsPractice.js', 'stage5Practice.js'
  ];
  for (const pf of practiceFiles) {
    const mod = await import(`file://${path.resolve('src/data/academy/practice', pf)}`);
    const exportKey = Object.keys(mod)[0];
    const data = mod[exportKey];
    for (const [stratId, missions] of Object.entries(data)) {
      for (const m of missions) {
        for (const field of ['title', 'guide', 'explanation']) {
          if (m[field] && typeof m[field] === 'object') {
            for (const [lang, text] of Object.entries(m[field])) {
              checkString(text, `${pf}:${stratId}:${m.id}.${field}`, lang, issues);
            }
          }
        }
      }
    }
  }

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`Total issues found: ${issues.length}\n`);

  const byLang = {};
  const byType = {};
  for (const iss of issues) {
    byLang[iss.lang] = (byLang[iss.lang] || 0) + 1;
    byType[iss.type] = (byType[iss.type] || 0) + 1;
  }

  console.log('Issues by Language:', byLang);
  console.log('Issues by Type:', byType);

  fs.writeFileSync('scripts/audit_issues.json', JSON.stringify(issues, null, 2), 'utf8');
  console.log('\nDetailed issues written to scripts/audit_issues.json');
}

runAudit();
