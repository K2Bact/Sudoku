# 🧩 Sudoku (스도쿠 마스터) - Next-Gen Logic Puzzle App

> **27종 정석 아카데미 · 실시간 1v1 배틀 & AI 봇 · 5대 두뇌 인지 능력 리포트 · 30종 글로벌 업적**

---

## 📱 프로젝트 소개 (Overview)

**Sudoku**는 입문자부터 프로 마스터까지 누구나 즐길 수 있는 정통 프리미엄 클래식 스도쿠 게임입니다.
React 18과 Tailwind CSS 기반의 세련된 3D 세라믹 뉴모피즘 UI와 Web Audio 사운드 엔진, 그리고 Capacitor를 통한 100% 네이티브 모바일 앱 경험을 제공합니다.

---

## 🌟 핵심 기능 (Key Features)

1. **🧩 5단계 정통 클래식 모드**: Very Easy부터 Expert(Mensa)까지 100% 백트래킹 유일해 검증 퍼즐
2. **🎓 27종 스도쿠 정석 아카데미**: 초급(Full House)부터 상급(Jellyfish, AIC, Sue de Coq)까지 인터랙티브 다이어그램 코칭
3. **⚔️ 1v1 실시간 배틀 & 5단계 AI 봇**: 동일 시드 보드로 겨루는 공정한 스피드 대전
4. **🧠 두뇌 인지 능력치 & Sudoku IQ**: 처리속도, 논리추론, 정확도, 지구력, 집중력 5대 지표 및 상위 백분위 리포트
5. **📅 365일 데일리 챌린지**: 매일 새로운 일일 미션 및 출석 스탬프, 월간 마스터 골드 트로피
6. **🏆 30종 풍부한 업적**: 스피드런, 콤보, 무결점 클리어, 멘사 IQ 달성 등 인게임 축하 토스트 팝업

---

## 🛠️ 개발 & 빌드 가이드 (Development & Build)

### 1. 개발 서버 실행
```powershell
npm.cmd run dev
```

### 2. 프로덕션 웹 번들 빌드 & Capacitor 동기화
```powershell
npm.cmd run build
npx.cmd cap sync android
```

### 3. 구글 플레이 배포용 릴리즈 AAB 빌드
```powershell
# JDK 21 환경에서 AAB 빌드 실행
node scratch/build_aab.js
```
* **결과물**: `Sudoku-release.aab` (구글 플레이 콘솔 업로드용)

---

## 📂 프로젝트 디렉토리 구조

```
Sudoku/
 ├── android/              # Capacitor 안드로이드 네이티브 프로젝트 (Gradle, Keystore)
 ├── docs/                 # BACKLOG.md(할 일 단일 원본), 기술 명세, 개인정보처리방침
 ├── public/               # 웹 파비콘, PWA 매니페스트, 앱 아이콘
 ├── scripts/              # E2E 테스트 및 자동화 스크립트
 ├── src/                  # 107개 모듈형 React 컴포넌트, 훅, 로직 (엄격 300줄 제한 준수)
 └── store_assets/         # 구글 플레이 스토어 등록 에셋 (ko-KR, en-US, common)
```

---

## 📚 마스터 플레이북 참조 (Knowledge Base)

개발 회고, 트러블슈팅 오답노트, AI 협업 방법론 및 차기 프로젝트 스타터 블루프린트는 상위 디렉토리의 **`PROJECT_MASTER_PLAYBOOK`** 문서를 참조하세요.
* `../PROJECT_MASTER_PLAYBOOK/01_PROJECT_LIFECYCLE_AND_ARCHITECTURE.md`
* `../PROJECT_MASTER_PLAYBOOK/02_MISTAKES_AND_TROUBLESHOOTING_POSTMORTEM.md`
* `../PROJECT_MASTER_PLAYBOOK/03_AI_SOLO_DEVELOPER_METHODOLOGY.md`
* `../PROJECT_MASTER_PLAYBOOK/04_NEXT_PUZZLE_GAME_STARTER_BLUEPRINT.md`
* `../PROJECT_MASTER_PLAYBOOK/05_GOOGLE_PLAY_STORE_POLICY_AND_COMPLIANCE_GUIDE.md`
