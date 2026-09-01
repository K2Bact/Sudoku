/**
 * stage5Practice.js
 * Master 13-Language Translations for Academy Practice Missions
 */

export const STAGE5_PRACTICE = {
  'finned-xwing': [
    {
      id: "finned_xw_ex1",
      title: {"ko":"실전 예시 1: 지느러미(Fin) X-Wing 교차 제거","en":"Example 1: Finned X-Wing","ja":"実践例 1: フィンドX-Wing交差消去による确定","zh":"实战范例 1: 鳍状 X-Wing 交会排除","zh-CN":"实战范例 1: 鳍状 X-Wing 交会排除","es":"Ejemplo práctico 1: Finned X-Wing con eliminación","de":"Praxisbeispiel 1: Flossen-X-Wing (Finned X-Wing)","fr":"Exemple pratique 1: Finned X-Wing avec élimination","pt":"Exemplo prático 1: Finned X-Wing com eliminação","it":"Esempio pratico 1: Finned X-Wing con eliminazione","ru":"Практический пример 1: Finned X-Wing с исключением","hi":"व्यावहारिक उदाहरण 1: फिनयुक्त X-Wing निष्कासन","ar":"مثال عملي 1: X-Wing ذو الزعانف (Finned X-Wing)"},
      guide: {"ko":"X-Wing 본체 4개 모서리(파랑)와 추가 지느러미 Fin(노랑)을 동시에 바라보는 교차 셀에서 6이 소거되었습니다. 남은 [3]을 입력하세요!","en":"Finned X-Wing eliminates 6 from the mutual sight intersection, leaving [3]. Enter 3!","ja":"X-Wing本体4隅とFinを同时に見渡せる交差マスから 6 が消去され [3] が残りました。3 を入力してください。","zh":"鳍状 X-Wing 主体 4 个顶点与附属鳍 (Fin) 在交会格中排除候选数 6，留下正解 [3]。请输入 3！","zh-CN":"鳍状 X-Wing 主体 4 个顶点与附属鳍 (Fin) 在交会格中排除候选数 6，留下正解 [3]。请输入 3！","es":"El Finned X-Wing elimina el 6 en la intersección compartida, dejando el [3]. ¡Introduce 3!","de":"Finned X-Wing schließt 6 am gemeinsamen Schnittpunkt aus und lässt [3]. Tragen Sie 3 ein!","fr":"Finned X-Wing élimine 6 à l’intersection et laisse [3]. Entrez 3 !","pt":"Finned X-Wing elimina 6 na interseção e deixa [3]. Digite 3!","it":"Finned X-Wing elimina 6 all’incrocio e lascia [3]. Inserisci 3!","ru":"Finned X-Wing исключает 6 на пересечении и оставляет [3]. Введите 3!","hi":"Finned X-Wing प्रतिच्छेदन से 6 को हटाकर [3] छोड़ता है। 3 दर्ज करें!","ar":"جناح إكس ذو الزعنفة يستبعد 6 من تقاطع الرؤية المتبادل ويترك [3]. أدخل 3!"},
      layoutType: "grid4x4",
      targetIndex: 5,
      correctVal: 3,
      cells: [{"notes":[6],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[6],"style":{"background":"rgba(234, 179, 8, 0.25)"},"title":"Fin"},{"val":"·","type":"given"},{"notes":[6],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"notes":[3],"highlightNotes":[3],"eliminatedNotes":[6],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[6],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[6],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    },
    {
      id: "finned_xw_ex2",
      title: {"ko":"실전 예시 2: 지느러미 영향으로 [5] 확정","en":"Example 2: Finned X-Wing reveals [5]","ja":"実践例 2: フィン影响下での [5] 确定","zh":"实战范例 2: 鳍状排除确定 [5]","zh-CN":"实战范例 2: 鳍状排除确定 [5]","es":"Ejemplo práctico 2: Finned X-Wing revela [5]","de":"Praxisbeispiel 2: Flossen-X-Wing enthüllt [5]","fr":"Exemple pratique 2: Finned X-Wing révèle [5]","pt":"Exemplo prático 2: Finned X-Wing revela [5]","it":"Esempio pratico 2: Finned X-Wing rivela [5]","ru":"Практический пример 2: Finned X-Wing открывает [5]","hi":"व्यावहारिक उदाहरण 2: फिनयुक्त X-Wing [5] प्रकट करता है","ar":"مثال عملي 2: X-Wing ذو الزعانف يكشف عن [5]"},
      guide: {"ko":"후보수 8의 핀드 X-Wing에 의해 8이 소거되고 남은 정답 [5]를 입력하세요.","en":"Finned X-Wing eliminates 8, revealing [5]. Enter 5.","ja":"Fin构造の影响范囲から 8 が消去され、[5] が确定しました。5 を入力してください。","zh":"鳍状 X-Wing 结构使交会格排除 8，确定正解为 [5]。请输入 5。","zh-CN":"鳍状 X-Wing 结构使交会格排除 8，确定正解为 [5]。请输入 5。","es":"El Finned X-Wing elimina el 8, revelando el [5]. ¡Introduce 5!","de":"Finned X-Wing schließt 8 aus und enthüllt [5]. Tragen Sie 5 ein.","fr":"Finned X-Wing élimine 8 et révèle [5]. Entrez 5.","pt":"Finned X-Wing elimina 8 e revela [5]. Digite 5.","it":"Finned X-Wing elimina 8 e rivela [5]. Inserisci 5.","ru":"Finned X-Wing исключает 8 и открывает [5]. Введите 5.","hi":"Finned X-Wing 8 को हटाकर [5] प्रकट करता है। 5 दर्ज करें।","ar":"جناح إكس ذو الزعنفة يستبعد 8 ليكشف عن [5]. أدخل 5."},
      layoutType: "grid4x4",
      targetIndex: 5,
      correctVal: 5,
      cells: [{"notes":[8],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"notes":[8],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[5],"highlightNotes":[5],"eliminatedNotes":[8],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[8],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[8],"style":{"background":"rgba(234, 179, 8, 0.25)"}},{"notes":[8],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    }
  ],
  'aic': [
    {
      id: "aic_ex1",
      title: {"ko":"실전 예시 1: 교차 추론 체인(AIC)으로 [3] 확정","en":"Example 1: Alternating Inference Chain","ja":"実践例 1: 交互推論连锁 (AIC) による [3] 确定","zh":"实战范例 1: 交替推理链 (AIC) 确定 [3]","zh-CN":"实战范例 1: 交替推理链 (AIC) 确定 [3]","es":"Ejemplo práctico 1: Cadena de Inferencia Alternada","de":"Praxisbeispiel 1: Alternierende Inferenzkette (AIC)","fr":"Exemple pratique 1: Chaîne d’inférence alternée (AIC)","pt":"Exemplo prático 1: Cadeia de inferência alternada (AIC)","it":"Esempio pratico 1: Catena di inferenza alternata (AIC)","ru":"Практический пример 1: Чередующаяся цепочка выводов (AIC)","hi":"व्यावहारिक उदाहरण 1: वैकल्पिक अनुमान श्रृंखला (AIC)","ar":"مثال عملي 1: سلسلة الاستدلال المتناوب (AIC)"},
      guide: {"ko":"강한 링크와 약한 링크로 교대 연결된 AIC 체인의 양 끝 분석으로 후보수 1이 소거되었습니다. 타겟에 남은 [9]를 입력하세요!","en":"Alternating strong and weak links eliminate candidate 1, revealing [9]. Enter 9!","ja":"始点Aと终点Cの推論连锁により交差マスから 1 が消去され [9] が残りました。9 を入力してください。","zh":"强链与弱链交替相扣的 AIC 链排除候选数 1，确定留下 [9]。请输入 9！","zh-CN":"强链与弱链交替相扣的 AIC 链排除候选数 1，确定留下 [9]。请输入 9！","es":"Los enlaces fuertes y débiles alternados eliminan el candidato 1, revelando el [9]. ¡Introduce 9!","de":"Alternierende Verbindungen schließen Kandidat 1 aus und enthüllen [9]. Tragen Sie 9 ein!","fr":"Les liens alternés éliminent le candidat 1 et révèlent [9]. Entrez 9 !","pt":"Ligações alternadas eliminam o candidato 1 e revelam [9]. Digite 9!","it":"I legami alternati eliminano il candidato 1 e rivelano [9]. Inserisci 9!","ru":"Чередующиеся связи исключают кандидата 1 и открывают [9]. Введите 9!","hi":"बारी-बारी से बनने वाले लिंक 1 को हटाकर [9] प्रकट करते हैं। 9 दर्ज करें!","ar":"الروابط القوية والضعيفة المتناوبة تستبعد المرشح 1 وتكشف [9]. أدخل 9!"},
      layoutType: "row",
      targetIndex: 3,
      correctVal: 9,
      cells: [{"notes":[1,4],"style":{"background":"rgba(59, 130, 246, 0.2)"},"title":"Start A(1)"},{"notes":[4,7],"style":{"background":"rgba(34, 197, 94, 0.2)"},"title":"Node B"},{"notes":[7,1],"style":{"background":"rgba(59, 130, 246, 0.2)"},"title":"End C(1)"},{"notes":[9],"highlightNotes":[9],"eliminatedNotes":[1],"type":"target"}]
    },
    {
      id: "aic_ex2",
      title: {"ko":"실전 예시 2: AIC 강약 루프로 [6] 확정","en":"Example 2: AIC reveals [6]","ja":"実践例 2: AIC 连锁消去による [6] 确定","zh":"实战范例 2: AIC 强弱环排除确定 [6]","zh-CN":"实战范例 2: AIC 强弱环排除确定 [6]","es":"Ejemplo práctico 2: AIC revela [6]","de":"Praxisbeispiel 2: AIC enthüllt [6]","fr":"Exemple pratique 2: L’AIC révèle [6]","pt":"Exemplo prático 2: AIC revela [6]","it":"Esempio pratico 2: L’AIC rivela [6]","ru":"Практический пример 2: AIC открывает [6]","hi":"व्यावहारिक उदाहरण 2: AIC [6] प्रकट करता है","ar":"مثال عملي 2: AIC يكشف عن [6]"},
      guide: {"ko":"AIC 연쇄 추론으로 타겟 셀에서 5가 소거되고 남은 [6]을 입력하세요.","en":"AIC chain inference leaves [6] in the target cell. Enter 6.","ja":"AIC交互连锁推論によりターゲットマスから 5 が消去され、残った [6] を入力してください。","zh":"AIC 交互推論链使目标格消去 5，填入剩余正解 [6]。请输入 6！","zh-CN":"AIC 交互推論链使目标格消去 5，填入剩余正解 [6]。请输入 6！","es":"La deducción por cadena alterna AIC elimina el 5 dejando el [6]. ¡Introduce 6!","de":"AIC-Kette bestimmt [6] im Zielfeld. Tragen Sie 6 ein.","fr":"L’inférence de la chaîne AIC détermine [6] dans la cible. Entrez 6.","pt":"A inferência da cadeia AIC determina [6] no alvo. Digite 6.","it":"L’inferenza della catena AIC stabilisce [6] nel bersaglio. Inserisci 6.","ru":"Вывод цепи AIC определяет [6] в цели. Введите 6.","hi":"AIC श्रृंखला लक्ष्य सेल में [6] निर्धारित करती है। 6 दर्ज करें।","ar":"استدلال سلسلة AIC يترك [6] في الخلية المستهدفة. أدخل 6."},
      layoutType: "row",
      targetIndex: 3,
      correctVal: 6,
      cells: [{"notes":[5,8],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[8,3],"style":{"background":"rgba(34, 197, 94, 0.2)"}},{"notes":[3,5],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[6],"highlightNotes":[6],"eliminatedNotes":[5],"type":"target"}]
    }
  ],
  'als': [
    {
      id: "als_ex1",
      title: {"ko":"실전 예시 1: ALS-XZ 이중 거의 잠긴 집합으로 [4] 확정","en":"Example 1: Almost Locked Sets (ALS-XZ)","ja":"実践例 1: ALS-XZ 準ロック集合连係による [4] 确定","zh":"实战范例 1: ALS-XZ 双拟锁定集确定 [4]","zh-CN":"实战范例 1: ALS-XZ 双拟锁定集确定 [4]","es":"Ejemplo práctico 1: Conjuntos casi bloqueados (ALS-XZ)","de":"Praxisbeispiel 1: Fast gesperrte Mengen (ALS-XZ)","fr":"Exemple pratique 1: Ensembles presque verrouillés (ALS-XZ)","pt":"Exemplo prático 1: Conjuntos quase bloqueados (ALS-XZ)","it":"Esempio pratico 1: Insiemi quasi bloccati (ALS-XZ)","ru":"Практический пример 1: Почти заблокированные множества (ALS-XZ)","hi":"व्यावहारिक उदाहरण 1: लगभग बंद समुच्चय (ALS-XZ)","ar":"مثال عملي 1: المجموعات شبه المقفلة (ALS-XZ)"},
      guide: {"ko":"두 개의 ALS 집합이 제한수 2로 상쇄 연결되어, 교차 셀에서 공통 후보수 7이 소거되었습니다. 남은 [1]을 입력하세요!","en":"Two ALS sets connected by candidate 2 eliminate candidate 7, leaving [1]. Enter 1!","ja":"2つのALS集合が制限数 2 で相杀连结され、交差マスから 7 が消去され [1] が残りました。1 を入力してください！","zh":"两组 ALS 集合透过限制数 2 连结，在交会格消去 7 后留下 [1]。请输入 1！","zh-CN":"两组 ALS 集合透过限制数 2 连结，在交会格消去 7 后留下 [1]。请输入 1！","es":"Dos conjuntos ALS enlazados eliminan el 7 común dejando el [1]. ¡Introduce 1!","de":"Zwei über 2 verknüpfte ALS-Sets schließen 7 aus und lassen [1]. Tragen Sie 1 ein!","fr":"Deux ensembles ALS liés par 2 éliminent 7 et laissent [1]. Entrez 1 !","pt":"Dois conjuntos ALS ligados por 2 eliminam 7 e deixam [1]. Digite 1!","it":"Due insiemi ALS collegati da 2 eliminano 7 e lasciano [1]. Inserisci 1!","ru":"Два множества ALS, связанные 2, исключают 7 и оставляют [1]. Введите 1!","hi":"2 से जुड़े दो ALS सेट 7 को हटाकर [1] छोड़ते हैं। 1 दर्ज करें!","ar":"مجموعتان ALS متصلتان بالمرشح 2 تستبعدان 7 وتتركان [1]. أدخل 1!"},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 1,
      cells: [{"notes":[1,2,7],"style":{"background":"rgba(59, 130, 246, 0.2)"},"title":"ALS 1"},{"notes":[2,7],"style":{"background":"rgba(59, 130, 246, 0.2)"},"title":"ALS 1"},{"val":"·","type":"given"},{"notes":[3,7],"style":{"background":"rgba(234, 179, 8, 0.2)"},"title":"ALS 2"},{"notes":[1],"highlightNotes":[1],"eliminatedNotes":[7],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    },
    {
      id: "als_ex2",
      title: {"ko":"실전 예시 2: ALS-XY Wing 연계로 [8] 확정","en":"Example 2: ALS-XY Wing reveals [8]","ja":"実践例 2: ALS-XY Wing 连係による [8] 确定","zh":"实战范例 2: ALS-XY Wing 连动确定 [8]","zh-CN":"实战范例 2: ALS-XY Wing 联动确定 [8]","es":"Ejemplo práctico 2: ALS-XY Wing revela [8]","de":"Praxisbeispiel 2: ALS-XY Wing enthüllt [8]","fr":"Exemple pratique 2: ALS-XY Wing révèle [8]","pt":"Exemplo prático 2: ALS-XY Wing revela [8]","it":"Esempio pratico 2: ALS-XY Wing rivela [8]","ru":"Практический пример 2: ALS-XY Wing открывает [8]","hi":"व्यावहारिक उदाहरण 2: ALS-XY Wing [8] प्रकट करता है","ar":"مثال عملي 2: ALS-XY Wing يكشف عن [8]"},
      guide: {"ko":"ALS 연쇄 추론으로 타겟 셀에서 9가 소거되고 남은 [8]을 입력하세요.","en":"ALS chain clears candidate 9 to leave [8]. Enter 8.","ja":"ALS-XZ连锁构造によりターゲットマスから 9 が消去され、残った [8] を入力してください。","zh":"ALS-XZ 连锁结构在目标格消去 9，填入剩余正解 [8]。请输入 8！","zh-CN":"ALS-XZ 连锁结构在目标格消去 9，填入剩余正解 [8]。请输入 8！","es":"La estructura ALS-XZ elimina el 9 en la casilla objetivo, dejando el [8]. ¡Introduce 8!","de":"ALS-Kette schließt 9 aus und lässt [8]. Tragen Sie 8 ein.","fr":"La chaîne ALS élimine 9 et laisse [8]. Entrez 8.","pt":"A cadeia ALS elimina 9 e deixa [8]. Digite 8.","it":"La catena ALS elimina 9 e lascia [8]. Inserisci 8.","ru":"Цепь ALS исключает 9 и оставляет [8]. Введите 8.","hi":"ALS श्रृंखला 9 को हटाकर [8] छोड़ती है। 8 दर्ज करें।","ar":"سلسلة ALS تستبعد المرشح 9 وتترك [8]. أدخل 8."},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 8,
      cells: [{"notes":[4,9],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"notes":[4,5,9],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"notes":[5,9],"style":{"background":"rgba(234, 179, 8, 0.2)"}},{"notes":[8],"highlightNotes":[8],"eliminatedNotes":[9],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    }
  ],
  'forcing-chains': [
    {
      id: "forcing_chains_ex1",
      title: {"ko":"실전 예시 1: 강제 체인(Forcing Chains) 두 가설 공통 소거","en":"Example 1: Forcing Chains","ja":"実践例 1: フォーシング・チェイン仮説共通消去","zh":"实战范例 1: 强制链 (Forcing Chains) 双假设排除","zh-CN":"实战范例 1: 强制链 (Forcing Chains) 双假设排除","es":"Ejemplo práctico 1: Cadenas forzadas","de":"Praxisbeispiel 1: Forcierende Ketten (Forcing Chains)","fr":"Exemple pratique 1: Chaînes forçantes (Forcing Chains)","pt":"Exemplo prático 1: Cadeias forçadas (Forcing Chains)","it":"Esempio pratico 1: Catene forzanti (Forcing Chains)","ru":"Практический пример 1: Форсирующие цепочки (Forcing Chains)","hi":"व्यावहारिक उदाहरण 1: बाध्यकारी श्रृंखला (Forcing Chains)","ar":"مثال عملي 1: السلاسل الجبرية (Forcing Chains)"},
      guide: {"ko":"테스트 후보수가 참이든 거짓이든 모든 분기가 타겟 셀의 [7]을 가리키고 있습니다. 확정된 [7]을 입력하세요!","en":"All hypothetical branches converge to verify digit [7] in the target cell. Enter 7!","ja":"テスト候补数の真伪にかかわらず、全分岐がターゲットマスの [7] に収束します。确定した [7] を入力してください！","zh":"無論测试候选数真伪，所有假设分歧路径均指向目标格的 [7]。请输入确定解 7！","zh-CN":"無論测试候选数真伪，所有假设分歧路径均指向目标格的 [7]。请输入确定解 7！","es":"Cualquiera que sea la hipótesis, todas las bifurcaciones señalan [7]. ¡Introduce 7!","de":"Alle hypothetischen Zweige bestätigen [7] im Zielfeld. Tragen Sie 7 ein!","fr":"Toutes les branches hypothétiques confirment le chiffre [7] dans la cible. Entrez 7 !","pt":"Todos os ramos hipotéticos convergem para confirmar [7] no alvo. Digite 7!","it":"Tutti i rami ipotetici confermano il numero [7] nel bersaglio. Inserisci 7!","ru":"Все гипотетические ветви сходятся для подтверждения [7] в цели. Введите 7!","hi":"सभी काल्पनिक शाखाएं लक्ष्य सेल में [7] की पुष्टि करती हैं। 7 दर्ज करें!","ar":"جميع الفروع الافتراضية تتقارب لتأكيد الرقم [7] في الخلية المستهدفة. أدخل 7!"},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 7,
      cells: [{"notes":[3,8],"style":{"background":"rgba(234, 179, 8, 0.25)"},"title":"Branch Pivot"},{"notes":[3,7],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"notes":[8,7],"style":{"background":"rgba(34, 197, 94, 0.2)"}},{"notes":[7],"highlightNotes":[7],"style":{"background":"rgba(34, 197, 94, 0.25)","borderColor":"#22c55e"},"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    },
    {
      id: "forcing_chains_ex2",
      title: {"ko":"실전 예시 2: 수렴 강제 체인으로 [5] 확정","en":"Example 2: Converging Forcing Chain","ja":"実践例 2: 収束フォーシング・チェインによる [5] 确定","zh":"实战范例 2: 汇聚强制链确定 [5]","zh-CN":"实战范例 2: 汇聚强制链确定 [5]","es":"Ejemplo práctico 2: Cadena forzada convergente","de":"Praxisbeispiel 2: Konvergierende forcierende Kette","fr":"Exemple pratique 2: Chaîne forçante convergente","pt":"Exemplo prático 2: Cadeia forçada convergente","it":"Esempio pratico 2: Catena forzante convergente","ru":"Практический пример 2: Сходящаяся форсирующая цепочка","hi":"व्यावहारिक उदाहरण 2: अभिसरण बाध्यकारी श्रृंखला","ar":"مثال عملي 2: السلسلة الجبرية المتقاربة"},
      guide: {"ko":"포싱 체인 수렴 분석으로 타겟 셀에 [4]를 입력하세요.","en":"Forcing chain convergence reveals [4]. Enter 4.","ja":"フォーシングチェイン収束分析により、ターゲットマスに [4] を确定入力してください。","zh":"强制链收敛分析确立目标格解，请填入 [4]！","zh-CN":"强制链收敛分析确立目标格解，请填入 [4]！","es":"El análisis de convergencia confirma la casilla objetivo. ¡Introduce [4]!","de":"Konvergenz der Forcing Chain enthüllt [4]. Tragen Sie 4 ein.","fr":"La convergence de Forcing Chain révèle [4]. Entrez 4.","pt":"A convergência de Forcing Chain revela [4]. Digite 4.","it":"La convergenza di Forcing Chain rivela [4]. Inserisci 4.","ru":"Сходимость Forcing Chain открывает [4]. Введите 4.","hi":"फोर्सिंग चेन अभिसरण [4] प्रकट करता है। 4 दर्ज करें।","ar":"تقارب السلسلة القسرية يكشف عن [4]. أدخل 4."},
      layoutType: "box3x3",
      targetIndex: 4,
      correctVal: 4,
      cells: [{"notes":[1,6],"style":{"background":"rgba(234, 179, 8, 0.25)"}},{"notes":[1,4],"style":{"background":"rgba(59, 130, 246, 0.2)"}},{"val":"·","type":"given"},{"notes":[6,4],"style":{"background":"rgba(34, 197, 94, 0.2)"}},{"notes":[4],"highlightNotes":[4],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    }
  ],
  'exocet': [
    {
      id: "exocet_ex1",
      title: {"ko":"실전 예시 1: 주니어 엑소셋 베이스 법칙으로 [5] 확정","en":"Example 1: Junior Exocet Target Lock","ja":"実践例 1: ジュニア・エクソセ ベース法则による [5] 确定","zh":"实战范例 1: 初級飞鱼导弹 (Junior Exocet) 锁定 [5]","zh-CN":"实战范例 1: 初级飞鱼导弹 (Junior Exocet) 锁定 [5]","es":"Ejemplo práctico 1: Bloqueo de objetivo Junior Exocet","de":"Praxisbeispiel 1: Junior Exocet Zielfeld-Ausschluss","fr":"Exemple pratique 1: Verrouillage cible Junior Exocet","pt":"Exemplo prático 1: Bloqueio de alvo Junior Exocet","it":"Esempio pratico 1: Blocco bersaglio Junior Exocet","ru":"Практический пример 1: Фиксация цели Junior Exocet","hi":"व्यावहारिक उदाहरण 1: जूनियर एक्सोसेट लक्ष्य लॉक","ar":"مثال عملي 1: قفل هدف جونيور إكسوسيت"},
      guide: {"ko":"엑소셋 베이스 셀 [1,2]와 [3,4]의 교차선 법칙에 의해 타겟 컴패니언 셀에 정답 [5]가 확정되었습니다. 5를 입력하세요!","en":"Exocet base cells lock the target companion cell to [5]. Enter 5!","ja":"ExocetのBaseセル [1,2] と [3,4] の対角交差法则により、Targetセルで正解 [5] が确定しました。5 を入力してください！","zh":"Exocet Base 格 [1,2] 与 [3,4] 的交叉法则使 Target 格确定为 [5]。请输入 5！","zh-CN":"Exocet Base 格 [1,2] 与 [3,4] 的交叉法则使 Target 格确定为 [5]。请输入 5！","es":"La regla de cruce Exocet Base [1,2] y [3,4] confirma [5] en la casilla Target. ¡Introduce 5!","de":"Exocet-Basisfelder sperren das Zielfeld auf [5]. Tragen Sie 5 ein!","fr":"Les cases de base d’Exocet verrouillent la cible sur [5]. Entrez 5 !","pt":"As casas base de Exocet bloqueiam o alvo em [5]. Digite 5!","it":"Le caselle base di Exocet bloccano il bersaglio su [5]. Inserisci 5!","ru":"Базовые клетки Exocet блокируют цель на [5]. Введите 5!","hi":"Exocet बेस सेल लक्ष्य सेल को [5] पर लॉक करते हैं। 5 दर्ज करें!","ar":"خلايا إكسوسيت الأساسية تقفل الخلية المرافقة المستهدفة على [5]. أدخل 5!"},
      layoutType: "grid4x4",
      targetIndex: 5,
      correctVal: 5,
      cells: [{"notes":[1,2],"style":{"background":"rgba(59, 130, 246, 0.25)"},"title":"Base 1"},{"notes":[3,4],"style":{"background":"rgba(59, 130, 246, 0.25)"},"title":"Base 2"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[5],"highlightNotes":[5],"style":{"background":"rgba(34, 197, 94, 0.25)","borderColor":"#22c55e"},"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    },
    {
      id: "exocet_ex2",
      title: {"ko":"실전 예시 2: 시니어 엑소셋으로 [8] 확정","en":"Example 2: Senior Exocet","ja":"実践例 2: エクソセ 交差ライン分析による [8] 确定","zh":"实战范例 2: Exocet 交叉线分析锁定 [8]","zh-CN":"实战范例 2: Exocet 交叉线分析锁定 [8]","es":"Ejemplo práctico 2: Análisis de Línea Exocet revela [8]","de":"Praxisbeispiel 2: Senior Exocet","fr":"Exemple pratique 2: Senior Exocet","pt":"Exemplo prático 2: Senior Exocet","it":"Esempio pratico 2: Senior Exocet","ru":"Практический пример 2: Senior Exocet","hi":"व्यावहारिक उदाहरण 2: सीनियर एक्सोसेट","ar":"مثال عملي 2: سينيور إكسوسيت"},
      guide: {"ko":"엑소셋 교차 라인 분석으로 타겟 셀에 [8]을 입력하세요.","en":"Exocet cross-line resolution reveals [8]. Enter 8.","ja":"Exocet交差ライン分析によりターゲットマスに [8] を确定入力してください。","zh":"Exocet 交叉线分析确立目标格解，请填入 [8]！","zh-CN":"Exocet 交叉线分析确立目标格解，请填入 [8]！","es":"El análisis de líneas de cruce Exocet confirma la casilla objetivo. ¡Introduce [8]!","de":"Exocet-Auflösung enthüllt [8]. Tragen Sie 8 ein.","fr":"La résolution des lignes d’Exocet révèle [8]. Entrez 8.","pt":"A resolução de linhas cruzadas de Exocet revela [8]. Digite 8.","it":"La risoluzione delle linee di Exocet rivela [8]. Inserisci 8.","ru":"Разрешение линий Exocet открывает [8]. Введите 8.","hi":"Exocet क्रॉस-लाइन समाधान [8] प्रकट करता है। 8 दर्ज करें।","ar":"حل الخطوط المتقاطعة لإكسوسيت يكشف عن [8]. أدخل 8."},
      layoutType: "grid4x4",
      targetIndex: 5,
      correctVal: 8,
      cells: [{"notes":[2,7],"style":{"background":"rgba(59, 130, 246, 0.25)"}},{"notes":[3,8],"style":{"background":"rgba(59, 130, 246, 0.25)"}},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"notes":[8],"highlightNotes":[8],"type":"target"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"},{"val":"·","type":"given"}]
    }
  ]
};

export default STAGE5_PRACTICE;
