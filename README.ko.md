# Sudoku: Classic Puzzle Academy

> 한국어판. 영어판(공개 저장소의 대표 README)은 [`README.md`](README.md). 두 판의 사실이 다르면 코드가 정본이다.

안드로이드 스도쿠 앱 (패키지 `com.powerneja.suidoku`). React 19 + Vite 8 을 Capacitor 8 로 감싼다.
Google Play 출시 중 — 출시 상태는 [`docs/RELEASE_STATE.md`](docs/RELEASE_STATE.md).

> 이 파일은 2026-09-30 에 코드에 맞춰 다시 썼고, 2026-10-16 에 숫자를 다시 맞췄다(킬러·아카데미 40·업적 40). 2026-11-20 에 검사 74단계 · 아카데미 스위치 · 접근성 · 검사에 필요한 저장소 밖 두 가지를 맞췄다. 예전 판은 "기법 27종 · React 18 · Tailwind · Sudoku IQ ·
> 멘사 · 1v1 동일 시드" 를 적고 있었는데 전부 지금 사실이 아니다. 여기 적힌 숫자는 **코드가 정본**이다.

## 무엇이 있나

| | |
|---|---|
| 종류 | 표준 · 킬러(묶음 합 — `src/engine/killer/`). 아래 모드·대전·기록이 두 종류 모두에 있다 |
| 난이도 | 5단계, 해가 하나인 퍼즐만 생성 (`src/engine/SudokuEngine.js` · `killer/killerGenerator.js`) |
| 모드 | 클래식 · 스피드런 · 서바이벌(제한 시간) · 데일리 챌린지 · 고스트/델타(자기 기록과 겨루기) |
| 아카데미 | 「표준 \| 킬러」 스위치 — 표준은 5단계 32기법, 킬러 8기법(모두 40). 기법마다 이론 그림 + 연습 2개 (연습 80개, 전부 자체 생성 퍼즐) |
| 첫 판 | 표준·킬러 첫 판에 그 판 위에서 짧은 따라 하기. 아카데미에서 다시 볼 수 있다 |
| 접근성 | 글자 크기 4단계 · 고대비(설정 → 화면). 화면 읽기가 판의 칸마다 가로줄·세로줄·내용(킬러는 묶음 합)을 읽는다 |
| 대전 | 온라인 1v1 (Firebase Realtime Database, 방마다 비공개 경로) · AI 대전 5단계 |
| 기록 | Logic Score · 플레이 분석 5축 · 업적 40개(Play 게임즈에도) · Play 게임즈 순위표·클라우드 백업 · 1v1 복기 |
| 언어 | 13개 (ko en ja zh-CN zh-TW es-ES de fr pt it ru hi ar, 아랍어는 오른쪽→왼쪽) |
| 광고 | AdMob 배너·전면·보상형, UMP 동의 |

## 명령

```bash
npm run dev          # 개발 서버
npm run build        # 웹 번들 (dist/)
npx cap sync android # 안드로이드 프로젝트에 반영

npm run qa:quick     # 빠른 검사 — 논리·데이터·번역·정적 + 실플레이 하나 (약 2분)
npm run qa           # 전체 검사 74단계 — AAB 전 (약 22분)
node scripts/tests/run_mutation_audit.js   # 검사가 정말 잡는지: 코드를 일부러 부수고 확인 (몇 시간)

node scripts/store/build_release_aab.js    # 릴리스 AAB — 사용자가 지시할 때만
```

`.env` 가 있어야 1v1·광고가 실제로 동작한다 (`.env.example` 참고). 서명 키는 `android/keystore.properties`
(git 제외).

`npm run qa:quick` · `npm run qa` 는 저장소 밖 두 가지가 있어야 끝까지 돈다 — 공통 번역 검사 엔진
`../../app_common/l10n_engine`(0-3 이 있는지 보고, 1 · 2-6 · 2-16 이 쓴다)과 Firebase 키가 든 `.env`(0-5 · 3-0b).
없으면 처음 몇 단계에서 멈춘다. 저장소만 받은 상태로도 `npm run lint` · `npm run build` · 단위 검사 하나씩
(예: `node scripts/tests/unit/test_battle_killer.js`)은 돈다(2026-11-20, 깨끗한 복제본에서 확인).

## 문서 — 어디에 무엇이

| 파일 | 내용 |
|---|---|
| [`AGENTS.md`](AGENTS.md) | 이 앱의 작업 규칙 (공통 규칙 `../../app_common/AGENTS.md` 를 상속). AI 도 사람도 여기서 시작 |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | 할 일 — 단일 원본 |
| [`docs/RELEASE_STATE.md`](docs/RELEASE_STATE.md) | 출시·콘솔 상태 |
| [`docs/SudokuDiary.md`](docs/SudokuDiary.md) | 변경마다 무엇을·왜·무엇을 버렸나·어떻게 확인했나 |
| [`docs/TECHNICAL_SPECIFICATION.md`](docs/TECHNICAL_SPECIFICATION.md) | 엔진·모드·점수 산식 — 1.3.2(2026-09-30) 기준. 킬러와 그 뒤 기능은 아직 없다 |
| [`SudokuAITalk.md`](SudokuAITalk.md) | 다른 AI(ChatGPT·Gemini)의 검수 결과와 반영 기록 |
| [`docs/privacy.html`](docs/privacy.html) | 개인정보처리방침 (k2bact.github.io 에 게시) |
| `docs/archive/`, `scripts/archive/` | 끝난 문서·일회용 스크립트. **읽기용이지 실행용이 아니다** |

## 폴더

```
src/             앱 (React 컴포넌트·훅·엔진·광고·1v1 전송·다국어)
android/         Capacitor 안드로이드 프로젝트
scripts/tests/   QA 게이트와 변이 정의 (run_all_qa.js 가 순서를 정한다)
scripts/scan/    정적 스캔 (호출되지 않는 코드·번역 키·연결)
scripts/store/   스토어 스크린샷 촬영·피처 그래픽·Play 게임즈 업적 가져오기 파일·AAB 빌드·Firebase 규칙 출력
scripts/academy/ 아카데미 연습판을 고르고 문구를 만드는 도구 (킬러: killer/write_killer.mjs → src/data/academy/practice/killerPractice.js)
store_assets/    언어별 스토어 문구·그림
firebase.rules.json   Realtime Database 규칙 (콘솔 게시본의 원본)
```
