# 킬러 기법 조사 — 아카데미 킬러 강의(KP-12)의 재료

2026-10-15 · Claude · 사용자: *"일단 공식 커뮤니티에서 전략 정보를 싹 가져와야 하지 않겠어? 클래식 처럼. 일단 그런 정보부터 모으자."*

**가져오는 것은 지식뿐이다.** 기법이 무엇이고 왜 성립하는지는 누구의 것도 아니지만, 그 설명 문장·예제 퍼즐·그림은 그 사이트의 것이다.
정통 아카데미가 같은 길을 갔다(Diary ⑬): 공개 예제 36개를 옮겼다가 전부 걷어내고, **탐지기를 정의에서 직접 짜고 우리 생성기의 판에서 예제를 골랐다.**
킬러도 그렇게 한다 — 이 문서의 출처는 우리가 정의를 확인한 기록이고, 앱에는 출처의 문장·예제·그림이 하나도 들어가지 않는다.

---

## 1. 읽은 곳

킬러에는 정통의 HoDoKu 같은 「공식」 이 없다. 아래가 영어권 킬러 풀이 커뮤니티가 실제로 쓰는 용어와 기법의 원천이다.

| 출처 | 누가 · 언제 | 무엇을 얻었나 |
|---|---|---|
| [SudokuWiki 킬러 풀이기](https://www.sudokuwiki.org/killersudoku.htm) 와 기법 쪽들 | Andrew Stuart — 정통 아카데미 때도 정의를 맞춰 본 곳(Diary ⑫) | **킬러 기법 9개와 쉬운 순서**(풀이기의 기법 목록 순서). 기법마다 쪽이 있다 — [Innies and Outies](https://www.sudokuwiki.org/Innies_and_Outies) · [Killer Combinations](https://www.sudokuwiki.org/Killer_Combinations) · [Cage Unit Overlap](https://www.sudokuwiki.org/Cage_Unit_Overlap) · [Cage Splitting](https://www.sudokuwiki.org/Cage_Splitting) · [Cage Comparison](https://www.sudokuwiki.org/Cage_Comparison) |
| [SudoCue Killer Solving Guide](https://www.sudocue.net/killerguide.php) · [Killer Solving Tips](https://www.blog.sudocue.net/?page_id=39) | Ruud (SudoCue), 2006-06-22 마지막 갱신, 「계속」 으로 끝남 | **사람이 배우는 순서**: 규칙 → 연필 표시 → 정통 기법 → 45 덧셈 → 들어감·나감 → 들어감·나감 쌍 → 최소·최대 묶음 → 거의 최소·최대 → 쌍 좁혀 가기 → 고급 45 → 묶음 쪼개기 |
| [Sudopedia 킬러 분류](https://sudopedia.sudocue.net/index.php?title=Category:Killer_Sudoku) (14쪽) | 커뮤니티 위키(sudocue.net 거울) | 정의를 맞춰 본 곳: [45 rule](https://sudopedia.sudocue.net/index.php/45_rule) · [Cage combinations](https://sudopedia.sudocue.net/index.php?title=Cage_combinations) · [Killer Pair](https://sudopedia.sudocue.net/index.php?title=Killer_Pair) · [Killer Subset](https://sudopedia.sudocue.net/index.php?title=Killer_Subset) · [Common Peer Elimination](https://sudopedia.sudocue.net/index.php?title=Common_Peer_Elimination) · [Innie-outie difference](https://sudopedia.sudocue.net/index.php?title=Innie-outie_difference) · [Killer Sudoku Lingo](https://sudopedia.sudocue.net/index.php?title=Killer_Sudoku_Lingo)(용어 21개) |
| [Wikipedia — Killer sudoku](https://en.wikipedia.org/wiki/Killer_sudoku) | | 기본 셋(조합 하나뿐인 묶음 · 45 규칙 · 90/135 로 넓히기)과 역사: 니시오 테츠야, 일본 이름 サムナンプレ(sum number place), 2005 년 The Times 로 해외에 |
| [sudoku.com 킬러](https://sudoku.com/killer) | Easybrain — 경쟁 앱(1,000만+) | **대중 앱이 가르치는 것은 셋뿐**: 45 규칙(들어감 한 칸, 그 묶음의 나머지 칸), 작은 합의 조합(3 = 1+2, 4 = 1+3), 일부 찬 묶음의 마지막 칸. 「쉬움」 은 마지막 칸, 「어려움」 은 조합. 일본 앱 이름은 「キラーナンプレ」(App Store) — 우리 일본어와 같은 계열 |
| **2차 조사 (같은 날, 사용자 "좀 더 기법/전략 조사 더 해")** | | |
| [SudoCue 포럼](https://www.sudocue.net/forum/) — 「Weekly Assassins」(주간 킬러 156 주제) · 「Solving Techniques & Tips」 | 킬러를 매주 같이 풀던 커뮤니티, 2007~2008 | 고급 기법이 실제로 만들어진 곳: [Assassin 풀이법 토론](https://www.sudocue.net/forum/viewtopic.php?f=8&t=783)(2007-08~2008-01 — 묶음 짝짓기·잠긴 묶음·숨은 제약 묶음·킬러 XY-Wing), [킬러용 AIC 사슬](https://www.sudocue.net/forum/viewtopic.php?f=8&t=694)(Jean-Christophe 2007-05 — 묶음을 사슬의 고리로), [Chevron Killer](https://www.sudocue.net/forum/viewtopic.php?f=18&t=544)(2007-01 — 「킬러 짝 / 숨은 킬러 짝」 이름 논쟁) |
| [SudokuWiki 풀이기 전체 목록](https://www.sudokuwiki.org/killersudoku.htm) | | 37개 기법 중 킬러 것이 정통 기법 사이에 끼어 있는 순서(§1b) |
| [Sudopedia — Nate Dorward II](https://sudopedia.sudocue.net/index.php/Nate_Dorward_II) | 킬러 출제·풀이자의 블로그 거울, 2021-10 마지막 편집 | 더하기빼기 45 · 묶음째 정통 기법 · 범위 자르기 · 빼기 조합(Udosuk) · Overlap(Godart, 설명 없음) |
| [dailykillersudoku.com 전략](https://dailykillersudoku.com/strategies) | 매일 킬러 사이트 | 가르치는 순서 4단계(§1b) |
| [Puzzle Genius — Killer Sudoku from Scratch](https://puzzlegenius.org/killer-sudoku-from-scratch/) | 퍼즐 출판사(Shelfless) | 가르치는 순서 5단계(§1b) |
| [Artisanal Sudoku — The Basics of Killer Sudoku](https://artisanalsudoku.substack.com/p/the-basics-of-killer-sudoku) | James Sinclair, 2022-05-30 | **두 칸 묶음의 산수**(최대·최소 숫자, 절반 금지, 홀짝, 9·10 의 작은수+큰수) — 직접 계산으로 전부 참(§2 K14) |

**못 본 곳.** forum.enjoysudoku.com 은 접속이 거부됐다(ECONNREFUSED). 독일 Logic Masters 는 퍼즐 쪽만 나오고 기법 문서는 못 찾았다.
SudokuWiki 의 「Rule of Parity」 링크는 KenKen 쪽으로 가고 킬러 예제가 없다 — **집 단위** 홀짝 규칙의 킬러판은 미확인(두 칸 홀짝은 K14 로 확인).
**버린 것.** `*.kinsta.page` · `*.shuduku.it.com` 같은 검색 결과는 같은 글을 수십 주소에 복사한 광고용 사이트라 출처로 쓰지 않았다. 일본어·독일어·프랑스어 검색은 그 나라 자료가 아니라 영어 자료의 번역 요약만 나왔다 — 13개 언어 용어 조사는 번역 단계에서 따로 한다.

**검산.** SudokuWiki 의 「조합이 하나뿐인 합」 표를 1~9 의 모든 부분집합(511개)으로 다시 셌다 — 같다(§3). Sinclair 의 두 칸 규칙도 합 3~17 전부로 셌다 — 같다.

### 1b. 다른 곳은 어떤 순서로 가르치나

```
sudoku.com (경쟁 앱)     마지막 칸 → 작은 합 조합 → 45 한 칸
dailykillersudoku        조합 하나뿐 → 상자에 이미 있는 숫자로 조합 버리기 → 그 숫자를 열에서 지우기 → 45
Puzzle Genius            45 → 45 의 배수(90·135) → 조합 하나뿐 → 꼭 들어가는 숫자 → 이미 놓인 숫자로 좁히기
Artisanal Sudoku         끝 합(조합 하나뿐) → 45 → 묶음 안 중복 금지 → 묶음끼리 → 두 칸 산수(최대·최소·절반·홀짝)
SudoCue 가이드           45 한 칸 → 들어감·나감 쌍 → 최소·최대 묶음 → 거의 최소·최대 → 쌍 좁히기 → 고급 45 → 쪼개기
SudokuWiki 풀이기 (37)   싱글 → 짝 → 45 한 칸(3) → 쉬운 조합(4) → 포인팅 → 박스/줄 → 꼭 품는 숫자(7) → 세짝 →
                         X-Wing … 쪼개기(14) → 45 여러 칸(15) → 겹침(16) → 어려운 조합(17) → 홀짝(18) → 견주기(19) → …
```

**모두가 첫머리에 두는 것은 「조합이 하나뿐인 묶음」 과 「45 한 칸」 둘이다.** 그다음이 「꼭 들어가는 숫자」 와 「45 의 배수」. 쪼개기·차이는 어느 곳에서나 뒤쪽.
SudokuWiki 는 킬러 기법을 정통 기법 사이에 끼워 둔다 — 45 한 칸이 포인팅 페어보다 쉽고, 쪼개기는 X-Wing 뒤다.

---

## 2. 기법 — 쉬운 것부터

「SW 순서」 는 SudokuWiki 풀이기의 기법 번호(정통 기법과 섞인 순서, 낮을수록 쉬움). 이름은 영어 기준 — 13개 언어 이름은 번역 때 그 나라 스도쿠 자료에서 정한다(기억: 영어가 기준어).

| # | 기법 (영어 이름 · 다른 이름) | 조건 → 결론 | 출처 | SW 순서 |
|---|---|---|---|---|
| K1 | **묶음의 마지막 칸** (cage remainder) | 묶음에서 한 칸만 비었으면 그 칸 = 합 − 나머지 | sudoku.com 「쉬움」 | — (자명) |
| K2 | **조합이 하나뿐인 묶음** (unique combination · minimum/maximum cage) | 그 칸 수·합을 만드는 숫자 묶음이 하나뿐이면, 그 숫자 말고는 다 지운다. 2칸 17 = {8,9} | SW · SudoCue 8 · Sudopedia · Wiki · sudoku.com | 4 |
| K3 | **45 규칙 — 한 칸** (single innie / outie · 들어감·나감) | 줄·열·상자(또는 붙은 여러 개)가 묶음들로 거의 덮이고 **한 칸**만 남거나 삐져나가면, 그 칸 = 45(×집 수)와 묶음 합의 차 | SW · SudoCue 6 · Sudopedia · Wiki · sudoku.com | 3 |
| K4 | **묶음이 꼭 품는 숫자** (captured candidates · almost minimum/maximum cage) | 묶음의 가능한 조합 **모두**에 들어 있는 숫자는 그 묶음 안에 반드시 있다 → 묶음이 통째로 들어 있는 줄·열·상자의 다른 칸에서 지운다. 3칸 8 = {1,2,5}·{1,3,4} → 1 | SW · SudoCue 9 | 7 |
| K5 | **45 규칙 — 여러 칸** (multi-cell innies/outies · hidden cage · 90/135 rule) | 남거나 삐져나간 칸이 둘 이상이면 그 칸들의 **합**이 정해진다 → 보이지 않는 묶음(서로 다른 숫자, 합 고정)으로 다룬다. 두 집 = 90, 세 집 = 135 | SW · Sudopedia 45 rule · Wiki | 15 |
| K6 | **들어감·나감 차이** (innie-outie difference) | 들어감 한 칸과 나감 한 칸이 같이 있으면 값은 몰라도 **차**가 정해진다(들어감 − 나감 = k) → 그 차를 못 만드는 후보를 지운다 | SW · Sudopedia · SudoCue 7 | 15 안 |
| K7 | **묶음 쪼개기** (cage splitting) | 묶음이 집 경계를 걸치면, 안쪽 부분의 합 = 집의 합 − 안에 통째로 든 묶음들 → 바깥 부분 = 묶음 합 − 안쪽. 이미 정해진 칸·잠긴 짝도 합이 아는 덩어리라 경계로 쓸 수 있다 | SW · SudoCue 16 · Sudopedia | 14 |
| K8 | **묶음과 집이 겹침** (cage/unit overlap) | 어떤 숫자가 그 집에서 이 묶음 안에만 놓일 수 있으면 → 그 숫자 없는 조합은 버린다(1형). 남은 조합이 모두 품는 숫자가 묶음 안 한 줄에만 있으면 → 그 줄의 다른 칸에서 지운다(2형). 칸 수 = 후보 수인 묶음은 잠긴 짝처럼 쓴다(3형). 두 후보 칸이 묶음 전체를 보면 그 두 숫자로 된 조합은 버린다 | SW | 16 |
| K9 | **킬러 짝·세짝** (killer pair / killer subset — naked·hidden) | 묶음 합 때문에 두(세) 숫자 중 하나가 반드시 들어가는 칸 무리가 보통 짝과 맞물리면 → 그 숫자를 집의 다른 칸에서 지운다. 숨은 꼴: 두 숫자가 집에서 두 묶음에만 갈 수 있으면 각 묶음이 하나씩 | Sudopedia | (SW 에 이름 없음) |
| K10 | **모두를 보는 칸** (common peer elimination) | 묶음이 숫자 D 를 꼭 품으면(K4), 그 묶음의 D 자리 **전부를 보는** 바깥 칸에선 D 를 지운다 | Sudopedia | — |
| K11 | **조합 여럿인 묶음 좁히기** (hard combinations) | 조합이 여럿인 묶음에서 이미 지워진 후보로 조합을 버려 가며 남은 숫자의 합집합 밖을 지운다 · 칸 하나의 최솟값·최댓값으로 범위를 자른다 | SW · Sudopedia · SudoCue 12 | 17 |
| K12 | **묶음끼리 견주기** (cage compare) | 한 묶음의 어떤 조합을 고르면 서로 보는 다른 묶음에 남는 조합이 없어지면 → 그 조합은 틀렸다 | SW 「Tough」 | 19 |
| K13 | 홀짝 규칙 — 집 단위 (rule of parity) | 묶음 조합의 합이 모두 홀(짝)이면 … — **킬러판 정의 미확인**. 두 칸 홀짝은 K14 | SW(KenKen 쪽만) | 18 |
| K14 | **두 칸 묶음의 산수** (two-cell cage arithmetic) | 합 N 인 두 칸: 큰 숫자는 최대 min(9, N−1), 작은 숫자는 최소 max(1, N−9) · N 이 짝수면 N/2 는 못 들어감(같은 숫자 둘) · N 이 홀수면 홀 하나 짝 하나, 짝수면 둘이 같은 홀짝 · 9 = 1~4 하나 + 5~8 하나, 10 = 1~4 하나 + 6~9 하나 | Artisanal Sudoku (합 3~17 전부 직접 셈 — 참) | — |
| K15 | **빼기 조합** (subtraction combo) | 집의 후보 합에서 묶음 합을 빼면, 묶음 밖에 남는 값이 정해진다 | Nate Dorward(Udosuk 의 것) · Sudopedia Lingo | — |
| K16 | **범위 자르기** (range restriction · min/max) | 두 부분의 합이 정해져 있으면 한쪽의 최솟값·최댓값으로 다른 쪽 범위를 자른다. 묶음 일부의 합을 범위로 묶는 「떨어진 쪼개기」(disjoined cage splitting)도 같은 꼴 | Nate Dorward(「마지막 수단」) · Sudopedia 조합 쪽 · Lingo | — |
| K17 | **묶음째 정통 기법** (killer X-Wing 등) | 두 칸 묶음 하나를 「숫자 하나가 꼭 있는 칸 묶음」 으로 보고 X-Wing·사슬을 짠다. 묶음이 X 를 꼭 품고 X 자리가 두 칸뿐이면 강한 고리, 같은 묶음의 두 칸은 약한 고리 | Nate Dorward · SudoCue 포럼(Jean-Christophe 2007-05 — JSudoku 에 구현) | — |
| K18 | **묶음 짝짓기 · 잠긴 묶음** (cage pairing · locked cages) | 집에서 X 가 묶음 A 나 B 에만 갈 수 있고, A 에 X 가 오면 Y 도 A 에 와야 하면 → B 는 X 없이 Y 를 못 가진다. 두 묶음이 함께 숫자를 잠그는 꼴 | SudoCue 포럼(Ruud 2008-01, 이름 없이 · 「Locked Cages」 는 Jean-Christophe) | — |
| K19 | 유일해로 지우기 (uniqueness in killer) | 정통의 Unique Rectangle 은 네 칸의 두 숫자를 바꿔도 판이 성립해야 하는데, 킬러에선 바꾸면 묶음 합이 바뀌는 경우가 많다 — 네 모서리가 묶음마다 짝수로 나뉠 때만 성립할 것. **출처 없음 · 우리 추론 · 미검증** | SudoCue 가이드가 「정통 기법」 목록에 이름만 | — |
| K20 | Overlap (Godart) | 「특별한 성질의 퍼즐에서만 되는 45 의 변형」 — **설명 없음, 미확인** | Nate Dorward(Godart 사이트로 넘김) | — |

**이름이 안 정해진 것.** 킬러 짝의 「드러난 / 숨은」 은 커뮤니티에서도 다퉜다(SudoCue 포럼 2007-01). 그때 나온 구분법: **집합 밖에서 지우면 드러난(naked), 집합 칸 안에서 지우면 숨은(hidden).** Sudopedia 도 「이 이름이 잘 안 맞는다」 고 적는다.

정통 기법(싱글·잠긴 후보·짝·X-Wing …)은 킬러에서도 그대로 쓴다(SudoCue 5·14). 정통 아카데미 1~5단계가 이미 가르친다.

---

## 3. 조합이 하나뿐인 합 (K2 의 표 — 직접 셈)

1~9 의 부분집합 511개를 칸 수·합으로 나눠 셌다. SudokuWiki 표와 같다.

```
2칸  합 3~17   3={1,2}  4={1,3}  16={7,9}  17={8,9}
3칸  합 6~24   6={1,2,3}  7={1,2,4}  23={6,8,9}  24={7,8,9}
4칸  합 10~30  10  11  29  30
5칸  합 15~35  15  16  34  35
6칸  합 21~39  21  22  38  39
7칸  합 28~42  28  29  41  42
8칸  합 36~44  전부(빠진 숫자 하나 = 45 − 합)
9칸  합 45     전부
```

모든 칸 수에서 **가장 작은 둘과 가장 큰 둘**이다(8칸은 빠진 숫자 하나로 정해져 전부). 우리 풀이기(`killerSolver.js` 의 `SETS`)가 같은 표를 코드로 만든다.

---

## 4. 우리 쪽에 이미 있는 것

- **풀이기**(`src/engine/killer/killerSolver.js`)가 사람처럼 좁힌 뒤 추측한다: 조합(K2·K11)과 45 규칙(`innies` — 집에서 통째로 든 묶음을 빼고 남은 칸들을 합이 아는 묶음 하나로, K3·K5). 나머지(K4·K6~K12)는 없다.
- **생성기**(`killerGenerator.js`)는 시드로 판을 재현한다 — 연습 예제를 여기서 고를 수 있다(정통의 `lab-N` 시드처럼).
- **어느 레벨 판이 어느 기법을 요구하는지는 모른다.** 탐지기를 만들면 같이 나온다(KP-13 「기법으로 난이도 나누기」 와 같은 판정기).
- 연습판은 지금 묶음을 못 그린다(`PracticeBoardRenderer` — row·box3x3·grid9x9 등). 게임의 `KillerCage.jsx` 를 쓴다.

---

## 5. 강의 후보 — 사용자가 고를 것

BACKLOG KP-12 에 적어 둔 것(「묶음 합 조합표 · 45 규칙(들어감·나감) · 묶음 쪼개기」)은 K2·K3·K5·K7 이다. 대중 앱(sudoku.com)은 K1·K2·K3 만 가르친다.
정통 아카데미의 한 단계는 기법 5~7개 · 기법마다 이론 그림 + 연습 2개.

```
추천 (8개, 쉬운 순)   K1 마지막 칸 · K2 조합 하나뿐 · K14 두 칸 산수 · K3 45 한 칸 · K4 꼭 품는 숫자 ·
                      K5 45 여러 칸(90·135) · K6 들어감·나감 차이 · K7 묶음 쪼개기
                      (2차 조사로 K14 를 더함 — 초보에게 쉽고, 모든 곳이 앞에 두는 K2·K3 사이에 자연스럽다)
더 넣는다면           K8 겹침 · K9 킬러 짝 (같은 결론을 K4 + 정통 짝으로도 낸다)
뺄 것                 K12 견주기 · K15~K18(포럼의 고급 — 연습판 하나에 보여 주기 어렵다) ·
                      K13 집 단위 홀짝 · K19 유일해 · K20 Overlap (정의 미확인)
```

정통 아카데미의 한 단계는 기법 5~7개다. 8개면 킬러를 두 탭(「킬러 기초」 K1·K2·K14·K3 / 「킬러 응용」 K4·K5·K6·K7)으로 나누는 것도 방법이다.

## 6. 다음 순서 (정통 아카데미와 같은 길)

1. 강의 목록을 정한다(위 5).
2. **탐지기를 정의에서 짠다** — `scripts/academy/lab/` 옆에 킬러판. 생성 판 수천 개에 돌려 **답을 지운 경우 0** 을 먼저 확인한다(정통 때 3,000판 · 약 2만 건 · 0).
3. **예제는 우리 생성기 판에서** — 그 기법이 꼭 필요한 순간만(더 쉬운 기법으로 같은 결론이 나면 버림).
4. 연습판에 묶음 그리기(`KillerCage` 재사용) · 탭 하나 · 업적 「아카데미 졸업」 은 저절로 킬러까지 셈(Play 게임즈 쪽은 단계형이 아니라 손댈 것 없음).
5. 영어로 쓰고 12개 언어로 — 킬러 용어(묶음·들어감·나감)는 그 나라 스도쿠 자료에서. 일본어는 「ナンプレ」 계열 이름(AGENTS §0).
