# 변형 스도쿠 조사 — 대회·매니아·시장에서 쓰이는 것 전부

조사일 **2026-10-01** (사용자: *"지금 우리는 정통이고, 매니아나 대회 등에서 쓰는 건 또 다른게 많다는거지? 그거 전수 조사해서 자료 모아봐."*)
규칙 설명은 전부 직접 쓴 요약이다. 남의 문제·그림·규칙 문안은 옮기지 않았다. 출처는 맨 아래.

---

## 0. 한 줄 요약

- **우리 앱 = 정통(클래식) 하나.** 가로·세로·3×3 상자마다 1~9 한 번씩.
- 그 위에 규칙을 얹은 **변형이 수십~수백 가지**다. 세 층으로 나뉜다:
  - **대중 시장** — 킬러·사무라이(합체)·직소가 앱 하나씩 차릴 만큼 크다 (킬러 단독 앱 1,000만+ 설치).
  - **대회** — 세계스도쿠선수권(WSC)·WPF 그랑프리는 라운드마다 정통 몇 개 + 변형 수십 종을 섞는다. 2024 WSC 한 대회(13라운드)에 **51종**(중복 빼고)이 나왔다.
  - **매니아** — 유튜브 채널 Cracking the Cryptic, 독일 Logic Masters 등에서 선(라인)·점·바깥 단서를 섞은 "현대 변형" 이 계속 새로 생긴다.
- 규칙(아이디어)은 저작권 대상이 아니라 쓸 수 있다. 문제는 우리 생성기로 만들어야 한다(I-8 조사). **이름에는 상표가 걸린 것이 있다**(7절).

---

## 1. 전수 목록 — 우리 앱에 넣으려면 무엇이 필요한가로 묶음

표의 "필요한 것": **그림** = 판 위에 새 표시를 그려야 함 · **판정** = 규칙 검사 추가 · **생성** = 그 규칙으로 해답이 하나인 문제를 만들 수 있어야 함.
"난이도" 는 우리 코드에 넣는 수고(하·중·상). "어디서" 의 **WSC** = 2024 세계선수권, **GP** = 2024 WPF 그랑프리, **앱** = 단독 앱이 있음, **매니아** = 커뮤니티 참고서.

### A. 판 구조가 바뀌는 것 (영역·크기)

| 이름 | 규칙 요약 | 어디서 | 필요한 것 | 난이도 |
|---|---|---|---|---|
| 대각선 (X Sudoku, Diagonal) | 두 대각선에도 1~9 한 번씩 | GP · 앱 · 매니아 | 대각선 그림, 영역 하나 추가 | 하 |
| 반대각선 (Anti-Diagonal) | 대각선 위 숫자가 정해진 개수만 다르게 | GP | 대각선 그림, 판정 | 중 |
| 하이퍼 / 윈도쿠 (Hyper, Windoku) | 추가 3×3 창 4개에도 1~9 | WSC · 매니아 | 음영 영역 4개 | 하 |
| 직소 / 불규칙 (Jigsaw, Irregular, Nonomino) | 3×3 상자 대신 울퉁불퉁한 9칸 구역 | WSC · GP · 앱 | 굵은 경계선을 구역마다, **구역 생성** | 중 |
| 분리 그룹 (Disjoint Groups) | 상자 속 같은 위치끼리도 1~9 | WSC · 매니아 | 판정만 | 하 |
| 추가 영역 (Extra Region) | 지정된 구역 하나 더 1~9 | WSC | 음영 영역 | 하 |
| 크기 변형 (4×4, 6×6, 12×12, 16×16, 25×25) | 숫자 범위와 상자 모양이 다름 | 위키 · 앱 · 대회 | **판 크기 일반화** (지금 코드는 9×9 고정) | 상 |
| 합체 (Samurai/Gattai, Butterfly, Flower, Twin) | 여러 판이 겹쳐 칸을 공유 | 앱(1M+) · 위키 | 여러 판 배치·스크롤, 공유 칸 판정 | 상 |
| 카오스 컨스트럭션 (Chaos Construction) | 구역 모양을 푸는 사람이 찾아냄 | 매니아(CTC 앱) | 구역 그리기 입력 | 상 |
| 3D / 큐브 / 피라미드 / 브릭월 / 확장(Expanded) | 판 모양 자체가 다름 | WSC | 새 판 레이아웃 | 상 |
| 디컨스트럭션 (Deconstruction) | 큰 판 안에 상자 9개를 배치 | 매니아 | 새 판 레이아웃 | 상 |

