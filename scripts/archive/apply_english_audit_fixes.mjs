import fs from 'fs';
import path from 'path';

const enDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/en';

// 1. Update achievements.js
const achPath = path.join(enDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let a = fs.readFileSync(achPath, 'utf8');
  a = a.replace(/Actively use pencil notes 50\+ times in puzzles/g, 'Actively use pencil notes more than 50 times in puzzles');
  a = a.replace(/Clear Lv\.3 Medium\+ without using any pencil notes/g, 'Clear a Lv.3 Medium or higher puzzle without using any pencil notes');
  a = a.replace(/Clear Lv\.1 Beginner puzzle/g, 'Clear a Lv.1 Very Easy puzzle');
  a = a.replace(/Reach Sudoku Brain IQ score of 150\+/g, 'Reach a Sudoku Brain IQ score of 150 or higher');
  a = a.replace(/Successfully survive and clear Time Limit mode/g, 'Successfully survive and clear Survival mode');
  fs.writeFileSync(achPath, a, 'utf8');
  console.log('✅ Updated en/achievements.js');
}

// 2. Update modals.js
const modPath = path.join(enDir, 'modals.js');
if (fs.existsSync(modPath)) {
  let m = fs.readFileSync(modPath, 'utf8');
  m = m.replace(/leaderboardBtn:\s*['"]🏆 View Global Leaderboard['"]/g, `leaderboardBtn: '🏆 Leaderboard'`);
  m = m.replace(/reviveBtn:\s*['"]Watch Ad to Revive \(\+1 life\)['"]/g, `reviveBtn: 'Revive (+1 life)'`);
  m = m.replace(/submitBtn:\s*['"]Leave a Review on Store['"]/g, `submitBtn: 'Leave a Review'`);
  fs.writeFileSync(modPath, m, 'utf8');
  console.log('✅ Updated en/modals.js');
}

// 3. Update screens.js
const scrPath = path.join(enDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let s = fs.readFileSync(scrPath, 'utf8');

  // Home
  s = s.replace(/modeTabs:\s*\{ classic:\s*['"]Classic['"], timeAttack:\s*['"]Time Attack['"], timeLimit:\s*['"]Survival['"] \}/g,
    `modeTabs: { classic: 'Classic', timeAttack: 'Speedrun', timeLimit: 'Survival' }`);
  s = s.replace(/title:\s*['"]⚡ Speedrun \(Time Attack\)['"]/g, `title: '⚡ Speedrun'`);
  s = s.replace(/title:\s*['"]⏳ Survival \(Time Limit\)['"]/g, `title: '⏳ Survival'`);
  s = s.replace(/"delta":\s*"⚡ Delta Pace"/g, `"delta": "⚡ Time Gap"`);
  s = s.replace(/"ghost":\s*"👻 Ghost PB"/g, `"ghost": "👻 Ghost"`);

  // Daily
  s = s.replace(/badgeTitle:\s*['"]\{month\} Master Badge['"]/g, `badgeTitle: '{month} Master'`);
  s = s.replace(/badgeDesc:\s*['"]\{completed\} \/ \{target\} completed \(Goal: 15\+\)['"]/g, `badgeDesc: '{completed}/{target} · Goal 15'`);
  s = s.replace(/unlockModalConfirmBtn:\s*['"]📺 Watch Ad & Unlock['"]/g, `unlockModalConfirmBtn: '📺 Watch & Unlock'`);
  s = s.replace(/missionCardTitle:\s*['"]🎯 Today Custom Mission['"]/g, `missionCardTitle: "🎯 Today's Custom Mission"`);
  s = s.replace(/missionCompleted:\s*['"]Today Mission Completed! ✅['"]/g, `missionCompleted: "Today's Mission Completed! ✅"`);
  s = s.replace(/beginnerLv1Title:\s*['"]\[Lv\.1 Very Easy\] Clear 1 Sudoku['"]/g, `beginnerLv1Title: '[Lv.1 Very Easy] 1 Sudoku'`);
  s = s.replace(/medLv3Title:\s*['"]\[Lv\.3\+ Medium\] Clear 1 Sudoku['"]/g, `medLv3Title: '[Lv.3+ Medium] 1 Sudoku'`);
  s = s.replace(/battleTitle:\s*['"]Play 1 1v1 Online\/AI Battle['"]/g, `battleTitle: 'Play a 1v1 Online or AI Battle'`);

  // RemoveAds
  s = s.replace(/benefitsTitle:\s*['"]👑 Premium Membership Benefits['"]/g, `benefitsTitle: '👑 Premium Access Benefits'`);
  s = s.replace(/benefit1:\s*['"]Permanently remove all banners and interstitials['"]/g, `benefit1: 'Permanently remove banner and interstitial ads'`);
  s = s.replace(/buyBtn:\s*['"]Get Permanent Ad-Free \(\{price\}\)['"]/g, `buyBtn: 'Go Ad-Free ({price})'`);
  s = s.replace(/purchaseBtn:\s*['"]Remove Ads Permanently \(\{price\}\)['"]/g, `purchaseBtn: 'Remove Ads ({price})'`);
  s = s.replace(/restoreBtn:\s*['"]Restore Past Purchases['"]/g, `restoreBtn: 'Restore Purchases'`);
  s = s.replace(/alreadyPurchased:\s*['"]You already own the Premium Membership! 🎉['"]/g, `alreadyPurchased: 'You already have Premium Access! 🎉'`);

  // Tutorial
  s = s.replace(/step1Title:\s*['"]🎯 Step 1: Select Cell & Enter Number['"]/g, `step1Title: '🎯 Step 1: Enter a Number'`);

  // Settings & Privacy
  s = s.replace(/privacyPolicyBtn:\s*['"]View Privacy Policy['"]/g, `privacyPolicyBtn: 'Privacy Policy'`);
  s = s.replace(/sec1Title:\s*['"]1\. No Personal Data Collection \(Zero-PII\)['"]/g, `sec1Title: '1. No Personal Data Collection'`);

  // Stats
  s = s.replace(/rankingHeader:\s*['"]🏆 Global Leaderboards & Rankings['"]/g, `rankingHeader: '🏆 Global Rankings'`);
  s = s.replace(/leaderboardBtn:\s*['"]🌐 🏆 View Global Leaderboards['"]/g, `leaderboardBtn: '🏆 Leaderboards'`);
  s = s.replace(/survivalTitle:\s*['"]⏳ Time Limit \(Survival\)['"]/g, `survivalTitle: '⏳ Survival Mode'`);
  s = s.replace(/startFirstBtn:\s*['"]Start First Sudoku 🚀['"]/g, `startFirstBtn: 'First Sudoku 🚀'`);

  // BrainReport
  s = s.replace(/focus:\s*['"]Deep Concentration['"]/g, `focus: 'Concentration'`);
  s = s.replace(/logic:\s*['"]Logical Reasoning['"]/g, `logic: 'Logic'`);
  s = s.replace(/shareCardBtn:\s*['"]🔗 Share Brain Analysis Report['"]/g, `shareCardBtn: '🔗 Share Report'`);
  s = s.replace(/shareBtn:\s*['"]Share Brain Report['"]/g, `shareBtn: 'Share Report'`);

  // BattleLobby & Result
  s = s.replace(/searching:\s*['"]Searching for a worthy opponent\.\.\.['"]/g, `searching: 'Searching for an opponent of similar skill...'`);
  s = s.replace(/homeBtn:\s*['"]Main Home['"]/g, `homeBtn: 'Home'`);

  // Academy
  s = s.replace(/error:\s*['"]\[\{val\}\] is incorrect\. Re-examine the clue digits!['"]/g, `error: '[{val}] is incorrect. Re-examine the given digits!'`);

  fs.writeFileSync(scrPath, s, 'utf8');
  console.log('✅ Updated en/screens.js');
}
