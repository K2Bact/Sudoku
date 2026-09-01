import fs from 'fs';
import path from 'path';

const zhCnDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/zh-CN';

// 1. Update achievements.js
const achPath = path.join(zhCnDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let a = fs.readFileSync(achPath, 'utf8');
  a = a.replace(/成就与奖杯 XP 将自动同步/g, '成就与奖杯将自动同步');
  a = a.replace(/title: '三分钟速破'/g, "title: '3 分钟内通关'");
  a = a.replace(/title: '初级专家'/g, "title: '初级大师'");
  a = a.replace(/title: '大师宗师'/g, "title: '宗师'");
  a = a.replace(/title: '极限生还者'/g, "title: '极限生存者'");
  fs.writeFileSync(achPath, a, 'utf8');
  console.log('✅ Updated zh-CN/achievements.js');
}

// 2. Update leaderboard.js
const leadPath = path.join(zhCnDir, 'leaderboard.js');
if (fs.existsSync(leadPath)) {
  let l = fs.readFileSync(leadPath, 'utf8');
  l = l.replace(/speedrunTab:\s*['"]竞速排行['"]/g, "speedrunTab: '计时竞速排行'");
  fs.writeFileSync(leadPath, l, 'utf8');
  console.log('✅ Updated zh-CN/leaderboard.js');
}

// 3. Update screens.js
const scrPath = path.join(zhCnDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let s = fs.readFileSync(scrPath, 'utf8');

  // Home
  s = s.replace(/ghost:\s*['"]👻 幽灵 PB['"]/g, "ghost: '👻 幽灵'");
  s = s.replace(/delta:\s*['"]⚡ Delta 步调['"]/g, "delta: '⚡ 时间差'");
  s = s.replace(/timeAttack:\s*\{\s*badge:\s*['"]极速冲榜['"]/g, "timeAttack: { badge: '计时竞速'");
  s = s.replace(/timeLimit:\s*\{\s*badge:\s*['"]限时生存['"]/g, "timeLimit: { badge: '极限生存'");
  s = s.replace(/startBtn:\s*['"]开始生存挑战['"]/g, "startBtn: '开始生存'");

  // Daily
  s = s.replace(/badgeDesc:\s*['"]已完成 \{completed\} \/ \{target\} 局（目标：15\+ 局）['"]/g, "badgeDesc: '{completed}/{target} 局 · 目标 15'");

  // RemoveAds
  s = s.replace(/title:\s*['"]去除广告与高级版['"]/g, "title: '移除广告与高级会员'");
  s = s.replace(/benefitsTitle:\s*['"]👑 顶级会员特权['"]/g, "benefitsTitle: '👑 高级版特权'");
  s = s.replace(/benefit1:\s*['"]完全移除所有横幅与全屏广告['"]/g, "benefit1: '永久移除横幅与插页广告'");
  s = s.replace(/buyBtn:\s*['"]永久去除广告 \(\{price\}\)['"]/g, "buyBtn: '永久无广告 ({price})'");
  s = s.replace(/alreadyPurchased:\s*['"]您已拥有顶级会员特权！ 🎉['"]/g, "alreadyPurchased: '您已拥有高级版！ 🎉'");

  // Settings & Privacy
  s = s.replace(/limitMistakes:\s*['"]失误 3 次限制 \(爱心\)['"]/g, "limitMistakes: '失误 3 次限制 (❤️)'");
  s = s.replace(/privacySubtitle:\s*['"]本地隐私保护['"]/g, "privacySubtitle: 'Zero-PII 隐私保护'");
  s = s.replace(/即时在线对战仅使用一次性匿名标识码进行匹配。/g, '即时在线对战仅使用一次性匿名标识码与解题记录进行匹配。');

  // Stats
  s = s.replace(/rankingHeader:\s*['"]🏆 全球排行榜与荣誉['"]/g, "rankingHeader: '🏆 全球排名'");
  s = s.replace(/survivalTitle:\s*['"]⏳ 限时挑战 \(生存模式\)['"]/g, "survivalTitle: '⏳ 极限生存模式'");
  s = s.replace(/survivalTotalWins:\s*['"]生存挑战成功['"]/g, "survivalTotalWins: '极限生存成功'");

  // BrainReport
  s = s.replace(/\[Sudoku IQ 大脑报告\]/g, '[Sudoku IQ 报告]');
  s = s.replace(/我的数独IQ:/g, '我的数独 IQ:');
  s = s.replace(/percentilePrefix:\s*['"]前 ['"]/g, "percentilePrefix: '超越前 '");

  // BattleResult & AI Battle
  s = s.replace(/先完成拼图获胜！/g, '先完成谜题获胜！');
  s = s.replace(/先完成了拼图。/g, '先完成了谜题。');
  s = s.replace(/rematchWaitingBtn:\s*['"]等待中\.\.\. \(\{seconds\}s\)['"]/g, "rematchWaitingBtn: '申请中... ({seconds}s)'");
  s = s.replace(/即时竞赛拼图速度/g, '即时竞赛解题速度');

  // Academy
  s = s.replace(/从基础到进阶掌握 32 种正统数独技巧/g, '从基础到宗师掌握 32 种正统数独技巧');
  s = s.replace(/theory:\s*['"]技巧详解['"]/g, "theory: '理论讲解'");
  s = s.replace(/请再次观察高亮提示！/g, '请再次观察已给出的数字！');

  // Academy stageTitles
  s = s.replace(/stageTitles:\s*\{[\s\S]*?\},/g, `stageTitles: {
      stage1: '第1阶段: 基础技巧 (基本单数与行列)',
      stage2: '第2阶段: 中级技巧 (区块数对与交集排除)',
      stage3: '第3阶段: 高级技巧 (翼系列)',
      stage4: '第4阶段: 专家技巧 (鱼类、着色法与唯一矩形)',
      stage5: '第5阶段: 大师技巧 (AIC、ALS 与 Exocet 链)'
    },`);

  // Academy stage1~5
  s = s.replace(/stage1:\s*['"][^'"]+['"],/g, "stage1: '第1阶段: 基础技巧 (基本单数与行列)',");
  s = s.replace(/stage2:\s*['"][^'"]+['"],/g, "stage2: '第2阶段: 中级技巧 (区块数对与交集排除)',");
  s = s.replace(/stage3:\s*['"][^'"]+['"],/g, "stage3: '第3阶段: 高级技巧 (翼系列)',");
  s = s.replace(/stage4:\s*['"][^'"]+['"],/g, "stage4: '第4阶段: 专家技巧 (鱼类、着色法与唯一矩形)',");
  s = s.replace(/stage5:\s*['"][^'"]+['"],/g, "stage5: '第5阶段: 大师技巧 (AIC、ALS 与 Exocet 链)',");

  fs.writeFileSync(scrPath, s, 'utf8');
  console.log('✅ Updated zh-CN/screens.js');
}