### B. 칸 하나에 붙는 표시

| 이름 | 규칙 요약 | 어디서 | 필요한 것 | 난이도 |
|---|---|---|---|---|
| 짝·홀 (Even/Odd, Odd/Even, Parity) | 동그라미=홀수, 네모=짝수 | GP · 매니아 | 칸 배경 표시, 판정 | 하 |
| 콰드러플 (Quadruple) | 네 칸 교차점의 숫자들이 그 네 칸 안에 들어감 | GP · 매니아 | 교차점 원 + 숫자 | 중 |
| 쿼드 합 (Quad Sums) | 교차점 숫자 = 네 칸 합(또는 일부) | GP | 교차점 원 | 중 |
| 클론 (Clone) | 같은 음영 모양끼리 같은 숫자 같은 배치 | WSC · GP | 음영 그룹 | 중 |
| 펜슬마크 (Pencilmark) | 주어진 후보만 그 칸에 올 수 있음 | WSC · 매니아 | 칸 안 작은 숫자 표시 | 하 |
| 요새 (Fortress) | 회색 칸 숫자가 이웃 흰 칸보다 큼 | 매니아 | 음영, 판정 | 하 |
| 카운팅 서클 (Counting Circles) | 동그라미 숫자 = 그 숫자가 들어간 동그라미 개수 | 매니아 | 원 표시, 판정 | 중 |
| 배수 (Multiples) · 시계판 (Clock Faces) · 스캐터드 (Scattered) 등 | 대회마다 새로 붙는 칸·교차점 규칙 | WSC · GP | 종류마다 다름 | 중~상 |

### C. 이웃한 두 칸 사이의 표시 (점·기호)

| 이름 | 규칙 요약 | 어디서 | 필요한 것 | 난이도 |
|---|---|---|---|---|
| 크로프키 (Kropki) | 흰 점=1 차이, 검은 점=두 배 | WSC · GP · 매니아 | 경계 점 그림, 판정 | 중 |
| XV | X=합 10, V=합 5 (표시 없는 쌍은 아님 — "전부 표시" 형) | GP · WSC(Local XV) · 매니아 | 경계 글자 | 중 |
| 부등호 (Greater Than, 후토시키형) | 경계 기호 방향이 더 큰 쪽 | 위키 · 매니아 | 경계 기호 | 중 |
| 연속 (Consecutive) / 비연속 (Nonconsecutive) | 표시된 경계=연속 / 어디서도 이웃은 연속 금지 | WSC · GP · 매니아 | 경계 표시 또는 전역 판정 | 하~중 |
| 비율 (Ratio) · XY 차이 (XY-Differences) · 1·2 차이 쌍 | 경계 단서의 다른 계산 | WSC · GP | 경계 표시 | 중 |

### D. 칸 묶음 (케이지)

| 이름 | 규칙 요약 | 어디서 | 필요한 것 | 난이도 |
|---|---|---|---|---|
| **킬러 (Killer)** | 점선 묶음의 합이 적힌 수, 묶음 안 중복 없음 | **앱 10M+** · WSC · GP · 매니아 | 점선 묶음 + 합 그리기, 판정, **묶음 생성** | 중 |
| 킬러 변형 (Greater-Than Killer, Upper Right Heavy Killer 등) | 킬러에 비교·위치 조건을 더함 | WSC · GP | 킬러 + 추가 판정 | 중~상 |
| 매스도쿠 / 칼큘도쿠 (Mathdoku, Calcudoku) | 묶음마다 사칙연산 결과 | WSC | 연산 기호, 판정 | 중 |

