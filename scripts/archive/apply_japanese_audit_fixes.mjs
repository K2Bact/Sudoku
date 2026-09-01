import fs from 'fs';
import path from 'path';

const jaDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/ja';

// 1. Update achievements.js
const achPath = path.join(jaDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let a = fs.readFileSync(achPath, 'utf8');

  // 난이도 명칭 통일 (簡単->初級, 普通->中級, 難しい->上級, エキスパート->達人)
  a = a.replace(/Lv\.2 簡単難易度/g, 'Lv.2 初級難易度');
  a = a.replace(/Lv\.3 普通難易度/g, 'Lv.3 中級難易度');
  a = a.replace(/Lv\.4 難しい難易度/g, 'Lv.4 上級難易度');
  a = a.replace(/Lv\.5 エキスパート最高難易度/g, 'Lv.5 達人最高難易度');
  a = a.replace(/Lv\.4 難しい/g, 'Lv.4 上級');
  a = a.replace(/Lv\.5 エキスパート/g, 'Lv.5 達人');
  a = a.replace(/Lv\.3 普通以上/g, 'Lv.3 中級以上');

  // 업적명 중복 & 용어 교정
  a = a.replace(/title:\s*['"]神速の領域['"]/, `title: '神速の境地'`);
  a = a.replace(/title:\s*['"]電撃タイムアタック['"]/, `title: '電光石火の速攻'`);

  // 数独 -> ナンプレ
  a = a.replace(/数独/g, 'ナンプレ');

  fs.writeFileSync(achPath, a, 'utf8');
  console.log('✅ Updated ja/achievements.js');
}

// 2. Update common.js & leaderboard.js & modals.js
const comPath = path.join(jaDir, 'common.js');
if (fs.existsSync(comPath)) {
  let c = fs.readFileSync(comPath, 'utf8');
  c = c.replace(/数独/g, 'ナンプレ');
  fs.writeFileSync(comPath, c, 'utf8');
  console.log('✅ Updated ja/common.js');
}

const ldrPath = path.join(jaDir, 'leaderboard.js');
if (fs.existsSync(ldrPath)) {
  let l = fs.readFileSync(ldrPath, 'utf8');
  l = l.replace(/record:\s*['"]私の記録['"]/, `record: '自己ベスト'`);
  l = l.replace(/数独/g, 'ナンプレ');
  fs.writeFileSync(ldrPath, l, 'utf8');
  console.log('✅ Updated ja/leaderboard.js');
}

const modPath = path.join(jaDir, 'modals.js');
if (fs.existsSync(modPath)) {
  let m = fs.readFileSync(modPath, 'utf8');
  m = m.replace(/ストアに評価とレビューを残していただけると/g, '率直な評価とレビューを残していただけると');
  m = m.replace(/数独/g, 'ナンプレ');
  fs.writeFileSync(modPath, m, 'utf8');
  console.log('✅ Updated ja/modals.js');
}

// 3. Update screens.js
const scrPath = path.join(jaDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let s = fs.readFileSync(scrPath, 'utf8');

  // Academy Stage Titles (5-stage taxonomy)
  s = s.replace(/stage3:\s*['"]上級テクニック\s*\(ウィング＆フィッシュ\)['"]/, `stage3: '上級テクニック (Wingシリーズ)'`);
  s = s.replace(/stage4:\s*['"]専門テクニック\s*\(カラーリング＆3Dメデューサ\)['"]/, `stage4: '専門テクニック (Fish・カラーリング＆UR)'`);
  s = s.replace(/stage5:\s*['"]マスターテクニック\s*\(UR、AIC＆ALS連鎖\)['"]/, `stage5: 'マスターテクニック (AIC・ALS＆Exocet連鎖)'`);

  // 1-line fixed buttons
  s = s.replace(/privacyPolicyBtn:\s*['"][^'"]+['"]/, `privacyPolicyBtn: 'ポリシーを表示'`);
  s = s.replace(/leaderboardBtn:\s*['"]🌐 🏆 全体ランキングを見る['"]/, `leaderboardBtn: '🏆 ランキング'`);
  s = s.replace(/shareCardBtn:\s*['"]🔗 脳分析レポートを共有['"]/, `shareCardBtn: '🔗 レポート共有'`);
  s = s.replace(/startBtn:\s*['"]Lv\.\{level\}\s*\{name\}\s*AI\s*対戦開始['"]/, `startBtn: 'Lv.{level} {name}と対戦'`);
  s = s.replace(/badgeTitle:\s*['"]\{month\}月数独マスターバッジ['"]/, `badgeTitle: '{month}月マスターバッジ'`);
  s = s.replace(/badgeDesc:\s*['"][^'"]+['"]/, `badgeDesc: '{completed}/{target} · 目標15'`);
  s = s.replace(/startFirstBtn:\s*['"][^'"]+['"]/, `startFirstBtn: '初ナンプレ 🚀'`);

  // Settings & Privacy
  s = s.replace(/privacySubtitle:\s*['"][^'"]+['"]/, `privacySubtitle: 'Zero-PII保護'`);
  s = s.replace(/subtitle:\s*['"]Project_Devはユーザーの個人情報を一切収集しない原則を厳守します。['"]/, `subtitle: 'Project_Devはユーザーの個人情報を一切収集しないZero-PII原則を厳守します。'`);
  s = s.replace(/一時的な匿名トークンのみを使用/, '一時的な匿名トークンとクリア記録のみを使用');

  // AI Battle descriptions
  s = s.replace(/ゆっくり解く初心者向けボットです。/, 'ゆっくり解いて基本を学べる初心者向けボットです。');
  s = s.replace(/安定したペースで解き進めます。/, '安定したペースで解き進め、ミスもほとんどありません。');
  s = s.replace(/非常に速いペースで難問を撃破します。/, '非常に速いペースで高度な戦略を駆使します。');

  // BattleResult & BrainReport
  s = s.replace(/you:\s*['"]あなた['"]/, `you: '自分'`);
  s = s.replace(/私の数独IQ/g, '私のナンプレIQ');
  s = s.replace(/今すぐ数独で脳トレ/g, '今すぐナンプレで脳トレ');

  // 全体 "数独" -> "ナンプレ" 교정 (단, screens.js 내 남은 것들)
  s = s.replace(/数独/g, 'ナンプレ');

  fs.writeFileSync(scrPath, s, 'utf8');
  console.log('✅ Updated ja/screens.js');
}
