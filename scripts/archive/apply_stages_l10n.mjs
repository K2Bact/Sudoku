import fs from 'fs';
import path from 'path';
import { ALL_32_STRATEGIES } from './compile_all_academy_locales.mjs';

const stages = [
  { id: 'stage1', file: 'stage1.js', tabKey: 'academy.tabs.stage1', titleKey: 'academy.stageTitles.stage1', badgeClass: 'beginner' },
  { id: 'stage2', file: 'stage2.js', tabKey: 'academy.tabs.stage2', titleKey: 'academy.stageTitles.stage2', badgeClass: 'intermediate' },
  { id: 'stage3', file: 'stage3.js', tabKey: 'academy.tabs.stage3', titleKey: 'academy.stageTitles.stage3', badgeClass: 'advanced' },
  { id: 'stage4', file: 'stage4.js', tabKey: 'academy.tabs.stage4', titleKey: 'academy.stageTitles.stage4', badgeClass: 'master' },
  { id: 'stage5', file: 'stage5.js', tabKey: 'academy.tabs.stage5', titleKey: 'academy.stageTitles.stage5', badgeClass: 'grandmaster' }
];

for (const st of stages) {
  const stratKeys = Object.keys(ALL_32_STRATEGIES).filter(k => ALL_32_STRATEGIES[k].stage === st.id);
  const strategiesFormatted = stratKeys.map(k => {
    const s = ALL_32_STRATEGIES[k];
    return `    {
      id: ${JSON.stringify(k)},
      badge: ${JSON.stringify(s.badges)},
      title: ${JSON.stringify(s.titles)},
      desc: ${JSON.stringify(s.descs)}
    }`;
  }).join(',\n');

  const content = `export const ${st.id} = {
  id: '${st.id}',
  tabKey: '${st.tabKey}',
  titleKey: '${st.titleKey}',
  badgeClass: '${st.badgeClass}',
  strategies: [
${strategiesFormatted}
  ]
};
`;

  const targetPath = path.join('src/data/academy', st.file);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`✅ Successfully updated ${targetPath} (${stratKeys.length} strategies in 13 languages)`);
}