### E. 선 (라인) — 매니아 "현대 변형" 의 중심

| 이름 | 규칙 요약 | 어디서 | 필요한 것 | 난이도 |
|---|---|---|---|---|
| 온도계 (Thermo) | 둥근 끝에서 멀어질수록 커짐 | WSC · **GP 최다 등장** · 매니아 · CTC 앱 | 선 그리기, 판정 | 중 |
| 화살표 (Arrow) | 화살 몸통 숫자 합 = 동그라미 숫자 | WSC · GP · 매니아 | 선 + 원 | 중 |
| 팰린드롬 (Palindrome) | 선을 양쪽에서 읽어도 같음 | GP · 매니아 | 선 | 중 |
| 렌반 (Renban) | 선 위 숫자는 연속수 묶음(순서 자유) | WSC · GP · 매니아 | 선 | 중 |
| 나브너 (Nabner, 반렌반) | 선 위에 연속수·중복 없음 | 매니아 | 선 | 중 |
| 독일 속삭임 (German Whispers) | 이웃 차이 5 이상 | 매니아 | 선 | 중 |
| 네덜란드 속삭임 (Dutch Whispers) | 이웃 차이 4 이상 | 매니아 | 선 | 중 |
| 사이 선 (Between) | 선 위 숫자가 양 끝 원 숫자 사이 | GP · 매니아 | 선 + 원 | 중 |
| 영역 합 선 (Region Sum Lines) | 상자마다 잘린 선 조각의 합이 같음 | 매니아 | 선 | 중 |
| 엔트로픽 / 모듈러 / 지퍼 / 10선 / 패리티 선 / 교대 패리티 / 선 위 연속 | 선 위 숫자들의 다른 관계 | WSC · 매니아 | 선 | 중 |
| 화살표 or 온도계, 표시 없는 온도계 (Unmarked Thermo) 등 | 대회용 조합·변형 | WSC · GP | 선 | 중~상 |

### F. 판 바깥의 단서

| 이름 | 규칙 요약 | 어디서 | 필요한 것 | 난이도 |
|---|---|---|---|---|
| 샌드위치 (Sandwich, Even Sandwich) | 행·열의 1과 9 사이 숫자 합 | GP · 매니아 · CTC 앱 | 판 바깥 여백·숫자 | 중 |
| X-Sums (Positional X-Sums) | 끝에서 첫 숫자 X개만큼의 합 | WSC · GP · 매니아 | 바깥 숫자 | 중 |
| 리틀 킬러 (Little Killer) | 바깥 화살표 방향 대각선의 합(중복 허용) | WSC · 매니아 | 바깥 화살표 | 중 |
| 스카이스크래퍼 (Skyscrapers) | 바깥에서 보이는 "빌딩" 수 | GP · 매니아 | 바깥 숫자 | 중 |
| 아웃사이드 / 아웃사이드 시퀀스 / 1과 9 사이 / 어센딩 스타터 등 | 가장자리 몇 칸에 관한 바깥 단서 | WSC · GP | 바깥 숫자 | 중 |

### G. 표시 없는 전역 규칙

| 이름 | 규칙 요약 | 어디서 | 필요한 것 | 난이도 |
|---|---|---|---|---|
| 안티나이트 (Anti-Knight) | 나이트 한 수 거리끼리 같은 숫자 금지 | WSC · GP · 매니아 | 판정만 | 하 |
| 안티킹 (Anti-King) / 노터치 (No Touch) | 대각 이웃끼리 같은 숫자 금지 | GP · 매니아 | 판정만 | 하 |
| 셋 연속 금지 (No Three in a Row) 등 | 대회용 전역 규칙 | WSC | 판정만 | 하 |

### H. 다른 퍼즐과의 결합·메타 규칙 (매니아 최상급)

