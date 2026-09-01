import path from 'path';
import fs from 'fs';

// 1. Audit Traditional Chinese in zh-CN
const TRAD_MAP = {
  '數': '数', '獨': '独', '體': '体', '點': '点', '說': '说', '為': '为', '個': '个', '難': '难', '經': '经', '過': '过',
  '選': '选', '開': '开', '關': '关', '劃': '划', '組': '组', '學': '学', '題': '题', '機': '机', '器': '器', '雲': '云',
  '樂': '乐', '專': '专', '愛': '爱', '進': '进', '當': '当', '與': '与', '從': '从', '僅': '仅', '這': '这', '樣': '样',
  '處': '处', '對': '对', '時': '时', '間': '间', '實': '实', '戰': '战', '策': '策', '略': '略', '導': '导', '彈': '弹',
  '線': '线', '網': '网', '絡': '络', '獲': '获', '確': '确', '餘': '余', '雙': '双', '顯': '显', '隱': '隐', '區': '区',
  '塊': '块', '階': '阶', '規': '规', '則': '则', '變': '变', '換': '换', '設': '设', '置': '置', '儲': '储', '存': '存',
  '連': '连', '總': '总', '結': '结', '報': '报', '告': '告', '錯': '错', '誤': '误', '標': '标', '記': '记', '提': '提',
  '示': '示', '獎': '奖', '勵': '励', '廣': '广', '簽': '签', '徽': '徽', '章': '章', '競': '竞', '榜': '榜', '單': '单',
  '登': '登', '端': '端', '步': '步', '備': '备', '份': '份', '還': '还', '原': '原', '刪': '删', '重': '重', '始': '始',
  '暫': '暂', '停': '停', '繼': '继', '續': '续', '離': '离', '認': '认', '輸': '输', '匹': '匹', '配': '配', '創': '创',
  '建': '建', '房': '房', '號': '号', '複': '复', '製': '制', '滿': '满', '束': '束', '觀': '观', '看': '看', '嗎': '吗',
  '將': '将', '會': '会', '遺': '遗', '失': '失', '操': '作', '檔': '档', '蓋': '盖', '帳': '帐', '語': '语', '言': '言',
  '繁': '繁', '簡': '简', '義': '义', '歷': '历', '史': '史', '錄': '录', '載': '载', '態': '态', '圖': '图', '解': '解',
  '練': '练', '習': '习', '測': '测', '驗': '验', '準': '准', '宮': '宫', '內': '内', '排': '排', '除': '除', '矩': '矩',
  '形': '形', '美': '美', '杜': '杜', '莎': '莎', '兩': '两', '面': '面', '飛': '飞', '魚': '鱼', '交': '交', '替': '替',
  '鏈': '链', '熱': '热', '騰': '腾', '隨': '随', '盤': '盘', '展': '展', '速': '速', '豐': '丰', '富': '富', '成': '成',
  '達': '达', '極': '极', '限': '限', '護': '护', '紙': '纸', '韻': '韵', '擊': '击', '手': '手', '感': '感', '盛': '盛',
  '質': '质', '調': '调', '校': '校', '算': '算', '唯': '唯', '範': '范', '例': '例', '鎖': '锁', '定': '定', '頂': '顶',
  '鰭': '鳍', '狀': '状', '附': '附', '屬': '属', '會': '会'
};

const TRAD_REGEX = new RegExp('[' + Object.keys(TRAD_MAP).join('') + ']', 'g');

console.log('=== 1. AUDITING zh-CN TRADITIONAL CHARACTERS ===');

// Check zh-CN locales
const zhCNLocaleFiles = fs.readdirSync('src/i18n/locales/zh-CN').map(f => path.join('src/i18n/locales/zh-CN', f));
for (const f of zhCNLocaleFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(TRAD_REGEX);
  if (matches) {
    const uniqueMatches = [...new Set(matches)];
    console.log(`❌ ${f}: found ${matches.length} traditional chars (unique: ${uniqueMatches.join(', ')})`);
  } else {
    console.log(`✅ ${f}: clean!`);
  }
}

// Check Academy files
console.log('\n=== 2. AUDITING ACADEMY FILES FOR zh-CN TRADITIONAL CHARACTERS ===');
const academyDirs = ['src/data/academy', 'src/data/academy/diagrams', 'src/data/academy/practice'];
for (const dir of academyDirs) {
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.js')) {
      const full = path.join(dir, f);
      const content = fs.readFileSync(full, 'utf8');
      // Look for 'zh-CN': '...' or zhCN: '...'
      // Match lines with zh-CN
      const lines = content.split('\n');
      let tradCount = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes("'zh-CN':") || line.includes('"zh-CN":') || line.includes('zhCN:')) {
          const m = line.match(TRAD_REGEX);
          if (m) tradCount += m.length;
        }
      }
      if (tradCount > 0) {
        console.log(`❌ ${full}: found ${tradCount} traditional chars in zh-CN lines`);
      }
    }
  }
}

// Check English titles in Practice files across all languages
console.log('\n=== 3. AUDITING ACADEMY PRACTICE TITLES ACROSS ALL LANGUAGES ===');
const practiceFiles = fs.readdirSync('src/data/academy/practice').filter(f => f.endsWith('.js'));
for (const pf of practiceFiles) {
  const full = path.join('src/data/academy/practice', pf);
  const mod = await import('file://' + path.resolve(full));
  const data = Object.values(mod)[0];
  for (const [stratId, missions] of Object.entries(data)) {
    for (const m of missions) {
      if (m.title) {
        for (const [lang, titleStr] of Object.entries(m.title)) {
          if (lang !== 'en' && typeof titleStr === 'string' && titleStr.startsWith('Example')) {
            console.log(`❌ [${lang}] ${pf}:${stratId}:${m.id}.title -> "${titleStr}"`);
          }
        }
      }
    }
  }
}
