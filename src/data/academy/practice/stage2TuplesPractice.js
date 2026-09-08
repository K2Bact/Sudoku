/**
 * stage2TuplesPractice.js
 * Master 13-Language Translations for Academy Practice Missions
 */

export const STAGE2_TUPLES_PRACTICE = {
  'naked-triple': [
    {
      id: "naked_triple_ex1",
      title: {"ko":"실전 예시 1: [1,2,3] 분할 3개 셀 점유로 [7] 확정","en":"Example 1: [1,2,3] Naked Triple","ja":"実践例 1: [1,2,3] 3つ组予約による [7] 确定","zh-CN":"实战范例 1: [1,2,3] 显性三数组确定 [7]","zh-TW":"實戰範例 1: [1,2,3] 顯性三數組確定 [7]","es-ES":"Ejemplo práctico 1: Trío desnudo [1,2,3] revela [7]","de":"Praxisbeispiel 1: [1,2,3] Offener Dreier enthüllt [7]","fr":"Exemple pratique 1: Triplet nu [1,2,3] révèle [7]","pt":"Exemplo prático 1: Trinca nua [1,2,3] revela [7]","it":"Esempio pratico 1: Terna nuda [1,2,3] rivela [7]","ru":"Практический пример 1: Открытая тройка [1,2,3] открывает [7]","hi":"व्यावहारिक उदाहरण 1: [1,2,3] खुली तिकड़ी [7] प्रकट करती है","ar":"مثال عملي 1: الثلاثي المكشوف [1,2,3] يكشف عن [7]"},
      guide: {"ko":"세 칸이 [1,2], [2,3], [1,3]으로 후보수 {1,2,3}을 독점하고 있습니다. 4번째 칸에서 1,2,3이 소거되어 남은 [7]을 입력하세요!","en":"Three cells lock candidates {1,2,3}. Eliminating them reveals naked [7]. Enter 7!","ja":"3マスが [1,2,3] を独占するため、同ラインの他マスから 1,2,3 が消去され [7] が确定しました。7 を入力してください。","zh-CN":"三个空格以 [1,2], [2,3], [1,3] 锁定候选数 {1,2,3}。第 4 格排除 1,2,3 后留下 [7]，请输入 7！","zh-TW":"三個空格以 [1,2], [2,3], [1,3] 鎖定候選數 {1,2,3}。第 4 格排除 1,2,3 後留下 [7]，請輸入 7！","es-ES":"Tres casillas bloquean los candidatos {1,2,3}. Al eliminarlos, la 4ª casilla revela el [7]. ¡Introduce 7!","de":"Drei Felder sperren {1,2,3}. Ihr Ausschluss enthüllt [7]. Tragen Sie 7 ein!","fr":"Trois cases verrouillent {1,2,3}. Les éliminer révèle [7]. Entrez 7 !","pt":"Três casas bloqueiam {1,2,3}. Eliminá-las revela [7]. Digite 7!","it":"Tre caselle bloccano {1,2,3}. Eliminarli rivela [7]. Inserisci 7!","ru":"Три клетки блокируют {1,2,3}. Их исключение открывает [7]. Введите 7!","hi":"तीन सेल {1,2,3} को लॉक करते हैं। उन्हें हटाने पर [7] प्रकट होता है। 7 दर्ज करें!","ar":"ثلاث خلايا تقفل المرشحات {1,2,3}. استبعادها يكشف عن [7]. أدخل 7!"},
      layoutType: "row",
      targetIndex: 3,
      correctVal: 7,
      cells: [{"notes":[1,2],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[2,3],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[1,3],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[7],"highlightNotes":[7],"eliminatedNotes":[1,3],"type":"target"}]
    },
    {
      id: "naked_triple_ex2",
      title: {"ko":"실전 예시 2: 삼중수 소거 후 정답 [9] 입력","en":"Example 2: Naked Triple reveals [9]","ja":"実践例 2: 3つ组除外后の [9] 确定","zh-CN":"实战范例 2: 显性三数组排除确定 [9]","zh-TW":"實戰範例 2: 顯性三數組排除確定 [9]","es-ES":"Ejemplo práctico 2: Trío desnudo revela [9]","de":"Praxisbeispiel 2: Offener Dreier enthüllt [9]","fr":"Exemple pratique 2: Triplet nu révèle [9]","pt":"Exemplo prático 2: Trinca nua revela [9]","it":"Esempio pratico 2: Terna nuda rivela [9]","ru":"Практический пример 2: Открытая тройка открывает [9]","hi":"व्यावहारिक उदाहरण 2: खुली तिकड़ी [9] प्रकट करती है","ar":"مثال عملي 2: الثلاثي المكشوف يكشف عن [9]"},
      guide: {"ko":"박스 내 세 칸이 [4,5], [5,6], [4,6]을 독점합니다. 중앙 칸에서 4,5,6이 제거되고 남은 정답 [2]를 입력하세요.","en":"A {4,5,6} triple in the box leaves naked [2] in the center cell. Enter 2.","ja":"ブロック内の3マスが [4,5,6] を独占し、中央マスから 4,5,6 が消去されて [2] が确定しました。2 を入力してください。","zh-CN":"九宫格内 3 个空格锁定 [4,5,6]，中央空格排除 4,5,6 后确定为 [2]，请输入 2！","zh-TW":"九宮格內 3 個空格鎖定 [4,5,6]，中央空格排除 4,5,6 後確定為 [2]，請輸入 2！","es-ES":"El trío {4,5,6} en el bloque elimina esos candidatos del centro, dejando el [2]. ¡Introduce 2!","de":"Ein Dreier {4,5,6} im Block lässt [2] in der Mitte. Tragen Sie 2 ein.","fr":"Un triplet {4,5,6} laisse [2] au centre. Entrez 2.","pt":"Uma trinca {4,5,6} no bloco deixa [2] no centro. Digite 2.","it":"Una terna {4,5,6} nel blocco lascia [2] al centro. Inserisci 2.","ru":"Тройка {4,5,6} оставляет [2] в центре. Введите 2.","hi":"बॉक्स में {4,5,6} का त्रिक केंद्र में [2] छोड़ता है। 2 दर्ज करें।","ar":"ثلاثي {4,5,6} في المربع يترك [2] في الخلية المركزية. أدخل 2."},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 2,
      cells: [{"notes":[4,5],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[5,6],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[4,6],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"val":1,"type":"cause"},{"notes":[2],"highlightNotes":[2],"eliminatedNotes":[4,5,6],"type":"target"},{"val":3,"type":"cause"},{"val":7,"type":"cause"},{"val":8,"type":"cause"},{"val":9,"type":"cause"}]
    }
  ],
  'hidden-triple': [
    {
      id: "hidden_triple_ex1",
      title: {"ko":"실전 예시 1: [2,5,8] 은닉 삼중수로 [5] 확정","en":"Example 1: [2,5,8] Hidden Triple","ja":"実践例 1: [2,5,8] 隠れ3つ组による [5] 确定","zh-CN":"实战范例 1: [2,5,8] 隐性三数组确定 [5]","zh-TW":"實戰範例 1: [2,5,8] 隱性三數組確定 [5]","es-ES":"Ejemplo práctico 1: Trío oculto [2,5,8] revela [5]","de":"Praxisbeispiel 1: [2,5,8] Versteckter Dreier enthüllt [5]","fr":"Exemple pratique 1: Triplet caché [2,5,8] révèle [5]","pt":"Exemplo prático 1: Trinca oculta [2,5,8] revela [5]","it":"Esempio pratico 1: Terna nascosta [2,5,8] rivela [5]","ru":"Практический пример 1: Скрытая тройка [2,5,8] открывает [5]","hi":"व्यावहारिक उदाहरण 1: [2,5,8] छिपी तिकड़ी [5] प्रकट करती है","ar":"مثال عملي 1: الثلاثي المخفي [2,5,8] يكشف عن [5]"},
      guide: {"ko":"이 줄에서 후보수 2, 5, 8은 오직 1, 2, 4번째 칸에만 나타납니다. 4번째 칸의 잡동사니를 정리하고 [8]을 입력하세요!","en":"Candidates {2,5,8} appear only in cells 1, 2, 4. Clean extra notes and enter 8 into the target cell!","ja":"行の中で [2,5,8] が入れる3マスを特定し、余分な候补が消去されて目标マスで [8] が确定しました。8 を入力してください。","zh-CN":"该横行中候选数 2, 5, 8 仅出现在第 1、2、4 格。清理多余笔记后，在目标格填入 [8]！","zh-TW":"該橫行中候選數 2, 5, 8 僅出現在第 1、2、4 格。清理多餘筆記後，在目標格填入 [8]！","es-ES":"Los candidatos {2,5,8} aparecen solo en las casillas 1, 2 y 4. ¡Limpia las notas y pon 8 en el objetivo!","de":"Kandidaten {2,5,8} erscheinen nur in Feldern 1, 2, 4. Tragen Sie 8 in das Zielfeld ein!","fr":"Les candidats {2,5,8} n’apparaissent qu’en cases 1, 2, 4. Entrez 8 dans la cible !","pt":"Os candidatos {2,5,8} aparecem apenas nas casas 1, 2, 4. Digite 8 no alvo!","it":"I candidati {2,5,8} appaiono solo nelle caselle 1, 2, 4. Inserisci 8 nel bersaglio!","ru":"Кандидаты {2,5,8} только в клетках 1, 2, 4. Введите 8 в цель!","hi":"उम्मीदवार {2,5,8} केवल सेल 1, 2, 4 में आते हैं। लक्ष्य सेल में 8 दर्ज करें!","ar":"المرشحات {2,5,8} تظهر في الخلايا 1، 2، 4 فقط. أدخل 8 في الخلية المستهدفة!"},
      layoutType: "row",
      targetIndex: 3,
      correctVal: 8,
      cells: [{"notes":[1,2,5,9],"highlightNotes":[2,5]},{"notes":[2,3,5,8],"highlightNotes":[2,5,8]},{"notes":[3,4,7]},{"notes":[1,5,8,9],"highlightNotes":[5,8],"type":"target"}]
    },
    {
      id: "hidden_triple_ex2",
      title: {"ko":"실전 예시 2: 은닉 삼중수로 잡동사니 제거 후 [7] 확정","en":"Example 2: Hidden Triple reveals [7]","ja":"実践例 2: 隠れ3つ组による [7] 确定","zh-CN":"实战范例 2: 隐性三数组排除杂数确定 [7]","zh-TW":"實戰範例 2: 隱性三數組排除雜數確定 [7]","es-ES":"Ejemplo práctico 2: Trío oculto revela [7]","de":"Praxisbeispiel 2: Versteckter Dreier enthüllt [7]","fr":"Exemple pratique 2: Triplet caché révèle [7]","pt":"Exemplo prático 2: Trinca oculta revela [7]","it":"Esempio pratico 2: Terna nascosta rivela [7]","ru":"Практический пример 2: Скрытая тройка открывает [7]","hi":"व्यावहारिक उदाहरण 2: छिपी तिकड़ी [7] प्रकट करती है","ar":"مثال عملي 2: الثلاثي المخفي يكشف عن [7]"},
      guide: {"ko":"박스 안에서 3, 6, 9는 3개 셀에만 숨어있습니다. 우상단 셀에서 [9]를 확정 입력하세요.","en":"Candidates 3, 6, 9 are hidden in 3 cells. Enter [9] into the top-right target cell.","ja":"ブロック内で 3, 6, 9 は3マスにのみ隠れています。右上マスに正解の [9] を入力してください。","zh-CN":"九宫格内 3, 6, 9 仅隐藏在 3 个空格中。右上角目标格确认为 [9]，请输入 9！","zh-TW":"九宮格內 3, 6, 9 僅隱藏在 3 個空格中。右上角目標格確認為 [9]，請輸入 9！","es-ES":"Los candidatos 3, 6, 9 están ocultos en 3 casillas. ¡Introduce [9] en la casilla superior derecha!","de":"Kandidaten 3, 6, 9 liegen in 3 Feldern. Tragen Sie [9] oben rechts ein.","fr":"Les candidats 3, 6, 9 sont cachés dans 3 cases. Entrez [9] en haut à droite.","pt":"Os candidatos 3, 6, 9 estão em 3 casas. Digite [9] no canto superior direito.","it":"I candidati 3, 6, 9 sono nascosti in 3 caselle. Inserisci [9] in alto a destra.","ru":"Кандидаты 3, 6, 9 скрыты в 3 клетках. Введите [9] в правый верхний угол.","hi":"उम्मीदवार 3, 6, 9 तीन सेल में छिपे हैं। ऊपर-दाएं लक्ष्य सेल में [9] दर्ज करें।","ar":"المرشحات 3، 6، 9 مخفية في 3 خلايا. أدخل [9] في الخلية العلوية اليمنى."},
      layoutType: "box3x3",
      targetIndex: 2,
      correctVal: 9,
      cells: [{"notes":[1,3,6],"highlightNotes":[3,6]},{"notes":[2,6,9],"highlightNotes":[6,9]},{"notes":[1,3,9],"highlightNotes":[3,9],"type":"target"},{"notes":[1,2]},{"notes":[4,5]},{"notes":[2,7]},{"val":4,"type":"cause"},{"val":7,"type":"cause"},{"val":8,"type":"cause"}]
    }
  ],
  'naked-quad': [
    {
      id: "naked_quad_ex1",
      title: {"ko":"실전 예시 1: [1,2,3,4] 4개 셀 점유로 [9] 확정","en":"Example 1: [1,2,3,4] Naked Quad","ja":"実践例 1: [1,2,3,4] 4つ组予約による [9] 确定","zh-CN":"实战范例 1: [1,2,3,4] 显性四数组确定 [9]","zh-TW":"實戰範例 1: [1,2,3,4] 顯性四數組確定 [9]","es-ES":"Ejemplo práctico 1: Cuarteto desnudo [1,2,3,4] revela [9]","de":"Praxisbeispiel 1: [1,2,3,4] Offener Vierer enthüllt [9]","fr":"Exemple pratique 1: Quadruplet nu [1,2,3,4] révèle [9]","pt":"Exemplo prático 1: Quadra nua [1,2,3,4] revela [9]","it":"Esempio pratico 1: Quartina nuda [1,2,3,4] rivela [9]","ru":"Практический пример 1: Открытая четверка [1,2,3,4] открывает [9]","hi":"व्यावहारिक उदाहरण 1: [1,2,3,4] खुला चौका [9] प्रकट करता है","ar":"مثال عملي 1: الرباعي المكشوف [1,2,3,4] يكشف عن [9]"},
      guide: {"ko":"네 칸이 {1,2,3,4}를 나누어 점유(Naked Quad)하여, 5번째 칸에서 1,2,3,4가 소거되었습니다. 남은 정답 [9]를 입력하세요!","en":"Four cells lock {1,2,3,4}. Eliminating them reveals naked [9]. Enter 9!","ja":"4マスが {1,2,3,4} を独占するため、5番目のマスから 1,2,3,4 が消去され [9] が确定しました。9 を入力してください。","zh-CN":"四个空格共同锁定 {1,2,3,4}。第 5 格排除 1,2,3,4 后确定为 [9]，请输入 9！","zh-TW":"四個空格共同鎖定 {1,2,3,4}。第 5 格排除 1,2,3,4 後確定為 [9]，請輸入 9！","es-ES":"Cuatro casillas bloquean {1,2,3,4}. Al eliminarlos, la 5ª casilla revela el [9]. ¡Introduce 9!","de":"Vier Felder sperren {1,2,3,4}. Ihr Ausschluss enthüllt [9]. Tragen Sie 9 ein!","fr":"Quatre cases verrouillent {1,2,3,4}. Les éliminer révèle [9]. Entrez 9 !","pt":"Quatro casas bloqueiam {1,2,3,4}. Eliminá-las revela [9]. Digite 9!","it":"Quattro caselle bloccano {1,2,3,4}. Eliminarli rivela [9]. Inserisci 9!","ru":"Четыре клетки блокируют {1,2,3,4}. Их исключение открывает [9]. Введите 9!","hi":"चार सेल {1,2,3,4} को लॉक करते हैं। उन्हें हटाने पर [9] प्रकट होता है। 9 दर्ज करें!","ar":"أربع خلايا تقفل {1,2,3,4}. استبعادها يكشف عن [9]. أدخل 9!"},
      layoutType: "row",
      targetIndex: 4,
      correctVal: 9,
      cells: [{"notes":[1,2],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[2,3],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[3,4],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[1,4],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[9],"highlightNotes":[9],"eliminatedNotes":[1,2,3,4],"type":"target"}]
    },
    {
      id: "naked_quad_ex2",
      title: {"ko":"실전 예시 2: 사중수 소거 후 [8] 확정","en":"Example 2: Naked Quad reveals [8]","ja":"実践例 2: 4つ组除外后の [8] 确定","zh-CN":"实战范例 2: 显性四数组排除确定 [8]","zh-TW":"實戰範例 2: 顯性四數組排除確定 [8]","es-ES":"Ejemplo práctico 2: Cuarteto desnudo revela [8]","de":"Praxisbeispiel 2: Offener Vierer enthüllt [8]","fr":"Exemple pratique 2: Quadruplet nu révèle [8]","pt":"Exemplo prático 2: Quadra nua revela [8]","it":"Esempio pratico 2: Quartina nuda rivela [8]","ru":"Практический пример 2: Открытая четверка открывает [8]","hi":"व्यावहारिक उदाहरण 2: खुला चौका [8] प्रकट करता है","ar":"مثال عملي 2: الرباعي المكشوف يكشف عن [8]"},
      guide: {"ko":"박스 내 4개 셀이 {2,3,4,6}을 독점하여 타겟 셀에서 모두 소거되었습니다. 남은 [5]를 입력하세요.","en":"Four cells lock {2,3,4,6}. Enter the confirmed [5] into the target cell.","ja":"ブロック内の4マスが {2,3,4,6} を独占し、目标マスから消去されて [5] が确定しました。5 を入力してください。","zh-CN":"九宫格内 4 个空格锁定 {2,3,4,6}，目标格排除其余候选数后确认为 [5]，请输入 5！","zh-TW":"九宮格內 4 個空格鎖定 {2,3,4,6}，目標格排除其餘候選數後確認為 [5]，請輸入 5！","es-ES":"Cuatro casillas bloquean {2,3,4,6}. ¡Introduce el [5] confirmado en la casilla objetivo!","de":"Vier Felder sperren {2,3,4,6}. Tragen Sie die bestätigte [5] ein.","fr":"Quatre cases verrouillent {2,3,4,6}. Entrez le [5] confirmé dans la cible.","pt":"Quatro casas bloqueiam {2,3,4,6}. Digite o [5] confirmado na casa alvo.","it":"Quattro caselle bloccano {2,3,4,6}. Inserisci il [5] confermato nella casella bersaglio.","ru":"Четыре клетки блокируют {2,3,4,6}. Введите подтвержденную [5] в цель.","hi":"चार सेल {2,3,4,6} को लॉक करते हैं। लक्ष्य सेल में [5] दर्ज करें।","ar":"أربع خلايا تقفل {2,3,4,6}. أدخل الرقم المؤكد [5] في الخلية المستهدفة."},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 5,
      cells: [{"notes":[2,3],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[3,4],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[4,6],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[2,6],"style":{"background":"rgba(59, 130, 246, 0.15)"}},{"notes":[5],"highlightNotes":[5],"eliminatedNotes":[2,3,4,6],"type":"target"},{"val":1,"type":"cause"},{"val":7,"type":"cause"},{"val":8,"type":"cause"},{"val":9,"type":"cause"}]
    }
  ],
  'hidden-quad': [
    {
      id: "hidden_quad_ex1",
      title: {"ko":"실전 예시 1: [1,4,7,9] 은닉 사중수로 정답 확정","en":"Example 1: [1,4,7,9] Hidden Quad","ja":"実践例 1: [1,4,7,9] 隠れ4つ组による确定","zh-CN":"实战范例 1: [1,4,7,9] 隐性四数组锁定","zh-TW":"實戰範例 1: [1,4,7,9] 隱性四數組鎖定","es-ES":"Ejemplo práctico 1: Cuarteto oculto [1,4,7,9]","de":"Praxisbeispiel 1: [1,4,7,9] Versteckter Vierer","fr":"Exemple pratique 1: Quadruplet caché [1,4,7,9]","pt":"Exemplo prático 1: Quadra oculta [1,4,7,9]","it":"Esempio pratico 1: Quartina nascosta [1,4,7,9]","ru":"Практический пример 1: Скрытая четверка [1,4,7,9]","hi":"व्यावहारिक उदाहरण 1: [1,4,7,9] छिपा चौका","ar":"مثال عملي 1: الرباعي المخفي [1,4,7,9]"},
      guide: {"ko":"이 줄에서 1, 4, 7, 9는 지정된 4개 셀에만 들어갈 수 있습니다. 1번째 칸에서 [1]을 확정 입력하세요!","en":"Candidates 1, 4, 7, 9 appear only in 4 specific cells. Enter [1] into the first cell!","ja":"行の中で 1, 4, 7, 9 は指定された4マスにのみ入ることができます。最初のマスに [1] を确定入力してください！","zh-CN":"该横行中 1, 4, 7, 9 仅能填入指定的 4 个空格中。第 1 格确定为 [1]，请输入 1！","zh-TW":"該橫行中 1, 4, 7, 9 僅能填入指定的 4 個空格中。第 1 格確定為 [1]，請輸入 1！","es-ES":"Los candidatos 1, 4, 7, 9 solo aparecen en 4 casillas concretas. ¡Introduce [1] en la primera casilla!","de":"Kandidaten 1, 4, 7, 9 erscheinen nur in 4 Feldern. Tragen Sie [1] in das erste Feld ein!","fr":"Les candidats 1, 4, 7, 9 apparaissent dans 4 cases. Entrez [1] dans la 1ère case !","pt":"Os candidatos 1, 4, 7, 9 aparecem em 4 casas. Digite [1] na primeira casa!","it":"I candidati 1, 4, 7, 9 appaiono in 4 caselle. Inserisci [1] nella 1ª casella!","ru":"Кандидаты 1, 4, 7, 9 только в 4 клетках. Введите [1] в первую клетку!","hi":"उम्मीदवार 1, 4, 7, 9 केवल 4 सेल में आते हैं। पहली सेल में [1] दर्ज करें!","ar":"المرشحات 1، 4، 7، 9 تظهر في 4 خلايا فقط. أدخل [1] في الخلية الأولى!"},
      layoutType: "row",
      targetIndex: 0,
      correctVal: 1,
      cells: [{"notes":[1,2,4,9],"highlightNotes":[1,4,9],"type":"target"},{"notes":[2,3,5]},{"notes":[4,5,7,9],"highlightNotes":[4,7,9]},{"notes":[1,3,7,8],"highlightNotes":[1,7]},{"notes":[2,5,8]},{"notes":[1,4,7,9],"highlightNotes":[1,4,7,9]}]
    },
    {
      id: "hidden_quad_ex2",
      title: {"ko":"실전 예시 2: 은닉 사중수로 [6] 확정","en":"Example 2: Hidden Quad reveals [6]","ja":"実践例 2: 隠れ4つ组による [6] 确定","zh-CN":"实战范例 2: 隐性四数组排除确定 [6]","zh-TW":"實戰範例 2: 隱性四數組排除確定 [6]","es-ES":"Ejemplo práctico 2: Cuarteto oculto revela [6]","de":"Praxisbeispiel 2: Versteckter Vierer enthüllt [6]","fr":"Exemple pratique 2: Quadruplet caché révèle [6]","pt":"Exemplo prático 2: Quadra oculta revela [6]","it":"Esempio pratico 2: Quartina nascosta rivela [6]","ru":"Практический пример 2: Скрытая четверка открывает [6]","hi":"व्यावहारिक उदाहरण 2: छिपा चौका [6] प्रकट करता है","ar":"مثال عملي 2: الرباعي المخفي يكشف عن [6]"},
      guide: {"ko":"박스 안에서 2, 4, 6, 8 짝수가 오직 4칸에만 숨어있습니다. 중앙 칸에 [4]를 입력하세요.","en":"Candidates 2, 4, 6, 8 are hidden in 4 cells. Enter [4] into the center cell.","ja":"ブロック内で 2, 4, 6, 8 は4マスにのみ隠れています。中央マスに [4] を入力してください。","zh-CN":"九宫格内 2, 4, 6, 8 仅隐藏在 4 个空格中。中央目标格确认为 [4]，请输入 4！","zh-TW":"九宮格內 2, 4, 6, 8 僅隱藏在 4 個空格中。中央目標格確認為 [4]，請輸入 4！","es-ES":"Los candidatos 2, 4, 6, 8 están ocultos en 4 casillas. ¡Introduce [4] en la casilla central!","de":"Kandidaten 2, 4, 6, 8 liegen in 4 Feldern. Tragen Sie [4] in die Mitte ein.","fr":"Les candidats 2, 4, 6, 8 sont cachés dans 4 cases. Entrez [4] au centre.","pt":"Os candidatos 2, 4, 6, 8 estão em 4 casas. Digite [4] no centro.","it":"I candidati 2, 4, 6, 8 sono in 4 caselle. Inserisci [4] al centro.","ru":"Кандидаты 2, 4, 6, 8 в 4 клетках. Введите [4] в центр.","hi":"उम्मीदवार 2, 4, 6, 8 चार सेल में छिपे हैं। केंद्र सेल में [4] दर्ज करें।","ar":"المرشحات 2، 4، 6، 8 مخفية في 4 خلايا. أدخل [4] في الخلية المركزية."},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 4,
      cells: [{"notes":[1,2,4],"highlightNotes":[2,4]},{"notes":[3,5]},{"notes":[1,4,6],"highlightNotes":[4,6]},{"notes":[3,7]},{"notes":[2,4,8],"highlightNotes":[2,4,8],"type":"target"},{"notes":[5,7]},{"notes":[2,6,8],"highlightNotes":[2,6,8]},{"notes":[1,9]},{"val":9,"type":"cause"}]
    }
  ]
};

export default STAGE2_TUPLES_PRACTICE;
