import fs from 'fs';
import path from 'path';
import { GUIDES_MAP } from './translate_all_64_missions.mjs';

// French, Portuguese, Italian, Russian, Hindi mappings
const LANG_MAPS = {
  fr: (en) => {
    const deMatch = GUIDES_MAP.de.find(([re]) => re.test(en));
    if (!deMatch) return en;
    // Map from German/English to natural French
    return en
      .replace(/Check the (\d+) glowing numbers \(1-8\)\. Enter the remaining final digit into the glowing target cell\./i, 'Vérifiez les $1 chiffres en surbrillance (1-8). Entrez le chiffre manquant dans la case cible.')
      .replace(/The box contains 2, 3, 4, 5, 6, 7, 8, 9\. What is the single missing digit for the center cell\?/i, 'Le bloc contient 2, 3, 4, 5, 6, 7, 8, 9. Quel est le chiffre manquant au centre ?')
      .replace(/8 of 9 cells are filled in this column\. Enter the last remaining digit\./i, '8 cases sur 9 sont remplies dans cette colonne. Entrez le dernier chiffre.')
      .replace(/The box has 1,2,3,4,6,7,8,9 filled\. Place the missing \[5\] into the empty corner\./i, 'Le bloc contient 1,2,3,4,6,7,8,9. Placez le [5] manquant dans le coin vide.')
      .replace(/Cross-hatching from other boxes and existing givens \(1,2,3,8\) leave only one open cell in the top-right box\. Enter 5!/i, 'L’élimination croisée ne laisse qu’une seule case dans le bloc supérieur droit. Entrez 5 !')
      .replace(/Cross-hatching 7s and existing givens \(4,5,6,9\) reveal the only open cell in the top-right box\. Enter 7\./i, 'L’élimination des 7 révèle la seule case ouverte dans le bloc supérieur droit. Entrez 7.')
      .replace(/Neighbors show 1,2,4,5,6,7,8,9\. The only remaining candidate for this cell is 3\./i, 'Les voisins montrent 1,2,4,5,6,7,8,9. Le seul candidat restant est 3.')
      .replace(/Digits 1,2,3,4,5,7,8,9 are already present in shared units\. Enter 6\./i, 'Les chiffres 1,2,3,4,5,7,8,9 sont déjà présents. Entrez 6.')
      .replace(/1, 3, 4, 5, 6, 8 are filled in this box\. Among the 3 empty cells, candidate \[7\] is hidden exclusively in the center cell\. Enter 7!/i, '1, 3, 4, 5, 6, 8 sont remplis. Le candidat [7] se trouve au centre. Entrez 7 !')
      .replace(/1, 3, 5, 6, 8, 9 are filled in this row\. Candidate \[4\] is hidden exclusively in the 3rd cell\. Enter 4!/i, '1, 3, 5, 6, 8, 9 sont remplis sur la ligne. Le candidat [4] est dans la 3e case. Entrez 4 !')
      .replace(/Cells 1 & 3 lock candidates \[3, 8\]\. This eliminates 3 & 8 from Cell 2, leaving naked \[5\]\. Enter 5!/i, 'Les cases 1 et 3 verrouillent [3, 8]. Cela élimine 3 et 8 et laisse [5]. Entrez 5 !')
      .replace(/Two corner cells exclusively lock \[4, 7\]\. 4 & 7 are removed from the center cell, leaving \[9\]\. Enter 9\./i, 'Deux coins verrouillent [4, 7]. 4 et 7 sont retirés du centre, laissant [9]. Entrez 9.')
      .replace(/Candidates \[3, 8\] only appear in Cells 1 & 3 across this row\. Clean extra notes and enter 3 into Cell 1!/i, 'Les candidats [3, 8] n’apparaissent qu’en cases 1 et 3. Entrez 3 dans la case 1 !')
      .replace(/Candidates \[6, 9\] exist only in the top-left and bottom-right cells in this box\. Enter 6 into top-left!/i, 'Les candidats [6, 9] n’existent qu’en haut à gauche et bas à droite. Entrez 6 en haut à gauche !')
      .replace(/In the top box, 4 is locked in column 2\. This eliminates 4 from column 2 in the bottom box, revealing naked \[6\]\. Enter 6!/i, 'En haut, 4 est verrouillé en colonne 2. Cela élimine 4 en bas et révèle [6]. Entrez 6 !')
      .replace(/In the left box, 1,2,3,4,5,6,8 are filled so 7 is locked in row 1 \(pointing\)\. Across the blue divider, 7 is eliminated from the right box's first cell\. Enter \[9\]!/i, 'À gauche, 7 est verrouillé en ligne 1 (pointage). 7 est éliminé à droite et laisse [9]. Entrez 9 !')
      .replace(/Row 1 requires 8 inside Box 1\. Eliminating 8 elsewhere in the box leaves naked \[3\]\. Enter 3!/i, 'La ligne 1 requiert 8 dans le bloc 1. Éliminer 8 dans le bloc laisse [3]. Entrez 3 !')
      .replace(/Column 5 is claimed in this box, eliminating 5 elsewhere\. Enter the confirmed \[1\]\./i, 'La colonne 5 est revendiquée et élimine 5 ailleurs. Entrez le [1] confirmé.')
      .replace(/Three cells lock candidates \{1,2,3\}\. Eliminating them reveals naked \[7\]\. Enter 7!/i, 'Trois cases verrouillent {1,2,3}. Les éliminer révèle [7]. Entrez 7 !')
      .replace(/A \{4,5,6\} triple in the box leaves naked \[2\] in the center cell\. Enter 2\./i, 'Un triplet {4,5,6} laisse [2] au centre. Entrez 2.')
      .replace(/Candidates \{2,5,8\} appear only in cells 1, 2, 4\. Clean extra notes and enter 8 into the target cell!/i, 'Les candidats {2,5,8} n’apparaissent qu’en cases 1, 2, 4. Entrez 8 dans la cible !')
      .replace(/Candidates 3, 6, 9 are hidden in 3 cells\. Enter \[9\] into the top-right target cell\./i, 'Les candidats 3, 6, 9 sont cachés dans 3 cases. Entrez [9] en haut à droite.')
      .replace(/Four cells lock \{1,2,3,4\}\. Eliminating them reveals naked \[9\]\. Enter 9!/i, 'Quatre cases verrouillent {1,2,3,4}. Les éliminer révèle [9]. Entrez 9 !')
      .replace(/Four cells lock \{2,3,4,6\}\. Enter the confirmed \[5\] into the target cell\./i, 'Quatre cases verrouillent {2,3,4,6}. Entrez le [5] confirmé dans la cible.')
      .replace(/Candidates 1, 4, 7, 9 appear only in 4 specific cells\. Enter \[1\] into the first cell!/i, 'Les candidats 1, 4, 7, 9 apparaissent dans 4 cases. Entrez [1] dans la 1ère case !')
      .replace(/Candidates 2, 4, 6, 8 are hidden in 4 cells\. Enter \[4\] into the center cell\./i, 'Les candidats 2, 4, 6, 8 sont cachés dans 4 cases. Entrez [4] au centre.')
      .replace(/Candidate 7 forms a rectangle across 2 rows\. Eliminating 7 along the columns reveals naked \[4\]\. Enter 4!/i, 'Le candidat 7 forme un rectangle sur 2 lignes. Éliminer 7 sur les colonnes révèle [4]. Entrez 4 !')
      .replace(/Candidate 2 forms a vertical X-Wing, clearing candidate 2 to leave \[8\]\. Enter 8\./i, 'Le candidat 2 forme un X-Wing vertical et laisse [8]. Entrez 8.')
      .replace(/Pivot \[1,2\] with pincers \[1,3\] & \[2,3\] eliminates 3 at their intersection, revealing \[7\]\. Enter 7!/i, 'Le pivot [1,2] avec ailes [1,3] et [2,3] élimine 3 à l’intersection et révèle [7]. Entrez 7 !')
      .replace(/Y-Wing eliminates candidate 9, leaving naked \[2\]\. Enter 2\./i, 'Le Y-Wing élimine le candidat 9 et laisse [2]. Entrez 2.')
      .replace(/Pivot \[1,2,5\] and pincers \[1,5\], \[2,5\] eliminate 5 in the shared zone to reveal \[8\]\. Enter 8!/i, 'Le pivot [1,2,5] et les ailes éliminent 5 et révèlent [8]. Entrez 8 !')
      .replace(/XYZ-Wing eliminates 9 to reveal \[4\]\. Enter 4\./i, 'Le XYZ-Wing élimine 9 pour révéler [4]. Entrez 4.')
      .replace(/Two \[1,8\] cells linked by strong 8 eliminate candidate 1 at their mutual intersection, leaving \[5\]\. Enter 5!/i, 'Deux cases [1,8] liées par 8 éliminent 1 à l’intersection et laissent [5]. Entrez 5 !')
      .replace(/W-Wing eliminates 2 from the target cell, revealing \[9\]\. Enter 9\./i, 'Le W-Wing élimine 2 de la cible et révèle [9]. Entrez 9.')
      .replace(/All cells have 2 candidates except this unique 3-candidate cell \[2,5,8\]\. The odd-degree candidate \[5\] must be true\. Enter 5!/i, 'Toutes les cases ont 2 candidats sauf [2,5,8]. Le candidat [5] doit être vrai. Entrez 5 !')
      .replace(/To avoid the deadly pattern, the 3-candidate cell must be set to the 3-occurrence candidate \[7\]\. Enter 7\./i, 'Pour éviter le motif fatal, la case triple doit prendre le chiffre [7]. Entrez 7.')
      .replace(/Opposite-color ends of the \[2,9\] chain eliminate both 2 and 9 at the intersection, leaving \[6\]\. Enter 6!/i, 'Les bouts de la chaîne [2,9] éliminent 2 et 9 à l’intersection et laissent [6]. Entrez 6 !')
      .replace(/Remote pairs eliminate 3 and 7, revealing \[1\]\. Enter 1\./i, 'Les paires distantes éliminent 3 et 7 et révèlent [1]. Entrez 1.')
      .replace(/A 3x3 Swordfish locks candidate 6 across 3 rows and columns\. Eliminating 6 leaves \[5\]\. Enter 5!/i, 'Un Swordfish 3x3 verrouille 6 sur 3 lignes et colonnes. Éliminer 6 laisse [5]. Entrez 5 !')
      .replace(/Swordfish grid clears candidate 1 to leave \[9\]\. Enter 9\./i, 'Le Swordfish élimine le candidat 1 et laisse [9]. Entrez 9.')
      .replace(/A 4x4 Jellyfish locks candidate 5 across 4 rows and columns\. Eliminating 5 leaves \[7\]\. Enter 7!/i, 'Un Jellyfish 4x4 verrouille 5 sur 4 lignes et colonnes. Éliminer 5 laisse [7]. Entrez 7 !')
      .replace(/Jellyfish on candidate 8 leaves \[3\]\. Enter 3\./i, 'Le Jellyfish sur le 8 laisse [3]. Entrez 3.')
      .replace(/Three corners are locked to \[1,2\]\. To prevent a deadly pattern with multiple solutions, the 4th corner must be \[7\]\. Enter 7!/i, 'Trois coins sont verrouillés sur [1,2]. Pour éviter le motif fatal, le 4e coin doit être [7]. Entrez 7 !')
      .replace(/Avoid deadly pattern \[3,8\] by confirming the extra candidate \[5\]\. Enter 5\./i, 'Évitez le motif fatal [3,8] en confirmant le candidat extra [5]. Entrez 5.')
      .replace(/A cell seeing both Blue & Yellow 4-nodes eliminates candidate 4, leaving \[8\]\. Enter 8!/i, 'Une case voyant les deux couleurs élimine le candidat 4 et laisse [8]. Entrez 8 !')
      .replace(/Simple colouring clears conflicting 7, leaving \[2\]\. Enter 2\./i, 'La coloration simple élimine le 7 conflictuel et laisse [2]. Entrez 2.')
      .replace(/3D Medusa multi-digit colouring eliminates 6 at the intersection, revealing \[3\]\. Enter 3!/i, '3D Medusa élimine 6 à l’intersection et révèle [3]. Entrez 3 !')
      .replace(/Medusa chain clears candidate 1 to leave \[9\]\. Enter 9\./i, 'La chaîne Medusa élimine le candidat 1 et laisse [9]. Entrez 9.')
      .replace(/A 4-node XY-Chain eliminates candidate 1 at the mutual sight cell, leaving \[6\]\. Enter 6!/i, 'Une XY-Chain à 4 nœuds élimine le candidat 1 et laisse [6]. Entrez 6 !')
      .replace(/XY-Chain clears candidate 5 to reveal \[2\]\. Enter 2\./i, 'La XY-Chain élimine le candidat 5 et révèle [2]. Entrez 2.')
      .replace(/Pivot \[1,2,3,4\] and 3 pincers eliminate restricted candidate 4 to reveal \[9\]\. Enter 9!/i, 'Le pivot [1,2,3,4] et 3 ailes éliminent le candidat 4 et révèlent [9]. Entrez 9 !')
      .replace(/WXYZ-Wing eliminates 7 to reveal \[1\]\. Enter 1\./i, 'Le WXYZ-Wing élimine 7 et révèle [1]. Entrez 1.')
      .replace(/Box Empty Rectangle locks candidate 8 via a conjugate pair, eliminating 8 to reveal \[2\]\. Enter 2!/i, 'Empty Rectangle élimine 8 et révèle [2]. Entrez 2 !')
      .replace(/ER eliminates 3 to leave \[5\]\. Enter 5\./i, 'Empty Rectangle élimine 3 et laisse [5]. Entrez 5.')
      .replace(/Finned X-Wing eliminates 6 from the mutual sight intersection, leaving \[3\]\. Enter 3!/i, 'Finned X-Wing élimine 6 à l’intersection et laisse [3]. Entrez 3 !')
      .replace(/Finned X-Wing eliminates 8, revealing \[5\]\. Enter 5\./i, 'Finned X-Wing élimine 8 et révèle [5]. Entrez 5.')
      .replace(/Alternating strong and weak links eliminate candidate 1, revealing \[9\]\. Enter 9!/i, 'Les liens alternés éliminent le candidat 1 et révèlent [9]. Entrez 9 !')
      .replace(/AIC chain inference leaves \[6\] in the target cell\. Enter 6\./i, 'L’inférence de la chaîne AIC détermine [6] dans la cible. Entrez 6.')
      .replace(/Two ALS sets connected by candidate 2 eliminate candidate 7, leaving \[1\]\. Enter 1!/i, 'Deux ensembles ALS liés par 2 éliminent 7 et laissent [1]. Entrez 1 !')
      .replace(/ALS chain clears candidate 9 to leave \[8\]\. Enter 8\./i, 'La chaîne ALS élimine 9 et laisse [8]. Entrez 8.')
      .replace(/All hypothetical branches converge to verify digit \[7\] in the target cell\. Enter 7!/i, 'Toutes les branches hypothétiques confirment le chiffre [7] dans la cible. Entrez 7 !')
      .replace(/Forcing chain convergence reveals \[4\]\. Enter 4\./i, 'La convergence de Forcing Chain révèle [4]. Entrez 4.')
      .replace(/Exocet base cells lock the target companion cell to \[5\]\. Enter 5!/i, 'Les cases de base d’Exocet verrouillent la cible sur [5]. Entrez 5 !')
      .replace(/Exocet cross-line resolution reveals \[8\]\. Enter 8\./i, 'La résolution des lignes d’Exocet révèle [8]. Entrez 8.');
  },
  pt: (en) => {
    return en
      .replace(/Check the (\d+) glowing numbers \(1-8\)\. Enter the remaining final digit into the glowing target cell\./i, 'Verifique os $1 números destacados (1-8). Digite o dígito restante na casa destacada.')
      .replace(/The box contains 2, 3, 4, 5, 6, 7, 8, 9\. What is the single missing digit for the center cell\?/i, 'O bloco contém 2, 3, 4, 5, 6, 7, 8, 9. Qual número falta na casa central?')
      .replace(/8 of 9 cells are filled in this column\. Enter the last remaining digit\./i, '8 de 9 casas estão preenchidas nesta coluna. Digite o último dígito.')
      .replace(/The box has 1,2,3,4,6,7,8,9 filled\. Place the missing \[5\] into the empty corner\./i, 'O bloco tem 1,2,3,4,6,7,8,9. Coloque o [5] que falta no canto vazio.')
      .replace(/Cross-hatching from other boxes and existing givens \(1,2,3,8\) leave only one open cell in the top-right box\. Enter 5!/i, 'O cruzamento de linhas deixa apenas uma casa aberta no bloco superior direito. Digite 5!')
      .replace(/Cross-hatching 7s and existing givens \(4,5,6,9\) reveal the only open cell in the top-right box\. Enter 7\./i, 'O cruzamento dos 7s revela a única casa aberta no bloco superior direito. Digite 7.')
      .replace(/Neighbors show 1,2,4,5,6,7,8,9\. The only remaining candidate for this cell is 3\./i, 'Os vizinhos mostram 1,2,4,5,6,7,8,9. O único candidato restante é 3.')
      .replace(/Digits 1,2,3,4,5,7,8,9 are already present in shared units\. Enter 6\./i, 'Os dígitos 1,2,3,4,5,7,8,9 já estão presentes. Digite 6.')
      .replace(/1, 3, 4, 5, 6, 8 are filled in this box\. Among the 3 empty cells, candidate \[7\] is hidden exclusively in the center cell\. Enter 7!/i, '1, 3, 4, 5, 6, 8 estão preenchidos. O candidato [7] cabe apenas no centro. Digite 7!')
      .replace(/1, 3, 5, 6, 8, 9 are filled in this row\. Candidate \[4\] is hidden exclusively in the 3rd cell\. Enter 4!/i, '1, 3, 5, 6, 8, 9 estão preenchidos na linha. O candidato [4] está na 3ª casa. Digite 4!')
      .replace(/Cells 1 & 3 lock candidates \[3, 8\]\. This eliminates 3 & 8 from Cell 2, leaving naked \[5\]\. Enter 5!/i, 'As casas 1 e 3 bloqueiam [3, 8]. Isso elimina 3 e 8 e deixa [5]. Digite 5!')
      .replace(/Two corner cells exclusively lock \[4, 7\]\. 4 & 7 are removed from the center cell, leaving \[9\]\. Enter 9\./i, 'Dois cantos bloqueiam [4, 7]. 4 e 7 são removidos do centro, deixando [9]. Digite 9.')
      .replace(/Candidates \[3, 8\] only appear in Cells 1 & 3 across this row\. Clean extra notes and enter 3 into Cell 1!/i, 'Os candidatos [3, 8] aparecem apenas nas casas 1 e 3. Digite 3 na casa 1!')
      .replace(/Candidates \[6, 9\] exist only in the top-left and bottom-right cells in this box\. Enter 6 into top-left!/i, 'Os candidatos [6, 9] existem apenas nos cantos opostos. Digite 6 no canto superior esquerdo!')
      .replace(/In the top box, 4 is locked in column 2\. This eliminates 4 from column 2 in the bottom box, revealing naked \[6\]\. Enter 6!/i, 'No bloco superior, 4 está bloqueado na coluna 2. Isso elimina 4 abaixo e revela [6]. Digite 6!')
      .replace(/In the left box, 1,2,3,4,5,6,8 are filled so 7 is locked in row 1 \(pointing\)\. Across the blue divider, 7 is eliminated from the right box's first cell\. Enter \[9\]!/i, 'No bloco esquerdo, 7 bloqueia a linha 1 (apontador). 7 é eliminado à direita e deixa [9]. Digite 9!')
      .replace(/Row 1 requires 8 inside Box 1\. Eliminating 8 elsewhere in the box leaves naked \[3\]\. Enter 3!/i, 'A linha 1 requer 8 no bloco 1. Eliminar 8 no bloco deixa [3]. Digite 3!')
      .replace(/Column 5 is claimed in this box, eliminating 5 elsewhere\. Enter the confirmed \[1\]\./i, 'A coluna 5 é reivindicada no bloco e elimina 5 das outras casas. Digite [1].')
      .replace(/Three cells lock candidates \{1,2,3\}\. Eliminating them reveals naked \[7\]\. Enter 7!/i, 'Três casas bloqueiam {1,2,3}. Eliminá-las revela [7]. Digite 7!')
      .replace(/A \{4,5,6\} triple in the box leaves naked \[2\] in the center cell\. Enter 2\./i, 'Uma trinca {4,5,6} no bloco deixa [2] no centro. Digite 2.')
      .replace(/Candidates \{2,5,8\} appear only in cells 1, 2, 4\. Clean extra notes and enter 8 into the target cell!/i, 'Os candidatos {2,5,8} aparecem apenas nas casas 1, 2, 4. Digite 8 no alvo!')
      .replace(/Candidates 3, 6, 9 are hidden in 3 cells\. Enter \[9\] into the top-right target cell\./i, 'Os candidatos 3, 6, 9 estão em 3 casas. Digite [9] no canto superior direito.')
      .replace(/Four cells lock \{1,2,3,4\}\. Eliminating them reveals naked \[9\]\. Enter 9!/i, 'Quatro casas bloqueiam {1,2,3,4}. Eliminá-las revela [9]. Digite 9!')
      .replace(/Four cells lock \{2,3,4,6\}\. Enter the confirmed \[5\] into the target cell\./i, 'Quatro casas bloqueiam {2,3,4,6}. Digite o [5] confirmado na casa alvo.')
      .replace(/Candidates 1, 4, 7, 9 appear only in 4 specific cells\. Enter \[1\] into the first cell!/i, 'Os candidatos 1, 4, 7, 9 aparecem em 4 casas. Digite [1] na primeira casa!')
      .replace(/Candidates 2, 4, 6, 8 are hidden in 4 cells\. Enter \[4\] into the center cell\./i, 'Os candidatos 2, 4, 6, 8 estão em 4 casas. Digite [4] no centro.')
      .replace(/Candidate 7 forms a rectangle across 2 rows\. Eliminating 7 along the columns reveals naked \[4\]\. Enter 4!/i, 'O candidato 7 forma um retângulo em 2 linhas. Eliminar 7 nas colunas revela [4]. Digite 4!')
      .replace(/Candidate 2 forms a vertical X-Wing, clearing candidate 2 to leave \[8\]\. Enter 8\./i, 'O candidato 2 forma um X-Wing vertical e deixa [8]. Digite 8.')
      .replace(/Pivot \[1,2\] with pincers \[1,3\] & \[2,3\] eliminates 3 at their intersection, revealing \[7\]\. Enter 7!/i, 'O pivô [1,2] com asas [1,3] e [2,3] elimina 3 na interseção e revela [7]. Digite 7!')
      .replace(/Y-Wing eliminates candidate 9, leaving naked \[2\]\. Enter 2\./i, 'O Y-Wing elimina o candidato 9 e deixa [2]. Digite 2.')
      .replace(/Pivot \[1,2,5\] and pincers \[1,5\], \[2,5\] eliminate 5 in the shared zone to reveal \[8\]\. Enter 8!/i, 'O pivô [1,2,5] e as asas eliminam 5 e revelam [8]. Digite 8!')
      .replace(/XYZ-Wing eliminates 9 to reveal \[4\]\. Enter 4\./i, 'O XYZ-Wing elimina 9 para revelar [4]. Digite 4.')
      .replace(/Two \[1,8\] cells linked by strong 8 eliminate candidate 1 at their mutual intersection, leaving \[5\]\. Enter 5!/i, 'Duas casas [1,8] ligadas por 8 eliminam 1 na interseção e deixam [5]. Digite 5!')
      .replace(/W-Wing eliminates 2 from the target cell, revealing \[9\]\. Enter 9\./i, 'O W-Wing elimina 2 do alvo e revela [9]. Digite 9.')
      .replace(/All cells have 2 candidates except this unique 3-candidate cell \[2,5,8\]\. The odd-degree candidate \[5\] must be true\. Enter 5!/i, 'Todas as casas têm 2 candidatos exceto [2,5,8]. O candidato [5] deve ser verdadeiro. Digite 5!')
      .replace(/To avoid the deadly pattern, the 3-candidate cell must be set to the 3-occurrence candidate \[7\]\. Enter 7\./i, 'Para evitar o padrão mortal, a casa tripla deve receber o dígito [7]. Digite 7.')
      .replace(/Opposite-color ends of the \[2,9\] chain eliminate both 2 and 9 at the intersection, leaving \[6\]\. Enter 6!/i, 'As pontas da cadeia [2,9] eliminam 2 e 9 na interseção e deixam [6]. Digite 6!')
      .replace(/Remote pairs eliminate 3 and 7, revealing \[1\]\. Enter 1\./i, 'Pares remotos eliminam 3 e 7 e revelam [1]. Digite 1.')
      .replace(/A 3x3 Swordfish locks candidate 6 across 3 rows and columns\. Eliminating 6 leaves \[5\]\. Enter 5!/i, 'Um Swordfish 3x3 bloqueia 6 em 3 linhas e colunas. Eliminar 6 deixa [5]. Digite 5!')
      .replace(/Swordfish grid clears candidate 1 to leave \[9\]\. Enter 9\./i, 'O Swordfish elimina o candidato 1 e deixa [9]. Digite 9.')
      .replace(/A 4x4 Jellyfish locks candidate 5 across 4 rows and columns\. Eliminating 5 leaves \[7\]\. Enter 7!/i, 'Um Jellyfish 4x4 bloqueia 5 em 4 linhas e colunas. Eliminar 5 deixa [7]. Digite 7!')
      .replace(/Jellyfish on candidate 8 leaves \[3\]\. Enter 3\./i, 'O Jellyfish no 8 deixa [3]. Digite 3.')
      .replace(/Three corners are locked to \[1,2\]\. To prevent a deadly pattern with multiple solutions, the 4th corner must be \[7\]\. Enter 7!/i, 'Três cantos estão bloqueados em [1,2]. Para evitar padrão mortal, o 4º canto deve ser [7]. Digite 7!')
      .replace(/Avoid deadly pattern \[3,8\] by confirming the extra candidate \[5\]\. Enter 5\./i, 'Evite o padrão mortal [3,8] confirmando o candidato extra [5]. Digite 5.')
      .replace(/A cell seeing both Blue & Yellow 4-nodes eliminates candidate 4, leaving \[8\]\. Enter 8!/i, 'Uma casa que vê ambas as cores elimina o candidato 4 e deixa [8]. Digite 8!')
      .replace(/Simple colouring clears conflicting 7, leaving \[2\]\. Enter 2\./i, 'A coloração simples elimina o 7 conflitante e deixa [2]. Digite 2.')
      .replace(/3D Medusa multi-digit colouring eliminates 6 at the intersection, revealing \[3\]\. Enter 3!/i, '3D Medusa elimina 6 na interseção e revela [3]. Digite 3!')
      .replace(/Medusa chain clears candidate 1 to leave \[9\]\. Enter 9\./i, 'A cadeia Medusa elimina o candidato 1 e deixa [9]. Digite 9.')
      .replace(/A 4-node XY-Chain eliminates candidate 1 at the mutual sight cell, leaving \[6\]\. Enter 6!/i, 'Uma XY-Chain de 4 nós elimina o candidato 1 e deixa [6]. Digite 6!')
      .replace(/XY-Chain clears candidate 5 to reveal \[2\]\. Enter 2\./i, 'A XY-Chain elimina o candidato 5 e revela [2]. Digite 2.')
      .replace(/Pivot \[1,2,3,4\] and 3 pincers eliminate restricted candidate 4 to reveal \[9\]\. Enter 9!/i, 'O pivô [1,2,3,4] e 3 asas eliminam o candidato 4 e revelam [9]. Digite 9!')
      .replace(/WXYZ-Wing eliminates 7 to reveal \[1\]\. Enter 1\./i, 'O WXYZ-Wing elimina 7 e revela [1]. Digite 1.')
      .replace(/Box Empty Rectangle locks candidate 8 via a conjugate pair, eliminating 8 to reveal \[2\]\. Enter 2!/i, 'Empty Rectangle elimina 8 e revela [2]. Digite 2!')
      .replace(/ER eliminates 3 to leave \[5\]\. Enter 5\./i, 'Empty Rectangle elimina 3 e deixa [5]. Digite 5.')
      .replace(/Finned X-Wing eliminates 6 from the mutual sight intersection, leaving \[3\]\. Enter 3!/i, 'Finned X-Wing elimina 6 na interseção e deixa [3]. Digite 3!')
      .replace(/Finned X-Wing eliminates 8, revealing \[5\]\. Enter 5\./i, 'Finned X-Wing elimina 8 e revela [5]. Digite 5.')
      .replace(/Alternating strong and weak links eliminate candidate 1, revealing \[9\]\. Enter 9!/i, 'Ligações alternadas eliminam o candidato 1 e revelam [9]. Digite 9!')
      .replace(/AIC chain inference leaves \[6\] in the target cell\. Enter 6\./i, 'A inferência da cadeia AIC determina [6] no alvo. Digite 6.')
      .replace(/Two ALS sets connected by candidate 2 eliminate candidate 7, leaving \[1\]\. Enter 1!/i, 'Dois conjuntos ALS ligados por 2 eliminam 7 e deixam [1]. Digite 1!')
      .replace(/ALS chain clears candidate 9 to leave \[8\]\. Enter 8\./i, 'A cadeia ALS elimina 9 e deixa [8]. Digite 8.')
      .replace(/All hypothetical branches converge to verify digit \[7\] in the target cell\. Enter 7!/i, 'Todos os ramos hipotéticos convergem para confirmar [7] no alvo. Digite 7!')
      .replace(/Forcing chain convergence reveals \[4\]\. Enter 4\./i, 'A convergência de Forcing Chain revela [4]. Digite 4.')
      .replace(/Exocet base cells lock the target companion cell to \[5\]\. Enter 5!/i, 'As casas base de Exocet bloqueiam o alvo em [5]. Digite 5!')
      .replace(/Exocet cross-line resolution reveals \[8\]\. Enter 8\./i, 'A resolução de linhas cruzadas de Exocet revela [8]. Digite 8.');
  },
  it: (en) => {
    return en
      .replace(/Check the (\d+) glowing numbers \(1-8\)\. Enter the remaining final digit into the glowing target cell\./i, 'Controlla gli $1 numeri evidenziati (1-8). Inserisci il numero mancante nella casella bersaglio.')
      .replace(/The box contains 2, 3, 4, 5, 6, 7, 8, 9\. What is the single missing digit for the center cell\?/i, 'Il blocco contiene 2, 3, 4, 5, 6, 7, 8, 9. Quale numero manca al centro?')
      .replace(/8 of 9 cells are filled in this column\. Enter the last remaining digit\./i, '8 caselle su 9 sono piene in questa colonna. Inserisci l’ultimo numero.')
      .replace(/The box has 1,2,3,4,6,7,8,9 filled\. Place the missing \[5\] into the empty corner\./i, 'Il blocco contiene 1,2,3,4,6,7,8,9. Posiziona il [5] mancante nell’angolo vuoto.')
      .replace(/Cross-hatching from other boxes and existing givens \(1,2,3,8\) leave only one open cell in the top-right box\. Enter 5!/i, 'L’eliminazione incrociata lascia solo una casella nel blocco in alto a destra. Inserisci 5!')
      .replace(/Cross-hatching 7s and existing givens \(4,5,6,9\) reveal the only open cell in the top-right box\. Enter 7\./i, 'L’eliminazione dei 7 rivela l’unica casella aperta in alto a destra. Inserisci 7.')
      .replace(/Neighbors show 1,2,4,5,6,7,8,9\. The only remaining candidate for this cell is 3\./i, 'I vicini mostrano 1,2,4,5,6,7,8,9. L’unico candidato rimasto è 3.')
      .replace(/Digits 1,2,3,4,5,7,8,9 are already present in shared units\. Enter 6\./i, 'I numeri 1,2,3,4,5,7,8,9 sono già presenti. Inserisci 6.')
      .replace(/1, 3, 4, 5, 6, 8 are filled in this box\. Among the 3 empty cells, candidate \[7\] is hidden exclusively in the center cell\. Enter 7!/i, '1, 3, 4, 5, 6, 8 sono pieni. Il candidato [7] è solo al centro. Inserisci 7!')
      .replace(/1, 3, 5, 6, 8, 9 are filled in this row\. Candidate \[4\] is hidden exclusively in the 3rd cell\. Enter 4!/i, '1, 3, 5, 6, 8, 9 sono pieni nella riga. Il candidato [4] è nella 3ª casella. Inserisci 4!')
      .replace(/Cells 1 & 3 lock candidates \[3, 8\]\. This eliminates 3 & 8 from Cell 2, leaving naked \[5\]\. Enter 5!/i, 'Le caselle 1 e 3 bloccano [3, 8]. Questo elimina 3 e 8 e lascia [5]. Inserisci 5!')
      .replace(/Two corner cells exclusively lock \[4, 7\]\. 4 & 7 are removed from the center cell, leaving \[9\]\. Enter 9\./i, 'Due angoli bloccano [4, 7]. 4 e 7 vengono rimossi dal centro, lasciando [9]. Inserisci 9.')
      .replace(/Candidates \[3, 8\] only appear in Cells 1 & 3 across this row\. Clean extra notes and enter 3 into Cell 1!/i, 'I candidati [3, 8] appaiono solo nelle caselle 1 e 3. Inserisci 3 nella casella 1!')
      .replace(/Candidates \[6, 9\] exist only in the top-left and bottom-right cells in this box\. Enter 6 into top-left!/i, 'I candidati [6, 9] esistono solo negli angoli opposti. Inserisci 6 in alto a sinistra!')
      .replace(/In the top box, 4 is locked in column 2\. This eliminates 4 from column 2 in the bottom box, revealing naked \[6\]\. Enter 6!/i, 'In alto, 4 è bloccato in colonna 2. Questo elimina 4 in basso e rivela [6]. Inserisci 6!')
      .replace(/In the left box, 1,2,3,4,5,6,8 are filled so 7 is locked in row 1 \(pointing\)\. Across the blue divider, 7 is eliminated from the right box's first cell\. Enter \[9\]!/i, 'A sinistra, 7 blocca la riga 1 (puntatore). 7 viene eliminato a destra e lascia [9]. Inserisci 9!')
      .replace(/Row 1 requires 8 inside Box 1\. Eliminating 8 elsewhere in the box leaves naked \[3\]\. Enter 3!/i, 'La riga 1 richiede 8 nel blocco 1. Eliminare 8 nel blocco lascia [3]. Inserisci 3!')
      .replace(/Column 5 is claimed in this box, eliminating 5 elsewhere\. Enter the confirmed \[1\]\./i, 'La colonna 5 è rivendicata nel blocco ed elimina 5 altrove. Inserisci [1].')
      .replace(/Three cells lock candidates \{1,2,3\}\. Eliminating them reveals naked \[7\]\. Enter 7!/i, 'Tre caselle bloccano {1,2,3}. Eliminarli rivela [7]. Inserisci 7!')
      .replace(/A \{4,5,6\} triple in the box leaves naked \[2\] in the center cell\. Enter 2\./i, 'Una terna {4,5,6} nel blocco lascia [2] al centro. Inserisci 2.')
      .replace(/Candidates \{2,5,8\} appear only in cells 1, 2, 4\. Clean extra notes and enter 8 into the target cell!/i, 'I candidati {2,5,8} appaiono solo nelle caselle 1, 2, 4. Inserisci 8 nel bersaglio!')
      .replace(/Candidates 3, 6, 9 are hidden in 3 cells\. Enter \[9\] into the top-right target cell\./i, 'I candidati 3, 6, 9 sono nascosti in 3 caselle. Inserisci [9] in alto a destra.')
      .replace(/Four cells lock \{1,2,3,4\}\. Eliminating them reveals naked \[9\]\. Enter 9!/i, 'Quattro caselle bloccano {1,2,3,4}. Eliminarli rivela [9]. Inserisci 9!')
      .replace(/Four cells lock \{2,3,4,6\}\. Enter the confirmed \[5\] into the target cell\./i, 'Quattro caselle bloccano {2,3,4,6}. Inserisci il [5] confermato nella casella bersaglio.')
      .replace(/Candidates 1, 4, 7, 9 appear only in 4 specific cells\. Enter \[1\] into the first cell!/i, 'I candidati 1, 4, 7, 9 appaiono in 4 caselle. Inserisci [1] nella 1ª casella!')
      .replace(/Candidates 2, 4, 6, 8 are hidden in 4 cells\. Enter \[4\] into the center cell\./i, 'I candidati 2, 4, 6, 8 sono in 4 caselle. Inserisci [4] al centro.')
      .replace(/Candidate 7 forms a rectangle across 2 rows\. Eliminating 7 along the columns reveals naked \[4\]\. Enter 4!/i, 'Il candidato 7 forma un rettangolo su 2 righe. Eliminare 7 sulle colonne rivela [4]. Inserisci 4!')
      .replace(/Candidate 2 forms a vertical X-Wing, clearing candidate 2 to leave \[8\]\. Enter 8\./i, 'Il candidato 2 forma un X-Wing verticale e lascia [8]. Inserisci 8.')
      .replace(/Pivot \[1,2\] with pincers \[1,3\] & \[2,3\] eliminates 3 at their intersection, revealing \[7\]\. Enter 7!/i, 'Il perno [1,2] con ali [1,3] e [2,3] elimina 3 all’incrocio e rivela [7]. Inserisci 7!')
      .replace(/Y-Wing eliminates candidate 9, leaving naked \[2\]\. Enter 2\./i, 'Il Y-Wing elimina il candidato 9 e lascia [2]. Inserisci 2.')
      .replace(/Pivot \[1,2,5\] and pincers \[1,5\], \[2,5\] eliminate 5 in the shared zone to reveal \[8\]\. Enter 8!/i, 'Il perno [1,2,5] e le ali eliminano 5 e rivelano [8]. Inserisci 8!')
      .replace(/XYZ-Wing eliminates 9 to reveal \[4\]\. Enter 4\./i, 'Il XYZ-Wing elimina 9 per rivelare [4]. Inserisci 4.')
      .replace(/Two \[1,8\] cells linked by strong 8 eliminate candidate 1 at their mutual intersection, leaving \[5\]\. Enter 5!/i, 'Due caselle [1,8] collegate da 8 eliminano 1 all’incrocio e lasciano [5]. Inserisci 5!')
      .replace(/W-Wing eliminates 2 from the target cell, revealing \[9\]\. Enter 9\./i, 'Il W-Wing elimina 2 dal bersaglio e rivela [9]. Inserisci 9.')
      .replace(/All cells have 2 candidates except this unique 3-candidate cell \[2,5,8\]\. The odd-degree candidate \[5\] must be true\. Enter 5!/i, 'Tutte le caselle hanno 2 candidati tranne [2,5,8]. Il candidato [5] deve essere vero. Inserisci 5!')
      .replace(/To avoid the deadly pattern, the 3-candidate cell must be set to the 3-occurrence candidate \[7\]\. Enter 7\./i, 'Per evitare la combinazione fatale, la casella tripla deve contenere il [7]. Inserisci 7.')
      .replace(/Opposite-color ends of the \[2,9\] chain eliminate both 2 and 9 at the intersection, leaving \[6\]\. Enter 6!/i, 'I capi della catena [2,9] eliminano 2 e 9 all’incrocio e lasciano [6]. Inserisci 6!')
      .replace(/Remote pairs eliminate 3 and 7, revealing \[1\]\. Enter 1\./i, 'Le coppie remote eliminano 3 e 7 e rivelano [1]. Inserisci 1.')
      .replace(/A 3x3 Swordfish locks candidate 6 across 3 rows and columns\. Eliminating 6 leaves \[5\]\. Enter 5!/i, 'Un Swordfish 3x3 blocca 6 su 3 righe e colonne. Eliminare 6 lascia [5]. Inserisci 5!')
      .replace(/Swordfish grid clears candidate 1 to leave \[9\]\. Enter 9\./i, 'Lo Swordfish elimina il candidato 1 e lascia [9]. Inserisci 9.')
      .replace(/A 4x4 Jellyfish locks candidate 5 across 4 rows and columns\. Eliminating 5 leaves \[7\]\. Enter 7!/i, 'Un Jellyfish 4x4 blocca 5 su 4 righe e colonne. Eliminare 5 lascia [7]. Inserisci 7!')
      .replace(/Jellyfish on candidate 8 leaves \[3\]\. Enter 3\./i, 'Il Jellyfish su 8 lascia [3]. Inserisci 3.')
      .replace(/Three corners are locked to \[1,2\]\. To prevent a deadly pattern with multiple solutions, the 4th corner must be \[7\]\. Enter 7!/i, 'Tre angoli sono bloccati su [1,2]. Per evitare combinazioni fatali, il 4º angolo deve essere [7]. Inserisci 7!')
      .replace(/Avoid deadly pattern \[3,8\] by confirming the extra candidate \[5\]\. Enter 5\./i, 'Evita la combinazione fatale [3,8] confermando il candidato extra [5]. Inserisci 5.')
      .replace(/A cell seeing both Blue & Yellow 4-nodes eliminates candidate 4, leaving \[8\]\. Enter 8!/i, 'Una casella che vede entrambi i colori elimina il candidato 4 e lascia [8]. Inserisci 8!')
      .replace(/Simple colouring clears conflicting 7, leaving \[2\]\. Enter 2\./i, 'La colorazione semplice elimina il 7 in conflitto e lascia [2]. Inserisci 2.')
      .replace(/3D Medusa multi-digit colouring eliminates 6 at the intersection, revealing \[3\]\. Enter 3!/i, '3D Medusa elimina 6 all’incrocio e rivela [3]. Inserisci 3!')
      .replace(/Medusa chain clears candidate 1 to leave \[9\]\. Enter 9\./i, 'La catena Medusa elimina il candidato 1 e lascia [9]. Inserisci 9.')
      .replace(/A 4-node XY-Chain eliminates candidate 1 at the mutual sight cell, leaving \[6\]\. Enter 6!/i, 'Una XY-Chain a 4 nodi elimina il candidato 1 e lascia [6]. Inserisci 6!')
      .replace(/XY-Chain clears candidate 5 to reveal \[2\]\. Enter 2\./i, 'La XY-Chain elimina il candidato 5 e rivela [2]. Inserisci 2.')
      .replace(/Pivot \[1,2,3,4\] and 3 pincers eliminate restricted candidate 4 to reveal \[9\]\. Enter 9!/i, 'Il perno [1,2,3,4] e 3 ali eliminano il candidato 4 e rivelano [9]. Inserisci 9!')
      .replace(/WXYZ-Wing eliminates 7 to reveal \[1\]\. Enter 1\./i, 'Il WXYZ-Wing elimina 7 e rivela [1]. Inserisci 1.')
      .replace(/Box Empty Rectangle locks candidate 8 via a conjugate pair, eliminating 8 to reveal \[2\]\. Enter 2!/i, 'Empty Rectangle elimina 8 e rivela [2]. Inserisci 2!')
      .replace(/ER eliminates 3 to leave \[5\]\. Enter 5\./i, 'Empty Rectangle elimina 3 e lascia [5]. Inserisci 5.')
      .replace(/Finned X-Wing eliminates 6 from the mutual sight intersection, leaving \[3\]\. Enter 3!/i, 'Finned X-Wing elimina 6 all’incrocio e lascia [3]. Inserisci 3!')
      .replace(/Finned X-Wing eliminates 8, revealing \[5\]\. Enter 5\./i, 'Finned X-Wing elimina 8 e rivela [5]. Inserisci 5.')
      .replace(/Alternating strong and weak links eliminate candidate 1, revealing \[9\]\. Enter 9!/i, 'I legami alternati eliminano il candidato 1 e rivelano [9]. Inserisci 9!')
      .replace(/AIC chain inference leaves \[6\] in the target cell\. Enter 6\./i, 'L’inferenza della catena AIC stabilisce [6] nel bersaglio. Inserisci 6.')
      .replace(/Two ALS sets connected by candidate 2 eliminate candidate 7, leaving \[1\]\. Enter 1!/i, 'Due insiemi ALS collegati da 2 eliminano 7 e lasciano [1]. Inserisci 1!')
      .replace(/ALS chain clears candidate 9 to leave \[8\]\. Enter 8\./i, 'La catena ALS elimina 9 e lascia [8]. Inserisci 8.')
      .replace(/All hypothetical branches converge to verify digit \[7\] in the target cell\. Enter 7!/i, 'Tutti i rami ipotetici confermano il numero [7] nel bersaglio. Inserisci 7!')
      .replace(/Forcing chain convergence reveals \[4\]\. Enter 4\./i, 'La convergenza di Forcing Chain rivela [4]. Inserisci 4.')
      .replace(/Exocet base cells lock the target companion cell to \[5\]\. Enter 5!/i, 'Le caselle base di Exocet bloccano il bersaglio su [5]. Inserisci 5!')
      .replace(/Exocet cross-line resolution reveals \[8\]\. Enter 8\./i, 'La risoluzione delle linee di Exocet rivela [8]. Inserisci 8.');
  },
  ru: (en) => {
    return en
      .replace(/Check the (\d+) glowing numbers \(1-8\)\. Enter the remaining final digit into the glowing target cell\./i, 'Проверьте $1 подсвеченных цифр (1–8). Введите оставшуюся цифру в целевую клетку.')
      .replace(/The box contains 2, 3, 4, 5, 6, 7, 8, 9\. What is the single missing digit for the center cell\?/i, 'В блоке есть 2, 3, 4, 5, 6, 7, 8, 9. Какая цифра пропущена в центре?')
      .replace(/8 of 9 cells are filled in this column\. Enter the last remaining digit\./i, '8 из 9 клеток заполнены в столбце. Введите последнюю цифру.')
      .replace(/The box has 1,2,3,4,6,7,8,9 filled\. Place the missing \[5\] into the empty corner\./i, 'В блоке есть 1,2,3,4,6,7,8,9. Поставьте [5] в пустой угол.')
      .replace(/Cross-hatching from other boxes and existing givens \(1,2,3,8\) leave only one open cell in the top-right box\. Enter 5!/i, 'Кросс-хэтчинг оставляет одну свободную клетку в верхнем правом блоке. Введите 5!')
      .replace(/Cross-hatching 7s and existing givens \(4,5,6,9\) reveal the only open cell in the top-right box\. Enter 7\./i, 'Кросс-хэтчинг 7 раскрывает единственную свободную клетку в верхнем правом блоке. Введите 7.')
      .replace(/Neighbors show 1,2,4,5,6,7,8,9\. The only remaining candidate for this cell is 3\./i, 'Соседи показывают 1,2,4,5,6,7,8,9. Единственный кандидат для клетки — 3.')
      .replace(/Digits 1,2,3,4,5,7,8,9 are already present in shared units\. Enter 6\./i, 'Цифры 1,2,3,4,5,7,8,9 уже присутствуют. Введите 6.')
      .replace(/1, 3, 4, 5, 6, 8 are filled in this box\. Among the 3 empty cells, candidate \[7\] is hidden exclusively in the center cell\. Enter 7!/i, '1, 3, 4, 5, 6, 8 заполнены. Кандидат [7] скрыт в центре. Введите 7!')
      .replace(/1, 3, 5, 6, 8, 9 are filled in this row\. Candidate \[4\] is hidden exclusively in the 3rd cell\. Enter 4!/i, '1, 3, 5, 6, 8, 9 заполнены в строке. Кандидат [4] в 3-й клетке. Введите 4!')
      .replace(/Cells 1 & 3 lock candidates \[3, 8\]\. This eliminates 3 & 8 from Cell 2, leaving naked \[5\]\. Enter 5!/i, 'Клетки 1 и 3 блокируют [3, 8]. Это исключает 3 и 8 и оставляет [5]. Введите 5!')
      .replace(/Two corner cells exclusively lock \[4, 7\]\. 4 & 7 are removed from the center cell, leaving \[9\]\. Enter 9\./i, 'Два угла блокируют [4, 7]. 4 и 7 удаляются из центра, оставляя [9]. Введите 9.')
      .replace(/Candidates \[3, 8\] only appear in Cells 1 & 3 across this row\. Clean extra notes and enter 3 into Cell 1!/i, 'Кандидаты [3, 8] только в клетках 1 и 3. Введите 3 в клетку 1!')
      .replace(/Candidates \[6, 9\] exist only in the top-left and bottom-right cells in this box\. Enter 6 into top-left!/i, 'Кандидаты [6, 9] только в противоположных углах. Введите 6 в левый верхний угол!')
      .replace(/In the top box, 4 is locked in column 2\. This eliminates 4 from column 2 in the bottom box, revealing naked \[6\]\. Enter 6!/i, 'Вверху 4 заперта в столбце 2. Это исключает 4 внизу и открывает [6]. Введите 6!')
      .replace(/In the left box, 1,2,3,4,5,6,8 are filled so 7 is locked in row 1 \(pointing\)\. Across the blue divider, 7 is eliminated from the right box's first cell\. Enter \[9\]!/i, 'Слева 7 заперта в строке 1. 7 исключается справа и оставляет [9]. Введите 9!')
      .replace(/Row 1 requires 8 inside Box 1\. Eliminating 8 elsewhere in the box leaves naked \[3\]\. Enter 3!/i, 'Строка 1 требует 8 в блоке 1. Исключение 8 оставляет [3]. Введите 3!')
      .replace(/Column 5 is claimed in this box, eliminating 5 elsewhere\. Enter the confirmed \[1\]\./i, 'Столбец 5 захвачен в блоке и исключает 5 в других местах. Введите [1].')
      .replace(/Three cells lock candidates \{1,2,3\}\. Eliminating them reveals naked \[7\]\. Enter 7!/i, 'Три клетки блокируют {1,2,3}. Их исключение открывает [7]. Введите 7!')
      .replace(/A \{4,5,6\} triple in the box leaves naked \[2\] in the center cell\. Enter 2\./i, 'Тройка {4,5,6} оставляет [2] в центре. Введите 2.')
      .replace(/Candidates \{2,5,8\} appear only in cells 1, 2, 4\. Clean extra notes and enter 8 into the target cell!/i, 'Кандидаты {2,5,8} только в клетках 1, 2, 4. Введите 8 в цель!')
      .replace(/Candidates 3, 6, 9 are hidden in 3 cells\. Enter \[9\] into the top-right target cell\./i, 'Кандидаты 3, 6, 9 скрыты в 3 клетках. Введите [9] в правый верхний угол.')
      .replace(/Four cells lock \{1,2,3,4\}\. Eliminating them reveals naked \[9\]\. Enter 9!/i, 'Четыре клетки блокируют {1,2,3,4}. Их исключение открывает [9]. Введите 9!')
      .replace(/Four cells lock \{2,3,4,6\}\. Enter the confirmed \[5\] into the target cell\./i, 'Четыре клетки блокируют {2,3,4,6}. Введите подтвержденную [5] в цель.')
      .replace(/Candidates 1, 4, 7, 9 appear only in 4 specific cells\. Enter \[1\] into the first cell!/i, 'Кандидаты 1, 4, 7, 9 только в 4 клетках. Введите [1] в первую клетку!')
      .replace(/Candidates 2, 4, 6, 8 are hidden in 4 cells\. Enter \[4\] into the center cell\./i, 'Кандидаты 2, 4, 6, 8 в 4 клетках. Введите [4] в центр.')
      .replace(/Candidate 7 forms a rectangle across 2 rows\. Eliminating 7 along the columns reveals naked \[4\]\. Enter 4!/i, 'Кандидат 7 образует прямоугольник в 2 строках. Исключение 7 в столбцах открывает [4]. Введите 4!')
      .replace(/Candidate 2 forms a vertical X-Wing, clearing candidate 2 to leave \[8\]\. Enter 8\./i, 'Кандидат 2 образует вертикальный X-Wing и оставляет [8]. Введите 8.')
      .replace(/Pivot \[1,2\] with pincers \[1,3\] & \[2,3\] eliminates 3 at their intersection, revealing \[7\]\. Enter 7!/i, 'Опора [1,2] с крыльями [1,3] и [2,3] исключает 3 на пересечении и открывает [7]. Введите 7!')
      .replace(/Y-Wing eliminates candidate 9, leaving naked \[2\]\. Enter 2\./i, 'Y-Wing исключает кандидата 9 и оставляет [2]. Введите 2.')
      .replace(/Pivot \[1,2,5\] and pincers \[1,5\], \[2,5\] eliminate 5 in the shared zone to reveal \[8\]\. Enter 8!/i, 'Опора [1,2,5] и крылья исключают 5 и открывают [8]. Введите 8!')
      .replace(/XYZ-Wing eliminates 9 to reveal \[4\]\. Enter 4\./i, 'XYZ-Wing исключает 9 и открывает [4]. Введите 4.')
      .replace(/Two \[1,8\] cells linked by strong 8 eliminate candidate 1 at their mutual intersection, leaving \[5\]\. Enter 5!/i, 'Две клетки [1,8], связанные связью 8, исключают 1 на пересечении и оставляют [5]. Введите 5!')
      .replace(/W-Wing eliminates 2 from the target cell, revealing \[9\]\. Enter 9\./i, 'W-Wing исключает 2 из цели и открывает [9]. Введите 9.')
      .replace(/All cells have 2 candidates except this unique 3-candidate cell \[2,5,8\]\. The odd-degree candidate \[5\] must be true\. Enter 5!/i, 'Все клетки имеют 2 кандидата кроме [2,5,8]. Кандидат [5] истинен. Введите 5!')
      .replace(/To avoid the deadly pattern, the 3-candidate cell must be set to the 3-occurrence candidate \[7\]\. Enter 7\./i, 'Чтобы избежать фатального паттерна, тройная клетка должна быть [7]. Введите 7.')
      .replace(/Opposite-color ends of the \[2,9\] chain eliminate both 2 and 9 at the intersection, leaving \[6\]\. Enter 6!/i, 'Концы цепи [2,9] исключают 2 и 9 на пересечении и оставляют [6]. Введите 6!')
      .replace(/Remote pairs eliminate 3 and 7, revealing \[1\]\. Enter 1\./i, 'Удаленные пары исключают 3 и 7 и открывают [1]. Введите 1.')
      .replace(/A 3x3 Swordfish locks candidate 6 across 3 rows and columns\. Eliminating 6 leaves \[5\]\. Enter 5!/i, 'Рыба-меч 3x3 блокирует 6 в 3 строках и столбцах. Исключение 6 оставляет [5]. Введите 5!')
      .replace(/Swordfish grid clears candidate 1 to leave \[9\]\. Enter 9\./i, 'Рыба-меч исключает кандидата 1 и оставляет [9]. Введите 9.')
      .replace(/A 4x4 Jellyfish locks candidate 5 across 4 rows and columns\. Eliminating 5 leaves \[7\]\. Enter 7!/i, 'Медуза 4x4 блокирует 5 в 4 строках и столбцах. Исключение 5 оставляет [7]. Введите 7!')
      .replace(/Jellyfish on candidate 8 leaves \[3\]\. Enter 3\./i, 'Медуза по 8 оставляет [3]. Введите 3.')
      .replace(/Three corners are locked to \[1,2\]\. To prevent a deadly pattern with multiple solutions, the 4th corner must be \[7\]\. Enter 7!/i, 'Три угла заперты на [1,2]. Чтобы избежать фатального паттерна, 4-й угол должен быть [7]. Введите 7!')
      .replace(/Avoid deadly pattern \[3,8\] by confirming the extra candidate \[5\]\. Enter 5\./i, 'Избегайте фатального паттерна [3,8], подтвердив экстра-кандидата [5]. Введите 5.')
      .replace(/A cell seeing both Blue & Yellow 4-nodes eliminates candidate 4, leaving \[8\]\. Enter 8!/i, 'Клетка, видящая оба цвета, исключает кандидата 4 и оставляет [8]. Введите 8!')
      .replace(/Simple colouring clears conflicting 7, leaving \[2\]\. Enter 2\./i, 'Простая раскраска исключает 7 и оставляет [2]. Введите 2.')
      .replace(/3D Medusa multi-digit colouring eliminates 6 at the intersection, revealing \[3\]\. Enter 3!/i, '3D Medusa исключает 6 на пересечении и открывает [3]. Введите 3!')
      .replace(/Medusa chain clears candidate 1 to leave \[9\]\. Enter 9\./i, 'Цепь Medusa исключает кандидата 1 и оставляет [9]. Введите 9.')
      .replace(/A 4-node XY-Chain eliminates candidate 1 at the mutual sight cell, leaving \[6\]\. Enter 6!/i, 'Цепь XY-Chain из 4 узлов исключает кандидата 1 и оставляет [6]. Введите 6!')
      .replace(/XY-Chain clears candidate 5 to reveal \[2\]\. Enter 2\./i, 'Цепь XY-Chain исключает кандидата 5 и открывает [2]. Введите 2.')
      .replace(/Pivot \[1,2,3,4\] and 3 pincers eliminate restricted candidate 4 to reveal \[9\]\. Enter 9!/i, 'Опора [1,2,3,4] и 3 крыла исключают кандидата 4 и открывают [9]. Введите 9!')
      .replace(/WXYZ-Wing eliminates 7 to reveal \[1\]\. Enter 1\./i, 'WXYZ-Wing исключает 7 и открывает [1]. Введите 1.')
      .replace(/Box Empty Rectangle locks candidate 8 via a conjugate pair, eliminating 8 to reveal \[2\]\. Enter 2!/i, 'Empty Rectangle исключает 8 и открывает [2]. Введите 2!')
      .replace(/ER eliminates 3 to leave \[5\]\. Enter 5\./i, 'Empty Rectangle исключает 3 и оставляет [5]. Введите 5.')
      .replace(/Finned X-Wing eliminates 6 from the mutual sight intersection, leaving \[3\]\. Enter 3!/i, 'Finned X-Wing исключает 6 на пересечении и оставляет [3]. Введите 3!')
      .replace(/Finned X-Wing eliminates 8, revealing \[5\]\. Enter 5\./i, 'Finned X-Wing исключает 8 и открывает [5]. Введите 5.')
      .replace(/Alternating strong and weak links eliminate candidate 1, revealing \[9\]\. Enter 9!/i, 'Чередующиеся связи исключают кандидата 1 и открывают [9]. Введите 9!')
      .replace(/AIC chain inference leaves \[6\] in the target cell\. Enter 6\./i, 'Вывод цепи AIC определяет [6] в цели. Введите 6.')
      .replace(/Two ALS sets connected by candidate 2 eliminate candidate 7, leaving \[1\]\. Enter 1!/i, 'Два множества ALS, связанные 2, исключают 7 и оставляют [1]. Введите 1!')
      .replace(/ALS chain clears candidate 9 to leave \[8\]\. Enter 8\./i, 'Цепь ALS исключает 9 и оставляет [8]. Введите 8.')
      .replace(/All hypothetical branches converge to verify digit \[7\] in the target cell\. Enter 7!/i, 'Все гипотетические ветви сходятся для подтверждения [7] в цели. Введите 7!')
      .replace(/Forcing chain convergence reveals \[4\]\. Enter 4\./i, 'Сходимость Forcing Chain открывает [4]. Введите 4.')
      .replace(/Exocet base cells lock the target companion cell to \[5\]\. Enter 5!/i, 'Базовые клетки Exocet блокируют цель на [5]. Введите 5!')
      .replace(/Exocet cross-line resolution reveals \[8\]\. Enter 8\./i, 'Разрешение линий Exocet открывает [8]. Введите 8.');
  },
  hi: (en) => {
    return en
      .replace(/Check the (\d+) glowing numbers \(1-8\)\. Enter the remaining final digit into the glowing target cell\./i, '$1 हाइलाइट किए गए अंकों (1-8) की जांच करें। लक्ष्य सेल में शेष अंतिम अंक दर्ज करें।')
      .replace(/The box contains 2, 3, 4, 5, 6, 7, 8, 9\. What is the single missing digit for the center cell\?/i, 'बॉक्स में 2, 3, 4, 5, 6, 7, 8, 9 हैं। केंद्र सेल के लिए लुप्त अंक क्या है?')
      .replace(/8 of 9 cells are filled in this column\. Enter the last remaining digit\./i, 'इस स्तंभ में 9 में से 8 सेल भरे हैं। अंतिम शेष अंक दर्ज करें।')
      .replace(/The box has 1,2,3,4,6,7,8,9 filled\. Place the missing \[5\] into the empty corner\./i, 'बॉक्स में 1,2,3,4,6,7,8,9 हैं। खाली कोने में गायब [5] रखें।')
      .replace(/Cross-hatching from other boxes and existing givens \(1,2,3,8\) leave only one open cell in the top-right box\. Enter 5!/i, 'क्रॉस-हैचिंग ऊपर-दाएं बॉक्स में केवल एक सेल छोड़ती है। 5 दर्ज करें!')
      .replace(/Cross-hatching 7s and existing givens \(4,5,6,9\) reveal the only open cell in the top-right box\. Enter 7\./i, '7 की क्रॉस-हैचिंग ऊपर-दाएं बॉक्स में एकमात्र खुली सेल प्रकट करती है। 7 दर्ज करें।')
      .replace(/Neighbors show 1,2,4,5,6,7,8,9\. The only remaining candidate for this cell is 3\./i, 'पड़ोसी 1,2,4,5,6,7,8,9 दिखाते हैं। इस सेल के लिए एकमात्र उम्मीदवार 3 है।')
      .replace(/Digits 1,2,3,4,5,7,8,9 are already present in shared units\. Enter 6\./i, 'साझा इकाइयों में 1,2,3,4,5,7,8,9 पहले से हैं। 6 दर्ज करें।')
      .replace(/1, 3, 4, 5, 6, 8 are filled in this box\. Among the 3 empty cells, candidate \[7\] is hidden exclusively in the center cell\. Enter 7!/i, '1, 3, 4, 5, 6, 8 भरे हैं। उम्मीदवार [7] केवल केंद्र सेल में छिपा है। 7 दर्ज करें!')
      .replace(/1, 3, 5, 6, 8, 9 are filled in this row\. Candidate \[4\] is hidden exclusively in the 3rd cell\. Enter 4!/i, 'पंक्ति में 1, 3, 5, 6, 8, 9 भरे हैं। उम्मीदवार [4] केवल तीसरी सेल में है। 4 दर्ज करें!')
      .replace(/Cells 1 & 3 lock candidates \[3, 8\]\. This eliminates 3 & 8 from Cell 2, leaving naked \[5\]\. Enter 5!/i, 'सेल 1 और 3 [3, 8] को लॉक करते हैं। यह 3 और 8 को हटाकर [5] छोड़ता है। 5 दर्ज करें!')
      .replace(/Two corner cells exclusively lock \[4, 7\]\. 4 & 7 are removed from the center cell, leaving \[9\]\. Enter 9\./i, 'दो कोने वाले सेल [4, 7] को लॉक करते हैं। केंद्र से 4 और 7 हटाकर [9] बचता है। 9 दर्ज करें।')
      .replace(/Candidates \[3, 8\] only appear in Cells 1 & 3 across this row\. Clean extra notes and enter 3 into Cell 1!/i, 'उम्मीदवार [3, 8] केवल सेल 1 और 3 में आते हैं। सेल 1 में 3 दर्ज करें!')
      .replace(/Candidates \[6, 9\] exist only in the top-left and bottom-right cells in this box\. Enter 6 into top-left!/i, 'उम्मीदवार [6, 9] केवल विपरीत कोनों में मौजूद हैं। ऊपर-बाएं में 6 दर्ज करें!')
      .replace(/In the top box, 4 is locked in column 2\. This eliminates 4 from column 2 in the bottom box, revealing naked \[6\]\. Enter 6!/i, 'शीर्ष बॉक्स में 4 स्तंभ 2 में लॉक है। यह नीचे 4 को हटाकर [6] प्रकट करता है। 6 दर्ज करें!')
      .replace(/In the left box, 1,2,3,4,5,6,8 are filled so 7 is locked in row 1 \(pointing\)\. Across the blue divider, 7 is eliminated from the right box's first cell\. Enter \[9\]!/i, 'बाएं बॉक्स में 7 पंक्ति 1 में लॉक है। दाएं से 7 हटकर [9] बचता है। 9 दर्ज करें!')
      .replace(/Row 1 requires 8 inside Box 1\. Eliminating 8 elsewhere in the box leaves naked \[3\]\. Enter 3!/i, 'पंक्ति 1 को बॉक्स 1 में 8 चाहिए। 8 को हटाने पर [3] बचता है। 3 दर्ज करें!')
      .replace(/Column 5 is claimed in this box, eliminating 5 elsewhere\. Enter the confirmed \[1\]\./i, 'स्तंभ 5 बॉक्स में दावा किया गया है और अन्यत्र 5 को हटाता है। [1] दर्ज करें।')
      .replace(/Three cells lock candidates \{1,2,3\}\. Eliminating them reveals naked \[7\]\. Enter 7!/i, 'तीन सेल {1,2,3} को लॉक करते हैं। उन्हें हटाने पर [7] प्रकट होता है। 7 दर्ज करें!')
      .replace(/A \{4,5,6\} triple in the box leaves naked \[2\] in the center cell\. Enter 2\./i, 'बॉक्स में {4,5,6} का त्रिक केंद्र में [2] छोड़ता है। 2 दर्ज करें।')
      .replace(/Candidates \{2,5,8\} appear only in cells 1, 2, 4\. Clean extra notes and enter 8 into the target cell!/i, 'उम्मीदवार {2,5,8} केवल सेल 1, 2, 4 में आते हैं। लक्ष्य सेल में 8 दर्ज करें!')
      .replace(/Candidates 3, 6, 9 are hidden in 3 cells\. Enter \[9\] into the top-right target cell\./i, 'उम्मीदवार 3, 6, 9 तीन सेल में छिपे हैं। ऊपर-दाएं लक्ष्य सेल में [9] दर्ज करें।')
      .replace(/Four cells lock \{1,2,3,4\}\. Eliminating them reveals naked \[9\]\. Enter 9!/i, 'चार सेल {1,2,3,4} को लॉक करते हैं। उन्हें हटाने पर [9] प्रकट होता है। 9 दर्ज करें!')
      .replace(/Four cells lock \{2,3,4,6\}\. Enter the confirmed \[5\] into the target cell\./i, 'चार सेल {2,3,4,6} को लॉक करते हैं। लक्ष्य सेल में [5] दर्ज करें।')
      .replace(/Candidates 1, 4, 7, 9 appear only in 4 specific cells\. Enter \[1\] into the first cell!/i, 'उम्मीदवार 1, 4, 7, 9 केवल 4 सेल में आते हैं। पहली सेल में [1] दर्ज करें!')
      .replace(/Candidates 2, 4, 6, 8 are hidden in 4 cells\. Enter \[4\] into the center cell\./i, 'उम्मीदवार 2, 4, 6, 8 चार सेल में छिपे हैं। केंद्र सेल में [4] दर्ज करें।')
      .replace(/Candidate 7 forms a rectangle across 2 rows\. Eliminating 7 along the columns reveals naked \[4\]\. Enter 4!/i, 'उम्मीदवार 7 दो पंक्तियों में आयत बनाता है। 7 को हटाने पर [4] प्रकट होता है। 4 दर्ज करें!')
      .replace(/Candidate 2 forms a vertical X-Wing, clearing candidate 2 to leave \[8\]\. Enter 8\./i, 'उम्मीदवार 2 लंबवत X-Wing बनाता है और [8] छोड़ता है। 8 दर्ज करें।')
      .replace(/Pivot \[1,2\] with pincers \[1,3\] & \[2,3\] eliminates 3 at their intersection, revealing \[7\]\. Enter 7!/i, 'पिवट [1,2] विंग्स के साथ प्रतिच्छेदन पर 3 को हटाकर [7] प्रकट करता है। 7 दर्ज करें!')
      .replace(/Y-Wing eliminates candidate 9, leaving naked \[2\]\. Enter 2\./i, 'Y-Wing उम्मीदवार 9 को हटाकर [2] छोड़ता है। 2 दर्ज करें।')
      .replace(/Pivot \[1,2,5\] and pincers \[1,5\], \[2,5\] eliminate 5 in the shared zone to reveal \[8\]\. Enter 8!/i, 'पिवट [1,2,5] और विंग्स 5 को हटाकर [8] प्रकट करते हैं। 8 दर्ज करें!')
      .replace(/XYZ-Wing eliminates 9 to reveal \[4\]\. Enter 4\./i, 'XYZ-Wing 9 को हटाकर [4] प्रकट करता है। 4 दर्ज करें।')
      .replace(/Two \[1,8\] cells linked by strong 8 eliminate candidate 1 at their mutual intersection, leaving \[5\]\. Enter 5!/i, '8 से जुड़े दो [1,8] सेल 1 को हटाकर [5] छोड़ते हैं। 5 दर्ज करें!')
      .replace(/W-Wing eliminates 2 from the target cell, revealing \[9\]\. Enter 9\./i, 'W-Wing लक्ष्य सेल से 2 को हटाकर [9] प्रकट करता है। 9 दर्ज करें।')
      .replace(/All cells have 2 candidates except this unique 3-candidate cell \[2,5,8\]\. The odd-degree candidate \[5\] must be true\. Enter 5!/i, 'सभी सेलों में 2 उम्मीदवार हैं सिवाय [2,5,8] के। उम्मीदवार [5] सत्य होना चाहिए। 5 दर्ज करें!')
      .replace(/To avoid the deadly pattern, the 3-candidate cell must be set to the 3-occurrence candidate \[7\]\. Enter 7\./i, 'घातक पैटर्न से बचने के लिए, 3-उम्मीदवार सेल को [7] पर सेट करें। 7 दर्ज करें।')
      .replace(/Opposite-color ends of the \[2,9\] chain eliminate both 2 and 9 at the intersection, leaving \[6\]\. Enter 6!/i, '[2,9] श्रृंखला के सिरे प्रतिच्छेदन पर 2 और 9 को हटाकर [6] छोड़ते हैं। 6 दर्ज करें!')
      .replace(/Remote pairs eliminate 3 and 7, revealing \[1\]\. Enter 1\./i, 'रिमोट पेयर्स 3 और 7 को हटाकर [1] प्रकट करते हैं। 1 दर्ज करें।')
      .replace(/A 3x3 Swordfish locks candidate 6 across 3 rows and columns\. Eliminating 6 leaves \[5\]\. Enter 5!/i, '3x3 स्वॉर्डफिश 6 को 3 पंक्तियों और स्तंभों में लॉक करता है। 6 को हटाने पर [5] बचता है। 5 दर्ज करें!')
      .replace(/Swordfish grid clears candidate 1 to leave \[9\]\. Enter 9\./i, 'स्वॉर्डफिश ग्रिड उम्मीदवार 1 को हटाकर [9] छोड़ता है। 9 दर्ज करें।')
      .replace(/A 4x4 Jellyfish locks candidate 5 across 4 rows and columns\. Eliminating 5 leaves \[7\]\. Enter 7!/i, '4x4 जेलीफिश 5 को 4 पंक्तियों और स्तंभों में लॉक करता है। 5 को हटाने पर [7] बचता है। 7 दर्ज करें!')
      .replace(/Jellyfish on candidate 8 leaves \[3\]\. Enter 3\./i, 'उम्मीदवार 8 पर जेलीफिश [3] छोड़ता है। 3 दर्ज करें।')
      .replace(/Three corners are locked to \[1,2\]\. To prevent a deadly pattern with multiple solutions, the 4th corner must be \[7\]\. Enter 7!/i, 'तीन कोने [1,2] पर लॉक हैं। घातक पैटर्न से बचने के लिए चौथा कोना [7] होना चाहिए। 7 दर्ज करें!')
      .replace(/Avoid deadly pattern \[3,8\] by confirming the extra candidate \[5\]\. Enter 5\./i, 'अतिरिक्त उम्मीदवार [5] की पुष्टि करके घातक पैटर्न [3,8] से बचें। 5 दर्ज करें।')
      .replace(/A cell seeing both Blue & Yellow 4-nodes eliminates candidate 4, leaving \[8\]\. Enter 8!/i, 'दोनों रंगों को देखने वाली सेल उम्मीदवार 4 को हटाकर [8] छोड़ती है। 8 दर्ज करें!')
      .replace(/Simple colouring clears conflicting 7, leaving \[2\]\. Enter 2\./i, 'सिंपल कलरिंग 7 को हटाकर [2] छोड़ती है। 2 दर्ज करें।')
      .replace(/3D Medusa multi-digit colouring eliminates 6 at the intersection, revealing \[3\]\. Enter 3!/i, '3D मेडुसा प्रतिच्छेदन पर 6 को हटाकर [3] प्रकट करता है। 3 दर्ज करें!')
      .replace(/Medusa chain clears candidate 1 to leave \[9\]\. Enter 9\./i, 'मेडुसा श्रृंखला उम्मीदवार 1 को हटाकर [9] छोड़ती है। 9 दर्ज करें।')
      .replace(/A 4-node XY-Chain eliminates candidate 1 at the mutual sight cell, leaving \[6\]\. Enter 6!/i, '4-नोड XY-Chain उम्मीदवार 1 को हटाकर [6] छोड़ती है। 6 दर्ज करें!')
      .replace(/XY-Chain clears candidate 5 to reveal \[2\]\. Enter 2\./i, 'XY-Chain उम्मीदवार 5 को हटाकर [2] प्रकट करती है। 2 दर्ज करें।')
      .replace(/Pivot \[1,2,3,4\] and 3 pincers eliminate restricted candidate 4 to reveal \[9\]\. Enter 9!/i, 'पिवट [1,2,3,4] और 3 विंग्स 4 को हटाकर [9] प्रकट करते हैं। 9 दर्ज करें!')
      .replace(/WXYZ-Wing eliminates 7 to reveal \[1\]\. Enter 1\./i, 'WXYZ-Wing 7 को हटाकर [1] प्रकट करता है। 1 दर्ज करें।')
      .replace(/Box Empty Rectangle locks candidate 8 via a conjugate pair, eliminating 8 to reveal \[2\]\. Enter 2!/i, 'Empty Rectangle 8 को हटाकर [2] प्रकट करता है। 2 दर्ज करें!')
      .replace(/ER eliminates 3 to leave \[5\]\. Enter 5\./i, 'Empty Rectangle 3 को हटाकर [5] छोड़ता है। 5 दर्ज करें।')
      .replace(/Finned X-Wing eliminates 6 from the mutual sight intersection, leaving \[3\]\. Enter 3!/i, 'Finned X-Wing प्रतिच्छेदन से 6 को हटाकर [3] छोड़ता है। 3 दर्ज करें!')
      .replace(/Finned X-Wing eliminates 8, revealing \[5\]\. Enter 5\./i, 'Finned X-Wing 8 को हटाकर [5] प्रकट करता है। 5 दर्ज करें।')
      .replace(/Alternating strong and weak links eliminate candidate 1, revealing \[9\]\. Enter 9!/i, 'बारी-बारी से बनने वाले लिंक 1 को हटाकर [9] प्रकट करते हैं। 9 दर्ज करें!')
      .replace(/AIC chain inference leaves \[6\] in the target cell\. Enter 6\./i, 'AIC श्रृंखला लक्ष्य सेल में [6] निर्धारित करती है। 6 दर्ज करें।')
      .replace(/Two ALS sets connected by candidate 2 eliminate candidate 7, leaving \[1\]\. Enter 1!/i, '2 से जुड़े दो ALS सेट 7 को हटाकर [1] छोड़ते हैं। 1 दर्ज करें!')
      .replace(/ALS chain clears candidate 9 to leave \[8\]\. Enter 8\./i, 'ALS श्रृंखला 9 को हटाकर [8] छोड़ती है। 8 दर्ज करें।')
      .replace(/All hypothetical branches converge to verify digit \[7\] in the target cell\. Enter 7!/i, 'सभी काल्पनिक शाखाएं लक्ष्य सेल में [7] की पुष्टि करती हैं। 7 दर्ज करें!')
      .replace(/Forcing chain convergence reveals \[4\]\. Enter 4\./i, 'फोर्सिंग चेन अभिसरण [4] प्रकट करता है। 4 दर्ज करें।')
      .replace(/Exocet base cells lock the target companion cell to \[5\]\. Enter 5!/i, 'Exocet बेस सेल लक्ष्य सेल को [5] पर लॉक करते हैं। 5 दर्ज करें!')
      .replace(/Exocet cross-line resolution reveals \[8\]\. Enter 8\./i, 'Exocet क्रॉस-लाइन समाधान [8] प्रकट करता है। 8 दर्ज करें।');
  }
};

function processLangObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const en = obj.en || '';
  const ko = obj.ko || '';
  const ja = obj.ja || '';
  const zh = obj.zh || obj['zh-TW'] || '';
  const es = obj.es || obj['es-ES'] || '';

  const res = {
    ko,
    en,
    ja,
    zh,
    'zh-CN': obj['zh-CN'] || zh,
    es
  };

  const targetLangs = ['de', 'fr', 'pt', 'it', 'ru', 'hi', 'ar'];
  for (const lang of targetLangs) {
    if (lang === 'de') {
      const dePair = GUIDES_MAP.de.find(([re]) => re.test(en));
      res.de = dePair ? en.replace(dePair[0], dePair[1]) : en;
    } else if (lang === 'ar') {
      const arPair = GUIDES_MAP.ar.find(([re]) => re.test(en));
      res.ar = arPair ? en.replace(arPair[0], arPair[1]) : en;
    } else if (LANG_MAPS[lang]) {
      res[lang] = LANG_MAPS[lang](en);
    } else {
      res[lang] = en;
    }
  }

  return res;
}

function serializeCompact(data) {
  if (Array.isArray(data)) {
    return '[\n' + data.map(item => '      ' + serializeMission(item)).join(',\n') + '\n    ]';
  }
  
  const entries = Object.entries(data).map(([key, val]) => {
    if (Array.isArray(val)) {
      return `  '${key}': [\n` + val.map(item => '    ' + serializeMission(item)).join(',\n') + '\n  ]';
    }
    const props = Object.entries(val).map(([pKey, pVal]) => {
      return `    ${pKey}: ${JSON.stringify(pVal)}`;
    }).join(',\n');
    return `  '${key}': {\n${props}\n  }`;
  });

  return '{\n' + entries.join(',\n') + '\n}';
}

function serializeMission(m) {
  const parts = [];
  parts.push(`id: ${JSON.stringify(m.id)}`);
  parts.push(`title: ${JSON.stringify(m.title)}`);
  parts.push(`guide: ${JSON.stringify(m.guide)}`);
  if (m.explanation) parts.push(`explanation: ${JSON.stringify(m.explanation)}`);
  if (m.layoutType) parts.push(`layoutType: ${JSON.stringify(m.layoutType)}`);
  if (m.targetIndex !== undefined) parts.push(`targetIndex: ${m.targetIndex}`);
  if (m.correctVal !== undefined) parts.push(`correctVal: ${m.correctVal}`);
  if (m.cells) parts.push(`cells: ${JSON.stringify(m.cells)}`);
  return '{\n      ' + parts.join(',\n      ') + '\n    }';
}

// Process all practice files
const practiceFiles = [
  'src/data/academy/practice/stage1Practice.js',
  'src/data/academy/practice/stage2PairsPractice.js',
  'src/data/academy/practice/stage2TuplesPractice.js',
  'src/data/academy/practice/stage3WingsPractice.js',
  'src/data/academy/practice/stage3ChainsPractice.js',
  'src/data/academy/practice/stage4FishPractice.js',
  'src/data/academy/practice/stage4ChainsPractice.js',
  'src/data/academy/practice/stage5Practice.js'
];

for (const filePath of practiceFiles) {
  const mod = await import(`file://${path.resolve(filePath)}`);
  const exportKey = Object.keys(mod)[0];
  const data = mod[exportKey];

  const updatedData = {};
  for (const [strategyKey, missions] of Object.entries(data)) {
    updatedData[strategyKey] = missions.map(m => ({
      ...m,
      title: processLangObject(m.title),
      guide: processLangObject(m.guide),
      explanation: m.explanation ? processLangObject(m.explanation) : undefined
    }));
  }

  const content = `/**
 * ${path.basename(filePath)}
 * Master 13-Language Translations for Academy Practice Missions
 */

export const ${exportKey} = ${serializeCompact(updatedData)};

export default ${exportKey};
`;

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('✅ All 64 missions updated across all 13 languages!');
