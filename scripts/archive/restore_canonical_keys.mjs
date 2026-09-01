import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

const invalidKeyFixes = [
  { regex: /contre-la-montreTitle/g, replace: 'speedrunTitle' },
  { regex: /contre-la-montreDesc/g, replace: 'speedrunDesc' },
  { regex: /contre-la-montreBest/g, replace: 'speedrunBest' },
  { regex: /contre-la-montreTab/g, replace: 'speedrunTab' },
  { regex: /contra o tempoTitle/g, replace: 'speedrunTitle' },
  { regex: /contra o tempoDesc/g, replace: 'speedrunDesc' },
  { regex: /contra o tempoBest/g, replace: 'speedrunBest' },
  { regex: /contra o tempoTab/g, replace: 'speedrunTab' },
  { regex: /гонка на времяTitle/g, replace: 'speedrunTitle' },
  { regex: /гонка на времяDesc/g, replace: 'speedrunDesc' },
  { regex: /гонка на времяBest/g, replace: 'speedrunBest' },
  { regex: /гонка на времяTab/g, replace: 'speedrunTab' },
  { regex: /zeitrennenTitle/g, replace: 'speedrunTitle' },
  { regex: /zeitrennenDesc/g, replace: 'speedrunDesc' },
  { regex: /zeitrennenBest/g, replace: 'speedrunBest' },
  { regex: /zeitrennenTab/g, replace: 'speedrunTab' },
  { regex: /contrarrelojTitle/g, replace: 'speedrunTitle' },
  { regex: /contrarrelojDesc/g, replace: 'speedrunDesc' },
  { regex: /contrarrelojBest/g, replace: 'speedrunBest' },
  { regex: /contrarrelojTab/g, replace: 'speedrunTab' },
  { regex: /タイムアタックTitle/g, replace: 'speedrunTitle' },
  { regex: /タイムアタックDesc/g, replace: 'speedrunDesc' },
  { regex: /タイムアタックBest/g, replace: 'speedrunBest' },
  { regex: /タイムアタックTab/g, replace: 'speedrunTab' },
  { regex: /极速冲榜Title/g, replace: 'speedrunTitle' },
  { regex: /极速冲榜Desc/g, replace: 'speedrunDesc' },
  { regex: /极速冲榜Best/g, replace: 'speedrunBest' },
  { regex: /极速冲榜Tab/g, replace: 'speedrunTab' },
  { regex: /極速衝榜Title/g, replace: 'speedrunTitle' },
  { regex: /極速衝榜Desc/g, replace: 'speedrunDesc' },
  { regex: /極速衝榜Best/g, replace: 'speedrunBest' },
  { regex: /極速衝榜Tab/g, replace: 'speedrunTab' }
];

for (const lang of fs.readdirSync(localesDir)) {
  const dir = path.join(localesDir, lang);
  if (!fs.statSync(dir).isDirectory()) continue;

  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');

    for (const fix of invalidKeyFixes) {
      content = content.replace(fix.regex, fix.replace);
    }
    fs.writeFileSync(p, content, 'utf8');
  }
}

console.log('✅ Canonical dictionary keys restored across all locales!');
