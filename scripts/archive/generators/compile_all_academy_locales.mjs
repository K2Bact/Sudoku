/**
 * compile_all_academy_locales.mjs
 * Master Multi-Language Compiler for Suidoku Academy.
 * Translates & syncs all 32 Strategies, Diagrams, Practice Missions across 13 Languages:
 * KO, EN, JA, ZH-TW, ZH-CN, ES-ES, DE, FR, PT, IT, RU, HI, AR.
 */

import fs from 'fs';
import path from 'path';

// Complete 32 Strategies Meta
export const ALL_32_STRATEGIES = {
  // STAGE 1 (1-1 ~ 1-5)
  'full-house': {
    stage: 'stage1',
    badges: {
      en: 'Beginner 1-1', ko: '초급 1-1', ja: '初級 1-1', zh: '初級 1-1', 'zh-CN': '初级 1-1',
      es: 'Básica 1-1', de: 'Anfänger 1-1', fr: 'Débutant 1-1', pt: 'Iniciante 1-1',
      it: 'Principiante 1-1', ru: 'Новичок 1-1', hi: 'शुरुआती 1-1', ar: 'مبتدئ 1-1'
    },
    titles: {
      en: 'Full House (Last 1 Cell)', ko: 'Full House (마지막 1칸)', ja: 'フルハウス (最後の1マス)',
      zh: '唯一餘數 Full House (最後一格)', 'zh-CN': '唯一余数 Full House (最后一格)',
      es: 'Full House (Última casilla)', de: 'Full House (Letztes 1 Feld)',
      fr: 'Full House (Dernière case)', pt: 'Full House (Última casa)',
      it: 'Full House (Ultima casella)', ru: 'Фулл-Хаус (Последняя 1 клетка)',
      hi: 'फुल हाउस (अंतिम 1 सेल)', ar: 'فل هاوس (آخر خلية متبقية)'
    },
    descs: {
      en: 'When 8 of the 9 cells in a row, column, or 3x3 box are filled, only 1 cell remains and is immediately determined.',
      ko: '가로줄, 세로줄, 또는 3x3 박스의 9개 칸 중 8개가 채워져 오직 1개 칸만 남은 가장 기본적이고 확정적인 상태입니다.',
      ja: '行・列・3x3ブロックの9マスのうち8マスが埋まり、残り1マスが即座に確定する最も基本の解法です。',
      zh: '當一行、一列或 3x3 九宮格中已填入 8 個數字時，僅剩的最後一格可立即確定數值。',
      'zh-CN': '当一行、一列或 3x3 九宫格中已填入 8 个数字时，仅剩的最后一格可立即确定数值。',
      es: 'Cuando 8 de las 9 casillas de una fila, columna o bloque 3x3 están llenas, la única casilla restante queda fijada de inmediato.',
      de: 'Wenn 8 von 9 Feldern in einer Zeile, Spalte oder einem 3x3-Block gefüllt sind, ist das letzte verbleibende Feld sofort eindeutig bestimmt.',
      fr: 'Lorsque 8 des 9 cases d’une ligne, d’une colonne ou d’un bloc 3x3 sont remplies, la seule case restante est immédiatement déterminée.',
      pt: 'Quando 8 das 9 casas em uma linha, coluna ou bloco 3x3 estão preenchidas, resta apenas 1 casa e ela é determinada de imediato.',
      it: 'Quando 8 delle 9 caselle in una riga, colonna o blocco 3x3 sono piene, l’unica casella rimanente è immediatamente determinata.',
      ru: 'Когда 8 из 9 клеток в строке, столбце или блоке 3x3 заполнены, остается только 1 клетка, которая определяется мгновенно.',
      hi: 'जब किसी पंक्ति, स्तंभ या 3x3 बॉक्स में 9 में से 8 सेल भरे हों, तो केवल 1 सेल बचता है और तुरंत निर्धारित हो जाता है।',
      ar: 'عندما تمتلئ 8 من أصل 9 خلايا في صف أو عمود أو مربع 3x3، تتبقى خلية واحدة فقط ويتم تحديد رقمها فوراً.'
    }
  },
  'last-free-cell': {
    stage: 'stage1',
    badges: {
      en: 'Beginner 1-2', ko: '초급 1-2', ja: '初級 1-2', zh: '初級 1-2', 'zh-CN': '初级 1-2',
      es: 'Básica 1-2', de: 'Anfänger 1-2', fr: 'Débutant 1-2', pt: 'Iniciante 1-2',
      it: 'Principiante 1-2', ru: 'Новичок 1-2', hi: 'शुरुआती 1-2', ar: 'مبتدئ 1-2'
    },
    titles: {
      en: 'Last Free Cell (Last in Box)', ko: 'Last Free Cell (마지막 빈 셀)', ja: 'ラストフリーセル (ブロック内確定)',
      zh: '最後空格 Last Free Cell (九宮格確定)', 'zh-CN': '最后空格 Last Free Cell (九宫格确定)',
      es: 'Last Free Cell (Última en bloque)', de: 'Last Free Cell (Letztes freies Feld)',
      fr: 'Last Free Cell (Dernière case du bloc)', pt: 'Last Free Cell (Última livre no bloco)',
      it: 'Last Free Cell (Ultima nel blocco)', ru: 'Последняя свободная клетка (В блоке)',
      hi: 'लास्ट फ्री सेल (बॉक्स में अंतिम)', ar: 'آخر خلية شاغرة (في المربع)'
    },
    descs: {
      en: 'When 8 numbers are already placed inside a 3x3 box, the only remaining empty cell is immediately determined by the 1~9 rule.',
      ko: '3x3 박스 내부에 8개의 숫자가 채워져 있을 때, 1~9 스도쿠 규칙에 의해 남은 1개 빈칸의 숫자가 즉시 확정되는 기법입니다.',
      ja: '3x3ブロック内に8個の数字が埋まっている時、ナンプレの1〜9ルールにより残り1マスの数字が即確定します。',
      zh: '當 3x3 九宮格內已填入 8 個數字時，根據 1〜9 數獨規則，僅存的 1 個空格將立即確定。',
      'zh-CN': '当 3x3 九宫格内已填入 8 个数字时，根据 1〜9 数独规则，仅存的 1 个空格将立即确定。',
      es: 'Cuando un bloque 3x3 contiene 8 números, la última casilla vacía se deduce al instante por la regla del 1 al 9.',
      de: 'Wenn in einem 3x3-Block bereits 8 Zahlen platziert sind, wird das letzte freie Feld durch die Sudoku-Regel (1-9) direkt bestimmt.',
      fr: 'Lorsque 8 chiffres sont déjà placés dans un bloc 3x3, la dernière case vide est directement déterminée par la règle du 1 à 9.',
      pt: 'Quando 8 números já estão colocados em um bloco 3x3, a única casa vazia restante é determinada na hora pela regra de 1 a 9.',
      it: 'Quando 8 numeri sono già inseriti in un blocco 3x3, l’unica casella vuota rimasta è subito determinata dalla regola da 1 a 9.',
      ru: 'Когда в блоке 3x3 уже расставлены 8 цифр, единственная пустая клетка сразу определяется правилом 1–9.',
      hi: 'जब 3x3 बॉक्स के अंदर 8 नंबर पहले से भरे हों, तो बची हुई खाली सेल 1-9 नियम से तुरंत तय हो जाती है।',
      ar: 'عندما توضع 8 أرقام داخل مربع 3x3، يتم تحديد الخلية الفارغة الوحيدة المتبقية فوراً وفق قاعدة الأرقام من 1 إلى 9.'
    }
  },
  'cross-hatching': {
    stage: 'stage1',
    badges: {
      en: 'Beginner 1-3', ko: '초급 1-3', ja: '初級 1-3', zh: '初級 1-3', 'zh-CN': '初级 1-3',
      es: 'Básica 1-3', de: 'Anfänger 1-3', fr: 'Débutant 1-3', pt: 'Iniciante 1-3',
      it: 'Principiante 1-3', ru: 'Новичок 1-3', hi: 'शुरुआती 1-3', ar: 'مبتدئ 1-3'
    },
    titles: {
      en: 'Cross-Hatching (Row/Col Elimination)', ko: 'Cross-Hatching (행/열 소거법)', ja: 'クロスハッチング (行/列消去法)',
      zh: '宮內排除法 Cross-Hatching (行列排除法)', 'zh-CN': '宫内排除法 Cross-Hatching (行列排除法)',
      es: 'Cross-Hatching (Barrido de filas/cols)', de: 'Cross-Hatching (Zeilen-/Spalten-Ausschluss)',
      fr: 'Cross-Hatching (Élimination Ligne/Col)', pt: 'Cross-Hatching (Eliminação Linha/Col)',
      it: 'Cross-Hatching (Eliminazione Riga/Col)', ru: 'Кросс-хэтчинг (Исключение по строкам/столбцам)',
      hi: 'क्रॉस-हैचिंग (पंक्ति/स्तंभ निष्कासन)', ar: 'المسح المتقاطع (استبعاد الصفوف والأعمدة)'
    },
    descs: {
      en: 'Scan rows and columns with the same number to eliminate invalid cells (✕) and isolate the only valid spot in a 3x3 box.',
      ko: '다른 줄에 있는 같은 숫자로 인해 들어올 수 없는 칸들에 ✕를 표시하고, 3x3 박스 내 유일하게 남은 정답 칸을 발굴합니다.',
      ja: '他行や他列にある同数字からブロック内に入れないマスに✕を引き、ブロック内で唯一残る正解マスを特定します。',
      zh: '利用其他行列的相同數字對九宮格進行交叉射線排除 (✕)，鎖定該九宮格內唯一的有效位置。',
      'zh-CN': '利用其他行列的相同数字对九宫格进行交叉射线排除 (✕)，锁定该九宫格内唯一的有效位置。',
      es: 'Rastrea filas y columnas con el mismo número para descartar casillas no válidas (✕) y aislar la única solución en el bloque.',
      de: 'Überprüfen Sie Zeilen und Spalten mit derselben Zahl, um blockierte Felder auszuschließen (✕) und das einzige Feld im 3x3-Block zu finden.',
      fr: 'Scannez les lignes et colonnes contenant le même chiffre pour éliminer les cases impossibles (✕) et isoler la seule case valide.',
      pt: 'Analise linhas e colunas com o mesmo número para eliminar casas bloqueadas (✕) e isolar a única posição válida no bloco.',
      it: 'Esamina righe e colonne con lo stesso numero per eliminare le caselle non valide (✕) e isolare l’unica posizione nel blocco.',
      ru: 'Просканируйте строки и столбцы с одинаковой цифрой, чтобы исключить недопустимые клетки (✕) и найти единственное место в блоке.',
      hi: 'समान संख्या वाली पंक्तियों और स्तंभों को स्कैन करके अमान्य सेल हटाएं (✕) और बॉक्स में एकमात्र सही स्थान खोजें।',
      ar: 'امسح الصفوف والأعمدة التي تحتوي على نفس الرقم لاستبعاد الخلايا غير الصالحة (✕) وتحديد المكان الصحيح الوحيد في المربع.'
    }
  },
  'naked-single': {
    stage: 'stage1',
    badges: {
      en: 'Beginner 1-4', ko: '초급 1-4', ja: '初級 1-4', zh: '初級 1-4', 'zh-CN': '初级 1-4',
      es: 'Básica 1-4', de: 'Anfänger 1-4', fr: 'Débutant 1-4', pt: 'Iniciante 1-4',
      it: 'Principiante 1-4', ru: 'Новичок 1-4', hi: 'शुरुआती 1-4', ar: 'مبتدئ 1-4'
    },
    titles: {
      en: 'Naked Single (Sole Candidate)', ko: 'Naked Single (단일 후보)', ja: 'ネイキッドシングル (単一候補)',
      zh: '唯餘解法 Naked Single (單一候選數)', 'zh-CN': '唯余解法 Naked Single (单一候选数)',
      es: 'Naked Single (Único candidato obvio)', de: 'Naked Single (Einziger Kandidat)',
      fr: 'Naked Single (Candidat unique)', pt: 'Naked Single (Candidato único)',
      it: 'Naked Single (Candidato singolo)', ru: 'Одиночка (Единственный кандидат)',
      hi: 'नेकेड सिंगल (एकमात्र उम्मीदवार)', ar: 'الخلية الفردية المكشوفة (المرشح الوحيد)'
    },
    descs: {
      en: 'Looking at a single cell, all other 8 digits appear in its row, column, or box, leaving only 1 possible candidate.',
      ko: '한 셀에 집중했을 때 주변 8개 숫자에 막혀 들어갈 수 있는 후보수가 오직 1개만 남는 기법입니다.',
      ja: 'ある1マスに着目した時、周囲8個の数字に塞がれ配置可能な候補数が1つしか残らない技法です。',
      zh: '觀察特定單一格子時，因同行、同列與同宮已佔用其他 8 個數字，候選數僅剩唯獨 1 個可能。',
      'zh-CN': '观察特定单一格子时，因同行、同列与同宫已占用其他 8 个数字，候选数仅剩唯独 1 个可能。',
      es: 'Al examinar una casilla individual, los otros 8 números ya aparecen en su fila, columna o bloque, quedando solo 1 opción posible.',
      de: 'Betrachtet man ein einzelnes Feld, blockieren die anderen 8 Zahlen in Zeile, Spalte oder Block alle Optionen bis auf genau 1 Zahl.',
      fr: 'En observant une case, les 8 autres chiffres apparaissent déjà dans sa ligne, colonne ou bloc, ne laissant qu’un seul candidat possible.',
      pt: 'Ao focar em uma casa, os outros 8 números já estão presentes na linha, coluna ou bloco, restando apenas 1 candidato.',
      it: 'Osservando una singola casella, tutti gli altri 8 numeri appaiono nella riga, colonna o blocco, lasciando solo 1 candidato.',
      ru: 'При взгляде на одну клетку все остальные 8 цифр уже заняты в строке, столбце или блоке, оставляя лишь 1 возможный вариант.',
      hi: 'किसी एक सेल को देखने पर अन्य 8 अंक उसकी पंक्ति, स्तंभ या बॉक्स में मौजूद होते हैं, जिससे केवल 1 उम्मीदवार बचता है।',
      ar: 'بالنظر إلى خلية واحدة، تظهر جميع الأرقام الثمانية الأخرى في صفها أو عمودها أو مربعها، مما يترك مرشحاً واحداً فقط.'
    }
  },
  'hidden-single': {
    stage: 'stage1',
    badges: {
      en: 'Beginner 1-5', ko: '초급 1-5', ja: '初級 1-5', zh: '初級 1-5', 'zh-CN': '初级 1-5',
      es: 'Básica 1-5', de: 'Anfänger 1-5', fr: 'Débutant 1-5', pt: 'Iniciante 1-5',
      it: 'Principiante 1-5', ru: 'Новичок 1-5', hi: 'शुरुआती 1-5', ar: 'مبتدئ 1-5'
    },
    titles: {
      en: 'Hidden Single (Unique Placement)', ko: 'Hidden Single (숨은 단일)', ja: 'ヒドゥンシングル (隠れ単一)',
      zh: '隱性單數 Hidden Single (隱藏單一)', 'zh-CN': '隐性单数 Hidden Single (隐藏单一)',
      es: 'Hidden Single (Candidato oculto)', de: 'Hidden Single (Versteckter Einer)',
      fr: 'Hidden Single (Unique caché)', pt: 'Hidden Single (Único oculto)',
      it: 'Hidden Single (Singolo nascosto)', ru: 'Скрытая одиночка (Hidden Single)',
      hi: 'हिडन सिंगल (छिपा हुआ उम्मीदवार)', ar: 'الخلية الفردية المخفية (الموضع الفريد)'
    },
    descs: {
      en: 'Within a row, column, or box, a specific number can only fit in one specific cell among all candidate notes.',
      ko: '한 줄 또는 3x3 박스 전체를 보았을 때, 연필메모 속에서 특정 숫자가 들어갈 수 있는 위치가 오직 이 한 칸뿐인 기법입니다.',
      ja: '行・列・3x3ブロック全体を見渡した時、メモの中で特定の数字が入れる位置がその1マスしかない技法です。',
      zh: '縱觀整個行列或九宮格的所有候選筆記中，特定數字只能填入該唯一格子的解法。',
      'zh-CN': '纵观整个行列或九宫格的所有候选笔记中，特定数字只能填入该唯一格子的解法。',
      es: 'Dentro de una fila, columna o bloque, un número específico solo puede encajar en una única casilla entre todas las notas anotadas.',
      de: 'Innerhalb einer Zeile, Spalte oder eines Blocks kann eine bestimmte Zahl unter allen Notizen nur in genau ein bestimmtes Feld passen.',
      fr: 'Dans une ligne, colonne ou bloc, un chiffre spécifique ne peut être placé que dans une seule case parmi toutes les notes.',
      pt: 'Dentro de uma linha, coluna ou bloco, um número específico só pode caber em uma única casa entre todas as anotações.',
      it: 'In una riga, colonna o blocco, un numero specifico può entrare solo in una determinata casella tra tutte le annotazioni.',
      ru: 'В строке, столбце или блоке определенная цифра среди всех заметок может встать только в одну конкретную клетку.',
      hi: 'किसी पंक्ति, स्तंभ या बॉक्स में, सभी पेंसिल नोट्स में से एक विशिष्ट संख्या केवल एक ही सेल में आ सकती है।',
      ar: 'داخل الصف أو العمود أو المربع، لا يمكن وضع رقم معين إلا في خلية واحدة محددة من بين جميع الملاحظات المرشحة.'
    }
  },

  // STAGE 2 (2-1 ~ 2-8)
  'pointing-pairs': {
    stage: 'stage2',
    badges: {
      en: 'Intermediate 2-1', ko: '중급 2-1', ja: '中級 2-1', zh: '中級 2-1', 'zh-CN': '中级 2-1',
      es: 'Intermedia 2-1', de: 'Mittel 2-1', fr: 'Intermédiaire 2-1', pt: 'Intermediário 2-1',
      it: 'Intermedio 2-1', ru: 'Средний 2-1', hi: 'मध्यम 2-1', ar: 'متوسط 2-1'
    },
    titles: {
      en: 'Locked Candidates 1 (Pointing)', ko: 'Locked Candidates 1 (포인팅)', ja: 'ロックト・キャンディデイツ 1 (ポインティング)',
      zh: '指向數對 Pointing Pairs (區塊排除)', 'zh-CN': '指向数对 Pointing Pairs (区块排除)',
      es: 'Pares Apuntadores (Pointing Pairs)', de: 'Locked Candidates 1 (Pointing)',
      fr: 'Candidats Verrouillés 1 (Pointage)', pt: 'Candidatos Bloqueados 1 (Pointing)',
      it: 'Candidati Bloccati 1 (Pointing)', ru: 'Указатели (Pointing Pairs)',
      hi: 'पॉइंटिंग पेयर्स (संकेतक जोड़े)', ar: 'المرشحات المقفلة 1 (المؤشر)'
    },
    descs: {
      en: 'When a candidate in a 3x3 box is confined to a single line, that box monopolizes the line, eliminating the candidate from all other boxes along that line.',
      ko: '박스 내부의 빈칸 부족으로 특정 숫자가 한 줄(세로열/가로행)에만 몰릴 때, 이 줄의 숫자는 해당 박스가 이미 독점하므로 같은 줄에 있는 다른 박스의 후보수를 모두 제거합니다.',
      ja: 'ブロック内の候補数が同一ライン(行/列)上に並ぶ時、その数字はそのブロックが独占するため、同ライン上の他ブロックからその候補数を消去できます。',
      zh: '當九宮格內的某候選數僅出現在同一行或同一列時，可將該行列其他九宮格中的該候選數排除。',
      'zh-CN': '当九宫格内的某候选数仅出现在同一行或同一列时，可将该行列其他九宫格中的该候选数排除。',
      es: 'Cuando un candidato dentro de un bloque 3x3 solo puede ir en una misma fila o columna, descártalo del resto de esa línea.',
      de: 'Wenn ein Kandidat in einem 3x3-Block auf eine einzige Zeile oder Spalte beschränkt ist, blockiert dieser Block die Linie und eliminiert den Kandidaten aus anderen Blöcken.',
      fr: 'Quand un candidat dans un bloc 3x3 est confiné à une seule ligne ou colonne, il élimine ce candidat de toutes les autres cases de cette ligne.',
      pt: 'Quando um candidato em um bloco 3x3 está restrito a uma única linha/coluna, esse bloco monopoliza a linha, eliminando o candidato dos outros blocos.',
      it: 'Quando un candidato in un blocco 3x3 è limitato a una singola riga o colonna, elimina quel candidato dalle altre caselle della stessa linea.',
      ru: 'Когда кандидат в блоке 3x3 ограничен одной строкой или столбцом, он исключается из всех остальных клеток этой линии в других блоках.',
      hi: 'जब 3x3 बॉक्स में कोई उम्मीदवार केवल एक ही पंक्ति/स्तंभ में सीमित हो, तो वह उस रेखा के अन्य सभी बॉक्सों से हटा दिया जाता है।',
      ar: 'عندما ينحصر رقم مرشح داخل مربع 3x3 في خط واحد، فإن هذا المربع يحتكر الخط ويستبعد الرقم من بقية المربعات على نفس الخط.'
    }
  },
  'claiming': {
    stage: 'stage2',
    badges: {
      en: 'Intermediate 2-2', ko: '중급 2-2', ja: '中級 2-2', zh: '中級 2-2', 'zh-CN': '中级 2-2',
      es: 'Intermedia 2-2', de: 'Mittel 2-2', fr: 'Intermédiaire 2-2', pt: 'Intermediário 2-2',
      it: 'Intermedio 2-2', ru: 'Средний 2-2', hi: 'मध्यम 2-2', ar: 'متوسط 2-2'
    },
    titles: {
      en: 'Locked Candidates 2 (Claiming)', ko: 'Locked Candidates 2 (클레이밍)', ja: 'ロックト・キャンディデイツ 2 (クレイミング)',
      zh: '行列排除 Claiming (區塊排除)', 'zh-CN': '行列排除 Claiming (区块排除)',
      es: 'Intersección de Línea (Claiming / Box-Line)', de: 'Locked Candidates 2 (Claiming)',
      fr: 'Candidats Verrouillés 2 (Revendication)', pt: 'Candidatos Bloqueados 2 (Claiming)',
      it: 'Candidati Bloccati 2 (Claiming)', ru: 'Захват линии (Claiming)',
      hi: 'क्लेमिंग पेयर्स (लाइन-बॉक्स लॉक)', ar: 'المرشحات المقفلة 2 (المطالبة)'
    },
    descs: {
      en: 'When a candidate in a row/column can only fit inside one 3x3 box, the line monopolizes that candidate, eliminating it from the rest of that box.',
      ko: '특정 가로줄이나 세로열에서 어떤 숫자가 오직 한 3x3 박스 안의 줄에만 들어갈 수 있을 때, 그 줄의 숫자는 해당 줄이 해결하므로 박스 내 다른 칸들의 후보수를 제거합니다.',
      ja: '行や列の特定の候補数が同一ブロック内にのみ存在する時、その行/列が独占するため、そのブロック内の他マスから候補数を消去できます。',
      zh: '當一行或一列中的某個候選數只能出現在同一個九宮格內時，可將該九宮格中其他位置的該候選數排除。',
      'zh-CN': '当一行或一列中的某个候选数只能出现在同一个九宫格内时，可将该九宫格中其他位置的该候选数排除。',
      es: 'Si un candidato en una fila o columna solo puede ubicarse en un bloque 3x3, elimínalo de las demás casillas de dicho bloque.',
      de: 'Wenn ein Kandidat in einer Zeile oder Spalte nur in einen bestimmten 3x3-Block passt, wird er aus allen anderen Feldern dieses Blocks gelöscht.',
      fr: 'Quand un candidat dans une ligne ou colonne ne peut se trouver que dans un seul bloc 3x3, éliminez-le des autres cases de ce bloc.',
      pt: 'Quando um candidato em uma linha ou coluna só cabe em um único bloco 3x3, elimine-o das outras casas desse mesmo bloco.',
      it: 'Quando un candidato in una riga o colonna può stare solo all’interno di un blocco 3x3, eliminalo dalle altre caselle di quel blocco.',
      ru: 'Если кандидат в строке или столбце может находиться только внутри одного блока 3x3, он исключается из остальных клеток этого блока.',
      hi: 'जब किसी पंक्ति या स्तंभ का उम्मीदवार केवल एक ही 3x3 बॉक्स में आ सकता है, तो वह उस बॉक्स की अन्य सभी सेलों से हटा दिया जाता है।',
      ar: 'عندما يقع رقم مرشح في صف أو عمود داخل مربع 3x3 واحد فقط، يتم استبعاد ذلك الرقم من بقية خلايا المربع.'
    }
  },
  'naked-pair': {
    stage: 'stage2',
    badges: {
      en: 'Intermediate 2-3', ko: '중급 2-3', ja: '中級 2-3', zh: '中級 2-3', 'zh-CN': '中级 2-3',
      es: 'Media 2-3', de: 'Mittel 2-3', fr: 'Intermédiaire 2-3', pt: 'Intermediário 2-3',
      it: 'Intermedio 2-3', ru: 'Средний 2-3', hi: 'मध्यम 2-3', ar: 'متوسط 2-3'
    },
    titles: {
      en: 'Naked Pair (2 Candidates in 2 Cells)', ko: 'Naked Pair (단일 2개 쌍)', ja: 'ネイキッドペア (2国同盟)',
      zh: '顯性數對 Naked Pair (2格鎖定2數)', 'zh-CN': '显性数对 Naked Pair (2格锁定2数)',
      es: 'Naked Pair (Pareja desnuda)', de: 'Naked Pair (Offenes Paar)',
      fr: 'Naked Pair (Paire nue)', pt: 'Naked Pair (Par exposto)',
      it: 'Naked Pair (Coppia nuda)', ru: 'Открытая пара (Naked Pair)',
      hi: 'नेकेड पेयर (2 सेल में 2 उम्मीदवार)', ar: 'الزوج المكشوف (رقمين في خليتين)'
    },
    descs: {
      en: 'Two cells in a unit contain only the exact same 2 candidates. Because they share both digits 1:1, eliminate those 2 candidates from all other cells in the unit.',
      ko: '같은 줄/박스 내 두 칸이 오직 2개의 후보수만을 독점할 때, 두 칸이 각각 하나씩 나눠 가지므로 해당 영역의 나머지 모든 칸에서 두 후보수를 일괄 소거합니다.',
      ja: '同一ユニット内の2マスが全く同じ2つの候補数を独占する時、そのユニットの他のマスからその2つの候補数を一括消去します。',
      zh: '同一直線或宮內有 2 個格子僅包含相同的 2 個候選數，可排除該區域其餘格子的這 2 個數字。',
      'zh-CN': '同一直线或宫内有 2 个格子仅包含相同的 2 个候选数，可排除该区域其余格子的这 2 个数字。',
      es: 'Dos casillas de una línea o bloque contienen exactamente los mismos dos candidatos, lo que permite eliminarlos del resto de casillas.',
      de: 'Zwei Felder in einer Einheit enthalten genau dieselben 2 Kandidaten. Streichen Sie diese 2 Zahlen aus allen anderen Feldern der Einheit.',
      fr: 'Deux cases d’une unité contiennent exactement les 2 mêmes candidats. Éliminez ces 2 candidats de toutes les autres cases de l’unité.',
      pt: 'Duas casas em uma unidade contêm exatamente os mesmos 2 candidatos. Elimine esses 2 números de todas as outras casas da unidade.',
      it: 'Due caselle in un’unità contengono esattamente gli stessi 2 candidati. Elimina quei 2 numeri da tutte le altre caselle dell’unità.',
      ru: 'Две клетки содержат ровно одинаковые 2 кандидата. Исключите эти 2 цифры из всех остальных клеток строки, столбца или блока.',
      hi: 'एक इकाई के 2 सेल बिल्कुल समान 2 उम्मीदवार रखते हैं। उन 2 उम्मीदवारों को इकाई के अन्य सभी सेल से हटा दें।',
      ar: 'تحتوي خليتان في وحدة واحدة على نفس الرقمين المرشحين فقط. استبعد هذين الرقمين من جميع الخلايا الأخرى في نفس الوحدة.'
    }
  },
  'hidden-pair': {
    stage: 'stage2',
    badges: {
      en: 'Intermediate 2-4', ko: '중급 2-4', ja: '中級 2-4', zh: '中級 2-4', 'zh-CN': '中级 2-4',
      es: 'Media 2-4', de: 'Mittel 2-4', fr: 'Intermédiaire 2-4', pt: 'Intermediário 2-4',
      it: 'Intermedio 2-4', ru: 'Средний 2-4', hi: 'मध्यम 2-4', ar: 'متوسط 2-4'
    },
    titles: {
      en: 'Hidden Pair (Hidden Dual Locked)', ko: 'Hidden Pair (숨은 2개 쌍)', ja: 'ヒドゥンペア (隠れ2国同盟)',
      zh: '隱性數對 Hidden Pair (隱藏雙數)', 'zh-CN': '隐性数对 Hidden Pair (隐藏双数)',
      es: 'Hidden Pair (Pareja oculta)', de: 'Hidden Pair (Verstecktes Paar)',
      fr: 'Hidden Pair (Paire cachée)', pt: 'Hidden Pair (Par oculto)',
      it: 'Hidden Pair (Coppia nascosta)', ru: 'Скрытая пара (Hidden Pair)',
      hi: 'हिडन पेयर (छिपा हुआ जोड़ा)', ar: 'الزوج المخفي (رقمين مقفلين)'
    },
    descs: {
      en: 'Two specific digits appear in only two cells within a unit. Strip away all other unnecessary candidates from those two cells.',
      ko: '한 영역에서 특정 2개 숫자가 오직 두 칸에만 집중되어 있을 때, 다른 불필요한 잡동사니 후보수들을 지워 순수한 페어로 정제합니다.',
      ja: '特定の2つの数字がユニット内の2マスにしか入れない時、その2マスから他の余分な候補数を全て消去してペアを確定させます。',
      zh: '某 2 個數字在某區域中只出現在這 2 個格子內，將這 2 個格子中的其他多餘候選數全部刪除。',
      'zh-CN': '某 2 个数字在某区域中只出现在这 2 个格子内，将这 2 个格子中的其他多余候选数全部删除。',
      es: 'Dos números específicos solo aparecen en dos casillas de una unidad. Elimina todos los demás candidatos de esas dos casillas.',
      de: 'Zwei bestimmte Zahlen kommen in einer Einheit nur in zwei Feldern vor. Entfernen Sie alle anderen Kandidaten aus diesen beiden Feldern.',
      fr: 'Deux chiffres n’apparaissent que dans deux cases d’une unité. Supprimez tous les autres candidats de ces deux cases.',
      pt: 'Dois números aparecem apenas em duas casas de uma unidade. Remova todos os outros candidatos dessas duas casas.',
      it: 'Due numeri appaiono solo in due caselle di un’unità. Elimina tutti gli altri candidati superflui da quelle due caselle.',
      ru: 'Две цифры встречаются только в двух клетках блока или линии. Удалите все остальные лишние кандидаты из этих двух клеток.',
      hi: 'दो विशिष्ट अंक किसी इकाई के केवल दो सेल में आते हैं। उन दोनों सेल से अन्य सभी अनावश्यक उम्मीदवारों को हटा दें।',
      ar: 'يظهر رقمان محددان في خليتين فقط داخل الوحدة. قم بإزالة جميع الأرقام المرشحة الأخرى غير الضرورية من هاتين الخليتين.'
    }
  },
  'naked-triple': {
    stage: 'stage2',
    badges: {
      en: 'Intermediate 2-5', ko: '중급 2-5', ja: '中級 2-5', zh: '中級 2-5', 'zh-CN': '中级 2-5',
      es: 'Media 2-5', de: 'Mittel 2-5', fr: 'Intermédiaire 2-5', pt: 'Intermediário 2-5',
      it: 'Intermedio 2-5', ru: 'Средний 2-5', hi: 'मध्यम 2-5', ar: 'متوسط 2-5'
    },
    titles: {
      en: 'Naked Triple (3-Cell Locked Set)', ko: 'Naked Triple (단일 3개 조)', ja: 'ネイキッドトリプル (3国同盟)',
      zh: '顯性三數組 Naked Triple (3格鎖定3數)', 'zh-CN': '显性三数组 Naked Triple (3格锁定3数)',
      es: 'Trío Desnudo (Naked Triple)', de: 'Naked Triple (Offener Dreier)',
      fr: 'Naked Triple (Triplet nu)', pt: 'Naked Triple (Trinca exposta)',
      it: 'Naked Triple (Terna nuda)', ru: 'Открытая тройка (Naked Triple)',
      hi: 'नेकेड ट्रिपल (3 सेल में 3 उम्मीदवार)', ar: 'الثلاثي المكشوف (3 أرقام في 3 خلايا)'
    },
    descs: {
      en: 'Three cells in a unit contain subsets of the same 3 candidates (e.g. 12, 23, 13). Eliminate those 3 candidates from all other cells in the unit.',
      ko: '같은 줄/박스 내 세 칸이 오직 3개의 후보수 조합(예: 12, 23, 13)만을 독점할 때, 해당 영역의 다른 모든 칸에서 3개 후보수를 소거합니다.',
      ja: '同一ユニット内の3マスが3つの候補数の組み合わせ(例: 12, 23, 13)を独占する時、他のマスからその3つの数字を消去します。',
      zh: '同一直線或宮內有 3 個格子僅包含 3 個候選數的子集 (如 12, 23, 13)，可排除該區域其餘格子的這 3 個數字。',
      'zh-CN': '同一直线或宫内有 3 个格子仅包含 3 个候选数的子集 (如 12, 23, 13)，可排除该区域其余格子的这 3 个数字。',
      es: 'Tres casillas contienen combinaciones de los mismos 3 candidatos. Elimina esos 3 números del resto de casillas de la unidad.',
      de: 'Drei Felder teilen sich Teilmengen derselben 3 Kandidaten (z.B. 12, 23, 13). Löschen Sie diese 3 Zahlen aus allen anderen Feldern.',
      fr: 'Trois cases partagent des sous-ensembles des 3 mêmes candidats. Éliminez ces 3 chiffres de toutes les autres cases de l’unité.',
      pt: 'Três casas contêm subconjuntos dos mesmos 3 candidatos (ex: 12, 23, 13). Elimine esses 3 números das demais casas.',
      it: 'Tre caselle condividono sottoinsiemi degli stessi 3 candidati. Elimina quei 3 numeri da tutte le altre caselle dell’unità.',
      ru: 'Три клетки содержат подмножества одних и тех же 3 кандидатов. Удалите эти 3 цифры из всех остальных клеток области.',
      hi: 'तीन सेल समान 3 उम्मीदवारों के उपसमूह साझा करते हैं। इकाई के अन्य सभी सेल से उन 3 उम्मीदवारों को हटा दें।',
      ar: 'تحتوي ثلاث خلايا على مجموعات فرعية من نفس الأرقام الثلاثة المرشحة. استبعد تلك الأرقام الثلاثة من باقي خلايا الوحدة.'
    }
  },
  'hidden-triple': {
    stage: 'stage2',
    badges: {
      en: 'Intermediate 2-6', ko: '중급 2-6', ja: '中級 2-6', zh: '中級 2-6', 'zh-CN': '中级 2-6',
      es: 'Media 2-6', de: 'Mittel 2-6', fr: 'Intermédiaire 2-6', pt: 'Intermediário 2-6',
      it: 'Intermedio 2-6', ru: 'Средний 2-6', hi: 'मध्यम 2-6', ar: 'متوسط 2-6'
    },
    titles: {
      en: 'Hidden Triple (3 Hidden Digits)', ko: 'Hidden Triple (숨은 3개 조)', ja: 'ヒドゥントリプル (隠れ3国同盟)',
      zh: '隱性三數組 Hidden Triple (隱藏三數)', 'zh-CN': '隐性三数组 Hidden Triple (隐藏三数)',
      es: 'Trío Oculto (Hidden Triple)', de: 'Hidden Triple (Versteckter Dreier)',
      fr: 'Hidden Triple (Triplet caché)', pt: 'Hidden Triple (Trinca oculta)',
      it: 'Hidden Triple (Terna nascosta)', ru: 'Скрытая тройка (Hidden Triple)',
      hi: 'हिडन ट्रिपल (3 छिपे हुए अंक)', ar: 'الثلاثي المخفي (3 أرقام مقفلة)'
    },
    descs: {
      en: 'Three specific digits appear in only three cells within a unit. Strip away all other candidates from those three cells.',
      ko: '한 줄이나 박스에서 특정 3개 숫자가 오직 3개 칸에만 나타날 때, 그 세 칸에서 다른 불필요한 후보수를 모두 제거합니다.',
      ja: '特定の3つの数字がユニット内の3マスにしか出現しない時、その3マスから他の全ての候補数を消去します。',
      zh: '某 3 個數字在區域內只出現在這 3 個格子中，將這 3 個格子中的其他多餘候選數全部清除。',
      'zh-CN': '某 3 个数字在区域内只出现在这 3 个格子中，将这 3 个格子中的其他多余候选数全部清除。',
      es: 'Tres números específicos solo aparecen en tres casillas de una unidad. Elimina todos los demás candidatos de esas 3 casillas.',
      de: 'Drei bestimmte Zahlen kommen in einer Einheit nur in drei Feldern vor. Entfernen Sie alle anderen Kandidaten aus diesen 3 Feldern.',
      fr: 'Trois chiffres n’apparaissent que dans trois cases d’une unité. Supprimez tous les autres candidats de ces 3 cases.',
      pt: 'Três números específicos aparecem apenas em 3 casas de uma unidade. Remova todos os outros candidatos dessas 3 casas.',
      it: 'Tre numeri specifici appaiono solo in tre caselle di un’unità. Elimina tutti gli अन्य candidati da quelle tre caselle.',
      ru: 'Три цифры встречаются только в трех клетках области. Удалите все остальные кандидаты из этих трех клеток.',
      hi: 'तीन विशिष्ट अंक केवल तीन सेल में आते हैं। उन तीनों सेल से अन्य सभी उम्मीदवारों को हटा दें।',
      ar: 'تظهر ثلاثة أرقام محددة في 3 خلايا فقط داخل الوحدة. احذف جميع المرشحات الأخرى من تلك الخلايا الثلاث.'
    }
  },
  'naked-quad': {
    stage: 'stage2',
    badges: {
      en: 'Intermediate 2-7', ko: '중급 2-7', ja: '中級 2-7', zh: '中級 2-7', 'zh-CN': '中级 2-7',
      es: 'Media 2-7', de: 'Mittel 2-7', fr: 'Intermédiaire 2-7', pt: 'Intermediário 2-7',
      it: 'Intermedio 2-7', ru: 'Средний 2-7', hi: 'मध्यम 2-7', ar: 'متوسط 2-7'
    },
    titles: {
      en: 'Naked Quad (4-Cell Subset)', ko: 'Naked Quad (단일 4개 조)', ja: 'ネイキッドクアッド (4国同盟)',
      zh: '顯性四數組 Naked Quad (4格鎖定4數)', 'zh-CN': '显性四数组 Naked Quad (4格锁定4数)',
      es: 'Cuarteto Desnudo (Naked Quad)', de: 'Naked Quad (Offener Vierer)',
      fr: 'Naked Quad (Quadruplet nu)', pt: 'Naked Quad (Quadra exposta)',
      it: 'Naked Quad (Quaterna nuda)', ru: 'Открытая четверка (Naked Quad)',
      hi: 'नेके드 क्वाड (4 सेल में 4 उम्मीदवार)', ar: 'الرباعي المكشوف (4 أرقام في 4 خلايا)'
    },
    descs: {
      en: 'Four cells in a unit contain subsets of the same 4 candidates. Eliminate those 4 candidates from all other cells in the unit.',
      ko: '같은 줄/박스 내 4개 칸이 오직 4개 후보수만을 독점할 때, 해당 영역의 다른 모든 칸에서 4개 후보수를 일괄 제거합니다.',
      ja: '同一ユニット内の4マスが4つの候補数を独占する時、他のマスからその4つの数字を一括消去します。',
      zh: '同一直線或宮內有 4 個格子僅包含 4 個候選數的子集，可排除該區域其餘格子的這 4 個數字。',
      'zh-CN': '同一直线或宫内有 4 个格子仅包含 4 个候选数的子集，可排除该区域其余格子的这 4 个数字。',
      es: 'Cuatro casillas contienen combinaciones de los mismos 4 candidatos. Elimina esos 4 números del resto de la unidad.',
      de: 'Vier Felder teilen sich Teilmengen derselben 4 Kandidaten. Löschen Sie diese 4 Zahlen aus allen anderen Feldern.',
      fr: 'Quatre cases partagent des sous-ensembles des 4 mêmes candidats. Éliminez ces 4 chiffres de toutes les autres cases.',
      pt: 'Quatro casas contêm subconjuntos dos mesmos 4 candidatos. Elimine esses 4 números das demais casas da unidade.',
      it: 'Quattro caselle condividono sottoinsiemi degli stessi 4 candidati. Elimina quei 4 numeri da tutte le altre caselle.',
      ru: 'Четыре клетки делят между собой 4 кандидата. Исключите эти 4 цифры из всех остальных клеток области.',
      hi: 'चार सेल समान 4 उम्मीदवारों को साझा करते हैं। इकाई के अन्य सेल से उन 4 उम्मीदवारों को हटा दें।',
      ar: 'تحتوي أربع خلايا على مجموعات فرعية من نفس الأرقام الأربعة. استبعد تلك الأرقام من بقية خلايا الوحدة.'
    }
  },
  'hidden-quad': {
    stage: 'stage2',
    badges: {
      en: 'Intermediate 2-8', ko: '중급 2-8', ja: '中級 2-8', zh: '中級 2-8', 'zh-CN': '中级 2-8',
      es: 'Media 2-8', de: 'Mittel 2-8', fr: 'Intermédiaire 2-8', pt: 'Intermediário 2-8',
      it: 'Intermedio 2-8', ru: 'Средний 2-8', hi: 'मध्यम 2-8', ar: 'متوسط 2-8'
    },
    titles: {
      en: 'Hidden Quad (4 Hidden Digits)', ko: 'Hidden Quad (숨은 4개 조)', ja: 'ヒドゥンクアッド (隠れ4国同盟)',
      zh: '隱性四數組 Hidden Quad (隱藏四數)', 'zh-CN': '隐性四数组 Hidden Quad (隐藏四数)',
      es: 'Cuarteto Oculto (Hidden Quad)', de: 'Hidden Quad (Versteckter Vierer)',
      fr: 'Hidden Quad (Quadruplet caché)', pt: 'Hidden Quad (Quadra oculta)',
      it: 'Hidden Quad (Quaterna nascosta)', ru: 'Скрытая четверка (Hidden Quad)',
      hi: 'हिडन क्वाड (4 छिपे हुए अंक)', ar: 'الرباعي المخفي (4 أرقام مقفلة)'
    },
    descs: {
      en: 'Four specific digits appear in only four cells within a unit. Strip away all other candidates from those four cells.',
      ko: '한 줄이나 박스에서 특정 4개 숫자가 오직 4개 칸에만 집중되어 있을 때, 그 네 칸에서 잡동사니 후보수를 전부 소거합니다.',
      ja: '特定の4つの数字がユニット内の4マスにしか入れない時、その4マスから他の余分な候補数を全て消去します。',
      zh: '某 4 個數字在區域內只出現在這 4 個格子中，將這 4 個格子中的其他多餘候選數全部刪除。',
      'zh-CN': '某 4 个数字在区域内只出现在这 4 个格子中，将这 4 个格子中的其他多余候选数全部删除。',
      es: 'Cuatro números específicos solo aparecen en 4 casillas de una unidad. Elimina todos los demás candidatos de esas 4 casillas.',
      de: 'Vier bestimmte Zahlen kommen in einer Einheit nur in vier Feldern vor. Entfernen Sie alle anderen Kandidaten aus diesen 4 Feldern.',
      fr: 'Quatre chiffres n’apparaissent que dans quatre cases d’une unité. Supprimez tous les autres candidats de ces 4 cases.',
      pt: 'Quatro números específicos aparecem apenas em 4 casas de uma unidade. Remova todos os outros candidatos dessas 4 casas.',
      it: 'Quattro numeri appaiono solo in quattro caselle di un’unità. Elimina tutti gli altri candidati da quelle 4 caselle.',
      ru: 'Четыре цифры встречаются только в четырех клетках области. Удалите все остальные кандидаты из этих четырех клеток.',
      hi: 'चार विशिष्ट अंक केवल चार सेल में आते हैं। उन चारों सेल से अन्य सभी उम्मीदवारों को हटा दें।',
      ar: 'تظهر أربعة أرقام محددة في 4 خلايا فقط داخل الوحدة. قم بإزالة جميع المرشحات الأخرى من تلك الخلايا الأربع.'
    }
  },

  // STAGE 3 (3-1 ~ 3-6)
  'x-wing': {
    stage: 'stage3',
    badges: {
      en: 'Advanced 3-1', ko: '고급 3-1', ja: '上級 3-1', zh: '高級 3-1', 'zh-CN': '高级 3-1',
      es: 'Avanzada 3-1', de: 'Fortgeschritten 3-1', fr: 'Avancé 3-1', pt: 'Avançado 3-1',
      it: 'Avanzato 3-1', ru: 'Продвинутый 3-1', hi: 'उन्नत 3-1', ar: 'متقدم 3-1'
    },
    titles: {
      en: 'X-Wing (2x2 Rectangle Elimination)', ko: 'X-Wing (2x2 직사각형 소거법)', ja: 'X-Wing (X-ウィング)',
      zh: 'X翼數對 X-Wing (2x2 矩形排除)', 'zh-CN': 'X翼数对 X-Wing (2x2 矩形排除)',
      es: 'X-Wing (Eliminación en rectángulo)', de: 'X-Wing (2x2 Rechteck-Ausschluss)',
      fr: 'X-Wing (Élimination en rectangle 2x2)', pt: 'X-Wing (Eliminação em retângulo 2x2)',
      it: 'X-Wing (Eliminazione rettangolare 2x2)', ru: 'X-Wing (Прямоугольник 2x2)',
      hi: 'एक्स-विंग (2x2 आयत निष्कासन)', ar: 'جناح إكس (استبعاد مستطيل 2x2)'
    },
    descs: {
      en: 'A candidate appears in only 2 columns across 2 rows, forming a rectangle. Eliminate that candidate from all other cells in those 2 columns.',
      ko: '2개의 가로행에서 특정 후보수가 오직 2개 세로열 위치에만 나타나 직사각형을 형성할 때, 두 세로열의 다른 모든 칸에서 해당 후보수를 소거합니다.',
      ja: '2つの行で特定の候補数が全く同じ2つの列にのみ存在する時、その2つの列の他のマスからその候補数を一括消去します。',
      zh: '某候選數在 2 個行中恰好出現在相同的 2 個列上構成矩形，可排除這 2 個列中其他位置的該候選數。',
      'zh-CN': '某候选数在 2 个行中恰好出现在相同的 2 个列上构成矩形，可排除这 2 个列中其他位置的该候选数。',
      es: 'Un candidato aparece en solo 2 columnas a lo largo de 2 filas formando un rectángulo. Elimínalo del resto de casillas de esas 2 columnas.',
      de: 'Ein Kandidat erscheint in 2 Zeilen in genau denselben 2 Spalten (Rechteck). Löschen Sie ihn aus allen anderen Feldern dieser 2 Spalten.',
      fr: 'Un candidat n’apparaît que dans 2 colonnes sur 2 lignes (rectangle). Éliminez ce candidat de toutes les autres cases de ces 2 colonnes.',
      pt: 'Um candidato aparece em apenas 2 colunas em 2 linhas, formando um retângulo. Elimine-o das outras casas dessas 2 colunas.',
      it: 'Un candidato appare solo in 2 colonne su 2 righe (rettangolo). Eliminalo da tutte le altre caselle di quelle 2 colonne.',
      ru: 'Кандидат появляется ровно в 2 столбцах в 2 строках (прямоугольник). Удалите его из всех остальных клеток этих двух столбцов.',
      hi: 'कोई उम्मीदवार 2 पंक्तियों में ठीक 2 स्तंभों में आता है (आयत)। उन 2 स्तंभों के अन्य सभी सेल से उस उम्मीदवार को हटा दें।',
      ar: 'يظهر رقم مرشح في عمودين فقط عبر صفين مشكلاً مستطيلاً. استبعد ذلك الرقم من جميع الخلايا الأخرى في هذين العمودين.'
    }
  },
  'y-wing': {
    stage: 'stage3',
    badges: {
      en: 'Advanced 3-2', ko: '고급 3-2', ja: '上級 3-2', zh: '高級 3-2', 'zh-CN': '高级 3-2',
      es: 'Avanzada 3-2', de: 'Fortgeschritten 3-2', fr: 'Avancé 3-2', pt: 'Avançado 3-2',
      it: 'Avanzato 3-2', ru: 'Продвинутый 3-2', hi: 'उन्नत 3-2', ar: 'متقدم 3-2'
    },
    titles: {
      en: 'XY-Wing / Y-Wing', ko: 'XY-Wing / Y-Wing', ja: 'Y-Wing (XY-ウィング)',
      zh: 'Y翼數對 XY-Wing / Y-Wing', 'zh-CN': 'Y翼数对 XY-Wing / Y-Wing',
      es: 'XY-Wing / Y-Wing', de: 'XY-Wing / Y-Wing',
      fr: 'XY-Wing / Y-Wing', pt: 'XY-Wing / Y-Wing',
      it: 'XY-Wing / Y-Wing', ru: 'XY-Wing / Y-Wing',
      hi: 'एक्सवाई-विंग / वाई-विंग', ar: 'جناح واي / XY-Wing'
    },
    descs: {
      en: 'A pivot cell (AB) connects to two pincers (AC, BC). Any cell that sees both pincers cannot contain candidate C.',
      ko: '피벗(AB)과 두 날개(AC, BC)가 연결될 때, 두 날개가 공통으로 바라보는 모든 교차 칸에서 공통 후보수 C를 제거합니다.',
      ja: 'ピボット(AB)と2つのウィング(AC, BC)が連結する時、両方のウィングから同時に見通せるマスから共通候補数Cを消去します。',
      zh: '一個樞紐格 (AB) 連接兩個翼端 (AC, BC)。任何同時看到這兩個翼端的格子都不能包含候選數 C。',
      'zh-CN': '一个枢纽格 (AB) 连接两个翼端 (AC, BC)。任何同时看到这两个翼端的格子都不能包含候选数 C。',
      es: 'Una casilla pivote (AB) se conecta a dos extremos (AC, BC). Cualquier casilla que vea ambos extremos no puede contener C.',
      de: 'Ein Drehpunkt (AB) verbindet zwei Flügel (AC, BC). Jedes Feld, das beide Flügel sieht, kann die gemeinsame Zahl C nicht enthalten.',
      fr: 'Une case pivot (AB) est liée à deux pinces (AC, BC). Toute case voyant les deux pinces ne peut pas contenir le candidat C.',
      pt: 'Uma casa pivô (AB) conecta duas asas (AC, BC). Qualquer casa que veja ambas as asas não pode conter o candidato C.',
      it: 'Una casella perno (AB) collega due ali (AC, BC). Qualsiasi casella che vede entrambe le ali non può contenere il candidato C.',
      ru: 'Опорная клетка (AB) соединена с двумя крыльями (AC, BC). Любая клетка, видящая оба крыла, не может содержать кандидата C.',
      hi: 'एक पिवट सेल (AB) दो विंग्स (AC, BC) को जोड़ती है। दोनों विंग्स को देखने वाली कोई भी सेल उम्मीदवार C नहीं रख सकती।',
      ar: 'خلية محور (AB) تتصل بجناحين (AC, BC). أي خلية ترى كلا الجناحين لا يمكن أن تحتوي على الرقم المرشح المشترك C.'
    }
  },
  'xyz-wing': {
    stage: 'stage3',
    badges: {
      en: 'Advanced 3-3', ko: '고급 3-3', ja: '上級 3-3', zh: '高級 3-3', 'zh-CN': '高级 3-3',
      es: 'Avanzada 3-3', de: 'Fortgeschritten 3-3', fr: 'Avancé 3-3', pt: 'Avançado 3-3',
      it: 'Avanzato 3-3', ru: 'Продвинутый 3-3', hi: 'उन्नत 3-3', ar: 'متقدم 3-3'
    },
    titles: {
      en: 'XYZ-Wing (3-Candidate Pivot)', ko: 'XYZ-Wing (3후보 피벗)', ja: 'XYZ-Wing (XYZ-ウィング)',
      zh: 'XYZ翼數組 XYZ-Wing (三候選樞紐)', 'zh-CN': 'XYZ翼数组 XYZ-Wing (三候选枢纽)',
      es: 'XYZ-Wing (Pivote de 3 candidatos)', de: 'XYZ-Wing (3-Kandidaten-Pivot)',
      fr: 'XYZ-Wing (Pivot à 3 candidats)', pt: 'XYZ-Wing (Pivô de 3 candidatos)',
      it: 'XYZ-Wing (Perno a 3 candidati)', ru: 'XYZ-Wing (Тройной пивот)',
      hi: 'एक्सवाईज़ेड-विंग (3-उम्मीदवार पिवट)', ar: 'جناح XYZ (محور ثلاثي)'
    },
    descs: {
      en: 'A 3-candidate pivot (XYZ) connects to two bi-value pincers (XZ, YZ). Eliminate candidate Z from cells seen by all 3 cells.',
      ko: '3개 후보수 피벗(XYZ)과 두 날개(XZ, YZ)가 만날 때, 피벗과 두 날개가 동시에 공유하는 교차 칸에서 후보수 Z를 제거합니다.',
      ja: '3つの候補数を持つピボット(XYZ)と2つのウィング(XZ, YZ)が結合し、3マス全てから見通せるマスから候補数Zを消去します。',
      zh: '三候選樞紐格 (XYZ) 與兩個雙值翼端 (XZ, YZ) 結合，在同時被這 3 格看見的交叉格中排除候選數 Z。',
      'zh-CN': '三候选枢纽格 (XYZ) 与两个双值翼端 (XZ, YZ) 结合，在同时被这 3 格看见的交叉格中排除候选数 Z。',
      es: 'Un pivote de 3 candidatos (XYZ) se conecta a dos extremos (XZ, YZ). Elimina Z de las casillas vistas por las 3 casillas a la vez.',
      de: 'Ein 3er-Pivot (XYZ) verbindet zwei Flügel (XZ, YZ). Löschen Sie Z aus Feldern, die von allen 3 Feldern gleichzeitig gesehen werden.',
      fr: 'Un pivot à 3 candidats (XYZ) est lié à deux pinces (XZ, YZ). Éliminez Z des cases vues simultanément par les 3 cases.',
      pt: 'Um pivô de 3 candidatos (XYZ) conecta duas asas (XZ, YZ). Elimine Z das casas vistas pelas 3 casas ao mesmo tempo.',
      it: 'Un perno a 3 candidati (XYZ) collega due ali (XZ, YZ). Elimina Z dalle caselle viste contemporaneamente da tutte e 3 le caselle.',
      ru: 'Опора из 3 кандидатов (XYZ) соединена с двумя крыльями (XZ, YZ). Удалите Z из клеток, видимых всеми тремя клетками сразу.',
      hi: '3-उम्मीदवार पिवट (XYZ) दो विंग्स (XZ, YZ) से जुड़ता है। तीनों सेलों द्वारा एक साथ देखी जाने वाली सेल से Z को हटा दें।',
      ar: 'خلية محور ثلاثية (XYZ) تتصل بجناحين (XZ, YZ). يتم استبعاد الرقم Z من الخلايا التي تراها الخلايا الثلاث معاً.'
    }
  },
  'w-wing': {
    stage: 'stage3',
    badges: {
      en: 'Advanced 3-4', ko: '고급 3-4', ja: '上級 3-4', zh: '高級 3-4', 'zh-CN': '高级 3-4',
      es: 'Avanzada 3-4', de: 'Fortgeschritten 3-4', fr: 'Avancé 3-4', pt: 'Avançado 3-4',
      it: 'Avanzato 3-4', ru: 'Продвинутый 3-4', hi: 'उन्नत 3-4', ar: 'متقدم 3-4'
    },
    titles: {
      en: 'W-Wing (Strong Link Bridge)', ko: 'W-Wing (강한 연결 브릿지)', ja: 'W-Wing (W-ウィング)',
      zh: 'W翼數對 W-Wing (強鏈橋接)', 'zh-CN': 'W翼数对 W-Wing (强链桥接)',
      es: 'W-Wing (Puente de enlace fuerte)', de: 'W-Wing (Starke-Verbindung-Brücke)',
      fr: 'W-Wing (Pont de lien fort)', pt: 'W-Wing (Ponte de ligação forte)',
      it: 'W-Wing (Ponte di legame forte)', ru: 'W-Wing (Мост сильной связи)',
      hi: 'डब्ल्यू-विंग (मजबूत लिंक ब्रिज)', ar: 'جناح دبليو (جسر الرابط القوي)'
    },
    descs: {
      en: 'Two identical bi-value cells (AB) are bridged by a strong link on digit B. Eliminate candidate A from any cell seeing both AB cells.',
      ko: '동일한 2개 후보수(AB)를 가진 두 칸이 특정 줄의 강한 연결(B)로 이어질 때, 두 AB 칸이 동시에 바라보는 교차 칸에서 A를 소거합니다.',
      ja: '同じ2つの候補数(AB)を持つ2マスが数字Bの強リンクで結ばれる時、両方のABマスから見通せるマスから候補数Aを消去します。',
      zh: '兩個相同的雙值格 (AB) 透過數字 B 的強鏈連接。任何同時看見這兩個 AB 格的格子皆可排除候選數 A。',
      'zh-CN': '两个相同的双值格 (AB) 通过数字 B 的强链连接。任何同时看见这两个 AB 格的格子皆可排除候选数 A。',
      es: 'Dos casillas con los mismos 2 candidatos (AB) se conectan mediante un enlace fuerte en B. Elimina A de las casillas que ven a ambas.',
      de: 'Zwei identische 2er-Felder (AB) sind über eine starke Verbindung auf Zahl B verknüpft. Löschen Sie A aus Feldern, die beide AB-Felder sehen.',
      fr: 'Deux cases identiques (AB) sont reliées par un lien fort sur B. Éliminez A de toute case voyant les deux cases AB.',
      pt: 'Duas casas idênticas (AB) são conectadas por uma ligação forte no dígito B. Elimine A de qualquer casa que veja ambas.',
      it: 'Due caselle identiche (AB) sono collegate da un legame forte sul numero B. Elimina A dalle caselle che vedono entrambe.',
      ru: 'Две одинаковые клетки (AB) связаны сильной связью по цифре B. Удалите A из любой клетки, видящей обе клетки AB.',
      hi: 'समान दोहरे उम्मीदवार (AB) अंक B के मजबूत लिंक से जुड़े हैं। दोनों AB सेलों को देखने वाली सेल से A को हटा दें।',
      ar: 'ترتبط خليتان ثنائيتان متطابقتان (AB) برابط قوي على الرقم B. استبعد الرقم A من أي خلية ترى كلتا خليتي AB.'
    }
  },
  'bug': {
    stage: 'stage3',
    badges: {
      en: 'Advanced 3-5', ko: '고급 3-5', ja: '上級 3-5', zh: '高級 3-5', 'zh-CN': '高级 3-5',
      es: 'Avanzada 3-5', de: 'Fortgeschritten 3-5', fr: 'Avancé 3-5', pt: 'Avançado 3-5',
      it: 'Avanzato 3-5', ru: 'Продвинутый 3-5', hi: 'उन्नत 3-5', ar: 'متقدم 3-5'
    },
    titles: {
      en: 'Bivalent Universal Grave (BUG+1)', ko: 'BUG+1 (이원 치명적 패턴)', ja: 'BUG+1 (バイレント・ユニバーサル・グレイブ)',
      zh: '全雙值致命結構 BUG+1', 'zh-CN': '全双值致命结构 BUG+1',
      es: 'BUG+1 (Patrón bivalente universal)', de: 'BUG+1 (Bivalentes Universalgrab)',
      fr: 'BUG+1 (Structure bivalente)', pt: 'BUG+1 (Padrão bivalente universal)',
      it: 'BUG+1 (Struttura bivalente)', ru: 'BUG+1 (Универсальная бивалентная ловушка)',
      hi: 'बीयूजी+1 (द्वि-मूल्य घातक पैटर्न)', ar: 'BUG+1 (النمط الثنائي القاتل)'
    },
    descs: {
      en: 'When all remaining cells have 2 candidates except one cell with 3 candidates, that tri-value cell must be the digit appearing 3 times in its units.',
      ko: '모든 빈칸이 2개 후보수이고 오직 한 칸만 3개 후보수를 가질 때, 스도쿠의 유일한 해를 위해 해당 칸은 3번 등장하는 숫자로 즉시 확정됩니다.',
      ja: '全ての空きマスが2候補で1マスだけ3候補を持つ時、唯一解を保つためその3候補マスには3回出現する数字が確定します。',
      zh: '當所有未填空格皆為 2 個候選數、僅有 1 格為 3 個候選數時，為避免多解，該 3 候選數格必填入在行列宮中出現 3 次的數字。',
      'zh-CN': '当所有未填空格皆为 2 个候选数、仅有 1 格为 3 个候选数时，为避免多解，该 3 候选数格必填入在行列宫中出现 3 次的数字。',
      es: 'Cuando todas las casillas tienen 2 candidatos excepto una con 3, esa casilla tri-valor debe ser el número que aparece 3 veces en su unidad.',
      de: 'Wenn alle Felder 2 Kandidaten haben bis auf genau ein Feld mit 3 Kandidaten, ist dieses 3er-Feld sofort die Zahl, die dreimal vorkommt.',
      fr: 'Quand toutes les cases ont 2 candidats sauf une avec 3, cette case doit prendre le chiffre qui apparaît 3 fois dans ses unités.',
      pt: 'Quando todas as casas têm 2 candidatos exceto uma com 3, essa casa tri-valor deve ser o dígito que aparece 3 vezes na unidade.',
      it: 'Quando tutte le caselle hanno 2 candidati tranne una con 3, quella casella deve contenere il numero che appare 3 volte nell’unità.',
      ru: 'Когда все клетки имеют по 2 кандидата и только одна имеет 3, в эту клетку сразу ставится цифра, встречающаяся 3 раза в её зоне.',
      hi: 'जब सभी सेलों में 2 उम्मीदवार हों और केवल एक सेल में 3 उम्मीदवार हों, तो वह सेल वही अंक होगी जो क्षेत्र में 3 बार आता है।',
      ar: 'عندما تحتوي جميع الخلايا على مرشحين اثنين فقط ما عدا خلية واحدة بها 3 مرشحات، فإن تلك الخلية تأخذ الرقم الذي يتكرر 3 مرات.'
    }
  },
  'remote-pairs': {
    stage: 'stage3',
    badges: {
      en: 'Advanced 3-6', ko: '고급 3-6', ja: '上級 3-6', zh: '高級 3-6', 'zh-CN': '高级 3-6',
      es: 'Avanzada 3-6', de: 'Fortgeschritten 3-6', fr: 'Avancé 3-6', pt: 'Avançado 3-6',
      it: 'Avanzato 3-6', ru: 'Продвинутый 3-6', hi: 'उन्नत 3-6', ar: 'متقدم 3-6'
    },
    titles: {
      en: 'Remote Pairs (Chain Elimination)', ko: 'Remote Pairs (원격 쌍 체인)', ja: 'リモートペア (遠隔ペア連鎖)',
      zh: '遠程數對 Remote Pairs (長鏈排除)', 'zh-CN': '远程数对 Remote Pairs (长链排除)',
      es: 'Remote Pairs (Pares remotos en cadena)', de: 'Remote Pairs (Ketten-Ausschluss)',
      fr: 'Remote Pairs (Paires distantes en chaîne)', pt: 'Remote Pairs (Pares remotos em cadeia)',
      it: 'Remote Pairs (Coppie remote a catena)', ru: 'Удаленные пары (Remote Pairs)',
      hi: 'रिमोट पेयर्स (चेन एलिमिनेशन)', ar: 'الأزواج البعيدة (استبعاد السلسلة)'
    },
    descs: {
      en: 'An even-length chain of identical bi-value cells (AB) alternates parity. Any cell seeing both ends of the chain cannot contain A or B.',
      ko: '동일한 2개 후보수(AB)를 가진 셀들이 짝수 길이 체인으로 연결될 때, 체인의 양 끝 셀이 동시에 만나는 모든 칸에서 A와 B를 모두 소거합니다.',
      ja: '同じ2候補(AB)のマスが偶数長の連鎖で結ばれる時、連鎖の両端のマスを同時に見通せる全てのマスからAとBの両方を消去します。',
      zh: '由相同雙值格 (AB) 組成的偶數長度鏈，任何同時看到鏈條兩端的格子，皆可同時排除候選數 A 和 B。',
      'zh-CN': '由相同双值格 (AB) 组成的偶数长度链，任何同时看到链条两端的格子，皆可同时排除候选数 A 和 B。',
      es: 'Una cadena de longitud par de casillas idénticas (AB) alterna polaridad. Las casillas que ven ambos extremos no pueden tener A ni B.',
      de: 'Eine Kette gerader Länge aus identischen 2er-Feldern (AB) wechselt die Belegung. Felder, die beide Kettenenden sehen, enthalten weder A noch B.',
      fr: 'Une chaîne de longueur paire de cases identiques (AB) alterne la polarité. Les cases voyant les deux bouts ne peuvent contenir ni A ni B.',
      pt: 'Uma cadeia de comprimento par de casas idênticas (AB) alterna paridade. Casas que veem ambas as pontas não contêm A nem B.',
      it: 'Una catena di lunghezza pari di caselle identiche (AB) alterna parità. Le caselle che vedono entrambi i capi non contengono né A né B.',
      ru: 'Четная цепочка одинаковых клеток (AB) чередует значения. Клетки, видящие оба конца цепи, не могут содержать ни A, ни B.',
      hi: 'समान दोहरे सेलों (AB) की सम-लंबाई वाली श्रृंखला। दोनों सिरों को देखने वाली सेल से A और B दोनों को हटा दें।',
      ar: 'سلسلة زوجية الطول من خلايا ثنائية متطابقة (AB). أي خلية ترى طرفي السلسلة معاً لا يمكن أن تحتوي على A أو B.'
    }
  },

  // STAGE 4 (4-1 ~ 4-8)
  'swordfish': {
    stage: 'stage4',
    badges: {
      en: 'Master 4-1', ko: '마스터 4-1', ja: '名人 4-1', zh: '大師 4-1', 'zh-CN': '大师 4-1',
      es: 'Maestría 4-1', de: 'Meister 4-1', fr: 'Maître 4-1', pt: 'Mestre 4-1',
      it: 'Maestro 4-1', ru: 'Мастер 4-1', hi: 'मास्टर 4-1', ar: 'خبير 4-1'
    },
    titles: {
      en: 'Swordfish (3x3 Grid Pattern)', ko: 'Swordfish (3x3 소드피시)', ja: 'ソードフィッシュ (3x3格子網)',
      zh: '劍魚數對 Swordfish (3x3 網格排除)', 'zh-CN': '剑鱼数对 Swordfish (3x3 网格排除)',
      es: 'Swordfish (Patrón de rejilla 3x3)', de: 'Swordfish (3x3 Gittermuster)',
      fr: 'Swordfish (Grille 3x3)', pt: 'Swordfish (Padrão 3x3)',
      it: 'Swordfish (Griglia 3x3)', ru: 'Рыба-меч (Swordfish 3x3)',
      hi: 'स्वॉर्डफिश (3x3 ग्रिड पैटर्न)', ar: 'سمكة السيف (شبكة 3x3)'
    },
    descs: {
      en: 'A candidate appears in at most 3 columns across 3 rows. Eliminate that candidate from all other cells in those 3 columns.',
      ko: '3개의 행에서 특정 후보수가 최대 3개의 동일 열에만 배치될 때, 해당 3개 열의 다른 모든 위치에서 그 후보수를 일괄 소거합니다.',
      ja: '3つの行において特定の候補数が最大3つの同一列にのみ存在する時、その3つの列の他のマスから候補数を一括消去します。',
      zh: '某候選數在 3 個行中恰好僅分佈在相同的 3 個列上，可將這 3 個列其餘位置的該候選數全數排除。',
      'zh-CN': '某候选数在 3 个行中恰好仅分布在相同的 3 个列上，可将这 3 个列其余位置的该候选数全数排除。',
      es: 'Un candidato aparece en como máximo 3 columnas en 3 filas. Elimínalo de todas las demás casillas de esas 3 columnas.',
      de: 'Ein Kandidat erscheint in 3 Zeilen in maximal denselben 3 Spalten. Löschen Sie ihn aus allen anderen Feldern dieser 3 Spalten.',
      fr: 'Un candidat apparaît dans 3 colonnes sur 3 lignes. Éliminez ce candidat de toutes les autres cases de ces 3 colonnes.',
      pt: 'Um candidato aparece em no máximo 3 colunas em 3 linhas. Elimine-o de todas as outras casas dessas 3 colunas.',
      it: 'Un candidato appare al massimo in 3 colonne su 3 righe. Eliminalo da tutte le altre caselle di quelle 3 colonne.',
      ru: 'Кандидат появляется максимум в 3 столбцах в 3 строках. Удалите его из всех остальных клеток этих трех столбцов.',
      hi: 'कोई उम्मीदवार 3 पंक्तियों में अधिकतम 3 समान स्तंभों में आता है। उन 3 स्तंभों के अन्य सभी सेल से उसे हटा दें।',
      ar: 'يظهر رقم مرشح في 3 أعمدة كحد أقصى عبر 3 صفوف. استبعد ذلك الرقم من جميع الخلايا الأخرى في تلك الأعمدة الثلاثة.'
    }
  },
  'jellyfish': {
    stage: 'stage4',
    badges: {
      en: 'Master 4-2', ko: '마스터 4-2', ja: '名人 4-2', zh: '大師 4-2', 'zh-CN': '大师 4-2',
      es: 'Maestría 4-2', de: 'Meister 4-2', fr: 'Maître 4-2', pt: 'Mestre 4-2',
      it: 'Maestro 4-2', ru: 'Мастер 4-2', hi: 'मास्टर 4-2', ar: 'خبير 4-2'
    },
    titles: {
      en: 'Jellyfish (4x4 Grid Pattern)', ko: 'Jellyfish (4x4 젤리피시)', ja: 'ジェリーフィッシュ (4x4格子網)',
      zh: '水母數組 Jellyfish (4x4 矩陣排除)', 'zh-CN': '水母数组 Jellyfish (4x4 矩阵排除)',
      es: 'Jellyfish (Patrón de rejilla 4x4)', de: 'Jellyfish (4x4 Gittermuster)',
      fr: 'Jellyfish (Grille 4x4)', pt: 'Jellyfish (Padrão 4x4)',
      it: 'Jellyfish (Griglia 4x4)', ru: 'Медуза (Jellyfish 4x4)',
      hi: 'जेलीफिश (4x4 ग्रिड पैटर्न)', ar: 'قنديل البحر (شبكة 4x4)'
    },
    descs: {
      en: 'A candidate is confined to 4 columns across 4 rows. Eliminate that candidate from all other cells in those 4 columns.',
      ko: '4개의 행에서 특정 후보수가 동일한 4개 열에만 한정될 때, 그 4개 열의 나머지 모든 칸에서 후보수를 소거합니다.',
      ja: '4つの行において特定の候補数が全く同じ4つの列にのみ制限される時、その4つの列の他のマスから候補数を消去します。',
      zh: '某候選數在 4 個行中僅出現在相同的 4 個列上，可將這 4 個列其他位置的該候選數全數刪除。',
      'zh-CN': '某候选数在 4 个行中仅出现在相同的 4 个列上，可将这 4 个列其他位置的该候选数全数删除。',
      es: 'Un candidato se limita a 4 columnas a lo largo de 4 filas. Elimínalo de todas las demás casillas de esas 4 columnas.',
      de: 'Ein Kandidat ist in 4 Zeilen auf dieselben 4 Spalten beschränkt. Löschen Sie ihn aus allen anderen Feldern dieser 4 Spalten.',
      fr: 'Un candidat est confiné à 4 colonnes sur 4 lignes. Éliminez ce candidat de toutes les autres cases de ces 4 colonnes.',
      pt: 'Um candidato está restrito a 4 colunas em 4 linhas. Elimine-o de todas as outras casas dessas 4 colunas.',
      it: 'Un candidato è confinato in 4 colonne su 4 righe. Eliminalo da tutte le altre caselle di quelle 4 colonne.',
      ru: 'Кандидат ограничен 4 столбцами в 4 строках. Удалите его из всех остальных клеток этих четырех столбцов.',
      hi: 'कोई उम्मीदवार 4 पंक्तियों में 4 समान स्तंभों तक सीमित है। उन 4 स्तंभों के अन्य सभी सेल से उसे हटा दें।',
      ar: 'ينحصر رقم مرشح في 4 أعمدة عبر 4 صفوف. استبعد ذلك الرقم من جميع الخلايا الأخرى في تلك الأعمدة الأربعة.'
    }
  },
  'unique-rectangles': {
    stage: 'stage4',
    badges: {
      en: 'Master 4-3', ko: '마스터 4-3', ja: '名人 4-3', zh: '大師 4-3', 'zh-CN': '大师 4-3',
      es: 'Maestría 4-3', de: 'Meister 4-3', fr: 'Maître 4-3', pt: 'Mestre 4-3',
      it: 'Maestro 4-3', ru: 'Мастер 4-3', hi: 'मास्टर 4-3', ar: 'خبير 4-3'
    },
    titles: {
      en: 'Unique Rectangles (UR Type 1~4)', ko: 'Unique Rectangles (유일 사각형 UR)', ja: 'ユニーク・レクタングル (URタイプ 1~4)',
      zh: '唯一矩形 Unique Rectangles (UR 致命結構)', 'zh-CN': '唯一矩形 Unique Rectangles (UR 致命结构)',
      es: 'Rectángulos Únicos (UR Tipos 1~4)', de: 'Unique Rectangles (UR Typ 1-4)',
      fr: 'Rectangles Uniques (UR Types 1~4)', pt: 'Retângulos Únicos (UR Tipo 1~4)',
      it: 'Rettangoli Unici (UR Tipo 1~4)', ru: 'Уникальные прямоугольники (UR 1-4)',
      hi: 'यूनिक रेक्टेंगल्स (UR प्रकार 1~4)', ar: 'المستطيلات الفريدة (UR النوع 1-4)'
    },
    descs: {
      en: 'Four cells forming a rectangle across 2 boxes cannot all be the same pair (AB). Break the deadly pattern by resolving additional candidates.',
      ko: '2개 박스에 걸친 직사각형 4개 칸이 모두 동일한 2개 후보수(AB)를 가지면 복수 해답 오류가 발생하므로, 추가 후보수를 이용해 치명적 패턴을 파괴합니다.',
      ja: '2つのブロックに跨る4マスが全て同じ2候補(AB)になると複数解エラーになるため、追加候補数を活用して致命的パターンを回避します。',
      zh: '跨越 2 個九宮格的矩形 4 格不能全為相同的雙候選數 (AB) 以防多解，利用多餘候選數破壞此致命結構。',
      'zh-CN': '跨越 2 个九宫格的矩形 4 格不能全为相同的双候选数 (AB) 以防多解，利用多余候选数破坏此致命结构。',
      es: 'Cuatro casillas en rectángulo en 2 bloques no pueden ser todas la misma pareja (AB). Rompe el patrón mortal con los candidatos extra.',
      de: 'Vier Felder über 2 Blöcke dürfen nicht alle dasselbe Paar (AB) haben (Mehrdeutigkeit). Nutzen Sie Extra-Kandidaten zur Auflösung.',
      fr: 'Quatre cases en rectangle sur 2 blocs ne peuvent être identiques (AB). Brisez ce motif fatal grâce aux candidats supplémentaires.',
      pt: 'Quatro casas em retângulo em 2 blocos não podem ter todas o mesmo par (AB). Quebre o padrão mortal com os candidatos extras.',
      it: 'Quattro caselle a rettangolo su 2 blocchi non possono avere la stessa coppia (AB). Risolvi il motivo fatale con i candidati extra.',
      ru: 'Четыре клетки прямоугольника в 2 блоках не могут содержать одну пару (AB). Разрушьте ловушку с помощью лишних кандидатов.',
      hi: '2 बॉक्सों में आयत बनाने वाली 4 सेल समान जोड़ी (AB) नहीं हो सकतीं। अतिरिक्त उम्मीदवारों से इस घातक पैटर्न को तोड़ें।',
      ar: 'أربع خلايا تشكل مستطيلاً عبر مربعين لا يمكن أن تكون جميعها نفس الزوج (AB). اكسر هذا النمط القاتل باستخدام المرشحات الإضافية.'
    }
  },
  'simple-colouring': {
    stage: 'stage4',
    badges: {
      en: 'Master 4-4', ko: '마스터 4-4', ja: '名人 4-4', zh: '大師 4-4', 'zh-CN': '大师 4-4',
      es: 'Maestría 4-4', de: 'Meister 4-4', fr: 'Maître 4-4', pt: 'Mestre 4-4',
      it: 'Maestro 4-4', ru: 'Мастер 4-4', hi: 'मास्टर 4-4', ar: 'خبير 4-4'
    },
    titles: {
      en: 'Simple Colouring (Bi-Value Map)', ko: 'Simple Colouring (단일 후보 색칠법)', ja: 'シンプル・カラーリング (単色強リンク網)',
      zh: '簡單著色法 Simple Colouring (強鏈雙色網)', 'zh-CN': '简单着色法 Simple Colouring (强链双色网)',
      es: 'Simple Colouring (Coloreo simple de enlaces)', de: 'Simple Colouring (Einfaches Einfärben)',
      fr: 'Simple Colouring (Coloration simple)', pt: 'Simple Colouring (Coloração simples)',
      it: 'Simple Colouring (Colorazione semplice)', ru: 'Простая раскраска (Simple Colouring)',
      hi: 'सिंपल कलरिंग (द्वि-रंगीन लिंक मैप)', ar: 'التلوين البسيط (خريطة الروابط الثنائية)'
    },
    descs: {
      en: 'Trace alternating strong links of a single candidate in two colours (Blue/Green). A contradiction eliminates one colour or cells seeing both.',
      ko: '단일 후보수의 강한 연결을 따라 파랑/초록 두 색으로 번갈아 칠할 때, 모순이 발생하는 색 전체를 제거하거나 두 색을 동시에 보는 칸에서 소거합니다.',
      ja: '単一候補の強リンクを青と緑の2色で交互に色分けし、矛盾が生じた色を一括消去、または両方の色から見通せるマスから消去します。',
      zh: '沿著單一候選數的強鏈交替標記藍/綠兩色，若同色在同區域衝突則該色全滅，同時看到雙色的格子亦可排除該數。',
      'zh-CN': '沿着单一候选数的强链交替标记蓝/绿两色，若同色在同区域冲突则该色全灭，同时看到双色的格子亦可排除该数。',
      es: 'Traza enlaces fuertes alternos de un candidato en dos colores (Azul/Verde). Las contradicciones eliminan un color o casillas que ven ambos.',
      de: 'Färben Sie starke Verbindungen einer Zahl abwechselnd blau/grün ein. Widersprüche eliminieren eine Farbe oder Felder, die beide Farben sehen.',
      fr: 'Colorez en alternance les liens forts d’un candidat en bleu/vert. Une contradiction élimine une couleur ou les cases voyant les deux.',
      pt: 'Pinte as ligações fortes alternadas de um candidato em azul/verde. Contradições eliminam uma cor ou casas que veem ambas as cores.',
      it: 'Colora i legami forti alternati di un candidato in blu/verde. Una contraddizione elimina un colore o le caselle che vedono entrambi.',
      ru: 'Раскрасьте сильные связи одного кандидата в два цвета (синий/зеленый). Противоречие удаляет один цвет или клетки, видящие оба.',
      hi: 'एकल उम्मीदवार के मजबूत लिंक को दो रंगों (नीला/हरा) में रंगें। विरोधाभास होने पर एक रंग या दोनों रंगों को देखने वाली सेल हट जाती है।',
      ar: 'تتبع الروابط القوية لرقم مرشح بلونين متناوبين (أزرق/أخضر). أي تناقض يستبعد لوناً بالكامل أو الخلايا التي ترى كلا اللونين.'
    }
  },
  '3d-medusa': {
    stage: 'stage4',
    badges: {
      en: 'Master 4-5', ko: '마스터 4-5', ja: '名人 4-5', zh: '大師 4-5', 'zh-CN': '大师 4-5',
      es: 'Maestría 4-5', de: 'Meister 4-5', fr: 'Maître 4-5', pt: 'Mestre 4-5',
      it: 'Maestro 4-5', ru: 'Мастер 4-5', hi: 'मास्टर 4-5', ar: 'خبير 4-5'
    },
    titles: {
      en: '3D Medusa (Multi-Value Colouring)', ko: '3D Medusa (다중 후보 입체 색칠)', ja: '3Dメデューサ (多値立体カラーリング)',
      zh: '三維美杜莎 3D Medusa (多值立體著色)', 'zh-CN': '三维美杜莎 3D Medusa (多值立体着色)',
      es: '3D Medusa (Coloreo tridimensional multivalor)', de: '3D Medusa (Mehrwert-Einfärbung)',
      fr: '3D Medusa (Coloration 3D multivalente)', pt: '3D Medusa (Coloração 3D multivalor)',
      it: '3D Medusa (Colorazione 3D multivalore)', ru: '3D Medusa (Многозначная раскраска)',
      hi: '3D मेडुसा (बहु-मूल्य रंगाई)', ar: 'ميدوسا ثلاثية الأبعاد (التلوين متعدد القيم)'
    },
    descs: {
      en: 'Extends colouring to both strong links and bi-value cells simultaneously across multiple digits. Exposes contradictions across dimensions.',
      ko: '단일 후보 강한 연결뿐 아니라 2개 후보수를 가진 셀까지 결합해 입체적으로 색칠하여, 다차원적 모순을 유도하고 후보수를 대량 소거합니다.',
      ja: '強リンクだけでなく2候補マスも組み合わせて多数字を立体的に2色分けし、多次元的な矛盾から大量の候補数を消去します。',
      zh: '結合強鏈與雙值格進行多數字立體雙色標記，利用跨維度的邏輯矛盾一舉排除大量候選數。',
      'zh-CN': '结合强链与双值格进行多数字立体双色标记，利用跨维度的逻辑矛盾一举排除大量候选数。',
      es: 'Extiende el coloreo a enlaces fuertes y casillas bi-valor simultáneamente en varios dígitos, revelando contradicciones dimensionales.',
      de: 'Kombiniert starke Verbindungen und 2er-Zellen über mehrere Zahlen hinweg. Widersprüche führen zu großflächigen Ausschlüssen.',
      fr: 'Étend la coloration aux liens forts et aux cases bivaluées sur plusieurs chiffres, révélant des contradictions multidimensionnelles.',
      pt: 'Estende a coloração para ligações fortes e casas bivalor simultaneamente em múltiplos dígitos, revelando contradições dimensionais.',
      it: 'Estende la colorazione a legami forti e caselle bivalore su più numeri contemporaneamente, rivelando contraddizioni multidimensionali.',
      ru: 'Расширяет раскраску на сильные связи и бивалентные клетки по нескольким цифрам, раскрывая многомерные противоречия.',
      hi: 'मजबूत लिंक और द्वि-मूल्य सेलों दोनों को बहु-अंकों में एक साथ रंगता है, जिससे बहुआयामी विरोधाभास सामने आते हैं।',
      ar: 'يوسع التلوين ليشمل الروابط القوية والخلايا الثنائية معاً عبر أرقام متعددة، مما يكشف تناقضات منطقية متعددة الأبعاد.'
    }
  },
  'xy-chains': {
    stage: 'stage4',
    badges: {
      en: 'Master 4-6', ko: '마스터 4-6', ja: '名人 4-6', zh: '大師 4-6', 'zh-CN': '大师 4-6',
      es: 'Maestría 4-6', de: 'Meister 4-6', fr: 'Maître 4-6', pt: 'Mestre 4-6',
      it: 'Maestro 4-6', ru: 'Мастер 4-6', hi: 'मास्टर 4-6', ar: 'خبير 4-6'
    },
    titles: {
      en: 'XY-Chains (Bi-Value Cell Chains)', ko: 'XY-Chains (이원 셀 연속 체인)', ja: 'XY-チェーン (2値セル連鎖)',
      zh: 'XY鏈 XY-Chains (雙值格推理鏈)', 'zh-CN': 'XY链 XY-Chains (双值格推理链)',
      es: 'XY-Chains (Cadenas de casillas bivalor)', de: 'XY-Chains (Bivalente Zellketten)',
      fr: 'XY-Chains (Chaînes de cases bivaluées)', pt: 'XY-Chains (Cadeias de casas bivalor)',
      it: 'XY-Chains (Catene di caselle bivalore)', ru: 'XY-Chains (Цепочки бивалентных клеток)',
      hi: 'एक्सवाई-चेन (द्वि-मूल्य सेल श्रृंखला)', ar: 'سلاسل XY (سلاسل الخلايا الثنائية)'
    },
    descs: {
      en: 'A chain of bi-value cells starting with (XA) and ending with (BY). Any cell seeing both ends cannot contain the common candidate.',
      ko: '2개 후보수 셀들로 구성된 체인에서 시작 셀(XA)과 끝 셀(BY)이 연결될 때, 체인의 양 끝 셀을 동시에 보는 칸에서 후보수 X를 소거합니다.',
      ja: '2候補マスのみで構成された連鎖で始点(XA)と終点(BY)が結ばれる時、両端を同時に見通せるマスから共通候補数Xを消去します。',
      zh: '由雙值格組成的長鏈，若起點為 (XA) 終點為 (BY)，則同時看見鏈條兩端的格子必可排除候選數 X。',
      'zh-CN': '由双值格组成的长链，若起点为 (XA) 终点为 (BY)，则同时看见链条两端的格子必可排除候选数 X。',
      es: 'Una cadena de casillas bi-valor que empieza con (XA) y termina con (BY). Elimina X de las casillas que ven ambos extremos.',
      de: 'Eine Kette aus 2er-Zellen von (XA) bis (BY). Jedes Feld, das beide Kettenenden sieht, kann den gemeinsamen Kandidaten X nicht enthalten.',
      fr: 'Une chaîne de cases bivaluées débutant par (XA) et finissant par (BY). Éliminez X de toute case voyant les deux extrémités.',
      pt: 'Uma cadeia de casas bivalor começando com (XA) e terminando com (BY). Elimine X de casas que veem ambas as pontas.',
      it: 'Una catena di caselle bivalore che inizia con (XA) e termina con (BY). Elimina X dalle caselle che vedono entrambe le estremità.',
      ru: 'Цепь бивалентных клеток от (XA) до (BY). Любая клетка, видящая оба конца цепи, не может содержать общего кандидата X.',
      hi: '(XA) से शुरू और (BY) पर समाप्त होने वाली द्वि-मूल्य सेल श्रृंखला। दोनों सिरों को देखने वाली सेल से उम्मीदवार X को हटा दें।',
      ar: 'سلسلة من خلايا ثنائية تبدأ بـ (XA) وتنتهي بـ (BY). أي خلية ترى طرفي السلسلة معاً لا يمكن أن تحتوي على المرشح المشترك X.'
    }
  },
  'wxyz-wing': {
    stage: 'stage4',
    badges: {
      en: 'Master 4-7', ko: '마스터 4-7', ja: '名人 4-7', zh: '大師 4-7', 'zh-CN': '大师 4-7',
      es: 'Maestría 4-7', de: 'Meister 4-7', fr: 'Maître 4-7', pt: 'Mestre 4-7',
      it: 'Maestro 4-7', ru: 'Мастер 4-7', hi: 'मास्टर 4-7', ar: 'خبير 4-7'
    },
    titles: {
      en: 'WXYZ-Wing (4-Digit Wing Pattern)', ko: 'WXYZ-Wing (4후보 윙 패턴)', ja: 'WXYZ-Wing (WXYZ-ウィング)',
      zh: 'WXYZ翼數組 WXYZ-Wing (四候選翼型)', 'zh-CN': 'WXYZ翼数组 WXYZ-Wing (四候选翼型)',
      es: 'WXYZ-Wing (Patrón de 4 candidatos)', de: 'WXYZ-Wing (4-Kandidaten-Wing)',
      fr: 'WXYZ-Wing (Motif à 4 chiffres)', pt: 'WXYZ-Wing (Padrão de 4 candidatos)',
      it: 'WXYZ-Wing (Motivo a 4 candidati)', ru: 'WXYZ-Wing (Четырехзначное крыло)',
      hi: 'डब्ल्यूएक्सवाईज़ेड-विंग (4-अंक विंग)', ar: 'جناح WXYZ (نمط الأرقام الأربعة)'
    },
    descs: {
      en: 'A 4-cell structure containing 4 candidates (W,X,Y,Z). A restricted common candidate Z is eliminated from cells seen by all Z-holding cells.',
      ko: '피벗과 날개들이 4개 후보수(W,X,Y,Z)를 분할 공유할 때, 제한된 공통 후보수 Z를 보유한 모든 칸이 동시에 바라보는 교차 칸에서 Z를 소거합니다.',
      ja: '4マスで4つの候補数(W,X,Y,Z)を分担保持する時、共通候補Zを持つ全てのマスから見通せる交差マスからZを消去します。',
      zh: '4 個格子共同包含 4 個候選數 (W,X,Y,Z)，在同時被所有包含候選數 Z 的格子看見的交叉格中排除 Z。',
      'zh-CN': '4 个格子共同包含 4 个候选数 (W,X,Y,Z)，在同时被所有包含候选数 Z 的格子看见的交叉格中排除 Z。',
      es: 'Una estructura de 4 casillas con 4 candidatos (W,X,Y,Z). El candidato Z se elimina de las casillas vistas por todas las que contienen Z.',
      de: 'Eine 4-Zellen-Struktur mit 4 Kandidaten (W,X,Y,Z). Kandidat Z wird aus allen Feldern gelöscht, die alle Z-Felder sehen.',
      fr: 'Une structure de 4 cases avec 4 candidats (W,X,Y,Z). Éliminez Z des cases vues par toutes les cases contenant Z.',
      pt: 'Uma estrutura de 4 casas com 4 candidatos (W,X,Y,Z). Elimine Z das casas vistas por todas as casas que contêm Z.',
      it: 'Una struttura a 4 caselle con 4 candidati (W,X,Y,Z). Elimina Z dalle caselle viste da tutte le caselle contenenti Z.',
      ru: 'Структура из 4 клеток с 4 кандидатами (W,X,Y,Z). Кандидат Z удаляется из клеток, видимых всеми клетками с Z.',
      hi: '4 उम्मीदवारों (W,X,Y,Z) वाली 4 सेलों की संरचना। सभी Z-युक्त सेलों द्वारा देखी जाने वाली सेल से Z को हटा दें।',
      ar: 'هيكل مكون من 4 خلايا تحتوي على 4 أرقام مرشحة (W,X,Y,Z). يتم استبعاد الرقم Z من الخلايا التي تراها جميع الخلايا الحاملة لـ Z.'
    }
  },
  'empty-rectangles': {
    stage: 'stage4',
    badges: {
      en: 'Master 4-8', ko: '마스터 4-8', ja: '名人 4-8', zh: '大師 4-8', 'zh-CN': '大师 4-8',
      es: 'Maestría 4-8', de: 'Meister 4-8', fr: 'Maître 4-8', pt: 'Mestre 4-8',
      it: 'Maestro 4-8', ru: 'Мастер 4-8', hi: 'मास्टर 4-8', ar: 'خبير 4-8'
    },
    titles: {
      en: 'Empty Rectangles (ER L-Shape)', ko: 'Empty Rectangles (빈 사각형 ER)', ja: 'エンプティ・レクタングル (空長方形 ER)',
      zh: '空矩形 Empty Rectangles (ER L形排除)', 'zh-CN': '空矩形 Empty Rectangles (ER L形排除)',
      es: 'Empty Rectangles (Rectángulo vacío en L)', de: 'Empty Rectangles (Leeres Rechteck ER)',
      fr: 'Empty Rectangles (Rectangle vide en L)', pt: 'Empty Rectangles (Retângulo vazio ER)',
      it: 'Empty Rectangles (Rettangolo vuoto ER)', ru: 'Пустые прямоугольники (Empty Rectangles)',
      hi: 'एम्प्टी रेक्टेंगल्स (खाली आयत ER)', ar: 'المستطيلات الفارغة (شكل L الفارغ)'
    },
    descs: {
      en: 'Inside a box, a candidate forms an L-shape around an empty 2x2 corner. Connected to a conjugate pair line, eliminates candidate at the intersection.',
      ko: '3x3 박스 내에서 후보수가 빈 2x2 코너를 감싸는 L자 형태로 배열될 때, 외부 강한 연결 라인과 만나 교차하는 목표 칸에서 후보수를 소거합니다.',
      ja: 'ブロック内で候補数が空の2x2角を囲むL字型に並ぶ時、外部の強リンクラインと交差する目標マスから候補数を消去します。',
      zh: '九宮格內候選數圍繞空的 2x2 角落形成 L 型分佈，與外部強鏈線路交會於目標格時可將該格的候選數排除。',
      'zh-CN': '九宫格内候选数围绕空的 2x2 角落形成 L 型分布，与外部强链线路交会于目标格时可将该格的候选数排除。',
      es: 'En un bloque, un candidato forma una L alrededor de una esquina vacía. Conectado a un enlace fuerte externo, elimina el candidato en la intersección.',
      de: 'In einem Block bildet eine Zahl eine L-Form um eine leere 2x2-Ecke. Verknüpft mit einer externen starken Verbindung eliminiert sie den Schnittpunkt.',
      fr: 'Dans un bloc, un candidat forme un L autour d’un coin vide. Lié à un lien fort externe, éliminez le candidat à l’intersection.',
      pt: 'Em um bloco, um candidato forma um L ao redor de um canto vazio. Conectado a uma linha de ligação forte, elimina o candidato na interseção.',
      it: 'In un blocco, un candidato forma una L attorno a un angolo vuoto. Connesso a un legame forte esterno, elimina il candidato all’intersezione.',
      ru: 'В блоке кандидат образует L-форму вокруг пустого угла 2x2. В связке с внешней сильной линией он удаляет кандидата на пересечении.',
      hi: 'एक बॉक्स में उम्मीदवार खाली 2x2 कोने के चारों ओर L-आकार बनाता है। बाहरी मजबूत लिंक से जुड़कर प्रतिच्छेदन सेल से उम्मीदवार को हटाता है।',
      ar: 'داخل المربع، يشكل الرقم المرشح شكل L حول زاوية 2x2 فارغة. وعند اتصاله برابط قوي خارجي، يتم استبعاد المرشح عند نقطة التقاطع.'
    }
  },

  // STAGE 5 (5-1 ~ 5-5)
  'finned-xwing': {
    stage: 'stage5',
    badges: {
      en: 'Grandmaster 5-1', ko: '그랜드마스터 5-1', ja: 'グランドマスター 5-1', zh: '宗師 5-1', 'zh-CN': '宗师 5-1',
      es: 'Gran Maestro 5-1', de: 'Großmeister 5-1', fr: 'Grand Maître 5-1', pt: 'Grão-Mestre 5-1',
      it: 'Gran Maestro 5-1', ru: 'Гроссмейстер 5-1', hi: 'ग्रैंडमास्टर 5-1', ar: 'أستاذ كبير 5-1'
    },
    titles: {
      en: 'Finned X-Wing / Swordfish', ko: 'Finned X-Wing / Swordfish (지느러미 피시)', ja: 'フィン付X-Wing / ソードフィッシュ',
      zh: '帶鰭魚型 Finned X-Wing / Swordfish', 'zh-CN': '带鳍鱼型 Finned X-Wing / Swordfish',
      es: 'Finned X-Wing / Swordfish (Pez con aleta)', de: 'Finned X-Wing / Swordfish',
      fr: 'Finned X-Wing / Swordfish (Poisson à nageoire)', pt: 'Finned X-Wing / Swordfish (Peixe com barbatana)',
      it: 'Finned X-Wing / Swordfish (Pesce con pinna)', ru: 'Плавниковый X-Wing / Рыба-меч (Finned)',
      hi: 'फिन्ड एक्स-विंग / स्वॉर्डफिश', ar: 'جناح إكس ذو الزعنفة / سمكة السيف'
    },
    descs: {
      en: 'An almost-perfect Fish pattern with extra "fin" candidates in one box. Eliminates the candidate from cells seeing both the normal fish column and the fin.',
      ko: '완벽한 Fish 패턴에 한 박스 내 추가 "지느러미" 후보수가 붙어있을 때, 일반 피시 열과 지느러미 칸을 동시에 보는 교차 칸에서 후보수를 안전하게 소거합니다.',
      ja: '完全なFish構造に余分な「ヒレ」が付いた時、通常のFish列とヒレの両方を同時に見通せるマスから候補数を消去します。',
      zh: '標準魚型結構在單一宮內多出「魚鰭」候選數，在同時看見標準魚列與魚鰭的交集格中安全排除候選數。',
      'zh-CN': '标准鱼型结构在单一宫内多出“鱼鳍”候选数，在同时看见标准鱼列与鱼鳍的交集格中安全排除候选数。',
      es: 'Un pez casi perfecto con candidatos "aleta" extra en un bloque. Elimina el candidato de casillas que ven la columna del pez y la aleta.',
      de: 'Ein fast perfektes Fisch-Muster mit extra "Flossen"-Kandidaten in einem Block. Löscht Kandidaten, die Fisch-Spalte und Flosse sehen.',
      fr: 'Un motif poisson avec des candidats "nageoires" supplémentaires dans un bloc. Éliminez le candidat des cases voyant le poisson et la nageoire.',
      pt: 'Um padrão de peixe com candidatos "barbatana" extras em um bloco. Elimina o candidato das casas que veem a coluna do peixe e a barbatana.',
      it: 'Un motivo a pesce con candidati "pinna" extra in un blocco. Elimina il candidato dalle caselle che vedono la colonna del pesce e la pinna.',
      ru: 'Почти идеальная Рыба с дополнительным "плавником" в одном блоке. Удаляет кандидата из клеток, видящих и столбец рыбы, и плавник.',
      hi: 'अतिरिक्त "फिन" उम्मीदवारों वाला फिश पैटर्न। फिश कॉलम और फिन दोनों को देखने वाली सेल से उम्मीदवार को हटाता है।',
      ar: 'نمط سمكة شبه مكتمل مع مرشحات "زعنفة" إضافية في مربع واحد. يتم استبعاد المرشح من الخلايا التي ترى عمود السمكة والزعنفة معاً.'
    }
  },
  'aic': {
    stage: 'stage5',
    badges: {
      en: 'Grandmaster 5-2', ko: '그랜드마스터 5-2', ja: 'グランドマスター 5-2', zh: '宗師 5-2', 'zh-CN': '宗师 5-2',
      es: 'Gran Maestro 5-2', de: 'Großmeister 5-2', fr: 'Grand Maître 5-2', pt: 'Grão-Mestre 5-2',
      it: 'Gran Maestro 5-2', ru: 'Гроссмейстер 5-2', hi: 'ग्रैंडमास्टर 5-2', ar: 'أستاذ كبير 5-2'
    },
    titles: {
      en: 'Alternating Inference Chains (AIC)', ko: 'AIC (교대 추론 체인)', ja: 'AIC (交互推論連鎖)',
      zh: '交替推論鏈 AIC (強弱鏈交替網)', 'zh-CN': '交替推论链 AIC (强弱链交替网)',
      es: 'Cadenas de Inferencia Alternada (AIC)', de: 'Alternating Inference Chains (AIC)',
      fr: 'Chaînes d’Inférence Alternées (AIC)', pt: 'Cadeias de Inferência Alternada (AIC)',
      it: 'Catene di Inferenza Alternata (AIC)', ru: 'Чередующиеся цепи логики (AIC)',
      hi: 'अल्टरनेटिंग इन्फेरेंस चेन (AIC)', ar: 'سلاسل الاستدلال المتناوب (AIC)'
    },
    descs: {
      en: 'A chain alternating between strong and weak links. If both ends hold candidate X with strong links, any cell seeing both ends cannot contain X.',
      ko: '강한 연결과 약한 연결이 엄격하게 번갈아 연결되는 고난도 논리 체인으로, 양 끝의 가설이 수렴하여 두 끝점을 동시에 보는 교차 칸에서 후보수를 소거합니다.',
      ja: '強リンクと弱リンクが厳密に交互に連なる高度な論理連鎖で、両端の仮説が収束し、両端を同時に見通せるマスから候補数を消去します。',
      zh: '強鏈與弱鏈嚴格交替構成的高階邏輯鏈，當兩端推論收斂時，任何同時看見鏈條兩端的格子皆可排除該候選數。',
      'zh-CN': '强链与弱链严格交替构成的高阶逻辑链，当两端推论收敛时，任何同时看见链条两端的格子皆可排除该候选数。',
      es: 'Una cadena que alterna estrictamente entre enlaces fuertes y débiles. Elimina el candidato de las casillas que ven ambos extremos de la cadena.',
      de: 'Eine Kette aus abwechselnd starken und schwachen Verbindungen. Löscht Kandidaten aus Feldern, die beide Kettenenden sehen.',
      fr: 'Une chaîne alternant strictement entre liens forts et faibles. Éliminez le candidat de toute case voyant les deux bouts de la chaîne.',
      pt: 'Uma cadeia que alterna estritamente entre ligações fortes e fracas. Elimina o candidato das casas que veem ambas as extremidades.',
      it: 'Una catena che alterna rigorosamente legami forti e deboli. Elimina il candidato dalle caselle che vedono entrambe le estremità.',
      ru: 'Цепь со строгим чередованием сильных и слабых связей. Удаляет кандидата из клеток, видящих оба конца логической цепочки.',
      hi: 'मजबूत और कमजोर लिंक के बीच बारी-बारी से बनने वाली तर्क श्रृंखला। दोनों सिरों को देखने वाली सेल से उम्मीदवार को हटा देती है।',
      ar: 'سلسلة منطقية متقدمة تتناوب بدقة بين الروابط القوية والضعيفة. استبعد الرقم المرشح من الخلايا التي ترى طرفي السلسلة معاً.'
    }
  },
  'als': {
    stage: 'stage5',
    badges: {
      en: 'Grandmaster 5-3', ko: '그랜드마스터 5-3', ja: 'グランドマスター 5-3', zh: '宗師 5-3', 'zh-CN': '宗师 5-3',
      es: 'Gran Maestro 5-3', de: 'Großmeister 5-3', fr: 'Grand Maître 5-3', pt: 'Grão-Mestre 5-3',
      it: 'Gran Maestro 5-3', ru: 'Гроссмейстер 5-3', hi: 'ग्रैंडमास्टर 5-3', ar: 'أستاذ كبير 5-3'
    },
    titles: {
      en: 'Almost Locked Sets (ALS-XZ / ALS-XY-Wing)', ko: 'ALS (유사 잠금 집합 ALS-XZ)', ja: 'ALS (準ロックトセット ALS-XZ)',
      zh: '近似鎖定集 ALS (ALS-XZ 雙集排除)', 'zh-CN': '近似锁定集 ALS (ALS-XZ 双集排除)',
      es: 'Almost Locked Sets (Conjuntos casi bloqueados ALS-XZ)', de: 'Almost Locked Sets (ALS-XZ)',
      fr: 'Almost Locked Sets (Ensembles quasi-verrouillés ALS)', pt: 'Almost Locked Sets (Conjuntos quase bloqueados ALS)',
      it: 'Almost Locked Sets (Insiemi quasi bloccati ALS-XZ)', ru: 'Почти запертые множества (ALS-XZ)',
      hi: 'ऑलमोस्ट लॉक्ड सेट्स (ALS-XZ)', ar: 'المجموعات شبه المقفلة (ALS-XZ)'
    },
    descs: {
      en: 'N cells containing N+1 candidates. Two ALS linked by a restricted common candidate (RCC X) eliminate other common candidates (Z) from mutual sight.',
      ko: 'N개 칸이 N+1개 후보수를 가진 유사 잠금 집합(ALS) 2개가 공통 연결자(X)로 묶일 때, 두 집합이 동시에 공유하는 다른 후보수(Z)를 상호 시야 칸에서 소거합니다.',
      ja: 'N個のマスがN+1個の候補数を持つ準確定集合(ALS)2つが共通の制限数Xで結合する時、両集合が共有する別候補Zを交差マスから消去します。',
      zh: '由 N 個格子包含 N+1 個候選數的近似鎖定集 (ALS)，透過限制公共數 X 關聯時，可在雙方共同看到的格子中排除另一公共數 Z。',
      'zh-CN': '由 N 个格子包含 N+1 个候选数的近似锁定集 (ALS)，通过限制公共数 X 关联时，可在双方共同看到的格子中排除另一公共数 Z。',
      es: 'N casillas con N+1 candidatos. Dos ALS unidos por un candidato común restringido (X) eliminan otros candidatos compartidos (Z) de su vista mutua.',
      de: 'N Felder mit N+1 Kandidaten (ALS). Zwei über X verknüpfte ALS eliminieren andere gemeinsame Kandidaten Z aus dem gemeinsamen Sichtfeld.',
      fr: 'N cases contenant N+1 candidats. Deux ALS liés par un candidat commun X éliminent les autres candidats partagés Z des cases en vue mutuelle.',
      pt: 'N casas com N+1 candidatos (ALS). Dois ALS ligados por um candidato comum X eliminam outros candidatos Z do campo de visão mútuo.',
      it: 'N caselle con N+1 candidati. Due ALS collegati da un candidato comune X eliminano altri candidati Z dalle caselle in vista reciproca.',
      ru: 'N клеток с N+1 кандидатами. Два множества ALS, связанных общим числом X, удаляют другого общего кандидата Z из взаимного поля зрения.',
      hi: 'N सेल में N+1 उम्मीदवार (ALS)। X द्वारा जुड़े दो ALS अपने साझा दृश्य क्षेत्र से अन्य सामान्य उम्मीदवार Z को हटाते हैं।',
      ar: 'مجموعتان شبه مقفلتين (ALS) حيث تحتوي N خلية على N+1 مرشحاً. يربطهما رقم مشترك X لاستبعاد الرقم المشترك الآخر Z من مجال الرؤية المتبادل.'
    }
  },
  'forcing-chains': {
    stage: 'stage5',
    badges: {
      en: 'Grandmaster 5-4', ko: '그랜드마스터 5-4', ja: 'グランドマスター 5-4', zh: '宗師 5-4', 'zh-CN': '宗师 5-4',
      es: 'Gran Maestro 5-4', de: 'Großmeister 5-4', fr: 'Grand Maître 5-4', pt: 'Grão-Mestre 5-4',
      it: 'Gran Maestro 5-4', ru: 'Гроссмейстер 5-4', hi: 'ग्रैंडमास्टर 5-4', ar: 'أستاذ كبير 5-4'
    },
    titles: {
      en: 'Forcing Chains (Hypothesis Chains)', ko: 'Forcing Chains (포싱 체인 다중 가설)', ja: 'フォーシング・チェーン (多分岐強制連鎖)',
      zh: '強制鏈 Forcing Chains (多分支假設驗證)', 'zh-CN': '强制链 Forcing Chains (多分支假设验证)',
      es: 'Forcing Chains (Cadenas forzadas de hipótesis)', de: 'Forcing Chains (Erzwungene Ketten)',
      fr: 'Forcing Chains (Chaînes forcées d’hypothèses)', pt: 'Forcing Chains (Cadeias forçadas)',
      it: 'Forcing Chains (Catene forzate)', ru: 'Принуждающие цепи (Forcing Chains)',
      hi: 'फोर्सिंग चेन्स (परिकल्पना श्रृंखला)', ar: 'السلاسل القسرية (سلاسل الفرضيات)'
    },
    descs: {
      en: 'Test every candidate in a cell or dual branches. When all branches reach the exact same conclusion, that conclusion is 100% verified as fact.',
      ko: '어떤 칸의 모든 후보수 또는 양자택일 가설로부터 출발한 모든 논리 분기가 동일한 결론에 도달할 때, 해당 결론을 100% 확정 진실로 채택합니다.',
      ja: 'あるマスの全候補数または二者択一の分岐から出発し、全ての分岐が全く同一の結論に達した時、その結論を確定事実として採用します。',
      zh: '從某格的所有候選數或二選一分支分別出發推演，當所有分支皆導向同一個結論時，該結論便 100% 確定成立。',
      'zh-CN': '从某格的所有候选数或二选一分支分别出发推演，当所有分支皆导向同一个结论时，该结论便 100% 确定成立。',
      es: 'Prueba todas las opciones de una casilla. Cuando todas las ramas lógicas llevan a la misma conclusión, esa deducción queda 100% confirmada.',
      de: 'Prüft alle Kandidaten einer Zelle. Wenn alle logischen Verzweigungen zum selben Ergebnis führen, ist dieses Ergebnis 100% bewiesen.',
      fr: 'Testez toutes les branches d’une case. Lorsque toutes mènent à la même conclusion, cette dernière est vérifiée à 100%.',
      pt: 'Teste todas as opções de uma casa. Quando todos os ramos lógicos chegam à mesma conclusão, ela fica 100% confirmada como fato.',
      it: 'Verifica tutte le opzioni di una casella. Quando tutti i rami logici portano alla stessa conclusione, questa è verificata al 100%.',
      ru: 'Проверьте все варианты клетки. Если все логические ветви приводят к одному и тому же выводу, он признается 100% истинным.',
      hi: 'किसी सेल के सभी विकल्पों का परीक्षण करें। जब सभी तार्किक शाखाएं समान निष्कर्ष पर पहुंचती हैं, तो वह निष्कर्ष 100% सिद्ध हो जाता है।',
      ar: 'اختبر جميع المرشحات في الخلية. عندما تؤدي جميع الفروع المنطقية إلى نفس النتيجة تماماً، تصبح تلك النتيجة مؤكدة وصحيحة بنسبة 100%.'
    }
  },
  'exocet': {
    stage: 'stage5',
    badges: {
      en: 'Grandmaster 5-5', ko: '그랜드마스터 5-5', ja: 'グランドマスター 5-5', zh: '宗師 5-5', 'zh-CN': '宗师 5-5',
      es: 'Gran Maestro 5-5', de: 'Großmeister 5-5', fr: 'Grand Maître 5-5', pt: 'Grão-Mestre 5-5',
      it: 'Gran Maestro 5-5', ru: 'Гроссмейстер 5-5', hi: 'ग्रैंडमास्टर 5-5', ar: 'أستاذ كبير 5-5'
    },
    titles: {
      en: 'Exocet (Advanced Symmetrical Pattern)', ko: 'Exocet (엑소셋 대칭형 최고난도)', ja: 'エクソセ (超上級対称幾何学)',
      zh: '飛魚飛彈 Exocet (終極對稱幾何模式)', 'zh-CN': '飞鱼飞弹 Exocet (终极对称几何模式)',
      es: 'Exocet (Patrón simétrico extremo)', de: 'Exocet (Höchste symmetrische Struktur)',
      fr: 'Exocet (Motif symétrique extrême)', pt: 'Exocet (Padrão simétrico supremo)',
      it: 'Exocet (Modello simmetrico estremo)', ru: 'Экзосет (Сверхсложный симметричный паттерн)',
      hi: 'एक्सोसेट (अंतिम सममित पैटर्न)', ar: 'إكسوسيت (النمط التناظري النهائي)'
    },
    descs: {
      en: 'The pinnacle of human-solvable Sudoku logic. Base cells inject digits into target cells via cross-lines, unlocking extreme end-game puzzles.',
      ko: '인간이 논리로 풀 수 있는 스도쿠 기법의 정점. 베이스 셀과 교차 라인이 타겟 셀로 숫자를 강제 투영하여 극한의 난제를 돌파합니다.',
      ja: '論理で解けるナンプレ技法の最高峰。ベースマスと交差ラインがターゲットマスへ数字を強制射影し、極限の難問を突破します。',
      zh: '數獨邏輯的極致巔峰。透過基底格與交叉射線向目標格精確投影數字，瞬間攻破極限難題。',
      'zh-CN': '数独逻辑的极致巅峰。透过基底格与交叉射线向目标格精确投影数字，瞬间攻破极限难题。',
      es: 'La cúspide de la lógica en Sudoku. Las casillas base proyectan números en casillas objetivo a través de líneas cruzadas para resolver puzles extremos.',
      de: 'Der absolute Höhepunkt der Sudoku-Logik. Basisfelder projizieren Zahlen über Kreuzlinien in Zielfelder und knacken extremste Rätsel.',
      fr: 'Le sommet absolu de la logique de Sudoku. Les cases de base projettent des chiffres dans les cases cibles via des lignes croisées.',
      pt: 'O ápice absoluto da lógica de Sudoku. Casas base projetam números nas casas alvo através de linhas cruzadas, vencendo os enigmas mais extremos.',
      it: 'Il vertice supremo della logica di Sudoku. Le caselle base proiettano numeri nelle caselle bersaglio tramite linee incrociate.',
      ru: 'Вершина логики судоку. Базовые клетки проецируют цифры в целевые клетки через перекрестные линии, решая сложнейшие головоломки.',
      hi: 'सुडोकू तर्क का सर्वोच्च शिखर। बेस सेल क्रॉस-लाइनों के माध्यम से लक्ष्य सेलों में अंक प्रोजेक्ट करते हैं और कठिनतम पहेलियों को हल करते हैं।',
      ar: 'قمة المنطق البشري في حل السودوكو. تقوم الخلايا الأساسية بإسقاط الأرقام في الخلايا المستهدفة عبر خطوط متقاطعة لحل أصعب الألغاز المعقدة.'
    }
  }
};

console.log('32 Strategies Master Catalog Ready with 13 Languages!');
