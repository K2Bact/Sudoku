import fs from 'fs';
import path from 'path';
import { serializeDiagramData } from './compact_serializer.mjs';

export const STAGE2_PAIRS_DIAGRAMS = {
  'naked-pair': {
    label: {
      ko: '📍 Naked Pair: 2개 셀이 후보수 [3,8]만 독점 ➔ 타 칸 [3,8] 소거',
      en: '📍 Naked Pair: 2 cells lock [3,8] ➔ Eliminate [3,8] elsewhere',
      ja: '📍 ネイキッドペア: 2マスが [3,8] を独占 ➔ 他マスから [3,8] 消去',
      zh: '📍 顯性數對: 2 格獨佔候選數 [3,8] ➔ 排除其他格子的 [3,8]',
      'zh-CN': '📍 显性数对: 2 格独占候选数 [3,8] ➔ 排除其他格子的 [3,8]',
      es: '📍 Par desnudo: 2 casillas reservan [3,8] ➔ Eliminar [3,8] en el resto',
      de: '📍 Offenes Paar: 2 Felder sperren [3,8] ➔ [3,8] anderswo ausschließen',
      fr: '📍 Paire nue : 2 cases verrouillent [3,8] ➔ Éliminer [3,8] ailleurs',
      pt: '📍 Par nu: 2 casas bloqueiam [3,8] ➔ Eliminar [3,8] nas outras casas',
      it: '📍 Coppia nuda: 2 caselle bloccano [3,8] ➔ Elimina [3,8] altrove',
      ru: '📍 Открытая пара: 2 клетки блокируют [3,8] ➔ Исключить [3,8] в других клетках',
      hi: '📍 नेकेड पेयर: 2 सेल [3,8] को लॉक करते हैं ➔ अन्य सेलों से [3,8] हटाएं',
      ar: '📍 الزوج المكشوف: خليتان تقفلان [3,8] ➔ استبعاد [3,8] من باقي الخلايا'
    },
    step1Tab: {
      ko: '1단계: [3,8] 페어 발견',
      en: 'Step 1: Spot Pair',
      ja: 'ステップ1: ペア発見',
      zh: '第1步：發現數對',
      'zh-CN': '第1步：发现数对',
      es: 'Paso 1: Detectar par',
      de: 'Schritt 1: Paar finden',
      fr: 'Étape 1 : Repérer la paire',
      pt: 'Passo 1: Detectar o par',
      it: 'Passo 1: Trova la coppia',
      ru: 'Шаг 1: Найти пару',
      hi: 'चरण 1: जोड़ा खोजें',
      ar: 'الخطوة 1: العثور على الزوج'
    },
    step2Tab: {
      ko: '2단계: [5] 확정 소거',
      en: 'Step 2: Solve [5]',
      ja: 'ステップ2: [5]確定',
      zh: '第2步：確定答案 [5]',
      'zh-CN': '第2步：确定答案 [5]',
      es: 'Paso 2: Resolver [5]',
      de: 'Schritt 2: [5] lösen',
      fr: 'Étape 2 : Résoudre [5]',
      pt: 'Passo 2: Resolver [5]',
      it: 'Passo 2: Risolvi [5]',
      ru: 'Шаг 2: Решить [5]',
      hi: 'चरण 2: [5] हल करें',
      ar: 'الخطوة 2: حل [5]'
    },
    step1Caption: {
      ko: '같은 줄에서 파란색 2개 셀이 후보수 연필메모 [3, 8]만을 독점하므로, 이 줄의 다른 칸에서 3과 8 후보수가 소거 대상으로 표시됩니다.',
      en: 'In this row, 2 blue cells exclusively lock candidates [3, 8], targeting 3 & 8 for elimination.',
      ja: '同一行の青い2マスが候補数 [3, 8] を独占するため、同ライン上の他マスから 3 と 8 が消去対象になります。',
      zh: '同一行中 2 個藍色格子獨佔候選數筆記 [3, 8]，同行的其他空格中 3 與 8 將被標記為排除對象。',
      'zh-CN': '同一行中 2 个蓝色格子独占候选数笔记 [3, 8]，同行的其他空格中 3 与 8 将被标记为排除对象。',
      es: 'En esta fila, 2 casillas azules reservan exclusivamente [3, 8], marcando el 3 y el 8 para su eliminación.',
      de: 'In dieser Zeile sperren 2 blaue Felder exklusiv die Kandidaten [3, 8], wodurch 3 und 8 in anderen Feldern ausgeschlossen werden.',
      fr: 'Dans cette ligne, 2 cases bleues verrouillent exclusivement les candidats [3, 8], ciblant 3 et 8 pour élimination.',
      pt: 'Nesta linha, 2 casas azuis bloqueiam exclusivamente os candidatos [3, 8], marcando 3 e 8 para eliminação.',
      it: 'In questa riga, 2 caselle blu bloccano esclusivamente i candidati [3, 8], contrassegnando 3 e 8 per l’eliminazione.',
      ru: 'В этой строке 2 синие клетки блокируют кандидатов [3, 8], отмечая 3 и 8 для исключения в других клетках.',
      hi: 'इस पंक्ति में, 2 नीले सेल विशेष रूप से उम्मीदवारों [3, 8] को लॉक करते हैं, जिससे अन्य सेलों से 3 और 8 हटाए जाते हैं।',
      ar: 'في هذا الصف، تقفل خليتان زرقاوان المرشحين [3، 8] بشكل حصري، مما يستبعد 3 و 8 من الخلايا الأخرى.'
    },
    step2Caption: {
      ko: '3과 8이 소거된 중앙 칸에서 유일하게 남은 정답 [5]가 확정됩니다.',
      en: 'Eliminating 3 and 8 leaves the unique answer [5] confirmed in the target cell.',
      ja: '3と8が消去された中央のマスで、唯一残った正解 [5] が確定します。',
      zh: '排除 3 與 8 之後，中央空格中唯一留下的正解 [5] 得以確認。',
      'zh-CN': '排除 3 与 8 之后，中央空格中唯一留下的正解 [5] 得以确认。',
      es: 'Al eliminar el 3 y el 8, queda confirmada la respuesta única [5] en la casilla objetivo.',
      de: 'Nach dem Ausschluss von 3 und 8 bleibt im Zielfeld nur noch die eindeutige Antwort [5] übrig.',
      fr: 'L’élimination de 3 et 8 confirme la réponse unique [5] dans la case cible.',
      pt: 'Eliminar 3 e 8 deixa a resposta única [5] confirmada na casa alvo.',
      it: 'L’eliminazione di 3 e 8 lascia la risposta univoca [5] confermata nella casella bersaglio.',
      ru: 'Исключение 3 и 8 подтверждает единственный ответ [5] в целевой клетке.',
      hi: '3 और 8 को हटाने पर लक्ष्य सेल में एकमात्र उत्तर [5] की पुष्टि होती है।',
      ar: 'استبعاد 3 و 8 يترك الإجابة الصحيحة الوحيدة [5] مؤكدة في الخلية المستهدفة.'
    }
  },
  'hidden-pair': {
    label: {
      ko: '📍 Hidden Pair: 후보수 메모 속 [3,8] 독점 발견 ➔ 잡동사니 제거',
      en: '📍 Hidden Pair: [3,8] found only in 2 cells ➔ Eliminate extra notes',
      ja: '📍 ヒドゥンペア: メモ内の [3,8] 独占を発見 ➔ 余分な候補を消去',
      zh: '📍 隱性數對: 發現筆記中唯 2 格包含 [3,8] ➔ 清除多餘候選數',
      'zh-CN': '📍 隐性数对: 发现笔记中唯 2 格包含 [3,8] ➔ 清除多余候选数',
      es: '📍 Par oculto: [3,8] presente solo en 2 casillas ➔ Eliminar notas sobrantes',
      de: '📍 Verstecktes Paar: [3,8] nur in 2 Feldern vorhanden ➔ Zusätzliche Notizen entfernen',
      fr: '📍 Paire cachée : [3,8] présent dans seulement 2 cases ➔ Éliminer les notes superflues',
      pt: '📍 Par oculto: [3,8] presente apenas em 2 casas ➔ Eliminar anotações extras',
      it: '📍 Coppia nascosta: [3,8] presente solo in 2 caselle ➔ Elimina le note extra',
      ru: '📍 Скрытая пара: [3,8] только в 2 клетках ➔ Удалить лишние заметки',
      hi: '📍 हिडन पेयर: [3,8] केवल 2 सेल में मौजूद ➔ अतिरिक्त नोट्स हटाएं',
      ar: '📍 الزوج المخفي: [3,8] موجود في خليتين فقط ➔ استبعاد الملاحظات الزائدة'
    },
    step1Tab: {
      ko: '1단계: [3,8] 숨은 발견',
      en: 'Step 1: Spot [3,8]',
      ja: 'ステップ1: [3,8]発見',
      zh: '第1步：發現隱藏的 [3,8]',
      'zh-CN': '第1步：发现隐藏的 [3,8]',
      es: 'Paso 1: Detectar [3,8]',
      de: 'Schritt 1: [3,8] entdecken',
      fr: 'Étape 1 : Repérer [3,8]',
      pt: 'Passo 1: Detectar [3,8]',
      it: 'Passo 1: Trova [3,8]',
      ru: 'Шаг 1: Найти [3,8]',
      hi: 'चरण 1: [3,8] खोजें',
      ar: 'الخطوة 1: العثور على [3,8]'
    },
    step2Tab: {
      ko: '2단계: 잡동사니 제거',
      en: 'Step 2: Clean Extra',
      ja: 'ステップ2: 余分な候補消去',
      zh: '第2步：清除多餘候選數',
      'zh-CN': '第2步：清除多余候选数',
      es: 'Paso 2: Limpiar sobrantes',
      de: 'Schritt 2: Notizen bereinigen',
      fr: 'Étape 2 : Nettoyer les notes',
      pt: 'Passo 2: Limpar extras',
      it: 'Passo 2: Pulisci note extra',
      ru: 'Шаг 2: Очистить лишнее',
      hi: 'चरण 2: अतिरिक्त हटाएं',
      ar: 'الخطوة 2: تنظيف الزوائد'
    },
    step1Caption: {
      ko: '[1단계: 연필메모 속 [3,8] 발견] 1번과 3번 셀의 연필메모에 다른 후보가 섞여있지만, 이 줄 전체에서 [3, 8]이 들어갈 수 있는 칸은 오직 이 2개뿐입니다.',
      en: '[Step 1: Spot [3,8]] Although extra candidates exist, [3, 8] only fit in these 2 cells across the row.',
      ja: '[ステップ1: [3,8]発見] 余分な候補がありますが、この行で [3, 8] が入れるマスはこの2マスだけです。',
      zh: '[第1步：發現筆記中的 [3,8]] 雖然混雜了其他候選數，但整行中能填入 [3, 8] 的空格僅有這 2 個。',
      'zh-CN': '[第1步：发现笔记中的 [3,8]] 虽然混杂了其他候选数，但整行中能填入 [3, 8] 的空格仅有这 2 个。',
      es: '[Paso 1: Detección de [3,8]] Aunque existen candidatos extra, el [3, 8] solo cabe en estas 2 casillas.',
      de: '[Schritt 1: [3,8] entdecken] Obwohl andere Kandidaten vorhanden sind, passen [3, 8] in dieser Zeile nur in diese 2 Felder.',
      fr: '[Étape 1 : Repérer [3,8]] Bien que d’autres candidats existent, [3, 8] ne peuvent aller que dans ces 2 cases.',
      pt: '[Passo 1: Detectar [3,8]] Embora haja outros candidatos, [3, 8] cabem apenas nestas 2 casas da linha.',
      it: '[Passo 1: Trova [3,8]] Anche se ci sono altri candidati, [3, 8] possono stare solo in queste 2 caselle della riga.',
      ru: '[Шаг 1: Найти [3,8]] Хотя есть другие кандидаты, [3, 8] во всей строке могут быть только в этих 2 клетках.',
      hi: '[चरण 1: [3,8] खोजें] अतिरिक्त उम्मीदवारों के बावजूद, पूरी पंक्ति में [3, 8] केवल इन्हीं 2 सेलों में आ सकते हैं।',
      ar: '[الخطوة 1: العثور على [3,8]] على الرغم من وجود مرشحين آخرين، فإن [3، 8] يناسبان هاتين الخليتين فقط في الصف.'
    },
    step2Caption: {
      ko: '[2단계: 잡동사니 후보 소거!] 이 2개 셀에서 쓸데없는 후보들이 제거되고 Naked Pair [3, 8]만 정제 확정됩니다!',
      en: '[Step 2: Clean Extra!] Extra notes are eliminated, leaving a pure Naked Pair [3, 8]!',
      ja: '[ステップ2: 余分な候補消去!] 余分な候補が消去され、純粋なネイキッドペア [3, 8] として確定します！',
      zh: '[第2步：排除多餘候選數！] 這 2 個格子中多餘的候選數被排除，轉化為純粹的顯性數對 [3, 8]！',
      'zh-CN': '[第2步：排除多余候选数！] 这 2 个格子中多余的候选数被排除，转化为纯粹的显性数对 [3, 8]！',
      es: '[Paso 2: ¡Limpieza!] Las notas adicionales se descartan, dejando un par desnudo [3, 8] puro.',
      de: '[Schritt 2: Notizen bereinigen!] Überflüssige Notizen werden entfernt, sodass ein reines offenes Paar [3, 8] entsteht!',
      fr: '[Étape 2 : Nettoyage !] Les notes superflues sont éliminées, laissant une paire nue pure [3, 8] !',
      pt: '[Passo 2: Limpeza!] As anotações extras são eliminadas, restando um par nu [3, 8] puro!',
      it: '[Passo 2: Pulizia!] Le note superflue vengono eliminate, lasciando una coppia nuda pura [3, 8]!',
      ru: '[Шаг 2: Очистка лишнего!] Лишние заметки удаляются, оставляя чистую открытую пару [3, 8]!',
      hi: '[चरण 2: अतिरिक्त हटाएं!] अतिरिक्त नोट्स हटा दिए जाते हैं, जिससे एक शुद्ध नेकेड पेयर [3, 8] बचता है!',
      ar: '[الخطوة 2: تنظيف الزوائد!] يتم حذف الملاحظات الزائدة، ليتبقى زوج مكشوف نقي [3، 8]!'
    }
  },
  'pointing-pairs': {
    label: {
      ko: '📍 Pointing: 위 박스 2열에 4 정렬 ➔ 아래 박스 2열 [4] 소거',
      en: '📍 Pointing: Top box locks 4 in Col 2 ➔ Bottom box Col 2 eliminates [4]',
      ja: '📍 ポインティング: 上ブロック2列目に4が固定 ➔ 下ブロック2列目から [4] 消去',
      zh: '📍 指向數對: 上宮第 2 列鎖定 4 ➔ 排除下宮第 2 列的 [4]',
      'zh-CN': '📍 指向数对: 上宫第 2 列锁定 4 ➔ 排除下宫第 2 列的 [4]',
      es: '📍 Par apuntador: Bloque superior fija 4 en col 2 ➔ Bloque inferior elimina [4]',
      de: '📍 Zeigendes Paar: Oberer Block sperrt 4 in Spalte 2 ➔ Unterer Block eliminiert [4]',
      fr: '📍 Paire pointée : Le bloc du haut verrouille 4 en col 2 ➔ Le bloc du bas élimine [4]',
      pt: '📍 Par apontador: Bloco superior fixa 4 na col 2 ➔ Bloco inferior elimina [4]',
      it: '📍 Coppia puntatore: Il blocco superiore blocca 4 in col 2 ➔ Il blocco inferiore elimina [4]',
      ru: '📍 Указывающая пара: Верхний блок фиксирует 4 в столбце 2 ➔ Нижний блок исключает [4]',
      hi: '📍 पॉइंटिंग पेयर: शीर्ष बॉक्स कॉलम 2 में 4 लॉक करता है ➔ निचला बॉक्स [4] हटाता है',
      ar: '📍 الزوج المؤشر: المربع العلوي يقفل 4 في العمود 2 ➔ المربع السفلي يستبعد [4]'
    },
    step1Tab: {
      ko: '1단계: 위 박스 4 정렬',
      en: 'Step 1: Locked 4',
      ja: 'ステップ1: 4固定',
      zh: '第1步：鎖定 4',
      'zh-CN': '第1步：锁定 4',
      es: 'Paso 1: 4 fijado',
      de: 'Schritt 1: 4 gesperrt',
      fr: 'Étape 1 : 4 verrouillé',
      pt: 'Passo 1: 4 bloqueado',
      it: 'Passo 1: 4 bloccato',
      ru: 'Шаг 1: 4 заблокирована',
      hi: 'चरण 1: 4 लॉक',
      ar: 'الخطوة 1: قفل 4'
    },
    step2Tab: {
      ko: '2단계: 아래 박스 [6] 확정',
      en: 'Step 2: Solve [6]',
      ja: 'ステップ2: [6]確定',
      zh: '第2步：確定答案 [6]',
      'zh-CN': '第2步：确定答案 [6]',
      es: 'Paso 2: Resolver [6]',
      de: 'Schritt 2: [6] lösen',
      fr: 'Étape 2 : Résoudre [6]',
      pt: 'Passo 2: Resolver [6]',
      it: 'Passo 2: Risolvi [6]',
      ru: 'Шаг 2: Решить [6]',
      hi: 'चरण 2: [6] हल करें',
      ar: 'الخطوة 2: حل [6]'
    },
    step1Tag: {
      ko: '위 박스 (후보수 4가 2열에만 일직선 정렬)',
      en: 'Top Box (4 aligned in column 2)',
      ja: '上ブロック (4が2列目に整列)',
      zh: '上宮（候選數 4 僅在第 2 列成直線對齊）',
      'zh-CN': '上宫（候选数 4 仅在第 2 列成直线对齐）',
      es: 'Bloque superior (4 alineado en columna 2)',
      de: 'Oberer Block (4 in Spalte 2 ausgerichtet)',
      fr: 'Bloc supérieur (4 aligné en colonne 2)',
      pt: 'Bloco superior (4 alinhado na coluna 2)',
      it: 'Blocco superiore (4 allineato nella colonna 2)',
      ru: 'Верхний блок (4 выровнена в столбце 2)',
      hi: 'शीर्ष बॉक्स (कॉलम 2 में 4 संरेखित)',
      ar: 'المربع العلوي (4 محاذاة في العمود 2)'
    },
    step2Tag: {
      ko: '아래 박스 (2열에서 4 소거)',
      en: 'Bottom Box (4 eliminated from col 2)',
      ja: '下ブロック (2列目から4消去)',
      zh: '下宮（第 2 列排除 4）',
      'zh-CN': '下宫（第 2 列排除 4）',
      es: 'Bloque inferior (4 eliminado de col 2)',
      de: 'Unterer Block (4 aus Spalte 2 entfernt)',
      fr: 'Bloc inférieur (4 éliminé de la col 2)',
      pt: 'Bloco inferior (4 eliminado da col 2)',
      it: 'Blocco inferiore (4 eliminato dalla col 2)',
      ru: 'Нижний блок (4 исключена из столбца 2)',
      hi: 'निचला बॉक्स (कॉलम 2 से 4 हटाया गया)',
      ar: 'المربع السفلي (استبعاد 4 من العمود 2)'
    },
    step1Caption: {
      ko: '위쪽 박스에서 후보수 4가 2열에만 갇혀 있어, 2열의 다른 곳에는 4가 들어올 수 없습니다.',
      en: 'In the top box, candidate 4 is locked in column 2, preventing 4 anywhere else in column 2.',
      ja: '上ブロックで候補数 4 が2列目のみに固定されているため、同列の他のマスには 4 は入れません。',
      zh: '上方九宮格中候選數 4 被鎖定於第 2 列，因此整條第 2 列的其他位置不能再填入 4。',
      'zh-CN': '上方九宫格中候选数 4 被锁定于第 2 列，因此整条第 2 列的其他位置不能再填入 4。',
      es: 'En el bloque superior el candidato 4 está fijado en la columna 2, impidiendo el 4 en el resto de la columna.',
      de: 'Im oberen Block ist die 4 auf Spalte 2 beschränkt, sodass in der restlichen Spalte 2 keine 4 stehen kann.',
      fr: 'Dans le bloc du haut, le candidat 4 est limité à la colonne 2, empêchant le 4 ailleurs dans cette colonne.',
      pt: 'No bloco superior, o candidato 4 está restrito à coluna 2, impedindo o 4 no restante da coluna.',
      it: 'Nel blocco superiore, il candidato 4 è limitato alla colonna 2, escludendo il 4 nel resto della colonna.',
      ru: 'В верхнем блоке кандидат 4 заблокирован в столбце 2, что исключает 4 из остальных клеток столбца 2.',
      hi: 'शीर्ष बॉक्स में उम्मीदवार 4 कॉलम 2 में बंद है, जिससे कॉलम 2 में कहीं और 4 नहीं आ सकता।',
      ar: 'في المربع العلوي، ينحصر المرشح 4 في العمود 2، مما يمنع وجود 4 في أي مكان آخر بالعمود 2.'
    },
    step2Caption: {
      ko: '아래쪽 박스 2열에서 4가 소거되어 단독으로 남은 정답 [6]이 확정됩니다.',
      en: 'Eliminating 4 from column 2 in the bottom box reveals the confirmed answer [6].',
      ja: '下ブロックの2列目から4が消去され、残った正解 [6] が確定します。',
      zh: '下方九宮格第 2 列排除 4 後，單獨留下的正解 [6] 得以確認。',
      'zh-CN': '下方九宫格第 2 列排除 4 后，单独留下的正解 [6] 得以确认。',
      es: 'Al eliminar el 4 de la columna 2 en el bloque inferior, se confirma la respuesta [6].',
      de: 'Durch das Entfernen der 4 aus Spalte 2 im unteren Block wird die Antwort [6] bestätigt.',
      fr: 'L’élimination du 4 dans la colonne 2 du bloc inférieur confirme la réponse [6].',
      pt: 'Eliminar o 4 da coluna 2 no bloco inferior confirma a resposta [6].',
      it: 'Eliminando il 4 dalla colonna 2 nel blocco inferiore si conferma la risposta [6].',
      ru: 'Исключение 4 из столбца 2 в нижнем блоке подтверждает ответ [6].',
      hi: 'निचले बॉक्स के कॉलम 2 से 4 हटाने पर पुष्टि किया गया उत्तर [6] प्राप्त होता है।',
      ar: 'استبعاد 4 من العمود 2 في المربع السفلي يكشف عن الإجابة المؤكدة [6].'
    }
  },
  'claiming': {
    label: {
      ko: '📍 Claiming: 1행의 8이 박스 안으로 제한 ➔ 박스 내 다른 8 소거',
      en: '📍 Claiming: Row 1 candidate locked in Box ➔ Eliminate from Box',
      ja: '📍 クレイミング: 1行目の8がブロック内に限定 ➔ ブロック内の他 8 消去',
      zh: '📍 行列閉鎖: 第 1 行的 8 被限制於九宮格內 ➔ 排除九宮格內其他位置的 8',
      'zh-CN': '📍 行列闭锁: 第 1 行的 8 被限制于九宫格内 ➔ 排除九宫格内其他位置的 8',
      es: '📍 Par reclamador: Candidato 8 de fila 1 restringido al bloque ➔ Eliminar del bloque',
      de: '📍 Anspruch-Paar: Kandidat 8 aus Zeile 1 auf Block beschränkt ➔ Aus restlichem Block entfernen',
      fr: '📍 Paire revendiquée : Candidat 8 de ligne 1 limité au bloc ➔ Éliminer du reste du bloc',
      pt: '📍 Par reivindicador: Candidato 8 da linha 1 restrito ao bloco ➔ Eliminar do bloco',
      it: '📍 Coppia rivendicatrice: Candidato 8 della riga 1 limitato al blocco ➔ Elimina dal blocco',
      ru: '📍 Претендующая пара: Кандидат 8 строки 1 ограничен блоком ➔ Исключить из остального блока',
      hi: '📍 क्लेमिंग पेयर: पंक्ति 1 का 8 बॉक्स में सीमित ➔ बॉक्स से शेष 8 हटाएं',
      ar: '📍 الزوج المطالب: المرشح 8 في الصف 1 مقفل في المربع ➔ استبعاده من باقي المربع'
    },
    step1Tab: {
      ko: '1단계: 1행 8 제한',
      en: 'Step 1: Row Scan',
      ja: 'ステップ1: 行観察',
      zh: '第1步：橫行觀察',
      'zh-CN': '第1步：横行观察',
      es: 'Paso 1: Explorar fila',
      de: 'Schritt 1: Zeilen-Scan',
      fr: 'Étape 1 : Analyse de ligne',
      pt: 'Passo 1: Analisar linha',
      it: 'Passo 1: Esame riga',
      ru: 'Шаг 1: Анализ строки',
      hi: 'चरण 1: पंक्ति स्कैन',
      ar: 'الخطوة 1: فحص الصف'
    },
    step2Tab: {
      ko: '2단계: 박스 내 [3] 확정',
      en: 'Step 2: Solve [3]',
      ja: 'ステップ2: [3]確定',
      zh: '第2步：確定答案 [3]',
      'zh-CN': '第2步：确定答案 [3]',
      es: 'Paso 2: Resolver [3]',
      de: 'Schritt 2: [3] lösen',
      fr: 'Étape 2 : Résoudre [3]',
      pt: 'Passo 2: Resolver [3]',
      it: 'Passo 2: Risolvi [3]',
      ru: 'Шаг 2: Решить [3]',
      hi: 'चरण 2: [3] हल करें',
      ar: 'الخطوة 2: حل [3]'
    },
    step1Tag: {
      ko: '1행의 8 후보수가 이 박스 안 1행에만 존재',
      en: 'Row 8 candidate exists only in this box\'s top row',
      ja: '1行目の候補数8がこのブロック内1行目にのみ存在',
      zh: '第 1 行的候選數 8 僅存在於此九宮格的第 1 行',
      'zh-CN': '第 1 行的候选数 8 仅存在于此九宫格的第 1 行',
      es: 'El candidato 8 de la fila solo existe en la fila superior del bloque',
      de: 'Der Kandidat 8 dieser Zeile existiert nur in der oberen Zeile dieses Blocks',
      fr: 'Le candidat 8 de la ligne n’existe que dans la ligne supérieure de ce bloc',
      pt: 'O candidato 8 da linha existe apenas na linha superior deste bloco',
      it: 'Il candidato 8 della riga esiste solo nella riga superiore di questo blocco',
      ru: 'Кандидат 8 строки существует только в верхней строке этого блока',
      hi: 'पंक्ति का 8 उम्मीदवार केवल इस बॉक्स की शीर्ष पंक्ति में मौजूद है',
      ar: 'المرشح 8 في الصف موجود فقط في الصف العلوي من هذا المربع'
    },
    step1Caption: {
      ko: '1행 전체에서 8이 들어갈 수 있는 자리가 이 박스 안으로 한정되어 있습니다.',
      en: 'In Row 1, candidate 8 is restricted entirely within this 3x3 box.',
      ja: '1行目全体で8が入れる位置がこのブロック内に限定されています。',
      zh: '整條第 1 行中能填入 8 的位置被完全限制在此九宮格內。',
      'zh-CN': '整条第 1 行中能填入 8 的位置被完全限制在此九宫格内。',
      es: 'En la fila 1, el candidato 8 queda limitado por completo a este bloque 3x3.',
      de: 'In Zeile 1 ist der Kandidat 8 vollständig auf diesen 3x3-Block beschränkt.',
      fr: 'Dans la ligne 1, le candidat 8 est entièrement restreint à ce bloc 3x3.',
      pt: 'Na linha 1, o candidato 8 está totalmente restrito a este bloco 3x3.',
      it: 'Nella riga 1, il candidato 8 è completamente limitato a questo blocco 3x3.',
      ru: 'В строке 1 кандидат 8 полностью ограничен рамками этого блока 3x3.',
      hi: 'पंक्ति 1 में, उम्मीदवार 8 पूरी तरह से इस 3x3 बॉक्स के अंदर सीमित है।',
      ar: 'في الصف 1، ينحصر المرشح 8 بالكامل داخل هذا المربع 3x3.'
    },
    step2Caption: {
      ko: '이 박스의 다른 칸에서 8이 소거되어 정답 [3]이 확정됩니다.',
      en: 'Eliminating 8 elsewhere in the box leaves naked [3] confirmed.',
      ja: '同ブロックの他マスから8が消去され、正解 [3] が確定します。',
      zh: '排除此九宮格內其他位置的 8 後，正解 [3] 得以確定。',
      'zh-CN': '排除此九宫格内其他位置的 8 后，正解 [3] 得以确定。',
      es: 'Al eliminar el 8 del resto del bloque, queda confirmada la respuesta [3].',
      de: 'Das Entfernen der 8 aus den anderen Feldern des Blocks bestätigt die [3].',
      fr: 'L’élimination du 8 ailleurs dans le bloc confirme le [3].',
      pt: 'Eliminar o 8 nas outras casas do bloco confirma a resposta [3].',
      it: 'Eliminando l’8 altrove nel blocco si conferma la risposta [3].',
      ru: 'Исключение 8 из остальных клеток блока подтверждает ответ [3].',
      hi: 'बॉक्स में अन्यत्र 8 हटाने से निश्चित [3] की पुष्टि होती है।',
      ar: 'استبعاد 8 من باقي خلايا المربع يؤكد الإجابة [3].'
    }
  }
};

