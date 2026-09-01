import fs from 'fs';
import path from 'path';

const TRAD_SAMPLE = ['數', '獨', '體', '點', '說', '為', '個', '難', '經', '過', '選', '開', '關', '劃', '組', '學', '題', '機', '器',
  '雲', '樂', '專', '愛', '進', '當', '與', '從', '僅', '這', '樣', '處', '對', '時', '間', '實', '戰', '策', '略',
  '導', '彈', '線', '網', '絡', '獲', '確', '餘', '雙', '顯', '隱', '區', '塊', '階', '規', '則', '變', '換', '設',
  '置', '儲', '存', '連', '總', '結', '報', '告', '錯', '誤', '標', '記', '提', '示', '獎', '勵', '廣', '簽', '徽',
  '章', '競', '榜', '單', '登', '端', '步', '備', '份', '還', '原', '刪', '重', '始', '暫', '停', '繼', '續', '離',
  '認', '輸', '匹', '配', '創', '建', '房', '號', '複', '製', '滿', '束', '觀', '看', '嗎', '將', '會', '遺', '失',
  '操', '作', '檔', '蓋', '帳', '號', '語', '言', '繁', '簡', '義', '歷', '史', '記', '錄', '載', '入', '動', '態',
  '圖', '解', '練', '習', '測', '驗', '標', '準', '技', '巧', '宮', '內', '排', '除', '法', '矩', '形', '美', '杜',
  '莎', '兩', '面', '神', '飛', '魚', '交', '替', '推', '理', '鏈', '熱', '血', '騰', '即', '隨', '盤', '展', '速',
  '度', '豐', '富', '成', '就', '達', '極', '限', '護', '眼', '紙', '韻', '打', '擊', '手', '感', '盛', '宴', '質',
  '調', '校', '算', '範', '例', '鎖', '頂', '鰭', '狀', '附', '屬'];

let found = 0;
for (const f of fs.readdirSync('src/i18n/locales/zh-CN')) {
  const c = fs.readFileSync(path.join('src/i18n/locales/zh-CN', f), 'utf8');
  for (const ch of TRAD_SAMPLE) {
    if (c.includes(ch)) {
      console.log(`❌ Found in zh-CN/${f}: ${ch}`);
      found++;
    }
  }
}

const academyDirs = ['src/data/academy', 'src/data/academy/diagrams', 'src/data/academy/practice'];
for (const dir of academyDirs) {
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.js')) {
      const full = path.join(dir, f);
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      for (const line of lines) {
        if (line.includes("'zh-CN':") || line.includes('"zh-CN":') || line.includes('zhCN:')) {
          for (const ch of TRAD_SAMPLE) {
            if (line.includes(ch)) {
              console.log(`❌ Found in ${full}: ${ch} in "${line.trim()}"`);
              found++;
            }
          }
        }
      }
    }
  }
}

console.log(`========================================`);
console.log(`Total Traditional characters in zh-CN: ${found}`);
console.log(`========================================`);
