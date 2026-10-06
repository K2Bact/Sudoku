# Sudoku: Logic Puzzle Academy

안드로이드 스도쿠 앱 (패키지 `com.powerneja.suidoku`). React 19 + Vite 8 을 Capacitor 8 로 감싼다.
Google Play 출시 중 — 출시 상태는 [`docs/RELEASE_STATE.md`](docs/RELEASE_STATE.md).

> 이 파일은 2026-09-30 에 코드에 맞춰 다시 썼다. 예전 판은 "기법 27종 · React 18 · Tailwind · Sudoku IQ ·
> 멘사 · 1v1 동일 시드" 를 적고 있었는데 전부 지금 사실이 아니다. 여기 적힌 숫자는 **코드가 정본**이다.

## 무엇이 있나

| | |
|---|---|
| 난이도 | 5단계 (단서 수 기준, 해가 하나인 퍼즐만 생성 — `src/engine/SudokuEngine.js`) |
| 모드 | 클래식 · 스피드런 · 서바이벌(제한 시간) · 데일리 챌린지 |
| 아카데미 | 5단계 32기법, 기법마다 이론 그림 + 연습 2개 (연습 64개, 전부 자체 생성 퍼즐) |
| 대전 | 온라인 1v1 (Firebase Realtime Database, 방마다 비공개 경로) · AI 대전 5단계 |
| 기록 | Logic Score · 플레이 분석 5축 · 업적 30개 · Play 게임즈 순위표·클라우드 백업 |
| 언어 | 13개 (ko en ja zh-CN zh-TW es-ES de fr pt it ru hi ar, 아랍어는 오른쪽→왼쪽) |
| 광고 | AdMob 배너·전면·보상형, UMP 동의 |

## 명령

```bash
npm run dev          # 개발 서버
npm run build        # 웹 번들 (dist/)
npx cap sync android # 안드로이드 프로젝트에 반영

npm run qa:quick     # 빠른 검사 — 논리·데이터·번역·정적 + 실플레이 하나 (약 1~2분)
npm run qa           # 전체 검사 — AAB 전 (약 10분)
node scripts/tests/run_mutation_audit.js   # 검사가 정말 잡는지: 코드를 일부러 부수고 확인 (몇 시간)

node scripts/store/build_release_aab.js    # 릴리스 AAB — 사용자가 지시할 때만
```

`.env` 가 있어야 1v1·광고가 실제로 동작한다 (`.env.example` 참고). 서명 키는 `android/keystore.properties`
(git 제외).

## 문서 — 어디에 무엇이

| 파일 | 내용 |
|---|---|
| [`AGENTS.md`](AGENTS.md) | 이 앱의 작업 규칙 (공통 규칙 `../../app_common/AGENTS.md` 를 상속). AI 도 사람도 여기서 시작 |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | 할 일 — 단일 원본 |
| [`docs/RELEASE_STATE.md`](docs/RELEASE_STATE.md) | 출시·콘솔 상태 |
| [`docs/SudokuDiary.md`](docs/SudokuDiary.md) | 변경마다 무엇을·왜·무엇을 버렸나·어떻게 확인했나 |
| [`docs/TECHNICAL_SPECIFICATION.md`](docs/TECHNICAL_SPECIFICATION.md) | 엔진·모드·점수 산식 (코드와 대조한 판) |
| [`SudokuAITalk.md`](SudokuAITalk.md) | 다른 AI(ChatGPT·Gemini)의 검수 결과와 반영 기록 |
| [`docs/privacy.html`](docs/privacy.html) | 개인정보처리방침 (k2bact.github.io 에 게시) |
| `docs/archive/`, `scripts/archive/` | 끝난 문서·일회용 스크립트. **읽기용이지 실행용이 아니다** |

## 폴더

```
src/             앱 (React 컴포넌트·훅·엔진·광고·1v1 전송·다국어)
android/         Capacitor 안드로이드 프로젝트
scripts/tests/   QA 게이트와 변이 정의 (run_all_qa.js 가 순서를 정한다)
scripts/scan/    정적 스캔 (호출되지 않는 코드·번역 키·연결)
scripts/store/   스토어 스크린샷 촬영·피처 그래픽·AAB 빌드·Firebase 규칙 출력
store_assets/    언어별 스토어 문구·그림
firebase.rules.json   Realtime Database 규칙 (콘솔 게시본의 원본)
```
