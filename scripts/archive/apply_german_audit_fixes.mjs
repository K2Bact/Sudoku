import fs from 'fs';
import path from 'path';

const deDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/de';

// 1. Update common.js
const comPath = path.join(deDir, 'common.js');
if (fs.existsSync(comPath)) {
  let c = fs.readFileSync(comPath, 'utf8');
  c = c.replace(/Drücken Sie erneut Zurück, um die App zu beenden\./g, 'Drücke erneut Zurück, um die App zu beenden.');
  c = c.replace(/Möchten Sie das Spiel pausieren und zur Startseite zurückkehren\?/g, 'Möchtest du das Spiel pausieren und zur Startseite zurückkehren?');
  fs.writeFileSync(comPath, c, 'utf8');
  console.log('✅ Updated de/common.js');
}

// 2. Update achievements.js
const achPath = path.join(deDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let a = fs.readFileSync(achPath, 'utf8');
  a = a.replace(/Nutzen Sie Bleistift-Notizen 50\+ Mal aktiv in Rätseln/g, 'Nutze Bleistift-Notizen über 50-mal aktiv in Rätseln');
  a = a.replace(/title:\s*['"]Lichtgeschwindigkeit['"]/g, `title: 'Göttliches Tempo'`);
  a = a.replace(/Erreichen Sie den prestigeträchtigen 👑 S\+ Zeitrennen-Rang/g, 'Erreiche den prestigeträchtigen 👑 S+ Zeitrennen-Rang');
  a = a.replace(/Erreichen Sie eine 5er-Kombo/g, 'Erreiche eine 5er-Kombo');
  a = a.replace(/Erreichen Sie eine 10er-Kombo/g, 'Erreiche eine 10er-Kombo');
  a = a.replace(/Halten Sie eine 7-tägige Serie/g, 'Halte eine 7-tägige Serie');
  a = a.replace(/Gewinnen Sie Ihr erstes 1v1-Duell/g, 'Gewinne dein erstes 1v1-Duell');
  a = a.replace(/Erreichen Sie einen Sudoku-Gehirn-IQ-Wert von 150\+/g, 'Erreiche einen Sudoku-IQ-Wert von 150+');
  a = a.replace(/Lv\.2 Einfach-Rätsel lösen/g, 'Lv.2 Leicht-Rätsel lösen');
  fs.writeFileSync(achPath, a, 'utf8');
  console.log('✅ Updated de/achievements.js');
}

// 3. Update modals.js
const modPath = path.join(deDir, 'modals.js');
if (fs.existsSync(modPath)) {
  let m = fs.readFileSync(modPath, 'utf8');
  m = m.replace(/leaderboardBtn:\s*['"]🏆 Globale Bestenliste ansehen['"]/g, `leaderboardBtn: '🏆 Bestenliste'`);
  m = m.replace(/copiedToast:\s*['"]🎉 Rekord in die Zwischenablage kopiert!['"]/g, `copiedToast: '🎉 Ergebnis in die Zwischenablage kopiert!'`);
  m = m.replace(/reviveBtn:\s*['"]Werbung ansehen \(\+1 Leben\)['"]/g, `reviveBtn: 'Wiederbeleben (+1)'`);
  m = m.replace(/Wählen Sie Ihre Stufe/g, 'Wähle deine Stufe');
  m = m.replace(/Gefällt Ihnen Sudoku\?/g, 'Gefällt dir Sudoku?');
  m = m.replace(/Ihre ehrliche Bewertung hilft uns sehr,\ndas Spiel kontinuierlich zu verbessern! 💙/g, 'Deine ehrliche Bewertung hilft uns sehr,\ndas Spiel kontinuierlich zu verbessern! 💙');
  m = m.replace(/submitBtn:\s*['"]Bewertung im Store abgeben['"]/g, `submitBtn: 'Bewerten'`);
  m = m.replace(/laterBtn:\s*['"]Vielleicht später['"]/g, `laterBtn: 'Später'`);
  m = m.replace(/💙 Vielen Dank für Ihr Feedback! Öffne Store-Seite\./g, '💙 Vielen Dank für dein Feedback! Öffne Store-Seite.');
  m = m.replace(/Tag \{days\} Serie erreicht!/g, '{days} Tage in Folge erreicht!');
  m = m.replace(/confirm:\s*['"]Belohnung annehmen['"]/g, `confirm: 'Abholen'`);
  fs.writeFileSync(modPath, m, 'utf8');
  console.log('✅ Updated de/modals.js');
}

// 4. Update screens.js
const scrPath = path.join(deDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let s = fs.readFileSync(scrPath, 'utf8');

  // Home
  s = s.replace(/delta:\s*['"]⚡ Delta-Tempo['"]/g, `delta: '⚡ Zeitdiff.'`);
  s = s.replace(/timeAttack:\s*\{ badge:\s*['"]SPEEDRUN['"], title:\s*['"]⚡ Zeitrennen \(Zeitangriff\)['"], desc:\s*['"]Kämpfen Sie gegen die Uhr um die schnellste Bestzeit!['"], startBtn:\s*['"]Zeitrennen starten['"] \}/g,
    `timeAttack: { badge: 'SPEEDRUN', title: '⚡ Zeitrennen', desc: 'Kämpfe gegen die Uhr um die schnellste Bestzeit!', startBtn: 'Zeitrennen starten' }`);
  s = s.replace(/Lv\.\{level\} mit \{minutes\} Min\. Limit! Überleben Sie vor 0s\./g, 'Lv.{level} mit {minutes} Min. Limit! Überlebe bis zum Schluss.');
  s = s.replace(/32 Meistertechniken lernen \(Naked Single etc\.\)/g, '32 Meistertechniken Schritt für Schritt lernen');
  s = s.replace(/settings:\s*['"]Optionen['"]/g, `settings: 'Einstellungen'`);

  // Daily
  s = s.replace(/badgeTitle:\s*['"]\{month\} Meister-Abzeichen['"]/g, `badgeTitle: '{month} Meister'`);
  s = s.replace(/badgeDesc:\s*['"]\{completed\} \/ \{target\} gelöst \(Ziel: 15\+\)['"]/g, `badgeDesc: '{completed}/{target} · Ziel 15'`);
  s = s.replace(/unlockModalConfirmBtn:\s*['"]📺 Werbung ansehen & Freischalten['"]/g, `unlockModalConfirmBtn: '📺 Ansehen & freischalten'`);
  s = s.replace(/Meistern Sie ein Lv\.4 Schwer Rätsel und beweisen Sie Spitzenlogik\./g, 'Meistere ein Lv.4 Schwer Rätsel und beweise Spitzenlogik.');
  s = s.replace(/advLv5Title:\s*['"]\[Lv\.5 Experte\] 1 Sudoku lösen['"]/g, `advLv5Title: '[Lv.5 Meister] 1 Sudoku lösen'`);
  s = s.replace(/advLv5Desc:\s*['"]Löse das anspruchsvollste Lv\.5 Experten-Rätsel der Eliteklasse\.['"]/g, `advLv5Desc: 'Löse das anspruchsvollste Lv.5 Meister-Rätsel der Eliteklasse.'`);
  s = s.replace(/Nehmen Sie an 1 Echtzeit-1v1-Duell oder KI-Bot-Match teil\./g, 'Nimm an 1 Echtzeit-1v1-Duell oder KI-Bot-Match teil.');

  // RemoveAds
  s = s.replace(/heroDesc:\s*['"]Entfernen Sie dauerhaft alle Banner- und Zwischenwerbungen\.['"]/g,
    `heroDesc: 'Entferne dauerhaft die untere Banner- und die Zwischenwerbung nach dem Spiel.'`);
  s = s.replace(/benefitsTitle:\s*['"]👑 Vorteile der Premium-Mitgliedschaft['"]/g, `benefitsTitle: '👑 Vorteile des Premium-Zugangs'`);
  s = s.replace(/Maximale Konzentration und Akkuschonung Ihres Geräts/g, 'Maximale Konzentration und Akkuschonung deines Geräts');
  s = s.replace(/Unterstützen Sie Indie-Entwickler und zukünftige Updates/g, 'Unterstütze Indie-Entwickler und zukünftige Updates');
  s = s.replace(/buyBtn:\s*['"]Dauerhaft werbefrei erhalten \(\{price\}\)['"]/g, `buyBtn: 'Werbefrei ({price})'`);
  s = s.replace(/purchaseBtn:\s*['"]Werbung dauerhaft entfernen \(\{price\}\)['"]/g, `purchaseBtn: 'Werbung entfernen ({price})'`);
  s = s.replace(/restoreBtn:\s*['"]Käufe wiederherstellen['"]/g, `restoreBtn: 'Wiederherstellen'`);
  s = s.replace(/Sie besitzen die Premium-Mitgliedschaft bereits! 🎉/g, 'Du besitzt den Premium-Zugang bereits! 🎉');

  // Tutorial
  s = s.replace(/finishBtn:\s*['"]Echtes Spiel starten['"]/g, `finishBtn: "Los geht's"`);
  s = s.replace(/Tippen Sie auf das hervorgehobene Feld \[Zeile 1, Spalte 3\] und geben Sie \[9\] ein!/g, 'Tippe auf das hervorgehobene Feld [Zeile 1, Spalte 3] und gib [9] ein!');
  s = s.replace(/Aktivieren Sie \[Notizen\] in der Leiste und notieren Sie Kandidat \[3\]!/g, 'Aktiviere [Notizen] in der Leiste und notiere Kandidat [3]!');
  s = s.replace(/Fixieren Sie Zahl \[4\] und tippen Sie zügig auf leere Felder!/g, 'Fixiere Zahl [4] und tippe zügig auf leere Felder!');
  s = s.replace(/Glückwunsch! Sie beherrschen Eingabe, Notizen und Schnellmodus perfekt\./g, 'Glückwunsch! Du beherrschst Eingabe, Notizen und Schnellmodus perfekt.');

  // Settings & Privacy
  s = s.replace(/Wählen Sie Ihre bevorzugte Sprache\./g, 'Wähle deine bevorzugte Sprache.');
  s = s.replace(/auto:\s*['"]System-Normal['"]/g, `auto: 'Systemstandard'`);
  s = s.replace(/hapticFx:\s*['"]Haptisches Feedback['"]/g, `hapticFx: 'Haptisches Feedback (Vibration)'`);
  s = s.replace(/privacySubtitle:\s*['"]Datenschutz['"]/g, `privacySubtitle: 'Zero-PII-Datenschutz'`);
  s = s.replace(/privacyPolicyBtn:\s*['"]Datenschutzerklärung ansehen['"]/g, `privacyPolicyBtn: 'Datenschutz'`);
  s = s.replace(/Sudoku schützt Ihre Privatsphäre und folgt strikt dem -Prinzip\./g, 'Sudoku schützt deine Privatsphäre und folgt strikt dem Zero-PII-Prinzip.');
  s = s.replace(/Für Matchmaking werden nur temporäre anonyme Token und Abschlusszeiten genutzt\./g, 'Für Matchmaking werden nur temporäre anonyme Token und Abschluss-Datensätze genutzt.');

  // Stats
  s = s.replace(/Echtzeit-Weltranglisten mit Google Play Games einsehen\./g, 'Echtzeit-Weltranglisten mit Google Play Spiele einsehen.');
  s = s.replace(/leaderboardBtn:\s*['"]🌐 🏆 Globale Bestenlisten ansehen['"]/g, `leaderboardBtn: '🏆 Bestenlisten'`);
  s = s.replace(/survivalTotalWins:\s*['"]Überlebens-Siege['"]/g, `survivalTotalWins: 'Überlebens-Erfolge'`);
  s = s.replace(/survivalWinsUnit:\s*['"]\{count\} Siege['"]/g, `survivalWinsUnit: '{count} geschafft'`);
  s = s.replace(/achTitle:\s*['"]🏆 30 Globale Erfolge['"]/g, `achTitle: '🏆 30 globale Erfolge'`);
  s = s.replace(/Schalten Sie Meilensteine beim Lösen von Sudokus frei/g, 'Schalte Meilensteine beim Lösen von Sudokus frei');
  s = s.replace(/startFirstBtn:\s*['"]Erstes Sudoku starten 🚀['"]/g, `startFirstBtn: 'Erstes Sudoku 🚀'`);

  // BrainReport
  s = s.replace(/focus:\s*['"]Tiefenkonzentration['"]/g, `focus: 'Konzentration'`);
  s = s.replace(/durability:\s*['"]Ausdauer & Fokus['"]/g, `durability: 'Ausdauer'`);
  s = s.replace(/logic:\s*['"]Logische Deduktion['"]/g, `logic: 'Logik'`);
  s = s.replace(/speed:\s*['"]Verarbeitungsgeschwindigkeit['"]/g, `speed: 'Tempo'`);
  s = s.replace(/shareCardBtn:\s*['"]🔗 Gehirn-Analyse teilen['"]/g, `shareCardBtn: '🔗 Bericht teilen'`);
  s = s.replace(/shareBtn:\s*['"]Gehirnbericht teilen['"]/g, `shareBtn: 'Bericht teilen'`);
  s = s.replace(/Frühes Trainingsstadium\. Ihr kognitiver Index wird stetig wachsen!/g, 'Frühes Trainingsstadium. Dein kognitiver Index wird stetig wachsen!');

  // BattleLobby & BattleResult & AIBattle
  s = s.replace(/autoMatchTitle:\s*['"]Schnellsuche['"]/g, `autoMatchTitle: 'Schnellduell'`);
  s = s.replace(/victoryMistakeDesc:\s*['"]\{opponent\} wurde wegen 3 Fehlern disqualifiziert\. Sie gewinnen!['"]/g,
    `victoryMistakeDesc: '{opponent} wurde wegen 3 Fehlern disqualifiziert. Du gewinnst!'`);
  s = s.replace(/defeatMistakeDesc:\s*['"]Sie wurden wegen 3 Fehlern disqualifiziert\.['"]/g,
    `defeatMistakeDesc: 'Du wurdest wegen 3 Fehlern disqualifiziert.'`);
  s = s.replace(/disqualified:\s*['"]💀 Disqualifiziert['"]/g, `disqualified: '💀 Raus'`);
  s = s.replace(/rematchBtn:\s*['"]Revanche anfordern['"]/g, `rematchBtn: 'Revanche'`);
  s = s.replace(/rematchWaitingBtn:\s*['"]Warte auf Antwort\.\.\. \(\{seconds\}s\)['"]/g, `rematchWaitingBtn: 'Warte... ({seconds}s)'`);
  s = s.replace(/surrender:\s*['"]Aufgeben['"]/g, `surrender: 'Duell aufgeben'`);
  s = s.replace(/startBtn:\s*['"]Lv\.\{level\} \{name\} KI-Duell starten['"]/g, `startBtn: 'Duell Lv.{level} vs {name}'`);

  // Academy
  s = s.replace(/stageTitles:\s*\{[\s\S]*?stage5:[^}]+\}/, `stageTitles: {
      stage1: 'Stufe 1: Grundtechniken (Singles & Linien)',
      stage2: 'Stufe 2: Mittlere Techniken (Paare & Schnittmengen)',
      stage3: 'Stufe 3: Fortgeschrittene Techniken (Wing-Familie)',
      stage4: 'Stufe 4: Experten-Techniken (Fish, Coloring & Unique Rectangle)',
      stage5: 'Stufe 5: Meister-Techniken (AIC, ALS & Exocet-Ketten)'
    }`);
  s = s.replace(/subtitle:\s*['"]Meistern Sie 32 authentische Techniken von der Basis bis zum Großmeister['"]/g,
    `subtitle: 'Meistere 32 authentische Techniken von der Basis bis zum Großmeister'`);
  s = s.replace(/stage1:\s*['"]Stufe 1: Grundlegende Singles & Linien['"]/g, `stage1: 'Stufe 1: Singles & Linien'`);
  s = s.replace(/stage2:\s*['"]Stufe 2: Block-Paare & Schnittmengen['"]/g, `stage2: 'Stufe 2: Block-Paare & Schnittmengen'`);
  s = s.replace(/stage3:\s*['"]Stufe 3: Wing-Serien & Fish-Strategien['"]/g, `stage3: 'Stufe 3: Wing-Familie'`);
  s = s.replace(/stage4:\s*['"]Stufe 4: Coloring & 3D-Medusa['"]/g, `stage4: 'Stufe 4: Fish, Coloring & Unique Rectangle'`);
  s = s.replace(/stage5:\s*['"]Stufe 5: Meisterliche UR, AIC & ALS-Ketten['"]/g, `stage5: 'Stufe 5: AIC, ALS & Exocet-Ketten'`);
  s = s.replace(/theory:\s*['"]Erklärung['"]/g, `theory: 'Theorie'`);
  s = s.replace(/error:\s*['"]\[\{val\}\] ist nicht korrekt\. Überprüfen Sie die Hinweis-Zahlen!['"]/g,
    `error: '[{val}] ist nicht korrekt. Überprüfe die vorgegebenen Zahlen!'`);
  s = s.replace(/prompt:\s*['"]👇 Tippen Sie die gesuchte Zahl \(\?\) auf dem Tastenfeld unten ein\.['"]/g,
    `prompt: '👇 Tippe die gesuchte Zahl (?) auf dem Tastenfeld unten ein.'`);
  s = s.replace(/Lernen Sie Schritt für Schritt, wie man Felder ausfüllt und Notizen setzt\./g,
    'Lerne Schritt für Schritt, wie man Felder ausfüllt und Notizen setzt.');

  fs.writeFileSync(scrPath, s, 'utf8');
  console.log('✅ Updated de/screens.js');
}
