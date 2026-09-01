import fs from 'fs';
import path from 'path';

// Complete dictionary for 32 Strategies across all 13 languages
export const STRATEGIES_DATA = {
  // --- STAGE 1 (5 strategies) ---
  'full-house': {
    badge: {
      en: 'Beginner 1-1', ko: '초급 1-1', ja: '初級 1-1', zh: '初級 1-1', 'zh-CN': '初级 1-1',
      es: 'Básica 1-1', de: 'Anfänger 1-1', fr: 'Débutant 1-1', pt: 'Iniciante 1-1',
      it: 'Principiante 1-1', ru: 'Новичок 1-1', hi: 'शुरुआती 1-1', ar: 'مبتدئ 1-1'
    },
    title: {
      en: 'Full House (Last 1 Cell)', ko: 'Full House (마지막 1칸)', ja: 'フルハウス (最後の1マス)',
      zh: '唯一餘數 Full House (最後一格)', 'zh-CN': '唯一余数 Full House (最后一格)',
      es: 'Full House (Última casilla)', de: 'Full House (Letztes 1 Feld)',
      fr: 'Full House (Dernière case)', pt: 'Full House (Última casa)',
      it: 'Full House (Ultima casella)', ru: 'Фулл-Хаус (Последняя 1 клетка)',
      hi: 'फुल हाउस (अंतिम 1 सेल)', ar: 'فل هاوس (آخر خلية متبقية)'
    },
    desc: {
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
    badge: {
      en: 'Beginner 1-2', ko: '초급 1-2', ja: '初級 1-2', zh: '初級 1-2', 'zh-CN': '初级 1-2',
      es: 'Básica 1-2', de: 'Anfänger 1-2', fr: 'Débutant 1-2', pt: 'Iniciante 1-2',
      it: 'Principiante 1-2', ru: 'Новичок 1-2', hi: 'शुरुआती 1-2', ar: 'مبتدئ 1-2'
    },
    title: {
      en: 'Last Free Cell (Last in Box)', ko: 'Last Free Cell (마지막 빈 셀)', ja: 'ラストフリーセル (ブロック内確定)',
      zh: '最後空格 Last Free Cell (九宮格確定)', 'zh-CN': '最后空格 Last Free Cell (九宫格确定)',
      es: 'Last Free Cell (Última en bloque)', de: 'Last Free Cell (Letztes freies Feld)',
      fr: 'Last Free Cell (Dernière case du bloc)', pt: 'Last Free Cell (Última livre no bloco)',
      it: 'Last Free Cell (Ultima nel blocco)', ru: 'Последняя свободная клетка (В блоке)',
      hi: 'लास्ट फ्री सेल (बॉक्स में अंतिम)', ar: 'آخر خلية شاغرة (في المربع)'
    },
    desc: {
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
    badge: {
      en: 'Beginner 1-3', ko: '초급 1-3', ja: '初級 1-3', zh: '初級 1-3', 'zh-CN': '初级 1-3',
      es: 'Básica 1-3', de: 'Anfänger 1-3', fr: 'Débutant 1-3', pt: 'Iniciante 1-3',
      it: 'Principiante 1-3', ru: 'Новичок 1-3', hi: 'शुरुआती 1-3', ar: 'مبتدئ 1-3'
    },
    title: {
      en: 'Cross-Hatching (Row/Col Elimination)', ko: 'Cross-Hatching (행/열 소거법)', ja: 'クロスハッチング (行/列消去法)',
      zh: '宮內排除法 Cross-Hatching (行列排除法)', 'zh-CN': '宫内排除法 Cross-Hatching (行列排除法)',
      es: 'Cross-Hatching (Barrido de filas/cols)', de: 'Cross-Hatching (Zeilen-/Spalten-Ausschluss)',
      fr: 'Cross-Hatching (Élimination Ligne/Col)', pt: 'Cross-Hatching (Eliminação Linha/Col)',
      it: 'Cross-Hatching (Eliminazione Riga/Col)', ru: 'Кросс-хэтчинг (Исключение по строкам/столбцам)',
      hi: 'क्रॉस-हैचिंग (पंक्ति/स्तंभ निष्कासन)', ar: 'المسح المتقاطع (استبعاد الصفوف والأعمدة)'
    },
    desc: {
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
    badge: {
      en: 'Beginner 1-4', ko: '초급 1-4', ja: '初級 1-4', zh: '初級 1-4', 'zh-CN': '初级 1-4',
      es: 'Básica 1-4', de: 'Anfänger 1-4', fr: 'Débutant 1-4', pt: 'Iniciante 1-4',
      it: 'Principiante 1-4', ru: 'Новичок 1-4', hi: 'शुरुआती 1-4', ar: 'مبتدئ 1-4'
    },
    title: {
      en: 'Naked Single (Sole Candidate)', ko: 'Naked Single (단일 후보)', ja: 'ネイキッドシングル (単一候補)',
      zh: '唯餘解法 Naked Single (單一候選數)', 'zh-CN': '唯余解法 Naked Single (单一候选数)',
      es: 'Naked Single (Único candidato obvio)', de: 'Naked Single (Einziger Kandidat)',
      fr: 'Naked Single (Candidat unique)', pt: 'Naked Single (Candidato único)',
      it: 'Naked Single (Candidato singolo)', ru: 'Одиночка (Единственный кандидат)',
      hi: 'नेकेड सिंगल (एकमात्र उम्मीदवार)', ar: 'الخلية الفردية المكشوفة (المرشح الوحيد)'
    },
    desc: {
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
    badge: {
      en: 'Beginner 1-5', ko: '초급 1-5', ja: '初級 1-5', zh: '初級 1-5', 'zh-CN': '初级 1-5',
      es: 'Básica 1-5', de: 'Anfänger 1-5', fr: 'Débutant 1-5', pt: 'Iniciante 1-5',
      it: 'Principiante 1-5', ru: 'Новичок 1-5', hi: 'शुरुआती 1-5', ar: 'مبتدئ 1-5'
    },
    title: {
      en: 'Hidden Single (Unique Placement)', ko: 'Hidden Single (숨은 단일)', ja: 'ヒドゥンシングル (隠れ単一)',
      zh: '隱性單數 Hidden Single (隱藏單一)', 'zh-CN': '隐性单数 Hidden Single (隐藏单一)',
      es: 'Hidden Single (Candidato oculto)', de: 'Hidden Single (Versteckter Einer)',
      fr: 'Hidden Single (Unique caché)', pt: 'Hidden Single (Único oculto)',
      it: 'Hidden Single (Singolo nascosto)', ru: 'Скрытая одиночка (Hidden Single)',
      hi: 'हिडन सिंगल (छिपा हुआ उम्मीदवार)', ar: 'الخلية الفردية المخفية (الموضع الفريد)'
    },
    desc: {
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

  // --- STAGE 2 (8 strategies) ---
  'pointing-pairs': {
    badge: {
      en: 'Intermediate 2-1', ko: '중급 2-1', ja: '中級 2-1', zh: '中級 2-3', 'zh-CN': '中级 2-3',
      es: 'Intermedia 2-3', de: 'Mittel 2-1', fr: 'Intermédiaire 2-1', pt: 'Intermediário 2-1',
      it: 'Intermedio 2-1', ru: 'Средний 2-1', hi: 'मध्यम 2-1', ar: 'متوسط 2-1'
    },
    title: {
      en: 'Locked Candidates 1 (Pointing)', ko: 'Locked Candidates 1 (포인팅)', ja: 'ロックト・キャンディデイツ 1 (ポインティング)',
      zh: '指向數對 Pointing Pairs (區塊排除)', 'zh-CN': '指向数对 Pointing Pairs (区块排除)',
      es: 'Pares Apuntadores (Pointing Pairs)', de: 'Locked Candidates 1 (Pointing)',
      fr: 'Candidats Verrouillés 1 (Pointage)', pt: 'Candidatos Bloqueados 1 (Pointing)',
      it: 'Candidati Bloccati 1 (Pointing)', ru: 'Указатели (Pointing Pairs)',
      hi: 'पॉइंटिंग पेयर्स (संकेतक जोड़े)', ar: 'المرشحات المقفلة 1 (المؤشر)'
    },
    desc: {
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
    badge: {
      en: 'Intermediate 2-2', ko: '중급 2-2', ja: '中級 2-2', zh: '中級 2-4', 'zh-CN': '中级 2-4',
      es: 'Intermedia 2-4', de: 'Mittel 2-2', fr: 'Intermédiaire 2-2', pt: 'Intermediário 2-2',
      it: 'Intermedio 2-2', ru: 'Средний 2-2', hi: 'मध्यम 2-2', ar: 'متوسط 2-2'
    },
    title: {
      en: 'Locked Candidates 2 (Claiming)', ko: 'Locked Candidates 2 (클레이밍)', ja: 'ロックト・キャンディデイツ 2 (クレイミング)',
      zh: '行列排除 Claiming (區塊排除)', 'zh-CN': '行列排除 Claiming (区块排除)',
      es: 'Intersección de Línea (Claiming / Box-Line)', de: 'Locked Candidates 2 (Claiming)',
      fr: 'Candidats Verrouillés 2 (Revendication)', pt: 'Candidatos Bloqueados 2 (Claiming)',
      it: 'Candidati Bloccati 2 (Claiming)', ru: 'Захват линии (Claiming)',
      hi: 'क्लेमिंग पेयर्स (लाइन-बॉक्स लॉक)', ar: 'المرشحات المقفلة 2 (المطالبة)'
    },
    desc: {
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
    badge: {
      en: 'Intermediate 2-3', ko: '중급 2-3', ja: '中級 2-3', zh: '中級 2-1', 'zh-CN': '中级 2-1',
      es: 'Media 2-1', de: 'Mittel 2-3', fr: 'Intermédiaire 2-3', pt: 'Intermediário 2-3',
      it: 'Intermedio 2-3', ru: 'Средний 2-3', hi: 'मध्यम 2-3', ar: 'متوسط 2-3'
    },
    title: {
      en: 'Naked Pair (2 Candidates in 2 Cells)', ko: 'Naked Pair (단일 2개 쌍)', ja: 'ネイキッドペア (2国同盟)',
      zh: '顯性數對 Naked Pair (2格鎖定2數)', 'zh-CN': '显性数对 Naked Pair (2格锁定2数)',
      es: 'Naked Pair (Pareja desnuda)', de: 'Naked Pair (Offenes Paar)',
      fr: 'Naked Pair (Paire nue)', pt: 'Naked Pair (Par exposto)',
      it: 'Naked Pair (Coppia nuda)', ru: 'Открытая пара (Naked Pair)',
      hi: 'नेकेड पेयर (2 सेल में 2 उम्मीदवार)', ar: 'الزوج المكشوف (رقمين في خليتين)'
    },
    desc: {
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
    badge: {
      en: 'Intermediate 2-4', ko: '중급 2-4', ja: '中級 2-4', zh: '中級 2-2', 'zh-CN': '中级 2-2',
      es: 'Media 2-2', de: 'Mittel 2-4', fr: 'Intermédiaire 2-4', pt: 'Intermediário 2-4',
      it: 'Intermedio 2-4', ru: 'Средний 2-4', hi: 'मध्यम 2-4', ar: 'متوسط 2-4'
    },
    title: {
      en: 'Hidden Pair (Hidden Dual Locked)', ko: 'Hidden Pair (숨은 2개 쌍)', ja: 'ヒドゥンペア (隠れ2国同盟)',
      zh: '隱性數對 Hidden Pair (隱藏雙數)', 'zh-CN': '隐性数对 Hidden Pair (隐藏双数)',
      es: 'Hidden Pair (Pareja oculta)', de: 'Hidden Pair (Verstecktes Paar)',
      fr: 'Hidden Pair (Paire cachée)', pt: 'Hidden Pair (Par oculto)',
      it: 'Hidden Pair (Coppia nascosta)', ru: 'Скрытая пара (Hidden Pair)',
      hi: 'हिडन पेयर (छिपा हुआ जोड़ा)', ar: 'الزوج المخفي (رقمين مقفلين)'
    },
    desc: {
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
    badge: {
      en: 'Intermediate 2-5', ko: '중급 2-5', ja: '中級 2-5', zh: '中級 2-5', 'zh-CN': '中级 2-5',
      es: 'Media 2-5', de: 'Mittel 2-5', fr: 'Intermédiaire 2-5', pt: 'Intermediário 2-5',
      it: 'Intermedio 2-5', ru: 'Средний 2-5', hi: 'मध्यम 2-5', ar: 'متوسط 2-5'
    },
    title: {
      en: 'Naked Triple (3-Cell Locked Set)', ko: 'Naked Triple (단일 3개 조)', ja: 'ネイキッドトリプル (3国同盟)',
      zh: '顯性三數組 Naked Triple (3格鎖定3數)', 'zh-CN': '显性三数组 Naked Triple (3格锁定3数)',
      es: 'Trío Desnudo (Naked Triple)', de: 'Naked Triple (Offener Dreier)',
      fr: 'Naked Triple (Triplet nu)', pt: 'Naked Triple (Trinca exposta)',
      it: 'Naked Triple (Terna nuda)', ru: 'Открытая тройка (Naked Triple)',
      hi: 'नेकेड ट्रिपल (3 सेल में 3 उम्मीदवार)', ar: 'الثلاثي المكشوف (3 أرقام في 3 خلايا)'
    },
    desc: {
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
    badge: {
      en: 'Intermediate 2-6', ko: '중급 2-6', ja: '中級 2-6', zh: '中級 2-6', 'zh-CN': '中级 2-6',
      es: 'Media 2-6', de: 'Mittel 2-6', fr: 'Intermédiaire 2-6', pt: 'Intermediário 2-6',
      it: 'Intermedio 2-6', ru: 'Средний 2-6', hi: 'मध्यम 2-6', ar: 'متوسط 2-6'
    },
    title: {
      en: 'Hidden Triple (3 Hidden Digits)', ko: 'Hidden Triple (숨은 3개 조)', ja: 'ヒドゥントリプル (隠れ3国同盟)',
      zh: '隱性三數組 Hidden Triple (隱藏三數)', 'zh-CN': '隐性三数组 Hidden Triple (隐藏三数)',
      es: 'Trío Oculto (Hidden Triple)', de: 'Hidden Triple (Versteckter Dreier)',
      fr: 'Hidden Triple (Triplet caché)', pt: 'Hidden Triple (Trinca oculta)',
      it: 'Hidden Triple (Terna nascosta)', ru: 'Скрытая тройка (Hidden Triple)',
      hi: 'हिडन ट्रिपल (3 छिपे हुए अंक)', ar: 'الثلاثي المخفي (3 أرقام مقفلة)'
    },
    desc: {
      en: 'Three specific digits appear in only three cells within a unit. Strip away all other candidates from those three cells.',
      ko: '한 줄이나 박스에서 특정 3개 숫자가 오직 3개 칸에만 나타날 때, 그 세 칸에서 다른 불필요한 후보수를 모두 제거합니다.',
      ja: '特定の3つの数字がユニット内の3マスにしか出現しない時、その3マスから他の全ての候補数を消去します。',
      zh: '某 3 個數字在區域內只出現在這 3 個格子中，將這 3 個格子中的其他多餘候選數全部清除。',
      'zh-CN': '某 3 个数字在区域内只出现在这 3 个格子中，将这 3 个格子中的其他多余候选数全部清除。',
      es: 'Tres números específicos solo aparecen en tres casillas de una unidad. Elimina todos los demás candidatos de esas 3 casillas.',
      de: 'Drei bestimmte Zahlen kommen in einer Einheit nur in drei Feldern vor. Entfernen Sie alle anderen Kandidaten aus diesen 3 Feldern.',
      fr: 'Trois chiffres n’apparaissent que dans trois cases d’une unité. Supprimez tous les autres candidats de ces 3 cases.',
      pt: 'Três números específicos aparecem apenas em 3 casas de uma unidade. Remova todos os outros candidatos dessas 3 casas.',
      it: 'Tre numeri specifici appaiono solo in tre caselle di un’unità. Elimina tutti gli altri candidati da quelle tre caselle.',
      ru: 'Три цифры встречаются только в трех клетках области. Удалите все остальные кандидаты из этих трех клеток.',
      hi: 'तीन विशिष्ट अंक केवल तीन सेल में आते हैं। उन तीनों सेल से अन्य सभी उम्मीदवारों को हटा दें।',
      ar: 'تظهر ثلاثة أرقام محددة في 3 خلايا فقط داخل الوحدة. احذف جميع المرشحات الأخرى من تلك الخلايا الثلاث.'
    }
  },
  'naked-quad': {
    badge: {
      en: 'Intermediate 2-7', ko: '중급 2-7', ja: '中級 2-7', zh: '中級 2-7', 'zh-CN': '中级 2-7',
      es: 'Media 2-7', de: 'Mittel 2-7', fr: 'Intermédiaire 2-7', pt: 'Intermediário 2-7',
      it: 'Intermedio 2-7', ru: 'Средний 2-7', hi: 'मध्यम 2-7', ar: 'متوسط 2-7'
    },
    title: {
      en: 'Naked Quad (4-Cell Subset)', ko: 'Naked Quad (단일 4개 조)', ja: 'ネイキッドクアッド (4国同盟)',
      zh: '顯性四數組 Naked Quad (4格鎖定4數)', 'zh-CN': '显性四数组 Naked Quad (4格锁定4数)',
      es: 'Cuarteto Desnudo (Naked Quad)', de: 'Naked Quad (Offener Vierer)',
      fr: 'Naked Quad (Quadruplet nu)', pt: 'Naked Quad (Quadra exposta)',
      it: 'Naked Quad (Quaterna nuda)', ru: 'Открытая четверка (Naked Quad)',
      hi: 'नेकेड क्वाड (4 सेल में 4 उम्मीदवार)', ar: 'الرباعي المكشوف (4 أرقام في 4 خلايا)'
    },
    desc: {
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
    badge: {
      en: 'Intermediate 2-8', ko: '중급 2-8', ja: '中級 2-8', zh: '中級 2-8', 'zh-CN': '中级 2-8',
      es: 'Media 2-8', de: 'Mittel 2-8', fr: 'Intermédiaire 2-8', pt: 'Intermediário 2-8',
      it: 'Intermedio 2-8', ru: 'Средний 2-8', hi: 'मध्यम 2-8', ar: 'متوسط 2-8'
    },
    title: {
      en: 'Hidden Quad (4 Hidden Digits)', ko: 'Hidden Quad (숨은 4개 조)', ja: 'ヒドゥンクアッド (隠れ4国同盟)',
      zh: '隱性四數組 Hidden Quad (隱藏四數)', 'zh-CN': '隐性四数组 Hidden Quad (隐藏四数)',
      es: 'Cuarteto Oculto (Hidden Quad)', de: 'Hidden Quad (Versteckter Vierer)',
      fr: 'Hidden Quad (Quadruplet caché)', pt: 'Hidden Quad (Quadra oculta)',
      it: 'Hidden Quad (Quaterna nascosta)', ru: 'Скрытая четверка (Hidden Quad)',
      hi: 'हिडन क्वाड (4 छिपे हुए अंक)', ar: 'الرباعي المخفي (4 أرقام مقفلة)'
    },
    desc: {
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
  }
};

console.log('Writing Stage 1 & Stage 2 translation updater...');