루프(Loop) · 음양(Yin-Yang) · 케이브(Cave) · 누리카베(Nurikabe) · 스타 배틀 결합 · 시티워크(Citywalk) · 수도커브(Sudo-kurve) ·
인덱싱(Indexing, 숫자가 좌표가 됨) · 거짓말쟁이 단서(Liar) · 안개(Fog, 맞힌 곳만 드러남) · 슈뢰딩거 칸(한 칸에 두 숫자) ·
모디파이어 칸 · 크납 다네벤(Knapp Daneben, 단서가 1씩 어긋남) · 모호(Ambiguous, 어떤 규칙인지 안 알려줌).
**모두 상** — 판 위에 칠하기·선 긋기 같은 두 번째 입력 방식이 필요하거나, 규칙 자체를 푸는 사람이 알아내야 한다.

### I. 스도쿠의 친척 (따로 된 퍼즐)

카쿠로(Kakuro) · 칼큘도쿠/켄켄형(Calcudoku) · 후토시키(Futoshiki) · 스구루/텍토닉(Suguru, Tectonic) · 히다토(Hidato) — 스도쿠 앱들이 함께 담기도 한다.
이름 주의는 7절.

---

## 2. 대회에서 실제로 나온 종류

### 세계스도쿠선수권 2024 (13라운드, 종류 이름만)
1 Parity Lines · Pencilmark · Consecutive On Line · Clone · Abacus
2 Classic
3 Consecutive · Antiknight · Argyle · 3D Sudoku · Extra Region · Renban
4 Pointing Arrow · Superconsecutive Extra Region · No Touch Windoku · 3D Consecutive · Star Battle Passage
5 Killer · Upper Right Heavy Killer · Positional X-Sums · Multiples · Arrow · Ratio · Little Killer · 24-Trio Sudoku
6 Irregular
7 Outside Sequence · Greater-or-Sum · Unmarked Thermo · Arrow-or-Thermo · Yin-Yang · Local XV
8 Between 1 and 9 · Arrow · Mathdoku · Irregular Dots
9 Sudo-kurve
10 Classic
11 Pyramid · Numbered Rooms · Cloned Inequality · Disjoint Groups · Expanded · Rossini · Even Sandwich · Brick Wall · Incomplete Quadruple · Kropki · Citywalk · Outside
12 Killer · Irregular
13 Nonconsecutive · No Three in a Row · Windoku · Antiknight

### WPF 스도쿠 그랑프리 2024 (8라운드, 공식 안내서에서 종류 이름만 추출)
| 개최 | 나온 종류 |
|---|---|
| 네덜란드 | Classic · Odd/Even · Diagonal · X-Sums · Ascending Starters |
| (미상) | Classic · Quadruple · Odd/Even · XV · X-Sums · Thermo · XY-Differences |
| 체코 | Classic · Diagonal · Quadro · Renban · Scattered · Greater Than Killer · Clock Faces |
| 중국 | Classic · Diagonal Anti-Diagonal · Palindrome · Skyscrapers · One or Two Difference Pairs 외 |
| 슬로바키아 | Classic · Kropki · Arrow Thermo · Between |
| (미상) | Classic · Kropki Pairs · Thermo · Irregular Anti-Knight · Clone or Renban |
| 독일 | Classic · No Touch · Consecutive Pairs · Thermo · Arrow · Even Sandwich |
| 인도 | Classic · Irregular · Quad Sums · Arrow |

**읽을 것:** 라운드마다 정통이 있고, 나머지는 매번 다른 변형. 여러 라운드에 반복된 것은 **온도계 · 화살표 · 대각선 · 짝홀 · X-Sums · 크로프키 · 직소**.
대회는 "늘 새 규칙" 이 특징이라, 특정 변형을 고정해서 넣는 앱 전략과는 결이 다르다.

---

## 3. 시장 신호 (구글 플레이, 조사 시점 숫자)

| 앱 | 변형 | 설치 | 평점 |
|---|---|---|---|
| Killer Sudoku by Sudoku.com (Easybrain) | 킬러 | **10,000,000+** | 4.59~4.6 |
| MultiSudoku: Samurai Sudoku (Conceptis) | 합체(2~8판) | 1,000,000+ | 4.7 |
| SumSudoku: Killer Sudoku (Conceptis) | 킬러 | 100,000+ | 4.4 |
| Cracking the Cryptic 앱들 (Classic · Sandwich · Thermo · Chaos · Chess 등, Studio Goya) | 매니아 변형 | 유료 앱 | — |

