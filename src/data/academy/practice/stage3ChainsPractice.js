/**
 * stage3ChainsPractice.js
 * Master 13-Language Translations for Academy Practice Missions
 */

export const STAGE3_CHAINS_PRACTICE = {
  'bug': [
    {
      id: "bug_ex1",
      title: {"ko":"실전 예시 1: BUG+1 3중 후보수 칸 확정 [5]","en":"Example 1: BUG+1 Single Cell Determination","ja":"実践例 1: BUG+1 3候补マスによる [5] 确定","zh-CN":"实战范例 1: BUG+1 三候选数格确定 [5]","zh-TW":"實戰範例 1: BUG+1 三候選數格確定 [5]","es-ES":"Ejemplo práctico 1: Determinación de celda BUG+1","de":"Praxisbeispiel 1: BUG+1 Einzelfeld-Bestimmung","fr":"Exemple pratique 1: Détermination de case BUG+1","pt":"Exemplo prático 1: Determinação de casa BUG+1","it":"Esempio pratico 1: Determinazione casella BUG+1","ru":"Практический пример 1: Определение клетки BUG+1","hi":"व्यावहारिक उदाहरण 1: BUG+1 एकल सेल निर्धारण","ar":"مثال عملي 1: تحديد خلية BUG+1"},
      guide: {"ko":"보드의 모든 셀이 2개 후보수인데, 유일하게 이 셀만 3개 후보수 [2, 5, 8]을 가집니다. 3번 나타나는 홀수 차수 후보수 [5]를 정답으로 확정하세요!","en":"All cells have 2 candidates except this unique 3-candidate cell [2,5,8]. The odd-degree candidate [5] must be true. Enter 5!","ja":"盘面全体で唯一の3候补マス(2,5,8)において、3回出现する数字 [5] が正解として确定します。5 を入力してください。","zh-CN":"盘面其余空格皆为 2 个候选数，唯独此格带有 3 个候选数 [2, 5, 8]。在单元中出现 3 次的奇数次候选数 [5] 必为正解，请输入 5！","zh-TW":"盤面其餘空格皆為 2 個候選數，唯獨此格帶有 3 個候選數 [2, 5, 8]。在單元中出現 3 次的奇數次候選數 [5] 必為正解，請輸入 5！","es-ES":"Todas las casillas tienen 2 candidatos excepto esta [2,5,8]. El candidato con 3 apariciones ([5]) debe ser verdadero. ¡Introduce 5!","de":"Alle Felder haben 2 Kandidaten außer [2,5,8]. Die 3-fache Zahl [5] muss wahr sein. Tragen Sie 5 ein!","fr":"Toutes les cases ont 2 candidats sauf [2,5,8]. Le candidat [5] doit être vrai. Entrez 5 !","pt":"Todas as casas têm 2 candidatos exceto [2,5,8]. O candidato [5] deve ser verdadeiro. Digite 5!","it":"Tutte le caselle hanno 2 candidati tranne [2,5,8]. Il candidato [5] deve essere vero. Inserisci 5!","ru":"Все клетки имеют 2 кандидата кроме [2,5,8]. Кандидат [5] истинен. Введите 5!","hi":"सभी सेलों में 2 उम्मीदवार हैं सिवाय [2,5,8] के। उम्मीदवार [5] सत्य होना चाहिए। 5 दर्ज करें!","ar":"جميع الخلايا بها مرشحان اثنان ما عدا [2,5,8]. المرشح المتكرر 3 مرات [5] يجب أن يكون صحيحاً. أدخل 5!"},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 5,
      cells: [{"notes":[2,8]},{"notes":[2,8]},{"notes":[5,8]},{"notes":[2,5]},{"notes":[2,5,8],"highlightNotes":[5],"style":{"background":"rgba(34, 197, 94, 0.25)","borderColor":"#22c55e"},"type":"target"},{"notes":[2,8]},{"notes":[5,8]},{"notes":[2,8]},{"notes":[2,5]}]
    },
    {
      id: "bug_ex2",
      title: {"ko":"실전 예시 2: BUG+1 트리거 숫자 [7] 확정","en":"Example 2: BUG+1 Trigger Digit","ja":"実践例 2: BUG+1 トリガー数字 [7] 确定","zh-CN":"实战范例 2: BUG+1 触发数字确定 [7]","zh-TW":"實戰範例 2: BUG+1 觸發數字確定 [7]","es-ES":"Ejemplo práctico 2: Dígito clave BUG+1","de":"Praxisbeispiel 2: BUG+1 Auslöser-Ziffer","fr":"Exemple pratique 2: Chiffre déclencheur BUG+1","pt":"Exemplo prático 2: Dígito gatilho BUG+1","it":"Esempio pratico 2: Numero innesco BUG+1","ru":"Практический пример 2: Триггерная цифра BUG+1","hi":"व्यावहारिक उदाहरण 2: BUG+1 ट्रिगर अंक","ar":"مثال عملي 2: الرقم المحفز BUG+1"},
      guide: {"ko":"BUG 구조 붕괴를 막기 위해 3개 후보수 셀에서 3회 등장하는 유일수 [7]을 입력하세요.","en":"To avoid the deadly pattern, the 3-candidate cell must be set to the 3-occurrence candidate [7]. Enter 7.","ja":"BUG+1の原理により、3つの候补を持つマスから确定数字 [7] を选択して入力してください。","zh-CN":"为避免多重解致命死局，在 3 候选数空格中填入出现 3 次的关键数字 [7]。请输入 7。","zh-TW":"為避免多重解致命死局，在 3 候選數空格中填入出現 3 次的關鍵數字 [7]。請輸入 7。","es-ES":"Para evitar el patrón mortal, la casilla de 3 candidatos debe fijarse en el que aparece 3 veces ([7]). ¡Introduce 7!","de":"Um das tödliche Muster zu vermeiden, muss die 3-fache Zahl [7] gesetzt werden. Tragen Sie 7 ein.","fr":"Pour éviter le motif fatal, la case triple doit prendre le chiffre [7]. Entrez 7.","pt":"Para evitar o padrão mortal, a casa tripla deve receber o dígito [7]. Digite 7.","it":"Per evitare la combinazione fatale, la casella tripla deve contenere il [7]. Inserisci 7.","ru":"Чтобы избежать фатального паттерна, тройная клетка должна быть [7]. Введите 7.","hi":"घातक पैटर्न से बचने के लिए, 3-उम्मीदवार सेल को [7] पर सेट करें। 7 दर्ज करें।","ar":"لتجنب النمط القاتل، يجب تعيين الخلية ثلاثية المرشحات للرقم المتكرر [7]. أدخل 7."},
      layoutType: "box3x3",
      targetIndex: 0,
      correctVal: 7,
      cells: [{"notes":[3,7,9],"highlightNotes":[7],"style":{"background":"rgba(34, 197, 94, 0.25)"},"type":"target"},{"notes":[3,9]},{"notes":[7,9]},{"notes":[3,9]},{"notes":[3,7]},{"notes":[3,9]},{"notes":[7,9]},{"notes":[3,9]},{"notes":[3,7]}]
    }
  ],
  'remote-pairs': [
    {
      id: "remote_pairs_ex1",
      title: {"ko":"실전 예시 1: 리모트 페어 짝수 체인으로 [5] 확정","en":"Example 1: Remote Pairs Chain","ja":"実践例 1: リモート・ペア连锁による [5] 确定","zh-CN":"实战范例 1: 远程数对连锁确定 [5]","zh-TW":"實戰範例 1: 遠程數對連鎖確定 [5]","es-ES":"Ejemplo práctico 1: Cadena de pares remotos","de":"Praxisbeispiel 1: Entfernte Paare (Remote Pairs) Kette","fr":"Exemple pratique 1: Chaîne de paires distantes","pt":"Exemplo prático 1: Cadeia de pares remotos","it":"Esempio pratico 1: Catena di coppie remote","ru":"Практический пример 1: Цепочка удаленных пар","hi":"व्यावहारिक उदाहरण 1: रिमोट जोड़े श्रृंखला","ar":"مثال عملي 1: سلسلة الأزواج البعيدة"},
      guide: {"ko":"짝수 체인으로 연결된 [2,9] 양 끝 셀이 공통으로 바라보는 타겟 셀에서 2와 9가 모두 소거되었습니다. 남은 정답 [6]을 입력하세요!","en":"Opposite-color ends of the [2,9] chain eliminate both 2 and 9 at the intersection, leaving [6]. Enter 6!","ja":"[2,9]の偶数连锁の始点と终点を同时に見渡せるマスから 2,9 が消去され [6] が确定しました。6 を入力してください。","zh-CN":"透过偶数链相连的 [2,9]，其两端在交会格中同时排除 2 与 9，留下正解 [6]，请输入 6！","zh-TW":"透過偶數鏈相連的 [2,9]，其兩端在交會格中同時排除 2 與 9，留下正解 [6]，請輸入 6！","es-ES":"Los extremos de la cadena [2,9] eliminan el 2 y el 9 de la intersección, dejando el [6]. ¡Introduce 6!","de":"Die Enden der [2,9]-Kette schließen 2 und 9 am Schnittpunkt aus und lassen [6]. Tragen Sie 6 ein!","fr":"Les bouts de la chaîne [2,9] éliminent 2 et 9 à l’intersection et laissent [6]. Entrez 6 !","pt":"As pontas da cadeia [2,9] eliminam 2 e 9 na interseção e deixam [6]. Digite 6!","it":"I capi della catena [2,9] eliminano 2 e 9 all’incrocio e lasciano [6]. Inserisci 6!","ru":"Концы цепи [2,9] исключают 2 и 9 на пересечении и оставляют [6]. Введите 6!","hi":"[2,9] श्रृंखला के सिरे प्रतिच्छेदन पर 2 और 9 को हटाकर [6] छोड़ते हैं। 6 दर्ज करें!","ar":"أطراف سلسلة [2,9] ذات الألوان المتعاكسة تستبعد 2 و 9 عند التقاطع وتترك [6]. أدخل 6!"},
      layoutType: "grid4x4",
      targetIndex: 5,
      correctVal: 6,
      cells: [{"notes":[2,9],"style":{"background":"rgba(59, 130, 246, 0.2)"},"title":"Chain A+"},{"val":"━","type":"blocked"},{"notes":[2,9],"style":{"background":"rgba(234, 179, 8, 0.2)"},"title":"Chain B-"},{"val":"·","type":"given"},{"val":"┃","type":"blocked"},{"notes":[6],"highlightNotes":[6],"eliminatedNotes":[2,9],"type":"target"},{"val":"┃","type":"blocked"},{"val":"·","type":"given"},{"notes":[2,9],"style":{"background":"rgba(234, 179, 8, 0.2)"},"title":"Chain C-"},{"val":"━","type":"blocked"},{"notes":[2,9],"style":{"background":"rgba(59, 130, 246, 0.2)"},"title":"Chain D+"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    },
    {
      id: "remote_pairs_ex2",
      title: {"ko":"실전 예시 2: 리모트 페어 교차 소거로 [8] 확정","en":"Example 2: Remote Pairs reveals [8]","ja":"実践例 2: リモート・ペア交差消去による [8] 确定","zh-CN":"实战范例 2: 远程数对交叉排除确定 [8]","zh-TW":"實戰範例 2: 遠程數對交叉排除確定 [8]","es-ES":"Ejemplo práctico 2: Pares remotos revelan [8]","de":"Praxisbeispiel 2: Entfernte Paare enthüllt [8]","fr":"Exemple pratique 2: Paires distantes révèlent [8]","pt":"Exemplo prático 2: Pares remotos revelam [8]","it":"Esempio pratico 2: Coppie remote rivelano [8]","ru":"Практический пример 2: Удаленные пары открывают [8]","hi":"व्यावहारिक उदाहरण 2: रिमोट जोड़े [8] प्रकट करते हैं","ar":"مثال عملي 2: الأزواج البعيدة تكشف عن [8]"},
      guide: {"ko":"[3,7] 체인 양 끝의 상반성에 의해 3과 7이 소거되고 남은 [1]을 입력하세요.","en":"Remote pairs eliminate 3 and 7, revealing [1]. Enter 1.","ja":"リモートペア连锁によりターゲットマスから 3,7 が消去され、[1] が确定しました。1 を入力してください。","zh-CN":"[3,7] 链两端的相反性使目标格排除 3 与 7，确定留下 [1]，请输入 1。","zh-TW":"[3,7] 鏈兩端的相反性使目標格排除 3 與 7，確定留下 [1]，請輸入 1。","es-ES":"La alternancia en la cadena [3,7] elimina el 3 y el 7, revelando el [1]. ¡Introduce 1!","de":"Remote Pairs schließen 3 und 7 aus und enthüllen [1]. Tragen Sie 1 ein.","fr":"Les paires distantes éliminent 3 et 7 et révèlent [1]. Entrez 1.","pt":"Pares remotos eliminam 3 e 7 e revelam [1]. Digite 1.","it":"Le coppie remote eliminano 3 e 7 e rivelano [1]. Inserisci 1.","ru":"Удаленные пары исключают 3 и 7 и открывают [1]. Введите 1.","hi":"रिमोट पेयर्स 3 और 7 को हटाकर [1] प्रकट करते हैं। 1 दर्ज करें।","ar":"الأزواج البعيدة تستبعد 3 و 7 وتكشف [1]. أدخل 1."},
      layoutType: "grid4x4",
      targetIndex: 5,
      correctVal: 1,
      cells: [{"notes":[3,7],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[3,7],"style":{"background":"rgba(234, 179, 8, 0.2)"}},{"val":"·","type":"given"},{"notes":[1],"highlightNotes":[1],"eliminatedNotes":[3,7],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[3,7],"style":{"background":"rgba(234, 179, 8, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[3,7],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    }
  ]
};

export default STAGE3_CHAINS_PRACTICE;
