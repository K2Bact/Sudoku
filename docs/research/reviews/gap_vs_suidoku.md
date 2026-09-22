# 경쟁 스도쿠 앱 리뷰 요구사항 ↔ Suidoku 비교 분석 (Gap Analysis)

- 작성 일자: 2026-09-19
- 비교 기준: `docs/research/reviews/requests.md` (상위 10개 앱 2,722건 리뷰 기반 핵심 요구사항 10종)
- 표기 원칙: `우리 앱: 있음 / 없음 / 부분` 및 실제 코드 파일 경로 근거 명시

---

## 항목별 비교 결과

- [광고] 플레이 흐름을 끊는 전면 광고 및 과도한 광고 노출 불만 — 우리 앱: 없음 — 근거: `src/services/adsService.js#L34-L50` (게임 진행 도중 전면 광고 노출 일체 차단, 퍼즐 승리 시에만 최소 1시간 간격 쿨다운 적용, 신규 플레이어 최초 설치 후 48시간 전면 광고 완전 유예)
- [화면·글자] 글자/숫자 크기가 너무 작거나 다크 모드 및 색상 대비가 낮아 눈이 피로함 — 우리 앱: 있음 — 근거: `src/hooks/useThemeManager.js#L7-L31`, `src/utils/textZoom.js#L14-L25`, `src/hooks/useBoardFit.js` (다크 테마 기본 적용 및 4종 테마 지원, 시스템 글자 확대 시 보드 칸 넘침 방지 줌 보정 및 동적 보드 핏 계산 구현)
- [조작감] 숫자 먼저 선택 vs 칸 먼저 선택 방식의 유연성 부족 및 터치 오인식/실수 카운트 강제 — 우리 앱: 있음 — 근거: `src/hooks/useKeypadActions.js#L40-L60`, `src/utils/storage.js#L60`, `src/utils/recordEligibility.js` (칸 먼저 입력 및 빠른 입력 모드(숫자 고정 먼저 입력) 동시 지원, 설정에서 3회 실수 제한 ON/OFF 토글 지원)
- [난이도] 난이도 구분이 불분명하거나(전문가/마스터 난이도가 너무 쉬움 또는 터무니없는 추측 필요) — 우리 앱: 부분 — 근거: `src/engine/SudokuEngine.js#L132-L138` (단서 수 50/42/34/28/24개 기반 5단계 난이도 및 유일해 보장 생성기는 구현되어 있으나, 순수 논리 기법 난이도 검증(SE Rating 등) 기반이 아닌 단서 수 기준 난이도 배정임)
- [버그] 게임 프리징, 앱 강제 종료, 과도한 배터리 소모 및 기기 발열 문제 — 우리 앱: 없음 — 근거: `scripts/tests/run_mutation_audit.js`, `package.json` (무거운 엔진 없는 초경량 React/Capacitor 아키텍처 및 로컬 연산 기반으로 배터리/발열 최소화, 33개 변형 감사 명세 및 게이트 검증 체계 운영)
- [결제] 광고 제거 구매 후에도 광고가 계속 나오거나 구독 유도에 대한 불만 — 우리 앱: 없음 — 근거: `src/billing/index.js`, `src/billing/playBillingProvider.js`, `src/services/adsService.js#L22` (구독 모델이 전혀 없으며, 영구 광고 제거 단일 일회성 인앱 결제 상품만 제공 및 구매 복원 인터페이스 구현)
- [힌트] 단순 숫자 정답만 알려주고 왜 그 숫자가 들어가는지 논리적 설명을 제공하지 않는 힌트 불만 — 우리 앱: 부분 — 근거: `src/engine/SudokuEngine.js#L186-L224`, `src/components/screens/AcademyScreen.jsx` (인게임 힌트는 정답 숫자를 직접 채워주는 방식이나, 별도의 '아카데미' 화면에서 32개 스도쿠 기법별 이론 설명과 64개 실전 연습 단계 제공)
- [메모] 메모(연필 마크) 자동 삭제 오류 또는 수동 메모 토글 조작의 불편함 — 우리 앱: 있음 — 근거: `src/engine/SudokuEngine.js#L258-L272`, `src/hooks/useGameInput.js#L213-L214`, `src/utils/storage.js#L58` (행·열·3x3 박스 내 확정 숫자 입력 시 연관 메모 자동 삭제 알고리즘 구현 및 설정에서 자동 삭제 ON/OFF 토글 지원)
- [오프라인] 오프라인 비행기 탑승 모드에서 플레이 불가 또는 광고 캐싱 문제 — 우리 앱: 없음 — 근거: `src/engine/SudokuEngine.js#L141-L183`, `src/utils/storage.js` (완전 오프라인 독립 구동 지원 — 브라우저/웹뷰 로컬 퍼즐 생성 및 localStorage 로컬 저장 기반)
- [저장·기기 이동] 기기 변경 시 게임 진행 기록/통계 손실 및 클라우드 동기화 미지원 — 우리 앱: 있음 — 근거: `src/services/cloudSyncService.js`, `src/services/progressMerge.js` (Play 게임즈 스냅샷 기반 클라우드 세이브 및 다중 기기 충돌 방지를 위한 통계/업적/월렛 양방향 병합 로직 구현 완료)
