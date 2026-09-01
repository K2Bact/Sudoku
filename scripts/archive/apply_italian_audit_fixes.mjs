import fs from 'fs';
import path from 'path';

const itDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/it';

// 1. Update achievements.js
const achPath = path.join(itDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let a = fs.readFileSync(achPath, 'utf8');
  a = a.replace(/special:\s*['"]Giornaliero & Sfide['"]/g, "special: 'Daily & 1v1'");
  a = a.replace(/statsTab:\s*['"]Statistiche['"]/g, "statsTab: 'Dati'");
  a = a.replace(/title:\s*['"]Conquistatore Principiante['"]/g, "title: 'Prima Conquista'");
  a = a.replace(/desc:\s*['"]Completa uno schema Lv\.1 Iniziazione['"]/g, "desc: 'Completa uno schema Lv.1 Molto Facile'");
  a = a.replace(/title:\s*['"]Maestro Facile['"]/g, "title: 'Facile Superato'");
  a = a.replace(/desc:\s*['"]Completa la difficoltà massima Lv\.5 Esperto['"]/g, "desc: 'Completa la difficoltà massima Lv.5 Maestro'");
  a = a.replace(/desc:\s*['"]Completa Lv\.5 Esperto con 0 errori e 0 suggerimenti['"]/g, "desc: 'Completa Lv.5 Maestro con 0 errori e 0 suggerimenti'");
  fs.writeFileSync(achPath, a, 'utf8');
  console.log('✅ Updated it/achievements.js');
}

// 2. Update leaderboard.js
const leadPath = path.join(itDir, 'leaderboard.js');
if (fs.existsSync(leadPath)) {
  let l = fs.readFileSync(leadPath, 'utf8');
  l = l.replace(/topSolvers:\s*['"]Hall of Fame Mondiale TOP 10['"]/g, "topSolvers: 'Albo d’Oro Mondiale TOP 10'");
  fs.writeFileSync(leadPath, l, 'utf8');
  console.log('✅ Updated it/leaderboard.js');
}

// 3. Update modals.js
const modPath = path.join(itDir, 'modals.js');
if (fs.existsSync(modPath)) {
  let m = fs.readFileSync(modPath, 'utf8');
  m = m.replace(/leaderboardBtn:\s*['"]🏆 Visualizza Classifica Mondiale['"]/g, "leaderboardBtn: '🏆 Classifica'");
  m = m.replace(/reviveBtn:\s*['"]Guarda Annuncio \(\+1 vita\)['"]/g, "reviveBtn: 'Rivivi (+1 vita)'");
  m = m.replace(/submitBtn:\s*['"]Lascia una recensione sullo Store['"]/g, "submitBtn: 'Lascia recensione'");
  m = m.replace(/confirm:\s*['"]Riscatta Ricompensa['"]/g, "confirm: 'Riscatta'");
  fs.writeFileSync(modPath, m, 'utf8');
  console.log('✅ Updated it/modals.js');
}

// 4. Update screens.js
const scrPath = path.join(itDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let s = fs.readFileSync(scrPath, 'utf8');

  // Home
  s = s.replace(/title:\s*['"]⚡ Cronometro \(Contro il Tempo\)['"]/g, "title: '⚡ Cronometro'");
  s = s.replace(/title:\s*['"]⏳ Sopravvivenza \(Tempo Limite\)['"]/g, "title: '⏳ Sopravvivenza'");
  s = s.replace(/startBtn:\s*['"]Avvia Sopravvivenza['"]/g, "startBtn: 'Avvia'");
  s = s.replace(/ghost:\s*['"]👻 Fantasma PB['"]/g, "ghost: '👻 Fantasma'");
  s = s.replace(/delta:\s*['"]⚡ Ritmo Delta['"]/g, "delta: '⚡ Distacco'");

  // Daily
  s = s.replace(/badgeTitle:\s*['"]Stemma Maestro di \{month\}['"]/g, "badgeTitle: 'Maestro {month}'");
  s = s.replace(/badgeDesc:\s*['"]\{completed\} \/ \{target\} completati \(Obiettivo: 15\+\)['"]/g, "badgeDesc: '{completed}/{target} · Obiettivo 15'");
  s = s.replace(/unlockModalConfirmBtn:\s*['"]📺 Guarda Annuncio & Sblocca['"]/g, "unlockModalConfirmBtn: '📺 Guarda & Sblocca'");
  s = s.replace(/beginnerLv1Title:\s*['"]\[Lv\.1 Molto Facile\] Completa 1 Sudoku['"]/g, "beginnerLv1Title: '[Lv.1 Molto Facile] 1 Sudoku'");
  s = s.replace(/beginnerLv2Title:\s*['"]\[Lv\.2 Facile\] Completa 1 Sudoku['"]/g, "beginnerLv2Title: '[Lv.2 Facile] 1 Sudoku'");
  s = s.replace(/medLv3Title:\s*['"]\[Lv\.3\+ Medio\] Completa 1 Sudoku['"]/g, "medLv3Title: '[Lv.3+ Medio] 1 Sudoku'");
  s = s.replace(/advLv4Title:\s*['"]\[Lv\.4\+ Difficile\] Completa 1 Sudoku['"]/g, "advLv4Title: '[Lv.4+ Difficile] 1 Sudoku'");
  s = s.replace(/advLv5Title:\s*['"]\[Lv\.5 Esperto\] Completa 1 Sudoku['"]/g, "advLv5Title: '[Lv.5 Maestro] 1 Sudoku'");
  s = s.replace(/il difficile Lv\.5 Esperto/g, "il difficilissimo Lv.5 Maestro");
  s = s.replace(/battleTitle:\s*['"]Gioca 1 Duello 1v1 Online o IA['"]/g, "battleTitle: 'Gioca 1 Duello 1v1 o IA'");

  // RemoveAds
  s = s.replace(/heroTitle:\s*['"]Goditi l’Esperienza Pura del Sudoku['"]/g, "heroTitle: 'Sudoku senza distrazioni'");
  s = s.replace(/benefitsTitle:\s*['"]👑 Vantaggi dell’Abbonamento Premium['"]/g, "benefitsTitle: '👑 Vantaggi Premium'");
  s = s.replace(/benefit1:\s*['"]Rimozione permanente di tutti i banner e annunci['"]/g, "benefit1: 'Rimozione permanente di banner e annunci interstiziali'");
  s = s.replace(/buyBtn:\s*['"]Versione Senza Pubblicità \(\{price\}\)['"]/g, "buyBtn: 'Senza Pubblicità ({price})'");
  s = s.replace(/purchaseBtn:\s*['"]Rimuovi Pubblicità Definitivamente \(\{price\}\)['"]/g, "purchaseBtn: 'Rimuovi Pubblicità ({price})'");
  s = s.replace(/restoreBtn:\s*['"]Ripristina Acquisti['"]/g, "restoreBtn: 'Ripristina'");
  s = s.replace(/alreadyPurchased:\s*['"]Possiedi già l’Abbonamento Premium! 🎉['"]/g, "alreadyPurchased: 'Hai già l’accesso Premium! 🎉'");

  // Tutorial
  s = s.replace(/step1Title:\s*['"]🎯 Passo 1: Seleziona casella & Inserisci numero['"]/g, "step1Title: '🎯 Passo 1: Inserisci un numero'");
  s = s.replace(/finishBtn:\s*['"]Avvia Gioco Reale['"]/g, "finishBtn: 'Inizia a giocare'");

  // Settings & Privacy
  s = s.replace(/hapticFx:\s*['"]Risposta Tattile \(Vibrazione\)['"]/g, "hapticFx: 'Risposta Tattile'");
  s = s.replace(/privacyPolicyBtn:\s*['"]Visualizza Informativa sulla Privacy['"]/g, "privacyPolicyBtn: 'Privacy'");
  s = s.replace(/privacySubtitle:\s*['"]Privacy Protetta['"]/g, "privacySubtitle: 'Protezione Zero-PII'");
  s = s.replace(/segue rigorosamente il principio \./g, 'segue rigorosamente il principio Zero-PII.');
  s = s.replace(/sec1Title:\s*['"]1\. Nessuna Raccolta di Dati Personali['"]/g, "sec1Title: '1. Nessun dato personale'");
  s = s.replace(/sec2Title:\s*['"]2\. Salvataggio Locale & Diritti di Cancellazione['"]/g, "sec2Title: '2. Dati locali & cancellazione'");
  s = s.replace(/tempi di completamento/g, 'registri di completamento');
  s = s.replace(/sec4Title:\s*['"]4\. Servizi Pubblicitari \(Google AdMob\)['"]/g, "sec4Title: '4. Pubblicità (Google AdMob)'");

  // Stats
  s = s.replace(/leaderboardBtn:\s*['"]🌐 🏆 Visualizza Classifiche Mondiali['"]/g, "leaderboardBtn: '🏆 Classifiche'");
  s = s.replace(/survivalTitle:\s*['"]⏳ Sopravvivenza \(Tempo Limite\)['"]/g, "survivalTitle: '⏳ Modalità Sopravvivenza'");
  s = s.replace(/survivalWinsUnit:\s*['"]\{count\} Vittorie['"]/g, "survivalWinsUnit: '{count} Completati'");
  s = s.replace(/tabs:\s*\{\s*stats:\s*['"]Statistiche['"],\s*achievements:\s*['"]Obiettivi['"]\s*\}/g, "tabs: { stats: 'Dati', achievements: 'Obiettivi' }");

  // BrainReport
  s = s.replace(/focus:\s*['"]Concentrazione Profonda['"]/g, "focus: 'Concentrazione'");
  s = s.replace(/durability:\s*['"]Resistenza di Focus['"]/g, "durability: 'Resistenza'");
  s = s.replace(/logic:\s*['"]Deduzione Logica['"]/g, "logic: 'Logica'");
  s = s.replace(/speed:\s*['"]Velocità di Elaborazione['"]/g, "speed: 'Velocità'");
  s = s.replace(/shareCardBtn:\s*['"]🔗 Condividi Analisi Cerebrale['"]/g, "shareCardBtn: '🔗 Condividi'");
  s = s.replace(/Raciocinio deduttivo magistrale/g, 'Ragionamento deduttivo magistrale');

  // BattleResult & AI Battle
  s = s.replace(/\{opponent\} è stato squalificato dopo 3 errori\. Hai vinto!/g, '{opponent} è fuori gara dopo 3 errori. Hai vinto!');
  s = s.replace(/Sei stato squalificato dopo aver commesso 3 errori\./g, 'Sei fuori gara dopo aver commesso 3 errori.');
  s = s.replace(/disqualified:\s*['"]💀 Squalificato['"]/g, "disqualified: '💀 Fuori'");
  s = s.replace(/selectLevelTitle:\s*['"]Scegli la Difficoltà dell’IA['"]/g, "selectLevelTitle: 'Difficoltà IA'");

  // Academy
  s = s.replace(/tabs:\s*\{\s*stage1:\s*['"]Tappa 1['"],\s*stage2:\s*['"]Tappa 2['"],\s*stage3:\s*['"]Tappa 3['"],\s*stage4:\s*['"]Tappa 4['"],\s*stage5:\s*['"]Tappa 5['"]\s*\}/g,
    "tabs: { stage1: 'Fase 1', stage2: 'Fase 2', stage3: 'Fase 3', stage4: 'Fase 4', stage5: 'Fase 5' }");
  s = s.replace(/stageTitles:\s*\{[\s\S]*?\},/g, `stageTitles: {
      stage1: 'Fase 1: Tecniche Base (Singles & Linee)',
      stage2: 'Fase 2: Tecniche Intermedie (Coppie & Intersezioni)',
      stage3: 'Fase 3: Tecniche Avanzate (Famiglia Wing)',
      stage4: 'Fase 4: Tecniche Esperti (Fish, Colorazione & Rettangolo Unico)',
      stage5: 'Fase 5: Tecniche Maestro (Catene AIC, ALS & Exocet)'
    },`);

  s = s.replace(/stage1:\s*['"]Tappa 1:[^'"]+['"],/g, "stage1: 'Fase 1: Tecniche Base (Singles & Linee)',");
  s = s.replace(/stage2:\s*['"]Tappa 2:[^'"]+['"],/g, "stage2: 'Fase 2: Tecniche Intermedie (Coppie & Intersezioni)',");
  s = s.replace(/stage3:\s*['"]Tappa 3:[^'"]+['"],/g, "stage3: 'Fase 3: Tecniche Avanzate (Famiglia Wing)',");
  s = s.replace(/stage4:\s*['"]Tappa 4:[^'"]+['"],/g, "stage4: 'Fase 4: Tecniche Esperti (Fish, Colorazione & Rettangolo Unico)',");
  s = s.replace(/stage5:\s*['"]Tappa 5:[^'"]+['"],/g, "stage5: 'Fase 5: Tecniche Maestro (Catene AIC, ALS & Exocet)',");
  s = s.replace(/Ricontrolla i numeri indizio!/g, 'Ricontrolla i numeri iniziali!');

  fs.writeFileSync(scrPath, s, 'utf8');
  console.log('✅ Updated it/screens.js');
}
