import fs from 'fs';
import path from 'path';

const frDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/fr';

// 1. Update modals.js
const modalsPath = path.join(frDir, 'modals.js');
if (fs.existsSync(modalsPath)) {
  let mContent = fs.readFileSync(modalsPath, 'utf8');
  mContent = mContent.replace(/leaderboardBtn:\s*['"][^'"]+['"]/, `leaderboardBtn: '🏆 Classement'`);
  mContent = mContent.replace(/confirm:\s*['"]Récupérer la récompense['"]/, `confirm: 'Récupérer'`);
  mContent = mContent.replace(/submitBtn:\s*['"][^'"]+['"]/, `submitBtn: 'Laisser un avis'`);
  mContent = mContent.replace(/laterBtn:\s*['"][^'"]+['"]/, `laterBtn: 'Plus tard'`);
  fs.writeFileSync(modalsPath, mContent, 'utf8');
  console.log('✅ Updated fr/modals.js');
}

// 2. Update achievements.js
const achPath = path.join(frDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let aContent = fs.readFileSync(achPath, 'utf8');
  aContent = aContent.replace(/statsTab:\s*['"][^'"]+['"]/, `statsTab: 'Stats'`);
  fs.writeFileSync(achPath, aContent, 'utf8');
  console.log('✅ Updated fr/achievements.js');
}

// 3. Update screens.js
const scrPath = path.join(frDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let sContent = fs.readFileSync(scrPath, 'utf8');

  // Daily
  sContent = sContent.replace(/unlockModalConfirmBtn:\s*['"][^'"]+['"]/, `unlockModalConfirmBtn: '📺 Regarder & débloquer'`);
  sContent = sContent.replace(/badgeTitle:\s*['"][^'"]+['"]/, `badgeTitle: 'Maître {month}'`);
  sContent = sContent.replace(/badgeDesc:\s*['"][^'"]+['"]/, `badgeDesc: '{completed}/{target} · Obj. 15'`);
  sContent = sContent.replace(/beginnerLv1Title:\s*['"][^'"]+['"]/, `beginnerLv1Title: '[Lv.1 Très facile] 1 sudoku'`);
  sContent = sContent.replace(/missionCompletedDesc:\s*['"][^'"]+['"]/, `missionCompletedDesc: '+1 indice gratuit accordé & validé pour la mission !'`);

  // Settings
  sContent = sContent.replace(/privacyPolicyBtn:\s*['"][^'"]+['"]/, `privacyPolicyBtn: 'Politique de confidentialité'`);
  sContent = sContent.replace(/autoCheck:\s*['"][^'"]+['"]/, `autoCheck: 'Détection des erreurs'`);
  sContent = sContent.replace(/resetData:\s*['"][^'"]+['"]/, `resetData: 'Réinitialiser les données'`);
  sContent = sContent.replace(/sec2Title:\s*['"][^'"]+['"]/, `sec2Title: '2. Stockage local & droits de suppression'`);
  sContent = sContent.replace(/sec3Title:\s*['"][^'"]+['"]/, `sec3Title: '3. Duels 1v1 & indice cérébral'`);
  sContent = sContent.replace(/sec4Title:\s*['"][^'"]+['"]/, `sec4Title: '4. Services publicitaires (Google AdMob)'`);

  // Stats
  sContent = sContent.replace(/leaderboardBtn:\s*['"]🌐 🏆 Voir les classements mondiaux['"]/, `leaderboardBtn: '🏆 Classements mondiaux'`);
  sContent = sContent.replace(/startFirstBtn:\s*['"][^'"]+['"]/, `startFirstBtn: 'Premier sudoku 🚀'`);

  // BrainReport
  sContent = sContent.replace(/shareCardBtn:\s*['"][^'"]+['"]/, `shareCardBtn: '🔗 Partager l’analyse'`);

  // BattleLobby & BattleResult & AIBattle
  sContent = sContent.replace(/findOpponentBtn:\s*['"][^'"]+['"]/, `findOpponentBtn: 'Chercher un duel'`);
  sContent = sContent.replace(/rematchBtn:\s*['"]Demander une revanche['"]/, `rematchBtn: 'Revanche'`);
  sContent = sContent.replace(/startBtn:\s*['"]Lancer le duel IA Lv\.\{level\} \{name\}['"]/, `startBtn: 'Affronter {name}'`);

  // Ghost
  sContent = sContent.replace(/rivalTitle:\s*['"]Record personnel \(\{time\}\)['"]/, `rivalTitle: 'Record perso ({time})'`);

  // RemoveAds
  sContent = sContent.replace(/buySuccess:\s*['"][^'"]+['"]/, `buySuccess: 'Achat effectué avec succès ! Merci !'`);

  // Academy stage1 title
  sContent = sContent.replace(/stage1:\s*['"]Étape 1 : techniques de base \(singles & lignes\)['"]/, `stage1: 'Étape 1 : techniques de base (Singles & lignes)'`);

  fs.writeFileSync(scrPath, sContent, 'utf8');
  console.log('✅ Updated fr/screens.js');
}
