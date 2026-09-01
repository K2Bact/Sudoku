import fs from 'fs';
import path from 'path';

const zhTwDir = 'src/i18n/locales/zh-TW';

for (const f of fs.readdirSync(zhTwDir)) {
  if (!f.endsWith('.js')) continue;
  const p = path.join(zhTwDir, f);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replaceAll('习', '習');
  c = c.replaceAll('场', '場');
  c = c.replaceAll('参', '參');
  c = c.replaceAll('余', '餘');
  fs.writeFileSync(p, c, 'utf8');
}
console.log('✅ Updated zh-TW with 習, 場, 參, 餘');
