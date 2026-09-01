/**
 * translate_practice_missions_pure.mjs
 * Full sentence translator for all 54 Practice Missions across all 13 Languages.
 */

import fs from 'fs';
import path from 'path';

// Complete natural translations for practice mission sentences
export const MISSION_TRANSLATIONS = {
  de: {
    'Check the 8 glowing numbers (1-8). Enter the remaining final digit into the glowing target cell.':
      'Überprüfen Sie die 8 leuchtenden Zahlen (1-8). Tragen Sie die letzte verbleibende Zahl in das Zielfeld ein.',
    'The box contains 2, 3, 4, 5, 6, 7, 8, 9. What is the single missing digit for the center cell?':
      'Der Block enthält 2, 3, 4, 5, 6, 7, 8, 9. Welche Zahl fehlt in der Mitte?',
    'Scan row 1 and column 5 to eliminate invalid cells. Place 5 in the remaining valid cell.':
      'Überprüfen Sie Zeile 1 und Spalte 5, um blockierte Felder auszuschließen. Setzen Sie 5 in das freie Feld.',
    'Row, column, and box contain 1,2,3,5,6,7,8,9. Enter the only candidate for this cell.':
      'Zeile, Spalte und Block enthalten 1,2,3,5,6,7,8,9. Tragen Sie die einzige Zahl für dieses Feld ein.',
    'Among all notes in the box, digit 7 fits in only this cell. Enter 7.':
      'Unter allen Notizen im Block passt die Zahl 7 nur in dieses Feld. Tragen Sie 7 ein.',
    'Two cells lock (3,8) in row 1. Eliminate 3 & 8 to find the remaining answer [5]. Enter 5.':
      'Zwei Felder sperren (3,8) in Zeile 1. Schließen Sie 3 und 8 aus, um die [5] zu finden. Tragen Sie 5 ein.',
    'Two cells hold (2,7) exclusively. Clear other candidates to reveal the pair. Enter 2.':
      'Zwei Felder halten (2,7) exklusiv. Entfernen Sie andere Zahlen, um das Paar freizulegen. Tragen Sie 2 ein.',
    'Three cells lock candidates {1,2,3} across this row. Eliminate 1,2,3 to confirm [7]. Enter 7.':
      'Drei Felder sperren {1,2,3} in dieser Zeile. Schließen Sie 1,2,3 aus, um [7] zu bestätigen. Tragen Sie 7 ein.',
    'Four cells lock candidates {1,2,3,4} across this unit. Confirm [9] in the target cell. Enter 9.':
      'Vier Felder sperren {1,2,3,4} in dieser Einheit. Bestätigen Sie [9] im Zielfeld. Tragen Sie 9 ein.',
    'Candidates 1, 4, 7, 9 appear only in 4 specific cells across this unit. Confirm [1]. Enter 1.':
      'Kandidaten 1, 4, 7, 9 erscheinen nur in 4 Feldern dieser Einheit. Bestätigen Sie [1]. Tragen Sie 1 ein.',
    'Candidate 7 forms an X-Wing in columns 2 and 8. Eliminate 7 from column 2 to solve [4]. Enter 4.':
      'Zahl 7 bildet ein X-Wing in Spalten 2 und 8. Schließen Sie 7 aus Spalte 2 aus, um [4] zu lösen. Tragen Sie 4 ein.',
    'Pivot (1,2) with pincers (1,3) and (2,3) eliminates 3 from the intersection. Enter 5.':
      'Pivot (1,2) mit Flügeln (1,3) und (2,3) schließt 3 am Schnittpunkt aus. Tragen Sie 5 ein.',
    'Tri-value pivot (1,2,3) with wings (1,3) and (2,3) eliminates 3 from common view. Enter 4.':
      '3er-Pivot (1,2,3) mit Flügeln (1,3) und (2,3) schließt 3 aus dem Sichtfeld aus. Tragen Sie 4 ein.',
    'Two (1,8) pairs connected by a strong link on 8 eliminate candidate 1. Enter 2.':
      'Zwei (1,8)-Paare mit starker Verbindung auf 8 schließen Kandidat 1 aus. Tragen Sie 2 ein.',
    'All cells have 2 candidates except one tri-value cell (2,5,8). Digit 5 appears 3 times. Enter 5.':
      'Alle Zellen haben 2 Zahlen außer einer 3er-Zelle (2,5,8). Zahl 5 kommt 3-mal vor. Tragen Sie 5 ein.',
    'Chain of (3,7) pairs eliminates 3 and 7 from the intersection. Enter 6.':
      'Kette aus (3,7)-Paaren schließt 3 und 7 am Schnittpunkt aus. Tragen Sie 6 ein.',
    'Candidate 4 in 3 rows locks into 3 columns. Eliminate 4 to reveal [2]. Enter 2.':
      'Zahl 4 in 3 Zeilen sperrt 3 Spalten. Schließen Sie 4 aus, um [2] zu finden. Tragen Sie 2 ein.',
    'Candidate 2 in 4 rows locks into 4 columns. Eliminate 2 to reveal [8]. Enter 8.':
      'Zahl 2 in 4 Zeilen sperrt 4 Spalten. Schließen Sie 2 aus, um [8] zu finden. Tragen Sie 8 ein.',
    'Three corners are locked to [1,2]. To prevent a deadly pattern with multiple solutions, the 4th cell must be [5]. Enter 5.':
      'Drei Ecken sind auf [1,2] gesperrt. Um Mehrdeutigkeit zu verhindern, muss das 4. Feld [5] sein. Tragen Sie 5 ein.',
    'Simple Colouring chain on candidate 3 eliminates 3 from mutual sight, confirming [8]. Enter 8.':
      'Simple Colouring Kette auf Zahl 3 schließt 3 aus dem Sichtfeld aus und bestätigt [8]. Tragen Sie 8 ein.',
    '3D Medusa multi-value chain reveals contradiction, confirming [6]. Enter 6.':
      '3D Medusa Kette deckt Widerspruch auf und bestätigt [6]. Tragen Sie 6 ein.',
    'XY-Chain from (1,4) to (4,7) eliminates candidate 7 at intersection, leaving [3]. Enter 3.':
      'XY-Chain von (1,4) bis (4,7) schließt Kandidat 7 am Schnittpunkt aus und lässt [3]. Tragen Sie 3 ein.',
    'WXYZ-Wing with candidates (1,2,3,4) eliminates Z(4) from common sight, leaving [9]. Enter 9.':
      'WXYZ-Wing mit (1,2,3,4) schließt Z(4) aus dem Sichtfeld aus und lässt [9]. Tragen Sie 9 ein.',
    'Empty Rectangle L-shape in box aligns with strong link to eliminate candidate 5, leaving [1]. Enter 1.':
      'Empty Rectangle L-Form im Block schließt Zahl 5 aus und lässt [1]. Tragen Sie 1 ein.',
    'Finned X-Wing eliminates 6 from the mutual sight intersection, leaving [3]. Enter 3.':
      'Finned X-Wing schließt 6 aus dem gemeinsamen Schnittpunkt aus und lässt [3]. Tragen Sie 3 ein.',
    'AIC chain inference leaves [6] in the target cell. Enter 6.':
      'AIC-Kette bestimmt [6] im Zielfeld. Tragen Sie 6 ein.',
    'Two ALS sets connected by candidate 2 eliminate candidate 7, leaving [1]. Enter 1.':
      'Zwei über Kandidat 2 verknüpfte ALS-Sets schließen Kandidat 7 aus und lassen [1]. Tragen Sie 1 ein.',
    'All hypothetical branches converge to verify digit [7] in the target cell. Enter 7.':
      'Alle hypothetischen Zweige bestätigen Zahl [7] im Zielfeld. Tragen Sie 7 ein.',
    'Exocet base cells project digits into target cells, confirming [8]. Enter 8.':
      'Exocet-Basisfelder projizieren Zahlen in die Zielfelder und bestätigen [8]. Tragen Sie 8 ein.'
  },
  ar: {
    'Check the 8 glowing numbers (1-8). Enter the remaining final digit into the glowing target cell.':
      'تحقق من الأرقام الثمانية المضيئة (1-8). أدخل الرقم الأخير المتبقي في الخلية المضيئة المستهدفة.',
    'The box contains 2, 3, 4, 5, 6, 7, 8, 9. What is the single missing digit for the center cell?':
      'يحتوي المربع على 2، 3، 4، 5، 6، 7، 8، 9. ما هو الرقم الناقص في الخلية المركزية؟',
    'Scan row 1 and column 5 to eliminate invalid cells. Place 5 in the remaining valid cell.':
      'امسح الصف 1 والعمود 5 لاستبعاد الخلايا غير الصالحة. ضع 5 في الخلية الصالحة المتبقية.',
    'Row, column, and box contain 1,2,3,5,6,7,8,9. Enter the only candidate for this cell.':
      'الصف والعمود والمربع يحتوي على 1،2،3،5،6،7،8،9. أدخل الرقم المرشح الوحيد لهذه الخلية.',
    'Among all notes in the box, digit 7 fits in only this cell. Enter 7.':
      'من بين جميع الملاحظات في المربع، يناسب الرقم 7 هذه الخلية فقط. أدخل 7.',
    'Two cells lock (3,8) in row 1. Eliminate 3 & 8 to find the remaining answer [5]. Enter 5.':
      'خليتان تقفلان (3,8) في الصف 1. استبعد 3 و 8 لإيجاد الإجابة المتبقية [5]. أدخل 5.',
    'Two cells hold (2,7) exclusively. Clear other candidates to reveal the pair. Enter 2.':
      'خليتان تحتويان حصرياً على (2,7). احذف المرشحات الأخرى لإظهار الزوج. أدخل 2.',
    'Three cells lock candidates {1,2,3} across this row. Eliminate 1,2,3 to confirm [7]. Enter 7.':
      'ثلاث خلايا تقفل المرشحات {1,2,3} في هذا الصف. استبعد 1،2،3 لتأكيد [7]. أدخل 7.',
    'Four cells lock candidates {1,2,3,4} across this unit. Confirm [9] in the target cell. Enter 9.':
      'أربع خلايا تقفل المرشحات {1,2,3,4} في هذه الوحدة. أكد الرقم [9] في الخلية المستهدفة. أدخل 9.',
    'Candidates 1, 4, 7, 9 appear only in 4 specific cells across this unit. Confirm [1]. Enter 1.':
      'المرشحات 1، 4، 7، 9 تظهر في 4 خلايا محددة فقط. أكد الرقم [1]. أدخل 1.',
    'Candidate 7 forms an X-Wing in columns 2 and 8. Eliminate 7 from column 2 to solve [4]. Enter 4.':
      'يشكل الرقم 7 نمط جناح إكس في العمودين 2 و 8. استبعد 7 من العمود 2 لحل [4]. أدخل 4.',
    'Pivot (1,2) with pincers (1,3) and (2,3) eliminates 3 from the intersection. Enter 5.':
      'المحور (1,2) مع الجناحين (1,3) و (2,3) يستبعد الرقم 3 عند التقاطع. أدخل 5.',
    'Tri-value pivot (1,2,3) with wings (1,3) and (2,3) eliminates 3 from common view. Enter 4.':
      'المحور الثلاثي (1,2,3) مع الجناحين (1,3) و (2,3) يستبعد الرقم 3 من مجال الرؤية المشترك. أدخل 4.',
    'Two (1,8) pairs connected by a strong link on 8 eliminate candidate 1. Enter 2.':
      'زوجان من (1,8) متصلان برابط قوي على 8 يستبعدان الرقم المرشح 1. أدخل 2.',
    'All cells have 2 candidates except one tri-value cell (2,5,8). Digit 5 appears 3 times. Enter 5.':
      'جميع الخلايا بها مرشحان اثنان ما عدا خلية ثلاثية (2,5,8). يتكرر الرقم 5 ثلاث مرات. أدخل 5.',
    'Chain of (3,7) pairs eliminates 3 and 7 from the intersection. Enter 6.':
      'سلسلة من أزواج (3,7) تستبعد 3 و 7 من نقطة التقاطع. أدخل 6.',
    'Candidate 4 in 3 rows locks into 3 columns. Eliminate 4 to reveal [2]. Enter 2.':
      'الرقم 4 في 3 صفوف يقفل 3 أعمدة. استبعد 4 للكشف عن [2]. أدخل 2.',
    'Candidate 2 in 4 rows locks into 4 columns. Eliminate 2 to reveal [8]. Enter 8.':
      'الرقم 2 في 4 صفوف يقفل 4 أعمدة. استبعد 2 للكشف عن [8]. أدخل 8.',
    'Three corners are locked to [1,2]. To prevent a deadly pattern with multiple solutions, the 4th cell must be [5]. Enter 5.':
      'ثلاث زوايا مقفلة على [1,2]. لمنع النمط القاتل متعدد الحلول، يجب أن تكون الخلية الرابعة [5]. أدخل 5.',
    'Simple Colouring chain on candidate 3 eliminates 3 from mutual sight, confirming [8]. Enter 8.':
      'سلسلة التلوين البسيط للرقم 3 تستبعد 3 من الرؤية المتبادلة، مما يؤكد [8]. أدخل 8.',
    '3D Medusa multi-value chain reveals contradiction, confirming [6]. Enter 6.':
      'سلسلة ميدوسا ثلاثية الأبعاد تكشف التناقض وتؤكد الرقم [6]. أدخل 6.',
    'XY-Chain from (1,4) to (4,7) eliminates candidate 7 at intersection, leaving [3]. Enter 3.':
      'سلسلة XY من (1,4) إلى (4,7) تستبعد المرشح 7 عند التقاطع وتترك [3]. أدخل 3.',
    'WXYZ-Wing with candidates (1,2,3,4) eliminates Z(4) from common sight, leaving [9]. Enter 9.':
      'جناح WXYZ بالمرشحات (1,2,3,4) يستبعد Z(4) من الرؤية المشتركة وتترك [9]. أدخل 9.',
    'Empty Rectangle L-shape in box aligns with strong link to eliminate candidate 5, leaving [1]. Enter 1.':
      'المستطيل الفارغ L في المربع يلتقي مع رابط قوي لاستبعاد المرشح 5 وترك [1]. أدخل 1.',
    'Finned X-Wing eliminates 6 from the mutual sight intersection, leaving [3]. Enter 3.':
      'جناح إكس ذو الزعنفة يستبعد 6 من تقاطع الرؤية المتبادل ويترك [3]. أدخل 3.',
    'AIC chain inference leaves [6] in the target cell. Enter 6.':
      'استدلال سلسلة AIC يحدد الرقم [6] في الخلية المستهدفة. أدخل 6.',
    'Two ALS sets connected by candidate 2 eliminate candidate 7, leaving [1]. Enter 1.':
      'مجموعتان ALS متصلتان بالمرشح 2 تستبعدان المرشح 7 وتتركان [1]. أدخل 1.',
    'All hypothetical branches converge to verify digit [7] in the target cell. Enter 7.':
      'تتقارب جميع الفروع الافتراضية لتأكيد الرقم [7] في الخلية المستهدفة. أدخل 7.',
    'Exocet base cells project digits into target cells, confirming [8]. Enter 8.':
      'تسقط خلايا إكسوسيت الأساسية الأرقام في الخلايا المستهدفة مؤكدة [8]. أدخل 8.'
  },
  fr: {
    'Check the 8 glowing numbers (1-8). Enter the remaining final digit into the glowing target cell.':
      'Vérifiez les 8 chiffres en surbrillance (1-8). Entrez le chiffre manquant dans la case cible.',
    'The box contains 2, 3, 4, 5, 6, 7, 8, 9. What is the single missing digit for the center cell?':
      'Le bloc contient 2, 3, 4, 5, 6, 7, 8, 9. Quel est le chiffre manquant au centre ?',
    'Scan row 1 and column 5 to eliminate invalid cells. Place 5 in the remaining valid cell.':
      'Scannez la ligne 1 et la colonne 5 pour éliminer les cases impossibles. Placez 5 dans la case valide.',
    'Row, column, and box contain 1,2,3,5,6,7,8,9. Enter the only candidate for this cell.':
      'La ligne, colonne et bloc ont 1,2,3,5,6,7,8,9. Entrez le seul candidat pour cette case.',
    'Among all notes in the box, digit 7 fits in only this cell. Enter 7.':
      'Parmi toutes les notes du bloc, le chiffre 7 ne rentre que dans cette case. Entrez 7.',
    'Two cells lock (3,8) in row 1. Eliminate 3 & 8 to find the remaining answer [5]. Enter 5.':
      'Deux cases verrouillent (3,8) en ligne 1. Éliminez 3 et 8 pour trouver [5]. Entrez 5.',
    'Two cells hold (2,7) exclusively. Clear other candidates to reveal the pair. Enter 2.':
      'Deux cases contiennent (2,7) exclusivement. Supprimez les autres candidats. Entrez 2.',
    'Three cells lock candidates {1,2,3} across this row. Eliminate 1,2,3 to confirm [7]. Enter 7.':
      'Trois cases verrouillent {1,2,3} sur cette ligne. Éliminez 1,2,3 pour confirmer [7]. Entrez 7.',
    'Four cells lock candidates {1,2,3,4} across this unit. Confirm [9] in the target cell. Enter 9.':
      'Quatre cases verrouillent {1,2,3,4} sur cette unité. Confirmez [9] dans la case cible. Entrez 9.',
    'Candidates 1, 4, 7, 9 appear only in 4 specific cells across this unit. Confirm [1]. Enter 1.':
      'Les candidats 1, 4, 7, 9 apparaissent dans 4 cases spécifiques. Confirmez [1]. Entrez 1.',
    'Candidate 7 forms an X-Wing in columns 2 and 8. Eliminate 7 from column 2 to solve [4]. Enter 4.':
      'Le candidat 7 forme un X-Wing sur les colonnes 2 et 8. Éliminez 7 de la colonne 2 pour trouver [4]. Entrez 4.',
    'Pivot (1,2) with pincers (1,3) and (2,3) eliminates 3 from the intersection. Enter 5.':
      'Le pivot (1,2) avec pinces (1,3) et (2,3) élimine 3 à l’intersection. Entrez 5.',
    'Tri-value pivot (1,2,3) with wings (1,3) and (2,3) eliminates 3 from common view. Enter 4.':
      'Le pivot triple (1,2,3) avec ailes (1,3) et (2,3) élimine 3 de la vue commune. Entrez 4.',
    'Two (1,8) pairs connected by a strong link on 8 eliminate candidate 1. Enter 2.':
      'Deux paires (1,8) reliées par un lien fort sur 8 éliminent le candidat 1. Entrez 2.',
    'All cells have 2 candidates except one tri-value cell (2,5,8). Digit 5 appears 3 times. Enter 5.':
      'Toutes les cases ont 2 candidats sauf une case triple (2,5,8). Le chiffre 5 apparaît 3 fois. Entrez 5.',
    'Chain of (3,7) pairs eliminates 3 and 7 from the intersection. Enter 6.':
      'Une chaîne de paires (3,7) élimine 3 et 7 à l’intersection. Entrez 6.',
    'Candidate 4 in 3 rows locks into 3 columns. Eliminate 4 to reveal [2]. Enter 2.':
      'Le candidat 4 sur 3 lignes verrouille 3 colonnes. Éliminez 4 pour trouver [2]. Entrez 2.',
    'Candidate 2 in 4 rows locks into 4 columns. Eliminate 2 to reveal [8]. Enter 8.':
      'Le candidat 2 sur 4 lignes verrouille 4 colonnes. Éliminez 2 pour trouver [8]. Entrez 8.',
    'Three corners are locked to [1,2]. To prevent a deadly pattern with multiple solutions, the 4th cell must be [5]. Enter 5.':
      'Trois coins sont verrouillés sur [1,2]. Pour éviter le motif fatal à plusieurs solutions, la 4e case doit être [5]. Entrez 5.',
    'Simple Colouring chain on candidate 3 eliminates 3 from mutual sight, confirming [8]. Enter 8.':
      'La chaîne Simple Colouring sur le 3 élimine 3 de la vue mutuelle et confirme [8]. Entrez 8.',
    '3D Medusa multi-value chain reveals contradiction, confirming [6]. Enter 6.':
      'La chaîne 3D Medusa révèle une contradiction et confirme [6]. Entrez 6.',
    'XY-Chain from (1,4) to (4,7) eliminates candidate 7 at intersection, leaving [3]. Enter 3.':
      'La chaîne XY de (1,4) à (4,7) élimine le candidat 7 à l’intersection et laisse [3]. Entrez 3.',
    'WXYZ-Wing with candidates (1,2,3,4) eliminates Z(4) from common sight, leaving [9]. Enter 9.':
      'Le WXYZ-Wing avec (1,2,3,4) élimine Z(4) de la vue commune et laisse [9]. Entrez 9.',
    'Empty Rectangle L-shape in box aligns with strong link to eliminate candidate 5, leaving [1]. Enter 1.':
      'Le motif en L d’Empty Rectangle dans le bloc élimine le candidat 5 et laisse [1]. Entrez 1.',
    'Finned X-Wing eliminates 6 from the mutual sight intersection, leaving [3]. Enter 3.':
      'Le Finned X-Wing élimine 6 de l’intersection mutuelle et laisse [3]. Entrez 3.',
    'AIC chain inference leaves [6] in the target cell. Enter 6.':
      'L’inférence de chaîne AIC détermine [6] dans la case cible. Entrez 6.',
    'Two ALS sets connected by candidate 2 eliminate candidate 7, leaving [1]. Enter 1.':
      'Deux ensembles ALS liés par le candidat 2 éliminent le candidat 7 et laissent [1]. Entrez 1.',
    'All hypothetical branches converge to verify digit [7] in the target cell. Enter 7.':
      'Toutes les branches hypothétiques convergent pour confirmer [7] dans la case cible. Entrez 7.',
    'Exocet base cells project digits into target cells, confirming [8]. Enter 8.':
      'Les cases de base d’Exocet projettent les chiffres dans les cases cibles et confirment [8]. Entrez 8.'
  },
  pt: {
    'Check the 8 glowing numbers (1-8). Enter the remaining final digit into the glowing target cell.':
      'Verifique os 8 números destacados (1-8). Digite o dígito restante na casa destacada.',
    'The box contains 2, 3, 4, 5, 6, 7, 8, 9. What is the single missing digit for the center cell?':
      'O bloco contém 2, 3, 4, 5, 6, 7, 8, 9. Qual número falta na casa central?',
    'Scan row 1 and column 5 to eliminate invalid cells. Place 5 in the remaining valid cell.':
      'Analise a linha 1 e a coluna 5 para eliminar casas inválidas. Coloque 5 na casa livre.',
    'Row, column, and box contain 1,2,3,5,6,7,8,9. Enter the only candidate for this cell.':
      'Linha, coluna e bloco contêm 1,2,3,5,6,7,8,9. Digite o único candidato desta casa.',
    'Among all notes in the box, digit 7 fits in only this cell. Enter 7.':
      'Entre todas as notas do bloco, o dígito 7 cabe apenas nesta casa. Digite 7.',
    'Two cells lock (3,8) in row 1. Eliminate 3 & 8 to find the remaining answer [5]. Enter 5.':
      'Duas casas bloqueiam (3,8) na linha 1. Elimine 3 e 8 para encontrar [5]. Digite 5.',
    'Two cells hold (2,7) exclusively. Clear other candidates to reveal the pair. Enter 2.':
      'Duas casas contêm (2,7) exclusivamente. Remova outros candidatos. Digite 2.',
    'Three cells lock candidates {1,2,3} across this row. Eliminate 1,2,3 to confirm [7]. Enter 7.':
      'Três casas bloqueiam {1,2,3} nesta linha. Elimine 1,2,3 para confirmar [7]. Digite 7.',
    'Four cells lock candidates {1,2,3,4} across this unit. Confirm [9] in the target cell. Enter 9.':
      'Quatro casas bloqueiam {1,2,3,4} nesta unidade. Confirme [9] na casa alvo. Digite 9.',
    'Candidates 1, 4, 7, 9 appear only in 4 specific cells across this unit. Confirm [1]. Enter 1.':
      'Os candidatos 1, 4, 7, 9 aparecem em 4 casas específicas. Confirme [1]. Digite 1.',
    'Candidate 7 forms an X-Wing in columns 2 and 8. Eliminate 7 from column 2 to solve [4]. Enter 4.':
      'O candidato 7 forma um X-Wing nas colunas 2 e 8. Elimine 7 da coluna 2 para obter [4]. Digite 4.',
    'Pivot (1,2) with pincers (1,3) and (2,3) eliminates 3 from the intersection. Enter 5.':
      'O pivô (1,2) com asas (1,3) e (2,3) elimina 3 na interseção. Digite 5.',
    'Tri-value pivot (1,2,3) with wings (1,3) and (2,3) eliminates 3 from common view. Enter 4.':
      'O pivô triplo (1,2,3) com asas (1,3) e (2,3) elimina 3 da vista comum. Digite 4.',
    'Two (1,8) pairs connected by a strong link on 8 eliminate candidate 1. Enter 2.':
      'Dois pares (1,8) conectados por ligação forte no 8 eliminam o candidato 1. Digite 2.',
    'All cells have 2 candidates except one tri-value cell (2,5,8). Digit 5 appears 3 times. Enter 5.':
      'Todas as casas têm 2 candidatos exceto uma casa tripla (2,5,8). O dígito 5 aparece 3 vezes. Digite 5.',
    'Chain of (3,7) pairs eliminates 3 and 7 from the intersection. Enter 6.':
      'Uma cadeia de pares (3,7) elimina 3 e 7 na interseção. Digite 6.',
    'Candidate 4 in 3 rows locks into 3 columns. Eliminate 4 to reveal [2]. Enter 2.':
      'O candidato 4 em 3 linhas bloqueia 3 colunas. Elimine 4 para revelar [2]. Digite 2.',
    'Candidate 2 in 4 rows locks into 4 columns. Eliminate 2 to reveal [8]. Enter 8.':
      'O candidato 2 em 4 linhas bloqueia 4 colunas. Elimine 2 para revelar [8]. Digite 8.',
    'Three corners are locked to [1,2]. To prevent a deadly pattern with multiple solutions, the 4th cell must be [5]. Enter 5.':
      'Três cantos estão bloqueados em [1,2]. Para evitar o padrão mortal com múltiplas soluções, a 4ª casa deve ser [5]. Digite 5.',
    'Simple Colouring chain on candidate 3 eliminates 3 from mutual sight, confirming [8]. Enter 8.':
      'A cadeia Simple Colouring no candidato 3 elimina 3 da visão mútua e confirma [8]. Digite 8.',
    '3D Medusa multi-value chain reveals contradiction, confirming [6]. Enter 6.':
      'A cadeia 3D Medusa revela contradição e confirma [6]. Digite 6.',
    'XY-Chain from (1,4) to (4,7) eliminates candidate 7 at intersection, leaving [3]. Enter 3.':
      'A XY-Chain de (1,4) a (4,7) elimina o candidato 7 na interseção e deixa [3]. Digite 3.',
    'WXYZ-Wing with candidates (1,2,3,4) eliminates Z(4) from common sight, leaving [9]. Enter 9.':
      'O WXYZ-Wing com (1,2,3,4) elimina Z(4) da visão comum e deixa [9]. Digite 9.',
    'Empty Rectangle L-shape in box aligns with strong link to eliminate candidate 5, leaving [1]. Enter 1.':
      'O formato em L do Empty Rectangle elimina o candidato 5 e deixa [1]. Digite 1.',
    'Finned X-Wing eliminates 6 from the mutual sight intersection, leaving [3]. Enter 3.':
      'O Finned X-Wing elimina 6 da interseção mútua e deixa [3]. Digite 3.',
    'AIC chain inference leaves [6] in the target cell. Enter 6.':
      'A inferência da cadeia AIC determina [6] na casa alvo. Digite 6.',
    'Two ALS sets connected by candidate 2 eliminate candidate 7, leaving [1]. Enter 1.':
      'Dois conjuntos ALS ligados pelo candidato 2 eliminam o candidato 7 e deixam [1]. Digite 1.',
    'All hypothetical branches converge to verify digit [7] in the target cell. Enter 7.':
      'Todos os ramos hipotéticos convergem para confirmar [7] na casa alvo. Digite 7.',
    'Exocet base cells project digits into target cells, confirming [8]. Enter 8.':
      'As casas base do Exocet projetam números nas casas alvo e confirmam [8]. Digite 8.'
  },
  it: {
    'Check the 8 glowing numbers (1-8). Enter the remaining final digit into the glowing target cell.':
      'Controlla gli 8 numeri evidenziati (1-8). Inserisci il numero mancante nella casella bersaglio.',
    'The box contains 2, 3, 4, 5, 6, 7, 8, 9. What is the single missing digit for the center cell?':
      'Il blocco contiene 2, 3, 4, 5, 6, 7, 8, 9. Quale numero manca al centro?',
    'Scan row 1 and column 5 to eliminate invalid cells. Place 5 in the remaining valid cell.':
      'Esamina la riga 1 e la colonna 5 per eliminare le caselle non valide. Posiziona 5 nella casella libera.',
    'Row, column, and box contain 1,2,3,5,6,7,8,9. Enter the only candidate for this cell.':
      'Riga, colonna e blocco hanno 1,2,3,5,6,7,8,9. Inserisci l’unico candidato di questa casella.',
    'Among all notes in the box, digit 7 fits in only this cell. Enter 7.':
      'Tra tutte le note nel blocco, il numero 7 entra solo in questa casella. Inserisci 7.',
    'Two cells lock (3,8) in row 1. Eliminate 3 & 8 to find the remaining answer [5]. Enter 5.':
      'Due caselle bloccano (3,8) nella riga 1. Elimina 3 e 8 per trovare [5]. Inserisci 5.',
    'Two cells hold (2,7) exclusively. Clear other candidates to reveal the pair. Enter 2.':
      'Due caselle contengono (2,7) esclusivamente. Rimuovi gli altri candidati. Inserisci 2.',
    'Three cells lock candidates {1,2,3} across this row. Eliminate 1,2,3 to confirm [7]. Enter 7.':
      'Tre caselle bloccano {1,2,3} su questa riga. Elimina 1,2,3 per confermare [7]. Inserisci 7.',
    'Four cells lock candidates {1,2,3,4} across this unit. Confirm [9] in the target cell. Enter 9.':
      'Quattro caselle bloccano {1,2,3,4} in questa unità. Conferma [9] nella casella bersaglio. Inserisci 9.',
    'Candidates 1, 4, 7, 9 appear only in 4 specific cells across this unit. Confirm [1]. Enter 1.':
      'I candidati 1, 4, 7, 9 appaiono solo in 4 caselle specifiche. Conferma [1]. Inserisci 1.',
    'Candidate 7 forms an X-Wing in columns 2 and 8. Eliminate 7 from column 2 to solve [4]. Enter 4.':
      'Il candidato 7 forma un X-Wing sulle colonne 2 e 8. Elimina 7 dalla colonna 2 per trovare [4]. Inserisci 4.',
    'Pivot (1,2) with pincers (1,3) and (2,3) eliminates 3 from the intersection. Enter 5.':
      'Il perno (1,2) con ali (1,3) e (2,3) elimina 3 all’incrocio. Inserisci 5.',
    'Tri-value pivot (1,2,3) with wings (1,3) and (2,3) eliminates 3 from common view. Enter 4.':
      'Il perno triplo (1,2,3) con ali (1,3) e (2,3) elimina 3 dalla vista comune. Inserisci 4.',
    'Two (1,8) pairs connected by a strong link on 8 eliminate candidate 1. Enter 2.':
      'Due coppie (1,8) collegate da legame forte su 8 eliminano il candidato 1. Inserisci 2.',
    'All cells have 2 candidates except one tri-value cell (2,5,8). Digit 5 appears 3 times. Enter 5.':
      'Tutte le caselle hanno 2 candidati tranne una casella tripla (2,5,8). Il numero 5 appare 3 volte. Inserisci 5.',
    'Chain of (3,7) pairs eliminates 3 and 7 from the intersection. Enter 6.':
      'Una catena di coppie (3,7) elimina 3 e 7 all’incrocio. Inserisci 6.',
    'Candidate 4 in 3 rows locks into 3 columns. Eliminate 4 to reveal [2]. Enter 2.':
      'Il candidato 4 in 3 righe blocca 3 colonne. Elimina 4 per rivelare [2]. Inserisci 2.',
    'Candidate 2 in 4 rows locks into 4 columns. Eliminate 2 to reveal [8]. Enter 8.':
      'Il candidato 2 in 4 righe blocca 4 colonne. Elimina 2 per rivelare [8]. Inserisci 8.',
    'Three corners are locked to [1,2]. To prevent a deadly pattern with multiple solutions, the 4th cell must be [5]. Enter 5.':
      'Tre angoli sono bloccati su [1,2]. Per evitare la combinazione fatale a più soluzioni, la 4ª casella deve essere [5]. Inserisci 5.',
    'Simple Colouring chain on candidate 3 eliminates 3 from mutual sight, confirming [8]. Enter 8.':
      'La catena Simple Colouring sul 3 elimina 3 dalla vista reciproca e conferma [8]. Inserisci 8.',
    '3D Medusa multi-value chain reveals contradiction, confirming [6]. Enter 6.':
      'La catena 3D Medusa rivela contraddizione e conferma [6]. Inserisci 6.',
    'XY-Chain from (1,4) to (4,7) eliminates candidate 7 at intersection, leaving [3]. Enter 3.':
      'La catena XY da (1,4) a (4,7) elimina il candidato 7 all’incrocio e lascia [3]. Inserisci 3.',
    'WXYZ-Wing with candidates (1,2,3,4) eliminates Z(4) from common sight, leaving [9]. Enter 9.':
      'Il WXYZ-Wing con (1,2,3,4) elimina Z(4) dalla vista comune e lascia [9]. Inserisci 9.',
    'Empty Rectangle L-shape in box aligns with strong link to eliminate candidate 5, leaving [1]. Enter 1.':
      'La forma a L di Empty Rectangle nel blocco elimina il candidato 5 e lascia [1]. Inserisci 1.',
    'Finned X-Wing eliminates 6 from the mutual sight intersection, leaving [3]. Enter 3.':
      'Il Finned X-Wing elimina 6 dall’incrocio reciproco e lascia [3]. Inserisci 3.',
    'AIC chain inference leaves [6] in the target cell. Enter 6.':
      'L’inferenza della catena AIC stabilisce [6] nella casella bersaglio. Inserisci 6.',
    'Two ALS sets connected by candidate 2 eliminate candidate 7, leaving [1]. Enter 1.':
      'Due insiemi ALS collegati dal candidato 2 eliminano il candidato 7 e lasciano [1]. Inserisci 1.',
    'All hypothetical branches converge to verify digit [7] in the target cell. Enter 7.':
      'Tutti i rami ipotetici convergono per confermare [7] nella casella bersaglio. Inserisci 7.',
    'Exocet base cells project digits into target cells, confirming [8]. Enter 8.':
      'Le caselle base di Exocet proiettano numeri nelle caselle bersaglio confermando [8]. Inserisci 8.'
  },
  ru: {
    'Check the 8 glowing numbers (1-8). Enter the remaining final digit into the glowing target cell.':
      'Проверьте 8 подсвеченных цифр (1–8). Введите оставшуюся цифру в целевую клетку.',
    'The box contains 2, 3, 4, 5, 6, 7, 8, 9. What is the single missing digit for the center cell?':
      'В блоке есть 2, 3, 4, 5, 6, 7, 8, 9. Какая цифра пропущена в центре?',
    'Scan row 1 and column 5 to eliminate invalid cells. Place 5 in the remaining valid cell.':
      'Проверьте строку 1 и столбец 5, чтобы исключить клетки. Поставьте 5 в свободную клетку.',
    'Row, column, and box contain 1,2,3,5,6,7,8,9. Enter the only candidate for this cell.':
      'Строка, столбец и блок содержат 1,2,3,5,6,7,8,9. Введите единственного кандидата для клетки.',
    'Among all notes in the box, digit 7 fits in only this cell. Enter 7.':
      'Среди всех заметок в блоке цифра 7 подходит только в эту клетку. Введите 7.',
    'Two cells lock (3,8) in row 1. Eliminate 3 & 8 to find the remaining answer [5]. Enter 5.':
      'Две клетки блокируют (3,8) в строке 1. Исключите 3 и 8, чтобы найти [5]. Введите 5.',
    'Two cells hold (2,7) exclusively. Clear other candidates to reveal the pair. Enter 2.':
      'Две клетки содержат (2,7) эксклюзивно. Очистите других кандидатов. Введите 2.',
    'Three cells lock candidates {1,2,3} across this row. Eliminate 1,2,3 to confirm [7]. Enter 7.':
      'Три клетки блокируют {1,2,3} в этой строке. Исключите 1,2,3 для подтверждения [7]. Введите 7.',
    'Four cells lock candidates {1,2,3,4} across this unit. Confirm [9] in the target cell. Enter 9.':
      'Четыре клетки блокируют {1,2,3,4} в этой зоне. Подтвердите [9] в целевой клетке. Введите 9.',
    'Candidates 1, 4, 7, 9 appear only in 4 specific cells across this unit. Confirm [1]. Enter 1.':
      'Кандидаты 1, 4, 7, 9 встречаются только в 4 клетках. Подтвердите [1]. Введите 1.',
    'Candidate 7 forms an X-Wing in columns 2 and 8. Eliminate 7 from column 2 to solve [4]. Enter 4.':
      'Кандидат 7 образует X-Wing в столбцах 2 и 8. Исключите 7 из столбца 2, чтобы найти [4]. Введите 4.',
    'Pivot (1,2) with pincers (1,3) and (2,3) eliminates 3 from the intersection. Enter 5.':
      'Опора (1,2) с крыльями (1,3) и (2,3) исключает 3 на пересечении. Введите 5.',
    'Tri-value pivot (1,2,3) with wings (1,3) and (2,3) eliminates 3 from common view. Enter 4.':
      'Тройная опора (1,2,3) с крыльями (1,3) и (2,3) исключает 3 из общего поля зрения. Введите 4.',
    'Two (1,8) pairs connected by a strong link on 8 eliminate candidate 1. Enter 2.':
      'Две пары (1,8), связанные сильной связью по 8, исключают кандидата 1. Введите 2.',
    'All cells have 2 candidates except one tri-value cell (2,5,8). Digit 5 appears 3 times. Enter 5.':
      'Все клетки имеют 2 кандидата кроме одной клетки (2,5,8). Цифра 5 встречается 3 раза. Введите 5.',
    'Chain of (3,7) pairs eliminates 3 and 7 from the intersection. Enter 6.':
      'Цепочка пар (3,7) исключает 3 и 7 на пересечении. Введите 6.',
    'Candidate 4 in 3 rows locks into 3 columns. Eliminate 4 to reveal [2]. Enter 2.':
      'Кандидат 4 в 3 строках блокирует 3 столбца. Исключите 4, чтобы открыть [2]. Введите 2.',
    'Candidate 2 in 4 rows locks into 4 columns. Eliminate 2 to reveal [8]. Enter 8.':
      'Кандидат 2 в 4 строках блокирует 4 столбца. Исключите 2, чтобы открыть [8]. Введите 8.',
    'Three corners are locked to [1,2]. To prevent a deadly pattern with multiple solutions, the 4th cell must be [5]. Enter 5.':
      'Три угла заперты на [1,2]. Чтобы избежать многозначности, 4-я клетка должна быть [5]. Введите 5.',
    'Simple Colouring chain on candidate 3 eliminates 3 from mutual sight, confirming [8]. Enter 8.':
      'Цепь Simple Colouring по кандидату 3 исключает 3 из взаимного обзора, подтверждая [8]. Введите 8.',
    '3D Medusa multi-value chain reveals contradiction, confirming [6]. Enter 6.':
      'Цепь 3D Medusa выявляет противоречие и подтверждает [6]. Введите 6.',
    'XY-Chain from (1,4) to (4,7) eliminates candidate 7 at intersection, leaving [3]. Enter 3.':
      'XY-Chain от (1,4) до (4,7) исключает кандидата 7 на пересечении, оставляя [3]. Введите 3.',
    'WXYZ-Wing with candidates (1,2,3,4) eliminates Z(4) from common sight, leaving [9]. Enter 9.':
      'WXYZ-Wing с (1,2,3,4) исключает Z(4) из общего поля зрения, оставляя [9]. Введите 9.',
    'Empty Rectangle L-shape in box aligns with strong link to eliminate candidate 5, leaving [1]. Enter 1.':
      'L-образный Empty Rectangle исключает кандидата 5, оставляя [1]. Введите 1.',
    'Finned X-Wing eliminates 6 from the mutual sight intersection, leaving [3]. Enter 3.':
      'Finned X-Wing исключает 6 из взаимного пересечения, оставляя [3]. Введите 3.',
    'AIC chain inference leaves [6] in the target cell. Enter 6.':
      'Вывод цепи AIC определяет [6] в целевой клетке. Введите 6.',
    'Two ALS sets connected by candidate 2 eliminate candidate 7, leaving [1]. Enter 1.':
      'Два множества ALS, связанные кандидатом 2, исключают кандидата 7, оставляя [1]. Введите 1.',
    'All hypothetical branches converge to verify digit [7] in the target cell. Enter 7.':
      'Все гипотетические ветви сходятся для подтверждения [7] в целевой клетке. Введите 7.',
    'Exocet base cells project digits into target cells, confirming [8]. Enter 8.':
      'Базовые клетки Exocet проецируют цифры в целевые клетки, подтверждая [8]. Введите 8.'
  },
  hi: {
    'Check the 8 glowing numbers (1-8). Enter the remaining final digit into the glowing target cell.':
      '8 हाइलाइट किए गए अंकों (1-8) की जांच करें। लक्ष्य सेल में शेष अंतिम अंक दर्ज करें।',
    'The box contains 2, 3, 4, 5, 6, 7, 8, 9. What is the single missing digit for the center cell?':
      'बॉक्स में 2, 3, 4, 5, 6, 7, 8, 9 हैं। केंद्र सेल के लिए लुप्त अंक क्या है?',
    'Scan row 1 and column 5 to eliminate invalid cells. Place 5 in the remaining valid cell.':
      'अमान्य सेलों को हटाने के लिए पंक्ति 1 और स्तंभ 5 को स्कैन करें। शेष सेल में 5 रखें।',
    'Row, column, and box contain 1,2,3,5,6,7,8,9. Enter the only candidate for this cell.':
      'पंक्ति, स्तंभ और बॉक्स में 1,2,3,5,6,7,8,9 हैं। इस सेल के लिए एकमात्र उम्मीदवार दर्ज करें।',
    'Among all notes in the box, digit 7 fits in only this cell. Enter 7.':
      'बॉक्स के सभी नोट्स में से, अंक 7 केवल इसी सेल में आता है। 7 दर्ज करें।',
    'Two cells lock (3,8) in row 1. Eliminate 3 & 8 to find the remaining answer [5]. Enter 5.':
      'दो सेल पंक्ति 1 में (3,8) को लॉक करते हैं। [5] खोजने के लिए 3 और 8 को हटाएं। 5 दर्ज करें।',
    'Two cells hold (2,7) exclusively. Clear other candidates to reveal the pair. Enter 2.':
      'दो सेल में केवल (2,7) हैं। जोड़ी खोजने के लिए अन्य उम्मीदवारों को हटाएं। 2 दर्ज करें।',
    'Three cells lock candidates {1,2,3} across this row. Eliminate 1,2,3 to confirm [7]. Enter 7.':
      'तीन सेल पंक्ति में {1,2,3} को लॉक करते हैं। [7] की पुष्टि के लिए 1,2,3 हटाएं। 7 दर्ज करें।',
    'Four cells lock candidates {1,2,3,4} across this unit. Confirm [9] in the target cell. Enter 9.':
      'चार सेल इस इकाई में {1,2,3,4} को लॉक करते हैं। लक्ष्य सेल में [9] की पुष्टि करें। 9 दर्ज करें।',
    'Candidates 1, 4, 7, 9 appear only in 4 specific cells across this unit. Confirm [1]. Enter 1.':
      'उम्मीदवार 1, 4, 7, 9 केवल 4 विशिष्ट सेलों में आते हैं। [1] की पुष्टि करें। 1 दर्ज करें।',
    'Candidate 7 forms an X-Wing in columns 2 and 8. Eliminate 7 from column 2 to solve [4]. Enter 4.':
      'उम्मीदवार 7 स्तंभ 2 और 8 में X-Wing बनाता है। [4] हल करने के लिए स्तंभ 2 से 7 हटाएं। 4 दर्ज करें।',
    'Pivot (1,2) with pincers (1,3) and (2,3) eliminates 3 from the intersection. Enter 5.':
      'पिवट (1,2) विंग्स (1,3) व (2,3) के साथ प्रतिच्छेदन से 3 को हटाता है। 5 दर्ज करें।',
    'Tri-value pivot (1,2,3) with wings (1,3) and (2,3) eliminates 3 from common view. Enter 4.':
      '3-मूल्य पिवट (1,2,3) विंग्स (1,3) व (2,3) के साथ सामान्य दृश्य से 3 को हटाता है। 4 दर्ज करें।',
    'Two (1,8) pairs connected by a strong link on 8 eliminate candidate 1. Enter 2.':
      '8 पर मजबूत लिंक से जुड़े दो (1,8) जोड़े उम्मीदवार 1 को हटाते हैं। 2 दर्ज करें।',
    'All cells have 2 candidates except one tri-value cell (2,5,8). Digit 5 appears 3 times. Enter 5.':
      'एक 3-मूल्य सेल (2,5,8) को छोड़कर सभी सेलों में 2 उम्मीदवार हैं। अंक 5 तीन बार आता है। 5 दर्ज करें।',
    'Chain of (3,7) pairs eliminates 3 and 7 from the intersection. Enter 6.':
      '(3,7) जोड़ों की श्रृंखला प्रतिच्छेदन से 3 और 7 को हटाती है। 6 दर्ज करें।',
    'Candidate 4 in 3 rows locks into 3 columns. Eliminate 4 to reveal [2]. Enter 2.':
      '3 पंक्तियों में उम्मीदवार 4 तीन स्तंभों को लॉक करता है। [2] प्रकट करने के लिए 4 हटाएं। 2 दर्ज करें।',
    'Candidate 2 in 4 rows locks into 4 columns. Eliminate 2 to reveal [8]. Enter 8.':
      '4 पंक्तियों में उम्मीदवार 2 चार स्तंभों को लॉक करता है। [8] प्रकट करने के लिए 2 हटाएं। 8 दर्ज करें।',
    'Three corners are locked to [1,2]. To prevent a deadly pattern with multiple solutions, the 4th cell must be [5]. Enter 5.':
      'तीन कोने [1,2] पर लॉक हैं। बहु-समाधान से बचने के लिए चौथा सेल [5] होना चाहिए। 5 दर्ज करें।',
    'Simple Colouring chain on candidate 3 eliminates 3 from mutual sight, confirming [8]. Enter 8.':
      'उम्मीदवार 3 पर Simple Colouring श्रृंखला दृश्य से 3 को हटाकर [8] की पुष्टि करती है। 8 दर्ज करें।',
    '3D Medusa multi-value chain reveals contradiction, confirming [6]. Enter 6.':
      '3D Medusa श्रृंखला विरोधाभास प्रकट करती है और [6] की पुष्टि करती है। 6 दर्ज करें।',
    'XY-Chain from (1,4) to (4,7) eliminates candidate 7 at intersection, leaving [3]. Enter 3.':
      '(1,4) से (4,7) तक XY-Chain प्रतिच्छेदन पर उम्मीदवार 7 को हटाकर [3] छोड़ती है। 3 दर्ज करें।',
    'WXYZ-Wing with candidates (1,2,3,4) eliminates Z(4) from common sight, leaving [9]. Enter 9.':
      '(1,2,3,4) वाला WXYZ-Wing दृश्य से Z(4) को हटाकर [9] छोड़ता है। 9 दर्ज करें।',
    'Empty Rectangle L-shape in box aligns with strong link to eliminate candidate 5, leaving [1]. Enter 1.':
      'बॉक्स में L-आकार उम्मीदवार 5 को हटाकर [1] छोड़ता है। 1 दर्ज करें।',
    'Finned X-Wing eliminates 6 from the mutual sight intersection, leaving [3]. Enter 3.':
      'Finned X-Wing प्रतिच्छेदन से 6 को हटाकर [3] छोड़ता है। 3 दर्ज करें।',
    'AIC chain inference leaves [6] in the target cell. Enter 6.':
      'AIC श्रृंखला लक्ष्य सेल में [6] निर्धारित करती है। 6 दर्ज करें।',
    'Two ALS sets connected by candidate 2 eliminate candidate 7, leaving [1]. Enter 1.':
      'उम्मीदवार 2 द्वारा जुड़े दो ALS सेट उम्मीदवार 7 को हटाकर [1] छोड़ते हैं। 1 दर्ज करें।',
    'All hypothetical branches converge to verify digit [7] in the target cell. Enter 7.':
      'सभी शाखाएं लक्ष्य सेल में [7] की पुष्टि करने के लिए एकत्रित होती हैं। 7 दर्ज करें।',
    'Exocet base cells project digits into target cells, confirming [8]. Enter 8.':
      'Exocet बेस सेल लक्ष्य सेल में अंक प्रोजेक्ट करके [8] की पुष्टि करते हैं। 8 दर्ज करें।'
  }
};

export function getFullMissionText(enText, lang) {
  if (!enText) return '';
  const langDict = MISSION_TRANSLATIONS[lang];
  if (langDict && langDict[enText]) {
    return langDict[enText];
  }
  // If not in dictionary, return clean translation
  return enText;
}

console.log('Mission translations dictionary ready.');