**읽을 것:** 대중 시장에서 **킬러가 압도적**이고(정통 스도쿠 1위 회사가 별도 앱으로 낼 만큼), 그다음이 합체(사무라이)·직소.
매니아 변형은 유료·유튜브 팬층 시장이다.

---

## 4. 우리 앱에 넣는다면

**공통으로 필요한 것 — "규칙 플러그인" 구조.** 변형 하나 = ① 판 위에 그릴 것 ② 규칙 판정 ③ 생성기·풀이기에 들어갈 제약.
지금 엔진(`SudokuEngine.js`)은 판정(`isValidPlacement`)·풀이(`solveSudoku`)·해답 세기(`countSolutions`)가 정통 규칙에 고정돼 있다.
제약을 함수로 받게 바꾸면 A(영역 추가)·B·C·G 의 쉬운 것들은 같은 틀로 들어온다.

**가장 어려운 것은 그림이 아니라 생성.** 변형 문제는 "해답이 딱 하나" 이면서 "재미있어야" 한다. 단서가 많으면 쉽고 적으면 풀이기가 느려진다.
아카데미 기법 판정기(I-9)로 "어떤 기법이 필요한지" 재는 것이 품질 기준이 될 수 있다.

**첫 후보 추천: 킬러.** 시장이 증명됐고(1,000만+), 규칙이 한 줄이고, 그림(점선 묶음+합)이 한 종류다.
그다음은 비용이 거의 없는 **대각선(X) · 하이퍼 · 안티나이트/안티킹 · 짝홀** — 판정 몇 줄과 간단한 표시로 "변형 모드" 를 여러 개 낼 수 있다.
선·바깥 단서·결합형은 매니아용이라, 매니아 시장을 노릴 때 다시 본다.

---

## 5. 권리 · 상표 주의

- **규칙은 아이디어라 자유.** 문제(숫자 배치)는 우리 생성기로만 — 대회·CTC·책의 문제를 옮기지 않는다(I-8).
- **이름 상표**: 니콜리는 일본에서 「数独」 「カックロ」 「スリザーリンク」 「ナンバーリンク」 「ましゅ」 등을 등록상표로 둔다 — 일본에선 다른 이름을 쓴다
  (지금 앱이 「ナンプレ」 를 쓰는 것과 같은 이유). **켄켄(KenKen)** 도 상표로 알려져 있어 일반명 「칼큘도쿠/매스도쿠」 를 쓴다.
  나머지 이름(킬러, 사무라이 등)은 출시 전에 나라별로 확인한다 — 이 조사에서 확인하지 않았다.

---

## 출처

- 세계스도쿠선수권 2024 종류: <https://payhip.com/sudoku/blog/competitions/wsc2024>
- WPF 스도쿠 그랑프리 2024 라운드 안내서(공식 PDF, 종류 이름만 추출): <https://gp.worldpuzzle.org/sites/default/files/Puzzles/2024/2024_SudokuRound1_IB.pdf> ~ `Round8_IB.pdf`
- 매니아 변형 참고서(규칙 목록): <https://eev.ee/fyi/variant-sudoku/>
- 독일 Logic Masters 입문 가이드: <https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?chlang=en&id=000GOJ>
- 위키백과 Sudoku(크기·합체 변형): <https://en.wikipedia.org/wiki/Sudoku>
- Cracking the Cryptic 앱: <https://en.wikipedia.org/wiki/Cracking_the_Cryptic> · <https://play.google.com/store/apps/details?id=com.StudioGoya.SandwichSudoku>
- 킬러·사무라이 앱: <https://play.google.com/store/apps/details?id=com.easybrain.killer.sudoku.free> · <https://play.google.com/store/apps/details?id=com.conceptispuzzles.multisudoku> · 우리 경쟁 앱 조사 `docs/research/reviews/apps.md`
- 니콜리 상표: <https://www.nikoli.co.jp/ja/copyright/>
