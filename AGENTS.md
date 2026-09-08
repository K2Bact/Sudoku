# 🚨 SUIDOKU PROJECT CRITICAL IMMUTABLE RULES & QA PROTOCOL

> This document defines mandatory, non-negotiable project rules for all AI models working on the Suidoku codebase.

---

## 🚫 1. [CRITICAL] NO UNPROMPTED AAB / APK BUILDS
* **NEVER run `bundleRelease`, `assembleRelease`, or any Android AAB/APK binary build commands unless the user EXPLICITLY commands you to build (e.g. "AAB 빌드해", "릴리즈 파일 만들어").**
* For testing, inspecting, checking, fixing, or adding translations, **STOP after running tests/validation (`npm run qa`). DO NOT build binary packages on your own.**

---

## 📏 2. [CRITICAL] ONE FILE, ONE SET OF RESPONSIBILITIES

**The rule is about separating responsibilities. The line budget only tells you when to look.**

| Scope | Warn | Fail |
|---|---|---|
| Logic (`*.js`, `*.jsx`) | 200 code lines | 280 code lines |
| Styles (`*.css`) | — | 320 code lines |

* **Comments and blank lines are NOT counted.** Explain as much as the code needs; the
  budget is for logic only.
* **Never shorten a comment to get under the limit.** That is not a fix — it makes the
  code less clear while leaving the real problem in place. This actually happened on
  2026-09-02: `battleService.js` hit 302 lines and a comment was compressed back to 299,
  while the file went on doing matchmaking, progress, rematch and AI battles all at once.
  When it crossed the line again it was split into `aiBattleSession.js`, and *that* was
  the fix.
* **When a file is flagged, ask what it does — not how long it is.** The gate prints the
  file's top-level units so you can see the seams. If you cannot name each unit's single
  job in one phrase, that is where to split.
* `src/i18n/` and `src/data/` are **excluded**: flat translation and puzzle tables have no
  responsibilities to separate.
* Enforced by QA gate `0-1` (`scripts/tests/unit/test_file_responsibility.js`). The warning
  tier is a standing backlog, not noise — files on it should shrink over time, not grow.

---

## 🌐 3. [CRITICAL] MULTILINGUAL (I18N) & UI INTEGRITY PROTOCOL

> **Corrected 2026-09-08.** This section said "ALL 5 languages" and listed six
> language buttons. The app ships **13 locales** and has for some time. A rule
> that names a stale number teaches the next reader the wrong shape of the
> problem — and this one would have had them register a string in five files
> and call it done.

1. **Zero Hardcoded User-Facing Text**:
   * NEVER write raw Korean/English strings directly in JSX or code templates (e.g. `${name} 님이...` is FORBIDDEN).
   * All user-facing strings MUST use `t('section.key')` and be registered across **all 13 locales**:
     `ar de en es-ES fr hi it ja ko pt ru zh-CN zh-TW`
   * Gate `1` (key completeness) fails the build if any locale is missing a key, so a
     partial addition cannot ship — but it also means **adding one string is a 13-file change.**
2. **Language Button Endonym Rule**:
   * Language selector buttons MUST ONLY display native endonyms without redundant parentheses.
   * The list lives in `src/i18n/dictionaries.js` (`nativeName`) — **14 entries: 13 locales
     plus System Default.** Do not hardcode a second copy of this list anywhere; a duplicate
     list is how the button set and the locale set drift apart.
   * NO `(Korean)`, `(English)`, `(자동)`, `(Auto)`, `(韓文)` parentheses allowed.
3. **Grid Balance**:
   * The selector grid must not leave an orphan slot. With 14 entries this is a 2-column
     layout; if the locale count changes, check the layout rather than assuming.
4. **Dynamic Interpolation**:
   * Dynamic variables MUST use `{variable}` syntax in dictionaries and be passed via `t('key', { variable: value })`.
5. **Never delete a key to silence a gate.** Orphan keys (translated but uncalled) are
   inventory, not defects — `scripts/scan/run_scan.js` grades them `NOTE`. 74 were removed
   deliberately in `643189d` along with a check that fails the build when new ones appear.

---

## 🎮 4. [CRITICAL] CORE GAMEPLAY RUNTIME SCENARIO INTEGRITY
1. **Revival Life Recovery (부활)**:
   * When a player revives via rewarded ad after 3 mistakes, `mistakes` MUST be set to `2` (`setMistakes(2)`) in ALL game modes so the header displays `실수 2/3`.
2. **1v1 Battle Result**:
   * Victory / Defeat subtitles, mistake disqualification reasons, and heart states (`💀 실격`) must be 100% localized with dynamic opponent names.
3. **Calendar Headers**:
   * Weekdays must use localized day labels (`일~토`, `S~S`, `日~土`, `D~S`).

---

## 🧪 5. [CRITICAL] AUTOMATED QA GATES (`npm run qa`)

Before declaring ANY work complete, you MUST run:

```bash
npm run qa
```

> **Corrected 2026-09-08.** This section used to list five scripts and describe a
> "5-language audit (415 keys)". Both numbers were stale and the list was a subset.
> **Do not copy a step count from this file into a report — count it from the run.**
> A figure that gets carried forward without being measured is how "39 steps" ended
> up in the diary for several rounds when the real number was 34.

**34 steps across three tiers** (measured 2026-09-08 — verify, do not quote):

```
0-1 … 0-6    파일 책임 분리 · oxlint · ESM 확장자 · 커밋된 비밀 · Firebase 설정 · 스캔
2-1 … 2-15   스도쿠 엔진 · PRNG · 지갑 · 아카데미 · AI 격리 · 리더보드 · 전송 계약
             1v1 매칭 · 광고 정직성 · 네이티브 대화상자 · 기기 하네스 · 결제 정직성
             개인정보 주장 일치 · 번역 키 도달성
3-0 … 3-10   번들 빌드 · 하드코딩 문구 · 매니페스트 · 모달 · 대비 · 홈 레이아웃
             뒤로가기 · 13개 언어 오버플로우 · 실플레이 E2E · 광고 배치 E2E · 1v1 E2E
```

**게이트가 통과한다고 게이트가 일하는 것은 아니다.** 변형 감사
(`scripts/tests/run_mutation_audit.js`)가 각 게이트가 지킨다고 주장하는 것을 실제로
부수고 그 게이트가 **그 이유로** 실패하는지 확인한다. 현재 64개 변형 전부 잡힘.
게이트를 고치거나 추가했으면 변형도 같이 추가할 것.
