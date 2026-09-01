/**
 * stage4ChainsPractice.js
 * Master 13-Language Translations for Academy Practice Missions
 */

export const STAGE4_CHAINS_PRACTICE = {
  '3d-medusa': [
    {
      id: "3d_medusa_ex1",
      title: {"ko":"실전 예시 1: 3D 메두사 다중 숫자 연쇄 체인 [3] 확정","en":"Example 1: 3D Medusa Multi-Digit Chain","ja":"実践例 1: 3Dメドゥーサ複合连锁による [3] 确定","zh":"实战范例 1: 3D 美杜莎连锁锁定 [3]","zh-CN":"实战范例 1: 3D 美杜莎连锁锁定 [3]","es":"Ejemplo práctico 1: Cadena múltiple 3D Medusa","de":"Praxisbeispiel 1: 3D-Medusa Mehrziffernkette","fr":"Exemple pratique 1: Chaîne multidigits 3D Medusa","pt":"Exemplo prático 1: Cadeia multidígito 3D Medusa","it":"Esempio pratico 1: Catena multicifra 3D Medusa","ru":"Практический пример 1: Многозначная цепочка 3D Medusa","hi":"व्यावहारिक उदाहरण 1: 3D मेडुसा मल्टी-अंक चेन","ar":"مثال عملي 1: سلسلة 3D ميدوسا متعددة الأرقام"},
      guide: {"ko":"셀 내 링크와 단위 내 링크가 결합된 3D 메두사 체인에 의해 후보수 6이 소거되었습니다. 남은 [3]을 입력하세요!","en":"3D Medusa multi-digit colouring eliminates 6 at the intersection, revealing [3]. Enter 3!","ja":"3Dメドゥーサ立体着色连锁によりターゲットマスから 6 が消去され [3] が残りました。3 を入力してください！","zh":"3D 美杜莎立体染色链消去目标格中的 6，留下正确解 [3]。请输入 3！","zh-CN":"3D 美杜莎立体染色链消去目标格中的 6，留下正确解 [3]。请输入 3！","es":"La cadena tridimensional Medusa 3D elimina el 6 dejando el [3]. ¡Introduce 3!","de":"3D Medusa schließt 6 am Schnittpunkt aus und enthüllt [3]. Tragen Sie 3 ein!","fr":"3D Medusa élimine 6 à l’intersection et révèle [3]. Entrez 3 !","pt":"3D Medusa elimina 6 na interseção e revela [3]. Digite 3!","it":"3D Medusa elimina 6 all’incrocio e rivela [3]. Inserisci 3!","ru":"3D Medusa исключает 6 на пересечении и открывает [3]. Введите 3!","hi":"3D मेडुसा प्रतिच्छेदन पर 6 को हटाकर [3] प्रकट करता है। 3 दर्ज करें!","ar":"تلوين ميدوسا ثلاثي الأبعاد يستبعد 6 عند التقاطع ويكشف [3]. أدخل 3!"},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 3,
      cells: [{"notes":[2,6],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[2,7],"style":{"background":"rgba(234, 179, 8, 0.2)"}},{"val":"·","type":"given"},{"notes":[6,7],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[3],"highlightNotes":[3],"eliminatedNotes":[6],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    },
    {
      id: "3d_medusa_ex2",
      title: {"ko":"실전 예시 2: 3D 메두사 체인 충돌로 [9] 확정","en":"Example 2: 3D Medusa reveals [9]","ja":"実践例 2: 3Dメドゥーサ冲突消去による [9] 确定","zh":"实战范例 2: 3D 美杜莎冲突排除确定 [9]","zh-CN":"实战范例 2: 3D 美杜莎冲突排除确定 [9]","es":"Ejemplo práctico 2: 3D Medusa revela [9]","de":"Praxisbeispiel 2: 3D-Medusa enthüllt [9]","fr":"Exemple pratique 2: 3D Medusa révèle [9]","pt":"Exemplo prático 2: 3D Medusa revela [9]","it":"Esempio pratico 2: 3D Medusa rivela [9]","ru":"Практический пример 2: 3D Medusa открывает [9]","hi":"व्यावहारिक उदाहरण 2: 3D मेडुसा [9] प्रकट करता है","ar":"مثال عملي 2: 3D ميدوسا يكشف عن [9]"},
      guide: {"ko":"메두사 체인 분석 결과 타겟 셀에서 1이 소거되고 남은 [9]를 입력하세요.","en":"Medusa chain clears candidate 1 to leave [9]. Enter 9.","ja":"メドゥーサ连锁の分析结果、ターゲットマスから 1 が消去され [9] が确定しました。9 を入力してください。","zh":"美杜莎链分析使目标格消去 1，确定剩下正解 [9]。请输入 9！","zh-CN":"美杜莎链分析使目标格消去 1，确定剩下正解 [9]。请输入 9！","es":"El análisis de la cadena Medusa elimina el 1 en la casilla objetivo, dejando el [9]. ¡Introduce 9!","de":"Medusa-Kette schließt Kandidat 1 aus und lässt [9]. Tragen Sie 9 ein.","fr":"La chaîne Medusa élimine le candidat 1 et laisse [9]. Entrez 9.","pt":"A cadeia Medusa elimina o candidato 1 e deixa [9]. Digite 9.","it":"La catena Medusa elimina il candidato 1 e lascia [9]. Inserisci 9.","ru":"Цепь Medusa исключает кандидата 1 и оставляет [9]. Введите 9.","hi":"मेडुसा श्रृंखला उम्मीदवार 1 को हटाकर [9] छोड़ती है। 9 दर्ज करें।","ar":"سلسلة ميدوسا تستبعد المرشح 1 وتترك [9]. أدخل 9."},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 9,
      cells: [{"notes":[1,4],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[4,8],"style":{"background":"rgba(234, 179, 8, 0.2)"}},{"val":"·","type":"given"},{"notes":[1,8],"style":{"background":"rgba(234, 179, 8, 0.2)"}},{"notes":[9],"highlightNotes":[9],"eliminatedNotes":[1],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    }
  ],
  'xy-chains': [
    {
      id: "xy_chains_ex1",
      title: {"ko":"실전 예시 1: XY-Chains 4단 체인으로 [7] 확정","en":"Example 1: XY-Chains","ja":"実践例 1: XY-Chains 4连锁による [7] 确定","zh":"实战范例 1: XY-Chains 四段连锁确定 [7]","zh-CN":"实战范例 1: XY-Chains 四段连锁确定 [7]","es":"Ejemplo práctico 1: Cadenas XY-Chains","de":"Praxisbeispiel 1: XY-Ketten (XY-Chains)","fr":"Exemple pratique 1: Chaînes XY-Chains","pt":"Exemplo prático 1: Cadeias XY-Chains","it":"Esempio pratico 1: Catene XY-Chains","ru":"Практический пример 1: Цепочки XY-Chains","hi":"व्यावहारिक उदाहरण 1: XY-चेन","ar":"مثال عملي 1: سلاسل XY-Chains"},
      guide: {"ko":"[1,2]-[2,3]-[3,4]-[4,1] 4단계 XY-체인의 양 끝이 공통으로 보는 셀에서 1이 소거되었습니다. 남은 [6]을 입력하세요!","en":"A 4-node XY-Chain eliminates candidate 1 at the mutual sight cell, leaving [6]. Enter 6!","ja":"始点と终点の両方を見渡せる交差マスから 1 が消去され [6] が残りました。6 を入力してください。","zh":"4 节点的 XY 链在交会格中排除候选数 1，留下正解 [6]。请输入 6！","zh-CN":"4 节点的 XY 链在交会格中排除候选数 1，留下正解 [6]。请输入 6！","es":"Una cadena XY de 4 nodos elimina el candidato 1 en la casilla compartida, dejando el [6]. ¡Introduce 6!","de":"Eine 4-Knoten XY-Chain schließt Kandidat 1 aus und lässt [6]. Tragen Sie 6 ein!","fr":"Une XY-Chain à 4 nœuds élimine le candidat 1 et laisse [6]. Entrez 6 !","pt":"Uma XY-Chain de 4 nós elimina o candidato 1 e deixa [6]. Digite 6!","it":"Una XY-Chain a 4 nodi elimina il candidato 1 e lascia [6]. Inserisci 6!","ru":"Цепь XY-Chain из 4 узлов исключает кандидата 1 и оставляет [6]. Введите 6!","hi":"4-नोड XY-Chain उम्मीदवार 1 को हटाकर [6] छोड़ती है। 6 दर्ज करें!","ar":"سلسلة XY من 4 عقد تستبعد المرشح 1 عند خلية الرؤية المتبادلة وتترك [6]. أدخل 6!"},
      layoutType: "row",
      targetIndex: 4,
      correctVal: 6,
      cells: [{"notes":[1,2],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[2,3],"style":{"background":"rgba(34, 197, 94, 0.2)"}},{"notes":[3,4],"style":{"background":"rgba(234, 179, 8, 0.2)"}},{"notes":[4,1],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[6],"highlightNotes":[6],"eliminatedNotes":[1],"type":"target"}]
    },
    {
      id: "xy_chains_ex2",
      title: {"ko":"실전 예시 2: XY-Chains 연쇄 소거로 [2] 확정","en":"Example 2: XY-Chains reveals [2]","ja":"実践例 2: XY-Chains 连锁消去による [2] 确定","zh":"实战范例 2: XY-Chains 连锁锁定 [2]","zh-CN":"实战范例 2: XY-Chains 连锁锁定 [2]","es":"Ejemplo práctico 2: Cadena XY-Chains revela [2]","de":"Praxisbeispiel 2: XY-Ketten enthüllt [2]","fr":"Exemple pratique 2: XY-Chains révèle [2]","pt":"Exemplo prático 2: XY-Chains revela [2]","it":"Esempio pratico 2: XY-Chains rivela [2]","ru":"Практический пример 2: XY-Chains открывает [2]","hi":"व्यावहारिक उदाहरण 2: XY-चेन [2] प्रकट करती है","ar":"مثال عملي 2: سلاسل XY-Chains تكشف عن [2]"},
      guide: {"ko":"XY-체인에 의해 5가 소거되고 남은 [2]를 입력하세요.","en":"XY-Chain clears candidate 5 to reveal [2]. Enter 2.","ja":"XY-チェイン连锁によりターゲットマスから 5 が消去され、残った [2] を入力してください。","zh":"透过 XY-Chains 连锁消去 5 后，填入剩余正解 [2]。请输入 2！","zh-CN":"透过 XY-Chains 连锁消去 5 后，填入剩余正解 [2]。请输入 2！","es":"La cadena XY-Chains elimina el 5 dejando el [2]. ¡Introduce 2!","de":"XY-Chain schließt Kandidat 5 aus und enthüllt [2]. Tragen Sie 2 ein.","fr":"La XY-Chain élimine le candidat 5 et révèle [2]. Entrez 2.","pt":"A XY-Chain elimina o candidato 5 e revela [2]. Digite 2.","it":"La XY-Chain elimina il candidato 5 e rivela [2]. Inserisci 2.","ru":"Цепь XY-Chain исключает кандидата 5 и открывает [2]. Введите 2.","hi":"XY-Chain उम्मीदवार 5 को हटाकर [2] प्रकट करती है। 2 दर्ज करें।","ar":"سلسلة XY تستبعد المرشح 5 وتكشف [2]. أدخل 2."},
      layoutType: "row",
      targetIndex: 3,
      correctVal: 2,
      cells: [{"notes":[5,7],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[7,8],"style":{"background":"rgba(34, 197, 94, 0.2)"}},{"notes":[8,5],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[2],"highlightNotes":[2],"eliminatedNotes":[5],"type":"target"}]
    }
  ],
  'wxyz-wing': [
    {
      id: "wxyz_wing_ex1",
      title: {"ko":"실전 예시 1: WXYZ-Wing 4중 후보수 결합으로 [7] 확정","en":"Example 1: WXYZ-Wing","ja":"実践例 1: WXYZ-Wing 4候补複合による [7] 确定","zh":"实战范例 1: WXYZ-Wing 四值组合锁定 [7]","zh-CN":"实战范例 1: WXYZ-Wing 四值组合锁定 [7]","es":"Ejemplo práctico 1: WXYZ-Wing","de":"Praxisbeispiel 1: WXYZ-Wing","fr":"Exemple pratique 1: WXYZ-Wing","pt":"Exemplo prático 1: WXYZ-Wing","it":"Esempio pratico 1: WXYZ-Wing","ru":"Практический пример 1: WXYZ-Wing","hi":"व्यावहारिक उदाहरण 1: WXYZ-Wing","ar":"مثال عملي 1: WXYZ-Wing"},
      guide: {"ko":"피봇 [1,2,3,4]와 3개 날개에 의해 공통 제한 후보수 4가 소거되었습니다. 남은 [9]를 입력하세요!","en":"Pivot [1,2,3,4] and 3 pincers eliminate restricted candidate 4 to reveal [9]. Enter 9!","ja":"ピボットと3つのウィングにより共通制限候补数 4 が消去され、[9] が确定しました。9 を入力してください！","zh":"枢纽与 3 翼共同消去限制候选数 4，确定正解 [9]。请输入 9！","zh-CN":"枢纽与 3 翼共同消去限制候选数 4，确定正解 [9]。请输入 9！","es":"El pivote y las 3 alas eliminan el 4 restringido, confirmando [9]. ¡Introduce 9!","de":"Pivot [1,2,3,4] und 3 Flügel schließen Kandidat 4 aus und enthüllen [9]. Tragen Sie 9 ein!","fr":"Le pivot [1,2,3,4] et 3 ailes éliminent le candidat 4 et révèlent [9]. Entrez 9 !","pt":"O pivô [1,2,3,4] e 3 asas eliminam o candidato 4 e revelam [9]. Digite 9!","it":"Il perno [1,2,3,4] e 3 ali eliminano il candidato 4 e rivelano [9]. Inserisci 9!","ru":"Опора [1,2,3,4] и 3 крыла исключают кандидата 4 и открывают [9]. Введите 9!","hi":"पिवट [1,2,3,4] और 3 विंग्स 4 को हटाकर [9] प्रकट करते हैं। 9 दर्ज करें!","ar":"المحور [1,2,3,4] و 3 أجنحة تستبعد المرشح المقيد 4 وتكشف [9]. أدخل 9!"},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 9,
      cells: [{"notes":[1,2,3,4],"style":{"background":"rgba(234, 179, 8, 0.25)"},"title":"Pivot"},{"notes":[1,4],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[2,4],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[3,4],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[9],"highlightNotes":[9],"eliminatedNotes":[4],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    },
    {
      id: "wxyz_wing_ex2",
      title: {"ko":"실전 예시 2: WXYZ-Wing 날개 교차 소거로 [1] 확정","en":"Example 2: WXYZ-Wing reveals [1]","ja":"実践例 2: WXYZ-Wing 交差消去による [1] 确定","zh":"实战范例 2: WXYZ-Wing 交叉排除确定 [1]","zh-CN":"实战范例 2: WXYZ-Wing 交叉排除确定 [1]","es":"Ejemplo práctico 2: WXYZ-Wing revela [1]","de":"Praxisbeispiel 2: WXYZ-Wing enthüllt [1]","fr":"Exemple pratique 2: WXYZ-Wing révèle [1]","pt":"Exemplo prático 2: WXYZ-Wing revela [1]","it":"Esempio pratico 2: WXYZ-Wing rivela [1]","ru":"Практический пример 2: WXYZ-Wing открывает [1]","hi":"व्यावहारिक उदाहरण 2: WXYZ-Wing [1] प्रकट करता है","ar":"مثال عملي 2: WXYZ-Wing يكشف عن [1]"},
      guide: {"ko":"WXYZ-Wing에 의해 7이 소거되고 남은 [1]을 입력하세요.","en":"WXYZ-Wing eliminates 7 to reveal [1]. Enter 1.","ja":"WXYZ-Wing连携によりターゲットマスから 7 が消去され、残った [1] を入力してください。","zh":"WXYZ-Wing 联动消去目标格中的 7，填入剩余正解 [1]。请输入 1！","zh-CN":"WXYZ-Wing 联动消去目标格中的 7，填入剩余正解 [1]。请输入 1！","es":"La coordinación WXYZ-Wing elimina el 7 dejando el [1]. ¡Introduce 1!","de":"WXYZ-Wing schließt 7 aus und enthüllt [1]. Tragen Sie 1 ein.","fr":"Le WXYZ-Wing élimine 7 et révèle [1]. Entrez 1.","pt":"O WXYZ-Wing elimina 7 e revela [1]. Digite 1.","it":"Il WXYZ-Wing elimina 7 e rivela [1]. Inserisci 1.","ru":"WXYZ-Wing исключает 7 и открывает [1]. Введите 1.","hi":"WXYZ-Wing 7 को हटाकर [1] प्रकट करता है। 1 दर्ज करें।","ar":"جناح WXYZ يستبعد 7 ليكشف عن [1]. أدخل 1."},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 1,
      cells: [{"notes":[2,5,6,7],"style":{"background":"rgba(234, 179, 8, 0.25)"}},{"notes":[2,7],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[5,7],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[6,7],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[1],"highlightNotes":[1],"eliminatedNotes":[7],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    }
  ],
  'empty-rectangles': [
    {
      id: "empty_rectangles_ex1",
      title: {"ko":"실전 예시 1: 엠프티 렉탱글 L자형 연계로 [8] 확정","en":"Example 1: Empty Rectangle","ja":"実践例 1: エンプティ・レクタングル L字连係による [8] 确定","zh":"实战范例 1: 空矩形 L 形连动确定 [8]","zh-CN":"实战范例 1: 空矩形 L 形联动确定 [8]","es":"Ejemplo práctico 1: Rectángulo vacío","de":"Praxisbeispiel 1: Leeres Rechteck (Empty Rectangle)","fr":"Exemple pratique 1: Rectangle vide (Empty Rectangle)","pt":"Exemplo prático 1: Retângulo vazio","it":"Esempio pratico 1: Rettangolo vuoto","ru":"Практический пример 1: Пустой прямоугольник","hi":"व्यावहारिक उदाहरण 1: खाली आयत","ar":"مثال عملي 1: المستطيل الفارغ (Empty Rectangle)"},
      guide: {"ko":"박스 내 십자형 후보수와 외부 강한 연결의 ER 결합으로 교차 셀에서 8이 소거되었습니다. 남은 [2]를 입력하세요!","en":"Box Empty Rectangle locks candidate 8 via a conjugate pair, eliminating 8 to reveal [2]. Enter 2!","ja":"ブロック外の交差点から 8 が消去され [2] が确定しました。2 を入力してください。","zh":"宫内空矩形 (ER) 结构在交会格排除 8，确定留下 [2]，请输入 2！","zh-CN":"宫内空矩形 (ER) 结构在交会格排除 8，确定留下 [2]，请输入 2！","es":"El Rectángulo Vacío en el bloque elimina el 8 en la intersección, revelando el [2]. ¡Introduce 2!","de":"Empty Rectangle schließt 8 aus und enthüllt [2]. Tragen Sie 2 ein!","fr":"Empty Rectangle élimine 8 et révèle [2]. Entrez 2 !","pt":"Empty Rectangle elimina 8 e revela [2]. Digite 2!","it":"Empty Rectangle elimina 8 e rivela [2]. Inserisci 2!","ru":"Empty Rectangle исключает 8 и открывает [2]. Введите 2!","hi":"Empty Rectangle 8 को हटाकर [2] प्रकट करता है। 2 दर्ज करें!","ar":"المستطيل الفارغ في المربع يقفل المرشح 8 عبر زوج مترافق، ويستبعد 8 ليكشف [2]. أدخل 2!"},
      layoutType: "box3x3",
      targetIndex: 8,
      correctVal: 2,
      cells: [{"notes":[8],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[8],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"notes":[8],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[2],"highlightNotes":[2],"eliminatedNotes":[8],"type":"target"}]
    },
    {
      id: "empty_rectangles_ex2",
      title: {"ko":"실전 예시 2: 엠프티 렉탱글 외부 강한 연결로 [5] 확정","en":"Example 2: Empty Rectangle reveals [5]","ja":"実践例 2: エンプティ・レクタングル强リンクによる [5] 确定","zh":"实战范例 2: 空矩形外部强链排除确定 [5]","zh-CN":"实战范例 2: 空矩形外部强链排除确定 [5]","es":"Ejemplo práctico 2: Rectángulo vacío revela [5]","de":"Praxisbeispiel 2: Leeres Rechteck enthüllt [5]","fr":"Exemple pratique 2: Rectangle vide révèle [5]","pt":"Exemplo prático 2: Retângulo vazio revela [5]","it":"Esempio pratico 2: Rettangolo vuoto rivela [5]","ru":"Практический пример 2: Пустой прямоугольник открывает [5]","hi":"व्यावहारिक उदाहरण 2: खाली आयत [5] प्रकट करता है","ar":"مثال عملي 2: المستطيل الفارغ يكشف عن [5]"},
      guide: {"ko":"ER 구조에 의해 3이 소거되고 남은 [5]를 입력하세요.","en":"ER eliminates 3 to leave [5]. Enter 5.","ja":"ER构造により交差マスから 3 が消去され、残った [5] を入力してください。","zh":"空矩形 ER 结构在交点消去 3，填入剩余正解 [5]。请输入 5！","zh-CN":"空矩形 ER 结构在交点消去 3，填入剩余正解 [5]。请输入 5！","es":"La estructura ER elimina el 3 dejando el [5]. ¡Introduce 5!","de":"Empty Rectangle schließt 3 aus und lässt [5]. Tragen Sie 5 ein.","fr":"Empty Rectangle élimine 3 et laisse [5]. Entrez 5.","pt":"Empty Rectangle elimina 3 e deixa [5]. Digite 5.","it":"Empty Rectangle elimina 3 e lascia [5]. Inserisci 5.","ru":"Empty Rectangle исключает 3 и оставляет [5]. Введите 5.","hi":"Empty Rectangle 3 को हटाकर [5] छोड़ता है। 5 दर्ज करें।","ar":"المستطيل الفارغ يستبعد 3 ويترك [5]. أدخل 5."},
      layoutType: "box3x3",
      targetIndex: 6,
      correctVal: 5,
      cells: [{"notes":[3],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[3],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[3],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"notes":[5],"highlightNotes":[5],"eliminatedNotes":[3],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    }
  ]
};

export default STAGE4_CHAINS_PRACTICE;
