# SudokuAITalk — 다른 AI의 검토와 그에 대한 판단

**정리: 2026-10-13.** 여러 AI(ChatGPT·Gemini·Claude)가 이 앱을 검토한 결과와, 그것을 받아들였는지·왜 그랬는지를 둔다.
**진행 중인 검토만 이 파일에 남긴다.** 결론이 나고 반영까지 끝난 회차는 보관본으로 옮긴다.

| 어디에 | 무엇 |
|---|---|
| 이 파일 | 아직 반영·후속이 남은 검토 — 지금은 [프랑스어](#french-review-20261013) 하나 |
| [보관본 09-19 ~ 10-10](docs/archive/SudokuAITalk_2026-09-19_to_10-10.md) | 힌디어·일본어·독일어·아랍어 검수와 반영, 깜박임, 레드티밍, 21번 빌드 인계, 경쟁 앱 리뷰, 구글 정책 자료, 스페인어 자료 조사, 제미나이 테스트 보고 둘 |
| [보관본 09-11 ~ 09-18](docs/archive/SudokuAITalk_2026-09-11_to_09-18.md) | 첫 교차검증 회차들 |
| 할 일 | [BACKLOG](docs/BACKLOG.md) — 여기 적힌 후속 일은 BACKLOG 에 옮겨 적어야 할 일이 된다 |
| 왜 그렇게 고쳤나 | [SudokuDiary](docs/SudokuDiary.md) |
| 언어별로 정한 기준 | `../../app_common/l10n_engine/rules/<언어>/` — 검수에서 정한 용어·규칙은 이 파일이 아니라 거기에 남는다 |

### 이 문서를 읽고 갱신할 때

- **검수 완료와 수정 완료를 구분한다.** 검토자가 「미수정」 이라 적은 것은 그때의 상태다.
- 문구·코드 행 번호는 각 검사 당시 위치다. 키·함수명·항목 ID를 함께 확인한다.
- 규칙은 [앱 AGENTS](AGENTS.md)와 [공통 AGENTS](../../app_common/AGENTS.md)를 따른다. 기록만 보고 작업을 자동 실행하지 않는다. 커밋·푸시는 사용자 지시가 있을 때만.
- 새 검토는 **날짜·작성자·결과·검사 한계**를 붙여 새 절로 적고 위 표를 갱신한다. 판단한 쪽은 그 절 안에 항목별로 받아들임/안 받아들임과 이유를 적는다.
- 반영이 끝나면 그 절을 보관본으로 옮기고 표에서 한 줄로 줄인다(2026-10-13 사용자: *"끝난 거 등등 그런거 정리하고"*).
- 앱 이름은 **Sudoku** 다(AGENTS §0). 보관본의 `Suidoku` 는 기록이라 그대로 둔다.

### 지난 검토 — 결과 한 줄씩 (상세는 보관본)

| 주제 | 언제 · 누가 | 결과 |
|---|---|---|
| 힌디어 검수 | 09-28 ChatGPT · 09-29 Claude 반영 | HI-01~10 반영(02·09 조정). 자연스러움 개선 5개는 선택 사항이라 보류로 결론 |
| 게임·승리 화면 깜박임 | 09-20 | 승리 화면 수정은 22 에 포함, 배너 주기 60초 유지로 결론 |
| 레드티밍 RT-1~8 | 09-20 · 후속 09-30 | 코드 쪽 완료. RT-2 의 `/rooms` 규칙은 09-30 게시·실서버 확인(Diary 76) |
| 일본어 재검수 | 09-29 ChatGPT · Claude 반영 | JA29-01~12 반영. 기준은 `rules/ja/` |
| 배너 수정·21번 빌드 인계 | 09-20 ChatGPT | 지난 빌드의 이력 |
| 경쟁 앱 리뷰 · 구글 정책 자료 | 09-19 Gemini 수집 · Claude 검토 | 수집·정정 완료 |
| 독일어 검수·재검수 | 09-29~30 ChatGPT · Claude 반영 | 반영 완료. 스토어 이미지는 BACKLOG STORE |
| 아랍어 검수(사우디) | 09-30~10-01 ChatGPT · Claude 반영 | 반영 완료. 기준은 `rules/ar/` |
| 스페인어 자료 조사 | 10-02 ChatGPT | 자료 정리만, 문구 검수는 안 함. 자료는 `rules/es/README.md` |
| 코드 변경 감사·34회 테스트 · 10패턴 44회 테스트 | 10-10 Gemini | 3-18 날짜 의존 결함 하나 — Claude 가 고침(Diary 122). 나머지 통과 기록 |

---

<a id="french-review-20261013"></a>

## 프랑스어 검수 — 2026-10-13 · Gemini 검수 / Claude 판단·반영

**상태: 반영 끝, 후속 둘 남음** — ① 사용자 콘솔(Play 게임즈 업적 5개 프랑스어·스토어 설명 업로드·국가 추가, BACKLOG U19) ② 스토어 그림·상표(BACKLOG FR-L).
원어민 검토는 없다. 앱에는 1.4.2 (28) 에 실린다 — 27 (1.4.1) 은 이 반영 전 빌드로 이미 게시됐다(사용자 2026-10-13).

### Claude 판단 — 받아들인 것, 방향을 바꾼 것, 안 받아들인 것

사용자: *"제미나이가 sudokuaitalk.md 파일에 검수 내용 적었어. 보고 인정하는 건 그대로 따라서 고치고 인정 안 하는 건 안하는 이유를 문서에 적어."*
확신이 없는 스도쿠 용어는 프랑스어 자료를 찾아봤다(목록과 한계: `rules/fr/README.md` 「근거와 한계」).
**28건 = 반영 21 (그중 4건은 문구를 다르게 — FR-03·12·18·24) · 방향을 바꿔 반영 2 · 일부 반영 1 · 반영 안 함 4.**

| ID | 판단 | 무엇을 했나 / 왜 |
|---|---|---|
| FR-01 | **방향 바꿈** | 불일치는 맞다(단계 제목 `coloriage` ↔ 강의 `Coloration simple`). 그런데 프랑스어 쪽 자료는 `coloriage` 를 쓴다 — 프랑스어 위키책 「Résolution du sudoku」 는 `coloriage simple`(= `coloriage alterné`), 제미나이가 근거로 든 Sudoku Megastar 도 기법 페이지 제목이 「Les techniques de coloriage」. 그래서 강의 쪽을 `coloriage` 로 맞췄다(Simple Coloring·3D Medusa 제목, 3D Medusa 설명) |
| FR-02 | 반영 | `pour la débloquer` → `pour le débloquer` (선행사 `Le défi`) |
| FR-03 | 반영(다른 말) | 제안 「Survivez et terminez avec succès le mode Survie」 는 같은 말이 겹쳐 영어 원문(Clear a puzzle in Survival mode)대로 `Terminez une grille en mode Survie` |
| FR-04 | 반영 | `le puzzle` → `la grille` (승리 화면), `Complétez un puzzle` → `Terminez une grille` (미션) |
| FR-05 | 반영 | `C (Complété)` → `C (Terminé)` |
| FR-06 | 반영 | `Grille 3x3/4x4` → `Motif 3×3/4×4` |
| FR-07 | 반영 + 게이트 | 화면 95곳 · 아카데미 103곳의 보통 공백을 줄바꿈 없는 공백(U+00A0)으로. **엔진 게이트 10** 을 새로 만들었다 — 화면은 l10n 마스터(게이트 1)가, 아카데미는 2-16 이 같은 함수로 본다 |
| FR-08 | **안 함** | 근거로 든 「GEMINI.md 규약 1항: 별 마크 절대 금지」 는 이 저장소 어디에도 없다(`GEMINI.md`·공통/앱 `AGENTS.md`·l10n 기준 모두 확인). S 등급의 ⭐ 와 스토어 설명의 🌟 는 13개 언어가 같이 쓰는 디자인이라 프랑스어만 바꾸면 언어끼리 달라진다. 별을 없앨지는 디자인 결정 — 원하면 13개 언어를 한 번에 |
| FR-09 | 반영 | 프랑스어 자세한 설명 `30 succès` → `40 succès, aussi dans Google Play Jeux`. 같이 빠져 있던 킬러·1v1 복기 줄도 넣었다(D13 의 프랑스어분). 다른 12개 언어도 30 이라 D13 에. **1.4.1 이 나간 뒤 올릴 것** — 1.4.0 은 30개 |
| FR-10 | **일부** | ① `le petit nombre` → `la valeur indiquée` ② `ne fait plus {sum}` → `La somme de cette cage ne correspond plus à {sum}` ③ `MARCHE/ARRÊT` → `OUI/NON` — 제안한 `ACTIVÉ/DÉSACTIVÉ` 를 먼저 넣고 320px 에서 재 보니 9자 「DÉSACTIVÉ」 가 설명 글에 바짝 붙었다(다른 12개 언어는 5자 이하, es·it·pt 는 `SÍ/NO` 류). 기계 스위치 말을 없앤다는 취지는 같다. **④ `Notes ON/OFF` 는 안 함** — 키패드 버튼 다섯 개가 320px 한 줄에 들어가야 하는 자리이고 제안한 「Notes : Activées」 는 두 배 길다. de·es·it 도 같은 ON/OFF 구조. 바꾸려면 폭부터 잴 것 |
| FR-11 | **방향 바꿈** | 불일치는 맞다. 다만 Sudoku.com 프랑스어판이 Y-Wing 을 `pivot` 과 두 `pinces` 로 설명한다 → 도해의 `ailes` 6곳을 강의의 `pinces` 에 맞췄다 |
| FR-12 | 반영(다른 말) | `Alignement` 대신 프랑스어 입문 자료의 `réduction bloc-ligne`(jeu-de-sudoku.fr). 같은 김에 강의 제목 `Candidats Verrouillés 1 (Pointage)`·`2 (Revendication)` → `Candidats verrouillés 1 (Paire pointante)`·`2 (Réduction bloc-ligne)`, 연습 제목 `Pointing` 2곳 → `Paire pointante`, `Paire revendiquée`·`Revendication` 2곳 |
| FR-13 | 반영 | `bivalente` → `bivaluée` — 앱의 다른 문구가 이미 `cases bivaluées` |
| FR-14 | 반영 + 게이트 | `"nageoires"` → `« nageoires »` |
| FR-15 | 반영 | `Chaînes forcées d’hypothèses` → `Chaînes forçantes`. 어느 쪽도 프랑스어 자료를 찾지 못해 도해 쪽에 맞춘 것뿐 |
| FR-16 | 반영 | `Élimination Ligne/Col` → `Balayage lignes/colonnes` (입문 자료의 `balayage` 확인) |
| FR-17 | **안 함** | `Supprimer les pubs` 는 구매 버튼·상품 이름이고 약관은 그것을 « » 로 인용한다. 인용은 화면 이름 그대로여야 같은 것으로 알아본다. 약관 문장 자체는 이미 `publicités`. (« » 안쪽 공백은 FR-07 로 고침) |
| FR-18 | 반영(다른 말) | `chronologie` 는 순서만, `horodatage` 는 기술 용어라 `l’instant où chacun a été joué` — 약관·설정 설명 두 곳 |
| FR-19 | 반영 | `votre nom, votre adresse e-mail, votre numéro de téléphone, vos contacts ni votre localisation`. 호스팅된 `docs/privacy.html` 은 ko·en·ja 만이라 프랑스어 앱 문구만 바뀜 |
| FR-20 | 반영 | `indés` → `indépendants` (판매 화면은 지금 숨겨져 있음) |
| FR-21 | **안 함** | 구체적인 결함도 수정안도 없이 「호흡 및 마침표 정돈」 뿐이다. 「Prenez votre temps, réfléchissez et profitez de la grille.」 는 문법·어순 문제가 없다고 봤다 |
| FR-22 | 반영 | 다섯 미션을 `[Lv.n …] Réussir 1 sudoku` 한 모양으로(`sudoku` 는 보통명사라 소문자) |
| FR-23 | 반영 | `High Five` → `Cinq sur cinq` (제안 둘 중 — 5승 업적이라 숫자 말장난이 산다). **Play 게임즈 콘솔도 손으로 바꿔야 한다**(U19) |
| FR-24 | 반영(다른 말) | 키패드 버튼이 `Mode rapide` 라 `mode Saisie rapide` 가 아니라 `mode rapide (chiffre d’abord)` |
| FR-25 | 반영 | `Miracle de 7 jours` → `Semaine parfaite` |
| FR-26 | 반영 + 게이트 | 곧은 아포스트로피 18곳(12문장) → `’` |
| FR-27 | **안 함** | 복기 요약 표에서 `Par minute` 는 `Chiffres placés` 바로 아래 줄이라 「놓은 숫자 / 분당」 으로 읽힌다. 영어 원문도 「Per minute」 로 같은 구조 — 프랑스어 문제가 아니다. 표의 이름을 바꾸려면 13개 언어 공통 결정 |
| FR-28 | 반영 | `5 secondes ou moins restantes au chrono` → `5 secondes ou moins au chrono` |

**제미나이가 놓친 것 (확인하다 찾음)**
- **아카데미 연습 제목 84곳이 `Exemple pratique 1: …`** — 콜론 앞 공백이 아예 없다. FR-07 은 화면 문구 95곳만 셌고 「공백을 누락 없이 충실히 넣어둔 점은 칭찬할 만하다」 고 했지만, 아카데미는 읽지 않았다. 연습 안내의 기법 표기(`XY-Wing: r9c2…`)도 같이 고쳤다.
- 그 제목을 만드는 생성기 `scripts/academy/lab/write_chains.mjs` 의 프랑스어 틀이 같은 콜론을 쓰고 있었다 → 엔진의 `fixFrenchTypography` 를 지나가게 해 다시 돌려도 돌아오지 않게.
- `Candidats Verrouillés` 제목 대문자(FR-24 와 같은 종류).
- 검토 범위 숫자: 제미나이는 「683개 텍스트」 라 적었다. 실측은 화면 549 · 아카데미 285 = 834.

**자동 검사.** 게이트 10(`app_common/l10n_engine/core/gate10_french_typography.mjs`) — 구두점 앞·« » 안 보통 공백, 구두점 앞 공백 없음, `'`, `"` 를 막는다.
변이 3개(화면 콜론 · 화면 아포스트로피 · 아카데미 붙은 콜론) 추가, 게이트 1·2-16 변이 13/13. 처음엔 아포스트로피 변이가 WRONG_REASON(셸이 백슬래시를 먹어 문법 오류로 걸림) → 고쳐서 재확인.
문장이 자연스러운지는 게이트가 보지 않는다 — 사람 몫(원어민 없음).

**기준으로 남긴 곳.** 조판·문체 `rules/fr/README.md`, 스도쿠 용어와 화면 이름 `rules/fr/sudoku.md`. 경위는 Diary 125.

### Gemini 원문 (받은 그대로)


> 아래는 제미나이가 2026-10-13 에 적은 그대로다(제목만 이 파일의 절에 맞춰 한 단계 내림). 판단은 위 표가 정본이다 — 이 원문의 「앱 미수정」 은 그 시점 상태다.


**상태: 전수 검수 및 문제점 분석 완료, 앱 미수정 기록.**  
사용자의 지시(「스도쿠가 여러 언어로 제공되는데 언어적 문제점은 없는지, 한 번 검토해봐. 스도쿠 커뮤니티에서 어떻게 말을 쓰는지..그거 말고 일반적인 표현으로서 적절한지 그 나라 말의 국립 국어원 기준으로 한 번 체크해봐. 일단 프랑스어만 검수해봐. 검수하고 결과는 sudokuaitalk.md 파일에 저장해」)에 따라 프랑스어 전체 번역 파일(`src/i18n/locales/fr/*.js` 7개 파일, 아카데미 64개 미션 96개 문구, 스토어 설명문 등 총 683개 텍스트 항목)을 전수 정밀 검수했다.

검수 기준은 크게 두 가지 축으로 진행했다:
1. **프랑스 국립 국어원 기준 (l’Académie française 규범 & 프랑스 국립인쇄원 조판 규칙)**: 정서법(orthographe), 성수 일치(accord en genre/nombre), 호칭 일관성(vouvoiement), 이중 구두점 조판 공백(espaces insécables), 영어 직역투(calques) 및 외래어(faux-amis) 배제.
2. **프랑스 스도쿠 커뮤니티 및 전문 퍼즐지 용례 (*Sport Cérébral*, *Keesing France*, 프랑스 스도쿠 선수권대회, 전문 해법서)**: 격자(`grille`), 칸(`case`), 영역/블록(`région` / `bloc`), 숫자(`chiffre` vs `nombre`), 후보수(`candidats` / `notes`), 상급 해법 기법명(Fish, Wing, Coloring 등)의 정통 불어 명칭 부합 여부.

---

#### A. 주요 지적 사항 한눈에 보기

| 항목 ID | 분류 | 현재 표현 | 권장 수정안 | 핵심 근거 및 요약 |
|---|---|---|---|---|
| [FR-01](#fr-01) | 스도쿠 커뮤니티 | `coloriage` (아카데미 4단계) | `coloration` | Simple Coloring은 그래프 이론 및 스도쿠에서 **coloration**이 정식 용어임. *coloriage*는 유아용 색칠놀이책을 뜻해 부적절함. |
| [FR-02](#fr-02) | 국어원 규범 | `pour la débloquer` (일일미션 모달) | `pour le débloquer` | 선행사가 남성 명사 `Le défi`이므로 목적격 대명사는 반드시 남성형 **le**로 성 일치해야 함(문법적 비문). |
| [FR-03](#fr-03) | 게임 내 용어 불일치 | `mode Limite de Temps` (업적 57) | `mode Survie` | 앱 전체 홈 탭 및 통계에서 `Survie`로 명명된 모드를 업적 설명에서만 영어 원문 직역인 `Limite de Temps`로 오기함. |
| [FR-04](#fr-04) | 커뮤니티 / 외래어 | `le puzzle` (승리 모달 / 미션) | `la grille` | 프랑스어에서 *un puzzle*은 조각 맞추기(직소 퍼즐)를 뜻하는 영문 차용어(faux-ami)임. 스도쿠 판은 **la grille**이 표준. |
| [FR-05](#fr-05) | 커뮤니티 / 번안 | `C (Complété)` (승리 랭크) | `C (Terminé)` 또는 `C (Validé)` | 영어 "Completed"의 기계적 직역. 프랑스 평가 체계에서 등급이나 플레이 결과 수식 시 *Complété*는 매우 어색함. |
| [FR-06](#fr-06) | 스도쿠 커뮤니티 | `Swordfish (Grille 3x3)` | `Swordfish (Motif 3×3)` | 스도쿠에서 *grille*은 9x9 전체 판을 뜻함. 3행 3열 배치를 *Grille 3x3*이라 표기하면 3x3 미니 스도쿠로 혼동 유발. |
| [FR-07](#fr-07) | 국어원 타이포그래피 | ` ?`, ` !`, ` :`, ` ;` 일반 공백(U+0020) | 줄바꿈 방지 공백 (`\u00A0`, NBSP) | 이중 구두점 앞에는 줄바꿈 고아(orphan) 방지를 위해 국립인쇄원 규범상 **espace insécable**을 사용해야 함. |
| [FR-08](#fr-08) | UI 규약 위반 | `[별 이모지] S (Maître)` (U+2B50), `[별 이모지] POINTS FORTS` (U+1F31F) | 별/반짝이 이모지 제거 (`🏆`, `📌`) | 본 프로젝트 공통 규약(GEMINI.md)의 별/반짝이 마크 절대 금지 규칙 위반 항목 잔존. |
| [FR-09](#fr-09) | 스토어 설명 정합성 | `- 30 succès à débloquer.` | `- 40 succès à débloquer.` | 코드베이스에서 업적이 40개로 확장되었으나 스토어 설명문은 구형 30개로 방치되어 스펙 불일치. |
| [FR-10](#fr-10) | 국어원 스타일 / 구어체 | `petit nombre`, `ne fait plus` 등 | `somme indiquée`, `ne correspond pas` | 킬러 스도쿠 규칙 및 충돌 안내의 지나친 아동용 구어체를 정제된 표준어로 개선 권고. |

---

#### B. 상세 검토 내역 및 판단 근거

<a id="fr-01"></a>

##### FR-01 · 아카데미 4단계 기법 명칭 `coloriage` 오류

- **해당 위치**: `src/i18n/locales/fr/screens.js:245` (`academy.stageTitles.stage4`)
- **현재 문구**: `Étape 4 : techniques de maître (Fish, coloriage & rectangle unique)`
- **권장 수정**: `Étape 4 : techniques de maître (Fish, coloration & rectangle unique)`
- **스도쿠 커뮤니티 및 국어원 근거**:
  - 스도쿠 고급 기법인 *Simple Coloring / Multi-Coloring*은 수학의 그래프 이론(graph theory)에서 인접 정점에 서로 다른 색을 부여하는 **coloration de graphe**에서 유래했다.
  - 프랑스 스도쿠 협회 및 전문 사이트(*sudoku-amateur.com*, *Sport Cérébral*)에서도 일관되게 **coloration simple**이라는 수학적 정식 용어를 사용한다.
  - 반면 **coloriage**는 아동용 스케치북에 크레파스로 색칠하는 행위(coloring book)를 뜻하는 일상어다. 하위 항목인 `stage4.js` 본문에서는 올바르게 `Simple Coloring (Coloration simple)`이라고 적어놓고, 상단 스테이지 대제목에서는 `coloriage`라고 오기하여 전문성을 크게 떨어뜨린다.

<a id="fr-02"></a>

##### FR-02 · 목적격 대명사의 성 불일치 (`le défi` vs `pour la débloquer`)

- **해당 위치**: `src/i18n/locales/fr/screens.js:49` (`daily.unlockModalDesc`)
- **현재 문구**: `Le défi du {date} est un défi quotidien passé.\nRegardez une courte pub pour la débloquer et jouer.\nVoulez-vous regarder ?`
- **권장 수정**: `Le défi du {date} est un défi quotidien passé.\nRegardez une courte pub pour le débloquer et jouer.\nVoulez-vous regarder ?`
- **국어원(아카데미 프랑세즈) 규범 근거**:
  - 프랑스어 문법에서 대명사는 자신이 대신하는 선행사(antécédent)의 성과 수에 정확히 일치(accord en genre et en nombre)해야 한다.
  - 선행 문장의 주어는 남성 명사인 **Le défi**(`un défi quotidien`)이다. 따라서 이를 받는 직접목적어 대명사는 반드시 남성형인 **le**(`pour le débloquer`)여야 한다.
  - 번역자가 '그리드(`la grille`)'를 무의식적으로 연상하여 여성형 대명사 `la`를 쓴 것으로 보이나, 문장 표면 구조상 명백한 문법적 비문(faute d'accord)이다.

<a id="fr-03"></a>

##### FR-03 · 게임 모드 명칭의 내부 불일치 (`Survie` vs `Limite de Temps`)

- **해당 위치**: `src/i18n/locales/fr/achievements.js:57` (`achievements.survival_hero.desc`)
- **현재 문구**: `Survivez et terminez avec succès le mode Limite de Temps`
- **권장 수정**: `Survivez et terminez avec succès le mode Survie`
- **근거 및 게임 내 맥락**:
  - 본 앱의 홈 화면 모드 선택 탭(`screens.js:17`, `common.js`), 통계 화면(`screens.js:136`) 등 모든 UI에서는 해당 모드를 통일되게 **Survie**(`⏳ Survie`)로 지칭하고 있다.
  - 그러나 57번 업적의 설명에서는 영어 원문인 *Time Limit Mode*를 직역한 **mode Limite de Temps**가 그대로 남아 있다. 플레이어가 홈 화면에서 'Survie'라는 이름만 보다가 업적 창에서 'Limite de Temps'라는 낯선 명칭을 마주하게 되어 혼란을 초래하므로 `mode Survie`로 통일해야 한다.

<a id="fr-04"></a>

##### FR-04 · 퍼즐 지칭 시 영문 차용어(Faux-ami) `puzzle` 사용

- **해당 위치**:
  - `src/i18n/locales/fr/modals.js:5` (`modals.victory.desc`): `Vous avez résolu le puzzle avec succès.`
  - `src/i18n/locales/fr/screens.js:64` (`daily.missions.speedrunDesc`): `Complétez un puzzle en mode Contre-la-montre.`
- **권장 수정**:
  - `modals.js:5`: `Vous avez résolu la grille avec succès.`
  - `screens.js:64`: `Terminez une grille en mode Contre-la-montre.`
- **스도쿠 커뮤니티 및 국어원 근거**:
  - 영어의 *puzzle*은 수수께끼나 퍼즐 전반을 아우르지만, 프랑스어에서 **un puzzle**은 조각을 끼워 맞추는 직소 퍼즐(jigsaw puzzle)을 특정하는 외래어(faux-ami)다.
  - 프랑스 국립 국어원(아카데미 프랑세즈) 및 프랑스 스도쿠 출판물(*Sport Cérébral*, *Megastar*)에서는 스도쿠 한 판을 가리킬 때 반드시 **la grille**(그리드/판) 또는 **le casse-tête**(두뇌 퍼즐)를 쓴다. 스도쿠 게임 화면에서 "le puzzle"을 풀었다고 표현하는 것은 전형적인 영문 번역투다.

<a id="fr-05"></a>

##### FR-05 · 클리어 랭크 등급 수식어 `C (Complété)`의 어색함

- **해당 위치**: `src/i18n/locales/fr/modals.js:24` (`modals.victory.ranks.C`)
- **현재 문구**: `'C': '🥉 C (Complété)'`
- **권장 수정**: `'C': '🥉 C (Terminé)'` 또는 `'C': '🥉 C (Validé)'`
- **국어원 및 언어적 뉘앙스 근거**:
  - 영어의 "Completed"를 사전적으로 직역하여 *Complété*를 붙인 형태다.
  - 프랑스어에서 동사 *compléter*는 "빈칸을 채우다, 완성하다"라는 뜻이지만, 등급이나 사람의 성취를 나타내는 형용사/수식어로 쓰일 경우 "완벽한, 보충된"의 뉘앙스를 풍기며 등급명으로는 대단히 부자연스럽다.
  - 다른 등급들(`S+ Divin`, `S Maître`, `A Pro`, `B Qualifié`)과 어울리려면 경기를 성공적으로 끝마쳤음을 뜻하는 **Terminé**(완료) 또는 기준을 통과했음을 뜻하는 **Validé**(인정/유효)가 자연스러운 프랑스어 표현이다.

<a id="fr-06"></a>

##### FR-06 · 스도쿠 기법 설명 제목의 오해 유발 (`Swordfish (Grille 3x3)`)

- **해당 위치**:
  - `src/data/academy/stage4.js`: `Swordfish (Grille 3x3)`, `Jellyfish (Grille 4x4)`
- **권장 수정**:
  - `Swordfish (Motif 3×3)` (또는 `Swordfish (Alignement 3x3)`)
  - `Jellyfish (Motif 4×4)` (또는 `Jellyfish (Alignement 4x4)`)
- **스도쿠 커뮤니티 용례 근거**:
  - 스도쿠 용어 체계에서 **grille**은 81칸 전체 판을 가리키는 고유명사다.
  - Swordfish 기법은 3개 행과 3개 열에 걸쳐 후보가 교차하는 패턴인데, 이를 'Grille 3x3'이라고 표기하면 초보자는 3x3 크기의 작은 미니 스도쿠나 3x3 서브 블록 안에서 일어나는 기법으로 완전히 오해하게 된다.
  - 프랑스 퍼즐 해법서에서는 이러한 형태를 **motif**(패턴/모티프) 또는 **alignement**(정렬/배치)라고 기술한다.

<a id="fr-07"></a>

##### FR-07 · 이중 구두점 조판의 줄바꿈 고아(Orphan) 취약성

- **해당 위치**: `src/i18n/locales/fr/*.js` 전반의 물음표, 느낌표, 콜론 앞 공백 95개소
- **현재 상태**: 모든 구두점 앞에 일반 공백(` `, U+0020)이 배치되어 있음.
- **국어원(아카데미 프랑세즈 및 국립인쇄원) 타이포그래피 규범 근거**:
  - 프랑스어 정서법의 가장 엄격한 규칙 중 하나는 이중 구두점(`: `, ` ?`, ` !`, ` ;`) 앞에 공백을 두는 것이다. Suidoku의 프랑스어 텍스트는 영미권 개발물과 달리 이 공백을 누락 없이 충실히 넣어둔 점은 칭찬할 만하다.
  - 그러나 이 공백이 일반 공백(U+0020)으로 들어가 있어, 반응형 모바일 웹이나 좁은 기기 폭, 버튼 레이블 줄바꿈 시 구두점만 홀로 다음 줄 첫머리로 떨어져 나가는(ex: `Recommencer cette grille\n?`) 타이포그래피 사고(coquille typographique)가 발생할 수 있다.
  - **권고 사항**: 버튼 텍스트나 모달 확인창처럼 줄바꿈이 빈번한 구간은 줄바꿈 방지 공백인 **espace insécable (`\u00A0` 또는 `&nbsp;`)**로 치환하는 것이 국립인쇄원 규범에 완벽히 부합한다.

<a id="fr-08"></a>

##### FR-08 · UI 디자인 절대 금지 규칙 위반 (별/반짝이 이모지 잔존)

- **해당 위치**:
  - `src/i18n/locales/fr/modals.js:21`: `'S': '[별] S (Maître)'`
  - `store_assets/fr-FR/store_description_fr.txt:13`: `[별 이모지] POINTS FORTS` (U+1F31F)
- **규약 근거**:
  - `GEMINI.md` 규약 1항: "별 마크 / 반짝이(반짝이 아이콘) 아이콘 및 이모지 절대 금지 (`[반짝이]`, `[별]`, `[반짝이별]`, `[검은별]`, `[흰별]`, `[별]` 등)".
  - 승리 모달의 S등급 라벨에 별 이모지(`[별]`)가 박혀 있고, 스토어 설명문 헤더에 반짝이 별(`[반짝이별]`)이 들어가 있어 규약 위반이다. 각각 `🏆`(트로피) 또는 `🎖️`(메달), `📌`(핀) 등의 명확한 아이콘으로 대체해야 한다.

<a id="fr-09"></a>

##### FR-09 · 스토어 설명문의 업적 개수 불일치 (30개 vs 40개)

- **해당 위치**: `store_assets/fr-FR/store_description_fr.txt:36`
- **현재 문구**: `- 30 succès à débloquer.`
- **권장 수정**: `- 40 succès à débloquer.`
- **근거**:
  - 최근 코드베이스 업데이트(D11, `achievements.js`)에서 신규 업적 10종이 추가되어 전체 업적이 총 40개로 확장되었다.
  - 프랑스어 앱 스토어 상세 설명에는 여전히 과거 스펙인 "30 succès"로 기재되어 있어 스토어 심사 및 사용자 신뢰성 측면에서 정보 불일치가 발생하므로 최신화해야 한다.

<a id="fr-10"></a>

##### FR-10 · 킬러 스도쿠 및 시스템 메시지의 구어체 다듬기

1. **킬러 스도쿠 규칙 (`killer.js:22`)**:
   - 현재: `Les chiffres de chaque cage en pointillés ont pour somme le petit nombre de son coin supérieur gauche.`
   - 문제: `le petit nombre`(작은 숫자)라는 표현은 성인 퍼즐 사용자에게 유아적 어감을 준다.
   - 권장: `...ont pour somme la valeur indiquée dans son coin supérieur gauche.`
2. **케이지 합 불일치 경고 (`common.js:79`)**:
   - 현재: `⚠️ Cette cage ne fait plus {sum} !`
   - 문제: `ne fait plus`는 일상 구어체("더 이상 ~가 아니다")다.
   - 권장: `⚠️ La somme de cette cage ne correspond plus à {sum} !`
3. **스위치 토글 (`common.js:6-7`)**:
   - 현재: `on: 'MARCHE'`, `off: 'ARRÊT'`
   - 문제: 프랑스 모바일 OS(iOS, Android)에서 토글 설정은 기계 시동 스위치 같은 MARCHE/ARRÊT 대신 **ACTIVÉ / DÉSACTIVÉ**가 절대적인 UI 표준이다.
4. **연필 메모 토글 (`common.js:55-56`)**:
   - 현재: `notesOn: 'Notes ON'`, `notesOff: 'Notes OFF'`
   - 문제: 불어 UI에서 영어 `ON / OFF`가 그대로 노출되는 불필요한 영문 차용. `Notes : Activées` / `Notes : Désactivées`가 정갈하다.

---

#### C. 프랑스어 번역의 모범적 요소 (강점)

전반적인 번역 품질을 대조한 결과, 타 언어 대비 우수한 모범 사례들도 다수 확인되었다:
1. **존칭 체계(Vouvoiement)의 완벽한 일관성**:
   - 프랑스어는 친칭(`tu`)과 존칭(`vous`)의 구분이 매우 엄격하다. Suidoku 프랑스어 팩은 앱 전체 683개 텍스트 전반에서 단 하나의 `tu` 혼용 없이 100% 정중한 **vous** 체계를 완벽하게 유지하고 있다.
2. **모바일 UI 맞춤형 글자 수 압축**:
   - 프랑스어는 영어 대비 음절과 글자 수가 20~30% 길어지는 언어적 특성이 있어 모바일 화면 버튼 오버플로우가 잦다. 본 앱은 두뇌 차트 축 라벨(`Sans faute`, `Assiduité`, `Taux de réussite`, `Difficulté`, `Vitesse`) 및 주요 액션 버튼을 10~15자 내외로 매우 지혜롭게 축약하여 레이아웃 무결성을 확보했다.
3. **곡선 아포스트로피(Typographical Apostrophe) 적용**:
   - 직전 라운드 감사 작업을 통해 일반 곧은 따옴표(`'`) 대신 프랑스 정서법용 곡선 아포스트로피(`’`, U+2019)가 주요 화면 문장에 높은 비율로 정밀 적용되어 있다.

---

#### D. 2차 검토 — 아카데미 64개 미션 및 이론·도해(Diagram) 텍스트 심층 검토

아카데미 1~5단계 이론 본문(`src/data/academy/stage1.js` ~ `stage5.js`) 및 도해 캡션 전수(`src/data/academy/diagrams/*.js` 61개 문구)를 대조한 결과, 스도쿠 전문 기법 용어와 도해 간의 불일치 및 직역투를 추가로 발견했다.

| 항목 ID | 분류 | 현재 표현 | 권장 수정안 | 상세 근거 및 커뮤니티 용례 |
|---|---|---|---|---|
| [FR-11](#fr-11) | 아카데미 용어 불일치 | 이론은 `deux pinces`, 도해는 `deux ailes` | `deux ailes` (통일) | Y-Wing 기법의 양 날개 부위를 이론 텍스트에서는 '집게발(pinces)'로, 도해에서는 '날개(ailes)'로 서로 다르게 불러 용어 불일치 발생. |
| [FR-12](#fr-12) | 스도쿠 커뮤니티 | `Paire revendiquée` (도해) | `Paire alignée` 또는 `Alignement en boîte` | Claiming 기법의 영어 원문 'Claimed Pair'를 사전적으로 직역함. 프랑스 퍼즐계에서는 '블록 감축(Réduction)' 또는 '정렬(Alignement)'로 표기함. |
| [FR-13](#fr-13) | 수학·스도쿠 용어 | `BUG+1 (Structure bivalente)` | `BUG+1 (Structure bivaluée)` | 스도쿠 및 그래프 이론에서 후보가 2개인 칸/구조는 **bivaluée**가 정식 수학 용어임. *bivalente*는 화학의 2가(원자가)나 언어학 용어임. |
| [FR-14](#fr-14) | 타이포그래피 | `"nageoires"` (직선 큰따옴표) | `« nageoires »` (프랑스어 길레메) | 프랑스어 타이포그래피 규범상 영미식 직선 따옴표 `" "` 대신 프랑스식 인용부호 `« »`를 써야 함. |
| [FR-15](#fr-15) | 용어 표기 통일 | 이론은 `Chaînes forcées`, 도해는 `Chaînes forçantes` | `Chaînes forçantes` (통일) | Forcing Chains 기법 명칭이 이론 본문과 도해 제목에서 형용사형(`forcées`)과 현재분사형(`forçantes`)으로 갈려 일관성 결여. |
| [FR-16](#fr-16) | 커뮤니티 관례 | `Cross-Hatching (Élimination Ligne/Col)` | `Cross-Hatching (Balayage)` 병기 권고 | 프랑스 스도쿠 입문서에서 크로스해칭은 전통적으로 '훑기/쓸어내기'를 뜻하는 **balayage**로 널리 통용되므로 괄호 설명에 보강 권장. |

---

#### E. 3차 검토 — UI 화면, 모달, 인앱결제, 개인정보 약관 및 스토어 설명문 심층 검토

일반 UI 모달, 인앱결제 화면(`removeAds`), 개인정보 처리방침(`privacy`), 스토어 상세 설명문 텍스트를 프랑스 국립 국어원(아카데미 프랑세즈) 및 프랑스 개인정보보호위원회(CNIL) 표준 서식 기준으로 심층 점검했다.

| 항목 ID | 분류 | 현재 표현 | 권장 수정안 | 상세 근거 및 국어원 규범 |
|---|---|---|---|---|
| [FR-17](#fr-17) | 국어원 법률 문서 규범 | `L'achat « Supprimer les pubs »` (약관) | `L'achat « Supprimer les publicités »` | 공식 법적 고지(Politique de confidentialité)에서 '광고'를 속어/약칭인 **pubs**로 표기하는 것은 부적절함. 정식 단어인 **publicités**를 써야 함. |
| [FR-18](#fr-18) | 국어원 번역투 개선 | `les coups et leur moment` (약관/리플레이) | `les coups et leur chronologie` | 영어 "the moves and their timing"의 거친 직역. 프랑스어에서 "수와 그것들의 순간"은 매우 어색하며 **leur chronologie**(시간순서) 또는 **leur horodatage**(타임스탬프)가 자연스러움. |
| [FR-19](#fr-19) | 국어원 어휘 규범 | `e-mail`, `position` (약관 1조) | `adresse e-mail`, `données de localisation` | 프랑스 법률 및 아카데미 프랑세즈 규정상 위치 정보는 단순 *position*이 아닌 **données de localisation** 또는 **géolocalisation**으로 명시해야 정확함. |
| [FR-20](#fr-20) | UI 구어체 정제 | `développeurs indés` (광고제거 혜택3) | `développeurs indépendants` | 상용 인앱 결제 안내 화면에서 '독립 개발자'를 일상 구어 축약어인 **indés**로 표기함. 정식 단어인 **indépendants**가 정갈함. |
| [FR-21](#fr-21) | 스토어 설명문 문체 | `Prenez votre temps, réfléchissez...` | 호흡 및 마침표 정돈 | 스토어 설명문 마지막 문장이 다소 번역투로 직결되어 있어 프랑스 구글 플레이 스토어 모바일 앱 카피라이팅 스타일에 맞게 정돈 필요. |
| [FR-22](#fr-22) | 일일 미션 UI 일관성 | `[Lv.1 Initiation] 1 sudoku` vs `[Lv.2 Facile] Réussir 1 Sudoku` | 동사 유무 및 대소문자 패턴 통일 | Lv.1은 동사 없이 소문자(`1 sudoku`), Lv.2는 동사와 대문자(`Réussir 1 Sudoku`)로 작성되어 미션 카드 목록에서 일관성이 결여됨. |

---

#### F. 4차 검토 — 업적 40종, 1v1 리플레이 및 신규 킬러/서바이벌 종합 검토

최근 추가된 40종 업적 체계(`achievements.js`), 1v1 리플레이 교환 계약(`replay.js`), 킬러/서바이벌 모드 전체를 전수 크로스체크했다.

| 항목 ID | 분류 | 현재 표현 | 권장 수정안 | 상세 근거 및 언어적 분석 |
|---|---|---|---|---|
| [FR-23](#fr-23) | 미번역 영어 속어 | `High Five` (업적 win_5 제목) | `Top 5` 또는 `Cinq sur cinq` | 불어판 업적 목록에서 5승 업적 제목만 영문 속어 `High Five`가 그대로 노출됨. 프랑스 관용구 `Top 5`나 `Cinq sur cinq`로 현지화 권장. |
| [FR-24](#fr-24) | 국어원 대소문자 규범 | `mode Saisie Rapide (Chiffre d’abord)` | `mode Saisie rapide (chiffre d'abord)` | 프랑스어는 영어와 달리 단어마다 대문자를 쓰는 Title Case를 금지함. 괄호 안 부가설명과 수식 형용사는 소문자(Sentence case)로 쓰는 것이 원칙. |
| [FR-25](#fr-25) | 번역투 표현 | `Miracle de 7 jours` (업적 streak_7) | `Série de 7 jours` 또는 `Semaine parfaite` | 영어 "7-day miracle"의 어색한 직역. 연속 출석은 프랑스 게임계에서 **Série de 7 jours**나 **Semaine parfaite**(완벽한 한 주)로 칭하는 것이 자연스러움. |
| [FR-26](#fr-26) | 타이포그래피 일관성 | `replay.js` 내 곧은 아포스트로피(`\'`) 10여 개소 | 곡선 아포스트로피(`’`)로 치환 | 타 파일들이 곡선 아포스트로피(`’`)를 모범적으로 적용한 반면, 신규 작성된 `replay.js`에는 프로그래밍용 곧은 아포스트로피(`\'`)가 다수 잔존함. |
| [FR-27](#fr-27) | UI 레이블 직관성 | `sumPace: 'Par minute'` (리플레이 요약) | `Cadence (par min)` 또는 `Rythme` | 플레이 속도를 단순히 '분당(Par minute)'이라고만 표기하면 단위만 보이고 지표명이 불분명함. **Cadence**(속도/보폭) 또는 **Rythme** 병기 권장. |
| [FR-28](#fr-28) | 자연스러운 어순 | `5 secondes ou moins restantes au chrono` | `5 secondes ou moins au chrono` | 영어 "5 seconds or less remaining on the clock"를 불어로 옮기며 *restantes*가 어색하게 삽입됨. 간결하게 *au chrono*로 줄이는 것이 프랑스어다운 문장임. |

---

#### G. 1~4차 종합 누적 평가 및 개선 우선순위 매트릭스 (총 28개 항목)

4차례에 걸친 다각도 전수 검수를 통해 총 **28건의 언어적·타이포그래피적 개선 사항**을 체계적으로 도출했다.

| 등급 | 성격 및 기준 | 해당 항목 목록 | 조치 방향 |
|:---:|---|---|---|
| **P1** | **필수 조치 (문법 비문, 정책 위반, 스펙 불일치)** | **[FR-02]** 대명사 성 불일치 비문 (`pour la débloquer` ➔ `le`)<br>**[FR-08]** UI 규약 위반 별 마크 잔존 (모달 S등급, 스토어 설명)<br>**[FR-09 / FR-21]** 업적 수치 구형 방치 (30개 ➔ 40개 스펙 정합) | 즉시 코드 및 스토어 에셋 수정 필요 |
| **P2** | **커뮤니티 전문성 (스도쿠 용어, 게임 모드 통일)** | **[FR-01]** 아카데미 4단계 기법 오기 (`coloriage` ➔ `coloration`)<br>**[FR-03]** 서바이벌 모드 명칭 불일치 (`Limite de Temps` ➔ `Survie`)<br>**[FR-04]** 영문 차용어 오류 (`le puzzle` ➔ `la grille`)<br>**[FR-05]** 클리어 등급 번역투 (`C (Complété)` ➔ `C (Terminé)`)<br>**[FR-06]** 기법 설명 혼동 유발 (`Grille 3x3` ➔ `Motif 3×3`)<br>**[FR-11]** Y-Wing 부위 명칭 불일치 (`pinces` vs `ailes` 통일)<br>**[FR-12]** Claiming 직역투 정비 (`Paire revendiquée` ➔ `Alignement`)<br>**[FR-13]** BUG+1 수학 용어 정합 (`bivalente` ➔ `bivaluée`) | 다음 번역 업데이트 시 우선 반영 |
| **P3** | **국어원 규범 및 정서법 (타이포그래피, 구어체 정제)** | **[FR-07]** 이중 구두점 앞 줄바꿈 방지 공백 (`\u00A0` 적용)<br>**[FR-10]** 킬러/케이지 메시지 구어체 다듬기<br>**[FR-14]** 프랑스식 인용부호 길레메(`« »`) 적용<br>**[FR-15]** Forcing Chains 표기 통일 (`forçantes`)<br>**[FR-17 ~ FR-20]** 약관 및 상점 내 속어/직역투 정제 (`pubs` ➔ `publicités` 등)<br>**[FR-23 ~ FR-28]** 업적 대소문자 규범 및 리플레이 아포스트로피 정합 | 문구 품질 고도화 작업 시 일괄 반영 |

**결론 및 인계 사항:**
1차 개괄 검수에 이어 2차(아카데미 및 도해), 3차(UI·약관·스토어), 4차(업적·리플레이·신규 모드)까지 3회 추가 심층 검토를 완벽히 수행하고 모든 근거를 기록했다. 사용자의 지시에 따라 실제 코드 수정은 일절 진행하지 않았으며, 향후 번역 수정 작업 요청 시 본 매트릭스의 P1~P3 순서에 따라 정밀 반영할 수 있도록 준비를 마쳤다.