export const STAGE2_TUPLES_DIAGRAMS = {
  'naked-triple': {
    label: {
      ko: '📍 Naked Triple: 3개 셀이 [1,2,3] 분할 독점 ➔ [7] 확정',
      en: '📍 Naked Triple: 3 cells lock [1,2,3] ➔ Solve [7]',
      ja: '📍 ネイキッドトリプル: 3マスが [1,2,3] 分割独占 ➔ [7] 確定',
      zh: '📍 顯性三數組: 3 格共同獨佔 [1,2,3] ➔ 確定 [7]',
      'zh-CN': '📍 显性三数组: 3 格共同独占 [1,2,3] ➔ 确定 [7]',
      es: '📍 Trío desnudo: 3 casillas bloquean [1,2,3] ➔ Resolver [7]',
      de: '📍 Offener Dreier: 3 Felder sperren [1,2,3] ➔ [7] lösen',
      fr: '📍 Triplet nu : 3 cases verrouillent [1,2,3] ➔ Résoudre [7]',
      pt: '📍 Trinca nua: 3 casas bloqueiam [1,2,3] ➔ Resolver [7]',
      it: '📍 Terna nuda: 3 caselle bloccano [1,2,3] ➔ Risolvi [7]',
      ru: '📍 Открытая тройка: 3 клетки блокируют [1,2,3] ➔ Решение [7]',
      hi: '📍 नेकेड ट्रिपल: 3 सेल [1,2,3] को लॉक करते हैं ➔ [7] हल करें',
      ar: '📍 الثلاثي المكشوف: 3 خلايا تقفل [1,2,3] ➔ حل [7]'
    },
    step1Tab: {
      ko: '1단계: [1,2,3] 독점',
      en: 'Step 1: Lock [1,2,3]',
      ja: 'ステップ1: [1,2,3]独占',
      zh: '第1步：鎖定 [1,2,3]',
      'zh-CN': '第1步：锁定 [1,2,3]',
      es: 'Paso 1: Bloquear [1,2,3]',
      de: 'Schritt 1: [1,2,3] sperren',
      fr: 'Étape 1 : Verrouiller [1,2,3]',
      pt: 'Passo 1: Bloquear [1,2,3]',
      it: 'Passo 1: Blocca [1,2,3]',
      ru: 'Шаг 1: Блокировка [1,2,3]',
      hi: 'चरण 1: [1,2,3] लॉक',
      ar: 'الخطوة 1: قفل [1,2,3]'
    },
    step2Tab: {
      ko: '2단계: [7] 확정 소거',
      en: 'Step 2: Solve [7]',
      ja: 'ステップ2: [7]確定',
      zh: '第2步：確定答案 [7]',
      'zh-CN': '第2步：确定答案 [7]',
      es: 'Paso 2: Resolver [7]',
      de: 'Schritt 2: [7] lösen',
      fr: 'Étape 2 : Résoudre [7]',
      pt: 'Passo 2: Resolver [7]',
      it: 'Passo 2: Risolvi [7]',
      ru: 'Шаг 2: Решить [7]',
      hi: 'चरण 2: [7] हल करें',
      ar: 'الخطوة 2: حل [7]'
    },
    step1Caption: {
      ko: '3개 셀이 (1,2), (2,3), (1,3)으로 [1,2,3]을 독점합니다.',
      en: '3 cells lock candidates {1,2,3} across this row.',
      ja: '3マスが (1,2), (2,3), (1,3) で [1,2,3] を独占します。',
      zh: '3 個格子以 (1,2), (2,3), (1,3) 共同鎖定候選數 {1,2,3}。',
      'zh-CN': '3 个格子以 (1,2), (2,3), (1,3) 共同锁定候选数 {1,2,3}。',
      es: '3 casillas aseguran los candidatos {1,2,3} en esta fila.',
      de: '3 Felder sperren die Kandidaten {1,2,3} in dieser Zeile.',
      fr: '3 cases verrouillent les candidats {1,2,3} sur cette ligne.',
      pt: '3 casas bloqueiam os candidatos {1,2,3} nesta linha.',
      it: '3 caselle bloccano i candidati {1,2,3} in questa riga.',
      ru: '3 клетки блокируют кандидатов {1,2,3} в этой строке.',
      hi: '3 सेल इस पंक्ति में उम्मीदवारों {1,2,3} को लॉक करते हैं।',
      ar: '3 خلايا تقفل المرشحين {1،2،3} عبر هذا الصف.'
    },
    step2Caption: {
      ko: '다른 칸에서 1,2,3이 소거되어 유일하게 남은 정답 [7]이 확정됩니다.',
      en: 'Eliminating 1,2,3 leaves the unique answer [7] confirmed.',
      ja: '他マスから 1,2,3 が消去され、残った正解 [7] が確定します。',
      zh: '排除 1,2,3 後，唯一留下的正解 [7] 得以確認。',
      'zh-CN': '排除 1,2,3 后，唯一留下的正解 [7] 得以确认。',
      es: 'Al eliminar 1,2,3, queda confirmada la respuesta única [7].',
      de: 'Das Ausschließen von 1, 2 und 3 bestätigt die eindeutige Antwort [7].',
      fr: 'L’élimination de 1, 2 et 3 confirme la réponse unique [7].',
      pt: 'Eliminar 1, 2 e 3 confirma a resposta única [7].',
      it: 'Eliminando 1, 2 e 3 si conferma la risposta univoca [7].',
      ru: 'Исключение 1, 2 и 3 подтверждает единственный ответ [7].',
      hi: '1, 2, 3 हटाने से एकमात्र उत्तर [7] की पुष्टि होती है।',
      ar: 'استبعاد 1 و 2 و 3 يترك الإجابة الصحيحة الوحيدة [7] مؤكدة.'
    }
  },
  'hidden-triple': {
    label: {
      ko: '📍 Hidden Triple: 메모 속 [2,5,8] 독점 ➔ [5] 확정',
      en: '📍 Hidden Triple: [2,5,8] in 3 cells ➔ Eliminate extra notes',
      ja: '📍 ヒドゥントリプル: メモ内 [2,5,8] 独占 ➔ 余分な候補消去',
      zh: '📍 隱性三數組: 筆記中唯 3 格包含 [2,5,8] ➔ 清除多餘候選數',
      'zh-CN': '📍 隐性三数组: 笔记中唯 3 格包含 [2,5,8] ➔ 清除多余候选数',
      es: '📍 Trío oculto: [2,5,8] en 3 casillas ➔ Eliminar notas adicionales',
      de: '📍 Versteckter Dreier: [2,5,8] in 3 Feldern ➔ Zusätzliche Notizen entfernen',
      fr: '📍 Triplet caché : [2,5,8] dans 3 cases ➔ Éliminer les notes superflues',
      pt: '📍 Trinca oculta: [2,5,8] em 3 casas ➔ Eliminar anotações extras',
      it: '📍 Terna nascosta: [2,5,8] in 3 caselle ➔ Elimina le note extra',
      ru: '📍 Скрытая тройка: [2,5,8] в 3 клетках ➔ Удалить лишние заметки',
      hi: '📍 हिडन ट्रिपल: 3 सेल में [2,5,8] ➔ अतिरिक्त नोट्स हटाएं',
      ar: '📍 الثلاثي المخفي: [2,5,8] في 3 خلايا ➔ استبعاد الملاحظات الزائدة'
    },
    step1Tab: {
      ko: '1단계: [2,5,8] 발견',
      en: 'Step 1: Spot [2,5,8]',
      ja: 'ステップ1: [2,5,8]発見',
      zh: '第1步：發現 [2,5,8]',
      'zh-CN': '第1步：发现 [2,5,8]',
      es: 'Paso 1: Detectar [2,5,8]',
      de: 'Schritt 1: [2,5,8] entdecken',
      fr: 'Étape 1 : Repérer [2,5,8]',
      pt: 'Passo 1: Detectar [2,5,8]',
      it: 'Passo 1: Trova [2,5,8]',
      ru: 'Шаг 1: Найти [2,5,8]',
      hi: 'चरण 1: [2,5,8] खोजें',
      ar: 'الخطوة 1: العثور على [2,5,8]'
    },
    step2Tab: {
      ko: '2단계: 정제 확정',
      en: 'Step 2: Clean & Solve',
      ja: 'ステップ2: 確定消去',
      zh: '第2步：精簡確立',
      'zh-CN': '第2步：精简确立',
      es: 'Paso 2: Limpiar y resolver',
      de: 'Schritt 2: Bereinigen & Lösen',
      fr: 'Étape 2 : Nettoyer & Résoudre',
      pt: 'Passo 2: Limpar e Resolver',
      it: 'Passo 2: Pulisci e Risolvi',
      ru: 'Шаг 2: Очистить и решить',
      hi: 'चरण 2: साफ करें और हल करें',
      ar: 'الخطوة 2: تنظيف وحل'
    },
    step1Caption: {
      ko: '이 줄에서 후보수 2, 5, 8이 들어갈 수 있는 칸은 오직 3개 셀뿐입니다.',
      en: 'Candidates 2, 5, 8 can only appear in 3 specific cells across this unit.',
      ja: 'この行で候補数 2, 5, 8 が入れるマスは指定された3マスのみです。',
      zh: '該單元中候選數 2, 5, 8 僅能出現在指定的 3 個空格中。',
      'zh-CN': '该单元中候选数 2, 5, 8 仅能出现在指定的 3 个空格中。',
      es: 'Los candidatos 2, 5, 8 solo pueden aparecer en 3 casillas concretas.',
      de: 'Die Kandidaten 2, 5, 8 können in dieser Einheit nur in 3 bestimmten Feldern vorkommen.',
      fr: 'Les candidats 2, 5, 8 ne peuvent apparaître que dans 3 cases spécifiques de cette unité.',
      pt: 'Os candidatos 2, 5, 8 só podem aparecer em 3 casas específicas nesta unidade.',
      it: 'I candidati 2, 5, 8 possono comparire solo in 3 caselle specifiche di questa unità.',
      ru: 'Кандидаты 2, 5, 8 могут находиться только в 3 определенных клетках этой зоны.',
      hi: 'उम्मीदवार 2, 5, 8 इस इकाई में केवल 3 विशिष्ट सेलों में ही आ सकते हैं।',
      ar: 'المرشحون 2 و 5 و 8 يمكن أن يظهروا في 3 خلايا محددة فقط داخل هذه الوحدة.'
    },
    step2Caption: {
      ko: '불필요한 후보들이 소거되고 순수한 [2,5,8] 삼중항이 확정됩니다.',
      en: 'Extra notes are eliminated, confirming a pure [2,5,8] triple.',
      ja: '不要なメモが消去され、純粋な [2,5,8] トリプルが確定します。',
      zh: '多餘筆記被清除，確立為純粹的 [2,5,8] 三數組。',
      'zh-CN': '多余笔记被清除，确立为纯粹的 [2,5,8] 三数组。',
      es: 'Se descartan las notas sobrantes, confirmando el trío [2,5,8] puro.',
      de: 'Überflüssige Notizen werden entfernt, wodurch ein reiner [2,5,8]-Dreier bestätigt wird.',
      fr: 'Les notes superflues sont éliminées, confirmant un triplet [2,5,8] pur.',
      pt: 'Anotações extras são eliminadas, confirmando uma trinca [2,5,8] pura.',
      it: 'Le note extra vengono eliminate, confermando una terna [2,5,8] pura.',
      ru: 'Лишние заметки удалены, что подтверждает чистую тройку [2,5,8].',
      hi: 'अतिरिक्त नोट्स हटा दिए गए हैं, जिससे शुद्ध [2,5,8] तिकड़ी की पुष्टि होती है।',
      ar: 'تم حذف الملاحظات الزائدة، مما يؤكد ثلاثياً نقياً [2،5،8].'
    }
  },
  'naked-quad': {
    label: {
      ko: '📍 Naked Quad: 4개 셀이 [1,2,3,4] 독점 ➔ [9] 확정',
      en: '📍 Naked Quad: 4 cells lock [1,2,3,4] ➔ Solve [9]',
      ja: '📍 ネイキッドクアッド: 4マスが [1,2,3,4] 独占 ➔ [9] 確定',
      zh: '📍 顯性四數組: 4 格共同獨佔 [1,2,3,4] ➔ 確定 [9]',
      'zh-CN': '📍 显性四数组: 4 格共同独占 [1,2,3,4] ➔ 确定 [9]',
      es: '📍 Cuarteto desnudo: 4 casillas bloquean [1,2,3,4] ➔ Resolver [9]',
      de: '📍 Offener Vierer: 4 Felder sperren [1,2,3,4] ➔ [9] lösen',
      fr: '📍 Quadruplet nu : 4 cases verrouillent [1,2,3,4] ➔ Résoudre [9]',
      pt: '📍 Quadra nua: 4 casas bloqueiam [1,2,3,4] ➔ Resolver [9]',
      it: '📍 Quartina nuda: 4 caselle bloccano [1,2,3,4] ➔ Risolvi [9]',
      ru: '📍 Открытая четверка: 4 клетки блокируют [1,2,3,4] ➔ Решение [9]',
      hi: '📍 नेकेड क्वाड: 4 सेल [1,2,3,4] को लॉक करते हैं ➔ [9] हल करें',
      ar: '📍 الرباعي المكشوف: 4 خلايا تقفل [1,2,3,4] ➔ حل [9]'
    },
    step1Tab: {
      ko: '1단계: [1,2,3,4] 독점',
      en: 'Step 1: Lock Quad',
      ja: 'ステップ1: 4マス独占',
      zh: '第1步：4 格鎖定',
      'zh-CN': '第1步：4 格锁定',
      es: 'Paso 1: Bloquear 4',
      de: 'Schritt 1: Vierer sperren',
      fr: 'Étape 1 : Verrouiller le quad',
      pt: 'Passo 1: Bloquear quadra',
      it: 'Passo 1: Blocca quartina',
      ru: 'Шаг 1: Блокировка четверки',
      hi: 'चरण 1: क्वाड लॉक',
      ar: 'الخطوة 1: قفل الرباعي'
    },
    step2Tab: {
      ko: '2단계: [9] 확정 소거',
      en: 'Step 2: Solve [9]',
      ja: 'ステップ2: [9]確定',
      zh: '第2步：確定答案 [9]',
      'zh-CN': '第2步：确定答案 [9]',
      es: 'Paso 2: Resolver [9]',
      de: 'Schritt 2: [9] lösen',
      fr: 'Étape 2 : Résoudre [9]',
      pt: 'Passo 2: Resolver [9]',
      it: 'Passo 2: Risolvi [9]',
      ru: 'Шаг 2: Решить [9]',
      hi: 'चरण 2: [9] हल करें',
      ar: 'الخطوة 2: حل [9]'
    },
    step1Caption: {
      ko: '4개 셀이 {1,2,3,4} 후보수를 독점합니다.',
      en: '4 cells lock candidates {1,2,3,4} across this unit.',
      ja: '4マスが {1,2,3,4} 候補を独占します。',
      zh: '4 個格子共同鎖定 {1,2,3,4} 候選數。',
      'zh-CN': '4 个格子共同锁定 {1,2,3,4} 候选数。',
      es: '4 casillas aseguran exclusivamente los candidatos {1,2,3,4}.',
      de: '4 Felder sperren exklusiv die Kandidaten {1,2,3,4} in dieser Einheit.',
      fr: '4 cases verrouillent les candidats {1,2,3,4} dans cette unité.',
      pt: '4 casas bloqueiam os candidatos {1,2,3,4} nesta unidade.',
      it: '4 caselle bloccano i candidati {1,2,3,4} in questa unità.',
      ru: '4 клетки блокируют кандидатов {1,2,3,4} в этой зоне.',
      hi: '4 सेल इस इकाई में उम्मीदवारों {1,2,3,4} को लॉक करते हैं।',
      ar: '4 خلايا تقفل المرشحين {1،2،3،4} في هذه الوحدة.'
    },
    step2Caption: {
      ko: '다른 칸에서 1,2,3,4가 소거되어 정답 [9]가 확정됩니다.',
      en: 'Eliminating 1,2,3,4 leaves the unique answer [9] confirmed.',
      ja: '他マスから 1,2,3,4 が消去され、正解 [9] が確定します。',
      zh: '排除 1,2,3,4 後，正解 [9] 得以確認。',
      'zh-CN': '排除 1,2,3,4 后，正解 [9] 得以确认。',
      es: 'Al eliminar 1,2,3,4, queda confirmada la respuesta [9].',
      de: 'Das Entfernen von 1, 2, 3 und 4 bestätigt die Antwort [9].',
      fr: 'L’élimination de 1, 2, 3 et 4 confirme la réponse [9].',
      pt: 'Eliminar 1, 2, 3 e 4 confirma a resposta [9].',
      it: 'Eliminando 1, 2, 3 e 4 si conferma la risposta [9].',
      ru: 'Исключение 1, 2, 3 и 4 подтверждает ответ [9].',
      hi: '1, 2, 3, 4 हटाने से उत्तर [9] की पुष्टि होती है।',
      ar: 'استبعاد 1 و 2 و 3 و 4 يؤكد الإجابة [9].'
    }
  },
  'hidden-quad': {
    label: {
      ko: '📍 Hidden Quad: [1,4,7,9]가 4개 셀에만 출현 ➔ 정제 확정',
      en: '📍 Hidden Quad: [1,4,7,9] appear in only 4 cells',
      ja: '📍 ヒドゥンクアッド: [1,4,7,9] が4マスにのみ出現',
      zh: '📍 隱性四數組: [1,4,7,9] 僅出現在 4 個格子中',
      'zh-CN': '📍 隐性四数组: [1,4,7,9] 仅出现在 4 个格子中',
      es: '📍 Cuarteto oculto: [1,4,7,9] aparecen en solo 4 casillas',
      de: '📍 Versteckter Vierer: [1,4,7,9] kommen in nur 4 Feldern vor',
      fr: '📍 Quadruplet caché : [1,4,7,9] n’apparaissent que dans 4 cases',
      pt: '📍 Quadra oculta: [1,4,7,9] aparecem em apenas 4 casas',
      it: '📍 Quartina nascosta: [1,4,7,9] compaiono in solo 4 caselle',
      ru: '📍 Скрытая четверка: [1,4,7,9] встречаются только в 4 клетках',
      hi: '📍 छिपा हुआ चौका: [1,4,7,9] केवल 4 सेल में मौजूद',
      ar: '📍 الرباعي المخفي: [1,4,7,9] تظهر في 4 خلايا فقط'
    },
    step1Tab: {
      ko: '1단계: [1,4,7,9] 발견',
      en: 'Step 1: Spot Quad',
      ja: 'ステップ1: 4マス発見',
      zh: '第1步：發現 4 格',
      'zh-CN': '第1步：发现 4 格',
      es: 'Paso 1: Detectar 4',
      de: 'Schritt 1: Vierer finden',
      fr: 'Étape 1 : Repérer 4 cases',
      pt: 'Passo 1: Detectar 4 casas',
      it: 'Passo 1: Trova 4 caselle',
      ru: 'Шаг 1: Найти 4 клетки',
      hi: 'चरण 1: 4 सेल खोजें',
      ar: 'الخطوة 1: العثور على 4 خلايا'
    },
    step2Tab: {
      ko: '2단계: 잡동사니 제거',
      en: 'Step 2: Clean Extra',
      ja: 'ステップ2: 余分な候補消去',
      zh: '第2步：清除多餘候選',
      'zh-CN': '第2步：清除多余候选',
      es: 'Paso 2: Limpiar sobrantes',
      de: 'Schritt 2: Notizen bereinigen',
      fr: 'Étape 2 : Nettoyer les notes',
      pt: 'Passo 2: Limpar extras',
      it: 'Passo 2: Pulisci note extra',
      ru: 'Шаг 2: Очистить лишнее',
      hi: 'चरण 2: अतिरिक्त हटाएं',
      ar: 'الخطوة 2: تنظيف الزوائد'
    },
    step1Caption: {
      ko: '이 줄에서 후보수 1, 4, 7, 9가 나타나는 곳은 오직 4개 셀뿐입니다.',
      en: 'Candidates 1, 4, 7, 9 appear only in 4 specific cells across this unit.',
      ja: 'この行で 1, 4, 7, 9 が現れるのは指定された4マスのみです。',
      zh: '該單元中候選數 1, 4, 7, 9 僅出現在指定的 4 個空格中。',
      'zh-CN': '该单元中候选数 1, 4, 7, 9 仅出现在指定的 4 个空格中。',
      es: 'Los candidatos 1, 4, 7, 9 solo aparecen en 4 casillas concretas.',
      de: 'Die Kandidaten 1, 4, 7, 9 erscheinen in dieser Einheit nur in 4 bestimmten Feldern.',
      fr: 'Les candidats 1, 4, 7, 9 n’apparaissent que dans 4 cases spécifiques de cette unité.',
      pt: 'Os candidatos 1, 4, 7, 9 aparecem em apenas 4 casas específicas nesta unidade.',
      it: 'I candidati 1, 4, 7, 9 compaiono solo in 4 caselle specifiche di questa unità.',
      ru: 'Кандидаты 1, 4, 7, 9 встречаются только в 4 клетках этой зоны.',
      hi: 'उम्मीदवार 1, 4, 7, 9 इस इकाई में केवल 4 विशिष्ट सेलों में आते हैं।',
      ar: 'المرشحون 1 و 4 و 7 و 9 يظهرون في 4 خلايا محددة فقط في هذه الوحدة.'
    },
    step2Caption: {
      ko: '불필요한 후보들이 제거되고 순수한 사중항이 확정됩니다.',
      en: 'Extra notes are eliminated, confirming a pure quad.',
      ja: '不要なメモが消去され、純粋なクアッドが確定します。',
      zh: '多餘筆記被清除，確立為純粹的四數組。',
      'zh-CN': '多余笔记被清除，确立为纯粹的四数组。',
      es: 'Se descartan las notas innecesarias, confirmando el cuarteto puro.',
      de: 'Überflüssige Notizen werden entfernt, wodurch ein reiner Vierer bestätigt wird.',
      fr: 'Les notes superflues sont éliminées, confirmant un quadruplet pur.',
      pt: 'Anotações extras são eliminadas, confirmando uma quadra pura.',
      it: 'Le note extra vengono eliminate, confermando una quartina pura.',
      ru: 'Лишние заметки удалены, подтверждая чистую четверку.',
      hi: 'अतिरिक्त नोट्स हटा दिए गए हैं, जिससे शुद्ध चौका की पुष्टि होती है।',
      ar: 'تم حذف الملاحظات الزائدة، مما يؤكد رباعياً نقياً.'
    }
  }
};

const fullPairs = path.join('src/data/academy/diagrams/stage2PairsDiagrams.js');
const codePairs = `/**
 * stage2PairsDiagrams.js
 * 100% Pure Multilingual Native Translations for Academy Diagrams
 */

export const STAGE2_PAIRS_DIAGRAMS = ${serializeDiagramData(STAGE2_PAIRS_DIAGRAMS)};

export default STAGE2_PAIRS_DIAGRAMS;
`;
fs.writeFileSync(fullPairs, codePairs, 'utf8');
console.log(`✅ Generated stage2PairsDiagrams.js (${codePairs.split('\n').length} lines)`);

const fullTuples = path.join('src/data/academy/diagrams/stage2TuplesDiagrams.js');
const codeTuples = `/**
 * stage2TuplesDiagrams.js
 * 100% Pure Multilingual Native Translations for Academy Diagrams
 */

export const STAGE2_TUPLES_DIAGRAMS = ${serializeDiagramData(STAGE2_TUPLES_DIAGRAMS)};

export default STAGE2_TUPLES_DIAGRAMS;
`;
fs.writeFileSync(fullTuples, codeTuples, 'utf8');
console.log(`✅ Generated stage2TuplesDiagrams.js (${codeTuples.split('\n').length} lines)`);
